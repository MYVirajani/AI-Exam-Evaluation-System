import logging
from datetime import datetime
from psycopg2.extras import execute_values

from src.utils.embedder_factory import get_embedder_for_model
from src.services.database_services.base_vector_db_service import BaseVectorDBService

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class StudentAnswerVectorService(BaseVectorDBService):
    """
    Handles embedding and storing student answers per model_id.
    Stores embeddings into tables such as student_answer_embeddings_openai, student_answer_embeddings_gemini.
    """

    def __init__(self, model_id: str):

        # Save model_id (instead of model_name)
        self.model_id = model_id

        # Load embedder for model_id
        embedder = get_embedder_for_model(model_id=model_id)
        self.embedder = embedder

        # Table suffix for the model (e.g., openai, gemini)
        self.suffix = embedder.get_table_suffix()

        # Initialize BaseVectorDBService AFTER defining embedder
        super().__init__(embedder)

        # Finally ensure the vector table exists
        self._ensure_vector_table()

    # ----------------------------------------------------------------------
    # Create model-specific table
    # ----------------------------------------------------------------------
    def _ensure_vector_table(self):
        """Ensure the table for embedding storage exists."""
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
            model_id VARCHAR(255) NOT NULL,
            created_on TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_{self.table_name}_answer
        ON {self.table_name} USING ivfflat (answer_embedding vector_cosine_ops)
        WITH (lists = 100);
        """

        self.cursor.execute(create_table_query)
        self.commit()
        logger.info(f"✅ Ensured table exists: {self.table_name}")

    # ----------------------------------------------------------------------
    # Main embedding logic
    # ----------------------------------------------------------------------
    def embed_and_store_student_answers(self, submission_id: str, db_service):
        """
        Fetch student answers, generate embeddings, and store them.
        Avoids re-embedding if the student_answer_id already exists.
        """

        rows = db_service.fetch_answers_for_embedding(submission_id)

        if not rows:
            logger.warning(f"⚠️ No student answers found for submission_id={submission_id}")
            return

        logger.info(f"📦 Total student answers fetched: {len(rows)}")

        # Check existing embeddings for this model_id
        existing_query = f"""
            SELECT student_answer_id
            FROM {self.table_name}
            WHERE submission_id = %s AND model_id = %s;
        """
        self.cursor.execute(existing_query, (submission_id, self.model_id))
        existing_ids = {r[0] for r in self.cursor.fetchall()}

        embeddings_to_generate = []

        for row in rows:
            student_answer_id, submission_id_db, question_number, answer_text, media_summaries = row

            # Skip if embedding already generated for this model
            if student_answer_id in existing_ids:
                logger.info(f"⏭️ Skipping existing embedding for student_answer_id={student_answer_id}")
                continue

            # Convert summaries safely
            media_concat = ""
            if media_summaries:
                if isinstance(media_summaries, list):
                    cleaned_items = []
                    for ms in media_summaries:
                        if isinstance(ms, dict):
                            cleaned_items.append(ms.get("summary", str(ms)))
                        else:
                            cleaned_items.append(str(ms))
                    media_concat = " ".join(cleaned_items)

            # Combine text + media
            full_answer = f"{answer_text or ''} {media_concat}".strip()

            if not full_answer:
                logger.warning(f"⚠️ Empty answer for student_answer_id={student_answer_id}, skipping.")
                continue

            embeddings_to_generate.append(
                (student_answer_id, submission_id_db, question_number, full_answer)
            )

        if not embeddings_to_generate:
            logger.info("⚠️ No embeddings to generate.")
            return

        logger.info(
            f"🚀 Generating {len(embeddings_to_generate)} embeddings using model_id={self.model_id}"
        )

        # Generate embeddings
        insert_data = []
        for student_answer_id, submission_id_db, question_number, text in embeddings_to_generate:
            emb = self.embedder.embed([text])[0]
            insert_data.append(
                (
                    submission_id_db,
                    student_answer_id,
                    question_number,
                    emb,
                    self.model_id,   # Store model_id instead of model_name
                    datetime.now(),
                )
            )

        # Insert embeddings
        insert_query = f"""
            INSERT INTO {self.table_name} (
                submission_id, student_answer_id, question_number,
                answer_embedding, model_id, created_on
            )
            VALUES %s;
        """

        execute_values(self.cursor, insert_query, insert_data)
        self.commit()
        logger.info(f"✅ Inserted {len(insert_data)} student answer embeddings into {self.table_name}")

    # ----------------------------------------------------------------------
    # Retrieval
    # ----------------------------------------------------------------------
    def get_student_answer_embeddings(self, submission_id: str, question_number: str):
        """
        Fetch embeddings by submission + question number.
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
                logger.warning(
                    f"⚠️ No embeddings found for submission_id={submission_id}, question_number={question_number}"
                )
                return []

            logger.info(
                f"✅ Retrieved {len(results)} embeddings for submission_id={submission_id}, question_number={question_number}"
            )
            return results

        except Exception as e:
            logger.error(f"❌ Error fetching embeddings: {e}")
            return []
