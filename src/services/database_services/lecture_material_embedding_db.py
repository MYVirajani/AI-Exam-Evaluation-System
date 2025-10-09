# # # # import logging
# # # # from pgvector.psycopg2 import register_vector

# # # # from ..embedding.abstract_embedder import AbstractEmbedder
# # # # from .base_vector_db_service import BaseVectorDBService
# # # # from ...models.lecture_chunk import LectureChunk

# # # # logger = logging.getLogger(__name__)

# # # # class LectureMaterialEmbeddingDB(BaseVectorDBService):
# # # #     def __init__(self, embedder: AbstractEmbedder):
# # # #         super().__init__()
# # # #         self.embedder = embedder
# # # #         self.table = "lecture_material_chunks"
# # # #         register_vector(self.conn)
# # # #         self._create_table()

# # # #     def _create_table(self):
# # # #         dim = self.embedder.get_embedding_dimension()
# # # #         self.cursor.execute(f"""
# # # #             CREATE TABLE IF NOT EXISTS {self.table} (
# # # #                 id SERIAL PRIMARY KEY,
# # # #                 module_code  TEXT,
# # # #                 source_file  TEXT,
# # # #                 chunk_id     INT,
# # # #                 text         TEXT,
# # # #                 embedding    vector({dim}),
# # # #                 UNIQUE(module_code, source_file, chunk_id)
# # # #             );
# # # #         """)
# # # #         self.commit()

# # # #     # ------------------------------------------- INSERT
# # # #     def save_chunks(self, chunks: list[LectureChunk]) -> None:
# # # #         if not chunks:
# # # #             return

# # # #         vectors = self.embedder.embed([c.embedding_payload() for c in chunks])

# # # #         for ck, vec in zip(chunks, vectors):
# # # #             self.cursor.execute(f"""
# # # #                 INSERT INTO {self.table} (
# # # #                   module_code, source_file, chunk_id, text, embedding
# # # #                 ) VALUES (%s,%s,%s,%s,%s)
# # # #                 ON CONFLICT (module_code, source_file, chunk_id)
# # # #                 DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding;
# # # #             """, (ck.module_code, ck.source_file, ck.chunk_id, ck.text, vec))

# # # #         self.commit()
# # # #         logger.info("Saved %d lecture chunks.", len(chunks))

# # # #     # ------------------------------------------- QUERY
# # # #     def search(self, query: str, module_code: str | None = None, top_k: int = 5):
# # # #         q_vec = self.embedder.embed([query])[0]
# # # #         where, params = ("WHERE module_code = %s", [module_code]) if module_code else ("", [])
# # # #         params.append(q_vec)

# # # #         self.cursor.execute(f"""
# # # #             SELECT module_code,
# # # #                    source_file,
# # # #                    chunk_id,
# # # #                    text,
# # # #                    1 - (embedding <=> %s) AS sim
# # # #             FROM {self.table}
# # # #             {where}
# # # #             ORDER BY embedding <=> %s
# # # #             LIMIT {top_k};
# # # #         """, params * 2)
# # # #         return self.cursor.fetchall()


# # # # src/services/database_services/lecture_material_embedding_db.py

# # # import logging
# # # from pgvector.psycopg2 import register_vector
# # # from ..embedding.abstract_embedder import AbstractEmbedder
# # # from .base_vector_db_service import BaseVectorDBService
# # # from ...models.lecture_chunk import LectureChunk

# # # logger = logging.getLogger(__name__)

# # # class LectureMaterialEmbeddingDB(BaseVectorDBService):
# # #     def __init__(self, embedder: AbstractEmbedder):
# # #         super().__init__(embedder)
# # #         self.embedder = embedder
# # #         self.table = f"lecture_material_chunks_{embedder.get_table_suffix()}"
# # #         logger.info(f"Using table: {self.table}")
# # #         register_vector(self.conn)
# # #         self._create_table()

