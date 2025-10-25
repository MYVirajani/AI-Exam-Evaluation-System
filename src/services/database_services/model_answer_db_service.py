import logging
from typing import List, Dict, Any, Optional
from psycopg2.extras import execute_values
from datetime import datetime
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.base_relational_db import BaseRelationalDB
from src.models.model_answer_with_media import ModelAnswer

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerDBService(BaseRelationalDB):
    """
    Handles saving, fetching, and updating model answers and their media
    in the database.
    """

    def __init__(self):
        super().__init__()
        self._ensure_tables_exist()

    # ------------------------------------------------------------------
    # Table Setup
    # ------------------------------------------------------------------

    def _ensure_tables_exist(self) -> None:
        """Create both model_answer and model_answer_media tables if they do not exist."""
        create_tables_query = """
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS model_answer (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            assessment_id VARCHAR(255) NOT NULL,
            model_answer_paper_id VARCHAR(255) NOT NULL,
            question_number VARCHAR(50),
            question_text TEXT,
            answer_text TEXT,
            guideline_text TEXT,
            max_marks NUMERIC,
            created_on TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS model_answer_media (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            model_answer_id UUID REFERENCES model_answer(id) ON DELETE CASCADE,
            assessment_id VARCHAR(255) NOT NULL,
            media_url TEXT NOT NULL,
            media_summary TEXT,
            created_on TIMESTAMP DEFAULT NOW()
        );
        """

        try:
            self.cursor.execute(create_tables_query)
            self.conn.commit()
            logger.info("✅ Checked/created tables 'model_answer' and 'model_answer_media'.")
        except Exception as e:
            logger.error(f"❌ Failed to create tables: {e}")
            self.conn.rollback()
            raise

    # ------------------------------------------------------------------
    # Save Model Answers and Media
    # ------------------------------------------------------------------

    def save_model_answers(
        self,
        model_answers: List[ModelAnswer],
        assessment_id: str,
        model_answer_paper_id: str
    ) -> None:
        """Save model answers and their associated media."""
        if not model_answers:
            logger.warning("⚠️ No model answers to save.")
            return

        model_answer_query = """
            INSERT INTO model_answer (
                assessment_id,
                model_answer_paper_id,
                question_number,
                question_text,
                answer_text,
                guideline_text,
                max_marks,
                created_on
            )
            VALUES %s
            RETURNING id, question_number;
        """

        model_answer_values = [
            (
                assessment_id,
                model_answer_paper_id,
                ans.full_question_id,
                ans.question_text,
                ans.answer_text,
                ans.guideline_text,
                ans.max_marks,
                datetime.now()
            )
            for ans in model_answers
        ]

        try:
            execute_values(self.cursor, model_answer_query, model_answer_values)
            inserted_rows = self.cursor.fetchall()  # [(id, question_number), ...]

            id_map = {row[1]: row[0] for row in inserted_rows}
            media_values = self._prepare_media_values(model_answers, id_map, assessment_id)

            if media_values:
                media_insert_query = """
                    INSERT INTO model_answer_media (
                        model_answer_id,
                        assessment_id,
                        media_url,
                        media_summary,
                        created_on
                    ) VALUES %s;
                """
                execute_values(self.cursor, media_insert_query, media_values)

            self.commit()
            logger.info(
                f"✅ Saved {len(model_answer_values)} model answers "
                f"and {len(media_values)} media items."
            )

        except Exception as e:
            logger.error(f"❌ Failed to save model answers and media: {e}")
            self.conn.rollback()
            raise

    def _prepare_media_values(
        self,
        model_answers: List[ModelAnswer],
        id_map: Dict[str, str],
        assessment_id: str
    ) -> List[tuple]:
        """Prepare media values for insertion."""
        media_values = []

        for ans in model_answers:
            model_answer_id = id_map.get(ans.full_question_id)
            if not model_answer_id or not ans.media_urls:
                continue

            for url in ans.media_urls:
                summary = None
                if ans.media_summary and isinstance(ans.media_summary, dict):
                    summary = ans.media_summary.get(url)

                media_values.append((
                    model_answer_id,
                    assessment_id,
                    url,
                    summary,
                    datetime.now()
                ))

        return media_values

    # ------------------------------------------------------------------
    # Fetch All Media for an Assessment
    # ------------------------------------------------------------------

    def get_media_by_assessment(
        self,
        assessment_id: str,
        model_paper_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch all model answer media for a given assessment"""
        try:
            if model_paper_id:
                query = """
                SELECT mam.id, mam.media_url
                FROM model_answer_media mam
                JOIN model_answer ma ON mam.model_answer_id = ma.id
                WHERE ma.assessment_id = %s AND ma.model_answer_paper_id = %s;
                """
                params = (assessment_id, model_paper_id)
            else:
                query = """
                SELECT mam.id, mam.media_url
                FROM model_answer_media mam
                JOIN model_answer ma ON mam.model_answer_id = ma.id
                WHERE ma.assessment_id = %s;
                """
                params = (assessment_id,)

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            return [
                {"id": row[0], "media_url": row[1]}
                for row in rows
            ]

        except Exception as e:
            logger.error(f"❌ Failed to fetch media: {e}")
            self.conn.rollback()
            return []

    # ------------------------------------------------------------------
    # Update Media Summary
    # ------------------------------------------------------------------

    def update_media_summary(self, media_id: str, summary: str) -> bool:
        """Update the media_summary field for a specific media item."""
        query = """
        UPDATE model_answer_media
        SET media_summary = %s
        WHERE id = %s;
        """
        try:
            self.cursor.execute(query, (summary, media_id))
            self.conn.commit()
            logger.info(f"✅ Updated summary for media_id: {media_id}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to update media summary for {media_id}: {e}")
            self.conn.rollback()
            return False

    # ------------------------------------------------------------------
    # FETCH SINGLE MODEL ANSWER BY PAPER, ASSESSMENT & QUESTION NUMBER
    # ------------------------------------------------------------------

    def get_model_answer(
        self,
        model_answer_paper_id: str,
        assessment_id: str,
        question_number: str
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single model answer (question, guideline, answer, media summaries, and max_marks)
        filtered by model_answer_paper_id, assessment_id, and question_number.
        """
        if not (model_answer_paper_id and assessment_id and question_number):
            logger.warning("⚠️ Missing required parameters for get_model_answer().")
            return None

        try:
            query = """
                SELECT 
                    ma.id AS model_answer_id,
                    ma.question_number,
                    ma.question_text,
                    ma.guideline_text,
                    ma.answer_text,
                    ma.max_marks,
                    mam.media_summary
                FROM model_answer ma
                LEFT JOIN model_answer_media mam 
                    ON ma.id = mam.model_answer_id
                WHERE ma.model_answer_paper_id = %s
                  AND ma.assessment_id = %s
                  AND ma.question_number = %s;
            """

            self.cursor.execute(query, (model_answer_paper_id, assessment_id, question_number))
            rows = self.cursor.fetchall()

            if not rows:
                logger.info(
                    f"📭 No model answer found for "
                    f"model_answer_paper_id={model_answer_paper_id}, "
                    f"assessment_id={assessment_id}, question_number={question_number}"
                )
                return None

            (
                _,
                question_number,
                question_text,
                guideline_text,
                answer_text,
                max_marks,
                first_media_summary,
            ) = rows[0]

            media_summaries = [r[6] for r in rows if r[6]]

            result = {
                "question_number": question_number,
                "question_text": question_text,
                "guideline_text": guideline_text,
                "max_marks": max_marks,
                "model_answer": {
                    "answer_text": answer_text,
                    "media_summaries": media_summaries,
                },
            }

            logger.info(
                f"✅ Retrieved model answer for "
                f"model_answer_paper_id={model_answer_paper_id}, "
                f"assessment_id={assessment_id}, question_number={question_number}"
            )

            return result

        except Exception as e:
            logger.error(
                f"❌ Failed to fetch model answer for "
                f"model_answer_paper_id={model_answer_paper_id}, "
                f"assessment_id={assessment_id}, question_number={question_number}: {e}",
                exc_info=True
            )
            self.conn.rollback()
            return None
