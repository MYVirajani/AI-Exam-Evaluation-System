

# import logging
# from typing import List
# from pgvector.psycopg2 import register_vector

# from .base_vector_db_service import BaseVectorDBService
# from ..embedding.abstract_embedder import AbstractEmbedder
# from ...models.student_answer import StudentAnswer

# logger = logging.getLogger(__name__)

# class StudentAnswerEmbeddingDB(BaseVectorDBService):
#     def __init__(self, embedder: AbstractEmbedder):
#         super().__init__(embedder)  # << pass embedder to parent
#         self.embedder = embedder
#         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"
#         self.table_name = f"student_answer_embeddings_{self.suffix}"  # << FIXED here
#         register_vector(self.conn)
#         logging.info(f"[VectorDB] Using table: {self.table_name}")
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
#                 embedding vector({dim}),
#                 UNIQUE (student_index, module_code, exam_year, exam_month, full_question_id)
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
#                 ON CONFLICT (student_index, module_code, exam_year, exam_month, full_question_id)
#                 DO UPDATE SET embedding = EXCLUDED.embedding
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
#         logger.info(f"✅ Saved embeddings for {len(answers)} answers to table: {self.table_name}")
   
#     def get_embedding(self, student_index: str, full_question_id: str, module_code: str, exam_year: int, exam_month: str) -> list[float] | None:
#         self.cursor.execute(f"""
#             SELECT embedding FROM {self.table_name}
#             WHERE student_index = %s
#             AND full_question_id = %s
#             AND module_code = %s
#             AND exam_year = %s
#             AND exam_month = %s
#         """, (student_index, full_question_id, module_code, exam_year, exam_month))

#         row = self.cursor.fetchone()
#         if row:
#             return row[0]  # Returns the vector
#         return None


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
                assessment_id TEXT,
                submission_id TEXT,
                embedding vector({dim}),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (student_index, module_code, exam_year, exam_month, full_question_id, assessment_id)
            );
        """)
        
        # Add indexes for better performance
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answer_embeddings_', '')}_assessment 
        ON {self.table_name} (assessment_id);
        """)
        
        self.cursor.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{self.table_name.replace('student_answer_embeddings_', '')}_submission 
        ON {self.table_name} (submission_id);
        """)
        
        # Migration: Add columns to existing tables if they don't exist
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

    def save_embeddings(self, answers: List[StudentAnswer], assessment_id: str = None, submission_id: str = None):
        """
        Save embeddings with assessment and submission tracking.
        
        Args:
            answers: List of StudentAnswer objects
            assessment_id: Assessment ID for tracking
            submission_id: Submission ID for tracking
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
                    full_question_id, module_code, exam_year, exam_month, 
                    assessment_id, submission_id, embedding
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (student_index, module_code, exam_year, exam_month, full_question_id, assessment_id)
                DO UPDATE SET 
                    embedding = EXCLUDED.embedding,
                    submission_id = EXCLUDED.submission_id,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                answer.student_index,
                answer.question_id,
                answer.sub_question_id,
                answer.sub_sub_question_id,
                answer.full_question_id,
                answer.module_code,
                answer.exam_year,
                answer.exam_month,
                assessment_id,
                submission_id,
                vector
            ))

        self.commit()
        logger.info(f"✅ Saved embeddings for {len(answers)} answers to table: {self.table_name}")
        print(f"💾 Saved embeddings: Assessment {assessment_id} | Submission {submission_id} | {len(answers)} answers")

    def get_embedding(self, student_index: str, full_question_id: str, module_code: str, 
                     exam_year: int, exam_month: str, assessment_id: str = None) -> list[float] | None:
        """Get embedding with optional assessment filtering."""
        if assessment_id:
            self.cursor.execute(f"""
                SELECT embedding FROM {self.table_name}
                WHERE student_index = %s
                AND full_question_id = %s
                AND module_code = %s
                AND exam_year = %s
                AND exam_month = %s
                AND assessment_id = %s
            """, (student_index, full_question_id, module_code, exam_year, exam_month, assessment_id))
        else:
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

    def get_embeddings_by_assessment(self, assessment_id: str) -> List[dict]:
        """Get all embeddings for a specific assessment."""
        self.cursor.execute(f"""
            SELECT student_index, full_question_id, module_code, exam_year, exam_month, 
                   submission_id, embedding, created_at
            FROM {self.table_name}
            WHERE assessment_id = %s
            ORDER BY student_index, full_question_id
        """, (assessment_id,))
        
        results = []
        for row in self.cursor.fetchall():
            results.append({
                'student_index': row[0],
                'full_question_id': row[1],
                'module_code': row[2],
                'exam_year': row[3],
                'exam_month': row[4],
                'submission_id': row[5],
                'embedding': row[6],
                'created_at': row[7]
            })
        
        return results

    def get_embeddings_by_submission(self, submission_id: str) -> List[dict]:
        """Get all embeddings for a specific submission."""
        self.cursor.execute(f"""
            SELECT student_index, full_question_id, module_code, exam_year, exam_month, 
                   assessment_id, embedding, created_at
            FROM {self.table_name}
            WHERE submission_id = %s
            ORDER BY full_question_id
        """, (submission_id,))
        
        results = []
        for row in self.cursor.fetchall():
            results.append({
                'student_index': row[0],
                'full_question_id': row[1],
                'module_code': row[2],
                'exam_year': row[3],
                'exam_month': row[4],
                'assessment_id': row[5],
                'embedding': row[6],
                'created_at': row[7]
            })
        
        return results

    def delete_embeddings_by_assessment(self, assessment_id: str) -> int:
        """Delete all embeddings for a specific assessment. Returns number of deleted records."""
        self.cursor.execute(f"""
        DELETE FROM {self.table_name}
        WHERE assessment_id = %s
        """, (assessment_id,))
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        print(f"🗑️ Deleted {deleted_count} embedding records from {self.table_name} for assessment {assessment_id}")
        return deleted_count

    def delete_embeddings_by_submission(self, submission_id: str) -> int:
        """Delete embeddings for a specific submission. Returns number of deleted records."""
        self.cursor.execute(f"""
        DELETE FROM {self.table_name}
        WHERE submission_id = %s
        """, (submission_id,))
        
        deleted_count = self.cursor.rowcount
        self.commit()
        
        print(f"🗑️ Deleted {deleted_count} embedding records from {self.table_name} for submission {submission_id}")
        return deleted_count

    def get_embedding_stats_by_assessment(self, assessment_id: str) -> dict:
        """Get statistics about embeddings for a specific assessment."""
        stats = {}
        
        # Total embeddings for assessment
        self.cursor.execute(f"SELECT COUNT(*) FROM {self.table_name} WHERE assessment_id = %s", (assessment_id,))
        stats['total_embeddings'] = self.cursor.fetchone()[0]
        
        # Unique students
        self.cursor.execute(f"SELECT COUNT(DISTINCT student_index) FROM {self.table_name} WHERE assessment_id = %s", (assessment_id,))
        stats['unique_students'] = self.cursor.fetchone()[0]
        
        # Unique questions
        self.cursor.execute(f"SELECT COUNT(DISTINCT full_question_id) FROM {self.table_name} WHERE assessment_id = %s", (assessment_id,))
        stats['unique_questions'] = self.cursor.fetchone()[0]
        
        # Unique submissions
        self.cursor.execute(f"SELECT COUNT(DISTINCT submission_id) FROM {self.table_name} WHERE assessment_id = %s AND submission_id IS NOT NULL", (assessment_id,))
        stats['unique_submissions'] = self.cursor.fetchone()[0]
        
        return stats