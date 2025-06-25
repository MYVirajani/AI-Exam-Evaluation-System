# src/services/embedding/abstract_embedder.py

from abc import ABC, abstractmethod
from typing import List

class AbstractEmbedder(ABC):
    @abstractmethod
    def embed(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        pass

    @abstractmethod
    def get_embedding_dimension(self) -> int:
        pass
