# src/services/vector/student_answer_media_embedder.py

import logging
from typing import List
from pgvector.psycopg2 import register_vector
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.base_vector_db_service import BaseVectorDBService
from src.services.embedding.abstract_embedder import AbstractEmbedder
from src.services.database_services.student_media_db_service import StudentMediaDBService

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class StudentAnswerMediaEmbeddingDB(BaseVectorDBService):
    """
    Handles embedding and storing of concatenated (answer_text + media_summary)
    for each student answer per question_id.
    """

    def __init__(self, embedder: AbstractEmbedder, provider_override: str = None):
        super().__init__(embedder)
        self.embedder = embedder
        self.media_db = StudentMediaDBService()

        self.suffix = provider_override.lower() if provider_override else embedder.get_table_suffix()
        self.table_name = f"student_answer_media_embeddings_{self.suffix}"

        register_vector(self.conn)
        self._create_table()

    def _create_table(self):
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table_name} (
                id SERIAL PRIMARY KEY,
                submission_id TEXT,
                question_id TEXT,
                embedding vector({dim}),
                UNIQUE (submission_id, question_id)
            );
        """)
        self.commit()
        logger.info(f"[VectorDB] ✅ Ready table: {self.table_name}")

    def _fetch_answers(self, submission_id: str):
        """
        Fetch all student answers and their media summaries for a submission_id.
        Returns a list of dicts: {submission_id, question_id, concatenated_text}
        """
        try:
            # Fetch answers
            self.cursor.execute("""
                SELECT submission_id, question_id, ans_txt, media_summaries
                FROM student_answer_openai_with_media
                WHERE submission_id = %s;
            """, (submission_id,))
            rows = self.cursor.fetchall()

            results = []
            for row in rows:
                sub_id, q_id, ans_txt, media_summaries = row
                media_summary_text = ""

                # media_summaries might be a JSON list of strings
                if media_summaries:
                    try:
                        from ast import literal_eval
                        summaries = literal_eval(media_summaries) if isinstance(media_summaries, str) else media_summaries
                        media_summary_text = " ".join(summaries)
                    except Exception:
                        media_summary_text = str(media_summaries)

                combined_text = f"{ans_txt.strip()} {media_summary_text.strip()}".strip()
                results.append({
                    "submission_id": sub_id,
                    "question_id": q_id,
                    "combined_text": combined_text
                })
            return results
        except Exception as e:
            logger.error(f"[DB] ❌ Failed to fetch answers for submission_id={submission_id}: {e}")
            return []

    def save_embeddings_for_submissions(self, submission_ids: List[str]):
        """
        Vectorizes and saves concatenated (answer_text + media_summary)
        for all answers across multiple submissions.
        """
        all_records = []
        for sub_id in submission_ids:
            records = self._fetch_answers(sub_id)
            all_records.extend(records)

        if not all_records:
            logger.warning("[VectorDB] ⚠️ No answers found to embed.")
            return

        texts = [r["combined_text"] for r in all_records]
        vectors = self.embedder.embed(texts)

        for rec, vec in zip(all_records, vectors):
            self.cursor.execute(f"""
                INSERT INTO {self.table_name} (submission_id, question_id, embedding)
                VALUES (%s, %s, %s)
                ON CONFLICT (submission_id, question_id)
                DO UPDATE SET embedding = EXCLUDED.embedding;
            """, (rec["submission_id"], rec["question_id"], vec))

        self.commit()
        logger.info(f"[VectorDB] ✅ Saved {len(all_records)} embeddings to {self.table_name}")

    def get_embeddings_by_question(self, question_id: str):
        """
        Retrieve all embeddings for a given question_id.
        """
        try:
            self.cursor.execute(f"""
                SELECT submission_id, embedding
                FROM {self.table_name}
                WHERE question_id = %s;
            """, (question_id,))
            rows = self.cursor.fetchall()
            return [{"submission_id": r[0], "embedding": r[1]} for r in rows]
        except Exception as e:
            logger.error(f"[VectorDB] ❌ Failed to retrieve embeddings for question_id={question_id}: {e}")
            return []
