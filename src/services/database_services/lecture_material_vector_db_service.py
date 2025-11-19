import os
import json
import logging
from psycopg2 import sql
from .base_vector_db_service import BaseVectorDBService
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ----------------------------------------------------------------------
# Embedder Factory
# ----------------------------------------------------------------------
def get_embedder(embedder_name: str):
    """Factory to return the correct embedder."""
    if embedder_name.lower() == "openai":
        return OpenAIEmbedder()
    elif embedder_name.lower() == "gemini":
        return GeminiEmbedder()
    else:
        raise ValueError(f"Unsupported embedder: {embedder_name}")


# ----------------------------------------------------------------------
# Lecture Material Vector DB
# ----------------------------------------------------------------------
class LectureMaterialDBService(BaseVectorDBService):

    def __init__(self, model_name: str):
        embedder = get_embedder(model_name)
        super().__init__(embedder)

        self.model_name = model_name.lower()
        self.suffix = self.model_name
        self.table_name = f"lecture_material_embeddings_{self.suffix}"
        self.ensure_table_exists()

    # ----------------------------------------------------------------------
    # Create Table (NO UNIQUE CONSTRAINT)
    # ----------------------------------------------------------------------
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
                file_path TEXT NOT NULL,
                content TEXT,
                embedding VECTOR({dim}),
                model_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                -- ❌ REMOVED UNIQUE(lecturer_id, module_id, lecture_material_id)
            );
        """).format(
            table_name=table_identifier,
            dim=vector_dim
        )

        self.cursor.execute(create_table_query)
        self.conn.commit()
        logger.info(f"✅ Ensured table exists: {self.table_name}")

    # ----------------------------------------------------------------------
    # Insert a single chunk (NO duplicate checking)
    # ----------------------------------------------------------------------
    def insert_embedding(self, lecturer_id, module_id, lecture_material_id, file_path, content, embedding, model_name):
        insert_query = sql.SQL("""
            INSERT INTO {table_name} 
            (lecturer_id, module_id, lecture_material_id, file_path, content, embedding, model_name)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """).format(table_name=sql.Identifier(self.table_name))

        self.cursor.execute(
            insert_query,
            (lecturer_id, module_id, lecture_material_id, file_path, content, embedding, model_name)
        )

    # ----------------------------------------------------------------------
    # Insert multiple chunks
    # ----------------------------------------------------------------------
    def bulk_insert_embeddings(self, lecturer_id, module_id, file_path, lecture_material_id, contents, embeddings):
        if len(contents) != len(embeddings):
            raise ValueError("Contents and embeddings length mismatch.")

        model_name = self.embedder.get_model_name()

        for content, emb in zip(contents, embeddings):
            self.insert_embedding(
                lecturer_id,
                module_id,
                lecture_material_id,
                file_path,
                content,
                emb,
                model_name
            )

        self.commit()
        logger.info(f"✅ Inserted {len(contents)} chunks for lecture material '{lecture_material_id}'")

    # ----------------------------------------------------------------------
    # Retrieval: Similar chunks
    # ----------------------------------------------------------------------
    def get_similar_chunks(self, question_text: str, lecturer_id: str = None, module_id: str = None, top_k: int = 5):
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

            query = sql.SQL(f"""
                SELECT lecture_material_id, file_path, content,
                       1 - (embedding <=> %s::vector) AS similarity,
                       model_name
                FROM {self.table_name}
                WHERE {where_clause}
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """)

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            if not rows:
                return []

            return [
                {
                    "lecture_material_id": r[0],
                    "file_path": r[1],
                    "content": r[2],
                    "similarity": float(r[3]),
                    "model_name": r[4],
                }
                for r in rows
            ]

        except Exception as e:
            logger.error(f"Error retrieving similar lecture chunks: {e}", exc_info=True)
            return []

    # ----------------------------------------------------------------------
    # Retrieval: Using precomputed embedding
    # ----------------------------------------------------------------------
    def get_similar_chunks_by_question_embedding(self, question_embedding, lecturer_id=None, module_id=None, top_k=5):
        try:
            filters = []
            params = [question_embedding]

            if lecturer_id:
                filters.append("lecturer_id = %s")
                params.append(lecturer_id)

            if module_id:
                filters.append("module_id = %s")
                params.append(module_id)

            where_clause = " AND ".join(filters) if filters else "TRUE"

            params.append(question_embedding)
            params.append(top_k)

            query = sql.SQL(f"""
                SELECT lecture_material_id, file_path, content,
                       1 - (embedding <=> %s::vector) AS similarity,
                       model_name
                FROM {self.table_name}
                WHERE {where_clause}
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """)

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            if not rows:
                return []

            return [
                {
                    "lecture_material_id": r[0],
                    "file_path": r[1],
                    "content": r[2],
                    "similarity": float(r[3]),
                    "model_name": r[4],
                }
                for r in rows
            ]

        except Exception as e:
            logger.error(f"Error retrieving chunks by embedding: {e}", exc_info=True)
            return []
