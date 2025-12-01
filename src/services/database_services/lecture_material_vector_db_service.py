import logging
from psycopg2 import sql
from src.utils.embedder_factory import get_embedder_for_model
from .base_vector_db_service import BaseVectorDBService
from src.services.database_services.evaluation_model_db import EvaluationModelService

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def chunk_text(text: str, max_len: int = 1500):
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


class LectureMaterialVectorDBService(BaseVectorDBService):

    def __init__(self, model_id: str):
        self.model_id = model_id

        # Load model config
        model_service = EvaluationModelService()
        model_config = model_service.get_model_config(model_id)

        if not model_config:
            raise ValueError(f"Invalid model_id: {model_id}. Cannot load model config.")

        embedding_model = model_config["embedding_model"]
        logger.info(f"📌 embedding_model={embedding_model}")

        # Instantiate embedder
        embedder = get_embedder_for_model(model_id=model_id)
        self.embedder = embedder

        super().__init__(embedder)

        # Table name based on embedding model
        safe_model_suffix = (
            embedding_model.lower()
            .replace("-", "_")
            .replace(".", "_")
            .replace(" ", "_")
        )

        self.table_name = f"lecture_material_embedding_{safe_model_suffix}"
        self.ensure_table_exists()

    # ------------------------------------------------------------
    def ensure_table_exists(self):
        table_identifier = sql.Identifier(self.table_name)
        dim = sql.SQL(str(self.embedder.get_embedding_dimension()))

        create_table_query = sql.SQL("""
            CREATE EXTENSION IF NOT EXISTS vector;
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS {table_name} (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                lecture_material_id TEXT NOT NULL,
                chunk_index INT NOT NULL,
                content TEXT,
                embedding VECTOR({dim}),
                model_id TEXT NOT NULL,
                created_on TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (lecture_material_id, chunk_index)
            );
        """).format(table_name=table_identifier, dim=dim)

        self.cursor.execute(create_table_query)
        self.conn.commit()
        logger.info(f"✅ Ensured table exists: {self.table_name}")

    # ------------------------------------------------------------
    def already_exists(self, lecture_material_id: str) -> bool:
        query = sql.SQL("""
            SELECT 1
            FROM {table_name}
            WHERE lecture_material_id = %s
            LIMIT 1;
        """).format(table_name=sql.Identifier(self.table_name))

        self.cursor.execute(query, (lecture_material_id,))
        return self.cursor.fetchone() is not None

    # ------------------------------------------------------------
    def insert_single_chunk(self, lecture_material_id, chunk_index, content, embedding):
        insert_query = sql.SQL("""
            INSERT INTO {table_name}
                (lecture_material_id, chunk_index, content, embedding, model_id)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
        """).format(table_name=sql.Identifier(self.table_name))

        self.cursor.execute(insert_query, (
            lecture_material_id,
            chunk_index,
            content,
            embedding,
            self.model_id,
        ))

    # ------------------------------------------------------------
    def save_lecture_material(self, lecture_material_id, full_content: str):
        logger.info(f"📘 Chunking lecture material: {lecture_material_id}")

        chunks = chunk_text(full_content)
        logger.info(f"👉 Total chunks: {len(chunks)}")

        embeddings = self.embedder.embed(chunks)

        for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
            self.insert_single_chunk(
                lecture_material_id,
                i,
                chunk,
                emb,
            )

        self.commit()
        logger.info(f"✅ Stored {len(chunks)} chunks for {lecture_material_id}")

    # ------------------------------------------------------------
    def get_similar_chunks(self, question_text: str, top_k: int = 5):
        try:
            query_embedding = self.embedder.embed([question_text])[0]

            query = sql.SQL("""
                SELECT 
                    content,
                    1 - (embedding <=> %s::vector) AS similarity,
                    model_id
                FROM {table_name}
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """).format(table_name=sql.Identifier(self.table_name))

            self.cursor.execute(query, (query_embedding, query_embedding, top_k))
            rows = self.cursor.fetchall()

            return [
                {
                    "content": row[0],
                    "similarity": float(row[1]),
                    "model_id": row[2],
                }
                for row in rows
            ]

        except Exception as e:
            logger.error(f"❌ Error during similarity search: {e}", exc_info=True)
            return []


    def get_similar_chunks_by_embedding(self, query_embedding, lecture_material_ids, top_k: int = 5):
        """
        Retrieve similar lecture material chunks filtered by a list of lecture_material_ids.
        """
        try:
            if not lecture_material_ids:
                logger.warning("⚠️ lecture_material_ids list is empty. Returning no results.")
                return []

            # Build dynamic IN clause placeholders
            id_placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in lecture_material_ids)

            query = sql.SQL("""
                SELECT 
                    id,
                    lecture_material_id,
                    chunk_index,
                    content,
                    1 - (embedding <=> %s::vector) AS similarity,
                    model_id
                FROM {table_name}
                WHERE lecture_material_id IN ({ids})
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """).format(
                table_name=sql.Identifier(self.table_name),
                ids=id_placeholders
            )

            params = [query_embedding] + lecture_material_ids + [query_embedding, top_k]

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            chunks = [
                {
                    "id": str(row[0]),
                    "lecture_material_id": row[1],
                    "chunk_index": row[2],
                    "content": row[3],
                    "similarity": float(row[4]),
                    "model_id": row[5],
                }
                for row in rows
            ]

            return sorted(
                chunks,
                key=lambda x: (-x["similarity"], x["lecture_material_id"], x["chunk_index"])
            )

        except Exception as e:
            logger.error(f"❌ Error in get_similar_chunks_by_embedding: {e}", exc_info=True)
            return []
