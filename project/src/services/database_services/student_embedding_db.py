# from .base_db_service import BaseDBService
# import logging

# logger = logging.getLogger(__name__)

# # class StudentEmbeddingService(BaseDBService):
# #     def initialize_table(self):
# #         self.cursor.execute("""
# #             CREATE TABLE IF NOT EXISTS student_answer_embeddings (
# #                 student_index VARCHAR PRIMARY KEY,
# #                 q1_i vector(1536), q1_ii vector(1536), q1_iii vector(1536), q1_iv vector(1536), q1_v vector(1536),
# #                 q2_i vector(1536), q2_ii vector(1536), q2_iii vector(1536), q2_iv vector(1536), q2_v vector(1536),
# #                 q3_i vector(1536), q3_ii vector(1536), q3_iii vector(1536), q3_iv vector(1536), q3_v vector(1536),
# #                 q4_i vector(1536), q4_ii vector(1536), q4_iii vector(1536), q4_iv vector(1536), q4_v vector(1536),
# #                 q5_i vector(1536), q5_ii vector(1536), q5_iii vector(1536), q5_iv vector(1536), q5_v vector(1536)
# #             )
# #         """)
# #         self.commit()

# #     def save_student_embeddings(self, student_index: str, embeddings_map: dict):
# #         columns = list(embeddings_map.keys())
# #         values = list(embeddings_map.values())
# #         insert_columns = ["student_index"] + columns
# #         placeholders = ["%s"] * len(insert_columns)

# #         from psycopg2 import sql
# #         query = sql.SQL("""
# #             INSERT INTO student_answer_embeddings ({fields})
# #             VALUES ({values})
# #             ON CONFLICT (student_index) DO UPDATE SET
# #             {updates}
# #         """).format(
# #             fields=sql.SQL(", ").join(map(sql.Identifier, insert_columns)),
# #             values=sql.SQL(", ").join(sql.Placeholder() * len(insert_columns)),
# #             updates=sql.SQL(", ").join(
# #                 sql.Composed([sql.Identifier(col), sql.SQL(" = EXCLUDED."), sql.Identifier(col)])
# #                 for col in columns
# #             )
# #         )

# #         self.cursor.execute(query, [student_index] + values)
# #         self.commit()


# from .base_db_service import BaseDBService
# from psycopg2 import sql
# from typing import Dict, List

# class StudentEmbeddingService(BaseDBService):
#     def initialize_table(self):
#         self.cursor.execute("""
#             CREATE EXTENSION IF NOT EXISTS vector;
#         """)
#         self.cursor.execute("""
#             CREATE TABLE IF NOT EXISTS student_answer_embeddings (
#                 student_index VARCHAR PRIMARY KEY,
#                 q1_i vector(1536), q1_ii vector(1536), q1_iii vector(1536), q1_iv vector(1536), q1_v vector(1536),
#                 q2_i vector(1536), q2_ii vector(1536), q2_iii vector(1536), q2_iv vector(1536), q2_v vector(1536),
#                 q3_i vector(1536), q3_ii vector(1536), q3_iii vector(1536), q3_iv vector(1536), q3_v vector(1536),
#                 q4_i vector(1536), q4_ii vector(1536), q4_iii vector(1536), q4_iv vector(1536), q4_v vector(1536),
#                 q5_i vector(1536), q5_ii vector(1536), q5_iii vector(1536), q5_iv vector(1536), q5_v vector(1536)
#             )
#         """)
#         self.commit()

#     def save_student_embeddings(self, student_index: str, embeddings_map: Dict[str, List[float]]):
#         columns = list(embeddings_map.keys())
#         vectors = [embeddings_map[col] for col in columns]

#         insert_columns = ["student_index"] + columns
#         placeholders = ["%s"] * len(insert_columns)
#         insert_values = [student_index] + vectors

