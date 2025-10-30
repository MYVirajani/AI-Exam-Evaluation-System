import uuid
import json
import os
import sys
import logging
from typing import List, Dict, Any, Optional
from psycopg2.extras import execute_values

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
from src.services.database_services.base_relational_db import BaseRelationalDB
from src.models.student_answer import StudentAnswer

# --------------------------------------------------------------------------
# Configure logging
# --------------------------------------------------------------------------
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# --------------------------------------------------------------------------
# CLASS: StudentAnswerServiceWithMedia
# --------------------------------------------------------------------------
class StudentAnswerServiceWithMedia(BaseRelationalDB):
    """
    Handles saving, updating, deleting, and fetching student answers and media,
    using dynamically named tables based on the AI model (e.g., student_answer_gemini_1_5_pro).
    """

    def __init__(self, ai_model: str = "openai"):
        super().__init__()
        self.ai_model = ai_model.lower().replace("-", "_").replace(".", "_")
        self.student_answer_table = f"student_answer_{self.ai_model}"
        self.student_answer_media_table = f"student_answer_media_{self.ai_model}"
        self._ensure_tables_exist()
        logger.info(f"[DB] Using tables: {self.student_answer_table}, {self.student_answer_media_table}")

    # ----------------------------------------------------------------------
    # TABLE INITIALIZATION
    # ----------------------------------------------------------------------
    def _ensure_tables_exist(self):
        """Ensure AI model–specific tables exist (with UUID PKs)."""
        create_query = f"""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.student_answer_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            submission_id TEXT NOT NULL,
            question_number TEXT,
            answer_text TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS {self.student_answer_media_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_answer_id UUID REFERENCES {self.student_answer_table}(id) ON DELETE CASCADE,
            submission_id TEXT NOT NULL,
            media_url TEXT NOT NULL,
            media_summary JSONB,
            created_on TIMESTAMP DEFAULT NOW()
        );
        """
        try:
            self.cursor.execute(create_query)
            self.conn.commit()
            logger.info(f"✅ Checked/created tables: {self.student_answer_table}, {self.student_answer_media_table}")
        except Exception as e:
            logger.error(f"❌ Failed to create tables: {e}", exc_info=True)
            self.conn.rollback()
            raise

    # ----------------------------------------------------------------------
    # HELPERS
    # ----------------------------------------------------------------------
    def build_question_number(self, *parts):
        """Join non-empty question parts safely into a normalized string."""
        filtered = [str(p).strip() for p in parts if p and str(p).strip() != ""]
        return "_".join(filtered)

    # ----------------------------------------------------------------------
    # CREATE / SAVE ANSWERS
    # ----------------------------------------------------------------------
    def save_answers(self, answers: List[StudentAnswer], submission_id: str):
        """Save multiple student answers and their associated media."""
        if not answers:
            logger.warning("⚠️ No answers provided to save.")
            return

        answer_values = []
        media_values = []

        for ans in answers:
            answer_id = str(uuid.uuid4())
            q_number = self.build_question_number(
                getattr(ans, "question_id", None),
                getattr(ans, "sub_question_id", None),
                getattr(ans, "sub_sub_question_id", None),
                getattr(ans, "sub_sub_sub_question_id", None)
            )

            answer_values.append((answer_id, submission_id, q_number, ans.answer_text))

            if getattr(ans, "media_urls", None):
                for url in ans.media_urls:
                    media_id = str(uuid.uuid4())
                    media_values.append((media_id, answer_id, submission_id, url, None))

        try:
            # Insert answers
            insert_answers = f"""
                INSERT INTO {self.student_answer_table} 
                (id, submission_id, question_number, answer_text)
                VALUES %s;
            """
            execute_values(self.cursor, insert_answers, answer_values)

            # Insert media
            if media_values:
                insert_media = f"""
                    INSERT INTO {self.student_answer_media_table}
                    (id, student_answer_id, submission_id, media_url, media_summary)
                    VALUES %s;
                """
                execute_values(self.cursor, insert_media, media_values)

            self.commit()
            logger.info(f"✅ Saved {len(answer_values)} answers and {len(media_values)} media for submission_id={submission_id}")
        except Exception as e:
            logger.error(f"❌ Failed to save student answers: {e}", exc_info=True)
            self.rollback()
            raise

    # ----------------------------------------------------------------------
    # UPDATE ANSWER
    # ----------------------------------------------------------------------
    def update_answer(self, answer_id: str, new_text: str) -> bool:
        """Update a single student answer."""
        query = f"""
        UPDATE {self.student_answer_table}
        SET answer_text = %s, updated_at = NOW()
        WHERE id = %s;
        """
        try:
            self.cursor.execute(query, (new_text, answer_id))
            self.commit()
            logger.info(f"✅ Updated answer_id={answer_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to update answer {answer_id}: {e}")
            self.rollback()
            return False

    # ----------------------------------------------------------------------
    # DELETE ANSWER (and cascade delete media)
    # ----------------------------------------------------------------------
    def delete_answer(self, answer_id: str) -> bool:
        """Delete a student answer and associated media."""
        query = f"DELETE FROM {self.student_answer_table} WHERE id = %s;"
        try:
            self.cursor.execute(query, (answer_id,))
            self.commit()
            logger.info(f"🗑️ Deleted student_answer {answer_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to delete answer {answer_id}: {e}")
            self.rollback()
            return False

    # ----------------------------------------------------------------------
    # FETCH ANSWERS FOR ONE SUBMISSION
    # ----------------------------------------------------------------------
    def get_all_answers(self, submission_id: str) -> Dict[str, Any]:
        """Return all answers and media for a given submission."""
        query = f"""
        SELECT 
            a.id AS student_answer_id,
            a.question_number,
            a.answer_text,
            m.media_url,
            m.media_summary
        FROM {self.student_answer_table} a
        LEFT JOIN {self.student_answer_media_table} m
        ON a.id = m.student_answer_id
        WHERE a.submission_id = %s
        ORDER BY a.question_number;
        """
        try:
            self.cursor.execute(query, (submission_id,))
            rows = self.cursor.fetchall()
            result = {}
            for ans_id, qnum, text, url, summary in rows:
                if qnum not in result:
                    result[qnum] = {
                        "student_answer_id": ans_id,
                        "answer_text": text,
                        "media_items": []
                    }
                if url or summary:
                    result[qnum]["media_items"].append({
                        "media_url": url,
                        "media_summary": summary
                    })
            logger.info(f"✅ Retrieved {len(result)} answers for submission_id={submission_id}")
            return result
        except Exception as e:
            logger.error(f"❌ Failed to fetch answers: {e}", exc_info=True)
            self.rollback()
            return {}

    # ----------------------------------------------------------------------
    # FETCH MULTIPLE SUBMISSIONS
    # ----------------------------------------------------------------------
    def get_all_answers_by_submission_ids(self, submission_ids: List[str]) -> List[Dict[str, Any]]:
        """Return all answers for multiple submissions."""
        if not submission_ids:
            logger.warning("⚠️ No submission IDs provided.")
            return []
        query = f"""
        SELECT 
            a.submission_id,
            a.id AS student_answer_id,
            a.question_number,
            a.answer_text,
            m.media_url,
            m.media_summary
        FROM {self.student_answer_table} a
        LEFT JOIN {self.student_answer_media_table} m 
        ON a.id = m.student_answer_id
        WHERE a.submission_id = ANY(%s)
        ORDER BY a.submission_id, a.question_number;
        """
        try:
            self.cursor.execute(query, (submission_ids,))
            rows = self.cursor.fetchall()
            result_map = {}
            for sub_id, ans_id, qnum, text, url, summary in rows:
                key = (sub_id, ans_id)
                if key not in result_map:
                    result_map[key] = {
                        "submission_id": sub_id,
                        "student_answer_id": ans_id,
                        "question_number": qnum,
                        "answer_text": text,
                        "media_items": []
                    }
                if url or summary:
                    result_map[key]["media_items"].append({
                        "media_url": url,
                        "media_summary": summary
                    })
            logger.info(f"✅ Retrieved {len(result_map)} answers for {len(submission_ids)} submissions")
            return list(result_map.values())
        except Exception as e:
            logger.error(f"❌ Failed to fetch multiple submission answers: {e}", exc_info=True)
            self.rollback()
            return []

    # ----------------------------------------------------------------------
    # UPDATE MEDIA SUMMARY
    # ----------------------------------------------------------------------
    def update_media_summary(self, media_id: str, summary: Any) -> bool:
        """Update media_summary JSON for a given media record."""
        query = f"""
        UPDATE {self.student_answer_media_table}
        SET media_summary = %s
        WHERE id = %s;
        """
        try:
            self.cursor.execute(query, (json.dumps(summary), media_id))
            self.commit()
            logger.info(f"✅ Updated media summary for {media_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to update media summary: {e}")
            self.rollback()
            return False
