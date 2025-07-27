# # import os
# # import psycopg2
# # from psycopg2 import sql
# # from dotenv import load_dotenv
# # import logging

# # load_dotenv()


# # logger = logging.getLogger(__name__)
# # logger.setLevel(logging.INFO)

# # class BaseVectorDBService:
# #     def __init__(self):
# #         try:
# #             connection_url = os.getenv("PGVECTOR_CONNECTION_STRING")
# #             if not connection_url:
# #                 raise ValueError("Missing PGVECTOR_CONNECTION_STRING in .env file")

# #             self.conn = psycopg2.connect(connection_url)
# #             self.cursor = self.conn.cursor()
# #             logger.info("Vector DB connection established using PGVECTOR_CONNECTION_STRING.")
# #         except Exception as e:
# #             logger.error(f"Failed to connect to vector database: {e}")
# #             raise

# #     def commit(self):
# #         """Commit the current transaction."""
# #         try:
# #             self.conn.commit()
# #             logger.info("Vector DB transaction committed.")
# #         except Exception as e:
# #             logger.error(f"Failed to commit vector DB transaction: {e}")
# #             raise

# #     def close(self):
# #         """Close the database connection."""
# #         try:
# #             self.cursor.close()
# #             self.conn.close()
# #             logger.info("Vector DB connection closed.")
# #         except Exception as e:
# #             logger.error(f"Failed to close vector DB connection: {e}")
# #             raise


# import os
# import psycopg2
# from dotenv import load_dotenv
# import logging

# load_dotenv()

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.INFO)

# class BaseVectorDBService:
#     def __init__(self, embedder=None):  # ✅ Accept embedder
#         try:
#             connection_url = os.getenv("PGVECTOR_CONNECTION_STRING")
#             if not connection_url:
#                 raise ValueError("Missing PGVECTOR_CONNECTION_STRING in .env file")

#             self.conn = psycopg2.connect(connection_url)
#             self.cursor = self.conn.cursor()
#             logger.info("Vector DB connection established using PGVECTOR_CONNECTION_STRING.")

#             # ✅ Store embedder and suffix
#             self.embedder = embedder
#             self.table_suffix = embedder.get_table_suffix() if embedder else ""
#             if embedder:
#                 logger.info(f"Embedding provider: {embedder.__class__.__name__} → Suffix: {self.table_suffix}")

#         except Exception as e:
#             logger.error(f"Failed to connect to vector database: {e}")
#             raise

#     def commit(self):
#         """Commit the current transaction."""
#         try:
#             self.conn.commit()
#             logger.info("Vector DB transaction committed.")
#         except Exception as e:
#             logger.error(f"Failed to commit vector DB transaction: {e}")
#             raise

#     def close(self):
#         """Close the database connection."""
#         try:
#             self.cursor.close()
#             self.conn.close()
#             logger.info("Vector DB connection closed.")
#         except Exception as e:
#             logger.error(f"Failed to close vector DB connection: {e}")
#             raise

import os
import psycopg2
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class BaseVectorDBService:
    def __init__(self, embedder=None):
        connection_url = os.getenv("PGVECTOR_CONNECTION_STRING")
        if not connection_url:
            raise ValueError("Missing PGVECTOR_CONNECTION_STRING in .env file")
        self.conn = psycopg2.connect(connection_url)
        self.cursor = self.conn.cursor()
        logger.info("Vector DB connection established using PGVECTOR_CONNECTION_STRING.")

        # Determine table suffix from embedder
        self.embedder = embedder
        self.suffix = embedder.get_table_suffix() if embedder else ""
        logger.info(f"Embedding provider: {embedder.__class__.__name__} → Suffix: {self.suffix}")

    def commit(self):
        self.conn.commit()
        logger.info("Vector DB transaction committed.")

    def close(self):
        self.cursor.close()
        self.conn.close()
        logger.info("Vector DB connection closed.")
