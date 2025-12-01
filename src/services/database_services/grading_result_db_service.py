import logging
from typing import List, Dict, Any, Union
from dataclasses import asdict, is_dataclass
from enum import Enum

from .base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)


class GradingResultDB(BaseRelationalDB):
    """
    Database service class for the Prisma model Grading_Results.
    """

    def __init__(self):
        super().__init__()
        self.table_name = '"Grading_Results"'
        self._ensure_table_exists()

    def rollback(self):
        """Rollback wrapper."""
        try:
            self.conn.rollback()
        except Exception as e:
            logger.error(f"[DB] ❌ Rollback failed: {e}", exc_info=True)

    # ---------------------------------------------------------
    # CREATE TABLE with correct UNIQUE key and FK mappings
    # ---------------------------------------------------------
    def _ensure_table_exists(self):
        try:
            query = f"""
            CREATE TABLE IF NOT EXISTS {self.table_name} (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                model_id VARCHAR NOT NULL,
                submission_id VARCHAR NOT NULL,
                student_answer_id VARCHAR NOT NULL,
                question_number VARCHAR NOT NULL,
                question_id VARCHAR,
                score DECIMAL(5,2),
                max_marks DECIMAL(5,2),
                feedback TEXT NOT NULL,
                grading_method VARCHAR,
                similarity_score DECIMAL(5,4),
                context_used TEXT,
                created_on TIMESTAMPTZ(6) DEFAULT NOW(),
                updated_on TIMESTAMPTZ(6) DEFAULT NOW(),

                CONSTRAINT fk_grading_model
                    FOREIGN KEY (model_id) REFERENCES "Evaluation_Model"(id),

                CONSTRAINT fk_grading_submission
                    FOREIGN KEY (submission_id) REFERENCES "Submission"(submission_id),

                CONSTRAINT fk_grading_answer
                    FOREIGN KEY (student_answer_id) REFERENCES "Student_Answer"(id),

                CONSTRAINT fk_grading_question
                    FOREIGN KEY (question_id) REFERENCES "Question"(id),

                CONSTRAINT unique_grading UNIQUE (submission_id, question_number, model_id)
            );
            """

            self.cursor.execute(query)
            self.conn.commit()
            logger.info("[DB] ✅ Grading_Results table verified/created.")

        except Exception as e:
            logger.error(f"[DB] ❌ Failed to create Grading_Results: {e}", exc_info=True)
            self.conn.rollback()

    # ---------------------------------------------------------
    # INSERT or UPDATE with correct ON CONFLICT
    # ---------------------------------------------------------
    def save_result(self, record: Union[Dict[str, Any], Any]) -> bool:

        if is_dataclass(record):
            record = asdict(record)
        elif not isinstance(record, dict):
            record = record.__dict__

        # Convert enum fields to values
        for key, value in record.items():
            if isinstance(value, Enum):
                record[key] = value.value

        required_fields = [
            "model_id",
            "submission_id",
            "student_answer_id",
            "question_number"
        ]

        for f in required_fields:
            if not record.get(f):
                logger.error(f"[DB] ❌ Missing required field: {f}")
                return False

        try:
            query = f"""
            INSERT INTO {self.table_name} (
                model_id,
                submission_id,
                student_answer_id,
                question_number,
                question_id,
                score,
                max_marks,
                feedback,
                grading_method,
                similarity_score,
                context_used
            )
            VALUES (
                %(model_id)s,
                %(submission_id)s,
                %(student_answer_id)s,
                %(question_number)s,
                %(question_id)s,
                %(score)s,
                %(max_marks)s,
                %(feedback)s,
                %(grading_method)s,
                %(similarity_score)s,
                %(context_used)s
            )
            ON CONFLICT (submission_id, question_number, model_id)
            DO UPDATE SET
                score = EXCLUDED.score,
                max_marks = EXCLUDED.max_marks,
                feedback = EXCLUDED.feedback,
                grading_method = EXCLUDED.grading_method,
                similarity_score = EXCLUDED.similarity_score,
                context_used = EXCLUDED.context_used,
                question_id = EXCLUDED.question_id,
                updated_on = NOW();
            """

            self.cursor.execute(query, record)
            self.commit()

            logger.info(
                f"[DB] ✅ Saved grading result: submission={record['submission_id']} "
                f"question={record['question_number']}"
            )
            return True

        except Exception as e:
            logger.error(f"[DB] ❌ Failed to save grading result: {e}", exc_info=True)
            self.rollback()
            return False

    # ---------------------------------------------------------
    # SAVE MULTIPLE
    # ---------------------------------------------------------
    def save_multiple(self, records: List[Dict[str, Any]]) -> int:
        count = 0
        for r in records:
            if self.save_result(r):
                count += 1
        return count

    # ---------------------------------------------------------
    # FETCH BY SUBMISSION
    # ---------------------------------------------------------
    def get_results_by_submission(self, submission_id: str) -> List[Dict[str, Any]]:
        try:
            query = f"""
            SELECT 
                id,
                model_id,
                submission_id,
                student_answer_id,
                question_number,
                question_id,
                score,
                max_marks,
                feedback,
                grading_method,
                similarity_score,
                context_used,
                created_on,
                updated_on
            FROM {self.table_name}
            WHERE submission_id = %s
            ORDER BY question_number ASC;
            """

            self.cursor.execute(query, (submission_id,))
            rows = self.cursor.fetchall()

            return [
                {
                    "id": r[0],
                    "model_id": r[1],
                    "submission_id": r[2],
                    "student_answer_id": r[3],
                    "question_number": r[4],
                    "question_id": r[5],
                    "score": float(r[6]) if r[6] else None,
                    "max_marks": float(r[7]) if r[7] else None,
                    "feedback": r[8],
                    "grading_method": r[9],
                    "similarity_score": float(r[10]) if r[10] else None,
                    "context_used": r[11],
                    "created_on": r[12],
                    "updated_on": r[13],
                }
                for r in rows
            ]

        except Exception as e:
            logger.error(f"[DB] ❌ Fetch failed: {e}", exc_info=True)
            return []

    # ---------------------------------------------------------
    # DELETE BY SUBMISSION
    # ---------------------------------------------------------
    def delete_by_submission(self, submission_id: str) -> bool:
        try:
            self.cursor.execute(
                f"DELETE FROM {self.table_name} WHERE submission_id = %s;",
                (submission_id,)
            )
            self.commit()
            return True

        except Exception as e:
            logger.error(f"[DB] ❌ Delete failed: {e}", exc_info=True)
            self.rollback()
            return False
