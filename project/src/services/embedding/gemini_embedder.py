# # # src/services/embedding/gemini_embedder.py

# # from .abstract_embedder import AbstractEmbedder

# # class GeminiEmbedder(AbstractEmbedder):
# #     def __init__(self, model_name="embedding-001"):
# #         self.model_name = model_name
# #         # Initialize Gemini embedding model client

# #     def embed(self, texts):
# #         # Call Gemini API
# #         return [self._mock_vector()] * len(texts)

# #     def get_model_name(self):
# #         return self.model_name

# #     def get_embedding_dimension(self):
# #         return 768  # For example, Gemini returns 768-d vectors

# #     def _mock_vector(self):
# #         return [0.01] * 768

# # src/services/embedding/gemini_embedder.py
# import os
# from typing import List
# from dotenv import load_dotenv          # ← NEW
# import google.generativeai as genai

# from .abstract_embedder import AbstractEmbedder

# class GeminiEmbedder(AbstractEmbedder):
#     """
#     Wrapper for Google Generative AI embedding models.
#     Default: 'models/embedding-001' (768-D).
#     """

#     def __init__(self, model_name: str = "models/embedding-001"):
#         load_dotenv()                                  # ← NEW: pulls in .env
#         self.model_name = model_name

#         api_key = os.getenv("GOOGLE_API_KEY")
#         if not api_key:
#             raise RuntimeError(
#                 "GOOGLE_API_KEY not found. "
#                 "Add it to .env or export in your shell."
#             )
#         genai.configure(api_key=api_key)

#     # ---------- AbstractEmbedder ----------------------------------------
#     def embed(self, texts: List[str]) -> List[List[float]]:
#         resp = genai.embed_content(model=self.model_name, content=texts)
#         return [item["embedding"] for item in resp["embeddings"]]

#     def get_model_name(self) -> str:
#         return self.model_name

#     def get_embedding_dimension(self) -> int:
#         return 768   # models/embedding-001

import os
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai

from .abstract_embedder import AbstractEmbedder


class GeminiEmbedder(AbstractEmbedder):
    """
    Calls Gemini embedding endpoint.

    Default model: 'models/embedding-001' (768-D vectors).
    """

    def __init__(self, model_name: str = "models/embedding-001"):
        load_dotenv()
        self.model_name = model_name
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY not set in environment or .env file")
        genai.configure(api_key=api_key)

    # ------------------------------------------------------------------ #
    # AbstractEmbedder implementation
    # ------------------------------------------------------------------ #
    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Return a vector for every string in *texts*.

        Handles both single and batch calls safely.
        """
        if len(texts) == 1:
            # fast path: single string → single dict ↓
            resp = genai.embed_content(model=self.model_name, content=texts[0])
            return [resp["embedding"]]

        # batch path
        resp = genai.embed_content(model=self.model_name, content=texts)
        if "embeddings" in resp:                           # normal batch
            return [item["embedding"] for item in resp["embeddings"]]

        # fallback: SDK sometimes returns {"embedding": …} for batch of 1
        if "embedding" in resp:
            return [resp["embedding"]]

        raise RuntimeError(
            f"Unexpected response shape from Gemini embedding: {resp.keys()}"
        )

    def get_model_name(self) -> str:
        return self.model_name

    def get_embedding_dimension(self) -> int:
        return 768  # fixed for models/embedding-001
