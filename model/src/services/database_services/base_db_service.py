import os
import psycopg2
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class BaseDBService:
    def __init__(self):
        connection_url = os.getenv("PGVECTOR_CONNECTION_STRING")
        if not connection_url:
            raise ValueError("Missing PGVECTOR_CONNECTION_STRING in environment")
        try:
            self.conn = psycopg2.connect(connection_url)
            self.cursor = self.conn.cursor()
            logger.info("Connected to vector database.")
        except Exception as e:
            logger.error(f"Connection failed: {e}")
            raise

    def commit(self):
        try:
            self.conn.commit()
            logger.info("Transaction committed.")
        except Exception as e:
            logger.error(f"Commit failed: {e}")
            raise

    def close(self):
        try:
            self.cursor.close()
            self.conn.close()
            logger.info("Connection closed.")
        except Exception as e:
            logger.error(f"Close failed: {e}")
            raise
