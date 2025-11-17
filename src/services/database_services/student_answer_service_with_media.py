import uuid
import json
import os
import sys
import logging
from typing import List, Dict, Any
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
            created_on TIMESTAMP DEFAULT NOW(),
            updated_on TIMESTAMP DEFAULT NOW()
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
        """
        Save multiple student answers and their associated media.
        Before inserting new data, delete existing rows with the same submission_id.
        """
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
            # 🧹 Step 1: Delete old records for same submission_id
            self.cursor.execute(f"DELETE FROM {self.student_answer_media_table} WHERE submission_id = %s;", (submission_id,))
            self.cursor.execute(f"DELETE FROM {self.student_answer_table} WHERE submission_id = %s;", (submission_id,))
            logger.info(f"🧹 Deleted existing records for submission_id={submission_id}")

            # 🧩 Step 2: Insert new answers
            insert_answers = f"""
                INSERT INTO {self.student_answer_table} 
                (id, submission_id, question_number, answer_text)
                VALUES %s;
            """
            execute_values(self.cursor, insert_answers, [(*vals,) for vals in answer_values])

            # 🧩 Step 3: Insert new media (if any)
            if media_values:
                insert_media = f"""
                    INSERT INTO {self.student_answer_media_table}
                    (id, student_answer_id, submission_id, media_url, media_summary)
                    VALUES %s;
                """
                execute_values(self.cursor, insert_media, [(*vals,) for vals in media_values])

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
        SET answer_text = %s,
            updated_at = NOW()
        WHERE id = %s;
        """
        try:
            self.cursor.execute(query, (new_text, answer_id))
            self.commit()
            logger.info(f"✅ Updated answer_id={answer_id} (updated_at refreshed)")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to update answer {answer_id}: {e}")
            self.rollback()
            return False

    # ----------------------------------------------------------------------
    # UPDATE MEDIA SUMMARY
    # ----------------------------------------------------------------------
    def update_media_summary(self, media_id: str, summary: Any) -> bool:
        """Update media_summary JSON for a given media record and refresh updated_on."""
        query = f"""
        UPDATE {self.student_answer_media_table}
        SET media_summary = %s,
            updated_on = NOW()
        WHERE id = %s;
        """
        try:
            self.cursor.execute(query, (json.dumps(summary), media_id))
            self.commit()
            logger.info(f"✅ Updated media summary for {media_id} (updated_on refreshed)")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to update media summary: {e}")
            self.rollback()
            return False

    # ----------------------------------------------------------------------
    # DELETE ANSWER (cascade deletes media)
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
    # ✅ FIXED: FETCH ANSWERS FOR ONE SUBMISSION (LIST FORMAT)
    # ----------------------------------------------------------------------
    def get_all_answers(self, submission_id: str) -> List[Dict[str, Any]]:
        """
        Return all answers and associated media for a given submission_id
        as a list of dictionaries (not keyed by question_number).
        """
        query = f"""
SELECT 
    a.id AS student_answer_id,
    a.question_number,
    a.answer_text,
    a.updated_at,
    m.media_url,
    m.media_summary,
    m.updated_on
FROM {self.student_answer_table} AS a
LEFT JOIN {self.student_answer_media_table} AS m
    ON a.id = m.student_answer_id
