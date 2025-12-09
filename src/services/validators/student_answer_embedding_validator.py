# src/services/validators/student_answer_embedding_validator.py

import logging
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService

logger = logging.getLogger(__name__)


class StudentAnswerEmbeddingValidator:

    def __init__(self, model_id: str):
        self.model_id = model_id
        self.vector_service = StudentAnswerVectorService(model_id=model_id)

    def has_embeddings(self, submission_id: str) -> bool:
        """
        Check whether student answer embeddings exist for a given submission.
        """
        try:
            table = self.vector_service.table_name

            query = f"""
                SELECT COUNT(*) 
                FROM {table}
                WHERE submission_id = %s AND model_id = %s;
            """

            self.vector_service.cursor.execute(query, (submission_id, self.model_id))
            count = self.vector_service.cursor.fetchone()[0]

            return count > 0

        except Exception as e:
            logger.exception(f"[Validator] Error checking embeddings for submission {submission_id}: {e}")
            return False