#         query = sql.SQL("""
#             INSERT INTO student_answer_embeddings ({fields})
#             VALUES ({values})
#             ON CONFLICT (student_index) DO UPDATE SET
#             {updates}
#         """).format(
#             fields=sql.SQL(', ').join(map(sql.Identifier, insert_columns)),
#             values=sql.SQL(', ').join(sql.Placeholder() * len(insert_columns)),
#             updates=sql.SQL(', ').join(
#                 sql.Composed([
#                     sql.Identifier(col),
#                     sql.SQL(" = EXCLUDED."),
#                     sql.Identifier(col)
#                 ]) for col in columns
#             )
#         )

#         # Execute insert/update
#         self.cursor.execute(query, insert_values)
#         self.commit()


# import logging
# from typing import List
# from pgvector.psycopg2 import register_vector
# from .base_vector_db_service import BaseVectorDBService
# from ..embedding.abstract_embedder import AbstractEmbedder
# from ...models.student_answer import StudentAnswer

# logger = logging.getLogger(__name__)

# class StudentAnswerEmbeddingDB(BaseVectorDBService):
#     def __init__(self, embedder: AbstractEmbedder):
#         super().__init__()
#         self.embedder = embedder
#         register_vector(self.conn)
#         self.table_name = "student_answer_embeddings"
#         self._create_table()

#     def _create_table(self):
#         dim = self.embedder.get_embedding_dimension()
#         self.cursor.execute(f"""
#             CREATE TABLE IF NOT EXISTS {self.table_name} (
#                 id SERIAL PRIMARY KEY,
#                 student_index TEXT,
#                 question_id TEXT,
#                 sub_question_id TEXT,
#                 sub_sub_question_id TEXT,
#                 full_question_id TEXT,
#                 module_code TEXT,
#                 exam_year INT,
#                 exam_month TEXT,
#                 embedding vector({dim})
#             );
#         """)
#         self.commit()

#     def save_embeddings(self, answers: List[StudentAnswer]):
#         texts = [a.answer_text for a in answers]
#         vectors = self.embedder.embed(texts)

#         for answer, vector in zip(answers, vectors):
#             self.cursor.execute(f"""
#                 INSERT INTO {self.table_name} (
#                     student_index, question_id, sub_question_id, sub_sub_question_id,
#                     full_question_id, module_code, exam_year, exam_month, embedding
#                 ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
#             """, (
#                 answer.student_index,
#                 answer.question_id,
#                 answer.sub_question_id,
#                 answer.sub_sub_question_id,
#                 answer.full_question_id,
#                 answer.module_code,
#                 answer.exam_year,
#                 answer.exam_month,
#                 vector
#             ))
#         self.commit()

# src/services/database_services/student_embedding_db.py

# import logging
# from typing import List
# from pgvector.psycopg2 import register_vector
# from .base_vector_db_service import BaseVectorDBService
# from ..embedding.abstract_embedder import AbstractEmbedder
# from ...models.student_answer import StudentAnswer

# logger = logging.getLogger(__name__)

# class StudentAnswerEmbeddingDB(BaseVectorDBService):
#     def __init__(self, embedder: AbstractEmbedder):
#         super().__init__()
#         self.embedder = embedder
#         register_vector(self.conn)
#         self.table_name = "student_answer_embeddings"
#         self._create_table()

#     def _create_table(self):
#         dim = self.embedder.get_embedding_dimension()
#         self.cursor.execute(f"""
#             CREATE TABLE IF NOT EXISTS {self.table_name} (
#                 id SERIAL PRIMARY KEY,
#                 student_index TEXT,
#                 question_id TEXT,
#                 sub_question_id TEXT,
#                 sub_sub_question_id TEXT,
#                 full_question_id TEXT,
#                 module_code TEXT,
#                 exam_year INT,
#                 exam_month TEXT,
#                 embedding vector({dim})
#             );
#         """)
#         self.commit()

#     def save_embeddings(self, answers: List[StudentAnswer]):
#         if not answers:
#             logger.warning("No answers provided for embedding.")
#             return

#         texts = [a.answer_text for a in answers]
#         vectors = self.embedder.embed(texts)

