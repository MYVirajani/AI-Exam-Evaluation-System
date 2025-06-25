import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Setup logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class BaseVectorDBService:
    def __init__(self):
        try:
            connection_url = os.getenv("PGVECTOR_CONNECTION_STRING")
            if not connection_url:
                raise ValueError("Missing PGVECTOR_CONNECTION_STRING in .env file")

            self.conn = psycopg2.connect(connection_url)
            self.cursor = self.conn.cursor()
            logger.info("Vector DB connection established using PGVECTOR_CONNECTION_STRING.")
        except Exception as e:
            logger.error(f"Failed to connect to vector database: {e}")
            raise

    def commit(self):
        """Commit the current transaction."""
        try:
            self.conn.commit()
            logger.info("Vector DB transaction committed.")
        except Exception as e:
            logger.error(f"Failed to commit vector DB transaction: {e}")
            raise

    def close(self):
        """Close the database connection."""
        try:
            self.cursor.close()
            self.conn.close()
            logger.info("Vector DB connection closed.")
        except Exception as e:
            logger.error(f"Failed to close vector DB connection: {e}")
            raise