# # #     def _create_table(self):
# # #         dim = self.embedder.get_embedding_dimension()
# # #         self.cursor.execute(f"""
# # #             CREATE TABLE IF NOT EXISTS {self.table} (
# # #                 id SERIAL PRIMARY KEY,
# # #                 module_code  TEXT,
# # #                 source_file  TEXT,
# # #                 chunk_id     INT,
# # #                 text         TEXT,
# # #                 embedding    vector({dim}),
# # #                 UNIQUE(module_code, source_file, chunk_id)
# # #             );
# # #         """)
# # #         self.commit()

# # #     def save_chunks(self, chunks: list[LectureChunk]) -> None:
# # #         if not chunks:
# # #             return

# # #         vectors = self.embedder.embed([c.embedding_payload() for c in chunks])

# # #         for ck, vec in zip(chunks, vectors):
# # #             self.cursor.execute(f"""
# # #                 INSERT INTO {self.table} (
# # #                   module_code, source_file, chunk_id, text, embedding
# # #                 ) VALUES (%s,%s,%s,%s,%s)
# # #                 ON CONFLICT (module_code, source_file, chunk_id)
# # #                 DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding;
# # #             """, (ck.module_code, ck.source_file, ck.chunk_id, ck.text, vec))

# # #         self.commit()
# # #         logger.info("Saved %d lecture chunks.", len(chunks))

# # #     def search(self, query: str, module_code: str | None = None, top_k: int = 5):
# # #         q_vec = self.embedder.embed([query])[0]
# # #         where, params = ("WHERE module_code = %s", [module_code]) if module_code else ("", [])
# # #         params.append(q_vec)

# # #         self.cursor.execute(f"""
# # #             SELECT module_code,
# # #                    source_file,
# # #                    chunk_id,
# # #                    text,
# # #                    1 - (embedding <=> %s) AS sim
# # #             FROM {self.table}
# # #             {where}
# # #             ORDER BY embedding <=> %s
# # #             LIMIT {top_k};
# # #         """, params * 2)
# # #         return self.cursor.fetchall()


# # import logging
# # from pgvector.psycopg2 import register_vector

# # from ..embedding.abstract_embedder import AbstractEmbedder
# # from .base_vector_db_service import BaseVectorDBService
# # from ...models.lecture_chunk import LectureChunk

# # logger = logging.getLogger(__name__)

# # class LectureMaterialEmbeddingDB(BaseVectorDBService):
# #     def __init__(self, embedder: AbstractEmbedder):
# #         super().__init__(embedder)
# #         self.embedder = embedder
# #         self.table = f"lecture_material_chunks_{self.suffix}"
# #         register_vector(self.conn)
# #         logger.info(f"Using table: {self.table}")
# #         self._create_table()

# #     def _create_table(self):
# #         dim = self.embedder.get_embedding_dimension()
# #         self.cursor.execute(f"""
# #             CREATE TABLE IF NOT EXISTS {self.table} (
# #                 id SERIAL PRIMARY KEY,
# #                 module_code  TEXT,
# #                 source_file  TEXT,
# #                 chunk_id     INT,
# #                 text         TEXT,
# #                 embedding    vector({dim}),
# #                 UNIQUE(module_code, source_file, chunk_id)
# #             );
# #         """)
# #         self.commit()

# #     def save_chunks(self, chunks: list[LectureChunk]) -> None:
# #         if not chunks:
# #             return
# #         vectors = self.embedder.embed([c.embedding_payload() for c in chunks])
# #         for ck, vec in zip(chunks, vectors):
# #             self.cursor.execute(f"""
# #                 INSERT INTO {self.table} (
# #                   module_code, source_file, chunk_id, text, embedding
# #                 ) VALUES (%s,%s,%s,%s,%s)
# #                 ON CONFLICT (module_code, source_file, chunk_id)
# #                 DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding;
# #             """, (ck.module_code, ck.source_file, ck.chunk_id, ck.text, vec))
# #         self.commit()
# #         logger.info("Saved %d lecture chunks.", len(chunks))

# #     def search(self, query: str, module_code: str | None = None, top_k: int = 5):
# #         q_vec = self.embedder.embed([query])[0]
# #         where, params = ("WHERE module_code = %s", [module_code]) if module_code else ("", [])
# #         params.append(q_vec)

