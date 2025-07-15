# import os
# import psycopg2
# from psycopg2 import sql
# from dotenv import load_dotenv
# import logging

# # Load environment variables from .env
# load_dotenv()

# # Setup logger
# logger = logging.getLogger(__name__)
# logger.setLevel(logging.INFO)

# class BaseDBService:
#     def __init__(self):
#         try:
#             self.conn = psycopg2.connect(
#                 dbname=os.getenv("POSTGRES_DB"),
#                 user=os.getenv("POSTGRES_USER"),
#                 password=os.getenv("POSTGRES_PASSWORD"),
#                 host=os.getenv("POSTGRES_HOST", "localhost"),
#                 port=os.getenv("POSTGRES_PORT", "5432")
#             )
#             self.cursor = self.conn.cursor()
#             logger.info("PostgreSQL connection established.")
#         except Exception as e:
#             logger.error(f"Failed to connect to database: {e}")
#             raise

#     def commit(self):
#         """Commit the current transaction."""
#         try:
#             self.conn.commit()
#             logger.info("Database transaction committed.")
#         except Exception as e:
#             logger.error(f"Failed to commit transaction: {e}")
#             raise

#     def close(self):
#         """Close the database connection."""
#         try:
#             self.cursor.close()
#             self.conn.close()
#             logger.info("Database connection closed.")
#         except Exception as e:
#             logger.error(f"Failed to close database connection: {e}")
#             raise
