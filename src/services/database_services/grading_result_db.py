

# # # import logging
# # # from .base_relational_db import BaseRelationalDB
# # # from ...models.grading_result import GradingResult, GradingMethod

# # # log = logging.getLogger(__name__)

# # # class GradingResultDB(BaseRelationalDB):
# # #     """
# # #     Inserts / queries per-question marks and paper-level totals.
# # #     """

# # #     def __init__(self):
# # #         super().__init__()
# # #         self._create_tables()

# # #     # ───────────────────────────────────────────────────────────
# # #     def _create_tables(self):
# # #         self.cursor.execute("""
# # #         CREATE TABLE IF NOT EXISTS graded_student_answers (
# # #             id                 SERIAL PRIMARY KEY,
# # #             student_index      TEXT,
# # #             module_code        TEXT,
# # #             exam_year          INT,
# # #             exam_month         TEXT,
# # #             full_question_id   TEXT,
# # #             mark               FLOAT,
# # #             max_marks          FLOAT,
# # #             reason             TEXT,
# # #             model_name         TEXT,
# # #             graded_at          TIMESTAMP DEFAULT NOW(),
# # #             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
# # #         );

# # #         CREATE TABLE IF NOT EXISTS student_paper_results (
# # #             id             SERIAL PRIMARY KEY,
# # #             student_index  TEXT,
# # #             module_code    TEXT,
# # #             exam_year      INT,
# # #             exam_month     TEXT,
# # #             total_marks    FLOAT,
# # #             total_possible FLOAT,
# # #             model_name     TEXT,
# # #             graded_at      TIMESTAMP DEFAULT NOW(),
# # #             UNIQUE (student_index,module_code,exam_year,exam_month)
# # #         );
# # #         """)
# # #         self.commit()

# # #         # Patch columns if missing
# # #         self._add_missing_column("graded_student_answers", "model_name", "TEXT")
# # #         self._add_missing_column("student_paper_results", "model_name", "TEXT")

# # #     # ───────────────────────────────────────────────────────────
# # #     def _add_missing_column(self, table: str, column: str, definition: str):
# # #         self.cursor.execute(f"""
# # #             SELECT column_name
# # #             FROM information_schema.columns
# # #             WHERE table_name = %s AND column_name = %s;
# # #         """, (table, column))
# # #         exists = self.cursor.fetchone()
# # #         if not exists:
# # #             log.warning(f"Adding missing column '{column}' to table '{table}'...")
# # #             self.cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition};")
# # #             self.commit()

# # #     # ───────────────────────────────────────────────────────────
# # #     def save_question_mark(self, row: GradingResult):
# # #         self.cursor.execute("""
# # #         INSERT INTO graded_student_answers
# # #           (student_index,module_code,exam_year,exam_month,
# # #            full_question_id,mark,max_marks,reason,model_name,graded_at)
# # #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
# # #         ON CONFLICT
# # #           (student_index,module_code,exam_year,exam_month,full_question_id)
# # #         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
# # #                       model_name=EXCLUDED.model_name, graded_at=NOW();
# # #         """, (
# # #             row.student_index, row.module_code, row.exam_year, row.exam_month,
# # #             row.full_question_id, row.mark, row.max_marks, row.reason, row.model_name
# # #         ))

# # #     # ───────────────────────────────────────────────────────────
# # #     def save_paper_total(self,
# # #                          student_index: str, module: str,
# # #                          year: int, month: str,
# # #                          total: float, possible: float,
# # #                          model_name: str):
# # #         self.cursor.execute("""
# # #         INSERT INTO student_paper_results
# # #           (student_index,module_code,exam_year,exam_month,
# # #            total_marks,total_possible,model_name,graded_at)
# # #         VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())
# # #         ON CONFLICT
# # #           (student_index,module_code,exam_year,exam_month)
# # #         DO UPDATE SET total_marks=EXCLUDED.total_marks,
# # #                       total_possible=EXCLUDED.total_possible,
# # #                       model_name=EXCLUDED.model_name,
# # #                       graded_at=NOW();
# # #         """, (student_index, module, year, month, total, possible, model_name))


# # # import logging
# # # from .base_relational_db import BaseRelationalDB
# # # from ...models.grading_result import GradingResult, GradingMethod

# # # log = logging.getLogger(__name__)

# # # class GradingResultDB(BaseRelationalDB):
# # #     """
# # #     Inserts / queries per-question marks and paper-level totals.
# # #     """

# # #     def __init__(self):
# # #         super().__init__()
# # #         self._create_tables()