#         for answer, vector in zip(answers, vectors):
#             self.cursor.execute(f"""
#                 INSERT INTO {self.table_name} (
#                     student_index, question_id, sub_question_id, sub_sub_question_id,
#                     full_question_id, module_code, exam_year, exam_month, embedding
#                 ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
#             """, (
#                 answer.student_index,
#                 answer.question_id,
#                 answer.sub_question_id,
#                 answer.sub_sub_question_id,
#                 answer.full_question_id,
#                 answer.module_code,
#                 answer.exam_year,
#                 answer.exam_month,
#                 vector
#             ))
#         self.commit()


import logging
from typing import Dict, Tuple, List
from pgvector.psycopg2 import register_vector

from .base_vector_db_service import BaseVectorDBService
from ..embedding.abstract_embedder import AbstractEmbedder
from ...models.student_answer import StudentAnswer

logger = logging.getLogger(__name__)

class StudentAnswerEmbeddingDB(BaseVectorDBService):
    def __init__(self, embedder: AbstractEmbedder):
        super().__init__()
        self.embedder = embedder
        register_vector(self.conn)
        self.table_name = "student_answer_embeddings"
        self._create_table()

    def _create_table(self):
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table_name} (
                id SERIAL PRIMARY KEY,
                student_index TEXT,
                question_id TEXT,
                sub_question_id TEXT,
                sub_sub_question_id TEXT,
                full_question_id TEXT,
                module_code TEXT,
                exam_year INT,
                exam_month TEXT,
                embedding vector({dim}),
                UNIQUE (student_index, module_code, exam_year, exam_month, full_question_id)
            );
        """)
        self.commit()

    def save_embeddings(self, answers: List[StudentAnswer]):
        """
        Save vector embeddings for each StudentAnswer, question-wise.
        If a record already exists for a question, it will be updated.
        """
        if not answers:
            logger.warning("No answers provided for embedding.")
            return

        texts = [a.answer_text for a in answers]
        vectors = self.embedder.embed(texts)

        for answer, vector in zip(answers, vectors):
            self.cursor.execute(f"""
                INSERT INTO {self.table_name} (
                    student_index, question_id, sub_question_id, sub_sub_question_id,
                    full_question_id, module_code, exam_year, exam_month, embedding
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (student_index, module_code, exam_year, exam_month, full_question_id)
                DO UPDATE SET embedding = EXCLUDED.embedding
            """, (
                answer.student_index,
                answer.question_id,
                answer.sub_question_id,
                answer.sub_sub_question_id,
                answer.full_question_id,
                answer.module_code,
                answer.exam_year,
                answer.exam_month,
                vector
            ))

        self.commit()
        logger.info(f"Saved embeddings for {len(answers)} answers.")

    # def get_all_answers_grouped(self) -> Dict[Tuple[str, str, int, str], List[StudentAnswer]]:
    #     """
    #     Group all student answers question-wise for all papers.
    #     Output: { (student_index, module_code, year, month): [StudentAnswer, ...] }
    #     """
    #     self.cursor.execute("""
    #         SELECT student_index, module_code, exam_year, exam_month, answers
    #         FROM student_answers
    #     """)
    #     rows = self.cursor.fetchall()

    #     grouped: Dict[Tuple[str, str, int, str], List[StudentAnswer]] = {}

    #     for student_index, module_code, year, month, answers_json in rows:
    #         structured_answers = []
    #         for full_qid, answer_text in answers_json.items():
    #             parts = full_qid.split("_")
    #             structured_answers.append(StudentAnswer(
    #                 question_id=parts[0],
    #                 sub_question_id=parts[1] if len(parts) > 1 else None,
    #                 sub_sub_question_id=parts[2] if len(parts) > 2 else None,
    #                 answer_text=answer_text,
    #                 full_question_id=full_qid,
    #                 student_index=student_index,
    #                 module_code=module_code,
    #                 exam_year=year,
    #                 exam_month=month
    #             ))

    #         grouped[(student_index, module_code, year, month)] = structured_answers

    #     return grouped
