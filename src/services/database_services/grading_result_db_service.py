import logging
from typing import List, Dict, Any, Union
from dataclasses import asdict, is_dataclass
from .base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)


class GradingResultDB(BaseRelationalDB):
    """
    Database service class for managing grading results.
    Automatically ensures the 'grading_result' table exists.
    """

    def __init__(self):
        super().__init__()
        self._ensure_table_exists()

    # ---------------------------------------------------------
    # TABLE CREATION (AUTO)
    # ---------------------------------------------------------
    def _ensure_table_exists(self):
        """
        Create the grading_result table if it doesn't already exist.
        """
        try:
            create_table_query = """
            CREATE TABLE IF NOT EXISTS grading_result (
                id SERIAL PRIMARY KEY,
                submission_id VARCHAR(255) NOT NULL,
                question_number VARCHAR(255) NOT NULL,
                score FLOAT,
                max_marks FLOAT,
                feedback TEXT,
                grading_method VARCHAR(100),
                similarity_score FLOAT,
                context_used TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_submission_question UNIQUE (submission_id, question_number)
            );
            """
            self.cursor.execute(create_table_query)
            self.conn.commit()
            logger.info("[DB] ✅ Verified/created table: grading_result")
        except Exception as e:
            logger.error(f"[DB] ❌ Failed to ensure grading_result table exists: {e}", exc_info=True)
            self.conn.rollback()

    # ---------------------------------------------------------
    # INSERT OR UPDATE SINGLE RESULT
    # ---------------------------------------------------------
    def save_result_record(self, record: Union[Dict[str, Any], Any]) -> bool:
        """
        Save a grading result record to the database.
        If a record already exists for (submission_id, question_number),
        it will be updated instead of inserted.

        Supports both dicts and dataclass-based GradingResultRecord objects.
        """
        try:
            # --- Normalize record ---
            if is_dataclass(record):
                record = asdict(record)
            elif not isinstance(record, dict):
                # Fallback for plain class instances
                record = {
                    "submission_id": getattr(record, "submission_id", None),
                    "question_number": getattr(record, "question_number", None),
                    "score": getattr(record, "score", None),
                    "max_marks": getattr(record, "max_marks", None),
                    "feedback": getattr(record, "feedback", None),
                    "grading_method": getattr(record, "grading_method", None),
                    "similarity_score": getattr(record, "similarity_score", None),
                    "context_used": getattr(record, "context_used", None),
                }

            query = """
                INSERT INTO grading_result (
                    submission_id,
                    question_number,
                    score,
                    max_marks,
                    feedback,
                    grading_method,
                    similarity_score,
                    context_used
                )
                VALUES (
                    %(submission_id)s,
                    %(question_number)s,
                    %(score)s,
                    %(max_marks)s,
                    %(feedback)s,
                    %(grading_method)s,
                    %(similarity_score)s,
                    %(context_used)s
                )
                ON CONFLICT (submission_id, question_number)
                DO UPDATE SET
                    score = EXCLUDED.score,
                    max_marks = EXCLUDED.max_marks,
                    feedback = EXCLUDED.feedback,
                    grading_method = EXCLUDED.grading_method,
                    similarity_score = EXCLUDED.similarity_score,
                    context_used = EXCLUDED.context_used,
                    updated_at = CURRENT_TIMESTAMP;
            """

            self.cursor.execute(query, record)
            self.commit()

            logger.info(
                f"[DB] ✅ Saved grading result for submission_id={record['submission_id']}, "
                f"question_number={record['question_number']}"
            )
            return True

        except Exception as e:
            logger.error(
                f"[DB] ❌ Failed to save grading result for submission_id={record.get('submission_id') if isinstance(record, dict) else getattr(record, 'submission_id', 'unknown')}, "
                f"question_number={record.get('question_number') if isinstance(record, dict) else getattr(record, 'question_number', 'unknown')}: {e}",
                exc_info=True
            )
            self.conn.rollback()
            return False

    # ---------------------------------------------------------
    # BULK INSERT / UPDATE
    # ---------------------------------------------------------
    def save_multiple_results(self, records: List[Union[Dict[str, Any], Any]]) -> int:
        """
        Save multiple grading results efficiently in one transaction.
        Returns the number of successful inserts/updates.
        """
        if not records:
            logger.warning("[DB] ⚠️ No grading records to save.")
            return 0

        success_count = 0
        try:
            for record in records:
                if self.save_result_record(record):
                    success_count += 1
            self.commit()
            logger.info(f"[DB] ✅ Saved {success_count}/{len(records)} grading results.")
            return success_count
        except Exception as e:
            logger.error(f"[DB] ❌ Failed to save multiple grading results: {e}", exc_info=True)
            self.conn.rollback()
            return 0

    # ---------------------------------------------------------
    # FETCH RESULTS
    # ---------------------------------------------------------
    def get_results_by_submission(self, submission_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all grading results for a given submission_id.
        """
        if not submission_id:
            logger.warning("[DB] ⚠️ Missing submission_id for result fetch.")
            return []

        try:
            self.cursor.execute("""
                SELECT 
                    submission_id,
                    question_number,
                    score,
                    max_marks,
                    feedback,
                    grading_method,
                    similarity_score,
                    context_used
                FROM grading_result
                WHERE submission_id = %s
                ORDER BY question_number;
            """, (submission_id,))

            rows = self.cursor.fetchall()
            results = [
                {
                    "submission_id": r[0],
                    "question_number": r[1],
                    "score": float(r[2]) if r[2] is not None else None,
                    "max_marks": float(r[3]) if r[3] is not None else None,
                    "feedback": r[4],
                    "grading_method": r[5],
                    "similarity_score": float(r[6]) if r[6] is not None else None,
                    "context_used": r[7],
                }
                for r in rows
            ]
            return results

        except Exception as e:
            logger.error(f"[DB] ❌ Failed to fetch results for submission_id={submission_id}: {e}", exc_info=True)
            self.conn.rollback()
            return []

    # ---------------------------------------------------------
    # DELETE RESULTS
    # ---------------------------------------------------------
    def delete_results_by_submission(self, submission_id: str) -> bool:
        """
        Delete all grading results for a given submission_id.
        """
        try:
            self.cursor.execute("DELETE FROM grading_result WHERE submission_id = %s;", (submission_id,))
            affected = self.cursor.rowcount
            self.commit()
            logger.info(f"[DB] 🗑️ Deleted {affected} results for submission_id={submission_id}")
            return True
        except Exception as e:
            logger.error(f"[DB] ❌ Failed to delete results for submission_id={submission_id}: {e}", exc_info=True)
            self.conn.rollback()
            return False
