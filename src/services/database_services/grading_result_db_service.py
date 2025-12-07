import logging
from typing import List, Dict, Any, Union
from dataclasses import asdict, is_dataclass
from enum import Enum

from .base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)


class GradingResultDB(BaseRelationalDB):
    """
    Database service class for model Grading_Results.
    """

    def __init__(self):
        super().__init__()
        self.table_name = '"Grading_Results"'
        self._ensure_table_exists()

    def rollback(self):
        try:
            self.conn.rollback()
        except Exception as e:
            logger.error(f"[DB] ❌ Rollback failed: {e}", exc_info=True)

    # ---------------------------------------------------------
    # CREATE TABLE — aligned 100% with Prisma schema
    # ---------------------------------------------------------
    def _ensure_table_exists(self):
        try:
            query = f"""
CREATE TABLE IF NOT EXISTS {self.table_name} (
    model_id VARCHAR NOT NULL,
    submission_id VARCHAR NOT NULL,
    student_answer_id VARCHAR NOT NULL,

    question_id VARCHAR,
    question_number VARCHAR,

    score DECIMAL(5,2),
    max_marks DECIMAL(5,2),
    feedback TEXT,
    grading_method VARCHAR,
    similarity_score DECIMAL(5,4),
    context_used TEXT,

    created_on TIMESTAMPTZ(6) DEFAULT NOW(),
    updated_on TIMESTAMPTZ(6) DEFAULT NOW(),

    CONSTRAINT pk_grading PRIMARY KEY (model_id, submission_id, student_answer_id),

    CONSTRAINT fk_grading_model
        FOREIGN KEY (model_id) REFERENCES "Evaluation_Model"(id) ON DELETE CASCADE,

    CONSTRAINT fk_grading_submission
        FOREIGN KEY (submission_id) REFERENCES "Submission"(submission_id) ON DELETE CASCADE,

    CONSTRAINT fk_grading_answer
        FOREIGN KEY (student_answer_id) REFERENCES "Student_Answer"(id) ON DELETE CASCADE,

    CONSTRAINT fk_grading_question
        FOREIGN KEY (question_id) REFERENCES "Question"(id) ON DELETE SET NULL
);
"""
            self.cursor.execute(query)
            self.conn.commit()
            logger.info("[DB] ✅ Grading_Results table verified/created.")

        except Exception as e:
            logger.error(f"[DB] ❌ Failed to create Grading_Results: {e}", exc_info=True)
            self.conn.rollback()

    # ---------------------------------------------------------
    # INSERT or UPDATE — based on composite PK
    # ---------------------------------------------------------
    def save_result(self, record: Union[Dict[str, Any], Any]) -> bool:
        if is_dataclass(record):
            record = asdict(record)
        elif not isinstance(record, dict):
            record = record.__dict__

        # Convert enums → string values
        for key, value in record.items():
            if isinstance(value, Enum):
                record[key] = value.value

        required_fields = ["model_id", "submission_id", "student_answer_id"]

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
            ON CONFLICT (model_id, submission_id, student_answer_id)
            DO UPDATE SET
                question_number = EXCLUDED.question_number,
                question_id = EXCLUDED.question_id,
                score = EXCLUDED.score,
                max_marks = EXCLUDED.max_marks,
                feedback = EXCLUDED.feedback,
                grading_method = EXCLUDED.grading_method,
                similarity_score = EXCLUDED.similarity_score,
                context_used = EXCLUDED.context_used,
                updated_on = NOW();
            """

            self.cursor.execute(query, record)
            self.commit()

            logger.info(
                f"[DB] ✅ Saved grading result: model={record['model_id']} "
                f"submission={record['submission_id']} answer={record['student_answer_id']}"
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
            ORDER BY question_number ASC NULLS LAST;
            """

            self.cursor.execute(query, (submission_id,))
            rows = self.cursor.fetchall()

            return [
                {
                    "model_id": r[0],
                    "submission_id": r[1],
                    "student_answer_id": r[2],
                    "question_number": r[3],
                    "question_id": r[4],
                    "score": float(r[5]) if r[5] is not None else None,
                    "max_marks": float(r[6]) if r[6] is not None else None,
                    "feedback": r[7],
                    "grading_method": r[8],
                    "similarity_score": float(r[9]) if r[9] is not None else None,
                    "context_used": r[10],
                    "created_on": r[11],
                    "updated_on": r[12],
                }
                for r in rows
            ]

        except Exception as e:
            logger.error(f"[DB] ❌ Fetch failed: {e}", exc_info=True)
            return []

    # ---------------------------------------------------------
    # DELETE
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
