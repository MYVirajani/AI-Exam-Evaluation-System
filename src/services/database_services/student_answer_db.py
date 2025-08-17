

# # # # # # from .base_relational_db import BaseRelationalDB
# # # # # # from ...models.student_answer import StudentAnswer
# # # # # # from typing import Dict, Tuple, List
# # # # # # import json
# # # # # # import logging


# # # # # # class StudentAnswerService(BaseRelationalDB):
# # # # # #     def __init__(self, provider_suffix: str = ""):
# # # # # #         super().__init__()

# # # # # #         # Force mapping of providers to proper suffixes
# # # # # #         provider_table_map = {
# # # # # #             "openai": "student_answers_openai",
# # # # # #             "googlegemini": "student_answers_gemini"
# # # # # #         }

# # # # # #         normalized = provider_suffix.strip().lower()
# # # # # #         self.table_name = provider_table_map.get(normalized, "student_answers")

# # # # # #         logging.info(f"[DB] Using table: {self.table_name}")
# # # # # #         print(f"⚙️ Using table: {self.table_name}")  # DEBUG PRINT

# # # # # #     def initialize_table(self):
# # # # # #         self.cursor.execute(f"""
# # # # # #         CREATE TABLE IF NOT EXISTS {self.table_name} (
# # # # # #             student_index VARCHAR,
# # # # # #             module_code VARCHAR,
# # # # # #             exam_year INT,
# # # # # #             exam_month VARCHAR,
# # # # # #             answers JSONB,
# # # # # #             PRIMARY KEY (student_index, module_code, exam_year, exam_month)
# # # # # #         );
# # # # # #         """)
# # # # # #         self.commit()

# # # # # #     def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
# # # # # #         answer_dict = {
# # # # # #             ans.full_question_id: ans.answer_text for ans in answers
# # # # # #         }

# # # # # #         self.cursor.execute(f"""
# # # # # #         INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers)
# # # # # #         VALUES (%s, %s, %s, %s, %s)
# # # # # #         ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
# # # # # #         answers = EXCLUDED.answers
# # # # # #         """, (student_index, module_code, year, month, json.dumps(answer_dict)))
# # # # # #         self.commit()

# # # # # #     def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
# # # # # #         self.cursor.execute(f"""
# # # # # #         SELECT answers FROM {self.table_name}
# # # # # #         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# # # # # #         """, (student_index, module_code, year, month))
# # # # # #         result = self.cursor.fetchone()
# # # # # #         return result[0] if result else {}

# # # # # #     def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str) -> List[StudentAnswer]:
# # # # # #         self.cursor.execute(f"""
# # # # # #             SELECT answers FROM {self.table_name}
# # # # # #             WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# # # # # #         """, (student_index, module_code, year, month))

# # # # # #         result = self.cursor.fetchone()
# # # # # #         if not result:
# # # # # #             return []

# # # # # #         raw_answers = result[0]  # This is a dict of {question_id: answer_text}
# # # # # #         structured_answers = []

# # # # # #         for full_qid, answer_text in raw_answers.items():
# # # # # #             parts = full_qid.split("_")
# # # # # #             structured_answers.append(
# # # # # #                 StudentAnswer(
# # # # # #                     question_id=parts[0],
# # # # # #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# # # # # #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# # # # # #                     answer_text=answer_text,
# # # # # #                     student_index=student_index,
# # # # # #                     module_code=module_code,
# # # # # #                     exam_year=year,
# # # # # #                     exam_month=month
# # # # # #                 )
# # # # # #             )
# # # # # #         return structured_answers

# # # # # #     def get_all_answers_grouped(self, module_code: str, year: int, month: str) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# # # # # #         self.cursor.execute(f"""
# # # # # #             SELECT student_index, module_code, exam_year, exam_month, answers
# # # # # #             FROM {self.table_name}
# # # # # #             WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
# # # # # #         """, (module_code, year, month))

# # # # # #         rows = self.cursor.fetchall()
# # # # # #         grouped = {}

# # # # # #         for student_index, module_code, year, month, answers_json in rows:
# # # # # #             structured_answers = []
# # # # # #             for full_qid, answer_text in answers_json.items():
# # # # # #                 parts = full_qid.split("_")
# # # # # #                 structured_answers.append(StudentAnswer(
# # # # # #                     question_id=parts[0],
# # # # # #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# # # # # #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# # # # # #                     answer_text=answer_text,
# # # # # #                     student_index=student_index,
# # # # # #                     module_code=module_code,
# # # # # #                     exam_year=year,
# # # # # #                     exam_month=month
# # # # # #                 ))
# # # # # #             grouped[(student_index, module_code, year, month)] = structured_answers

# # # # # #         return grouped

 

# # # # # from .base_relational_db import BaseRelationalDB
# # # # # from ...models.student_answer import StudentAnswer
# # # # # from typing import Dict, Tuple, List
# # # # # import json
# # # # # import logging


# # # # # class StudentAnswerService(BaseRelationalDB):
# # # # #     def __init__(self, provider_suffix: str = ""):
# # # # #         super().__init__()

# # # # #         # Updated mapping to match embedder.get_table_suffix() values
# # # # #         provider_table_map = {
# # # # #             "openai": "student_answers_openai",
# # # # #             "google_gemini": "student_answers_gemini",      # Allow snake_case
# # # # #             "googlegemini": "student_answers_gemini",        # Support compact form
# # # # #             "gemini": "student_answers_gemini"
# # # # #         }

# # # # #         normalized = provider_suffix.strip().lower()
# # # # #         self.table_name = provider_table_map.get(normalized)

# # # # #         if not self.table_name:
# # # # #             raise ValueError(f"Invalid provider_suffix: {provider_suffix}")

# # # # #         logging.info(f"[DB] Using table: {self.table_name}")
# # # # #         print(f"⚙️ Using table: {self.table_name}")

# # # # #     def initialize_table(self):
# # # # #         self.cursor.execute(f"""
# # # # #         CREATE TABLE IF NOT EXISTS {self.table_name} (
# # # # #             student_index VARCHAR,
# # # # #             module_code VARCHAR,
# # # # #             exam_year INT,
# # # # #             exam_month VARCHAR,
# # # # #             answers JSONB,
# # # # #             PRIMARY KEY (student_index, module_code, exam_year, exam_month)
# # # # #         );
# # # # #         """)
# # # # #         self.commit()

# # # # #     def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer], assessment_id):
# # # # #         answer_dict = {
# # # # #             ans.full_question_id: ans.answer_text for ans in answers
# # # # #         }

# # # # #         self.cursor.execute(f"""
# # # # #         INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers)
# # # # #         VALUES (%s, %s, %s, %s, %s)
# # # # #         ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
# # # # #         answers = EXCLUDED.answers
# # # # #         """, (student_index, module_code, year, month, json.dumps(answer_dict)))
# # # # #         self.commit()

# # # # #     def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
# # # # #         self.cursor.execute(f"""
# # # # #         SELECT answers FROM {self.table_name}
# # # # #         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# # # # #         """, (student_index, module_code, year, month))
# # # # #         result = self.cursor.fetchone()
# # # # #         return result[0] if result else {}

# # # # #     def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str) -> List[StudentAnswer]:
# # # # #         self.cursor.execute(f"""
# # # # #             SELECT answers FROM {self.table_name}
# # # # #             WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# # # # #         """, (student_index, module_code, year, month))

# # # # #         result = self.cursor.fetchone()
# # # # #         if not result:
# # # # #             return []

# # # # #         raw_answers = result[0]
# # # # #         structured_answers = []

# # # # #         for full_qid, answer_text in raw_answers.items():
# # # # #             parts = full_qid.split("_")
# # # # #             structured_answers.append(
# # # # #                 StudentAnswer(
# # # # #                     question_id=parts[0],
# # # # #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# # # # #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# # # # #                     answer_text=answer_text,
# # # # #                     student_index=student_index,
# # # # #                     module_code=module_code,
# # # # #                     exam_year=year,
# # # # #                     exam_month=month
# # # # #                 )
# # # # #             )
# # # # #         return structured_answers

# # # # #     def get_all_answers_grouped(self, module_code: str, year: int, month: str) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# # # # #         self.cursor.execute(f"""
# # # # #             SELECT student_index, module_code, exam_year, exam_month, answers
# # # # #             FROM {self.table_name}
# # # # #             WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
# # # # #         """, (module_code, year, month))

# # # # #         rows = self.cursor.fetchall()
# # # # #         grouped = {}

