# src/services/embedding/openai_embedder.py

from .abstract_embedder import AbstractEmbedder
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class OpenAIEmbedder(AbstractEmbedder):
    def __init__(self, model_name="text-embedding-3-small"):
        self.model_name = model_name
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

    def embed(self, texts):
        response = self.client.embeddings.create(
            input=texts,
            model=self.model_name
        )
        return [r.embedding for r in response.data]

    def get_model_name(self):
        return self.model_name

    def get_embedding_dimension(self):
        # You can dynamically return it based on model name
        if self.model_name == "text-embedding-3-small":
            return 1536
        return 1536  # default fallback
