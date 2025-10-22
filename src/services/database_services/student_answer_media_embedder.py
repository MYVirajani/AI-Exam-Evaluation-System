import logging
from typing import List
from pgvector.psycopg2 import register_vector
import sys
import os
from ast import literal_eval

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.base_vector_db_service import BaseVectorDBService
from src.services.database_services.base_relational_db import BaseRelationalDB
from src.services.embedding.abstract_embedder import AbstractEmbedder
from src.services.database_services.student_media_db_service import StudentMediaDBService

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class StudentAnswerMediaEmbeddingDB(BaseVectorDBService):
    """
    Handles embedding and storing of concatenated (answer_text + media_summary)
    for each student_answer_id.
    """

    def __init__(self, embedder: AbstractEmbedder, provider_override: str = None):
        super().__init__(embedder)
        self.embedder = embedder
        self.media_db = StudentMediaDBService()

        # Define suffix & table name for vector DB
        self.suffix = provider_override.lower() if provider_override else embedder.get_table_suffix()
        self.table_name = f"student_answer_media_embeddings_{self.suffix}"

        register_vector(self.conn)
        self._create_table()

    def _create_table(self):
        """Create vector embedding table in the Vector DB with composite PK and CASCADE delete."""
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table_name} (
                submission_id TEXT NOT NULL,
                student_answer_id UUID NOT NULL,
                embedding vector({dim}),
                PRIMARY KEY (submission_id, student_answer_id)
            );
        """)
        self.commit()
        logger.info(f"[VectorDB] ✅ Ready table: {self.table_name} (composite PK with CASCADE)")

    def _fetch_answers(self, submission_id: str):
        """
        Fetch all student answers and their media summaries for a given submission_id
        from the Relational DB (student_answer, student_answer_media tables).
        Returns a list of dicts: {submission_id, student_answer_id, combined_text}
        """
        try:
            # ✅ Create a new Relational DB connection (separate from vector DB)
            rel_db = BaseRelationalDB()
            rel_cursor = rel_db.cursor

            # ✅ Fetch all answers for the given submission
            rel_cursor.execute("""
                SELECT id, answer_text
                FROM student_answer
                WHERE submission_id = %s;
            """, (submission_id,))
            answer_rows = rel_cursor.fetchall()

            # Map: {student_answer_id: answer_text}
            answer_dict = {row[0]: (row[1] or "") for row in answer_rows}

            # ✅ Fetch all media summaries for the same submission
            rel_cursor.execute("""
                SELECT student_answer_id, media_summary
                FROM student_answer_media
                WHERE submission_id = %s;
            """, (submission_id,))
            media_rows = rel_cursor.fetchall()

            # Map: {student_answer_id: concatenated media summary text}
            media_dict = {}
            for ans_id, media_summary in media_rows:
                if media_summary:
                    try:
                        if isinstance(media_summary, list):
                            summaries = media_summary
                        elif isinstance(media_summary, str):
                            summaries = literal_eval(media_summary)
                        else:
                            summaries = [str(media_summary)]
                        media_dict[ans_id] = " ".join(map(str, summaries))
                    except Exception:
                        media_dict[ans_id] = str(media_summary)
                else:
                    media_dict[ans_id] = ""

            rel_db.close()  # ✅ Always close the relational DB connection

            # ✅ Combine both answers and media summaries
            results = []
            all_answer_ids = set(answer_dict.keys()) | set(media_dict.keys())

            for ans_id in all_answer_ids:
                ans_txt = answer_dict.get(ans_id, "").strip()
                media_summary_text = media_dict.get(ans_id, "").strip()
                combined_text = f"{ans_txt} {media_summary_text}".strip()

                results.append({
                    "submission_id": submission_id,
                    "student_answer_id": ans_id,
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

        # Generate embeddings
        texts = [r["combined_text"] for r in all_records]
        vectors = self.embedder.embed(texts)

        # Save each embedding to Vector DB
        for rec, vec in zip(all_records, vectors):
            self.cursor.execute(f"""
                INSERT INTO {self.table_name} (submission_id, student_answer_id, embedding)
                VALUES (%s, %s, %s)
                ON CONFLICT (submission_id, student_answer_id)
                DO UPDATE SET embedding = EXCLUDED.embedding;
            """, (rec["submission_id"], rec["student_answer_id"], vec))

        self.commit()
        logger.info(f"[VectorDB] ✅ Saved {len(all_records)} embeddings to {self.table_name}")

    def get_embeddings_by_answer(self, student_answer_id: str):
        """Retrieve embedding for a given student_answer_id from Vector DB."""
        try:
            self.cursor.execute(f"""
                SELECT submission_id, embedding
                FROM {self.table_name}
                WHERE student_answer_id = %s;
            """, (student_answer_id,))
            rows = self.cursor.fetchall()
            return [{"submission_id": r[0], "embedding": r[1]} for r in rows]
        except Exception as e:
            logger.error(f"[VectorDB] ❌ Failed to retrieve embedding for student_answer_id={student_answer_id}: {e}")
            return []
