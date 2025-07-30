

# from .base_relational_db import BaseRelationalDB
# from ...models.student_answer import StudentAnswer
# from typing import Dict, Tuple, List
# import json
# import logging


# class StudentAnswerService(BaseRelationalDB):
#     def __init__(self, provider_suffix: str = ""):
#         super().__init__()

#         # Force mapping of providers to proper suffixes
#         provider_table_map = {
#             "openai": "student_answers_openai",
#             "googlegemini": "student_answers_gemini"
#         }

#         normalized = provider_suffix.strip().lower()
#         self.table_name = provider_table_map.get(normalized, "student_answers")

#         logging.info(f"[DB] Using table: {self.table_name}")
#         print(f"⚙️ Using table: {self.table_name}")  # DEBUG PRINT

#     def initialize_table(self):
#         self.cursor.execute(f"""
#         CREATE TABLE IF NOT EXISTS {self.table_name} (
#             student_index VARCHAR,
#             module_code VARCHAR,
#             exam_year INT,
#             exam_month VARCHAR,
#             answers JSONB,
#             PRIMARY KEY (student_index, module_code, exam_year, exam_month)
#         );
#         """)
#         self.commit()

#     def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
#         answer_dict = {
#             ans.full_question_id: ans.answer_text for ans in answers
#         }

#         self.cursor.execute(f"""
#         INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers)
#         VALUES (%s, %s, %s, %s, %s)
#         ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
#         answers = EXCLUDED.answers
#         """, (student_index, module_code, year, month, json.dumps(answer_dict)))
#         self.commit()

#     def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
#         self.cursor.execute(f"""
#         SELECT answers FROM {self.table_name}
#         WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
#         """, (student_index, module_code, year, month))
#         result = self.cursor.fetchone()
#         return result[0] if result else {}

#     def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str) -> List[StudentAnswer]:
#         self.cursor.execute(f"""
#             SELECT answers FROM {self.table_name}
#             WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
#         """, (student_index, module_code, year, month))

#         result = self.cursor.fetchone()
#         if not result:
#             return []

#         raw_answers = result[0]  # This is a dict of {question_id: answer_text}
#         structured_answers = []

#         for full_qid, answer_text in raw_answers.items():
#             parts = full_qid.split("_")
#             structured_answers.append(
#                 StudentAnswer(
#                     question_id=parts[0],
#                     sub_question_id=parts[1] if len(parts) > 1 else None,
#                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
#                     answer_text=answer_text,
#                     student_index=student_index,
#                     module_code=module_code,
#                     exam_year=year,
#                     exam_month=month
#                 )
#             )
#         return structured_answers

#     def get_all_answers_grouped(self, module_code: str, year: int, month: str) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
#         self.cursor.execute(f"""
#             SELECT student_index, module_code, exam_year, exam_month, answers
#             FROM {self.table_name}
#             WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
#         """, (module_code, year, month))

#         rows = self.cursor.fetchall()
#         grouped = {}

#         for student_index, module_code, year, month, answers_json in rows:
#             structured_answers = []
#             for full_qid, answer_text in answers_json.items():
#                 parts = full_qid.split("_")
#                 structured_answers.append(StudentAnswer(
#                     question_id=parts[0],
#                     sub_question_id=parts[1] if len(parts) > 1 else None,
#                     sub_sub_question_id=parts[2] if len(parts) > 2 else None,
#                     answer_text=answer_text,
#                     student_index=student_index,
#                     module_code=module_code,
#                     exam_year=year,
#                     exam_month=month
#                 ))
#             grouped[(student_index, module_code, year, month)] = structured_answers

#         return grouped

 

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
        self.cursor.execute(f"""
        CREATE TABLE IF NOT EXISTS {self.table_name} (
            student_index VARCHAR,
            module_code VARCHAR,
            exam_year INT,
            exam_month VARCHAR,
            answers JSONB,
            PRIMARY KEY (student_index, module_code, exam_year, exam_month)
        );
        """)
        self.commit()

    def save_answers(self, student_index: str, module_code: str, year: int, month: int, answers: List[StudentAnswer]):
        answer_dict = {
            ans.full_question_id: ans.answer_text for ans in answers
        }

        self.cursor.execute(f"""
        INSERT INTO {self.table_name} (student_index, module_code, exam_year, exam_month, answers)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
        answers = EXCLUDED.answers
        """, (student_index, module_code, year, month, json.dumps(answer_dict)))
        self.commit()

    def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
        self.cursor.execute(f"""
        SELECT answers FROM {self.table_name}
        WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
        """, (student_index, module_code, year, month))
        result = self.cursor.fetchone()
        return result[0] if result else {}

    def get_all_answers_for_embedding(self, student_index: str, module_code: str, year: int, month: str) -> List[StudentAnswer]:
        self.cursor.execute(f"""
            SELECT answers FROM {self.table_name}
            WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
        """, (student_index, module_code, year, month))

        result = self.cursor.fetchone()
        if not result:
            return []

        raw_answers = result[0]
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
                    exam_month=month
                )
            )
        return structured_answers

    def get_all_answers_grouped(self, module_code: str, year: int, month: str) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
        self.cursor.execute(f"""
            SELECT student_index, module_code, exam_year, exam_month, answers
            FROM {self.table_name}
            WHERE LOWER(module_code) = LOWER(%s) AND exam_year = %s AND LOWER(exam_month) = LOWER(%s)
        """, (module_code, year, month))

        rows = self.cursor.fetchall()
        grouped = {}

        for student_index, module_code, year, month, answers_json in rows:
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
                    exam_month=month
                ))
            grouped[(student_index, module_code, year, month)] = structured_answers

        return grouped
