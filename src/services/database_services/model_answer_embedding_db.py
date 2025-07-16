# # from .base_db_service import BaseDBService
# # from psycopg2 import sql
# # from typing import Dict, List
# # import logging

# # logger = logging.getLogger(__name__)

# # class ModelAnswerEmbeddingService(BaseDBService):
# #     def initialize_table(self):
# #         self.cursor.execute("""CREATE EXTENSION IF NOT EXISTS vector;""")
# #         self.cursor.execute("""
# #             CREATE TABLE IF NOT EXISTS model_answer_embeddings (
# #                 question_id VARCHAR PRIMARY KEY,
# #                 q1_i vector(1536), q1_ii vector(1536), q1_iii vector(1536), q1_iv vector(1536), q1_v vector(1536),
# #                 q2_i vector(1536), q2_ii vector(1536), q2_iii vector(1536), q2_iv vector(1536), q2_v vector(1536),
# #                 q3_i vector(1536), q3_ii vector(1536), q3_iii vector(1536), q3_iv vector(1536), q3_v vector(1536),
# #                 q4_i vector(1536), q4_ii vector(1536), q4_iii vector(1536), q4_iv vector(1536), q4_v vector(1536),
# #                 q5_i vector(1536), q5_ii vector(1536), q5_iii vector(1536), q5_iv vector(1536), q5_v vector(1536)
# #             )
# #         """)
# #         self.commit()

# #     def save_model_embeddings(self, question_id: str, embeddings_map: Dict[str, List[float]]):
# #         columns = list(embeddings_map.keys())
# #         vectors = [embeddings_map[col] for col in columns]

# #         insert_columns = ["question_id"] + columns
# #         insert_values = [question_id] + vectors

# #         query = sql.SQL("""
# #             INSERT INTO model_answer_embeddings ({fields})
# #             VALUES ({values})
# #             ON CONFLICT (question_id) DO UPDATE SET
# #             {updates}
# #         """).format(
# #             fields=sql.SQL(', ').join(map(sql.Identifier, insert_columns)),
# #             values=sql.SQL(', ').join(sql.Placeholder() * len(insert_columns)),
# #             updates=sql.SQL(', ').join(
# #                 sql.Composed([
# #                     sql.Identifier(col),
# #                     sql.SQL(" = EXCLUDED."),
# #                     sql.Identifier(col)
# #                 ]) for col in columns
# #             )
# #         )

# #         self.cursor.execute(query, insert_values)
# #         self.commit()


# from __future__ import annotations
# import logging
# from typing import List
# from pgvector.psycopg2 import register_vector

# from .base_vector_db_service import BaseVectorDBService
# from ..embedding.abstract_embedder import AbstractEmbedder
# from ...models.model_answer import ModelAnswer

# logger = logging.getLogger(__name__)


# class ModelAnswerEmbeddingDB(BaseVectorDBService):
#     """Stores model-answer vectors; embedder is injected at runtime."""
#     table_name = "model_answer_embeddings"

#     def __init__(self, embedder: AbstractEmbedder):
#         super().__init__()
#         self.embedder = embedder
#         register_vector(self.conn)
#         self._create_table()

#     # ---------- schema ----------
#     def _create_table(self):
#         dim = self.embedder.get_embedding_dimension()
#         self.cursor.execute(
#             f"""
#             CREATE TABLE IF NOT EXISTS {self.table_name} (
#                 id SERIAL PRIMARY KEY,
#                 module_code TEXT,
#                 question_id TEXT,
#                 sub_question_id TEXT,
#                 sub_sub_question_id TEXT,
#                 full_question_id TEXT UNIQUE,
#                 marks INT,
#                 key_points TEXT,
#                 marking_instruction TEXT,
#                 embedding vector({dim})
#             );
#         """
#         )
#         self.commit()

#     # ---------- persistence ----------
#     def save_embeddings(self, answers: List[ModelAnswer]):
#         if not answers:
#             logger.warning("No model answers to embed.")
#             return

#         texts = [
#             f"{a.question_text}\nKey Points:{a.key_points}"
#             for a in answers
#         ]
#         vectors = self.embedder.embed(texts)

