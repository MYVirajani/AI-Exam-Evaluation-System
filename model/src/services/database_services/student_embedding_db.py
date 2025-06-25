from .base_db_service import BaseDBService
import logging

logger = logging.getLogger(__name__)

# class StudentEmbeddingService(BaseDBService):
#     def initialize_table(self):
#         self.cursor.execute("""
#             CREATE TABLE IF NOT EXISTS student_answer_embeddings (
#                 student_index VARCHAR PRIMARY KEY,
#                 q1_i vector(1536), q1_ii vector(1536), q1_iii vector(1536), q1_iv vector(1536), q1_v vector(1536),
#                 q2_i vector(1536), q2_ii vector(1536), q2_iii vector(1536), q2_iv vector(1536), q2_v vector(1536),
#                 q3_i vector(1536), q3_ii vector(1536), q3_iii vector(1536), q3_iv vector(1536), q3_v vector(1536),
#                 q4_i vector(1536), q4_ii vector(1536), q4_iii vector(1536), q4_iv vector(1536), q4_v vector(1536),
#                 q5_i vector(1536), q5_ii vector(1536), q5_iii vector(1536), q5_iv vector(1536), q5_v vector(1536)
#             )
#         """)
#         self.commit()

#     def save_student_embeddings(self, student_index: str, embeddings_map: dict):
#         columns = list(embeddings_map.keys())
#         values = list(embeddings_map.values())
#         insert_columns = ["student_index"] + columns
#         placeholders = ["%s"] * len(insert_columns)

#         from psycopg2 import sql
#         query = sql.SQL("""
#             INSERT INTO student_answer_embeddings ({fields})
#             VALUES ({values})
#             ON CONFLICT (student_index) DO UPDATE SET
#             {updates}
#         """).format(
#             fields=sql.SQL(", ").join(map(sql.Identifier, insert_columns)),
#             values=sql.SQL(", ").join(sql.Placeholder() * len(insert_columns)),
#             updates=sql.SQL(", ").join(
#                 sql.Composed([sql.Identifier(col), sql.SQL(" = EXCLUDED."), sql.Identifier(col)])
#                 for col in columns
#             )
#         )

#         self.cursor.execute(query, [student_index] + values)
#         self.commit()


from .base_db_service import BaseDBService
from psycopg2 import sql
from typing import Dict, List

class StudentEmbeddingService(BaseDBService):
    def initialize_table(self):
        self.cursor.execute("""
            CREATE EXTENSION IF NOT EXISTS vector;
        """)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_answer_embeddings (
                student_index VARCHAR PRIMARY KEY,
                q1_i vector(1536), q1_ii vector(1536), q1_iii vector(1536), q1_iv vector(1536), q1_v vector(1536),
                q2_i vector(1536), q2_ii vector(1536), q2_iii vector(1536), q2_iv vector(1536), q2_v vector(1536),
                q3_i vector(1536), q3_ii vector(1536), q3_iii vector(1536), q3_iv vector(1536), q3_v vector(1536),
                q4_i vector(1536), q4_ii vector(1536), q4_iii vector(1536), q4_iv vector(1536), q4_v vector(1536),
                q5_i vector(1536), q5_ii vector(1536), q5_iii vector(1536), q5_iv vector(1536), q5_v vector(1536)
            )
        """)
        self.commit()

    def save_student_embeddings(self, student_index: str, embeddings_map: Dict[str, List[float]]):
        columns = list(embeddings_map.keys())
        vectors = [embeddings_map[col] for col in columns]

        insert_columns = ["student_index"] + columns
        placeholders = ["%s"] * len(insert_columns)
        insert_values = [student_index] + vectors

        query = sql.SQL("""
            INSERT INTO student_answer_embeddings ({fields})
            VALUES ({values})
            ON CONFLICT (student_index) DO UPDATE SET
            {updates}
        """).format(
            fields=sql.SQL(', ').join(map(sql.Identifier, insert_columns)),
            values=sql.SQL(', ').join(sql.Placeholder() * len(insert_columns)),
            updates=sql.SQL(', ').join(
                sql.Composed([
                    sql.Identifier(col),
                    sql.SQL(" = EXCLUDED."),
                    sql.Identifier(col)
                ]) for col in columns
            )
        )

        # Execute insert/update
        self.cursor.execute(query, insert_values)
        self.commit()
