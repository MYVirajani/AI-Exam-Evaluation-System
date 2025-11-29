import logging
from datetime import datetime
from src.services.database_services.base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerPaperDB(BaseRelationalDB):
    """
    Database service for Model_Answer_Paper table.
    Provides CRUD-level methods for reading and updating model answer papers.
    """

    # -------------------------------------------------------------
    # Fetch model answer paper by assessment_id or id
    # -------------------------------------------------------------
    def get_model_answer_paper(self, assessment_id: str, id: str = None):
        """
        Fetch rows from Model_Answer_Paper table.
        Priority:
        1) If id is provided → fetch by id
        2) Otherwise fetch by assessment_id

        Returns: dict or None
        """

        try:
            if id:
                query = """
                    SELECT 
                        id,
                        assessment_id,
                        file_url,
                        media_extracted_file_url,
                        created_on,
                        updated_on
                    FROM "Model_Answer_Paper"
                    WHERE id = %s
                    LIMIT 1;
                """
                params = (id,)
            else:
                query = """
                    SELECT 
                        id,
                        assessment_id,
                        file_url,
                        media_extracted_file_url,
                        created_on,
                        updated_on
                    FROM "Model_Answer_Paper"
                    WHERE assessment_id = %s
                    LIMIT 1;
                """
                params = (assessment_id,)

            self.cursor.execute(query, params)
            row = self.cursor.fetchone()

            if not row:
                logger.warning(f"No Model_Answer_Paper found. assessment_id={assessment_id}, id={id}")
                return None

            return {
                "id": row[0],
                "assessment_id": row[1],
                "file_url": row[2],
                "media_extracted_file_url": row[3],
                "created_on": row[4],
                "updated_on": row[5],
            }

        except Exception as e:
            logger.error(f"Failed to fetch Model_Answer_Paper (assessment_id={assessment_id}, id={id}): {e}")
            raise

    # -------------------------------------------------------------
    # Update media_extracted_file_url
    # -------------------------------------------------------------
    def update_media_extracted_file_url(self, id: str, new_url: str):
        """
        Update the media_extracted_file_url for the specified ID.
        Auto-updates the updated_on timestamp.
        """

        try:
            query = """
                UPDATE "Model_Answer_Paper"
                SET media_extracted_file_url = %s,
                    updated_on = NOW()
                WHERE id = %s;
            """

            self.cursor.execute(query, (new_url, id))
            self.commit()
            logger.info(f"Updated media_extracted_file_url for Model_Answer_Paper id={id}")

        except Exception as e:
            logger.error(f"Failed to update media_extracted_file_url for id={id}: {e}")
            self.conn.rollback()
            raise
