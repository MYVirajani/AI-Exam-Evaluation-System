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
    Handles embedding and storing model answers with SEPARATE embeddings for:
      - Question text
      - Model answer text (+ media summaries)
      - Guideline text

    If an existing row has empty embeddings (NULL), the missing ones are embedded and updated.
    """

    def __init__(self, ai_model: str):
        embedder = self._select_embedder(ai_model)
        super().__init__(embedder)
        self.ai_model = ai_model
        self._ensure_vector_table()

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
    def _ensure_vector_table(self):
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
            guideline_embedding VECTOR({dim}),

            model_name VARCHAR(255) NOT NULL,
            created_on TIMESTAMP DEFAULT NOW()
        );
        """

        self.cursor.execute(create_table_query)
        self.conn.commit()
        logger.info(f"✅ Ensured table exists: {self.table_name}")

    # ----------------------------------------------------------------------
    # Main logic
    # ----------------------------------------------------------------------
    def embed_and_store_model_answers(self, model_paper_id: str, assessment_id: str, db_service):
        logger.info(f"📥 Fetching model answers with media using db_service.get_model_answer_with_media()...")

        rows = db_service.get_model_answer_with_media(
            assessment_id=assessment_id,
            model_paper_id=model_paper_id
        )

        if not rows:
            logger.warning(f"⚠️ No model answers found for assessment_id={assessment_id}")
            return

        logger.info(f"📦 Total model answer records fetched = {len(rows)}")

        model_name = self.embedder.get_model_name()

        # Fetch full existing rows (not just IDs)
        existing_query = f"""
            SELECT model_answer_id, question_embedding, answer_embedding, guideline_embedding
            FROM {self.table_name}
            WHERE assessment_id = %s AND model_paper_id = %s AND model_name = %s;
        """
        self.cursor.execute(existing_query, (assessment_id, model_paper_id, model_name))
        existing_map = {
            row[0]: {
                "question_embedding": row[1],
                "answer_embedding": row[2],
                "guideline_embedding": row[3],
            }
            for row in self.cursor.fetchall()
        }

        inserts = []
        updates = []

        for row in rows:
            model_answer_id = row["model_answer_id"]
            qnum = row["question_number"]

            question_text = (row["question_text"] or "").strip()
            answer_text = (row["answer_text"] or "").strip()
            guideline_text = (row["guideline_text"] or "").strip()
            media_summaries = row.get("media_summaries", [])

            media_concat = " ".join(media_summaries)
            full_answer_text = f"{answer_text} {media_concat}".strip()

            # Case 1: NEW RECORD → insert full embedding set
            if model_answer_id not in existing_map:
                logger.info(f"🆕 New model_answer_id={model_answer_id} → generating all embeddings")

                q_emb = self.embedder.embed([question_text])[0] if question_text else None
                a_emb = self.embedder.embed([full_answer_text])[0] if full_answer_text else None
                g_emb = self.embedder.embed([guideline_text])[0] if guideline_text else None

                inserts.append((
                    assessment_id, model_paper_id, model_answer_id, qnum,
                    q_emb, a_emb, g_emb, model_name, datetime.now()
                ))
                continue

            # Case 2: EXISTING RECORD → only embed missing columns
            existing = existing_map[model_answer_id]
            q_emb = existing["question_embedding"]
            a_emb = existing["answer_embedding"]
            g_emb = existing["guideline_embedding"]

            updated_fields = {}
            if q_emb is None and question_text:
                logger.info(f"✨ Updating missing QUESTION embedding for {model_answer_id}")
                updated_fields["question_embedding"] = self.embedder.embed([question_text])[0]

            if a_emb is None and full_answer_text:
                logger.info(f"✨ Updating missing ANSWER embedding for {model_answer_id}")
                updated_fields["answer_embedding"] = self.embedder.embed([full_answer_text])[0]

            if g_emb is None and guideline_text:
                logger.info(f"✨ Updating missing GUIDELINE embedding for {model_answer_id}")
                updated_fields["guideline_embedding"] = self.embedder.embed([guideline_text])[0]

            if updated_fields:
                # Build dynamic SQL for partial update
                set_clause = ", ".join([f"{col} = %s" for col in updated_fields.keys()])
                update_values = list(updated_fields.values())
                update_values.append(model_answer_id)

                updates.append((set_clause, update_values))
            else:
                logger.info(f"⏭️ Complete row exists for model_answer_id={model_answer_id}, nothing to update")

        # Perform all INSERTS
        if inserts:
            logger.info(f"📝 Inserting {len(inserts)} new rows...")
            insert_query = f"""
            INSERT INTO {self.table_name} (
                assessment_id, model_paper_id, model_answer_id, question_number,
                question_embedding, answer_embedding, guideline_embedding,
                model_name, created_on
            ) VALUES %s;
            """
            execute_values(self.cursor, insert_query, inserts)

        # Perform all UPDATES
        for set_clause, values in updates:
            update_query = f"""
                UPDATE {self.table_name}
                SET {set_clause}
                WHERE model_answer_id = %s;
            """
            self.cursor.execute(update_query, values)

        self.commit()

        logger.info(f"✅ Completed: {len(inserts)} inserted, {len(updates)} updated.")

    # ----------------------------------------------------------------------
    def get_embeddings_by_question(self, assessment_id: str, model_paper_id: str, question_number: str):
        try:
            query = f"""
            SELECT question_embedding, answer_embedding, guideline_embedding
            FROM {self.table_name}
            WHERE assessment_id = %s
              AND model_paper_id = %s
              AND question_number = %s;
            """

            self.cursor.execute(query, (assessment_id, model_paper_id, question_number))
            result = self.cursor.fetchone()

            if not result:
                logger.warning(
                    f"⚠️ No embeddings for assessment_id={assessment_id}, model_paper_id={model_paper_id}, question={question_number}"
                )
                return None

            q_emb, a_emb, g_emb = result

            return {
                "question_embedding": q_emb,
                "answer_embedding": a_emb,
                "guideline_embedding": g_emb,
            }

        except Exception as e:
            logger.error(f"❌ Failed to fetch embeddings: {e}", exc_info=True)
            self.conn.rollback()
            return None