# # # # #         for student_index, module_code, year, month, answers_json in rows:
# # # # #             structured_answers = []
# # # # #             for full_qid, answer_text in answers_json.items():
# # # # #                 parts = full_qid.split("_")
# # # # #                 structured_answers.append(StudentAnswer(
# # # # #                     question_id=parts[0],
# # # # #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# # # # #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# # # # #                     answer_text=answer_text,
# # # # #                     student_index=student_index,
# # # # #                     module_code=module_code,
# # # # #                     exam_year=year,
# # # # #                     exam_month=month
# # # # #                 ))
# # # # #             grouped[(student_index, module_code, year, month)] = structured_answers

# # # # #         return grouped

# # # # from .base_relational_db import BaseRelationalDB
# # # # from ...models.student_answer import StudentAnswer
# # # # from typing import Dict, Tuple, List
# # # # import json
# # # # import logging


# # # # class StudentAnswerService(BaseRelationalDB):
# # # #     def __init__(self, provider_suffix: str = ""):
# # # #         super().__init__()

# # # #         # Updated mapping to match embedder.get_table_suffix() values
# # # #         provider_table_map = {
# # # #             "openai": "student_answers_openai",
# # # #             "google_gemini": "student_answers_gemini",      # Allow snake_case
# # # #             "googlegemini": "student_answers_gemini",        # Support compact form
# # # #             "gemini": "student_answers_gemini"
# # # #         }

# # # #         normalized = provider_suffix.strip().lower()
# # # #         self.table_name = provider_table_map.get(normalized)

# # # #         if not self.table_name:
# # # #             raise ValueError(f"Invalid provider_suffix: {provider_suffix}")

# # # #         logging.info(f"[DB] Using table: {self.table_name}")
# # # #         print(f"⚙️ Using table: {self.table_name}")

# # # #     def initialize_table(self):
# # # #         self.cursor.execute(f"""
# # # #         CREATE TABLE IF NOT EXISTS {self.table_name} (
# # # #             student_index VARCHAR,
# # # #             module_code VARCHAR,
# # # #             exam_year INT,
# # # #             exam_month VARCHAR,
# # # #             answers JSONB,
# # # #             assessment_id UUID,
# # # #             PRIMARY KEY (student_index, module_code, exam_year, exam_month, assessment_id)
# # # #         );
# # # #         """)
# # # #         self.commit()

# # # #     def save_answers(
# # # #         self,
# # # #         student_index: str,
# # # #         module_code: str,
# # # #         year: int,
# # # #         month: int,
# # # #         answers: List[StudentAnswer],
# # # #         assessment_id
# # # #     ):
# # # #         answer_dict = {
# # # #             ans.full_question_id: ans.answer_text for ans in answers
# # # #         }

# # # #         self.cursor.execute(f"""
# # # #         INSERT INTO {self.table_name}
# # # #         (student_index, module_code, exam_year, exam_month, answers, assessment_id)
# # # #         VALUES (%s, %s, %s, %s, %s, %s)
# # # #         ON CONFLICT (student_index, module_code, exam_year, exam_month, assessment_id) DO UPDATE SET
# # # #             answers = EXCLUDED.answers
# # # #         """, (student_index, module_code, year, month, json.dumps(answer_dict), assessment_id))
# # # #         self.commit()

# # # #     def get_answers(self, student_index: str, module_code: str, year: int, month: int, assessment_id) -> dict:
# # # #         self.cursor.execute(f"""
# # # #         SELECT answers FROM {self.table_name}
# # # #         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s AND assessment_id = %s
# # # #         """, (student_index, module_code, year, month, assessment_id))
# # # #         result = self.cursor.fetchone()
# # # #         return result[0] if result else {}

# # # #     def get_all_answers_for_embedding(
# # # #         self, student_index: str, module_code: str, year: int, month: str, assessment_id
# # # #     ) -> List[StudentAnswer]:
# # # #         self.cursor.execute(f"""
# # # #             SELECT answers FROM {self.table_name}
# # # #             WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s AND assessment_id = %s
# # # #         """, (student_index, module_code, year, month, assessment_id))

# # # #         result = self.cursor.fetchone()
# # # #         if not result:
# # # #             return []

# # # #         raw_answers = result[0]
# # # #         structured_answers = []

# # # #         for full_qid, answer_text in raw_answers.items():
# # # #             parts = full_qid.split("_")
# # # #             structured_answers.append(
# # # #                 StudentAnswer(
# # # #                     question_id=parts[0],
# # # #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# # # #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# # # #                     answer_text=answer_text,
# # # #                     student_index=student_index,
# # # #                     module_code=module_code,
# # # #                     exam_year=year,
# # # #                     exam_month=month
# # # #                 )
# # # #             )
# # # #         return structured_answers

# # # #     def get_all_answers_grouped(
# # # #         self, module_code: str, year: int, month: str, assessment_id
# # # #     ) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# # # #         self.cursor.execute(f"""
# # # #             SELECT student_index, module_code, exam_year, exam_month, answers
# # # #             FROM {self.table_name}
# # # #             WHERE LOWER(module_code) = LOWER(%s) 
# # # #               AND exam_year = %s 
# # # #               AND LOWER(exam_month) = LOWER(%s)
# # # #               AND assessment_id = %s
# # # #         """, (module_code, year, month, assessment_id))

# # # #         rows = self.cursor.fetchall()
# # # #         grouped = {}

# # # #         for student_index, module_code, year, month, answers_json in rows:
# # # #             structured_answers = []
# # # #             for full_qid, answer_text in answers_json.items():
# # # #                 parts = full_qid.split("_")
# # # #                 structured_answers.append(StudentAnswer(
# # # #                     question_id=parts[0],
# # # #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# # # #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# # # #                     answer_text=answer_text,
# # # #                     student_index=student_index,
# # # #                     module_code=module_code,
# # # #                     exam_year=year,
# # # #                     exam_month=month
# # # #                 ))
# # # #             grouped[(student_index, module_code, year, month)] = structured_answers

# # # #         return grouped


# # # import logging
# # # from typing import List, Dict, Tuple, Optional
# # # from .base_relational_db import BaseRelationalDB
# # # from ...models.student_answer import StudentAnswer

# # # log = logging.getLogger(__name__)

# # # class StudentAnswerService(BaseRelationalDB):
# # #     """
# # #     Service for managing student answers in the database with provider-specific tables.
# # #     Now supports assessment_id tracking and filtering.
# # #     """

# # #     def __init__(self, provider_suffix: str = "openai"):
# # #         super().__init__()
        
# # #         # Normalize provider suffix
# # #         suffix_map = {
# # #             "openai": "openai",
# # #             "googlegemini": "gemini",
# # #             "gemini": "gemini",
# # #             "google": "gemini"
# # #         }
        
# # #         normalized_suffix = provider_suffix.strip().lower()
# # #         self.suffix = suffix_map.get(normalized_suffix, "openai")
        
# # #         self.table_name = f"student_answers_{self.suffix}"
# # #         log.info(f"[StudentAnswerService] Using table: {self.table_name}")

# # #     def initialize_table(self):
# # #         """Create the student answers table with assessment_id support."""
# # #         self.cursor.execute(f"""
# # #         CREATE TABLE IF NOT EXISTS {self.table_name} (
# # #             student_index   TEXT,
# # #             module_code     TEXT,
# # #             exam_year       INT,
# # #             exam_month      TEXT,
# # #             answers         JSONB,
# # #             assessment_id   TEXT,  -- New field for assessment tracking
# # #             created_at      TIMESTAMP DEFAULT NOW(),
# # #             updated_at      TIMESTAMP DEFAULT NOW(),
# # #             PRIMARY KEY (student_index, module_code, exam_year, exam_month)
# # #         );
        
# # #         -- Create index for faster assessment-based queries
# # #         CREATE INDEX IF NOT EXISTS idx_{self.table_name}_assessment_id 
# # #         ON {self.table_name}(assessment_id);
        
# # #         -- Create index for faster module-based queries
# # #         CREATE INDEX IF NOT EXISTS idx_{self.table_name}_module_year_month 
# # #         ON {self.table_name}(module_code, exam_year, exam_month);
# # #         """)
# # #         self.commit()

# # #     def save_answers(self, student_index: str, module_code: str, year: int, month: str, 
# # #                     answers: List[StudentAnswer], assessment_id: Optional[str] = None):
# # #         """
# # #         Save student answers with assessment tracking.
        
# # #         Args:
# # #             student_index: Student registration number
# # #             module_code: Module code from database
# # #             year: Year from assessment creation date
# # #             month: Month from assessment creation date
# # #             answers: List of StudentAnswer objects
# # #             assessment_id: Assessment ID for tracking
# # #         """
# # #         # Convert answers to JSON format
# # #         answers_json = [
# # #             {
# # #                 "full_question_id": ans.full_question_id,
# # #                 "question_id": ans.question_id,
# # #                 "sub_question_id": ans.sub_question_id,
# # #                 "sub_sub_question_id": ans.sub_sub_question_id,
# # #                 "sub_sub_sub_question_id": ans.sub_sub_sub_question_id,
# # #                 "answer_text": ans.answer_text
# # #             }
# # #             for ans in answers
# # #         ]
        
