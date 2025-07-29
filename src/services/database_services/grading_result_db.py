

# import logging
# from .base_relational_db import BaseRelationalDB
# from ...models.grading_result import GradingResult, GradingMethod

# log = logging.getLogger(__name__)

# class GradingResultDB(BaseRelationalDB):
#     """
#     Inserts / queries per-question marks and paper-level totals.
#     """

#     def __init__(self):
#         super().__init__()
#         self._create_tables()

#     # ───────────────────────────────────────────────────────────
#     def _create_tables(self):
#         self.cursor.execute("""
#         CREATE TABLE IF NOT EXISTS graded_student_answers (
#             id                 SERIAL PRIMARY KEY,
#             student_index      TEXT,
#             module_code        TEXT,
#             exam_year          INT,
#             exam_month         TEXT,
#             full_question_id   TEXT,
#             mark               FLOAT,
#             max_marks          FLOAT,
#             reason             TEXT,
#             model_name         TEXT,
#             graded_at          TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
#         );

#         CREATE TABLE IF NOT EXISTS student_paper_results (
#             id             SERIAL PRIMARY KEY,
#             student_index  TEXT,
#             module_code    TEXT,
#             exam_year      INT,
#             exam_month     TEXT,
#             total_marks    FLOAT,
#             total_possible FLOAT,
#             model_name     TEXT,
#             graded_at      TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month)
#         );
#         """)
#         self.commit()

#         # Patch columns if missing
#         self._add_missing_column("graded_student_answers", "model_name", "TEXT")
#         self._add_missing_column("student_paper_results", "model_name", "TEXT")

#     # ───────────────────────────────────────────────────────────
#     def _add_missing_column(self, table: str, column: str, definition: str):
#         self.cursor.execute(f"""
#             SELECT column_name
#             FROM information_schema.columns
#             WHERE table_name = %s AND column_name = %s;
#         """, (table, column))
#         exists = self.cursor.fetchone()
#         if not exists:
#             log.warning(f"Adding missing column '{column}' to table '{table}'...")
#             self.cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition};")
#             self.commit()

#     # ───────────────────────────────────────────────────────────
#     def save_question_mark(self, row: GradingResult):
#         self.cursor.execute("""
#         INSERT INTO graded_student_answers
#           (student_index,module_code,exam_year,exam_month,
#            full_question_id,mark,max_marks,reason,model_name,graded_at)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
#                       model_name=EXCLUDED.model_name, graded_at=NOW();
#         """, (
#             row.student_index, row.module_code, row.exam_year, row.exam_month,
#             row.full_question_id, row.mark, row.max_marks, row.reason, row.model_name
#         ))

#     # ───────────────────────────────────────────────────────────
#     def save_paper_total(self,
#                          student_index: str, module: str,
#                          year: int, month: str,
#                          total: float, possible: float,
#                          model_name: str):
#         self.cursor.execute("""
#         INSERT INTO student_paper_results
#           (student_index,module_code,exam_year,exam_month,
#            total_marks,total_possible,model_name,graded_at)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month)
#         DO UPDATE SET total_marks=EXCLUDED.total_marks,
#                       total_possible=EXCLUDED.total_possible,
#                       model_name=EXCLUDED.model_name,
#                       graded_at=NOW();
#         """, (student_index, module, year, month, total, possible, model_name))


# import logging
# from .base_relational_db import BaseRelationalDB
# from ...models.grading_result import GradingResult, GradingMethod

# log = logging.getLogger(__name__)

# class GradingResultDB(BaseRelationalDB):
#     """
#     Inserts / queries per-question marks and paper-level totals.
#     """

#     def __init__(self):
#         super().__init__()
#         self._create_tables()

#     # ───────────────────────────────────────────────────────────
#     def _create_tables(self):
#         self.cursor.execute("""
#         CREATE TABLE IF NOT EXISTS graded_student_answers (
#             id                 SERIAL PRIMARY KEY,
#             student_index      TEXT,
#             module_code        TEXT,
#             exam_year          INT,
#             exam_month         TEXT,
#             full_question_id   TEXT,
#             mark               FLOAT,           -- changed from INT
#             max_marks          FLOAT,           -- changed from INT
#             reason             TEXT,
#             graded_at          TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
#         );

#         CREATE TABLE IF NOT EXISTS student_paper_results (
#             id             SERIAL PRIMARY KEY,
#             student_index  TEXT,
#             module_code    TEXT,
#             exam_year      INT,
#             exam_month     TEXT,
#             total_marks    FLOAT,               -- changed from INT
#             total_possible FLOAT,               -- changed from INT
#             graded_at      TIMESTAMP DEFAULT NOW(),
#             UNIQUE (student_index,module_code,exam_year,exam_month)
#         );
#         """)
#         self.commit()

#     # ───────────────────────────────────────────────────────────
#     def save_question_mark(self, row: GradingResult):
#         self.cursor.execute("""
#         INSERT INTO graded_student_answers
#           (student_index,module_code,exam_year,exam_month,
#            full_question_id,mark,max_marks,reason,graded_at)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
#                       graded_at=NOW();
#         """, (
#             row.student_index, row.module_code, row.exam_year, row.exam_month,
#             row.full_question_id, row.mark, row.max_marks, row.reason
#         ))

