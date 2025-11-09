import logging
from datetime import datetime
import os
from psycopg2.extras import execute_values

from src.services.database_services.base_vector_db_service import BaseVectorDBService
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class StudentAnswerVectorService(BaseVectorDBService):
    """
    Handles embedding and storing student answers (including summarized media).
    Each model (OpenAI/Gemini) has its own table, e.g. student_answer_embeddings_gemini.
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
        """Ensure table exists for student embeddings (with separate columns)."""
        self.table_name = f"student_answer_embeddings_{self.suffix}"
        dim = self.embedder.get_embedding_dimension()

        create_table_query = f"""
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.table_name} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            submission_id VARCHAR(255) NOT NULL,
            student_answer_id UUID UNIQUE NOT NULL,
            question_number VARCHAR(50),
            answer_embedding VECTOR({dim}),
            model_name VARCHAR(255) NOT NULL,
            created_on TIMESTAMP DEFAULT NOW()
        );

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
    def embed_and_store_student_answers(self, submission_id: str, db_service):
        """
        Fetch student answers + media summaries for a submission and store embeddings.
        Skip re-embedding if already exists for the same student_answer_id.
        """
        query = f"""
        SELECT 
            sa.id AS student_answer_id,
            sa.submission_id,
            sa.question_number,
            sa.answer_text,
            ARRAY_REMOVE(ARRAY_AGG(sam.media_summary), NULL) AS media_summaries
        FROM {db_service.student_answer_table} sa
        LEFT JOIN {db_service.student_answer_media_table} sam
            ON sa.id = sam.student_answer_id
        WHERE sa.submission_id = %s
        GROUP BY sa.id;
        """

        db_service.cursor.execute(query, (submission_id,))
        rows = db_service.cursor.fetchall()
        if not rows:
            logger.warning(f"⚠️ No student answers found for submission_id={submission_id}")
            return

        print("\n================= RAW STUDENT ANSWERS FROM DB =================")
        for i, row in enumerate(rows, 1):
            print(f"\n🧩 Record {i}:")
            print(f"  Answer ID: {row[0]}")
            print(f"  Question Number: {row[2]}")
            print(f"  Answer Text: {row[3]}")
            print(f"  Media Summaries: {row[4]}")
        print("===============================================================\n")

        logger.info(f"📦 Total student answers fetched: {len(rows)}")

        model_name = self.embedder.get_model_name()

        # Check existing embeddings to avoid duplicates
        existing_query = f"""
            SELECT student_answer_id FROM {self.table_name}
            WHERE submission_id = %s AND model_name = %s;
        """
        self.cursor.execute(existing_query, (submission_id, model_name))
        existing_ids = {r[0] for r in self.cursor.fetchall()}

        embeddings_to_generate = []

        for row in rows:
            student_answer_id, submission_id_db, question_number, answer_text, media_summaries = row

            if student_answer_id in existing_ids:
                logger.info(f"⏭️ Skipping existing embedding for student_answer_id={student_answer_id}")
                continue

            # Safely flatten media_summaries (dict or str)
            if media_summaries:
                safe_media_summaries = []
                for ms in media_summaries:
                    if isinstance(ms, dict):
                        safe_media_summaries.append(ms.get("summary", str(ms)))
                    else:
                        safe_media_summaries.append(str(ms))
                media_concat = " ".join(safe_media_summaries)
            else:
                media_concat = ""

            # Combine answer text + media summary
            full_answer_text = f"{answer_text or ''} {media_concat}".strip()

            if not full_answer_text:
                logger.warning(f"⚠️ Empty answer for {student_answer_id}, skipping embedding.")
                continue

            embeddings_to_generate.append((student_answer_id, submission_id_db, question_number, full_answer_text))

        if not embeddings_to_generate:
            logger.info("⚠️ No new embeddings to generate.")
            return

        logger.info(f"🚀 Generating embeddings for {len(embeddings_to_generate)} student answers using {model_name} ...")

        insert_data = []
        for student_answer_id, submission_id_db, question_number, a_text in embeddings_to_generate:
            answer_emb = self.embedder.embed([a_text])[0]
            insert_data.append((
                submission_id_db,
                student_answer_id,
                question_number,
                answer_emb,
                model_name,
                datetime.now(),
            ))

        insert_query = f"""
        INSERT INTO {self.table_name} (
            submission_id, student_answer_id, question_number,
            answer_embedding, model_name, created_on
        ) VALUES %s;
        """

        execute_values(self.cursor, insert_query, insert_data)
        self.commit()
        logger.info(f"✅ Inserted {len(insert_data)} new student answer embeddings into {self.table_name}")

    # ----------------------------------------------------------------------
    #  Fetch embeddings by submission_id and question_number
    # ----------------------------------------------------------------------
    def get_student_answer_embeddings(self, submission_id: str, question_number: str):
        """
        Retrieve stored student answer embeddings for a given submission_id and question_number.
        Returns a list of tuples: (student_answer_id, answer_embedding)
        """
        query = f"""
        SELECT student_answer_id, answer_embedding
        FROM {self.table_name}
        WHERE submission_id = %s AND question_number = %s;
        """
        try:
            self.cursor.execute(query, (submission_id, question_number))
            results = self.cursor.fetchall()
            if not results:
                logger.warning(f"⚠️ No embeddings found for submission_id={submission_id}, question_number={question_number}")
                return []
            logger.info(f"✅ Retrieved {len(results)} embeddings for submission_id={submission_id}, question_number={question_number}")
            return results
        except Exception as e:
            logger.error(f"❌ Error fetching embeddings: {e}")
            return []
