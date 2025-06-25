# # # src/services/database/student_answer_service.py

# # from .base_db_service import BaseDBService

# # class StudentAnswerService(BaseDBService):
# #     def initialize_table(self):
# #         self.cursor.execute("""
# #             CREATE TABLE IF NOT EXISTS student_answers (
# #                 student_index VARCHAR PRIMARY KEY,
# #                 q1_i TEXT, q1_ii TEXT, q1_iii TEXT, q1_iv TEXT, q1_v TEXT,
# #                 q2_i TEXT, q2_ii TEXT, q2_iii TEXT, q2_iv TEXT, q2_v TEXT,
# #                 q3_i TEXT, q3_ii TEXT, q3_iii TEXT, q3_iv TEXT, q3_v TEXT,
# #                 q4_i TEXT, q4_ii TEXT, q4_iii TEXT, q4_iv TEXT, q4_v TEXT,
# #                 q5_i TEXT, q5_ii TEXT, q5_iii TEXT, q5_iv TEXT, q5_v TEXT
# #             )
# #         """)
# #         self.commit()

# # src/services/database_services/student_answer_db.py

# from .base_db_service import BaseDBService
# from typing import List
# from ...models.student_answer import StudentAnswer

# class StudentAnswerService(BaseDBService):
#     def initialize_table(self):
#         self.cursor.execute("""
#             CREATE TABLE IF NOT EXISTS student_answers (
#                 student_index VARCHAR PRIMARY KEY,
#                 q1_i TEXT, q1_ii TEXT, q1_iii TEXT, q1_iv TEXT, q1_v TEXT,
#                 q2_i TEXT, q2_ii TEXT, q2_iii TEXT, q2_iv TEXT, q2_v TEXT,
#                 q3_i TEXT, q3_ii TEXT, q3_iii TEXT, q3_iv TEXT, q3_v TEXT,
#                 q4_i TEXT, q4_ii TEXT, q4_iii TEXT, q4_iv TEXT, q4_v TEXT,
#                 q5_i TEXT, q5_ii TEXT, q5_iii TEXT, q5_iv TEXT, q5_v TEXT
#             )
#         """)
#         self.commit()

#     def save_student_answers(self, student_index: str, answers: List[StudentAnswer]):
#         # Create a column mapping
#         columns = [f"q{q}_{s}" for q in range(1, 6) for s in ["i", "ii", "iii", "iv", "v"]]
#         values_map = {col: None for col in columns}

#         for ans in answers:
#             key = f"{ans.question_id.lower()}_{ans.sub_question_id.lower()}"
#             if key in values_map:
#                 values_map[key] = ans.answer_text

#         insert_columns = ["student_index"] + columns
#         insert_values = [student_index] + [values_map[col] for col in columns]
#         placeholders = ["%s"] * len(insert_columns)

#         from psycopg2 import sql
#         query = sql.SQL("""
#             INSERT INTO student_answers ({fields})
#             VALUES ({values})
#             ON CONFLICT (student_index) DO UPDATE SET
#             {updates}
#         """).format(
#             fields=sql.SQL(", ").join(map(sql.Identifier, insert_columns)),
#             values=sql.SQL(", ").join(sql.Placeholder() * len(insert_columns)),
#             updates=sql.SQL(", ").join(
#                 sql.Composed([
#                     sql.Identifier(col),
#                     sql.SQL(" = EXCLUDED."),
#                     sql.Identifier(col)
#                 ]) for col in columns
#             )
#         )

#         self.cursor.execute(query, insert_values)
#         self.commit()
    
#     def get_student_answers(self, student_index: str) -> dict:
#         self.cursor.execute("""
#         SELECT * FROM student_answers WHERE student_index = %s
#         """, (student_index,))
#         row = self.cursor.fetchone()

#         if not row:
#             return {}

#         colnames = [desc[0] for desc in self.cursor.description]
#         return dict(zip(colnames, row))

