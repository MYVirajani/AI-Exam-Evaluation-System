from .abstract_embedder import AbstractEmbedder
import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class OpenAIEmbedder(AbstractEmbedder):
    def __init__(self, embedding_model: str = None, provider_suffix="openai"):
        """
        Initialize OpenAI Embedder.

        Args:
            embedding_model (str): Override embedding model name.
                                   If None → read from env (OPENAI_EMBEDDING_MODEL).
            provider_suffix (str): Suffix for DB table naming.
        """

        # Runtime override → env → default
        self.model_name = (
            embedding_model
            or os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        )

        self.provider_suffix = provider_suffix
        self.api_key = os.getenv("OPENAI_API_KEY")

        if not self.api_key:
            raise ValueError("❌ Missing OPENAI_API_KEY in environment variables.")

        self.client = OpenAI(api_key=self.api_key)

        logger.info(
            f"🔹 Initialized OpenAIEmbedder: model={self.model_name}, suffix={provider_suffix}"
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
            return [r.embedding for r in response.data]

        except Exception as e:
            logger.exception(f"❌ Error during embedding: {e}")
            raise

    # -----------------------------------------------------------
    def get_model_name(self):
        return self.model_name

    def get_embedding_dimension(self):
        # OpenAI models currently return 1536 dimensions
        return 1536

    def get_table_suffix(self) -> str:
        return self.provider_suffix