# # #         self.cursor.execute(f"""
# # #         INSERT INTO {self.table_name} 
# # #             (student_index, module_code, exam_year, exam_month, answers, assessment_id, updated_at)
# # #         VALUES (%s, %s, %s, %s, %s, %s, NOW())
# # #         ON CONFLICT (student_index, module_code, exam_year, exam_month)
# # #         DO UPDATE SET 
# # #             answers = EXCLUDED.answers,
# # #             assessment_id = COALESCE(EXCLUDED.assessment_id, {self.table_name}.assessment_id),
# # #             updated_at = NOW()
# # #         """, (student_index, module_code, year, month, answers_json, assessment_id))
        
# # #         self.commit()
# # #         log.info(f"✅ Saved {len(answers)} answers for {student_index} | {module_code} | {year}-{month} | Assessment: {assessment_id}")

# # #     def get_answers_by_assessment(self, assessment_id: str) -> List[Tuple[str, str, int, str, List[StudentAnswer]]]:
# # #         """
# # #         Get all student answers for a specific assessment.
        
# # #         Returns:
# # #             List of tuples: (student_index, module_code, exam_year, exam_month, answers_list)
# # #         """
# # #         self.cursor.execute(f"""
# # #         SELECT student_index, module_code, exam_year, exam_month, answers
# # #         FROM {self.table_name}
# # #         WHERE assessment_id = %s
# # #         ORDER BY student_index
# # #         """, (assessment_id,))
        
# # #         results = []
# # #         for row in self.cursor.fetchall():
# # #             student_index, module_code, exam_year, exam_month, answers_json = row
            
# # #             # Convert JSON back to StudentAnswer objects
# # #             answers = []
# # #             for ans_data in answers_json:
# # #                 answer = StudentAnswer(
# # #                     student_index=student_index,
# # #                     module_code=module_code,
# # #                     exam_year=exam_year,
# # #                     exam_month=exam_month,
# # #                     full_question_id=ans_data["full_question_id"],
# # #                     question_id=ans_data["question_id"],
# # #                     sub_question_id=ans_data["sub_question_id"],
# # #                     sub_sub_question_id=ans_data["sub_sub_question_id"],
# # #                     sub_sub_sub_question_id=ans_data["sub_sub_sub_question_id"],
# # #                     answer_text=ans_data["answer_text"]
# # #                 )
# # #                 answers.append(answer)
            
# # #             results.append((student_index, module_code, exam_year, exam_month, answers))
        
# # #         return results

# # #     def get_all_answers_grouped(self, module_code: Optional[str] = None, 
# # #                                year: Optional[int] = None, 
# # #                                month: Optional[str] = None,
# # #                                assessment_id: Optional[str] = None) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# # #         """
# # #         Get all student answers grouped by (student_index, module_code, exam_year, exam_month).
        
# # #         Args:
# # #             module_code: Filter by module code (optional)
# # #             year: Filter by exam year (optional)  
# # #             month: Filter by exam month (optional)
# # #             assessment_id: Filter by assessment ID (optional)
            
# # #         Returns:
# # #             Dictionary mapping (student_index, module_code, exam_year, exam_month) to list of StudentAnswer objects
# # #         """
# # #         query = f"SELECT student_index, module_code, exam_year, exam_month, answers FROM {self.table_name}"
# # #         params = []
# # #         conditions = []
        
# # #         if module_code:
# # #             conditions.append("module_code = %s")
# # #             params.append(module_code)
# # #         if year:
# # #             conditions.append("exam_year = %s") 
# # #             params.append(year)
# # #         if month:
# # #             conditions.append("exam_month = %s")
# # #             params.append(month)
# # #         if assessment_id:
# # #             conditions.append("assessment_id = %s")
# # #             params.append(assessment_id)
            
# # #         if conditions:
# # #             query += " WHERE " + " AND ".join(conditions)
        
# # #         query += " ORDER BY student_index, module_code, exam_year, exam_month"
        
# # #         self.cursor.execute(query, params)
        
# # #         grouped_answers = {}
# # #         for row in self.cursor.fetchall():
# # #             student_index, mod_code, exam_year, exam_month, answers_json = row
# # #             key = (student_index, mod_code, exam_year, exam_month)
            
# # #             # Convert JSON to StudentAnswer objects
# # #             answers = []
# # #             for ans_data in answers_json:
# # #                 answer = StudentAnswer(
# # #                     student_index=student_index,
# # #                     module_code=mod_code,
# # #                     exam_year=exam_year,
# # #                     exam_month=exam_month,
# # #                     full_question_id=ans_data["full_question_id"],
# # #                     question_id=ans_data["question_id"],
# # #                     sub_question_id=ans_data["sub_question_id"],
# # #                     sub_sub_question_id=ans_data["sub_sub_question_id"],
# # #                     sub_sub_sub_question_id=ans_data["sub_sub_sub_question_id"],
# # #                     answer_text=ans_data["answer_text"]
# # #                 )
# # #                 answers.append(answer)
            
# # #             grouped_answers[key] = answers
            
# # #         return grouped_answers

# # #     def get_students_by_criteria(self, module_code: str, year: int, month: str,
# # #                                 assessment_id: Optional[str] = None) -> List[str]:
# # #         """
# # #         Get list of student indices matching the criteria.
        
# # #         Args:
# # #             module_code: Module code to filter by
# # #             year: Exam year to filter by
# # #             month: Exam month to filter by
# # #             assessment_id: Assessment ID to filter by (optional)
            
# # #         Returns:
# # #             List of student indices
# # #         """
# # #         query = f"""
# # #         SELECT DISTINCT student_index FROM {self.table_name}
# # #         WHERE module_code = %s AND exam_year = %s AND exam_month = %s
# # #         """
# # #         params = [module_code, year, month]
        
# # #         if assessment_id:
# # #             query += " AND assessment_id = %s"
# # #             params.append(assessment_id)
            
# # #         query += " ORDER BY student_index"
        
# # #         self.cursor.execute(query, params)
# # #         return [row[0] for row in self.cursor.fetchall()]

# # #     def update_assessment_id(self, student_index: str, module_code: str, 
# # #                            year: int, month: str, assessment_id: str):
# # #         """Update assessment_id for existing records."""
# # #         self.cursor.execute(f"""
# # #         UPDATE {self.table_name}
# # #         SET assessment_id = %s, updated_at = NOW()
# # #         WHERE student_index = %s AND module_code = %s 
# # #         AND exam_year = %s AND exam_month = %s
# # #         """, (assessment_id, student_index, module_code, year, month))
        
# # #         self.commit()

# # #     def delete_answers(self, student_index: str, module_code: str, year: int, month: str):
# # #         """Delete student answers for specific criteria."""
# # #         self.cursor.execute(f"""
# # #         DELETE FROM {self.table_name}
# # #         WHERE student_index = %s AND module_code = %s 
# # #         AND exam_year = %s AND exam_month = %s
# # #         """, (student_index, module_code, year, month))
        
# # #         self.commit()
# # #         log.info(f"Deleted answers for {student_index} | {module_code} | {year}-{month}")

# # #     def get_table_stats(self) -> Dict[str, int]:
# # #         """Get statistics about the table."""
# # #         self.cursor.execute(f"""
# # #         SELECT 
# # #             COUNT(*) as total_records,
# # #             COUNT(DISTINCT student_index) as unique_students,
# # #             COUNT(DISTINCT module_code) as unique_modules,
# # #             COUNT(DISTINCT assessment_id) as unique_assessments
# # #         FROM {self.table_name}
# # #         WHERE assessment_id IS NOT NULL
# # #         """)
        
# # #         result = self.cursor.fetchone()
# # #         return {
# # #             'total_records': result[0],
# # #             'unique_students': result[1], 
# # #             'unique_modules': result[2],
# # #             'unique_assessments': result[3]
# # #         }

# # #     def migrate_add_assessment_id(self):
# # #         """Migration helper to add assessment_id column to existing table."""
# # #         try:
# # #             self.cursor.execute(f"""
# # #             ALTER TABLE {self.table_name} 
# # #             ADD COLUMN IF NOT EXISTS assessment_id TEXT;
# # #             """)
            
# # #             self.cursor.execute(f"""
# # #             CREATE INDEX IF NOT EXISTS idx_{self.table_name}_assessment_id 
# # #             ON {self.table_name}(assessment_id);
# # #             """)
            
# # #             self.commit()
# # #             log.info(f"Migration completed: Added assessment_id to {self.table_name}")
            
