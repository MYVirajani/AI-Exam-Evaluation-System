from .base_db_service import BaseDBService
from psycopg2 import sql

class LectureMaterialEmbeddingService(BaseDBService):
    def initialize_table(self):
        self.cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS lecture_material_embeddings (
                filename TEXT,
                chunk_id SERIAL PRIMARY KEY,
                chunk_text TEXT,
                embedding vector(1536)
            )
        """)
        self.commit()

    def save_lecture_embeddings(self, filename: str, embeddings_map: dict):
        for chunk_text, vector in embeddings_map.items():
            self.cursor.execute("""
                INSERT INTO lecture_material_embeddings (filename, chunk_text, embedding)
                VALUES (%s, %s, %s)
            """, (filename, chunk_text, vector))
        self.commit()
