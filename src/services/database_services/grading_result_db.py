

# # import logging
# # from .base_relational_db import BaseRelationalDB
# # from ...models.grading_result import GradingResult, GradingMethod

# # log = logging.getLogger(__name__)

# # class GradingResultDB(BaseRelationalDB):
# #     """
# #     Inserts / queries per-question marks and paper-level totals.
# #     """

# #     def __init__(self):
# #         super().__init__()
# #         self._create_tables()

# #     # ───────────────────────────────────────────────────────────
# #     def _create_tables(self):
# #         self.cursor.execute("""
# #         CREATE TABLE IF NOT EXISTS graded_student_answers (
# #             id                 SERIAL PRIMARY KEY,
# #             student_index      TEXT,
# #             module_code        TEXT,
# #             exam_year          INT,
# #             exam_month         TEXT,
# #             full_question_id   TEXT,
# #             mark               FLOAT,
# #             max_marks          FLOAT,
# #             reason             TEXT,
# #             model_name         TEXT,
# #             graded_at          TIMESTAMP DEFAULT NOW(),
# #             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
# #         );

# #         CREATE TABLE IF NOT EXISTS student_paper_results (
# #             id             SERIAL PRIMARY KEY,
# #             student_index  TEXT,
# #             module_code    TEXT,
# #             exam_year      INT,
# #             exam_month     TEXT,
# #             total_marks    FLOAT,
# #             total_possible FLOAT,
# #             model_name     TEXT,
# #             graded_at      TIMESTAMP DEFAULT NOW(),
# #             UNIQUE (student_index,module_code,exam_year,exam_month)
# #         );
# #         """)
# #         self.commit()

# #         # Patch columns if missing
# #         self._add_missing_column("graded_student_answers", "model_name", "TEXT")
# #         self._add_missing_column("student_paper_results", "model_name", "TEXT")

# #     # ───────────────────────────────────────────────────────────
# #     def _add_missing_column(self, table: str, column: str, definition: str):
# #         self.cursor.execute(f"""
# #             SELECT column_name
# #             FROM information_schema.columns
# #             WHERE table_name = %s AND column_name = %s;
# #         """, (table, column))
# #         exists = self.cursor.fetchone()
# #         if not exists:
# #             log.warning(f"Adding missing column '{column}' to table '{table}'...")
# #             self.cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition};")
# #             self.commit()

# #     # ───────────────────────────────────────────────────────────
# #     def save_question_mark(self, row: GradingResult):
# #         self.cursor.execute("""
# #         INSERT INTO graded_student_answers
# #           (student_index,module_code,exam_year,exam_month,
# #            full_question_id,mark,max_marks,reason,model_name,graded_at)
# #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
# #         ON CONFLICT
# #           (student_index,module_code,exam_year,exam_month,full_question_id)
# #         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
# #                       model_name=EXCLUDED.model_name, graded_at=NOW();
# #         """, (
# #             row.student_index, row.module_code, row.exam_year, row.exam_month,
# #             row.full_question_id, row.mark, row.max_marks, row.reason, row.model_name
# #         ))

# #     # ───────────────────────────────────────────────────────────
# #     def save_paper_total(self,
# #                          student_index: str, module: str,
# #                          year: int, month: str,
# #                          total: float, possible: float,
# #                          model_name: str):
# #         self.cursor.execute("""
# #         INSERT INTO student_paper_results
# #           (student_index,module_code,exam_year,exam_month,
# #            total_marks,total_possible,model_name,graded_at)
# #         VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())
# #         ON CONFLICT
# #           (student_index,module_code,exam_year,exam_month)
# #         DO UPDATE SET total_marks=EXCLUDED.total_marks,
# #                       total_possible=EXCLUDED.total_possible,
# #                       model_name=EXCLUDED.model_name,
# #                       graded_at=NOW();
# #         """, (student_index, module, year, month, total, possible, model_name))


# import logging
# from .base_relational_db import BaseRelationalDB
# from ...models.grading_result import GradingResult

# log = logging.getLogger(__name__)

# class GradingResultDB(BaseRelationalDB):
#     """
#     Inserts / queries per-question marks and paper-level totals.
#     """

#     def __init__(self, provider_suffix: str = ""):
#         super().__init__()

#         suffix_map = {
#             "openai": "_openai",
#             "googlegemini": "_gemini"
#         }

#         normalized = provider_suffix.strip().lower()
#         suffix = suffix_map.get(normalized, "")

#         self.answers_table = f"graded_student_answers{suffix}"
#         self.paper_table = f"student_paper_results{suffix}"

#         log.info(f"[DB] Using grading tables: {self.answers_table}, {self.paper_table}")
#         print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")  # Optional DEBUG

#         self._create_tables()

#     # ───────────────────────────────────────────────────────────
#     def _create_tables(self):
#         self.cursor.execute(f"""
#         CREATE TABLE IF NOT EXISTS {self.answers_table} (
#             id                 SERIAL PRIMARY KEY,
#             student_index      TEXT,
#             module_code        TEXT,
#             exam_year          INT,
#             exam_month         TEXT,
#             full_question_id   TEXT,
#             mark               FLOAT,
#             max_marks          FLOAT,
#             reason             TEXT,
#             graded_at          TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
#         );

