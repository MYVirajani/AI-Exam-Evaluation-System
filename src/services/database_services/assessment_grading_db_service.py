import uuid
import logging
from datetime import datetime
from psycopg2.extras import RealDictCursor

from src.services.database_services.base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class AssessmentGradingDBService(BaseRelationalDB):
    """
    Service class for managing Assessment_Grading records.
    """

    def create_assessment_grading(self, assessment_id: str, model_id: str):
        """
        Creates a new Assessment_Grading entry.
        started_at is auto-set. ended_at defaults to now() but can be updated later.
        """

        grading_id = str(uuid.uuid4())

        query = """
            INSERT INTO "Assessment_Grading" 
                (id, assessment_id, model_id, started_at, ended_at, submission_count, questions_count)
            VALUES (%s, %s, %s, NOW(), NOW(), NULL, NULL)
        """

        try:
            self.cursor.execute(query, (grading_id, assessment_id, model_id))
            self.commit()
            logger.info(f"Assessment_Grading created: {grading_id}")
            return grading_id

        except Exception as e:
            logger.error(f"Failed to create Assessment_Grading: {e}")
            self.conn.rollback()
            raise

    # -------------------------------------------------------------------

    def update_end_time_and_counts(self, grading_id: str, submission_count: int = None, questions_count: int = None):
        """
        Updates ended_at and optionally submission_count and questions_count
        """

        query = """
            UPDATE "Assessment_Grading"
            SET ended_at = NOW(),
                submission_count = COALESCE(%s, submission_count),
                questions_count = COALESCE(%s, questions_count)
            WHERE id = %s
        """

        try:
            self.cursor.execute(query, (submission_count, questions_count, grading_id))
            self.commit()

            logger.info(f"Assessment_Grading updated: {grading_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to update Assessment_Grading {grading_id}: {e}")
            self.conn.rollback()
            raise

    # -------------------------------------------------------------------

    def get_by_id(self, grading_id: str):
        query = """
            SELECT * FROM "Assessment_Grading"
            WHERE id = %s
        """

        try:
            self.cursor.close()
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            self.cursor.execute(query, (grading_id,))
            return self.cursor.fetchone()

        except Exception as e:
            logger.error(f"Failed to fetch Assessment_Grading by id {grading_id}: {e}")
            raise

    # -------------------------------------------------------------------

    def get_by_assessment(self, assessment_id: str):
        query = """
            SELECT * FROM "Assessment_Grading"
            WHERE assessment_id = %s
            ORDER BY started_at DESC
        """

        try:
            self.cursor.close()
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            self.cursor.execute(query, (assessment_id,))
            return self.cursor.fetchall()

        except Exception as e:
            logger.error(f"Failed to fetch Assessment_Grading for assessment {assessment_id}: {e}")
            raise

    # -------------------------------------------------------------------

    def get_by_model(self, model_id: str):
        query = """
            SELECT * FROM "Assessment_Grading"
            WHERE model_id = %s
            ORDER BY started_at DESC
        """

        try:
            self.cursor.close()
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            self.cursor.execute(query, (model_id,))
            return self.cursor.fetchall()

        except Exception as e:
            logger.error(f"Failed to fetch Assessment_Grading for model {model_id}: {e}")
            raise

    # -------------------------------------------------------------------

    def delete_grading(self, grading_id: str):
        query = """
            DELETE FROM "Assessment_Grading"
            WHERE id = %s
        """

        try:
            self.cursor.execute(query, (grading_id,))
            self.commit()

            logger.info(f"Assessment_Grading deleted: {grading_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete Assessment_Grading {grading_id}: {e}")
            self.conn.rollback()
            raise
