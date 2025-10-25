import uuid
import json
import os
import sys
import logging
from typing import List, Dict, Any
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from src.services.database_services.base_relational_db import BaseRelationalDB
from ...models.student_answer import StudentAnswer

# --------------------------------------------------------------------------
# Configure logging
# --------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)


# --------------------------------------------------------------------------
# CLASS: StudentAnswerServiceWithMedia
# --------------------------------------------------------------------------
class StudentAnswerServiceWithMedia(BaseRelationalDB):
    """
    Handles saving and fetching student answers (and their associated media).
    Works with tables:
    - student_answer
    - student_answer_media
    """

    def __init__(self):
        super().__init__()
        logging.info("[DB] Using tables: student_answer, student_answer_media")
        print("⚙️ Using tables: student_answer, student_answer_media")

    # ----------------------------------------------------------------------
    # TABLE INITIALIZATION
    # ----------------------------------------------------------------------
    def initialize_tables(self):
        """Ensure tables exist (with UUID PKs)."""
        self.cursor.execute("""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS student_answer (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            submission_id TEXT,
            question_number TEXT,
            answer_text TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_answer_media (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_answer_id UUID REFERENCES student_answer(id) ON DELETE CASCADE,
            submission_id TEXT,
            media_url TEXT,
            media_summary JSONB
        );
        """)
        self.commit()

    # ----------------------------------------------------------------------
    # HELPERS
    # ----------------------------------------------------------------------
    def build_question_number(self, *parts):
        """Join non-empty question parts safely into a normalized string."""
        filtered = [str(p).strip() for p in parts if p and str(p).strip() != ""]
        return "_".join(filtered)

    # ----------------------------------------------------------------------
    # SAVE ANSWERS + MEDIA
    # ----------------------------------------------------------------------
    def save_answers(self, answers: List[StudentAnswer], submission_id: str):
        """
        Save all answers and their media entries into DB.
        Accepts a `submission_id` argument and stores it in both tables.
        """
        for idx, ans in enumerate(answers, start=1):
            try:
                answer_id = str(uuid.uuid4())

                question_number = self.build_question_number(
                    getattr(ans, "question_id", None),
                    getattr(ans, "sub_question_id", None),
                    getattr(ans, "sub_sub_question_id", None),
                    getattr(ans, "sub_sub_sub_question_id", None)
                )

                # ✅ Insert into student_answer
                self.cursor.execute("""
                    INSERT INTO student_answer (id, submission_id, question_number, answer_text)
                    VALUES (%s, %s, %s, %s);
                """, (answer_id, submission_id, question_number, ans.answer_text))

                # ✅ Insert related media (if any)
                if getattr(ans, "media_urls", None):
                    for url in ans.media_urls:
                        media_id = str(uuid.uuid4())
                        self.cursor.execute("""
                            INSERT INTO student_answer_media (
                                id, student_answer_id, submission_id, media_url, media_summary
                            ) VALUES (%s, %s, %s, %s, %s);
                        """, (media_id, answer_id, submission_id, url, None))

                self.commit()

            except Exception as e:
                logging.error(f"[DB] Failed to insert answer {idx}: {e}")
                self.rollback()

        print(f"✅ Saved {len(answers)} answers (with media) for submission_id={submission_id}.")

    # ----------------------------------------------------------------------
    # FETCH (SINGLE SUBMISSION)
    # ----------------------------------------------------------------------
    def get_all_answers(self, submission_id: str):
        """Return all answers + media summaries for one submission."""
        self.cursor.execute("""
            SELECT 
                a.id AS student_answer_id,
                a.question_number,
                a.answer_text,
                m.media_summary
            FROM student_answer a
            LEFT JOIN student_answer_media m 
                ON a.id = m.student_answer_id
            WHERE a.submission_id = %s
            ORDER BY a.question_number;
        """, (submission_id,))
        rows = self.cursor.fetchall()

        result = {}
        for ans_id, q_num, text, media_summary in rows:
            if q_num not in result:
                result[q_num] = {
                    "student_answer_id": ans_id,
                    "answer_text": text,
                    "media_summaries": []
                }
            if media_summary:
                result[q_num]["media_summaries"].append(media_summary)

        return result

    # ----------------------------------------------------------------------
    # FETCH (MULTIPLE SUBMISSIONS)
    # ----------------------------------------------------------------------
    def get_all_answers_by_submission_ids(self, submission_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Return all answers (student_answer_id, question_number, answer_text, [media_summaries])
        for multiple submissions.
        """
        if not submission_ids:
            logging.warning("[DB] No submission_ids provided.")
            return []

        try:
            query = """
                SELECT 
                    a.submission_id,
                    a.id AS student_answer_id,
                    a.question_number,
                    a.answer_text,
                    m.media_summary
                FROM student_answer a
                LEFT JOIN student_answer_media m 
                    ON a.id = m.student_answer_id
                WHERE a.submission_id = ANY(%s)
                ORDER BY a.submission_id, a.question_number;
            """
            self.cursor.execute(query, (submission_ids,))
            rows = self.cursor.fetchall()

            result_map = {}
            for sub_id, ans_id, q_num, text, media_summary in rows:
                key = (sub_id, ans_id)
                if key not in result_map:
                    result_map[key] = {
                        "submission_id": sub_id,
                        "student_answer_id": ans_id,
                        "question_number": q_num,
                        "answer_text": text,
                        "media_summaries": []
                    }
                if media_summary:
                    result_map[key]["media_summaries"].append(media_summary)

            return list(result_map.values())

        except Exception as e:
            logging.error(f"[DB] ❌ Failed to fetch answers for {submission_ids}: {e}")
            self.conn.rollback()
            return []
