import logging
from pgvector.psycopg2 import register_vector

from ..embedding.abstract_embedder import AbstractEmbedder
from .base_vector_db_service import BaseVectorDBService
from ...models.lecture_chunk import LectureChunk

logger = logging.getLogger(__name__)

class LectureMaterialEmbeddingDB(BaseVectorDBService):
    def __init__(self, embedder: AbstractEmbedder):
        super().__init__()
        self.embedder = embedder
        self.table = "lecture_material_chunks"
        register_vector(self.conn)
        self._create_table()

    def _create_table(self):
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table} (
                id SERIAL PRIMARY KEY,
                module_code  TEXT,
                source_file  TEXT,
                chunk_id     INT,
                text         TEXT,
                embedding    vector({dim}),
                UNIQUE(module_code, source_file, chunk_id)
            );
        """)
        self.commit()

    # ------------------------------------------- INSERT
    def save_chunks(self, chunks: list[LectureChunk]) -> None:
        if not chunks:
            return

        vectors = self.embedder.embed([c.embedding_payload() for c in chunks])

        for ck, vec in zip(chunks, vectors):
            self.cursor.execute(f"""
                INSERT INTO {self.table} (
                  module_code, source_file, chunk_id, text, embedding
                ) VALUES (%s,%s,%s,%s,%s)
                ON CONFLICT (module_code, source_file, chunk_id)
                DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding;
            """, (ck.module_code, ck.source_file, ck.chunk_id, ck.text, vec))

        self.commit()
        logger.info("Saved %d lecture chunks.", len(chunks))

    # ------------------------------------------- QUERY
    def search(self, query: str, module_code: str | None = None, top_k: int = 5):
        q_vec = self.embedder.embed([query])[0]
        where, params = ("WHERE module_code = %s", [module_code]) if module_code else ("", [])
        params.append(q_vec)

        self.cursor.execute(f"""
            SELECT module_code,
                   source_file,
                   chunk_id,
                   text,
                   1 - (embedding <=> %s) AS sim
            FROM {self.table}
            {where}
            ORDER BY embedding <=> %s
            LIMIT {top_k};
        """, params * 2)
        return self.cursor.fetchall()