#         for a, vec in zip(answers, vectors):
#             self.cursor.execute(
#                 f"""
#                 INSERT INTO {self.table_name} (
#                     module_code, question_id, sub_question_id, sub_sub_question_id,
#                     full_question_id, marks, key_points, marking_instruction, embedding
#                 )
#                 VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
#                 ON CONFLICT (full_question_id)
#                 DO UPDATE SET
#                    marks = EXCLUDED.marks,
#                    key_points = EXCLUDED.key_points,
#                    marking_instruction = EXCLUDED.marking_instruction,
#                    embedding = EXCLUDED.embedding;
#             """,
#                 (
#                     a.module_code,
#                     a.question_id,
#                     a.sub_question_id,
#                     a.sub_sub_question_id,
#                     a.full_question_id,
#                     a.marks,
#                     a.key_points,
#                     a.marking_instruction,
#                     vec,
#                 ),
#             )
#         self.commit()
#         logger.info("✅  Saved %d model-answer embeddings", len(answers))


# import logging
# from pgvector.psycopg2 import register_vector
# from ..embedding.abstract_embedder import AbstractEmbedder         # relative to database_services pkg
# from .base_vector_db_service import BaseVectorDBService            # sibling import
# from ...models.model_answer import ModelAnswer                     # up two levels

# logger = logging.getLogger(__name__)

# class ModelAnswerEmbeddingDB(BaseVectorDBService):
#     def __init__(self, embedder: AbstractEmbedder):
#         super().__init__()
#         self.embedder = embedder
#         register_vector(self.conn)
#         self.table = "model_answer_embeddings"
#         self._create_table()

#     # ---------------------------------------------------------------------
#     def _create_table(self):
#         dim = self.embedder.get_embedding_dimension()
#         self.cursor.execute(f"""
#             CREATE TABLE IF NOT EXISTS {self.table} (
#                 id SERIAL PRIMARY KEY,
#                 question_id TEXT,
#                 sub_question_id TEXT,
#                 sub_sub_question_id TEXT,
#                 full_question_id TEXT UNIQUE,
#                 -- new columns
#                 question_text TEXT,
#                 guideline_text TEXT,
#                 max_marks INT,
#                 --
#                 module_code TEXT,
#                 exam_year INT,
#                 exam_month TEXT,
#                 embedding vector({dim})
#             );
#         """)
#         self.commit()

#     # ---------------------------------------------------------------------
#     def save_embeddings(self, answers: list[ModelAnswer]) -> None:
#         if not answers:
#             logger.warning("No model answers supplied for embedding")
#             return

#         vectors = self.embedder.embed([a.embedding_payload() for a in answers])

#         for ans, vec in zip(answers, vectors):
#             self.cursor.execute(f"""
#                 INSERT INTO {self.table} (
#                     question_id, sub_question_id, sub_sub_question_id,
#                     full_question_id,
#                     question_text, guideline_text, max_marks,
#                     module_code, exam_year, exam_month, embedding
#                 ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
#                 ON CONFLICT (full_question_id)
#                 DO UPDATE SET
#                     question_text  = EXCLUDED.question_text,
#                     guideline_text = EXCLUDED.guideline_text,
#                     max_marks      = EXCLUDED.max_marks,
#                     embedding      = EXCLUDED.embedding
#                 """, (
#                     ans.question_id,
#                     ans.sub_question_id,
#                     ans.sub_sub_question_id,
#                     ans.full_question_id,
#                     ans.question_text,
#                     ans.guideline_text,
#                     ans.max_marks,
#                     ans.module_code,
#                     ans.exam_year,
#                     ans.exam_month,
#                     vec
#                 ))
#         self.commit()
#         logger.info("Saved %d model-answer embeddings.", len(answers))

# src/services/database_services/model_answer_embedding_db.py
import logging
from pgvector.psycopg2 import register_vector

from ..embedding.abstract_embedder import AbstractEmbedder
from .base_vector_db_service import BaseVectorDBService
from ...models.model_answer import ModelAnswer
# from  ....src.models.model_answer import ModelAnswer

logger = logging.getLogger(__name__)