# # #     # ───────────────────────────────────────────────────────────
# # #     def _create_tables(self):
# # #         self.cursor.execute("""
# # #         CREATE TABLE IF NOT EXISTS graded_student_answers (
# # #             id                 SERIAL PRIMARY KEY,
# # #             student_index      TEXT,
# # #             module_code        TEXT,
# # #             exam_year          INT,
# # #             exam_month         TEXT,
# # #             full_question_id   TEXT,
# # #             mark               FLOAT,           -- changed from INT
# # #             max_marks          FLOAT,           -- changed from INT
# # #             reason             TEXT,
# # #             graded_at          TIMESTAMP DEFAULT NOW(),
# # #             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
# # #         );

# # #         CREATE TABLE IF NOT EXISTS student_paper_results (
# # #             id             SERIAL PRIMARY KEY,
# # #             student_index  TEXT,
# # #             module_code    TEXT,
# # #             exam_year      INT,
# # #             exam_month     TEXT,
# # #             total_marks    FLOAT,               -- changed from INT
# # #             total_possible FLOAT,               -- changed from INT
# # #             graded_at      TIMESTAMP DEFAULT NOW(),
# # #             UNIQUE (student_index,module_code,exam_year,exam_month)
# # #         );
# # #         """)
# # #         self.commit()

# # #     # ───────────────────────────────────────────────────────────
# # #     def save_question_mark(self, row: GradingResult):
# # #         self.cursor.execute("""
# # #         INSERT INTO graded_student_answers
# # #           (student_index,module_code,exam_year,exam_month,
# # #            full_question_id,mark,max_marks,reason,graded_at)
# # #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW())
# # #         ON CONFLICT
# # #           (student_index,module_code,exam_year,exam_month,full_question_id)
# # #         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
# # #                       graded_at=NOW();
# # #         """, (
# # #             row.student_index, row.module_code, row.exam_year, row.exam_month,
# # #             row.full_question_id, row.mark, row.max_marks, row.reason
# # #         ))

# # #     # ───────────────────────────────────────────────────────────
# # #     def save_paper_total(self,
# # #                          student_index: str, module: str,
# # #                          year: int, month: str,
# # #                          total: float, possible: float):  # updated type hints too
# # #         self.cursor.execute("""
# # #         INSERT INTO student_paper_results
# # #           (student_index,module_code,exam_year,exam_month,
# # #            total_marks,total_possible,graded_at)
# # #         VALUES (%s,%s,%s,%s,%s,%s,NOW())
# # #         ON CONFLICT
# # #           (student_index,module_code,exam_year,exam_month)
# # #         DO UPDATE SET total_marks=EXCLUDED.total_marks,
# # #                       total_possible=EXCLUDED.total_possible,
# # #                       graded_at=NOW();
# # #         """, (student_index, module, year, month, total, possible))


# # import logging
# # from .base_relational_db import BaseRelationalDB
# # from ...models.grading_result import GradingResult

# # log = logging.getLogger(__name__)

# # class GradingResultDB(BaseRelationalDB):
# #     """
# #     Inserts / queries per-question marks and paper-level totals.
# #     """

# #     def __init__(self, provider_suffix: str = ""):
# #         super().__init__()

# #         suffix_map = {
# #             "openai": "_openai",
# #             "googlegemini": "_gemini"
# #         }

# #         normalized = provider_suffix.strip().lower()
# #         suffix = suffix_map.get(normalized, "")

# #         self.answers_table = f"graded_student_answers{suffix}"
# #         self.paper_table = f"student_paper_results{suffix}"

# #         log.info(f"[DB] Using grading tables: {self.answers_table}, {self.paper_table}")
# #         print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")  # Optional DEBUG

# #         self._create_tables()

# #     # ───────────────────────────────────────────────────────────
# #     def _create_tables(self):
# #         self.cursor.execute(f"""
# #         CREATE TABLE IF NOT EXISTS {self.answers_table} (
# #             id                 SERIAL PRIMARY KEY,
# #             student_index      TEXT,
# #             module_code        TEXT,
# #             exam_year          INT,
# #             exam_month         TEXT,
# #             full_question_id   TEXT,
# #             mark               FLOAT,
# #             max_marks          FLOAT,
# #             reason             TEXT,
# #             graded_at          TIMESTAMP DEFAULT NOW(),
# #             is_null_answer     BOOLEAN DEFAULT FALSE,  -- Added for null answers
# #             UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id)
# #         );

# #         CREATE TABLE IF NOT EXISTS {self.paper_table} (
# #             id             SERIAL PRIMARY KEY,
# #             student_index  TEXT,
# #             module_code    TEXT,
# #             exam_year      INT,
# #             exam_month     TEXT,
# #             total_marks    FLOAT,
# #             total_possible FLOAT,
# #             graded_at      TIMESTAMP DEFAULT NOW(),
# #             UNIQUE (student_index,module_code,exam_year,exam_month)
# #         );
# #         """)
# #         self.commit()