# # #         except Exception as e:
# # #             log.error(f"Migration failed: {e}")
# # #             self.rollback()
# # #             raise

# # from .base_relational_db import BaseRelationalDB
# # from ...models.student_answer import StudentAnswer
# # from typing import Dict, Tuple, List
# # import json
# # import logging


# # class StudentAnswerService(BaseRelationalDB):
# #     def __init__(self, provider_suffix: str = ""):
# #         super().__init__()

# #         # Updated mapping to match embedder.get_table_suffix() values
# #         provider_table_map = {
# #             "openai": "student_answers_openai",
# #             "google_gemini": "student_answers_gemini",      # Allow snake_case
# #             "googlegemini": "student_answers_gemini",        # Support compact form
# #             "gemini": "student_answers_gemini"
# #         }

# #         normalized = provider_suffix.strip().lower()
# #         self.table_name = provider_table_map.get(normalized)

# #         if not self.table_name:
# #             raise ValueError(f"Invalid provider_suffix: {provider_suffix}")

# #         logging.info(f"[DB] Using table: {self.table_name}")
# #         print(f"⚙️ Using table: {self.table_name}")

# #     def initialize_table(self):
# #         """Initialize table with enhanced schema including submission and assessment tracking."""
# #         self.cursor.execute(f"""
# #         CREATE TABLE IF NOT EXISTS {self.table_name} (
# #             student_index VARCHAR,
# #             module_code VARCHAR,
# #             exam_year INT,
# #             exam_month VARCHAR,
# #             answers JSONB,
# #             assessment_id TEXT,
# #             submission_id TEXT,
# #             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
# #             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
# #             PRIMARY KEY (student_index, module_code, exam_year, exam_month)
# #         );
# #         """)
        
# #         # Add indexes for better performance
# #         self.cursor.execute(f"""
# #         CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answers_', '')}_assessment 
# #         ON {self.table_name} (assessment_id);
# #         """)
        
# #         self.cursor.execute(f"""
# #         CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answers_', '')}_submission 
# #         ON {self.table_name} (submission_id);
# #         """)
        
# #         # Add columns to existing tables if they don't exist (migration support)
# #         self.cursor.execute(f"""
# #         DO $$ 
# #         BEGIN
# #             BEGIN
# #                 ALTER TABLE {self.table_name} ADD COLUMN assessment_id TEXT;
# #             EXCEPTION
# #                 WHEN duplicate_column THEN
# #                     -- Column already exists, do nothing
# #             END;
# #             BEGIN
# #                 ALTER TABLE {self.table_name} ADD COLUMN submission_id TEXT;
# #             EXCEPTION
# #                 WHEN duplicate_column THEN
# #                     -- Column already exists, do nothing
# #             END;
# #             BEGIN
# #                 ALTER TABLE {self.table_name} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
# #             EXCEPTION
# #                 WHEN duplicate_column THEN
# #                     -- Column already exists, do nothing
# #             END;
# #             BEGIN
# #                 ALTER TABLE {self.table_name} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
# #             EXCEPTION
# #                 WHEN duplicate_column THEN
# #                     -- Column already exists, do nothing
# #             END;
# #         END $$;
# #         """)
        
# #         self.commit()

# #     def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
# #         """Legacy method for backward compatibility."""
# #         answer_dict = {
# #             ans.full_question_id: ans.answer_text for ans in answers
# #         }

# #         self.cursor.execute(f"""
# #         INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers)
# #         VALUES (%s, %s, %s, %s, %s)
# #         ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
# #         answers = EXCLUDED.answers,
# #         updated_at = CURRENT_TIMESTAMP
# #         """, (student_index, module_code, year, month, json.dumps(answer_dict)))
# #         self.commit()

# #     def save_answers_with_submission_tracking(self, student_index: str, module_code: str, year: int, month: int, 
# #                                             answers: List[StudentAnswer], submission_id: str, assessment_id: str):
# #         """Enhanced method with submission and assessment tracking."""
# #         answer_dict = {
# #             ans.full_question_id: ans.answer_text for ans in answers
# #         }

# #         self.cursor.execute(f"""
# #         INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers, submission_id, assessment_id)
# #         VALUES (%s, %s, %s, %s, %s, %s, %s)
# #         ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
# #         answers = EXCLUDED.answers,
# #         submission_id = EXCLUDED.submission_id,
# #         assessment_id = EXCLUDED.assessment_id,
# #         updated_at = CURRENT_TIMESTAMP
# #         """, (student_index, module_code, year, month, json.dumps(answer_dict), submission_id, assessment_id))
# #         self.commit()
        
# #         print(f"💾 Saved to {self.table_name}: {student_index} | {module_code} | {year}-{month} | Submission: {submission_id}")

# #     def check_submission_extracted(self, submission_id: str) -> bool:
# #         """Check if a specific submission has already been extracted."""
# #         try:
# #             self.cursor.execute(f"""
# #             SELECT EXISTS(
# #                 SELECT 1 FROM {self.table_name} 
# #                 WHERE submission_id = %s
# #             )
# #             """, (submission_id,))
            
# #             result = self.cursor.fetchone()
# #             return result[0] if result else False
            
# #         except Exception as e:
# #             logging.error(f"Error checking submission extraction status: {e}")
# #             return False

# #     def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
# #         """Get answers for a specific student/module/year/month combination."""
# #         self.cursor.execute(f"""
# #         SELECT answers FROM {self.table_name}
# #         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# #         """, (student_index, module_code, year, month))
# #         result = self.cursor.fetchone()
# #         return result[0] if result else {}

# #     def get_answers_by_assessment(self, assessment_id: str) -> List[dict]:
# #         """Get all answers for a specific assessment."""
# #         self.cursor.execute(f"""
# #         SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
# #         FROM {self.table_name}
# #         WHERE assessment_id = %s
# #         """, (assessment_id,))
        
# #         results = []
# #         for row in self.cursor.fetchall():
# #             results.append({
# #                 'student_index': row[0],
# #                 'module_code': row[1],
# #                 'exam_year': row[2],
# #                 'exam_month': row[3],
# #                 'answers': row[4],
# #                 'submission_id': row[5]
# #             })
        
# #         return results

# #     def get_answers_by_submission(self, submission_id: str) -> dict:
# #         """Get answers for a specific submission."""
# #         self.cursor.execute(f"""
# #         SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id
# #         FROM {self.table_name}
# #         WHERE submission_id = %s
# #         """, (submission_id,))
        
# #         result = self.cursor.fetchone()
# #         if result:
# #             return {
# #                 'student_index': result[0],
# #                 'module_code': result[1],
# #                 'exam_year': result[2],
# #                 'exam_month': result[3],
# #                 'answers': result[4],
# #                 'assessment_id': result[5]
# #             }
# #         return {}

# #     # def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str) -> List[StudentAnswer]:
# #     #     """Get all answers structured for embedding purposes."""
# #     #     self.cursor.execute(f"""
# #     #         SELECT answers FROM {self.table_name}
# #     #         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# #     #     """, (student_index, module_code, year, month))

# #     #     result = self.cursor.fetchone()
# #     #     if not result:
# #     #         return []

# #     #     raw_answers = result[0]
# #     #     structured_answers = []

# #     #     for full_qid, answer_text in raw_answers.items():
# #     #         parts = full_qid.split("_")
# #     #         structured_answers.append(
# #     #             StudentAnswer(
# #     #                 question_id=parts[0],
# #     #                 sub_question_id=parts[1] if len(parts) > 1 else None,
# #     #                 sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #     #                 answer_text=answer_text,
# #     #                 student_index=student_index,
# #     #                 module_code=module_code,
# #     #                 exam_year=year,
# #     #                 exam_month=month
# #     #             )
# #     #         )
# #     #     return structured_answers

# #     def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str, 
# #                                     assessment_id: str = None, submission_id: str = None) -> List[StudentAnswer]:
# #         """Get all answers structured for embedding purposes with optional assessment context."""
# #         if assessment_id:
# #             self.cursor.execute(f"""
# #                 SELECT answers, assessment_id, submission_id FROM {self.table_name}
# #                 WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s AND assessment_id = %s
# #             """, (student_index, module_code, year, month, assessment_id))
# #         else:
# #             self.cursor.execute(f"""
# #                 SELECT answers, assessment_id, submission_id FROM {self.table_name}
# #                 WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
# #             """, (student_index, module_code, year, month))

# #         result = self.cursor.fetchone()
# #         if not result:
# #             return []

# #         raw_answers = result[0]
# #         db_assessment_id = result[1] if len(result) > 1 else assessment_id
# #         db_submission_id = result[2] if len(result) > 2 else submission_id
        
# #         structured_answers = []

