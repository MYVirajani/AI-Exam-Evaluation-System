import uuid
import logging
from typing import List
from .base_relational_db import BaseRelationalDB
from ...models.student_answer import StudentAnswer


class StudentAnswerServiceWithMedia(BaseRelationalDB):
    """
    Handles saving extracted answers into normalized DB tables:
    - student_answer
    - student_answer_media
    """

    def __init__(self):
        super().__init__()
        self.submission_id = "1234"  # 🔒 Hardcoded for now (replace later)
        logging.info("[DB] Using normalized tables: student_answer, student_answer_media")
        print("⚙️ Using tables: student_answer, student_answer_media")

    # --------------------------------------------------------------------------
    # CREATE TABLES (if not exist)
    # --------------------------------------------------------------------------
    def initialize_tables(self):
        """Ensure both tables exist with UUID-based primary keys."""
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

    # --------------------------------------------------------------------------
    # HELPER: Build clean question number
    # --------------------------------------------------------------------------
    def build_question_number(self, *parts):
        """
        Build a clean question number string by joining non-empty parts with '_'.
        Example:
            ('1', 'a', '', 'i') -> '1_a_i'
            ('2', None, '', '') -> '2'
        """
        filtered = [str(p).strip() for p in parts if p and str(p).strip() != ""]
        return "_".join(filtered)

    # --------------------------------------------------------------------------
    # SAVE ANSWERS + MEDIA
    # --------------------------------------------------------------------------
    def save_answers(self, answers: List[StudentAnswer]):
        """
        Save all answers to student_answer and student_answer_media tables.
        Generates UUIDs manually for robustness.
        """
        for idx, ans in enumerate(answers, start=1):
            try:
                answer_id = str(uuid.uuid4())

                # 🧩 Build clean question number safely
                question_number = self.build_question_number(
                    getattr(ans, "question_id", None),
                    getattr(ans, "sub_question_id", None),
                    getattr(ans, "sub_sub_question_id", None),
                    getattr(ans, "sub_sub_sub_question_id", None)
                )

                # Insert into student_answer
                self.cursor.execute("""
                    INSERT INTO student_answer (id, submission_id, question_number, answer_text)
                    VALUES (%s, %s, %s, %s);
                """, (answer_id, self.submission_id, question_number, ans.answer_text))

                # Insert related media (if any)
                if getattr(ans, "media_urls", None):
                    for url in ans.media_urls:
                        media_id = str(uuid.uuid4())
                        self.cursor.execute("""
                            INSERT INTO student_answer_media (id, student_answer_id, submission_id, media_url, media_summary)
                            VALUES (%s, %s, %s, %s, %s);
                        """, (media_id, answer_id, self.submission_id, url, None))  # media_summary = None for now

                self.commit()

            except Exception as e:
                logging.error(f"[DB] Failed to insert answer {idx}: {e}")
                print(f"❌ Failed to insert answer {idx}: {e}")
                if hasattr(self, "rollback"):
                    self.rollback()
                else:
                    self.conn.rollback()

        print(f"✅ Saved {len(answers)} answers (with media) to normalized tables.")

    # --------------------------------------------------------------------------
    # FETCH METHODS
    # --------------------------------------------------------------------------
    def get_all_answers(self, submission_id: int):
        """Return all answers and their media for a given submission."""
        self.cursor.execute("""
            SELECT a.id, a.question_number, a.answer_text, m.media_url
            FROM student_answer a
            LEFT JOIN student_answer_media m ON a.id = m.student_answer_id
            WHERE a.submission_id = %s
            ORDER BY a.question_number;
        """, (submission_id,))
        rows = self.cursor.fetchall()

        result = {}
        for ans_id, q_num, text, media_url in rows:
            if q_num not in result:
                result[q_num] = {"answer_text": text, "media_urls": []}
            if media_url:
                result[q_num]["media_urls"].append(media_url)

        return result
