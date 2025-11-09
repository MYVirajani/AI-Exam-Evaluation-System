import logging
from datetime import datetime
from psycopg2.extras import execute_values

from src.services.database_services.base_vector_db_service import BaseVectorDBService
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerVectorService(BaseVectorDBService):
    """
    Handles embedding and storing model answers with separate columns for
    question and answer embeddings (guideline text not embedded).
    Supports both OpenAIEmbedder and GeminiEmbedder depending on --ai_model.
    """

    def __init__(self, ai_model: str):
        embedder = self._select_embedder(ai_model)
        super().__init__(embedder)
        self.ai_model = ai_model
        self._ensure_vector_table()

    # ----------------------------------------------------------------------
    # Embedder selection
    # ----------------------------------------------------------------------
    def _select_embedder(self, ai_model: str):
        """Return embedder based on model name."""
        model_lower = ai_model.lower()
        if "gemini" in model_lower:
            logger.info(f"🔹 Using GeminiEmbedder for model: {ai_model}")
            return GeminiEmbedder()
        else:
            logger.info(f"🔹 Using OpenAIEmbedder for model: {ai_model}")
            return OpenAIEmbedder()

    # ----------------------------------------------------------------------
    # Table setup
    # ----------------------------------------------------------------------
    def _ensure_vector_table(self):
        """Ensure table exists for this embedder (question and answer embeddings only)."""
        self.table_name = f"model_answer_embeddings_{self.suffix}"
        dim = self.embedder.get_embedding_dimension()

        create_table_query = f"""
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.table_name} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            assessment_id VARCHAR(255) NOT NULL,
            model_paper_id VARCHAR(255) NOT NULL,
            model_answer_id UUID UNIQUE NOT NULL,
            question_number VARCHAR(50),
            question_embedding VECTOR({dim}),
            answer_embedding VECTOR({dim}),
            model_name VARCHAR(255) NOT NULL,
            created_on TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_{self.table_name}_question
        ON {self.table_name} USING ivfflat (question_embedding vector_cosine_ops)
        WITH (lists = 100);

        CREATE INDEX IF NOT EXISTS idx_{self.table_name}_answer
        ON {self.table_name} USING ivfflat (answer_embedding vector_cosine_ops)
        WITH (lists = 100);
        """

        self.cursor.execute(create_table_query)
        self.conn.commit()
        logger.info(f"✅ Ensured table exists: {self.table_name}")

    # ----------------------------------------------------------------------
    # Main embedding logic
    # ----------------------------------------------------------------------
    def embed_and_store_model_answers(self, model_paper_id: str, assessment_id: str, db_service):
        """
        Fetch model answers and embed only question and answer texts.
        Skip re-embedding if the same model_answer_id already exists.
        """

        # ✅ Use the correct model-specific tables from db_service
        model_answer_table = getattr(db_service, "model_answer_table", "model_answer")
        model_answer_media_table = getattr(db_service, "model_answer_media_table", "model_answer_media")

        query = f"""
        SELECT
            ma.id AS model_answer_id,
            ma.assessment_id,
            ma.model_answer_paper_id AS model_paper_id,
            ma.question_number,
            ma.question_text,
            ma.answer_text,
            ARRAY_REMOVE(ARRAY_AGG(mam.media_summary), NULL) AS media_summaries
        FROM {model_answer_table} ma
        LEFT JOIN {model_answer_media_table} mam ON mam.model_answer_id = ma.id
        WHERE ma.assessment_id = %s AND ma.model_answer_paper_id = %s
        GROUP BY ma.id;
        """

        db_service.cursor.execute(query, (assessment_id, model_paper_id))
        rows = db_service.cursor.fetchall()

        if not rows:
            logger.warning(f"⚠️ No model answers found for assessment_id={assessment_id}")
            return

        print("\n================= RAW DATA FETCHED FROM DB =================")
        for i, row in enumerate(rows, 1):
            print(f"\n🧩 Record {i}:")
            print(f"  Model Answer ID: {row[0]}")
            print(f"  Question Number: {row[3]}")
            print(f"  Question Text: {row[4]}")
            print(f"  Answer Text: {row[5]}")
            print(f"  Media Summaries: {row[6]}")
        print("============================================================\n")

        logger.info(f"📦 Total raw records fetched: {len(rows)}")

        model_name = self.embedder.get_model_name()

        # Get already embedded entries to skip duplicates
        existing_query = f"""
            SELECT model_answer_id FROM {self.table_name}
            WHERE assessment_id = %s AND model_paper_id = %s AND model_name = %s;
        """
        self.cursor.execute(existing_query, (assessment_id, model_paper_id, model_name))
        existing_ids = {r[0] for r in self.cursor.fetchall()}

        embeddings_to_generate = []

        for row in rows:
            model_answer_id, _, model_paper_id_db, question_number, question_text, answer_text, media_summaries = row

            if model_answer_id in existing_ids:
                logger.info(f"⏭️ Skipping existing embeddings for {model_answer_id}")
                continue

            media_concat = " ".join(ms for ms in media_summaries or [])
            full_answer_text = f"{answer_text or ''} {media_concat or ''}".strip()

            q_text = question_text.strip() if question_text else None
            a_text = full_answer_text if full_answer_text else None

            embeddings_to_generate.append((model_answer_id, q_text, a_text, model_paper_id_db, question_number))

        if not embeddings_to_generate:
            logger.info("⚠️ No new embeddings to generate.")
            return

        logger.info(f"🚀 Generating embeddings for {len(embeddings_to_generate)} model answers using {model_name} ...")

        insert_data = []

        for model_answer_id, q_text, a_text, model_paper_id_db, question_number in embeddings_to_generate:
            question_emb = self.embedder.embed([q_text])[0] if q_text else None
            answer_emb = self.embedder.embed([a_text])[0] if a_text else None

            insert_data.append((
                assessment_id,
                model_paper_id_db,
                model_answer_id,
                question_number,
                question_emb,
                answer_emb,
                model_name,
                datetime.now(),
            ))

        insert_query = f"""
        INSERT INTO {self.table_name} (
            assessment_id, model_paper_id, model_answer_id, question_number,
            question_embedding, answer_embedding,
            model_name, created_on
        ) VALUES %s;
        """

        execute_values(self.cursor, insert_query, insert_data)
        self.commit()
        logger.info(f"✅ Inserted {len(insert_data)} new records into {self.table_name}")

    # ----------------------------------------------------------------------
    #  Fetch embeddings for a question
    # ----------------------------------------------------------------------
    def get_embeddings_by_question(self, assessment_id: str, model_paper_id: str, question_number: str):
        """
        Retrieve question_embedding and answer_embedding for a given assessment_id,
        model_paper_id, and question_number.
        """
        try:
            query = f"""
            SELECT question_embedding, answer_embedding
            FROM {self.table_name}
            WHERE assessment_id = %s
              AND model_paper_id = %s
              AND question_number = %s;
            """
            self.cursor.execute(query, (assessment_id, model_paper_id, question_number))
            result = self.cursor.fetchone()

            if not result:
                logger.warning(
                    f"⚠️ No embeddings found for assessment_id={assessment_id}, "
                    f"model_paper_id={model_paper_id}, question_number={question_number}"
                )
                return None

            question_embedding, answer_embedding = result
            logger.info(
                f"✅ Retrieved embeddings for assessment_id={assessment_id}, "
                f"model_paper_id={model_paper_id}, question_number={question_number}"
            )
            return {
                "question_embedding": question_embedding,
                "answer_embedding": answer_embedding,
            }

        except Exception as e:
            logger.error(f"❌ Failed to fetch embeddings: {e}", exc_info=True)
            self.conn.rollback()
            return None