# #         for full_qid, answer_text in raw_answers.items():
# #             parts = full_qid.split("_")
# #             structured_answers.append(
# #                 StudentAnswer(
# #                     question_id=parts[0],
# #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #                     answer_text=answer_text,
# #                     student_index=student_index,
# #                     module_code=module_code,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     assessment_id=db_assessment_id,
# #                     submission_id=db_submission_id
# #                 )
# #             )
# #         return structured_answers

# #     def get_all_answers_grouped(self, module_code: str, year: int, month: str, assessment_id: str = None) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# #         """Get all answers grouped by student for a specific module/year/month with optional assessment filtering."""
# #         if assessment_id:
# #             self.cursor.execute(f"""
# #                 SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id, submission_id
# #                 FROM {self.table_name}
# #                 WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s) AND assessment_id = %s
# #             """, (module_code, year, month, assessment_id))
# #         else:
# #             self.cursor.execute(f"""
# #                 SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id, submission_id
# #                 FROM {self.table_name}
# #                 WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
# #             """, (module_code, year, month))

# #         rows = self.cursor.fetchall()
# #         grouped = {}

# #         for row in rows:
# #             student_index, module_code, year, month = row[0], row[1], row[2], row[3]
# #             answers_json = row[4]
# #             db_assessment_id = row[5] if len(row) > 5 else assessment_id
# #             db_submission_id = row[6] if len(row) > 6 else None
            
# #             structured_answers = []
# #             for full_qid, answer_text in answers_json.items():
# #                 parts = full_qid.split("_")
# #                 structured_answers.append(StudentAnswer(
# #                     question_id=parts[0],
# #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #                     answer_text=answer_text,
# #                     student_index=student_index,
# #                     module_code=module_code,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     assessment_id=db_assessment_id,
# #                     submission_id=db_submission_id
# #                 ))
# #             grouped[(student_index, module_code, year, month)] = structured_answers

# #         return grouped

# #     # def get_all_answers_grouped(self, module_code: str, year: int, month: str) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# #     #     """Get all answers grouped by student for a specific module/year/month."""
# #     #     self.cursor.execute(f"""
# #     #         SELECT student_index, module_code, exam_year, exam_month, answers
# #     #         FROM {self.table_name}
# #     #         WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
# #     #     """, (module_code, year, month))

# #     #     rows = self.cursor.fetchall()
# #     #     grouped = {}

# #     #     for student_index, module_code, year, month, answers_json in rows:
# #     #         structured_answers = []
# #     #         for full_qid, answer_text in answers_json.items():
# #     #             parts = full_qid.split("_")
# #     #             structured_answers.append(StudentAnswer(
# #     #                 question_id=parts[0],
# #     #                 sub_question_id=parts[1] if len(parts) > 1 else None,
# #     #                 sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #     #                 answer_text=answer_text,
# #     #                 student_index=student_index,
# #     #                 module_code=module_code,
# #     #                 exam_year=year,
# #     #                 exam_month=month
# #     #             ))
# #     #         grouped[(student_index, module_code, year, month)] = structured_answers

# #     #     return grouped

# #     # def get_all_answers_grouped_by_assessment(self, assessment_id: str) -> Dict[str, List[StudentAnswer]]:
# #     #     """Get all answers grouped by student index for a specific assessment."""
# #     #     self.cursor.execute(f"""
# #     #         SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
# #     #         FROM {self.table_name}
# #     #         WHERE assessment_id = %s
# #     #     """, (assessment_id,))

# #     #     rows = self.cursor.fetchall()
# #     #     grouped = {}

# #     #     for student_index, module_code, year, month, answers_json, submission_id in rows:
# #     #         structured_answers = []
# #     #         for full_qid, answer_text in answers_json.items():
# #     #             parts = full_qid.split("_")
# #     #             structured_answers.append(StudentAnswer(
# #     #                 question_id=parts[0],
# #     #                 sub_question_id=parts[1] if len(parts) > 1 else None,
# #     #                 sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #     #                 answer_text=answer_text,
# #     #                 student_index=student_index,
# #     #                 module_code=module_code,
# #     #                 exam_year=year,
# #     #                 exam_month=month
# #     #             ))
# #     #         grouped[student_index] = {
# #     #             'answers': structured_answers,
# #     #             'submission_id': submission_id,
# #     #             'module_code': module_code,
# #     #             'year': year,
# #     #             'month': month
# #     #         }

# #     #     return grouped

# #     # def get_all_answers_grouped_by_assessment(self, assessment_id: str) -> Dict[str, dict]:
# #     #     """
# #     #     Get all answers grouped by student index for a specific assessment.
# #     #     Returns structure: {student_index: {'answers': [StudentAnswer], 'submission_id': str, 'module_code': str, 'year': int, 'month': str}}
# #     #     """
# #     #     self.cursor.execute(f"""
# #     #         SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
# #     #         FROM {self.table_name}
# #     #         WHERE assessment_id = %s
# #     #     """, (assessment_id,))

# #     #     rows = self.cursor.fetchall()
# #     #     grouped = {}

# #     #     for student_index, module_code, year, month, answers_json, submission_id in rows:
# #     #         structured_answers = []
# #     #         for full_qid, answer_text in answers_json.items():
# #     #             parts = full_qid.split("_")
# #     #             structured_answers.append(StudentAnswer(
# #     #                 question_id=parts[0],
# #     #                 sub_question_id=parts[1] if len(parts) > 1 else None,
# #     #                 sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #     #                 answer_text=answer_text,
# #     #                 student_index=student_index,
# #     #                 module_code=module_code,
# #     #                 exam_year=year,
# #     #                 exam_month=month
# #     #             ))
# #     #         grouped[student_index] = {
# #     #             'answers': structured_answers,
# #     #             'submission_id': submission_id,
# #     #             'module_code': module_code,
# #     #             'year': year,
# #     #             'month': month
# #     #         }

# #     #     return grouped

# #     def get_all_answers_grouped_by_assessment(self, assessment_id: str) -> Dict[str, dict]:
# #         """
# #         Get all answers grouped by student index for a specific assessment.
# #         Returns structure: {student_index: {'answers': [StudentAnswer], 'submission_id': str, 'module_code': str, 'year': int, 'month': str}}
# #         """
# #         self.cursor.execute(f"""
# #             SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
# #             FROM {self.table_name}
# #             WHERE assessment_id = %s
# #         """, (assessment_id,))

# #         rows = self.cursor.fetchall()
# #         grouped = {}

# #         for student_index, module_code, year, month, answers_json, submission_id in rows:
# #             structured_answers = []
# #             for full_qid, answer_text in answers_json.items():
# #                 parts = full_qid.split("_")
# #                 structured_answers.append(StudentAnswer(
# #                     question_id=parts[0],
# #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #                     answer_text=answer_text,
# #                     student_index=student_index,
# #                     module_code=module_code,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     assessment_id=assessment_id,  # Include assessment context
# #                     submission_id=submission_id   # Include submission context
# #                 ))
# #             grouped[student_index] = {
# #                 'answers': structured_answers,
# #                 'submission_id': submission_id,
# #                 'module_code': module_code,
# #                 'year': year,
# #                 'month': month
# #             }

# #         return grouped

# #     def get_student_indexes_for_assessment(self, assessment_id: str) -> List[str]:
# #         """Get all student indexes that have been processed for a specific assessment."""
# #         self.cursor.execute(f"""
# #             SELECT DISTINCT student_index 
# #             FROM {self.table_name}
# #             WHERE assessment_id = %s
# #             ORDER BY student_index
# #         """, (assessment_id,))
        
# #         return [row[0] for row in self.cursor.fetchall()]

# #     def get_processed_submissions_for_assessment(self, assessment_id: str) -> List[str]:
# #         """Get all submission IDs that have been processed for a specific assessment."""
# #         self.cursor.execute(f"""
# #             SELECT DISTINCT submission_id 
# #             FROM {self.table_name}
# #             WHERE assessment_id = %s AND submission_id IS NOT NULL
# #             ORDER BY submission_id
# #         """, (assessment_id,))
        
# #         return [row[0] for row in self.cursor.fetchall()]
    
# #     # Additional methods for StudentAnswerService to support assessment-specific querying

# #     def get_all_answers_grouped(self, module_code: str, year: int, month: str, assessment_id: str = None) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
# #         """Get all answers grouped by student for a specific module/year/month with optional assessment filtering."""
# #         if assessment_id:
# #             self.cursor.execute(f"""
# #                 SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id, submission_id
# #                 FROM {self.table_name}
# #                 WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s) AND assessment_id = %s
# #             """, (module_code, year, month, assessment_id))
# #         else:
# #             self.cursor.execute(f"""
# #                 SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id, submission_id
# #                 FROM {self.table_name}
# #                 WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
# #             """, (module_code, year, month))