WHERE a.submission_id = %s
ORDER BY a.question_number;
"""
        try:
            self.cursor.execute(query, (submission_id,))
            rows = self.cursor.fetchall()

            answer_map = {}
            for ans_id, qnum, text, updated_at, url, summary, updated_on in rows:
                if ans_id not in answer_map:
                    answer_map[ans_id] = {
                        "student_answer_id": ans_id,
                        "question_number": qnum,
                        "answer_text": text or "",
                        "updated_at": updated_at,
                        "media_items": []
                    }

                if url or summary:
                    try:
                        parsed_summary = (
                            json.loads(summary)
                            if isinstance(summary, str)
                            else summary
                        )
                    except Exception:
                        parsed_summary = summary

                    answer_map[ans_id]["media_items"].append({
                        "media_url": url,
                        "media_summary": parsed_summary,
                        "updated_on": updated_on
                    })

            result_list = list(answer_map.values())
            logger.info(f"✅ Retrieved {len(result_list)} answers for submission_id={submission_id}")
            return result_list

        except Exception as e:
            logger.error(f"❌ Failed to fetch answers for submission_id={submission_id}: {e}", exc_info=True)
            self.rollback()
            return []


        # ----------------------------------------------------------------------
    # FETCH ANSWERS IN THE SAME FORMAT USED BY EMBEDDING PIPELINE
    # ----------------------------------------------------------------------
    def fetch_answers_for_embedding(self, submission_id: str) -> List[tuple]:
        """
        Fetch student answers exactly in the structure required by
        StudentAnswerVectorService.embed_and_store_student_answers():

            [
                (
                    student_answer_id,
                    submission_id,
                    question_number,
                    answer_text,
                    [media_summary_1, media_summary_2, ...]
                ),
                ...
            ]
        """

        query = f"""
        SELECT 
            sa.id AS student_answer_id,
            sa.submission_id,
            sa.question_number,
            sa.answer_text,
            ARRAY_REMOVE(ARRAY_AGG(sam.media_summary), NULL) AS media_summaries
        FROM {self.student_answer_table} sa
        LEFT JOIN {self.student_answer_media_table} sam
            ON sa.id = sam.student_answer_id
        WHERE sa.submission_id = %s
        GROUP BY sa.id;
        """

        try:
            self.cursor.execute(query, (submission_id,))
            rows = self.cursor.fetchall()

            logger.info(f"📦 fetch_answers_for_embedding → {len(rows)} answers retrieved for submission_id={submission_id}")

            return rows

        except Exception as e:
            logger.error(f"❌ Failed to fetch answers for embedding: {e}", exc_info=True)
            self.rollback()
            return []

    # ----------------------------------------------------------------------
    # FETCH ANSWERS FOR MULTIPLE SUBMISSIONS
    # ----------------------------------------------------------------------
    def get_all_answers_by_submission_ids(self, submission_ids: List[str]) -> List[Dict[str, Any]]:
        """
        Fetch all student answers (and their media) for multiple submissions.
        """
        if not submission_ids:
            logger.warning("⚠️ No submission IDs provided to fetch answers.")
            return []

        try:
            query = f"""
SELECT 
    a.submission_id,
    a.id AS student_answer_id,
    a.question_number,
    a.answer_text,
    a.updated_at,
    m.media_url,
    m.media_summary
FROM {self.student_answer_table} AS a
LEFT JOIN {self.student_answer_media_table} AS m
    ON a.id = m.student_answer_id
WHERE a.submission_id = ANY(%s)
ORDER BY a.submission_id, a.question_number;
"""
            self.cursor.execute(query, (submission_ids,))
            rows = self.cursor.fetchall()

            results_dict = {}
            for submission_id, ans_id, qnum, text, updated_at, url, summary in rows:
                key = (submission_id, ans_id)
                if key not in results_dict:
                    results_dict[key] = {
                        "submission_id": submission_id,
                        "question_number": qnum,
                        "student_answer_id": ans_id,
                        "answer_text": text,
                        "updated_at": updated_at,
                        "media_items": []
                    }
                if url or summary:
                    results_dict[key]["media_items"].append({
                        "media_url": url,
                        "media_summary": summary
                    })

            results = list(results_dict.values())
            logger.info(f"✅ Retrieved {len(results)} student answers across {len(submission_ids)} submissions")
            return results

        except Exception as e:
            logger.error(f"❌ Failed to fetch multiple student answers: {e}", exc_info=True)
            self.rollback()
            return []

    # ----------------------------------------------------------------------
    # ✅ FIXED: Add commit/rollback helper wrappers
    # ----------------------------------------------------------------------
    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()
