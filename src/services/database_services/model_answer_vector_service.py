import os
import logging
from datetime import datetime
from psycopg2.extras import execute_values

from src.services.database_services.base_vector_db_service import BaseVectorDBService
from src.services.embedding.openai_embedder import OpenAIEmbedder

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerVectorService(BaseVectorDBService):
    """
    Handles embedding and storing model answers + media summaries into pgvector.
    """

    def __init__(self, embedder=None):
        embedder = embedder or OpenAIEmbedder()
        super().__init__(embedder)
        self._ensure_vector_table()

    # ----------------------------------------------------------------------
    # Table setup
    # ----------------------------------------------------------------------
    def _ensure_vector_table(self):
        """Ensure the model_answer_embeddings_<suffix> table exists."""
        table_name = f"model_answer_embeddings_{self.suffix}"
        dim = self.embedder.get_embedding_dimension()

        create_table_query = f"""
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {table_name} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            assessment_id VARCHAR(255) NOT NULL,
            model_paper_id VARCHAR(255) NOT NULL,
            model_answer_id UUID NOT NULL,
            question_number VARCHAR(50),
            combined_text TEXT,
            embedding VECTOR({dim}),
            created_on TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_{table_name}_embedding
        ON {table_name} USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
        """
        try:
            self.cursor.execute(create_table_query)
            self.conn.commit()
            logger.info(f"✅ Ensured pgvector table exists: {table_name}")
        except Exception as e:
            logger.error(f"❌ Failed to create pgvector table: {e}")
            self.conn.rollback()
            raise

    # ----------------------------------------------------------------------
    # Data Embedding + Insertion
    # ----------------------------------------------------------------------
    def embed_and_store_model_answers(self, model_paper_id: str, assessment_id: str, db_service):
        """
        Fetch model answers + media summaries for a given assessment_id,
        embed them, and store minimal metadata + embeddings in pgvector.
        """
        table_name = f"model_answer_embeddings_{self.suffix}"

        # 1️⃣ Fetch model answers and related media summaries
        query = """
        SELECT
            ma.id AS model_answer_id,
            ma.assessment_id,
            ma.model_answer_paper_id AS model_paper_id,
            ma.question_number,
            ma.question_text,
            ma.answer_text,
            ma.guideline_text,
            ARRAY_REMOVE(ARRAY_AGG(mam.media_summary), NULL) AS media_summaries
        FROM model_answer ma
        LEFT JOIN model_answer_media mam ON mam.model_answer_id = ma.id
        WHERE ma.assessment_id = %s AND ma.model_answer_paper_id = %s
        GROUP BY ma.id;
        """

        try:
            db_service.cursor.execute(query, (assessment_id, model_paper_id))
            rows = db_service.cursor.fetchall()
        except Exception as e:
            logger.error(f"❌ Failed to fetch model answers for embedding: {e}")
            db_service.conn.rollback()
            return

        if not rows:
            logger.warning(f"⚠️ No model answers found for assessment_id={assessment_id}, model_paper_id={model_paper_id}")
            return

        logger.info(f"📘 Found {len(rows)} model answers for embedding (assessment_id={assessment_id})")

        # 2️⃣ Prepare texts for embedding
        texts_to_embed = []
        data_records = []

        for row in rows:
            model_answer_id, _, model_paper_id_db, question_number, question_text, answer_text, guideline_text, media_summaries = row

            # Combine answer_text and all media summaries together
            media_concat = " ".join(ms for ms in media_summaries or [])
            model_answer_combined = f"{answer_text or ''} {media_concat or ''}".strip()

            # Build combined text for semantic embedding
            combined_text = f"""
            Question: {question_text or ""}
            Guidelines: {guideline_text or ""}
            Model Answer: {model_answer_combined}
            """.strip()

            texts_to_embed.append(combined_text)
            data_records.append({
                "assessment_id": assessment_id,
                "model_paper_id": model_paper_id_db,
                "model_answer_id": model_answer_id,
                "question_number": question_number,
                "combined_text": combined_text,
            })

        # 3️⃣ Generate embeddings using OpenAI
        embeddings = self.embedder.embed(texts_to_embed)
        if not embeddings:
            logger.error("❌ No embeddings generated. Aborting insertion.")
            return

        # 4️⃣ Insert minimal fields into vector DB
        insert_query = f"""
        INSERT INTO {table_name} (
            assessment_id,
            model_paper_id,
            model_answer_id,
            question_number,
            combined_text,
            embedding,
            created_on
        )
        VALUES %s;
        """

        insert_values = [
            (
                rec["assessment_id"],
                rec["model_paper_id"],
                rec["model_answer_id"],
                rec["question_number"],
                rec["combined_text"],
                emb,
                datetime.now(),
            )
            for rec, emb in zip(data_records, embeddings)
        ]

        try:
            execute_values(self.cursor, insert_query, insert_values)
            self.commit()
            logger.info(f"✅ Inserted {len(insert_values)} embeddings for model_paper_id={model_paper_id}, assessment={assessment_id}")
        except Exception as e:
            logger.error(f"❌ Failed to insert embeddings: {e}")
            self.conn.rollback()