# #     # ───────────────────────────────────────────────────────────
# #     def save_question_mark(self, row: GradingResult):
# #         self.cursor.execute(f"""
# #         INSERT INTO {self.answers_table}
# #           (student_index,module_code,exam_year,exam_month,
# #            full_question_id,mark,max_marks,reason,graded_at,is_null_answer)
# #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
# #         ON CONFLICT
# #           (student_index,module_code,exam_year,exam_month,full_question_id)
# #         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
# #                       graded_at=NOW(), is_null_answer=EXCLUDED.is_null_answer;
# #         """, (
# #             row.student_index, row.module_code, row.exam_year, row.exam_month,
# #             row.full_question_id, row.score, row.max_marks, row.feedback,
# #             getattr(row, 'is_null_answer', False)
# #         ))

# #     # ───────────────────────────────────────────────────────────
# #     def save_paper_total(self,
# #                          student_index: str, module: str,
# #                          year: int, month: str,
# #                          total: float, possible: float):
# #         self.cursor.execute(f"""
# #         INSERT INTO {self.paper_table}
# #           (student_index,module_code,exam_year,exam_month,
# #            total_marks,total_possible,graded_at)
# #         VALUES (%s,%s,%s,%s,%s,%s,NOW())
# #         ON CONFLICT
# #           (student_index,module_code,exam_year,exam_month)
# #         DO UPDATE SET total_marks=EXCLUDED.total_marks,
# #                       total_possible=EXCLUDED.total_possible,
# #                       graded_at=NOW();
# #         """, (student_index, module, year, month, total, possible))

# #     # ───────────────────────────────────────────────────────────
# #     # NEW METHODS FOR NULL ANSWER HANDLING
# #     # ───────────────────────────────────────────────────────────
    
# #     def get_grade_by_ids(self, student_index: str, module_code: str, exam_year: int, 
# #                          exam_month: str, full_question_id: str):
# #         """Check if grade exists for given IDs"""
# #         self.cursor.execute("""
# #         SELECT id FROM graded_student_answers 
# #         WHERE student_index=%s AND module_code=%s AND exam_year=%s 
# #         AND exam_month=%s AND full_question_id=%s
# #         """, (student_index, module_code, exam_year, exam_month, full_question_id))
# #         return self.cursor.fetchone()

# #     def insert_null_answer_grade(self, student_index: str, module_code: str, 
# #                                 exam_year: int, exam_month: str, 
# #                                 full_question_id: str, max_marks: float):
# #         """Insert grade for null answer"""
# #         self.cursor.execute("""
# #         INSERT INTO graded_student_answers
# #           (student_index, module_code, exam_year, exam_month,
# #            full_question_id, mark, max_marks, reason, graded_at, is_null_answer)
# #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
# #         ON CONFLICT
# #           (student_index,module_code,exam_year,exam_month,full_question_id)
# #         DO UPDATE SET mark=0, reason='No answer provided', 
# #                       graded_at=NOW(), is_null_answer=TRUE;
# #         """, (
# #             student_index, module_code, exam_year, exam_month,
# #             full_question_id, 0.0, max_marks, "No answer provided", True
# #         ))

# #     def sync_null_answer_grades(self, module_code: str = None, year: int = None, month: str = None):
# #         """
# #         Find student answers that don't have grades (null answers) and add them with grade 0
# #         """
# #         from .student_answer_db import StudentAnswerService
        
# #         student_service = StudentAnswerService()
# #         student_service.initialize_table()
        
# #         # Get all student answers grouped by student
# #         all_grouped_answers = student_service.get_all_answers_grouped(module_code, year, month)
        
# #         synced_count = 0
        
# #         for (student_index, mod_code, yr, mon), answers_list in all_grouped_answers.items():
# #             for answer_record in answers_list:
# #                 # Check if grade already exists for this answer
# #                 existing_grade = self.get_grade_by_ids(
# #                     answer_record.student_index,
# #                     answer_record.module_code, 
# #                     answer_record.exam_year,
# #                     answer_record.exam_month,
# #                     answer_record.full_question_id
# #                 )
                
# #                 # If no grade exists and answer is null/empty, add grade 0
# #                 if not existing_grade and (
# #                     answer_record.answer_text is None or 
# #                     answer_record.answer_text.strip() == "" or
# #                     answer_record.answer_text.lower().strip() in ["", "null", "none"]
# #                 ):
# #                     # Get max_marks for this question
# #                     max_marks = self._get_max_marks_for_question(answer_record.full_question_id)
                    
