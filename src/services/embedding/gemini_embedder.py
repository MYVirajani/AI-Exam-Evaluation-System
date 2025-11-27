import os
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
import logging
import numpy as np

from .abstract_embedder import AbstractEmbedder

logger = logging.getLogger(__name__)
load_dotenv()


class GeminiEmbedder(AbstractEmbedder):
    """
    Gemini Embedder that loads embedding model from DB using model_id.
    Fallback priority:
       DB → ENV → default ("models/embedding-001")
    """

    def __init__(self, model_id: Optional[str] = None):
        from src.services.database_services.evaluation_model_db import EvaluationModelService

        db_model_name = None
        db_dim = None

        # ------------------------------------------------------
        # 1. Fetch config from DB
        # ------------------------------------------------------
        if model_id:
            try:
                config = EvaluationModelService().get_model_config(model_id)
                if config:
                    db_model_name = config.get("embedding_model")
                    # You can store embedding dimension in DB if needed
                else:
                    logger.warning(f"⚠️ No model found for model_id={model_id}. Using fallback.")
            except Exception as e:
                logger.error(f"❌ Failed to fetch model config for model_id={model_id}: {e}")

        # ------------------------------------------------------
        # 2. Determine embedding model (priority: DB → ENV → default)
        # ------------------------------------------------------
        self.model_name = (
            db_model_name
            or os.getenv("GEMINI_EMBEDDING_MODEL")
            or "models/embedding-001"
        )

        # ------------------------------------------------------
        # 3. Determine dimension (priority: DB → ENV → default 768)
        # ------------------------------------------------------
        dim_str = os.getenv("GEMINI_EMBEDDING_DIMENSION", "768")
        try:
            self.embedding_dimension = int(db_dim) if db_dim else int(dim_str)
        except Exception:
            logger.warning(f"⚠️ Invalid embedding dimension. Defaulting to 768.")
            self.embedding_dimension = 768

        # ------------------------------------------------------
        # 4. API key
        # ------------------------------------------------------
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("❌ GOOGLE_API_KEY not set in environment")

        genai.configure(api_key=api_key)

        logger.info(
            f"🔹 GeminiEmbedder initialized | model_id={model_id} | model={self.model_name} | dim={self.embedding_dimension}"
        )

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

                if len(embedding) != self.embedding_dimension:
                    logger.warning(
                        f"⚠️ Dimension mismatch: got {len(embedding)}, expected {self.embedding_dimension}"
                    )
                    embedding = self._adjust_dimension(embedding)

                vectors.append(embedding)

            except Exception as e:
                logger.exception(f"❌ Error embedding text: {e}")
                vectors.append([0.0] * self.embedding_dimension)

        return vectors

    # ---------------------------------------------------------------
    def _extract_embedding(self, result):
        """Extract embedding vector from Gemini API response."""
        try:
            if hasattr(result, "embedding"):
                emb = result.embedding
                if hasattr(emb, "values"):
                    return self._to_1d_vector(emb.values)
                return self._to_1d_vector(emb)

            if isinstance(result, dict):
                if "embedding" in result:
                    emb = result["embedding"]
                    if isinstance(emb, dict) and "values" in emb:
                        return self._to_1d_vector(emb["values"])
                    return self._to_1d_vector(emb)

                if "data" in result and "embedding" in result["data"]:
                    emb = result["data"]["embedding"]
                    if isinstance(emb, dict) and "values" in emb:
                        return self._to_1d_vector(emb["values"])
                    return self._to_1d_vector(emb)

                if "values" in result:
                    return self._to_1d_vector(result["values"])

            if isinstance(result, (list, tuple, np.ndarray)):
                return self._to_1d_vector(result)

            raise ValueError("Invalid Gemini embedding response format")

        except Exception as e:
            logger.error(f"❌ Failed to extract embedding: {e}")
            raise ValueError("Invalid embedding format received from Gemini API")

    # ---------------------------------------------------------------
    def _to_1d_vector(self, embedding):
        """Convert embedding to a flat float list."""
        if hasattr(embedding, "values"):
            embedding = embedding.values

        if isinstance(embedding, (list, tuple, np.ndarray)):
            arr = np.array(embedding, dtype=float).flatten()
            return arr.tolist()

        raise ValueError(f"Cannot convert embedding to list: {type(embedding)}")

    # ---------------------------------------------------------------
    def _adjust_dimension(self, embedding):
        """Pad or truncate embeddings to expected dimension."""
        arr = np.array(embedding, dtype=float)
        if len(arr) > self.embedding_dimension:
            return arr[:self.embedding_dimension].tolist()
        if len(arr) < self.embedding_dimension:
            padding = np.pad(arr, (0, self.embedding_dimension - len(arr)))
            return padding.tolist()
        return arr.tolist()

    # ---------------------------------------------------------------
    def get_model_name(self) -> str:
        return self.model_name

    def get_embedding_dimension(self) -> int:
        return self.embedding_dimension

    def get_table_suffix(self) -> str:
        return "gemini"
