from .abstract_embedder import AbstractEmbedder
import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class OpenAIEmbedder(AbstractEmbedder):
    def __init__(self, model_name="text-embedding-3-small", provider_suffix="openai"):
        """
        Initialize OpenAI Embedder
        
        Args:
            model_name: OpenAI embedding model name (default: text-embedding-3-small)
            provider_suffix: Table suffix for database storage (default: openai)
                           Use 'deepseek' when using OpenAI embeddings for DeepSeek
        """
        self.model_name = model_name
        self.provider_suffix = provider_suffix
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)
        
        logger.info(f"Initialized OpenAIEmbedder: model={model_name}, suffix={provider_suffix}")

    def embed(self, texts):
        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            logger.warning("No valid texts provided for embedding. Returning empty list.")
            return []  # Return empty list instead of raising error

        try:
            response = self.client.embeddings.create(
                input=cleaned_texts,
                model=self.model_name
            )
            return [r.embedding for r in response.data]
        except Exception as e:
            logger.exception(f"Error during embedding: {e}")
            raise

    def get_model_name(self):
        return self.model_name

    def get_embedding_dimension(self):
        return 1536

    def get_table_suffix(self) -> str:
        """
        Returns the provider suffix for database table naming
        
        Returns:
            str: Provider suffix (e.g., 'openai', 'deepseek')
        """
        return self.provider_suffix