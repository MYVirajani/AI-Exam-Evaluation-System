"""
Back-fill relational table student_answers from vectors table
student_answer_embeddings.

Usage:
    python -m src.scripts.backfill_student_answers
"""

import json, logging
from tqdm import tqdm
from src.services.database_services.student_answer_db import StudentAnswerService
from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
from src.models.student_answer import StudentAnswer
from src.services.embedding.openai_embedder import OpenAIEmbedder

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def main() -> None:
    dummy_embedder = OpenAIEmbedder("text-embedding-3-small")  # 👈 new
    vec_db  = StudentAnswerEmbeddingDB(dummy_embedder)         # pass it
    rel_db  = StudentAnswerService()

    vec_db.cursor.execute("""
        SELECT DISTINCT student_index, module_code, exam_year, exam_month
        FROM   student_answer_embeddings
    """)
    sessions = vec_db.cursor.fetchall()

    for stu_idx, mod, yr, mon in tqdm(sessions, desc="Sessions"):
        # pull every answer vector *once* just to get IDs back
        vec_db.cursor.execute("""
            SELECT question_id, sub_question_id, sub_sub_question_id,
                   full_question_id
            FROM   student_answer_embeddings
            WHERE  student_index=%s AND module_code=%s
               AND exam_year=%s AND exam_month=%s
        """, (stu_idx, mod, yr, mon))

        answers = []
        for q_id, sub_q, sub_sub_q, full_id in vec_db.cursor.fetchall():
            # you don't have the raw text stored in the vector table –>
            # put a placeholder so grading won't crash; ideally you would
            # re-extract from PDF.
            answers.append(StudentAnswer(
                question_id           = q_id,
                sub_question_id       = sub_q,
                sub_sub_question_id   = sub_sub_q,
                answer_text           = "(answer text missing – re-extract)",
                student_index         = stu_idx,
                module_code           = mod,
                exam_year             = yr,
                exam_month            = mon
            ))

        rel_db.save_answers(stu_idx, mod, yr, mon, answers)

    rel_db.close(); vec_db.close()
    log.info("✅ Back-filled %d sessions.", len(sessions))

if __name__ == "__main__":
    main()
