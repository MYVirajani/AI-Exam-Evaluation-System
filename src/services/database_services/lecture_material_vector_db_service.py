# src/services/db/lecture_material_vector_db_service.py

import os
import json
import logging
from psycopg2 import sql
from .base_vector_db_service import BaseVectorDBService

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class LectureMaterialDBService(BaseVectorDBService):
    """
    Database service for saving lecture material embeddings.
    Each embedder will have its own table, named:
        lecture_material_embeddings_<suffix>
    Example: lecture_material_embeddings_openai, lecture_material_embeddings_gemini
    """

    def __init__(self, embedder):
        super().__init__(embedder)
        self.table_name = f"lecture_material_embeddings_{self.suffix}"
        self.ensure_table_exists()

    def ensure_table_exists(self):
        """Creates the embedding table if it doesn't exist."""
        create_table_query = sql.SQL("""
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS {} (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                module_id TEXT NOT NULL,
                lecture_material_id TEXT NOT NULL,
                file_path TEXT NOT NULL,
                content TEXT,
                embedding VECTOR({}),
                model_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (module_id, lecture_material_id)
            );
        """).format(
            sql.Identifier(self.table_name),
            sql.Literal(self.embedder.get_embedding_dimension())
        )

        self.cursor.execute(create_table_query)
        self.conn.commit()
        logger.info(f"Ensured table exists: {self.table_name}")

    def already_exists(self, module_id: str, lecture_material_id: str) -> bool:
        """Check if a given lecture material for a module is already embedded."""
        check_query = sql.SQL("""
            SELECT 1 FROM {} 
            WHERE module_id = %s AND lecture_material_id = %s
            LIMIT 1;
        """).format(sql.Identifier(self.table_name))

        self.cursor.execute(check_query, (module_id, lecture_material_id))
        exists = self.cursor.fetchone() is not None

        if exists:
            logger.info(
                f"Skipping: Lecture material '{lecture_material_id}' for module '{module_id}' already exists in {self.table_name}."
            )
        return exists

    def insert_embedding(self, module_id, lecture_material_id, file_path, content, embedding, model_name):
        """Insert a single lecture material embedding, skipping duplicates."""
        if self.already_exists(module_id, lecture_material_id):
            return  # Skip if already exists

        insert_query = sql.SQL("""
            INSERT INTO {} (module_id, lecture_material_id, file_path, content, embedding, model_name)
            VALUES (%s, %s, %s, %s, %s, %s);
        """).format(sql.Identifier(self.table_name))

        self.cursor.execute(
            insert_query,
            (module_id, lecture_material_id, file_path, content, embedding, model_name)
        )
        logger.info(f"Inserted embedding for {lecture_material_id} into {self.table_name}")

    def bulk_insert_embeddings(self, module_id, file_path, lecture_material_id, contents, embeddings):
        """Insert multiple embeddings (if file is chunked). Skip if already exists."""
        if len(contents) != len(embeddings):
            raise ValueError("Contents and embeddings length mismatch.")

        # Skip entire file if already embedded
        if self.already_exists(module_id, lecture_material_id):
            logger.info(f"Skipping all embeddings for {lecture_material_id} — already in DB.")
            return

        model_name = self.embedder.get_model_name()
        for content, emb in zip(contents, embeddings):
            self.insert_embedding(module_id, lecture_material_id, file_path, content, emb, model_name)

        self.commit()