# #         rows = self.cursor.fetchall()
# #         grouped = {}

# #         for row in rows:
# #             student_index, module_code, year, month = row[0], row[1], row[2], row[3]
# #             answers_json = row[4]
# #             db_assessment_id = row[5] if len(row) > 5 else assessment_id
# #             db_submission_id = row[6] if len(row) > 6 else None
            
# #             structured_answers = []
# #             for full_qid, answer_text in answers_json.items():
# #                 parts = full_qid.split("_")
# #                 structured_answers.append(StudentAnswer(
# #                     question_id=parts[0],
# #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #                     answer_text=answer_text,
# #                     student_index=student_index,
# #                     module_code=module_code,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     assessment_id=db_assessment_id,
# #                     submission_id=db_submission_id
# #                 ))
# #             grouped[(student_index, module_code, year, month)] = structured_answers

# #         return grouped

# #     def get_student_answers_by_assessment_and_students(self, assessment_id: str, student_indexes: List[str]) -> Dict[str, dict]:
# #         """
# #         Get student answers for specific assessment and selected students only.
# #         This is the key method for assessment-specific grading.
# #         """
# #         if not student_indexes:
# #             # If no specific students provided, get all for this assessment
# #             return self.get_all_answers_grouped_by_assessment(assessment_id)
        
# #         # Create placeholders for student_indexes
# #         placeholders = ','.join(['%s'] * len(student_indexes))
        
# #         self.cursor.execute(f"""
# #             SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
# #             FROM {self.table_name}
# #             WHERE assessment_id = %s AND student_index IN ({placeholders})
# #         """, [assessment_id] + student_indexes)

# #         rows = self.cursor.fetchall()
# #         grouped = {}

# #         for student_index, module_code, year, month, answers_json, submission_id in rows:
# #             structured_answers = []
# #             for full_qid, answer_text in answers_json.items():
# #                 parts = full_qid.split("_")
# #                 structured_answers.append(StudentAnswer(
# #                     question_id=parts[0],
# #                     sub_question_id=parts[1] if len(parts) > 1 else None,
# #                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
# #                     answer_text=answer_text,
# #                     student_index=student_index,
# #                     module_code=module_code,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     assessment_id=assessment_id,
# #                     submission_id=submission_id
# #                 ))
# #             grouped[student_index] = {
# #                 'answers': structured_answers,
# #                 'submission_id': submission_id,
# #                 'module_code': module_code,
# #                 'year': year,
# #                 'month': month
# #             }

# #         return grouped

# #     def update_assessment_context(self, student_index: str, module_code: str, year: int, month: str, 
# #                                 assessment_id: str, submission_id: str = None):
# #         """Update existing records with assessment and submission context."""
# #         update_query = f"""
# #         UPDATE {self.table_name} 
# #         SET assessment_id = %s, updated_at = CURRENT_TIMESTAMP
# #         """
# #         params = [assessment_id]
        
# #         if submission_id:
# #             update_query += ", submission_id = %s"
# #             params.append(submission_id)
        
# #         update_query += " WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s"
# #         params.extend([student_index, module_code, year, month])
        
# #         self.cursor.execute(update_query, params)
# #         self.commit()

# #     def delete_answers_by_assessment(self, assessment_id: str) -> int:
# #         """Delete all answers for a specific assessment. Returns number of deleted records."""
# #         self.cursor.execute(f"""
# #         DELETE FROM {self.table_name}
# #         WHERE assessment_id = %s
# #         """, (assessment_id,))
        
# #         deleted_count = self.cursor.rowcount
# #         self.commit()
        
# #         print(f"🗑️ Deleted {deleted_count} records from {self.table_name} for assessment {assessment_id}")
# #         return deleted_count

# #     def delete_answers_by_submission(self, submission_id: str) -> int:
# #         """Delete answers for a specific submission. Returns number of deleted records."""
# #         self.cursor.execute(f"""
# #         DELETE FROM {self.table_name}
# #         WHERE submission_id = %s
# #         """, (submission_id,))
        
# #         deleted_count = self.cursor.rowcount
# #         self.commit()
        
# #         print(f"🗑️ Deleted {deleted_count} records from {self.table_name} for submission {submission_id}")
# #         return deleted_count

# #     def get_table_stats(self) -> dict:
# #         """Get statistics about the table contents."""
# #         stats = {}
        
# #         # Total records
# #         self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name}")
# #         stats['total_records'] = self.cursor.fetchone()[0]
        
# #         # Records with assessment_id
# #         self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name} WHERE assessment_id IS NOT NULL")
# #         stats['records_with_assessment_id'] = self.cursor.fetchone()[0]
        
# #         # Records with submission_id
# #         self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name} WHERE submission_id IS NOT NULL")
# #         stats['records_with_submission_id'] = self.cursor.fetchone()[0]
        
# #         # Unique assessments
# #         self.cursor.execute(f"SELECT COUNT(DISTINCT assessment_id) FROM {self.table_name} WHERE assessment_id IS NOT NULL")
# #         stats['unique_assessments'] = self.cursor.fetchone()[0]
        
# #         # Unique students
# #         self.cursor.execute(f"SELECT COUNT(DISTINCT student_index) FROM {self.table_name}")
# #         stats['unique_students'] = self.cursor.fetchone()[0]
        
# #         # Unique modules
# #         self.cursor.execute(f"SELECT COUNT(DISTINCT module_code) FROM {self.table_name}")
# #         stats['unique_modules'] = self.cursor.fetchone()[0]
        
# #         return stats

# #     def cleanup_duplicate_submissions(self) -> int:
# #         """Remove duplicate submissions keeping the most recent one. Returns number of deleted records."""
# #         self.cursor.execute(f"""
# #         DELETE FROM {self.table_name} a
# #         USING {self.table_name} b
# #         WHERE a.submission_id = b.submission_id 
# #         AND a.submission_id IS NOT NULL
# #         AND a.created_at < b.created_at
# #         """)
        
# #         deleted_count = self.cursor.rowcount
# #         self.commit()
        
# #         if deleted_count > 0:
# #             print(f"🧹 Cleaned up {deleted_count} duplicate submission records from {self.table_name}")
        
# #         return deleted_count

# # Updated StudentAnswerService to match Prisma schema

# def initialize_table(self):
#     """Initialize table with enhanced schema including submission and assessment tracking."""
#     self.cursor.execute(f"""
#     CREATE TABLE IF NOT EXISTS {self.table_name} (
#         student_index VARCHAR,
#         module_code VARCHAR,
#         exam_year INT,
#         exam_month VARCHAR,
#         answers JSONB,
#         assessment_id TEXT,
#         submission_id TEXT,
#         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#         PRIMARY KEY (assessment_id, student_index, module_code, exam_year, exam_month)
#     );
#     """)
    
#     # Add indexes for better performance
#     self.cursor.execute(f"""
#     CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answers_', '')}_assessment 
#     ON {self.table_name} (assessment_id);
#     """)
    
#     self.cursor.execute(f"""
#     CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answers_', '')}_submission 
#     ON {self.table_name} (submission_id);
#     """)
    
#     # Add columns to existing tables if they don't exist (migration support)
#     self.cursor.execute(f"""
#     DO $$ 
#     BEGIN
#         BEGIN
#             ALTER TABLE {self.table_name} ADD COLUMN assessment_id TEXT;
#         EXCEPTION
#             WHEN duplicate_column THEN
#                 -- Column already exists, do nothing
#         END;
#         BEGIN
#             ALTER TABLE {self.table_name} ADD COLUMN submission_id TEXT;
#         EXCEPTION
#             WHEN duplicate_column THEN
#                 -- Column already exists, do nothing
#         END;
#         BEGIN
#             ALTER TABLE {self.table_name} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
#         EXCEPTION
#             WHEN duplicate_column THEN
#                 -- Column already exists, do nothing
#         END;
#         BEGIN
#             ALTER TABLE {self.table_name} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
#         EXCEPTION
#             WHEN duplicate_column THEN
#                 -- Column already exists, do nothing
#         END;
#     END $$;
#     """)
    
#     self.commit()

# def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
#     """Legacy method for backward compatibility."""
#     answer_dict = {
#         ans.full_question_id: ans.answer_text for ans in answers
#     }

#     # NOTE: This method doesn't have assessment_id, so it won't work with the new primary key
#     # Consider deprecating this method or requiring assessment_id parameter
#     raise NotImplementedError("This method requires assessment_id. Use save_answers_with_submission_tracking instead.")

# def save_answers_with_submission_tracking(self, student_index: str, module_code: str, year: int, month: int, 
#                                         answers: List[StudentAnswer], submission_id: str, assessment_id: str):
#     """Enhanced method with submission and assessment tracking."""
#     answer_dict = {
#         ans.full_question_id: ans.answer_text for ans in answers
#     }

