import logging
from typing import List, Dict, Any, Union, Optional
from dataclasses import asdict, is_dataclass
from .base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)


class GradingResultDB(BaseRelationalDB):
    """
    Database service class for managing grading results.
    Each AI model has its own grading_result_<ai_model> table.
    Supports optional suffix tables such as:
      - grading_result_openai_rag
      - grading_result_gemini_2_0_flash_rag
    """

    # ---------------------------------------------------------
    # INIT
    # ---------------------------------------------------------
    def __init__(self, ai_model: str = "openai"):
        super().__init__()
        # Normalize model string for safe SQL naming
        self.ai_model = ai_model.lower().replace("-", "_").replace(".", "_").replace(":", "_")
        self.table_name = f"grading_result_{self.ai_model}"
        self._ensure_table_exists(self.table_name)

    # ---------------------------------------------------------
    # TABLE CREATION (AUTO)
    # ---------------------------------------------------------
    def _ensure_table_exists(self, table_name: str):
        """Create grading result table if it doesn't exist."""
        try:
            create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
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
                CONSTRAINT unique_submission_question_{table_name}
                    UNIQUE (submission_id, question_number)
            );
            """
            self.cursor.execute(create_table_query)
            self.conn.commit()
            logger.info(f"[DB] ✅ Verified/created table: {table_name}")
        except Exception as e:
            logger.error(f"[DB] ❌ Failed to create table {table_name}: {e}", exc_info=True)
            self.conn.rollback()
            raise

    # ---------------------------------------------------------
    # INSERT OR UPDATE SINGLE RESULT
    # ---------------------------------------------------------
    def save_result_record(self, record: Union[Dict[str, Any], Any], suffix: Optional[str] = None) -> bool:
        """
        Save a single grading result.
        Automatically creates suffix-based table if needed (e.g., <table>_rag).
        """
        table_name = f"{self.table_name}_{suffix}" if suffix else self.table_name
        self._ensure_table_exists(table_name)

        try:
            # Convert dataclass or object to dict
            if is_dataclass(record):
                record = asdict(record)
            elif not isinstance(record, dict):
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

            # Validate essential fields
            if not record.get("submission_id") or not record.get("question_number"):
                logger.warning("[DB] ⚠️ Missing submission_id or question_number, skipping record.")
                return False

            query = f"""
                INSERT INTO {table_name} (
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
                f"[DB] ✅ Saved result in {table_name} "
                f"for submission_id={record['submission_id']}, question_number={record['question_number']}"
            )
            return True

        except Exception as e:
            logger.error(
                f"[DB] ❌ Failed to save result in {table_name} for "
                f"submission_id={record.get('submission_id', 'unknown')}, "
                f"question_number={record.get('question_number', 'unknown')}: {e}",
                exc_info=True
            )
            self.rollback()
            return False

    # ---------------------------------------------------------
    # BULK SAVE RESULTS
    # ---------------------------------------------------------
    def save_multiple_results(self, records: List[Union[Dict[str, Any], Any]], suffix: Optional[str] = None) -> int:
        """Save multiple grading results efficiently."""
        if not records:
            logger.warning(f"[DB] ⚠️ No grading records to save in {self.table_name}.")
            return 0

        success_count = 0
        for record in records:
            if self.save_result_record(record, suffix=suffix):
                success_count += 1

        logger.info(
            f"[DB] ✅ Saved {success_count}/{len(records)} records in {self.table_name}{'_' + suffix if suffix else ''}."
        )
        return success_count

    # ---------------------------------------------------------
    # FETCH RESULTS
    # ---------------------------------------------------------
    def get_results_by_submission(self, submission_id: str, suffix: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch all grading results for a specific submission ID."""
        if not submission_id:
            logger.warning("[DB] ⚠️ Missing submission_id for fetch.")
            return []

        table_name = f"{self.table_name}_{suffix}" if suffix else self.table_name
        self._ensure_table_exists(table_name)

        try:
            self.cursor.execute(f"""
                SELECT 
                    submission_id,
                    question_number,
                    score,
                    max_marks,
                    feedback,
                    grading_method,
                    similarity_score,
                    context_used,
                    updated_at
                FROM {table_name}
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
                    "updated_at": r[8],
                }
                for r in rows
            ]

            logger.info(f"[DB] ✅ Retrieved {len(results)} grading results for submission_id={submission_id}")
            return results

        except Exception as e:
            logger.error(f"[DB] ❌ Failed to fetch results from {table_name} for submission_id={submission_id}: {e}", exc_info=True)
            self.rollback()
            return []

    # ---------------------------------------------------------
    # DELETE RESULTS
    # ---------------------------------------------------------
    def delete_results_by_submission(self, submission_id: str, suffix: Optional[str] = None) -> bool:
        """Delete all grading results for a submission."""
        if not submission_id:
            logger.warning("[DB] ⚠️ Missing submission_id for deletion.")
            return False

        table_name = f"{self.table_name}_{suffix}" if suffix else self.table_name
        self._ensure_table_exists(table_name)

        try:
            self.cursor.execute(f"DELETE FROM {table_name} WHERE submission_id = %s;", (submission_id,))
            affected = self.cursor.rowcount
            self.commit()
            logger.info(f"[DB] 🗑️ Deleted {affected} results from {table_name} for submission_id={submission_id}")
            return True
        except Exception as e:
            logger.error(f"[DB] ❌ Failed to delete results from {table_name} for submission_id={submission_id}: {e}", exc_info=True)
            self.rollback()
            return False

    # ---------------------------------------------------------
    # DB WRAPPERS
    # ---------------------------------------------------------
    def commit(self):
        """Safely commit."""
        try:
            self.conn.commit()
        except Exception as e:
            logger.error(f"[DB] ❌ Commit failed: {e}", exc_info=True)
            self.conn.rollback()

    def rollback(self):
        """Safely rollback."""
        try:
            self.conn.rollback()
        except Exception as e:
            logger.error(f"[DB] ❌ Rollback failed: {e}", exc_info=True)
