import os
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai
import logging
import numpy as np

from .abstract_embedder import AbstractEmbedder

logger = logging.getLogger(__name__)
load_dotenv()


class GeminiEmbedder(AbstractEmbedder):
    """
    Wrapper for Google Gemini embedding API.
    Reads embedding dimension from .env (GEMINI_EMBEDDING_DIMENSION).
    Default model: 'models/embedding-001' or 'gemini-embedding-001'
    """

    def __init__(self):
        # Load from environment
        self.model_name = os.getenv("GEMINI_EMBEDDING_MODEL", "models/embedding-001")

        # Read embedding dimension (default 768)
        dim_str = os.getenv("GEMINI_EMBEDDING_DIMENSION", "768")
        try:
            self.embedding_dimension = int(dim_str)
        except ValueError:
            logger.warning(f"⚠️ Invalid GEMINI_EMBEDDING_DIMENSION='{dim_str}', defaulting to 768")
            self.embedding_dimension = 768

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("❌ GOOGLE_API_KEY not set in environment or .env file")

        genai.configure(api_key=api_key)
        logger.info(f"🔹 GeminiEmbedder initialized: model={self.model_name}, dim={self.embedding_dimension}")

    # ---------------------------------------------------------------
    def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            logger.warning("⚠️ No valid texts provided for embedding.")
            return []

        vectors = []
        for text in cleaned_texts:
            try:
                result = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_document"
                )
                embedding = self._extract_embedding(result)

                # Ensure dimension consistency
                if len(embedding) != self.embedding_dimension:
                    logger.warning(
                        f"⚠️ Embedding dimension mismatch: got {len(embedding)}, expected {self.embedding_dimension}. Adjusting..."
                    )
                    embedding = self._adjust_dimension(embedding)

                vectors.append(embedding)

            except Exception as e:
                logger.exception(f"❌ Error embedding text: {e}")
                # fallback: zero-vector
                vectors.append([0.0] * self.embedding_dimension)
        return vectors

    # ---------------------------------------------------------------
    def _extract_embedding(self, result):
        """Extract embedding vector from Gemini API response."""
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

        raise ValueError(f"Cannot extract embedding from result: {type(result)}")

    # ---------------------------------------------------------------
    def _to_1d_vector(self, embedding):
        """Ensure embedding is flat list of floats."""
        if hasattr(embedding, 'values'):
            embedding = embedding.values
        elif hasattr(embedding, 'embedding'):
            embedding = embedding.embedding
            if hasattr(embedding, 'values'):
                embedding = embedding.values

        if isinstance(embedding, (list, tuple, np.ndarray)):
            arr = np.array(embedding, dtype=float).flatten()
            return arr.tolist()

        raise ValueError(f"Embedding cannot be converted to 1D vector: {type(embedding)}")

    # ---------------------------------------------------------------
    def _adjust_dimension(self, embedding):
        """Pad or truncate embeddings to expected dimension."""
        arr = np.array(embedding, dtype=float)
        if len(arr) > self.embedding_dimension:
            return arr[:self.embedding_dimension].tolist()
        elif len(arr) < self.embedding_dimension:
            padded = np.pad(arr, (0, self.embedding_dimension - len(arr)))
            return padded.tolist()
        return arr.tolist()

    # ---------------------------------------------------------------
    def get_model_name(self) -> str:
        return self.model_name

    def get_embedding_dimension(self) -> int:
        """Return the dimension loaded from .env"""
        return self.embedding_dimension

    def get_table_suffix(self) -> str:
        return "gemini"
