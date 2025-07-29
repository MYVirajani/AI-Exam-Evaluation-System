

import logging
from typing import List
from pgvector.psycopg2 import register_vector

from .base_vector_db_service import BaseVectorDBService
from ..embedding.abstract_embedder import AbstractEmbedder
from ...models.student_answer import StudentAnswer

logger = logging.getLogger(__name__)

class StudentAnswerEmbeddingDB(BaseVectorDBService):
    def __init__(self, embedder: AbstractEmbedder):
        super().__init__(embedder)  # << pass embedder to parent
        self.embedder = embedder
        self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"
        self.table_name = f"student_answer_embeddings_{self.suffix}"  # << FIXED here
        register_vector(self.conn)
        logging.info(f"[VectorDB] Using table: {self.table_name}")
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
        logger.info(f"✅ Saved embeddings for {len(answers)} answers to table: {self.table_name}")
   
    def get_embedding(self, student_index: str, full_question_id: str, module_code: str, exam_year: int, exam_month: str) -> list[float] | None:
        self.cursor.execute(f"""
            SELECT embedding FROM {self.table_name}
            WHERE student_index = %s
            AND full_question_id = %s
            AND module_code = %s
            AND exam_year = %s
            AND exam_month = %s
        """, (student_index, full_question_id, module_code, exam_year, exam_month))

        row = self.cursor.fetchone()
        if row:
            return row[0]  # Returns the vector
        return None
