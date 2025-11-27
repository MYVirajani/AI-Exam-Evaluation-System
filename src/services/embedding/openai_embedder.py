from .abstract_embedder import AbstractEmbedder
import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class OpenAIEmbedder(AbstractEmbedder):
    def __init__(self, model_id: str = None):
        """
        Initialize embedder. 
        Priority order for selecting embedding_model:

        1. If model_id provided → fetch from Evaluation_Model table
        2. Else → use OPENAI_EMBEDDING_MODEL env variable
        3. Else → fallback "text-embedding-3-small"
        """

        from src.services.database_services.evaluation_model_db import EvaluationModelService

        # --------------------------------------
        # 1. Fetch embedding_model from DB
        # --------------------------------------
        db_model_name = None
        if model_id:
            try:
                config = EvaluationModelService().get_model_config(model_id)
                if config:
                    db_model_name = config.get("embedding_model")
                    provider = config.get("provider")
                else:
                    logger.warning(f"⚠️ Model ID '{model_id}' not found in DB. Using fallback model.")
            except Exception as e:
                logger.error(f"❌ Failed to fetch model config for model_id={model_id}: {e}")

        # --------------------------------------
        # 2. Pick embedding model with priority
        # --------------------------------------
        self.model_name = (
            db_model_name
            or os.getenv("OPENAI_EMBEDDING_MODEL")
            or "text-embedding-3-small"
        )

        # --------------------------------------
        # 3. Read API key
        # --------------------------------------
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("❌ Missing OPENAI_API_KEY in environment variables.")

        # --------------------------------------
        # 4. Initialize OpenAI client
        # --------------------------------------
        self.client = OpenAI(api_key=self.api_key)

        logger.info(
            f"🔹 Initialized OpenAIEmbedder | model_id={model_id} | embedding_model={self.model_name}"
        )

    # -----------------------------------------------------------
    def embed(self, texts):
        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            logger.warning("⚠️ No valid texts provided for embedding. Returning empty list.")
            return []

        try:
            response = self.client.embeddings.create(
                input=cleaned_texts,
                model=self.model_name
            )
            return [item.embedding for item in response.data]

        except Exception as e:
            logger.exception(f"❌ Error during embedding: {e}")
            raise

    # -----------------------------------------------------------
    def get_model_name(self):
        return self.model_name

    def get_embedding_dimension(self):
        # If needed, load dimension based on model_name
        # text-embedding-3-small = 1536
        return 1536
    def get_table_suffix(self) -> str:
        return "openai"