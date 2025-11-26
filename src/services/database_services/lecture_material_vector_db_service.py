import os
import json
import logging
from psycopg2 import sql
from .base_vector_db_service import BaseVectorDBService
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# --------------------------------------------------------
# Helper: Select Embedder
# --------------------------------------------------------
def get_embedder(embedder_name: str):
    if embedder_name.lower() == "openai":
        return OpenAIEmbedder()
    elif embedder_name.lower() == "gemini":
        return GeminiEmbedder()
    else:
        raise ValueError(f"Unsupported embedder: {embedder_name}")


# --------------------------------------------------------
# Helper: Chunk text safely
# --------------------------------------------------------
def chunk_text(text: str, max_len: int = 1500):
    """Chunk long text into smaller parts for embedding."""
    chunks = []
    words = text.split()

    current = []
    current_len = 0

    for word in words:
        if current_len + len(word) + 1 > max_len:
            chunks.append(" ".join(current))
            current = []
            current_len = 0
        current.append(word)
        current_len += len(word) + 1

    if current:
        chunks.append(" ".join(current))

    return chunks


# ========================================================
#   VECTOR DB SERVICE
# ========================================================
class LectureMaterialVectorDBService(BaseVectorDBService):
    """
    Database service for saving and retrieving lecture material embeddings.
    """

    def __init__(self, model_name: str):
        embedder = get_embedder(model_name)
        super().__init__(embedder)

        self.model_name = model_name.lower()
        self.suffix = self.model_name
        self.table_name = f"lecture_material_embeddings_{self.suffix}"
        self.ensure_table_exists()

    # --------------------------------------------------------
    # Table creation
    # --------------------------------------------------------
    def ensure_table_exists(self):
        table_identifier = sql.Identifier(self.table_name)
        vector_dim = sql.SQL(str(self.embedder.get_embedding_dimension()))

        create_table_query = sql.SQL("""
            CREATE EXTENSION IF NOT EXISTS vector;
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS {table_name} (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                lecturer_id TEXT NOT NULL,
                module_id TEXT NOT NULL,
                lecture_material_id TEXT NOT NULL,
                chunk_index INT NOT NULL,
                file_path TEXT NOT NULL,
                content TEXT,
                embedding VECTOR({dim}),
                model_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (lecturer_id, module_id, lecture_material_id, chunk_index)
            );
        """).format(table_name=table_identifier, dim=vector_dim)

        self.cursor.execute(create_table_query)
        self.conn.commit()
        logger.info(f"✅ Ensured table exists: {self.table_name}")

    # --------------------------------------------------------
    # Exists check (per chunked document)
    # --------------------------------------------------------
    def already_exists(self, lecturer_id: str, module_id: str, lecture_material_id: str) -> bool:
        check_query = sql.SQL("""
            SELECT 1 FROM {table_name}
            WHERE lecturer_id = %s
              AND module_id = %s
              AND lecture_material_id = %s
            LIMIT 1;
        """).format(table_name=sql.Identifier(self.table_name))

        self.cursor.execute(check_query, (lecturer_id, module_id, lecture_material_id))
        return self.cursor.fetchone() is not None

    # --------------------------------------------------------
    # Insert operations
    # --------------------------------------------------------
    def insert_single_chunk(self, lecturer_id, module_id, lecture_material_id,
                            chunk_index, file_path, content, embedding):

        insert_query = sql.SQL("""
            INSERT INTO {table_name}
                (lecturer_id, module_id, lecture_material_id, chunk_index,
                 file_path, content, embedding, model_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
        """).format(table_name=sql.Identifier(self.table_name))

        self.cursor.execute(insert_query, (
            lecturer_id, module_id, lecture_material_id, chunk_index,
            file_path, content, embedding, self.model_name
        ))

    # --------------------------------------------------------
    # Save full lecture material
    # --------------------------------------------------------
    def save_lecture_material(self, lecturer_id, module_id, lecture_material_id,
                              file_path, full_content: str):

        logger.info(f"📘 Chunking lecture material: {lecture_material_id}")

        chunks = chunk_text(full_content, max_len=1500)
        logger.info(f"👉 Total chunks: {len(chunks)}")

        embeddings = self.embedder.embed(chunks)

        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            self.insert_single_chunk(
                lecturer_id,
                module_id,
                lecture_material_id,
                i,
                file_path,
                chunk,
                emb
            )

        self.commit()
        logger.info(f"✅ Stored {len(chunks)} chunks for {lecture_material_id}")

    # --------------------------------------------------------
    # Retrieve similar chunks (text query)
    # --------------------------------------------------------
    def get_similar_chunks(self, question_text: str,
                           lecturer_id: str = None,
                           module_id: str = None,
                           top_k: int = 5):

        try:
            query_embedding = self.embedder.embed([question_text])[0]

            filters = []
            params = [query_embedding]

            if lecturer_id:
                filters.append("lecturer_id = %s")
                params.append(lecturer_id)

            if module_id:
                filters.append("module_id = %s")
                params.append(module_id)

            where_clause = " AND ".join(filters) if filters else "TRUE"

            params.append(query_embedding)
            params.append(top_k)

            query = sql.SQL("""
                SELECT 
                    lecture_material_id,
                    file_path,
                    content,
                    1 - (embedding <=> %s::vector) AS similarity,
                    model_name
                FROM {table_name}
                WHERE """ + where_clause + """
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """).format(table_name=sql.Identifier(self.table_name))

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            return [
                {
                    "lecture_material_id": row[0],
                    "file_path": row[1],
                    "content": row[2],
                    "similarity": float(row[3]),
                    "model_name": row[4],
                }
                for row in rows
            ]

        except Exception as e:
            logger.error(f"❌ Error during similarity search: {e}", exc_info=True)
            return []

    # --------------------------------------------------------
    # Retrieve similar chunks using an embedding (DETERMINISTIC)
    # --------------------------------------------------------
    def get_similar_chunks_by_embedding(self, query_embedding,
                                        lecturer_id: str = None,
                                        module_id: str = None,
                                        top_k: int = 5):
        """
        Retrieve top-K most similar lecture material chunks
        using a given embedding vector.
        Returns deterministic sorted results including chunk ID + chunk index.
        """

        try:
            filters = []
            params = [query_embedding]

            if lecturer_id:
                filters.append("lecturer_id = %s")
                params.append(lecturer_id)

            if module_id:
                filters.append("module_id = %s")
                params.append(module_id)

            where_clause = " AND ".join(filters) if filters else "TRUE"

            params.append(query_embedding)
            params.append(top_k)

            query = sql.SQL("""
                SELECT 
                    id,
                    lecture_material_id,
                    chunk_index,
                    file_path,
                    content,
                    1 - (embedding <=> %s::vector) AS similarity,
                    model_name
                FROM {table_name}
                WHERE """ + where_clause + """
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """).format(table_name=sql.Identifier(self.table_name))

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            chunks = [
                {
                    "id": str(row[0]),
                    "lecture_material_id": row[1],
                    "chunk_index": row[2],
                    "file_path": row[3],
                    "content": row[4],
                    "similarity": float(row[5]),
                    "model_name": row[6],
                }
                for row in rows
            ]

            chunks = sorted(
                chunks,
                key=lambda x: (
                    -x["similarity"],
                    x["lecture_material_id"],
                    x["chunk_index"],
                    x["id"]
                )
            )

            return chunks

        except Exception as e:
            logger.error(f"❌ Error during similarity search: {e}", exc_info=True)
            return []
