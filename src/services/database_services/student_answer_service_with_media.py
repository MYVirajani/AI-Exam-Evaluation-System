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

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ======================================================================================
# CLASS: StudentAnswerServiceWithMedia
# ======================================================================================
class StudentAnswerServiceWithMedia(BaseRelationalDB):

    def __init__(self, model_id: str):
        super().__init__()
        self.model_id = model_id
        self.student_answer_table = '"Student_Answer"'
        self.student_answer_media_table = '"Student_Answer_Media"'
        self._ensure_tables_exist()
        logger.info(f"[DB] Using tables: {self.student_answer_table}, {self.student_answer_media_table}")

    # ==================================================================================
    # CREATE TABLES
    # ==================================================================================
    def _ensure_tables_exist(self):

        create_query = f"""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.student_answer_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            submission_id TEXT NOT NULL,
            model_id TEXT NOT NULL,
            question_number TEXT,
            answer_text TEXT,
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),
            score DECIMAL(5,2),
            feedback TEXT,
            graded_at TIMESTAMPTZ,
            CONSTRAINT fk_submission FOREIGN KEY(submission_id)
                REFERENCES Submission(submission_id) ON DELETE CASCADE,
            CONSTRAINT fk_model FOREIGN KEY(model_id)
                REFERENCES Evaluation_Model(id)
        );

        CREATE TABLE IF NOT EXISTS {self.student_answer_media_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            model_id TEXT NOT NULL,
            student_answer_id UUID NOT NULL REFERENCES {self.student_answer_table}(id) ON DELETE CASCADE,
            media_url TEXT NOT NULL,
            media_summary TEXT,
            created_on TIMESTAMPTZ DEFAULT NOW(),
            updated_on TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT fk_media_model FOREIGN KEY(model_id)
                REFERENCES Evaluation_Model(id)
        );
        """

        try:
            self.cursor.execute(create_query)
            self.conn.commit()
            logger.info("✅ Tables verified and aligned with schema")
        except Exception as e:
            logger.error(f"❌ Failed creating tables: {e}", exc_info=True)
            self.conn.rollback()
            raise

    # ==================================================================================
    # HELPER
    # ==================================================================================
    def build_question_number(self, *parts):
        filtered = [str(p).strip() for p in parts if p and str(p).strip() != ""]
        return "_".join(filtered)

    # ==================================================================================
    # SAVE ANSWERS
    # ==================================================================================
    def save_answers(self, answers: List[StudentAnswer], submission_id: str):
        if not answers:
            logger.warning("⚠️ No answers provided.")
            return

        answer_values = []
        media_values = []

        for ans in answers:
            answer_id = str(uuid.uuid4())
            qnum = self.build_question_number(
                getattr(ans, "question_id", None),
                getattr(ans, "sub_question_id", None),
                getattr(ans, "sub_sub_question_id", None),
                getattr(ans, "sub_sub_sub_question_id", None)
            )

            answer_values.append((
                answer_id,
                submission_id,
                self.model_id,
                qnum,
                ans.answer_text,
                None,
                None,
                None
            ))

            if getattr(ans, "media_urls", None):
                for url in ans.media_urls:
                    media_values.append((
                        str(uuid.uuid4()),
                        self.model_id,
                        answer_id,
                        url,
                        None
                    ))

        try:
            # DELETE MEDIA FIRST
            self.cursor.execute(f"""
                DELETE FROM {self.student_answer_media_table}
                WHERE student_answer_id IN (
                    SELECT id FROM {self.student_answer_table}
                    WHERE submission_id=%s AND model_id=%s
                );
            """, (submission_id, self.model_id))

            # DELETE ANSWERS
            self.cursor.execute(f"""
                DELETE FROM {self.student_answer_table}
                WHERE submission_id=%s AND model_id=%s;
            """, (submission_id, self.model_id))

            # INSERT ANSWERS
            insert_answers = f"""
            INSERT INTO {self.student_answer_table}
            (id, submission_id, model_id, question_number, answer_text, score, feedback, graded_at)
            VALUES %s;
            """
            execute_values(self.cursor, insert_answers, answer_values)

            # INSERT MEDIA
            if media_values:
                insert_media = f"""
                INSERT INTO {self.student_answer_media_table}
                (id, model_id, student_answer_id, media_url, media_summary)
                VALUES %s;
                """
                execute_values(self.cursor, insert_media, media_values)

            self.commit()
            logger.info(f"✅ Saved answers and media (submission={submission_id}, model_id={self.model_id})")

        except Exception as e:
            logger.error(f"❌ Failed saving answers: {e}", exc_info=True)
            self.rollback()
            raise

    # ==================================================================================
    # UPDATE ANSWER TEXT
    # ==================================================================================
    def update_answer(self, answer_id: str, new_text: str) -> bool:

        query = f"""
        UPDATE {self.student_answer_table}
        SET answer_text=%s, updated_on=NOW()
        WHERE id=%s AND model_id=%s;
        """

        try:
            self.cursor.execute(query, (new_text, answer_id, self.model_id))
            self.commit()
            return self.cursor.rowcount > 0
        except:
            self.rollback()
            return False

    # ==================================================================================
    # UPDATE SCORE + FEEDBACK
    # ==================================================================================
    def update_score_and_feedback(
        self,
        submission_id: str = None,
        question_number: str = None,
        score: float = None,
        feedback: str = None,
        student_answer_id: str = None,
    ) -> bool:

        if student_answer_id:
            query = f"""
            UPDATE {self.student_answer_table}
            SET score=%s,
                feedback=%s,
                graded_at=NOW(),
                updated_on=NOW()
            WHERE id=%s AND model_id=%s;
            """
            params = (score, feedback, student_answer_id, self.model_id)
            lookup_msg = f"student_answer_id={student_answer_id}"

        else:
            query = f"""
            UPDATE {self.student_answer_table}
            SET score=%s,
                feedback=%s,
                graded_at=NOW(),
                updated_on=NOW()
            WHERE submission_id=%s
              AND model_id=%s
              AND question_number=%s;
            """
            params = (score, feedback, submission_id, self.model_id, question_number)
            lookup_msg = f"submission_id={submission_id}, question={question_number}"

        try:
            self.cursor.execute(query, params)
            self.commit()

            updated = self.cursor.rowcount > 0

            if updated:
                logger.info(f"✅ Updated score & feedback ({lookup_msg})")
            else:
                logger.warning(f"⚠️ No matching record found ({lookup_msg})")

            return updated

        except Exception as e:
            logger.error(f"❌ Failed updating score & feedback ({lookup_msg}): {e}", exc_info=True)
            self.rollback()
            return False

    # ==================================================================================
    # GET ALL ANSWERS (FIXED INDENTATION)
    # ==================================================================================
    def get_all_answers(
        self,
        submission_id: str,
        question_numbers: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:

        query = f"""
            SELECT 
                a.id,
                a.question_number,
                a.answer_text,
                a.updated_on,
                m.media_url,
                m.media_summary,
                m.updated_on
            FROM {self.student_answer_table} a
            LEFT JOIN {self.student_answer_media_table} m
                ON a.id = m.student_answer_id AND m.model_id = %s
            WHERE a.submission_id = %s
              AND a.model_id = %s
        """

        params = [self.model_id, submission_id, self.model_id]

        if question_numbers and len(question_numbers) > 0:
            placeholders = ", ".join(["%s"] * len(question_numbers))
            query += f" AND a.question_number IN ({placeholders})"
            params.extend(question_numbers)

        query += " ORDER BY a.question_number"

        try:
            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            data = {}

            for ans_id, qnum, text, updated, url, summary, m_updated in rows:

                if ans_id not in data:
                    data[ans_id] = {
                        "student_answer_id": ans_id,
                        "question_number": qnum,
                        "answer_text": text,
                        "updated_on": updated,
                        "media_items": []
                    }

                if url:
                    try:
                        summary = json.loads(summary) if summary else None
                    except:
                        pass

                    data[ans_id]["media_items"].append({
                        "media_url": url,
                        "media_summary": summary,
                        "updated_on": m_updated
                    })

            return list(data.values())

        except Exception as e:
            logger.error(f"[DB] ❌ Failed fetching answers: {e}", exc_info=True)
            self.rollback()
            return []

    # ==================================================================================
    # FETCH FOR EMBEDDING
    # ==================================================================================
    def fetch_answers_for_embedding(self, submission_id: str) -> List[tuple]:

        query = f"""
        SELECT 
            sa.id AS student_answer_id,
            sa.submission_id,
            sa.question_number,
            sa.answer_text,
            ARRAY_REMOVE(ARRAY_AGG(
                CASE 
                    WHEN sam.media_summary IS NOT NULL THEN sam.media_summary
                    ELSE NULL
                END
            ), NULL) AS media_summaries
        FROM {self.student_answer_table} sa
        LEFT JOIN {self.student_answer_media_table} sam
            ON sa.id = sam.student_answer_id
            AND sam.model_id = %s
        WHERE sa.submission_id = %s
        AND sa.model_id = %s
        GROUP BY sa.id
        ORDER BY sa.question_number;
        """

        try:
            self.cursor.execute(query, (self.model_id, submission_id, self.model_id))
            rows = self.cursor.fetchall()

            clean_rows = []
            for row in rows:
                (
                    ans_id,
                    sub_id,
                    qnum,
                    text,
                    media_summaries
                ) = row

                decoded = []
                if media_summaries:
                    for item in media_summaries:
                        try:
                            decoded.append(json.loads(item))
                        except:
                            decoded.append(item)

                clean_rows.append((ans_id, sub_id, qnum, text, decoded))

            logger.info(f"📦 fetch_answers_for_embedding → {len(clean_rows)} answers for submission_id={submission_id}")
            return clean_rows

        except Exception as e:
            logger.error(f"❌ Failed fetching answers for embedding: {e}", exc_info=True)
            self.rollback()
            return []

    # ==================================================================================
    # FETCH ANSWERS FOR MULTIPLE SUBMISSIONS
    # ==================================================================================
    def get_all_answers_by_submission_ids(self, submission_ids: List[str]) -> List[Dict[str, Any]]:
        if not submission_ids:
            logger.warning("⚠️ No submission IDs provided.")
            return []

        try:
            query = f"""
            SELECT 
                a.submission_id,
                a.id AS student_answer_id,
                a.question_number,
                a.answer_text,
                a.updated_on,
                m.media_url,
                m.media_summary
            FROM {self.student_answer_table} AS a
            LEFT JOIN {self.student_answer_media_table} AS m
                ON a.id = m.student_answer_id AND m.model_id = a.model_id
            WHERE a.submission_id = ANY(%s)
            ORDER BY a.submission_id, a.question_number;
            """
            self.cursor.execute(query, (submission_ids,))
            rows = self.cursor.fetchall()

            results_dict = {}
            for submission_id, ans_id, qnum, text, updated, url, summary in rows:
                key = (submission_id, ans_id)
                if key not in results_dict:
                    results_dict[key] = {
                        "submission_id": submission_id,
                        "question_number": qnum,
                        "student_answer_id": ans_id,
                        "answer_text": text,
                        "updated_on": updated,
                        "media_items": []
                    }

                if url or summary:
                    try:
                        summary = json.loads(summary) if summary else None
                    except:
                        pass

                    results_dict[key]["media_items"].append({
                        "media_url": url,
                        "media_summary": summary
                    })

            return list(results_dict.values())

        except Exception as e:
            logger.error(f"❌ Failed fetching multiple answers: {e}", exc_info=True)
            self.rollback()
            return []

    # ==================================================================================
    # GET MEDIA BY SUBMISSION
    # ==================================================================================
    def get_media_by_submission(self, submission_id: str, model_id: str = None):
        """
        Fetch media records for a given submission_id by joining through Student_Answer.
        """

        if not submission_id:
            logging.warning("[DB] get_media_by_submission called with empty submission_id.")
            return []

        try:
            query = f"""
                SELECT 
                    sam.id,
                    sam.student_answer_id,
                    sam.media_url
                FROM {self.student_answer_media_table} sam
                INNER JOIN {self.student_answer_table} sa
                    ON sam.student_answer_id = sa.id
                WHERE sa.submission_id = %s
            """

            params = [submission_id]

            if model_id:
                query += " AND sam.model_id = %s"
                params.append(model_id)

            self.cursor.execute(query, tuple(params))
            rows = self.cursor.fetchall()

            if not rows:
                logging.info(
                    f"[DB] No media found for submission_id={submission_id}, model_id={model_id}"
                )
                return []

            return [
                {
                    "id": str(r[0]),
                    "student_answer_id": str(r[1]),
                    "media_url": r[2],
                }
                for r in rows
            ]

        except Exception as e:
            logging.error(
                f"[DB] ❌ Failed to fetch media for submission_id={submission_id}, model_id={model_id}: {e}",
                exc_info=True,
            )
            self.conn.rollback()
            return []

    # ==================================================================================
    # UPDATE MEDIA SUMMARY
    # ==================================================================================
    def update_media_summary(self, media_id: str, summary: str, model_id: str = None):
        """
        Update media_summary TEXT field (JSON stored as string) for a given media_id.
        Ensures updated_on is also updated.
        """

        if not media_id:
            logging.warning("[DB] update_media_summary called with empty media_id.")
            return False

        try:
            # Convert dict/list/string safely to JSON string for storage
            summary_json = json.dumps(summary)

            # Use provided model_id or default model_id of service
            model_filter = model_id if model_id else self.model_id

            query = f"""
                UPDATE {self.student_answer_media_table}
                SET 
                    media_summary = %s,
                    updated_on = NOW()
                WHERE id = %s
                  AND model_id = %s;
            """

            params = (summary_json, media_id, model_filter)

            self.cursor.execute(query, params)

            if self.cursor.rowcount == 0:
                logging.warning(
                    f"[DB] ⚠️ No media found with id={media_id}, model_id={model_filter}"
                )
                self.conn.rollback()
                return False

            self.commit()

            logging.info(
                f"[DB] ✅ Updated media summary for media_id={media_id}, model_id={model_filter}"
            )
            return True

        except Exception as e:
            logging.error(
                f"[DB] ❌ Failed to update media_id={media_id}, model_id={model_filter}: {e}",
                exc_info=True,
            )
            self.conn.rollback()
            return False

    # ==================================================================================
    # COMMIT
    # ==================================================================================
    def commit(self):
        self.conn.commit()

    # ==================================================================================
    # ROLLBACK
    # ==================================================================================
    def rollback(self):
        self.conn.rollback()