# #                     self.insert_null_answer_grade(
# #                         student_index=answer_record.student_index,
# #                         module_code=answer_record.module_code,
# #                         exam_year=answer_record.exam_year,
# #                         exam_month=answer_record.exam_month,
# #                         full_question_id=answer_record.full_question_id,
# #                         max_marks=max_marks
# #                     )
# #                     synced_count += 1
        
# #         self.commit()
# #         return synced_count

# #     def _get_max_marks_for_question(self, full_question_id: str) -> float:
# #         """
# #         Get max marks for a question. You'll need to implement this based on 
# #         how you store question marks in your system.
# #         For now, returning a default value.
# #         """
# #         # TODO: Implement based on your question bank structure
# #         # This might query a questions table or use a default mapping
# #         return 10.0  # Default max marks - adjust based on your needs

# import logging
# from .base_relational_db import BaseRelationalDB
# from ...models.grading_result import GradingResult

# log = logging.getLogger(__name__)

# class GradingResultDB(BaseRelationalDB):
#     """
#     Enhanced grading result database service with assessment_id support.
#     Handles per-question marks and paper-level totals with assessment tracking.
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
#         print(f"⚙️ Grading Tables: {self.answers_table}, {self.paper_table}")

#         self._create_tables()

#     def _create_tables(self):
#         """Create grading tables with assessment_id support."""
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
#             is_null_answer     BOOLEAN DEFAULT FALSE,
#             assessment_id      TEXT,  -- New field for assessment tracking
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
#             assessment_id  TEXT,  -- New field for assessment tracking
#             UNIQUE (student_index,module_code,exam_year,exam_month)
#         );
        
#         -- Create indexes for better performance
#         CREATE INDEX IF NOT EXISTS idx_{self.answers_table}_assessment_id 
#         ON {self.answers_table}(assessment_id);
        
#         CREATE INDEX IF NOT EXISTS idx_{self.paper_table}_assessment_id 
#         ON {self.paper_table}(assessment_id);
#         """)
#         self.commit()

#     def save_question_mark(self, row: GradingResult, assessment_id: str = None):
#         """Save question-level grading result with assessment tracking."""
#         self.cursor.execute(f"""
#         INSERT INTO {self.answers_table}
#           (student_index,module_code,exam_year,exam_month,
#            full_question_id,mark,max_marks,reason,graded_at,is_null_answer,assessment_id)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,%s)
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
#                       graded_at=NOW(), is_null_answer=EXCLUDED.is_null_answer,
#                       assessment_id=COALESCE(EXCLUDED.assessment_id, {self.answers_table}.assessment_id);
#         """, (
#             row.student_index, row.module_code, row.exam_year, row.exam_month,
#             row.full_question_id, row.score, row.max_marks, row.feedback,
#             getattr(row, 'is_null_answer', False), assessment_id
#         ))

#     def save_paper_total(self,
#                          student_index: str, module: str,
#                          year: int, month: str,
#                          total: float, possible: float,
#                          assessment_id: str = None):
#         """Save paper-level grading result with assessment tracking."""
#         self.cursor.execute(f"""
#         INSERT INTO {self.paper_table}
#           (student_index,module_code,exam_year,exam_month,
#            total_marks,total_possible,graded_at,assessment_id)
#         VALUES (%s,%s,%s,%s,%s,%s,NOW(),%s)
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month)
#         DO UPDATE SET total_marks=EXCLUDED.total_marks,
#                       total_possible=EXCLUDED.total_possible,
#                       graded_at=NOW(),
#                       assessment_id=COALESCE(EXCLUDED.assessment_id, {self.paper_table}.assessment_id);
#         """, (student_index, module, year, month, total, possible, assessment_id))

#     def get_grades_by_assessment(self, assessment_id: str):
#         """Get all grades for a specific assessment."""
#         self.cursor.execute(f"""
#         SELECT student_index, module_code, exam_year, exam_month,
#                full_question_id, mark, max_marks, reason, graded_at, is_null_answer
#         FROM {self.answers_table}
#         WHERE assessment_id = %s
#         ORDER BY student_index, full_question_id
#         """, (assessment_id,))
        
#         return self.cursor.fetchall()

#     def get_paper_results_by_assessment(self, assessment_id: str):
#         """Get all paper-level results for a specific assessment."""
#         self.cursor.execute(f"""
#         SELECT student_index, module_code, exam_year, exam_month,
#                total_marks, total_possible, graded_at
#         FROM {self.paper_table}
#         WHERE assessment_id = %s
#         ORDER BY student_index
#         """, (assessment_id,))
        
#         return self.cursor.fetchall()

