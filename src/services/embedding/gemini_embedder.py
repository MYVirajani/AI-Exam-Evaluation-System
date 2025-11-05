import os
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai
import logging

from .abstract_embedder import AbstractEmbedder

logger = logging.getLogger(__name__)
load_dotenv()


class GeminiEmbedder(AbstractEmbedder):
    """
    Wrapper for Google Gemini embedding API.

    Supports fallback to a valid embedding model if the provided one
    (e.g., gemini-2.0-flash) does not support embeddings.

    Default embedding model: 'models/text-embedding-004' (768-D vectors).
    """

    SUPPORTED_EMBED_MODELS = {"models/embedding-001", "models/text-embedding-004"}

    def __init__(self, model_name: str = "models/text-embedding-004"):
        self.model_name = model_name.strip()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY not set in environment or .env file")

        genai.configure(api_key=api_key)

        # ✅ Fallback for unsupported models like gemini-2.0-flash
        if not any(x in self.model_name for x in ["embedding-001", "text-embedding-004"]):
            logger.warning(
                f"⚠️ Model '{self.model_name}' does not support embeddings. "
                f"Switching to 'models/text-embedding-004'."
            )
            self.model_name = "models/text-embedding-004"

        logger.info(f"🔹 Using Gemini embedding model: {self.model_name}")

    def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            logger.error("No valid texts provided for embedding.")
            raise ValueError("No valid texts to embed.")

        try:
            vectors = []
            for text in cleaned_texts:
                # Use genai.embed_content for each text
                result = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_document"
                )

                embedding = self._extract_embedding(result)
                vectors.append(embedding)

            return vectors

        except Exception as e:
            logger.exception(f"Error during Gemini embedding: {e}")
            raise

    def _extract_embedding(self, result):
        """Extract embedding vector from Gemini API response."""
        logger.debug(f"Processing result of type: {type(result)}")

        if hasattr(result, 'embedding'):
            return self._to_1d_vector(result.embedding)

        if hasattr(result, 'embeddings') and result.embeddings:
            return self._to_1d_vector(result.embeddings[0])

        if isinstance(result, dict):
            if 'embedding' in result:
                return self._to_1d_vector(result['embedding'])
            if 'embeddings' in result and result['embeddings']:
                return self._to_1d_vector(result['embeddings'][0])

        if isinstance(result, (list, tuple)):
            return self._to_1d_vector(result)

        if hasattr(result, 'values'):
            return self._to_1d_vector(result.values)

        logger.error(f"Cannot extract embedding from result type: {type(result)}")
        if hasattr(result, '__dict__'):
            logger.error(f"Result attributes: {list(result.__dict__.keys())}")
        raise ValueError(f"Cannot extract embedding from result of type: {type(result)}")

    def _to_1d_vector(self, embedding):
        """Ensures the embedding is a flat 1-D list of floats."""
        if hasattr(embedding, 'values'):
            embedding = embedding.values
        elif hasattr(embedding, 'embedding'):
            embedding = embedding.embedding
            if hasattr(embedding, 'values'):
                embedding = embedding.values

        if isinstance(embedding, (list, tuple)):
            # Handle nested list structure [[...]] → [...]
            if len(embedding) == 1 and isinstance(embedding[0], (list, tuple)):
                embedding = embedding[0]
            # ✅ FIX: proper indentation after if
            if all(isinstance(x, (float, int)) for x in embedding):
                return [float(x) for x in embedding]

        try:
            import numpy as np
            if isinstance(embedding, np.ndarray):
                return embedding.flatten().astype(float).tolist()
        except ImportError:
            pass

        logger.error(f"Cannot convert embedding to 1D vector. Type: {type(embedding)}")
        if hasattr(embedding, '__dict__'):
            logger.error(f"Embedding attributes: {list(embedding.__dict__.keys())}")

        raise ValueError(
            f"Embedding is not convertible to 1D vector: {type(embedding)} - {str(embedding)[:200]}"
        )

    def get_model_name(self) -> str:
        return self.model_name

    def get_embedding_dimension(self) -> int:
        return 768  # Gemini text-embedding-004 = 768D

    def get_table_suffix(self) -> str:
        return "gemini"
