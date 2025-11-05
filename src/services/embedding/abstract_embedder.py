# src/services/embedding/abstract_embedder.py

from abc import ABC, abstractmethod
from typing import List

class AbstractEmbedder(ABC):
    """
    Abstract base class for embedding providers.
    All embedder implementations must inherit from this class.
    """
    
    @abstractmethod
    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors, where each vector is a list of floats
        """
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """
        Get the name of the embedding model being used.
        
        Returns:
            Model name string (e.g., 'text-embedding-3-small', 'text-embedding-004')
        """
        pass
    
    @abstractmethod
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of the embedding vectors.
        
        Returns:
            Integer representing the embedding dimension
        """
        pass
    
    @abstractmethod
    def get_table_suffix(self) -> str:
        """
        Return suffix for database table naming.
        
        This suffix is used to route data to the correct provider-specific tables.
        For example:
        - 'openai' -> student_answers_openai, lecture_material_chunks_openai, etc.
        - 'gemini' -> student_answers_gemini, lecture_material_chunks_gemini, etc.
        - 'deepseek' -> student_answers_deepseek, lecture_material_chunks_deepseek, etc.
        
        Returns:
            Table suffix string (e.g., 'openai', 'gemini', 'deepseek')
        """
        pass