#     def get_grade_by_ids(self, student_index: str, module_code: str, exam_year: int, 
#                          exam_month: str, full_question_id: str):
#         """Check if grade exists for given IDs."""
#         self.cursor.execute(f"""
#         SELECT id FROM {self.answers_table} 
#         WHERE student_index=%s AND module_code=%s AND exam_year=%s 
#         AND exam_month=%s AND full_question_id=%s
#         """, (student_index, module_code, exam_year, exam_month, full_question_id))
#         return self.cursor.fetchone()

#     def insert_null_answer_grade(self, student_index: str, module_code: str, 
#                                 exam_year: int, exam_month: str, 
#                                 full_question_id: str, max_marks: float,
#                                 assessment_id: str = None):
#         """Insert grade for null answer with assessment tracking."""
#         self.cursor.execute(f"""
#         INSERT INTO {self.answers_table}
#           (student_index, module_code, exam_year, exam_month,
#            full_question_id, mark, max_marks, reason, graded_at, is_null_answer, assessment_id)
#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,%s)
#         ON CONFLICT
#           (student_index,module_code,exam_year,exam_month,full_question_id)
#         DO UPDATE SET mark=0, reason='No answer provided', 
#                       graded_at=NOW(), is_null_answer=TRUE,
#                       assessment_id=COALESCE(EXCLUDED.assessment_id, {self.answers_table}.assessment_id);
#         """, (
#             student_index, module_code, exam_year, exam_month,
#             full_question_id, 0.0, max_marks, "No answer provided", True, assessment_id
#         ))

#     def sync_null_answer_grades(self, module_code: str = None, year: int = None, 
#                                month: str = None, assessment_id: str = None):
#         """
#         Find student answers that don't have grades (null answers) and add them with grade 0.
#         Enhanced to support assessment-specific syncing.
#         """
#         from .student_answer_db import StudentAnswerService
        
#         # Use the same provider suffix for consistency
#         provider_suffix = "openai" if "_openai" in self.answers_table else "gemini"
#         student_service = StudentAnswerService(provider_suffix=provider_suffix)
#         student_service.initialize_table()
        
#         # Get all student answers grouped by student with assessment filtering
#         all_grouped_answers = student_service.get_all_answers_grouped(
#             module_code=module_code, 
#             year=year, 
#             month=month,
#             assessment_id=assessment_id
#         )
        
#         synced_count = 0
        
#         for (student_index, mod_code, yr, mon), answers_list in all_grouped_answers.items():
#             for answer_record in answers_list:
#                 # Check if grade already exists for this answer
#                 existing_grade = self.get_grade_by_ids(
#                     answer_record.student_index,
#                     answer_record.module_code, 
#                     answer_record.exam_year,
#                     answer_record.exam_month,
#                     answer_record.full_question_id
#                 )
                
#                 # If no grade exists and answer is null/empty, add grade 0
#                 if not existing_grade and (
#                     answer_record.answer_text is None or 
#                     answer_record.answer_text.strip() == "" or
#                     answer_record.answer_text.lower().strip() in ["", "null", "none"]
#                 ):
#                     # Get max_marks for this question
#                     max_marks = self._get_max_marks_for_question(answer_record.full_question_id)
                    
#                     self.insert_null_answer_grade(
#                         student_index=answer_record.student_index,
#                         module_code=answer_record.module_code,
#                         exam_year=answer_record.exam_year,
#                         exam_month=answer_record.exam_month,
#                         full_question_id=answer_record.full_question_id,
#                         max_marks=max_marks,
#                         assessment_id=assessment_id
#                     )
#                     synced_count += 1
        
#         self.commit()
#         student_service.close()
#         return synced_count

#     def update_assessment_id_for_existing_grades(self, module_code: str, year: int, 
#                                                month: str, assessment_id: str):
#         """Update assessment_id for existing grade records that match the criteria."""
#         # Update question-level grades
#         self.cursor.execute(f"""
#         UPDATE {self.answers_table}
#         SET assessment_id = %s
#         WHERE module_code = %s AND exam_year = %s AND exam_month = %s
#         AND (assessment_id IS NULL OR assessment_id = '')
#         """, (assessment_id, module_code, year, month))
        
#         questions_updated = self.cursor.rowcount
        
#         # Update paper-level results
#         self.cursor.execute(f"""
#         UPDATE {self.paper_table}
#         SET assessment_id = %s
#         WHERE module_code = %s AND exam_year = %s AND exam_month = %s
#         AND (assessment_id IS NULL OR assessment_id = '')
#         """, (assessment_id, module_code, year, month))
        
#         papers_updated = self.cursor.rowcount
#         self.commit()
        
#         log.info(f"Updated assessment_id for {questions_updated} question grades and {papers_updated} paper results")
#         return questions_updated, papers_updated