class ModelAnswerEmbeddingDB(BaseVectorDBService):
    def __init__(self, embedder: AbstractEmbedder):
        super().__init__()
        self.embedder = embedder
        self.table    = "model_answer_embeddings"
        register_vector(self.conn)
        self._create_table()

    # ------------------------------------------------------------------ #
    def _create_table(self):
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table} (
                id SERIAL PRIMARY KEY,

                -- hierarchy keys
                question_id TEXT,
                sub_question_id TEXT,
                sub_sub_question_id TEXT,
                full_question_id TEXT UNIQUE,

                -- plain text
                question_text  TEXT,
                answer_text    TEXT,
                guideline_text TEXT,
                max_marks      INT,

                -- metadata
                module_code TEXT,
                exam_year   INT,
                exam_month  TEXT,

                -- vectors (question & answer only)
                question_embedding vector({dim}),
                answer_embedding   vector({dim})
            );
        """)
        self.commit()

    # ------------------------------------------------------------------ #
    def save_embeddings(self, answers: list[ModelAnswer]) -> None:
        if not answers:
            logger.warning("No model answers provided for embedding.")
            return

        q_vecs = self.embedder.embed([a.question_embedding_payload() for a in answers])
        a_vecs = self.embedder.embed([a.answer_embedding_payload()   for a in answers])

        for ans, q_vec, a_vec in zip(answers, q_vecs, a_vecs):
            self.cursor.execute(f"""
                INSERT INTO {self.table} (
                    question_id, sub_question_id, sub_sub_question_id,
                    full_question_id,
                    question_text, answer_text, guideline_text, max_marks,
                    module_code, exam_year, exam_month,
                    question_embedding, answer_embedding
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (full_question_id)
                DO UPDATE SET
                    question_text      = EXCLUDED.question_text,
                    answer_text        = EXCLUDED.answer_text,
                    guideline_text     = EXCLUDED.guideline_text,
                    max_marks          = EXCLUDED.max_marks,
                    question_embedding = EXCLUDED.question_embedding,
                    answer_embedding   = EXCLUDED.answer_embedding
            """, (
                ans.question_id,
                ans.sub_question_id,
                ans.sub_sub_question_id,
                ans.full_question_id,
                ans.question_text,
                ans.answer_text,
                ans.guideline_text,
                ans.max_marks,
                ans.module_code,
                ans.exam_year,
                ans.exam_month,
                q_vec,
                a_vec,
            ))

        self.commit()
        logger.info("Saved %d model-answer embeddings.", len(answers))
    def search_similar_questions(
        self,
        query_text: str,
        top_k: int = 5,
        *,
        module_code: str | None = None,
    ) -> list[tuple]:
        q_vec = self.embedder.embed([query_text])[0]
        where, params = ("WHERE module_code = %s", [module_code]) if module_code else ("", [])
        params.append(q_vec)

        self.cursor.execute(
            f"""
            SELECT full_question_id,
                   question_text,
                   answer_text,
                   guideline_text,
                   max_marks,
                   1 - (question_embedding <=> %s) AS similarity
            FROM {self.table}
            {where}
            ORDER BY question_embedding <=> %s
            LIMIT {top_k};
            """,
            params * 2,
        )
        return self.cursor.fetchall()

    def search_similar_answers(
        self,
        query_text: str,
        top_k: int = 5,
        *,
        module_code: str | None = None,
    ) -> list[tuple]:
        a_vec = self.embedder.embed([query_text])[0]
        where, params = ("WHERE module_code = %s", [module_code]) if module_code else ("", [])
        params.append(a_vec)

        self.cursor.execute(
            f"""
            SELECT full_question_id,
                   question_text,
                   answer_text,
                   guideline_text,
                   max_marks,
                   1 - (answer_embedding <=> %s) AS similarity
            FROM {self.table}
            {where}
            ORDER BY answer_embedding <=> %s
            LIMIT {top_k};
            """,
            params * 2,
        )
        return self.cursor.fetchall()
        # ─────────────────────────────────────────────────────────
    # def get_model_answer(self, full_question_id: str, module_code: str):
    #     """
    #     Return a lightweight dict with question / answer / guideline / max_marks
    #     for a single model-answer row, or None if not found.
    #     """
    #     self.cursor.execute(
    #         f"""
    #         SELECT
    #             question_text,
    #             answer_text,
    #             guideline_text,
    #             max_marks
    #         FROM {self.table}
    #         WHERE full_question_id = %s
    #           AND module_code      = %s
    #         """,
    #         (full_question_id, module_code)
    #     )

    #     row = self.cursor.fetchone()
    #     if not row:
    #         return None

    #     return {
    #         "question_text":  row[0],
    #         "answer_text":    row[1],
    #         "guideline_text": row[2],
    #         "max_marks":      row[3],
    #     }
    # ─────────────────────────────────────────────────────────
    def get_model_answer(self, full_question_id: str, module_code: str) -> dict | None:
        """
        Fetch the canonical model answer row as a dict.
        Returns None if not found.
        """
        self.cursor.execute(
            f"""
            SELECT question_text, answer_text, guideline_text, max_marks
            FROM {self.table}
            WHERE full_question_id = %s AND module_code = %s
            """,
            (full_question_id, module_code),
        )
        row = self.cursor.fetchone()
        if not row:
            return None

        return {
            "question_text": row[0],
            "answer_text": row[1],
            "guideline_text": row[2],
            "max_marks": row[3],
        }