#         CREATE TABLE IF NOT EXISTS {self.paper_table} (
#             id             SERIAL PRIMARY KEY,
#             student_index  TEXT,
#             module_code    TEXT,
#             exam_year      INT,
#             exam_month     TEXT,
#             total_marks    FLOAT,
#             total_possible FLOAT,
#             graded_at      TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month)
#         );
#         """)
#         self.commit()

#     # ───────────────────────────────────────────────────────────
#     def save_question_mark(self, row: GradingResult):
#         self.cursor.execute(f"""
#         INSERT INTO {self.answers_table}
#           (student_index,module_code,exam_year,exam_month,
#            full_question_id,mark,max_marks,reason,graded_at)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
#                       graded_at=NOW();
#         """, (
#             row.student_index, row.module_code, row.exam_year, row.exam_month,
#             row.full_question_id, row.score, row.max_marks, row.feedback
#         ))

#     # ───────────────────────────────────────────────────────────
#     def save_paper_total(self,
#                          student_index: str, module: str,
#                          year: int, month: str,
#                          total: float, possible: float):
#         self.cursor.execute(f"""
#         INSERT INTO {self.paper_table}
#           (student_index,module_code,exam_year,exam_month,
#            total_marks,total_possible,graded_at)
#         VALUES (%s,%s,%s,%s,%s,%s,NOW())
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month)
#         DO UPDATE SET total_marks=EXCLUDED.total_marks,
#                       total_possible=EXCLUDED.total_possible,
#                       graded_at=NOW();
#         """, (student_index, module, year, month, total, possible))

import logging
from .base_relational_db import BaseRelationalDB
from ...models.grading_result import GradingResult

log = logging.getLogger(__name__)


class GradingResultDB(BaseRelationalDB):
    """
    Handles insertion and retrieval of per-question and per-paper grading results.
    Tables are dynamically chosen based on the provider suffix (e.g., '_openai', '_gemini').
    """

    def __init__(self, provider_suffix: str = ""):
        super().__init__()

        # Normalize suffix from provider name
        suffix_map = {
            "openai": "_openai",
            "googlegemini": "_gemini",
            "google_gemini": "_gemini",
            "gemini": "_gemini",
            "deepseek": "_deepseek",
            "localfinetuneddeepseek": "_localfinetuneddeepseek"
        }

        normalized = provider_suffix.strip().lower()
        suffix = suffix_map.get(normalized, "")

        self.answers_table = f"graded_student_answers{suffix}"
        self.paper_table = f"student_paper_results{suffix}"

        log.info(f"[DB] Using grading tables: {self.answers_table}, {self.paper_table}")
        print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")  # Optional debug

        self._create_tables()

    # ───────────────────────────────────────────────────────────
    def _create_tables(self):
        """Create required grading tables if they don't exist."""
        self.cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {self.answers_table} (
            id                 SERIAL PRIMARY KEY,
            student_index      TEXT,
            module_code        TEXT,
            exam_year          INT,
            exam_month         TEXT,
            full_question_id   TEXT,
            mark               FLOAT,
            max_marks          FLOAT,
            reason             TEXT,
            graded_at          TIMESTAMP DEFAULT NOW(),
            UNIQUE (student_index, module_code, exam_year, exam_month, full_question_id)
        );

        CREATE TABLE IF NOT EXISTS {self.paper_table} (
            id             SERIAL PRIMARY KEY,
            student_index  TEXT,
            module_code    TEXT,
            exam_year      INT,
            exam_month     TEXT,
            total_marks    FLOAT,
            total_possible FLOAT,
            graded_at      TIMESTAMP DEFAULT NOW(),
            UNIQUE (student_index, module_code, exam_year, exam_month)
        );
        """)
        self.commit()

    # ───────────────────────────────────────────────────────────
    def save_question_mark(self, row: GradingResult):
        """Insert or update a student's score for a specific question."""
        self.cursor.execute(f"""
        INSERT INTO {self.answers_table}
          (student_index, module_code, exam_year, exam_month,
           full_question_id, mark, max_marks, reason, graded_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (student_index, module_code, exam_year, exam_month, full_question_id)
        DO UPDATE SET mark = EXCLUDED.mark,
                      reason = EXCLUDED.reason,
                      graded_at = NOW();
        """, (
            row.student_index,
            row.module_code,
            row.exam_year,
            row.exam_month,
            row.full_question_id,
            row.score,
            row.max_marks,
            row.feedback
        ))

    # ───────────────────────────────────────────────────────────
    def save_paper_total(self,
                         student_index: str, module: str,
                         year: int, month: str,
                         total: float, possible: float):
        """Insert or update total marks for a student's full paper."""
        self.cursor.execute(f"""
        INSERT INTO {self.paper_table}
          (student_index, module_code, exam_year, exam_month,
           total_marks, total_possible, graded_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (student_index, module_code, exam_year, exam_month)
        DO UPDATE SET total_marks = EXCLUDED.total_marks,
                      total_possible = EXCLUDED.total_possible,
                      graded_at = NOW();
        """, (
            student_index,
            module,
            year,
            month,
            total,
            possible
        ))