# from .base_db_service import BaseDBService
# from typing import List
# from ...models.student_answer import StudentAnswer
# from psycopg2 import sql

# class StudentAnswerService(BaseDBService):
#     def initialize_table(self):
#         self.cursor.execute("""
#             CREATE TABLE IF NOT EXISTS student_answers (
#                 student_index VARCHAR PRIMARY KEY,
#                 q1_i TEXT, q1_ii TEXT, q1_iii TEXT, q1_iv TEXT, q1_v TEXT,
#                 q2_i TEXT, q2_ii TEXT, q2_iii TEXT, q2_iv TEXT, q2_v TEXT,
#                 q3_i TEXT, q3_ii TEXT, q3_iii TEXT, q3_iv TEXT, q3_v TEXT,
#                 q4_i TEXT, q4_ii TEXT, q4_iii TEXT, q4_iv TEXT, q4_v TEXT,
#                 q5_i TEXT, q5_ii TEXT, q5_iii TEXT, q5_iv TEXT, q5_v TEXT
#             )
#         """)
#         self.commit()

#     def save_student_answers(self, student_index: str, answers: List[StudentAnswer]):
#         columns = [f"q{q}_{s}" for q in range(1, 6) for s in ["i", "ii", "iii", "iv", "v"]]
#         values_map = {col: None for col in columns}

#         for ans in answers:
#             key = f"{ans.question_id.lower()}_{ans.sub_question_id.lower()}"
#             if key in values_map:
#                 values_map[key] = ans.answer_text

#         insert_columns = ["student_index"] + columns
#         insert_values = [student_index] + [values_map[col] for col in columns]
#         placeholders = ["%s"] * len(insert_columns)

#         query = sql.SQL("""
#             INSERT INTO student_answers ({fields})
#             VALUES ({values})
#             ON CONFLICT (student_index) DO UPDATE SET
#             {updates}
#         """).format(
#             fields=sql.SQL(", ").join(map(sql.Identifier, insert_columns)),
#             values=sql.SQL(", ").join(sql.Placeholder() * len(insert_columns)),
#             updates=sql.SQL(", ").join(
#                 sql.Composed([sql.Identifier(col), sql.SQL(" = EXCLUDED."), sql.Identifier(col)])
#                 for col in columns
#             )
#         )

#         self.cursor.execute(query, insert_values)
#         self.commit()

#     def get_answers_by_index(self, student_index: str) -> dict:
#         self.cursor.execute("""
#             SELECT * FROM student_answers WHERE student_index = %s
#         """, (student_index,))
#         result = self.cursor.fetchone()
#         if result is None:
#             return {}

#         column_names = [desc[0] for desc in self.cursor.description]
#         return dict(zip(column_names, result))
    
#     def get_student_answers(self, student_index: str) -> dict:
#         self.cursor.execute("""
#         SELECT * FROM student_answers WHERE student_index = %s
#         """, (student_index,))
#         row = self.cursor.fetchone()

#         if not row:
#             return {}

#         colnames = [desc[0] for desc in self.cursor.description]
#         return dict(zip(colnames, row))


from .base_relational_db import BaseRelationalDB
from ...models.student_answer import StudentAnswer
from typing import List
import json

class StudentAnswerService(BaseRelationalDB):
    def initialize_table(self):
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_answers (
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

        self.cursor.execute("""
        INSERT INTO student_answers (student_index, module_code, exam_year, exam_month, answers)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (student_index, module_code, exam_year, exam_month) DO UPDATE SET
        answers = EXCLUDED.answers
        """, (student_index, module_code, year, month, json.dumps(answer_dict)))
        self.commit()

    def get_answers(self, student_index: str, module_code: str, year: int, month: int) -> dict:
        self.cursor.execute("""
        SELECT answers FROM student_answers
        WHERE student_index = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
        """, (student_index, module_code, year, month))
        result = self.cursor.fetchone()
        return result[0] if result else {}