# #         self.cursor.execute(f"""
# #             SELECT module_code, source_file, chunk_id, text,
# #                    1 - (embedding <=> %s) AS sim
# #             FROM {self.table}
# #             {where}
# #             ORDER BY embedding <=> %s
# #             LIMIT {top_k};
# #         """, params * 2)
# #         return self.cursor.fetchall()

# import logging
# from pgvector.psycopg2 import register_vector
# from ..embedding.abstract_embedder import AbstractEmbedder
# from .base_vector_db_service import BaseVectorDBService
# from ...models.lecture_chunk import LectureChunk

# logger = logging.getLogger(__name__)

# class LectureMaterialEmbeddingDB(BaseVectorDBService):
#     def __init__(self, embedder: AbstractEmbedder):
#         super().__init__(embedder)
#         self.embedder = embedder
#         self.table = f"lecture_material_chunks_{self.suffix}"
#         register_vector(self.conn)
#         logger.info(f"Using table: {self.table}")
#         self._create_table()

#     def _create_table(self):
#         dim = self.embedder.get_embedding_dimension()
#         self.cursor.execute(f"""
#             CREATE TABLE IF NOT EXISTS {self.table} (
#                 id SERIAL PRIMARY KEY,
#                 module_code  TEXT,
#                 source_file  TEXT,
#                 chunk_id     INT,
#                 text         TEXT,
#                 embedding    vector({dim}),
#                 UNIQUE(module_code, source_file, chunk_id)
#             );
#         """)
#         self.commit()

#     def save_chunks(self, chunks: list[LectureChunk]) -> None:
#         if not chunks:
#             return

#         vectors = self.embedder.embed([c.embedding_payload() for c in chunks])

#         for ck, vec in zip(chunks, vectors):
#             self.cursor.execute(f"""
#                 INSERT INTO {self.table} (
#                   module_code, source_file, chunk_id, text, embedding
#                 ) VALUES (%s,%s,%s,%s,%s)
#                 ON CONFLICT (module_code, source_file, chunk_id)
#                 DO UPDATE SET text = EXCLUDED.text, embedding = EXCLUDED.embedding;
#             """, (ck.module_code, ck.source_file, ck.chunk_id, ck.text, vec))

#         self.commit()
#         logger.info("Saved %d lecture chunks.", len(chunks))

#     def search(self, query: str, module_code: str | None = None, top_k: int = 5):
#         q_vec = self.embedder.embed([query])[0]

#         if module_code:
#             where_clause = "WHERE module_code = %s"
#             params = [module_code, q_vec, q_vec]
#         else:
#             where_clause = ""
#             params = [q_vec, q_vec]

#         self.cursor.execute(f"""
#             SELECT module_code, source_file, chunk_id, text,
#                    1 - (embedding <=> %s) AS sim
#             FROM {self.table}
#             {where_clause}
#             ORDER BY embedding <=> %s
#             LIMIT {top_k};
#         """, params)

#         return self.cursor.fetchall()

#     def document_exists(self, module_code: str, source_file: str) -> bool:
#         """
#         Checks whether any chunks exist for the given document in the vector table.
#         Avoids re-embedding if already present.
#         """
#         self.cursor.execute(
#             f"""
#             SELECT 1 FROM {self.table}
#             WHERE module_code = %s AND source_file = %s
#             LIMIT 1;
#             """,
#             (module_code, source_file),
#         )
#         return self.cursor.fetchone() is not None


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
                text         TEXT,
                embedding    vector({dim}),
                UNIQUE(module_code, source_file, chunk_id)
            );
        """)
        self.commit()

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
        logger.info("✅ Saved %d lecture chunks to table: %s", len(chunks), self.table)

    def search(self, query: str, module_code: str | None = None, top_k: int = 5):
        q_vec = self.embedder.embed([query])[0]

        if module_code:
            where_clause = "WHERE module_code = %s"
            params = [module_code, q_vec, q_vec]
        else:
            where_clause = ""
            params = [q_vec, q_vec]

        self.cursor.execute(f"""
            SELECT module_code, source_file, chunk_id, text,
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
