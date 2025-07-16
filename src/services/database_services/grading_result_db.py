import logging
from .base_relational_db import BaseRelationalDB
from ...models.grading_result import GradingResult
# from ..models.grading_result import GradingResult
from ...models.grading_result import GradingResult, GradingMethod


log = logging.getLogger(__name__)


class GradingResultDB(BaseRelationalDB):
    """
    Inserts / queries per-question marks and paper-level totals.
    """

    def __init__(self):
        super().__init__()
        self._create_tables()

    # ───────────────────────────────────────────────────────────
    def _create_tables(self):
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS graded_student_answers (
            id                 SERIAL PRIMARY KEY,
            student_index      TEXT,
            module_code        TEXT,
            exam_year          INT,
            exam_month         TEXT,
            full_question_id   TEXT,
            mark               INT,
            max_marks          INT,
            reason             TEXT,
            graded_at          TIMESTAMP DEFAULT NOW(),
            UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
        );

        CREATE TABLE IF NOT EXISTS student_paper_results (
            id             SERIAL PRIMARY KEY,
            student_index  TEXT,
            module_code    TEXT,
            exam_year      INT,
            exam_month     TEXT,
            total_marks    INT,
            total_possible INT,
            graded_at      TIMESTAMP DEFAULT NOW(),
            UNIQUE (student_index,module_code,exam_year,exam_month)
        );
        """)
        self.commit()

    # ───────────────────────────────────────────────────────────
    def save_question_mark(self, row: GradingResult):
        self.cursor.execute("""
        INSERT INTO graded_student_answers
          (student_index,module_code,exam_year,exam_month,
           full_question_id,mark,max_marks,reason,graded_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id)
        DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
                      graded_at=NOW();
        """, (
            row.student_index, row.module_code, row.exam_year, row.exam_month,
            row.full_question_id, row.mark, row.max_marks, row.reason
        ))

    # ───────────────────────────────────────────────────────────
    def save_paper_total(self,
                         student_index: str, module: str,
                         year: int, month: str,
                         total: int, possible: int):
        self.cursor.execute("""
        INSERT INTO student_paper_results
          (student_index,module_code,exam_year,exam_month,
           total_marks,total_possible,graded_at)
        VALUES (%s,%s,%s,%s,%s,%s,NOW())
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month)
        DO UPDATE SET total_marks=EXCLUDED.total_marks,
                      total_possible=EXCLUDED.total_possible,
                      graded_at=NOW();
        """, (student_index, module, year, month, total, possible))
