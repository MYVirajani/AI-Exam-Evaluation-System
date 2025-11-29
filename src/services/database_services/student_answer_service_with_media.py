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
    # UPDATE SCORE + FEEDBACK (NEW FUNCTION)
    # ==================================================================================
    def update_score_and_feedback(self, submission_id: str, question_number: str, score: float, feedback: str) -> bool:
        """
        Update score and feedback for a student's answer using:
            - submission_id
            - model_id
            - question_number
        """

        query = f"""
        UPDATE {self.student_answer_table}
        SET 
            score = %s,
            feedback = %s,
            graded_at = NOW(),
            updated_on = NOW()
        WHERE submission_id=%s
        AND model_id=%s
        AND question_number=%s;
        """

        try:
            self.cursor.execute(
                query,
                (score, feedback, submission_id, self.model_id, question_number)
            )
            self.commit()

            updated = self.cursor.rowcount > 0
            if updated:
                logger.info(f"✅ Updated score & feedback for submission={submission_id}, question={question_number}")
            else:
                logger.warning(f"⚠️ No matching record found for submission={submission_id}, question={question_number}")

            return updated

        except Exception as e:
            logger.error(f"❌ Failed updating score & feedback: {e}", exc_info=True)
            self.rollback()
            return False

    # ==================================================================================
    # GET ALL ANSWERS (FIXED)
    # ==================================================================================
    def get_all_answers(self, submission_id: str) -> List[Dict[str, Any]]:

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
        WHERE a.submission_id=%s AND a.model_id=%s
        ORDER BY a.question_number;
        """

        try:
            self.cursor.execute(query, (self.model_id, submission_id, self.model_id))
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

    # ----------------------------------------------------------------------
    # FIXED: FETCH ANSWERS FOR EMBEDDING
    # ----------------------------------------------------------------------
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

    # ----------------------------------------------------------------------
    # FETCH MULTIPLE ANSWERS
    # ----------------------------------------------------------------------
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

            results = list(results_dict.values())
            logger.info(f"✅ Retrieved {len(results)} answers across {len(submission_ids)} submissions")
            return results

        except Exception as e:
            logger.error(f"❌ Failed fetching multiple answers: {e}", exc_info=True)
            self.rollback()
            return []

    # ----------------------------------------------------------------------
    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()