#     # ───────────────────────────────────────────────────────────
#     def save_paper_total(self,
#                          student_index: str, module: str,
#                          year: int, month: str,
#                          total: float, possible: float):  # updated type hints too
#         self.cursor.execute("""
#         INSERT INTO student_paper_results
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
    Inserts / queries per-question marks and paper-level totals.
    """

    def __init__(self, provider_suffix: str = ""):
        super().__init__()

        suffix_map = {
            "openai": "_openai",
            "googlegemini": "_gemini"
        }

        normalized = provider_suffix.strip().lower()
        suffix = suffix_map.get(normalized, "")

        self.answers_table = f"graded_student_answers{suffix}"
        self.paper_table = f"student_paper_results{suffix}"

        log.info(f"[DB] Using grading tables: {self.answers_table}, {self.paper_table}")
        print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")  # Optional DEBUG

        self._create_tables()

    # ───────────────────────────────────────────────────────────
    def _create_tables(self):
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
            is_null_answer     BOOLEAN DEFAULT FALSE,  -- Added for null answers
            UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
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
            UNIQUE (student_index,module_code,exam_year,exam_month)
        );
        """)
        self.commit()

    # ───────────────────────────────────────────────────────────
    def save_question_mark(self, row: GradingResult):
        self.cursor.execute(f"""
        INSERT INTO {self.answers_table}
          (student_index,module_code,exam_year,exam_month,
           full_question_id,mark,max_marks,reason,graded_at,is_null_answer)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id)
        DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
                      graded_at=NOW(), is_null_answer=EXCLUDED.is_null_answer;
        """, (
            row.student_index, row.module_code, row.exam_year, row.exam_month,
            row.full_question_id, row.mark, row.max_marks, row.reason,
            getattr(row, 'is_null_answer', False)
        ))

    # ───────────────────────────────────────────────────────────
    def save_paper_total(self,
                         student_index: str, module: str,
                         year: int, month: str,
                         total: float, possible: float):
        self.cursor.execute(f"""
        INSERT INTO {self.paper_table}
          (student_index,module_code,exam_year,exam_month,
           total_marks,total_possible,graded_at)
        VALUES (%s,%s,%s,%s,%s,%s,NOW())
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month)
        DO UPDATE SET total_marks=EXCLUDED.total_marks,
                      total_possible=EXCLUDED.total_possible,
                      graded_at=NOW();
        """, (student_index, module, year, month, total, possible))

    # ───────────────────────────────────────────────────────────
    # NEW METHODS FOR NULL ANSWER HANDLING
    # ───────────────────────────────────────────────────────────
    
    def get_grade_by_ids(self, student_index: str, module_code: str, exam_year: int, 
                         exam_month: str, full_question_id: str):
        """Check if grade exists for given IDs"""
        self.cursor.execute("""
        SELECT id FROM graded_student_answers 
        WHERE student_index=%s AND module_code=%s AND exam_year=%s 
        AND exam_month=%s AND full_question_id=%s
        """, (student_index, module_code, exam_year, exam_month, full_question_id))
        return self.cursor.fetchone()

    def insert_null_answer_grade(self, student_index: str, module_code: str, 
                                exam_year: int, exam_month: str, 
                                full_question_id: str, max_marks: float):
        """Insert grade for null answer"""
        self.cursor.execute("""
        INSERT INTO graded_student_answers
          (student_index, module_code, exam_year, exam_month,
           full_question_id, mark, max_marks, reason, graded_at, is_null_answer)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id)
        DO UPDATE SET mark=0, reason='No answer provided', 
                      graded_at=NOW(), is_null_answer=TRUE;
        """, (
            student_index, module_code, exam_year, exam_month,
            full_question_id, 0.0, max_marks, "No answer provided", True
        ))

    def sync_null_answer_grades(self, module_code: str = None, year: int = None, month: str = None):
        """
        Find student answers that don't have grades (null answers) and add them with grade 0
        """
        from .student_answer_db import StudentAnswerService
        
        student_service = StudentAnswerService()
        student_service.initialize_table()
        
        # Get all student answers grouped by student
        all_grouped_answers = student_service.get_all_answers_grouped(module_code, year, month)
        
        synced_count = 0
        
        for (student_index, mod_code, yr, mon), answers_list in all_grouped_answers.items():
            for answer_record in answers_list:
                # Check if grade already exists for this answer
                existing_grade = self.get_grade_by_ids(
                    answer_record.student_index,
                    answer_record.module_code, 
                    answer_record.exam_year,
                    answer_record.exam_month,
                    answer_record.full_question_id
                )
                
                # If no grade exists and answer is null/empty, add grade 0
                if not existing_grade and (
                    answer_record.answer_text is None or 
                    answer_record.answer_text.strip() == "" or
                    answer_record.answer_text.lower().strip() in ["", "null", "none"]
                ):
                    # Get max_marks for this question
                    max_marks = self._get_max_marks_for_question(answer_record.full_question_id)
                    
                    self.insert_null_answer_grade(
                        student_index=answer_record.student_index,
                        module_code=answer_record.module_code,
                        exam_year=answer_record.exam_year,
                        exam_month=answer_record.exam_month,
                        full_question_id=answer_record.full_question_id,
                        max_marks=max_marks
                    )
                    synced_count += 1
        
        self.commit()
        return synced_count

    def _get_max_marks_for_question(self, full_question_id: str) -> float:
        """
        Get max marks for a question. You'll need to implement this based on 
        how you store question marks in your system.
        For now, returning a default value.
        """
        # TODO: Implement based on your question bank structure
        # This might query a questions table or use a default mapping
        return 10.0  # Default max marks - adjust based on your needs