#     def get_grading_stats_by_assessment(self, assessment_id: str):
#         """Get grading statistics for a specific assessment."""
#         self.cursor.execute(f"""
#         SELECT 
#             COUNT(DISTINCT student_index) as total_students,
#             COUNT(*) as total_questions_graded,
#             AVG(mark) as avg_mark,
#             AVG(max_marks) as avg_max_marks,
#             COUNT(CASE WHEN is_null_answer = TRUE THEN 1 END) as null_answers
#         FROM {self.answers_table}
#         WHERE assessment_id = %s
#         """, (assessment_id,))
        
#         question_stats = self.cursor.fetchone()
        
#         self.cursor.execute(f"""
#         SELECT 
#             COUNT(*) as total_papers,
#             AVG(total_marks) as avg_total_marks,
#             AVG(total_possible) as avg_total_possible,
#             MIN(total_marks) as min_marks,
#             MAX(total_marks) as max_marks
#         FROM {self.paper_table}
#         WHERE assessment_id = %s
#         """, (assessment_id,))
        
#         paper_stats = self.cursor.fetchone()
        
#         return {
#             'question_level': {
#                 'total_students': question_stats[0] if question_stats else 0,
#                 'total_questions_graded': question_stats[1] if question_stats else 0,
#                 'avg_mark': float(question_stats[2]) if question_stats and question_stats[2] else 0.0,
#                 'avg_max_marks': float(question_stats[3]) if question_stats and question_stats[3] else 0.0,
#                 'null_answers': question_stats[4] if question_stats else 0
#             },
#             'paper_level': {
#                 'total_papers': paper_stats[0] if paper_stats else 0,
#                 'avg_total_marks': float(paper_stats[1]) if paper_stats and paper_stats[1] else 0.0,
#                 'avg_total_possible': float(paper_stats[2]) if paper_stats and paper_stats[2] else 0.0,
#                 'min_marks': float(paper_stats[3]) if paper_stats and paper_stats[3] else 0.0,
#                 'max_marks': float(paper_stats[4]) if paper_stats and paper_stats[4] else 0.0
#             }
#         }

#     def delete_grades_by_assessment(self, assessment_id: str):
#         """Delete all grades for a specific assessment."""
#         # Delete question-level grades
#         self.cursor.execute(f"""
#         DELETE FROM {self.answers_table}
#         WHERE assessment_id = %s
#         """, (assessment_id,))
        
#         questions_deleted = self.cursor.rowcount
        
#         # Delete paper-level results
#         self.cursor.execute(f"""
#         DELETE FROM {self.paper_table}
#         WHERE assessment_id = %s
#         """, (assessment_id,))
        
#         papers_deleted = self.cursor.rowcount
#         self.commit()
        
#         log.info(f"Deleted {questions_deleted} question grades and {papers_deleted} paper results for assessment {assessment_id}")
#         return questions_deleted, papers_deleted

#     def _get_max_marks_for_question(self, full_question_id: str) -> float:
#         """
#         Get max marks for a question. Enhanced to look up from model answers if available.
#         """
#         # Try to get from model answer embeddings table first
#         try:
#             provider_suffix = "openai" if "_openai" in self.answers_table else "gemini"
#             model_table = f"model_answer_embeddings_{provider_suffix}"
            
#             self.cursor.execute(f"""
#             SELECT max_marks FROM {model_table}
#             WHERE full_question_id = %s
#             LIMIT 1
#             """, (full_question_id,))
            
#             result = self.cursor.fetchone()
#             if result and result[0]:
#                 return float(result[0])
                
#         except Exception as e:
#             log.warning(f"Could not fetch max_marks from model answers: {e}")
        
#         # Default fallback - you might want to implement a more sophisticated mapping
#         return 10.0

#     def migrate_add_assessment_id(self):
#         """Migration helper to add assessment_id column to existing tables."""
#         try:
#             # Add to answers table
#             self.cursor.execute(f"""
#             ALTER TABLE {self.answers_table} 
#             ADD COLUMN IF NOT EXISTS assessment_id TEXT;
#             """)
            
#             # Add to paper results table
#             self.cursor.execute(f"""
#             ALTER TABLE {self.paper_table} 
#             ADD COLUMN IF NOT EXISTS assessment_id TEXT;
#             """)
            
#             # Create indexes
#             self.cursor.execute(f"""
#             CREATE INDEX IF NOT EXISTS idx_{self.answers_table}_assessment_id 
#             ON {self.answers_table}(assessment_id);
#             """)
            
#             self.cursor.execute(f"""
#             CREATE INDEX IF NOT EXISTS idx_{self.paper_table}_assessment_id 
#             ON {self.paper_table}(assessment_id);
#             """)
            
