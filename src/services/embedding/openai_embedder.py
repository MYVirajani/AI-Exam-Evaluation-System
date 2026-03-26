# # src/services/embedding/openai_embedder.py

# from .abstract_embedder import AbstractEmbedder
# import os
# from openai import OpenAI
# from dotenv import load_dotenv

# load_dotenv()

# class OpenAIEmbedder(AbstractEmbedder):
#     def __init__(self, model_name="text-embedding-3-small"):
#         self.model_name = model_name
#         self.api_key = os.getenv("OPENAI_API_KEY")
#         self.client = OpenAI(api_key=self.api_key)

#     def embed(self, texts):
#         response = self.client.embeddings.create(
#             input=texts,
#             model=self.model_name
#         )
#         return [r.embedding for r in response.data]

#     def get_model_name(self):
#         return self.model_name

#     def get_embedding_dimension(self):
#         if self.model_name == "text-embedding-3-small":
#             return 1536
#         return 1536  


# # src/services/embedding/openai_embedder.py

# from .abstract_embedder import AbstractEmbedder
# import os
# from openai import OpenAI
# from dotenv import load_dotenv
# import logging

# load_dotenv()
# logger = logging.getLogger(__name__)

# class OpenAIEmbedder(AbstractEmbedder):
#     def __init__(self, model_name="text-embedding-3-small"):
#         self.model_name = model_name
#         self.api_key = os.getenv("OPENAI_API_KEY")
#         self.client = OpenAI(api_key=self.api_key)

#     def embed(self, texts):
#         # Validate and clean texts
#         cleaned_texts = [t.strip() for t in texts if t and t.strip()]
#         if not cleaned_texts:
#             logger.error("No valid texts provided for embedding.")
#             raise ValueError("No valid texts to embed.")

#         try:
#             response = self.client.embeddings.create(
#                 input=cleaned_texts,
#                 model=self.model_name
#             )
#             return [r.embedding for r in response.data]
#         except Exception as e:
#             logger.exception(f"Error during embedding: {e}")
#             raise

#     def get_model_name(self):
#         return self.model_name

#     def get_embedding_dimension(self):
#         # You can expand this for more models
#         if self.model_name == "text-embedding-3-small":
#             return 1536
#         return 1536

# src/services/embedding/openai_embedder.py

from .abstract_embedder import AbstractEmbedder
import os
from openai import OpenAI
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class OpenAIEmbedder(AbstractEmbedder):
    def __init__(self, model_name="text-embedding-3-small"):
        self.model_name = model_name
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

    def embed(self, texts):
        cleaned_texts = [t.strip() for t in texts if t and t.strip()]
        if not cleaned_texts:
            logger.error("No valid texts provided for embedding.")
            raise ValueError("No valid texts to embed.")

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
        return "openai"
