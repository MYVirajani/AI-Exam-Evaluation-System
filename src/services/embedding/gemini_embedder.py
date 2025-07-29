

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

    Default model: 'models/embedding-001' (768-D vectors).
    """

    def __init__(self, model_name: str = "models/embedding-001"):
        self.model_name = model_name
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY not set in environment or .env file")
        genai.configure(api_key=api_key)

    def embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            logger.error("No valid texts provided for embedding.")
            raise ValueError("No valid texts to embed.")

        try:
            # Process each text individually to handle the API better
            vectors = []
            for text in cleaned_texts:
                # Use genai.embed_content for individual text
                result = genai.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_document"
                )
                
                # Extract embedding from result
                embedding = self._extract_embedding(result)
                vectors.append(embedding)

            return vectors

        except Exception as e:
            logger.exception(f"Error during Gemini embedding: {e}")
            raise

    def _extract_embedding(self, result):
        """Extract embedding vector from Gemini API response."""
        # Debug logging
        logger.debug(f"Processing result of type: {type(result)}")
        
        # Try different possible response structures
        
        # Method 1: Direct embedding attribute
        if hasattr(result, 'embedding'):
            logger.debug("Found 'embedding' attribute")
            return self._to_1d_vector(result.embedding)
        
        # Method 2: List of embeddings
        if hasattr(result, 'embeddings') and result.embeddings:
            logger.debug("Found 'embeddings' attribute")
            if len(result.embeddings) > 0:
                return self._to_1d_vector(result.embeddings[0])
        
        # Method 3: Direct access as list/dict
        if isinstance(result, dict):
            logger.debug("Result is a dictionary")
            if 'embedding' in result:
                return self._to_1d_vector(result['embedding'])
            if 'embeddings' in result and result['embeddings']:
                return self._to_1d_vector(result['embeddings'][0])
        
        # Method 4: Result is the embedding itself
        if isinstance(result, (list, tuple)):
            logger.debug("Result is a list/tuple")
            return self._to_1d_vector(result)
        
        # Method 5: Check for 'values' attribute directly
        if hasattr(result, 'values'):
            logger.debug("Found 'values' attribute")
            return self._to_1d_vector(result.values)
        
        # If all else fails, log everything we can about the result
        logger.error(f"Cannot extract embedding from result type: {type(result)}")
        if hasattr(result, '__dict__'):
            logger.error(f"Result attributes: {list(result.__dict__.keys())}")
            logger.error(f"Result dict: {result.__dict__}")
        else:
            logger.error(f"Result: {str(result)[:500]}")
        
        raise ValueError(f"Cannot extract embedding from result of type: {type(result)}")

    def _to_1d_vector(self, embedding):
        """
        Ensures the embedding is a flat 1-D list of floats.
        Fixes Gemini's nested list structure if needed.
        """
        logger.debug(f"Converting embedding of type: {type(embedding)}")
        
        # Handle different possible structures
        if hasattr(embedding, 'values'):
            logger.debug("Found .values attribute")
            embedding = embedding.values
        elif hasattr(embedding, 'embedding'):
            logger.debug("Found .embedding attribute")
            embedding = embedding.embedding
            if hasattr(embedding, 'values'):
                embedding = embedding.values
        
        # Handle list structures
        if isinstance(embedding, (list, tuple)):
            # Handle nested list structure [[...]] -> [...]
            if len(embedding) == 1 and isinstance(embedding[0], (list, tuple)):
                logger.debug("Found nested list structure, flattening")
                embedding = embedding[0]
            
            # Verify it's a flat list of numbers
            if all(isinstance(x, (float, int)) for x in embedding):
                result = [float(x) for x in embedding]
                logger.debug(f"Successfully converted to vector of length: {len(result)}")
                return result
        
        # Handle numpy arrays if present
        try:
            import numpy as np
            if isinstance(embedding, np.ndarray):
                logger.debug("Converting numpy array")
                return embedding.flatten().astype(float).tolist()
        except ImportError:
            pass
        
        # If we reach here, log the problematic structure
        logger.error(f"Cannot convert embedding to 1D vector. Type: {type(embedding)}")
        if hasattr(embedding, '__dict__'):
            logger.error(f"Embedding attributes: {list(embedding.__dict__.keys())}")
        
        raise ValueError(f"Embedding is not convertible to 1D vector: {type(embedding)} - {str(embedding)[:200]}")

    def get_model_name(self) -> str:
        return self.model_name

    def get_embedding_dimension(self) -> int:
        return 768  # Gemini embedding-001 is 768-D

    def get_table_suffix(self) -> str:
        return "gemini"