import logging
from src.services.database_services.base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class EvaluationModelService(BaseRelationalDB):
    """
    Service to fetch provider, chat model, and embedding model
    from Evaluation_Model table using model_id.
    """

    def get_model_config(self, model_id: str):
        """
        Fetch model configuration from Evaluation_Model by model_id.

        Returns:
            dict -> {
                "model_id": str,
                "provider": str,
                "chat_model": str,
                "embedding_model": str,
                "temperature": float,
                "model_name": str
            }
        """

        try:
            query = """
                SELECT model_id, provider, chat_model, embedding_model, temperature, model_name
                FROM "Evaluation_Model"
                WHERE model_id = %s
                LIMIT 1;
            """

            self.cursor.execute(query, (model_id,))
            row = self.cursor.fetchone()

            if not row:
                logger.warning(f"No Evaluation_Model found for model_id: {model_id}")
                return None

            result = {
                "model_id": row[0],
                "provider": row[1],
                "chat_model": row[2],
                "embedding_model": row[3],
                "temperature": row[4],
                "model_name": row[5],
            }

            logger.info(f"Loaded model config for model_id: {model_id}")
            return result

        except Exception as e:
            logger.error(f"Failed to get model config for {model_id}: {e}")
            raise
