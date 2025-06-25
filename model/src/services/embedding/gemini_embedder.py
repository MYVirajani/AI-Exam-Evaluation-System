# src/services/embedding/gemini_embedder.py

from .abstract_embedder import AbstractEmbedder

class GeminiEmbedder(AbstractEmbedder):
    def __init__(self, model_name="embedding-001"):
        self.model_name = model_name
        # Initialize Gemini embedding model client

    def embed(self, texts):
        # Call Gemini API
        return [self._mock_vector()] * len(texts)

    def get_model_name(self):
        return self.model_name

    def get_embedding_dimension(self):
        return 768  # For example, Gemini returns 768-d vectors

    def _mock_vector(self):
        return [0.01] * 768