#             self.commit()
#             log.info(f"Migration completed: Added assessment_id to grading tables")
            
#         except Exception as e:
#             log.error(f"Migration failed: {e}")
#             self.rollback()
#             raise

import logging
from .base_relational_db import BaseRelationalDB
from ...models.grading_result import GradingResult

log = logging.getLogger(__name__)

class GradingResultDB(BaseRelationalDB):
    """
    Inserts / queries per-question marks and paper-level totals with assessment tracking.
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
        print(f"Using grading tables: {self.answers_table}, {self.paper_table}")

        self._create_tables()

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
            is_null_answer     BOOLEAN DEFAULT FALSE,
            assessment_id      TEXT,
            submission_id      TEXT,
            UNIQUE (student_index,module_code,exam_year,exam_month,full_question_id,assessment_id)
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
            assessment_id  TEXT,
            UNIQUE (student_index,module_code,exam_year,exam_month,assessment_id)
        );
        """)
        
        # Add indexes for better performance
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.answers_table}_assessment 
        ON {self.answers_table} (assessment_id);
        """)
        
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.answers_table}_submission 
        ON {self.answers_table} (submission_id);
        """)
        
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.paper_table}_assessment 
        ON {self.paper_table} (assessment_id);
        """)
        
        # Migration: Add columns to existing tables if they don't exist
        self.cursor.execute(f"""
        DO $$ 
        BEGIN
            BEGIN
                ALTER TABLE {self.answers_table} ADD COLUMN assessment_id TEXT;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
            BEGIN
                ALTER TABLE {self.answers_table} ADD COLUMN submission_id TEXT;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
            BEGIN
                ALTER TABLE {self.paper_table} ADD COLUMN assessment_id TEXT;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
        END $$;
        """)
        
        self.commit()

    def save_question_mark(self, row: GradingResult):
        self.cursor.execute(f"""
        INSERT INTO {self.answers_table}
          (student_index,module_code,exam_year,exam_month,
           full_question_id,mark,max_marks,reason,graded_at,is_null_answer,
           assessment_id,submission_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,%s,%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id,assessment_id)
        DO UPDATE SET mark=EXCLUDED.mark, reason=EXCLUDED.reason,
                      graded_at=NOW(), is_null_answer=EXCLUDED.is_null_answer,
                      submission_id=EXCLUDED.submission_id;
        """, (
            row.student_index, row.module_code, row.exam_year, row.exam_month,
            row.full_question_id, row.score, row.max_marks, row.feedback,
            getattr(row, 'is_null_answer', False),
            row.assessment_id, row.submission_id
        ))

    def save_paper_total(self, student_index: str, module: str, year: int, month: str,
                         total: float, possible: float, assessment_id: str = None):
        self.cursor.execute(f"""
        INSERT INTO {self.paper_table}
          (student_index,module_code,exam_year,exam_month,
           total_marks,total_possible,graded_at,assessment_id)
        VALUES (%s,%s,%s,%s,%s,%s,NOW(),%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,assessment_id)
        DO UPDATE SET total_marks=EXCLUDED.total_marks,
                      total_possible=EXCLUDED.total_possible,
                      graded_at=NOW();
        """, (student_index, module, year, month, total, possible, assessment_id))

    def get_grades_by_assessment(self, assessment_id: str):
        """Get all grades for a specific assessment"""
        self.cursor.execute(f"""
        SELECT student_index, module_code, exam_year, exam_month,
               full_question_id, mark, max_marks, reason, graded_at,
               is_null_answer, submission_id
        FROM {self.answers_table}
        WHERE assessment_id = %s
        ORDER BY student_index, full_question_id
        """, (assessment_id,))
        
        results = []
        for row in self.cursor.fetchall():
            results.append({
                'student_index': row[0],
                'module_code': row[1],
                'exam_year': row[2],
                'exam_month': row[3],
                'full_question_id': row[4],
                'mark': row[5],
                'max_marks': row[6],
                'reason': row[7],
                'graded_at': row[8],
                'is_null_answer': row[9],
                'submission_id': row[10]
            })
        
        return results

    def get_paper_totals_by_assessment(self, assessment_id: str):
        """Get paper totals for a specific assessment"""
        self.cursor.execute(f"""
        SELECT student_index, module_code, exam_year, exam_month,
               total_marks, total_possible, graded_at
        FROM {self.paper_table}
        WHERE assessment_id = %s
        ORDER BY student_index
        """, (assessment_id,))
        
        results = []
        for row in self.cursor.fetchall():
            results.append({
                'student_index': row[0],
                'module_code': row[1],
                'exam_year': row[2],
                'exam_month': row[3],
                'total_marks': row[4],
                'total_possible': row[5],
                'graded_at': row[6]
            })
        
        return results

    def delete_grades_by_assessment(self, assessment_id: str) -> int:
        """Delete all grades for a specific assessment. Returns number of deleted records."""
        # Delete question grades
        self.cursor.execute(f"""
        DELETE FROM {self.answers_table}
        WHERE assessment_id = %s
        """, (assessment_id,))
        
        deleted_questions = self.cursor.rowcount
        
        # Delete paper totals
        self.cursor.execute(f"""
        DELETE FROM {self.paper_table}
        WHERE assessment_id = %s
        """, (assessment_id,))
        
        deleted_papers = self.cursor.rowcount
        self.commit()
        
        print(f"Deleted {deleted_questions} question grades and {deleted_papers} paper totals for assessment {assessment_id}")
        return deleted_questions + deleted_papers

    def delete_grades_by_submission(self, submission_id: str) -> int:
        """Delete grades for a specific submission. Returns number of deleted records."""
        self.cursor.execute(f"""
        DELETE FROM {self.answers_table}
        WHERE submission_id = %s
        """, (submission_id,))
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        print(f"Deleted {deleted_count} question grades for submission {submission_id}")
        return deleted_count

    def get_grade_by_ids(self, student_index: str, module_code: str, exam_year: int, 
                         exam_month: str, full_question_id: str, assessment_id: str = None):
        """Check if grade exists for given IDs with optional assessment filtering"""
        if assessment_id:
            self.cursor.execute(f"""
            SELECT id FROM {self.answers_table}
            WHERE student_index=%s AND module_code=%s AND exam_year=%s 
            AND exam_month=%s AND full_question_id=%s AND assessment_id=%s
            """, (student_index, module_code, exam_year, exam_month, full_question_id, assessment_id))
        else:
            self.cursor.execute(f"""
            SELECT id FROM {self.answers_table}
            WHERE student_index=%s AND module_code=%s AND exam_year=%s 
            AND exam_month=%s AND full_question_id=%s
            """, (student_index, module_code, exam_year, exam_month, full_question_id))
        
        return self.cursor.fetchone()

    def insert_null_answer_grade(self, student_index: str, module_code: str, 
                                exam_year: int, exam_month: str, 
                                full_question_id: str, max_marks: float,
                                assessment_id: str = None, submission_id: str = None):
        """Insert grade for null answer with assessment context"""
        self.cursor.execute(f"""
        INSERT INTO {self.answers_table}
          (student_index, module_code, exam_year, exam_month,
           full_question_id, mark, max_marks, reason, graded_at, is_null_answer,
           assessment_id, submission_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s,%s,%s)
        ON CONFLICT
          (student_index,module_code,exam_year,exam_month,full_question_id,assessment_id)
        DO UPDATE SET mark=0, reason='No answer provided', 
                      graded_at=NOW(), is_null_answer=TRUE,
                      submission_id=EXCLUDED.submission_id;
        """, (
            student_index, module_code, exam_year, exam_month,
            full_question_id, 0.0, max_marks, "No answer provided", True,
            assessment_id, submission_id
        ))

    def get_grading_stats_by_assessment(self, assessment_id: str) -> dict:
        """Get grading statistics for a specific assessment"""
        stats = {}
        
        # Total questions graded
        self.cursor.execute(f"SELECT COUNT(*) FROM {self.answers_table} WHERE assessment_id = %s", (assessment_id,))
        stats['total_questions_graded'] = self.cursor.fetchone()[0]
        
        # Unique students graded
        self.cursor.execute(f"SELECT COUNT(DISTINCT student_index) FROM {self.answers_table} WHERE assessment_id = %s", (assessment_id,))
        stats['unique_students_graded'] = self.cursor.fetchone()[0]
        
        # Average score
        self.cursor.execute(f"SELECT AVG(mark) FROM {self.answers_table} WHERE assessment_id = %s", (assessment_id,))
        avg_result = self.cursor.fetchone()[0]
        stats['average_question_score'] = float(avg_result) if avg_result else 0.0
        
        # Paper totals count
        self.cursor.execute(f"SELECT COUNT(*) FROM {self.paper_table} WHERE assessment_id = %s", (assessment_id,))
        stats['papers_graded'] = self.cursor.fetchone()[0]
        
        # Average paper score
        self.cursor.execute(f"SELECT AVG(total_marks), AVG(total_possible) FROM {self.paper_table} WHERE assessment_id = %s", (assessment_id,))
        paper_avg = self.cursor.fetchone()
        stats['average_paper_score'] = float(paper_avg[0]) if paper_avg[0] else 0.0
        stats['average_paper_possible'] = float(paper_avg[1]) if paper_avg[1] else 0.0
        
        return stats