#     # Updated to match Prisma schema primary key: (assessment_id, student_index, module_code, exam_year, exam_month)
#     self.cursor.execute(f"""
#     INSERT INTO {self.table_name} (assessment_id, student_index, module_code, exam_year, exam_month, answers, submission_id)
#     VALUES (%s, %s, %s, %s, %s, %s, %s)
#     ON CONFLICT (assessment_id, student_index, module_code, exam_year, exam_month) DO UPDATE SET
#     answers = EXCLUDED.answers,
#     submission_id = EXCLUDED.submission_id,
#     updated_at = CURRENT_TIMESTAMP
#     """, (assessment_id, student_index, module_code, year, month, json.dumps(answer_dict), submission_id))
#     self.commit()
    
#     print(f"💾 Saved to {self.table_name}: {student_index} | {module_code} | {year}-{month} | Assessment: {assessment_id} | Submission: {submission_id}")

# def get_answers(self, student_index: str, module_code: str, year: int, month: int, assessment_id: str = None) -> dict:
#     """Get answers for a specific student/module/year/month combination."""
#     if assessment_id:
#         self.cursor.execute(f"""
#         SELECT answers FROM {self.table_name}
#         WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
#         """, (assessment_id, student_index, module_code, year, month))
#     else:
#         # For backward compatibility, get the most recent assessment
#         self.cursor.execute(f"""
#         SELECT answers FROM {self.table_name}
#         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
#         ORDER BY created_at DESC LIMIT 1
#         """, (student_index, module_code, year, month))
    
#     result = self.cursor.fetchone()
#     return result[0] if result else {}

# def update_assessment_context(self, student_index: str, module_code: str, year: int, month: str, 
#                             assessment_id: str, submission_id: str = None):
#     """Update existing records with assessment and submission context."""
#     # This method needs to be updated since we can't update primary key columns
#     # Instead, we should delete and re-insert, or handle this differently
    
#     # First, check if record exists
#     self.cursor.execute(f"""
#     SELECT COUNT(*) FROM {self.table_name}
#     WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
#     """, (assessment_id, student_index, module_code, year, month))
    
#     if self.cursor.fetchone()[0] == 0:
#         print(f"⚠️ No record found to update for {student_index} in assessment {assessment_id}")
#         return
    
#     update_query = f"""
#     UPDATE {self.table_name} 
#     SET updated_at = CURRENT_TIMESTAMP
#     """
#     params = []
    
#     if submission_id:
#         update_query += ", submission_id = %s"
#         params.append(submission_id)
    
#     update_query += " WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s"
#     params.extend([assessment_id, student_index, module_code, year, month])
    
#     self.cursor.execute(update_query, params)
#     self.commit()

from .base_relational_db import BaseRelationalDB
from ...models.student_answer import StudentAnswer
from typing import Dict, Tuple, List
import json
import logging


