import os
import psycopg2
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class BaseRelationalDB:
    def __init__(self):
        try:
            self.conn = psycopg2.connect(
                dbname=os.getenv("POSTGRES_DB"),
                user=os.getenv("POSTGRES_USER"),
                password=os.getenv("POSTGRES_PASSWORD"),
                host=os.getenv("POSTGRES_HOST", "localhost"),
                port=os.getenv("POSTGRES_PORT", "5432")
            )
            self.cursor = self.conn.cursor()
            logger.info("Relational DB connection established.")
        except Exception as e:
            logger.error(f"Failed to connect to relational DB: {e}")
            raise

    def commit(self):
        try:
            self.conn.commit()
        except Exception as e:
            logger.error(f"Commit failed: {e}")
            raise

    def close(self):
        try:
            self.cursor.close()
            self.conn.close()
        except Exception as e:
            logger.error(f"Failed to close relational DB: {e}")
            raise
