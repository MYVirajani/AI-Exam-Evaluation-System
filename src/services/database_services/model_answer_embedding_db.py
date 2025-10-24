import logging
from pgvector.psycopg2 import register_vector

from ..embedding.abstract_embedder import AbstractEmbedder
from .base_vector_db_service import BaseVectorDBService
from ...models.model_answer import ModelAnswer

logger = logging.getLogger(__name__)


class ModelAnswerEmbeddingDB(BaseVectorDBService):
    def __init__(self, embedder: AbstractEmbedder, provider_override: str = None):
        super().__init__(embedder)
        self.embedder = embedder
        # Use override if provided (e.g., "deepseek"), else default suffix
        self.suffix = provider_override.lower() if provider_override else embedder.get_table_suffix()
        self.table = f"model_answer_embeddings_{self.suffix}"
        register_vector(self.conn)
        logger.info(f"Using table: {self.table}")
        self._create_table()

    def _create_table(self):
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table} (
                id SERIAL PRIMARY KEY,
                question_id TEXT,
                sub_question_id TEXT,
                sub_sub_question_id TEXT,
                sub_sub_sub_question_id TEXT,
                full_question_id TEXT,
                question_text  TEXT,
                answer_text    TEXT,
                guideline_text TEXT,
                max_marks      FLOAT,

                -- metadata
                module_code TEXT,
                exam_year   INT,
                exam_month  TEXT,
                assessment_id TEXT,
                question_embedding vector({dim}),
                answer_embedding   vector({dim}),
                
                -- Unique constraint on combination of full_question_id and assessment_id
                UNIQUE(full_question_id, assessment_id)
            );
        """)
        self.commit()

    def save_embeddings(self, answers: list[ModelAnswer], assessment_id: str) -> None:
        if not answers:
            logger.warning("No model answers provided for embedding.")
            return

        q_vecs = self.embedder.embed([a.question_embedding_payload() for a in answers])
        a_vecs = self.embedder.embed([a.answer_embedding_payload() for a in answers])

        for ans, q_vec, a_vec in zip(answers, q_vecs, a_vecs):
            self.cursor.execute(f"""
                INSERT INTO {self.table} (
                    question_id, sub_question_id, sub_sub_question_id, sub_sub_sub_question_id,
                    full_question_id, question_text, answer_text, guideline_text, max_marks,
                    module_code, exam_year, exam_month, assessment_id,
                    question_embedding, answer_embedding
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (full_question_id, assessment_id)
                DO UPDATE SET
                    question_text      = EXCLUDED.question_text,
                    answer_text        = EXCLUDED.answer_text,
                    guideline_text     = EXCLUDED.guideline_text,
                    max_marks          = EXCLUDED.max_marks,
                    module_code        = EXCLUDED.module_code,
                    exam_year          = EXCLUDED.exam_year,
                    exam_month         = EXCLUDED.exam_month,
                    question_embedding = EXCLUDED.question_embedding,
                    answer_embedding   = EXCLUDED.answer_embedding
            """, (
                ans.question_id, ans.sub_question_id, ans.sub_sub_question_id, ans.sub_sub_sub_question_id,
                ans.full_question_id, ans.question_text, ans.answer_text, ans.guideline_text, ans.max_marks,
                ans.module_code, ans.exam_year, ans.exam_month, assessment_id,
                q_vec, a_vec
            ))

        self.commit()
        logger.info("Saved %d model-answer embeddings into table '%s'.", len(answers), self.table)

    def get_model_answer(self, full_question_id: str, module_code: str) -> dict | None:
        self.cursor.execute(f"""
            SELECT question_text, answer_text, guideline_text, max_marks
            FROM {self.table}
            WHERE full_question_id = %s AND module_code = %s AND assessment_id = %s
        """, (full_question_id, module_code, assessment_id))

        row = self.cursor.fetchone()
        if row:
            return {
                "question_text": row[0],
                "answer_text": row[1],
                "guideline_text": row[2],
                "max_marks": row[3]
            }
        return None

    def get_embedding(self, full_question_id: str, module_code: str, exam_year: int, exam_month: str) -> list[float] | None:
        self.cursor.execute(f"""
            SELECT answer_embedding
            FROM {self.table}
            WHERE full_question_id = %s AND module_code = %s AND exam_year = %s AND exam_month = %s
        """, (full_question_id, module_code, exam_year, exam_month))

        row = self.cursor.fetchone()
        if row and row[0] is not None:
            return list(row[0])  # Convert from vector to Python list
        return None