class StudentAnswerService(BaseRelationalDB):
    def __init__(self, provider_suffix: str = ""):
        super().__init__()

        # Updated mapping to match embedder.get_table_suffix() values
        provider_table_map = {
            "openai": "student_answers_openai",
            "google_gemini": "student_answers_gemini",      # Allow snake_case
            "googlegemini": "student_answers_gemini",        # Support compact form
            "gemini": "student_answers_gemini"
        }

        normalized = provider_suffix.strip().lower()
        self.table_name = provider_table_map.get(normalized)

        if not self.table_name:
            raise ValueError(f"Invalid provider_suffix: {provider_suffix}")

        logging.info(f"[DB] Using table: {self.table_name}")
        print(f"⚙️ Using table: {self.table_name}")

    def initialize_table(self):
        """Initialize table with enhanced schema including submission and assessment tracking."""
        self.cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {self.table_name} (
            student_index VARCHAR,
            module_code VARCHAR,
            exam_year INT,
            exam_month VARCHAR,
            answers JSONB,
            assessment_id TEXT,
            submission_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (assessment_id, student_index, module_code, exam_year, exam_month)
        );
        """)
        
        # Add indexes for better performance
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answers_', '')}_assessment 
        ON {self.table_name} (assessment_id);
        """)
        
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answers_', '')}_submission 
        ON {self.table_name} (submission_id);
        """)
        
        # Add columns to existing tables if they don't exist (migration support)
        self.cursor.execute(f"""
        DO $$ 
        BEGIN
            BEGIN
                ALTER TABLE {self.table_name} ADD COLUMN assessment_id TEXT;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
            BEGIN
                ALTER TABLE {self.table_name} ADD COLUMN submission_id TEXT;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
            BEGIN
                ALTER TABLE {self.table_name} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
            BEGIN
                ALTER TABLE {self.table_name} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            EXCEPTION
                WHEN duplicate_column THEN
                    -- Column already exists, do nothing
            END;
        END $$;
        """)
        
        self.commit()

    def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
        """Legacy method - now requires assessment_id."""
        raise NotImplementedError("This method requires assessment_id. Use save_answers_with_submission_tracking instead.")

    def save_answers_with_submission_tracking(self, student_index: str, module_code: str, year: int, month: int, 
                                            answers: List[StudentAnswer], submission_id: str, assessment_id: str):
        """Enhanced method with submission and assessment tracking."""
        answer_dict = {
            ans.full_question_id: ans.answer_text for ans in answers
        }

        self.cursor.execute(f"""
        INSERT INTO {self.table_name} (assessment_id, student_index, module_code, exam_year, exam_month, answers, submission_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (assessment_id, student_index, module_code, exam_year, exam_month) DO UPDATE SET
        answers = EXCLUDED.answers,
        submission_id = EXCLUDED.submission_id,
        updated_at = CURRENT_TIMESTAMP
        """, (assessment_id, student_index, module_code, year, month, json.dumps(answer_dict), submission_id))
        self.commit()
        
        print(f"💾 Saved to {self.table_name}: {student_index} | {module_code} | {year}-{month} | Assessment: {assessment_id} | Submission: {submission_id}")

    def check_submission_extracted(self, submission_id: str) -> bool:
        """Check if a specific submission has already been extracted."""
        try:
            self.cursor.execute(f"""
            SELECT EXISTS(
                SELECT 1 FROM {self.table_name} 
                WHERE submission_id = %s
            )
            """, (submission_id,))
            
            result = self.cursor.fetchone()
            return result[0] if result else False
            
        except Exception as e:
            logging.error(f"Error checking submission extraction status: {e}")
            return False

    def get_answers(self, student_index: str, module_code: str, year: int, month: int, assessment_id: str = None) -> dict:
        """Get answers for a specific student/module/year/month combination."""
        if assessment_id:
            self.cursor.execute(f"""
            SELECT answers FROM {self.table_name}
            WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
            """, (assessment_id, student_index, module_code, year, month))
        else:
            self.cursor.execute(f"""
            SELECT answers FROM {self.table_name}
            WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
            ORDER BY created_at DESC LIMIT 1
            """, (student_index, module_code, year, month))
        result = self.cursor.fetchone()
        return result[0] if result else {}

    def get_answers_by_assessment(self, assessment_id: str) -> List[dict]:
        """Get all answers for a specific assessment."""
        self.cursor.execute(f"""
        SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
        FROM {self.table_name}
        WHERE assessment_id = %s
        """, (assessment_id,))
        
        results = []
        for row in self.cursor.fetchall():
            results.append({
                'student_index': row[0],
                'module_code': row[1],
                'exam_year': row[2],
                'exam_month': row[3],
                'answers': row[4],
                'submission_id': row[5]
            })
        
        return results

    def get_answers_by_submission(self, submission_id: str) -> dict:
        """Get answers for a specific submission."""
        self.cursor.execute(f"""
        SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id
        FROM {self.table_name}
        WHERE submission_id = %s
        """, (submission_id,))
        
        result = self.cursor.fetchone()
        if result:
            return {
                'student_index': result[0],
                'module_code': result[1],
                'exam_year': result[2],
                'exam_month': result[3],
                'answers': result[4],
                'assessment_id': result[5]
            }
        return {}

    def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str, 
                                    assessment_id: str = None, submission_id: str = None) -> List[StudentAnswer]:
        """Get all answers structured for embedding purposes with optional assessment context."""
        if assessment_id:
            self.cursor.execute(f"""
                SELECT answers, assessment_id, submission_id FROM {self.table_name}
                WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
            """, (assessment_id, student_index, module_code, year, month))
        else:
            self.cursor.execute(f"""
                SELECT answers, assessment_id, submission_id FROM {self.table_name}
                WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
                ORDER BY created_at DESC LIMIT 1
            """, (student_index, module_code, year, month))

        result = self.cursor.fetchone()
        if not result:
            return []

        raw_answers = result[0]
        db_assessment_id = result[1] if len(result) > 1 else assessment_id
        db_submission_id = result[2] if len(result) > 2 else submission_id
        
        structured_answers = []

        for full_qid, answer_text in raw_answers.items():
            parts = full_qid.split("_")
            structured_answers.append(
                StudentAnswer(
                    question_id=parts[0],
                    sub_question_id=parts[1] if len(parts) > 1 else None,
                    sub_sub_question_id=parts[2] if len(parts) > 2 else None,
                    answer_text=answer_text,
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=db_assessment_id,
                    submission_id=db_submission_id
                )
            )
        return structured_answers

    def get_all_answers_grouped(self, module_code: str, year: int, month: str, assessment_id: str = None) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
        """Get all answers grouped by student for a specific module/year/month with optional assessment filtering."""
        if assessment_id:
            self.cursor.execute(f"""
                SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id, submission_id
                FROM {self.table_name}
                WHERE assessment_id = %s AND LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
            """, (assessment_id, module_code, year, month))
        else:
            self.cursor.execute(f"""
                SELECT student_index, module_code, exam_year, exam_month, answers, assessment_id, submission_id
                FROM {self.table_name}
                WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
            """, (module_code, year, month))

        rows = self.cursor.fetchall()
        grouped = {}

        for row in rows:
            student_index, module_code, year, month = row[0], row[1], row[2], row[3]
            answers_json = row[4]
            db_assessment_id = row[5] if len(row) > 5 else assessment_id
            db_submission_id = row[6] if len(row) > 6 else None
            
            structured_answers = []
            for full_qid, answer_text in answers_json.items():
                parts = full_qid.split("_")
                structured_answers.append(StudentAnswer(
                    question_id=parts[0],
                    sub_question_id=parts[1] if len(parts) > 1 else None,
                    sub_sub_question_id=parts[2] if len(parts) > 2 else None,
                    answer_text=answer_text,
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=db_assessment_id,
                    submission_id=db_submission_id
                ))
            grouped[(student_index, module_code, year, month)] = structured_answers

        return grouped

    def get_all_answers_grouped_by_assessment(self, assessment_id: str) -> Dict[str, dict]:
        """
        Get all answers grouped by student index for a specific assessment.
        Returns structure: {student_index: {'answers': [StudentAnswer], 'submission_id': str, 'module_code': str, 'year': int, 'month': str}}
        """
        self.cursor.execute(f"""
            SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
            FROM {self.table_name}
            WHERE assessment_id = %s
        """, (assessment_id,))

        rows = self.cursor.fetchall()
        grouped = {}

        for student_index, module_code, year, month, answers_json, submission_id in rows:
            structured_answers = []
            for full_qid, answer_text in answers_json.items():
                parts = full_qid.split("_")
                structured_answers.append(StudentAnswer(
                    question_id=parts[0],
                    sub_question_id=parts[1] if len(parts) > 1 else None,
                    sub_sub_question_id=parts[2] if len(parts) > 2 else None,
                    answer_text=answer_text,
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=assessment_id,
                    submission_id=submission_id
                ))
            grouped[student_index] = {
                'answers': structured_answers,
                'submission_id': submission_id,
                'module_code': module_code,
                'year': year,
                'month': month
            }

        return grouped

    def get_student_indexes_for_assessment(self, assessment_id: str) -> List[str]:
        """Get all student indexes that have been processed for a specific assessment."""
        self.cursor.execute(f"""
            SELECT DISTINCT student_index 
            FROM {self.table_name}
            WHERE assessment_id = %s
            ORDER BY student_index
        """, (assessment_id,))
        
        return [row[0] for row in self.cursor.fetchall()]

    def get_processed_submissions_for_assessment(self, assessment_id: str) -> List[str]:
        """Get all submission IDs that have been processed for a specific assessment."""
        self.cursor.execute(f"""
            SELECT DISTINCT submission_id 
            FROM {self.table_name}
            WHERE assessment_id = %s AND submission_id IS NOT NULL
            ORDER BY submission_id
        """, (assessment_id,))
        
        return [row[0] for row in self.cursor.fetchall()]

    def get_student_answers_by_assessment_and_students(self, assessment_id: str, student_indexes: List[str]) -> Dict[str, dict]:
        """
        Get student answers for specific assessment and selected students only.
        This is the key method for assessment-specific grading.
        """
        if not student_indexes:
            return self.get_all_answers_grouped_by_assessment(assessment_id)
        
        placeholders = ','.join(['%s'] * len(student_indexes))
        
        self.cursor.execute(f"""
            SELECT student_index, module_code, exam_year, exam_month, answers, submission_id
            FROM {self.table_name}
            WHERE assessment_id = %s AND student_index IN ({placeholders})
        """, [assessment_id] + student_indexes)

        rows = self.cursor.fetchall()
        grouped = {}

        for student_index, module_code, year, month, answers_json, submission_id in rows:
            structured_answers = []
            for full_qid, answer_text in answers_json.items():
                parts = full_qid.split("_")
                structured_answers.append(StudentAnswer(
                    question_id=parts[0],
                    sub_question_id=parts[1] if len(parts) > 1 else None,
                    sub_sub_question_id=parts[2] if len(parts) > 2 else None,
                    answer_text=answer_text,
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=assessment_id,
                    submission_id=submission_id
                ))
            grouped[student_index] = {
                'answers': structured_answers,
                'submission_id': submission_id,
                'module_code': module_code,
                'year': year,
                'month': month
            }

        return grouped

    def update_assessment_context(self, student_index: str, module_code: str, year: int, month: str, 
                                assessment_id: str, submission_id: str = None):
        """Update existing records with assessment and submission context."""
        self.cursor.execute(f"""
        SELECT COUNT(*) FROM {self.table_name}
        WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
        """, (assessment_id, student_index, module_code, year, month))
        
        if self.cursor.fetchone()[0] == 0:
            print(f"⚠️ No record found to update for {student_index} in assessment {assessment_id}")
            return
        
        update_query = f"""
        UPDATE {self.table_name} 
        SET updated_at = CURRENT_TIMESTAMP
        """
        params = []
        
        if submission_id:
            update_query += ", submission_id = %s"
            params.append(submission_id)
        
        update_query += " WHERE assessment_id = %s AND student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s"
        params.extend([assessment_id, student_index, module_code, year, month])
        
        self.cursor.execute(update_query, params)
        self.commit()

    def delete_answers_by_assessment(self, assessment_id: str) -> int:
        """Delete all answers for a specific assessment. Returns number of deleted records."""
        self.cursor.execute(f"""
        DELETE FROM {self.table_name}
        WHERE assessment_id = %s
        """, (assessment_id,))
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        print(f"🗑️ Deleted {deleted_count} records from {self.table_name} for assessment {assessment_id}")
        return deleted_count

    def delete_answers_by_submission(self, submission_id: str) -> int:
        """Delete answers for a specific submission. Returns number of deleted records."""
        self.cursor.execute(f"""
        DELETE FROM {self.table_name}
        WHERE submission_id = %s
        """, (submission_id,))
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        print(f"🗑️ Deleted {deleted_count} records from {self.table_name} for submission {submission_id}")
        return deleted_count

    def get_table_stats(self) -> dict:
        """Get statistics about the table contents."""
        stats = {}
        
        self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name}")
        stats['total_records'] = self.cursor.fetchone()[0]
        
        self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name} WHERE assessment_id IS NOT NULL")
        stats['records_with_assessment_id'] = self.cursor.fetchone()[0]
        
        self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name} WHERE submission_id IS NOT NULL")
        stats['records_with_submission_id'] = self.cursor.fetchone()[0]
        
        self.cursor.execute(f"SELECT COUNT(DISTINCT assessment_id) FROM {self.table_name} WHERE assessment_id IS NOT NULL")
        stats['unique_assessments'] = self.cursor.fetchone()[0]
        
        self.cursor.execute(f"SELECT COUNT(DISTINCT student_index) FROM {self.table_name}")
        stats['unique_students'] = self.cursor.fetchone()[0]
        
        self.cursor.execute(f"SELECT COUNT(DISTINCT module_code) FROM {self.table_name}")
        stats['unique_modules'] = self.cursor.fetchone()[0]
        
        return stats

    def cleanup_duplicate_submissions(self) -> int:
        """Remove duplicate submissions keeping the most recent one. Returns number of deleted records."""
        self.cursor.execute(f"""
        DELETE FROM {self.table_name} a
        USING {self.table_name} b
        WHERE a.submission_id = b.submission_id 
        AND a.submission_id IS NOT NULL
        AND a.created_at < b.created_at
        """)
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        if deleted_count > 0:
            print(f"🧹 Cleaned up {deleted_count} duplicate submission records from {self.table_name}")
        
        return deleted_count