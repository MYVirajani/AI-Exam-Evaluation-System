import logging
from pgvector.psycopg2 import register_vector
from ..embedding.abstract_embedder import AbstractEmbedder
from .base_vector_db_service import BaseVectorDBService
from ...models.lecture_chunk import LectureChunk

logger = logging.getLogger(__name__)

class LectureMaterialEmbeddingDB(BaseVectorDBService):
    def __init__(self, embedder: AbstractEmbedder, provider_override: str = None):
        super().__init__(embedder)
        self.embedder = embedder

        # Use override if provided (e.g., "deepseek")
        self.suffix = provider_override.lower() if provider_override else self.suffix
        self.table = f"lecture_material_chunks_{self.suffix}"

        register_vector(self.conn)
        logger.info(f"[VectorDB] Using table: {self.table}")
        self._create_table()

    def _create_table(self):
        dim = self.embedder.get_embedding_dimension()
        self.cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.table} (
                id SERIAL PRIMARY KEY,
                module_code  TEXT,
                source_file  TEXT,
                chunk_id     INT,
                assessment_id TEXT,
                text         TEXT,
                embedding    vector({dim}),
                UNIQUE(module_code, source_file, chunk_id, assessment_id)
            );
        """)
        self.commit()

    def save_chunks(self, chunks: list[LectureChunk], assessment_id: str = None) -> None:
        if not chunks:
            return

        vectors = self.embedder.embed([c.embedding_payload() for c in chunks])

        for ck, vec in zip(chunks, vectors):
            self.cursor.execute(f"""
                INSERT INTO {self.table} (
                  module_code, source_file, chunk_id, assessment_id, text, embedding
                ) VALUES (%s,%s,%s,%s,%s,%s)
                ON CONFLICT (module_code, source_file, chunk_id, assessment_id)
                DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding;
            """, (ck.module_code, ck.source_file, ck.chunk_id, assessment_id, ck.text, vec))

        self.commit()
        logger.info("✅ Saved %d lecture chunks to table: %s", len(chunks), self.table)

    def search(self, query: str, module_code: str | None = None, assessment_id: str = None, top_k: int = 5):
        q_vec = self.embedder.embed([query])[0]

        where_conditions = []
        params = []
        
        if module_code:
            where_conditions.append("module_code = %s")
            params.append(module_code)
            
        if assessment_id:
            where_conditions.append("assessment_id = %s")
            params.append(assessment_id)
        
        where_clause = ""
        if where_conditions:
            where_clause = "WHERE " + " AND ".join(where_conditions)
        
        # Add embedding vector parameters
        params.extend([q_vec, q_vec])

        self.cursor.execute(f"""
            SELECT module_code, source_file, chunk_id, assessment_id, text,
                   1 - (embedding <=> %s) AS sim
            FROM {self.table}
            {where_clause}
            ORDER BY embedding <=> %s
            LIMIT {top_k};
        """, params)

        return self.cursor.fetchall()

    def document_exists(self, module_code: str, source_file: str) -> bool:
        """Checks if chunks already exist for a given document"""
        self.cursor.execute(
            f"""
            SELECT 1 FROM {self.table}
            WHERE module_code = %s AND source_file = %s
            LIMIT 1;
            """,
            (module_code, source_file),
        )
        return self.cursor.fetchone() is not None