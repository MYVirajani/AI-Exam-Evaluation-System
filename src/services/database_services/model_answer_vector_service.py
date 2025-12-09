import logging
from datetime import datetime
from psycopg2.extras import execute_values

from src.services.database_services.base_vector_db_service import BaseVectorDBService
from src.utils.embedder_factory import get_embedder_for_model

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerVectorService(BaseVectorDBService):

    def __init__(self, model_id):
        self.model_id = model_id
        embedder = get_embedder_for_model(model_id)
        self.suffix = embedder.get_table_suffix()
        self.table_name = f"model_answer_embeddings_{self.suffix}"
        super().__init__(embedder=embedder)
        self._ensure_vector_table()

    # ----------------------------------------------------------------------
    def _ensure_vector_table(self):
        dim = self.embedder.get_embedding_dimension()

        create_table_query = f"""
        CREATE EXTENSION IF NOT EXISTS vector;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.table_name} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

            assessment_id VARCHAR(255) NOT NULL,
            model_paper_id VARCHAR(255) NOT NULL,
            question_number VARCHAR(50) NOT NULL,

            question_embedding VECTOR({dim}),
            answer_embedding VECTOR({dim}),
            guideline_embedding VECTOR({dim}),

            model_name VARCHAR(255) NOT NULL,
            created_on TIMESTAMP DEFAULT NOW(),

            UNIQUE (assessment_id, model_paper_id, question_number)
        );
        """

        try:
            self.cursor.execute(create_table_query)
            self.conn.commit()
            logger.info(f"Table ensured: {self.table_name}")
        except Exception:
            logger.error(f"Failed to create table: {self.table_name}", exc_info=True)
            self.conn.rollback()
            raise

    
    # ----------------------------------------------------------------------
    def get_vectors_for_paper(self, assessment_id: str, model_paper_id: str):
        try:
            query = f"""
                SELECT question_number, question_embedding, answer_embedding, guideline_embedding
                FROM {self.table_name}
                WHERE assessment_id = %s AND model_paper_id = %s;
            """

            self.cursor.execute(query, (assessment_id, model_paper_id))
            results = self.cursor.fetchall()

            records = []
            for row in results:
                records.append({
                    "question_number": row[0],
                    "question_embedding": row[1],
                    "answer_embedding": row[2],
                    "guideline_embedding": row[3]
                })

            return records

        except Exception as e:
            logger.error(f"Failed to fetch vectors: {e}", exc_info=True)
            self.conn.rollback()
            return []
    
    def embed_and_store_model_answers(self, model_paper_id: str, assessment_id: str, db_service):

        self._ensure_vector_table()

        logger.info(f"Fetching model answers with media summaries...")
        rows = db_service.get_model_answer_with_media(
            assessment_id=assessment_id,
            model_paper_id=model_paper_id
        )

        if not rows:
            logger.warning(f"No model answers found for assessment_id={assessment_id}")
            return

        logger.info(f"Total model answers fetched = {len(rows)}")

        model_name = self.embedder.get_model_name()

        # load all existing rows
        existing_query = f"""
            SELECT question_number, question_embedding, answer_embedding, guideline_embedding
            FROM {self.table_name}
            WHERE assessment_id = %s AND model_paper_id = %s AND model_name = %s;
        """
        self.cursor.execute(existing_query, (assessment_id, model_paper_id, model_name))

        existing_map = {
            row[0]: {
                "question_embedding": row[1],
                "answer_embedding": row[2],
                "guideline_embedding": row[3]
            }
            for row in self.cursor.fetchall()
        }

        inserts = []
        updates = []

        for row in rows:
            qnum = row["question_number"]

            question_text = (row["question_text"] or "").strip()
            answer_text = (row["answer_text"] or "").strip()
            guideline_text = (row["guideline_text"] or "").strip()
            media_summaries = row.get("media_summaries", [])
            media_concat = " ".join(media_summaries)
            full_answer_text = f"{answer_text} {media_concat}".strip()

            if qnum not in existing_map:
                q_emb = self.embedder.embed([question_text])[0] if question_text else None
                a_emb = self.embedder.embed([full_answer_text])[0] if full_answer_text else None
                g_emb = self.embedder.embed([guideline_text])[0] if guideline_text else None

                inserts.append((
                    assessment_id, model_paper_id, qnum,
                    q_emb, a_emb, g_emb,
                    model_name, datetime.now()
                ))
                continue

            existing = existing_map[qnum]

            updated_fields = {}
            if existing["question_embedding"] is None and question_text:
                updated_fields["question_embedding"] = self.embedder.embed([question_text])[0]

            if existing["answer_embedding"] is None and full_answer_text:
                updated_fields["answer_embedding"] = self.embedder.embed([full_answer_text])[0]

            if existing["guideline_embedding"] is None and guideline_text:
                updated_fields["guideline_embedding"] = self.embedder.embed([guideline_text])[0]

            if updated_fields:
                set_clause = ", ".join([f"{col} = %s" for col in updated_fields.keys()])
                update_values = list(updated_fields.values())
                update_values.extend([assessment_id, model_paper_id, qnum])

                updates.append((set_clause, update_values))

        if inserts:
            insert_query = f"""
            INSERT INTO {self.table_name} (
                assessment_id, model_paper_id, question_number,
                question_embedding, answer_embedding, guideline_embedding,
                model_name, created_on
            ) VALUES %s
            ON CONFLICT (assessment_id, model_paper_id, question_number)
            DO NOTHING;
            """
            execute_values(self.cursor, insert_query, inserts)

        for set_clause, values in updates:
            update_query = f"""
                UPDATE {self.table_name}
                SET {set_clause}
                WHERE assessment_id = %s AND model_paper_id = %s AND question_number = %s;
            """
            self.cursor.execute(update_query, values)

        self.commit()
        logger.info(f"Completed: {len(inserts)} inserted, {len(updates)} updated.")

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
                return None

            q_emb, a_emb, g_emb = result

            return {
                "question_embedding": q_emb,
                "answer_embedding": a_emb,
                "guideline_embedding": g_emb
            }

        except Exception as e:
            logger.error(f"Failed to fetch embeddings: {e}", exc_info=True)
            self.conn.rollback()
            return None
