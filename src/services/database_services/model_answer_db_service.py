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
    in dynamically named tables based on the AI model (e.g., model_answer_openai).
    """

    def __init__(self, ai_model: str = "openai"):
        super().__init__()
        self.ai_model = ai_model.lower().replace("-", "_").replace(".", "_")
        self.model_answer_table = f"model_answer_{self.ai_model}"
        self.model_answer_media_table = f"model_answer_media_{self.ai_model}"
        self._ensure_tables_exist()

    # ------------------------------------------------------------------
    # Table Setup
    # ------------------------------------------------------------------
    def _ensure_tables_exist(self) -> None:
        """Create model_answer_<model> and model_answer_media_<model> tables if they do not exist."""
        create_tables_query = f"""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.model_answer_table} (
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

        CREATE TABLE IF NOT EXISTS {self.model_answer_media_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            model_answer_id UUID REFERENCES {self.model_answer_table}(id) ON DELETE CASCADE,
            assessment_id VARCHAR(255) NOT NULL,
            media_url TEXT NOT NULL,
            media_summary TEXT,
            created_on TIMESTAMP DEFAULT NOW()
        );
        """

        try:
            self.cursor.execute(create_tables_query)
            self.conn.commit()
            logger.info(
                f"✅ Checked/created tables '{self.model_answer_table}' and '{self.model_answer_media_table}'."
            )
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

        model_answer_query = f"""
            INSERT INTO {self.model_answer_table} (
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
                media_insert_query = f"""
                    INSERT INTO {self.model_answer_media_table} (
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
                f"✅ Saved {len(model_answer_values)} model answers and {len(media_values)} media items "
                f"to '{self.model_answer_table}' and '{self.model_answer_media_table}'."
            )

        except Exception as e:
            logger.error(f"❌ Failed to save model answers and media: {e}")
            self.conn.rollback()
            raise

    # ------------------------------------------------------------------
    # Media Preparation
    # ------------------------------------------------------------------
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
    # Fetch All Media for Assessment
    # ------------------------------------------------------------------
    def get_media_by_assessment(
        self,
        assessment_id: str,
        model_paper_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch all model answer media for a given assessment, including guideline text."""
        try:
            if model_paper_id:
                query = f"""
                SELECT 
                    mam.id AS media_id,
                    mam.media_url,
                    ma.guideline_text
                FROM {self.model_answer_media_table} mam
                JOIN {self.model_answer_table} ma ON mam.model_answer_id = ma.id
                WHERE ma.assessment_id = %s AND ma.model_answer_paper_id = %s;
                """
                params = (assessment_id, model_paper_id)
            else:
                query = f"""
                SELECT 
                    mam.id AS media_id,
                    mam.media_url,
                    ma.guideline_text
                FROM {self.model_answer_media_table} mam
                JOIN {self.model_answer_table} ma ON mam.model_answer_id = ma.id
                WHERE ma.assessment_id = %s;
                """
                params = (assessment_id,)

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()
            results = [
                {
                    "id": row[0],
                    "media_url": row[1],
                    "guideline_text": row[2]
                }
                for row in rows
            ]
            logger.info(
                f"✅ Retrieved {len(results)} media items for assessment_id={assessment_id} "
                f"from '{self.model_answer_media_table}'."
            )
            return results
        except Exception as e:
            logger.error(f"❌ Failed to fetch media: {e}", exc_info=True)
            self.conn.rollback()
            return []

    # ------------------------------------------------------------------
    # Update Media Summary
    # ------------------------------------------------------------------
    def update_media_summary(self, media_id: str, summary: str) -> bool:
        """Update the media_summary field for a specific media item."""
        query = f"""
        UPDATE {self.model_answer_media_table}
        SET media_summary = %s
        WHERE id = %s;
        """
        try:
            self.cursor.execute(query, (summary, media_id))
            self.conn.commit()
            logger.info(f"✅ Updated summary for media_id: {media_id} in '{self.model_answer_media_table}'")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to update media summary: {e}")
            self.conn.rollback()
            return False

    # ------------------------------------------------------------------
    # Get Single Model Answer
    # ------------------------------------------------------------------
    def get_model_answer(
        self,
        model_answer_paper_id: str,
        assessment_id: str,
        question_number: str
    ) -> Optional[Dict[str, Any]]:
        """Retrieve a single model answer (with media summaries)."""
        if not (model_answer_paper_id and assessment_id and question_number):
            logger.warning("⚠️ Missing required parameters for get_model_answer().")
            return None

        try:
            query = f"""
                SELECT 
                    ma.id AS model_answer_id,
                    ma.question_number,
                    ma.question_text,
                    ma.guideline_text,
                    ma.answer_text,
                    ma.max_marks,
                    mam.media_summary
                FROM {self.model_answer_table} ma
                LEFT JOIN {self.model_answer_media_table} mam 
                    ON ma.id = mam.model_answer_id
                WHERE ma.model_answer_paper_id = %s
                  AND ma.assessment_id = %s
                  AND ma.question_number = %s;
            """
            self.cursor.execute(query, (model_answer_paper_id, assessment_id, question_number))
            rows = self.cursor.fetchall()

            if not rows:
                logger.info(f"📭 No model answer found for assessment_id={assessment_id}, question={question_number}")
                return None

            (
                _,
                question_number,
                question_text,
                guideline_text,
                answer_text,
                max_marks,
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
                f"✅ Retrieved model answer from '{self.model_answer_table}' "
                f"for assessment_id={assessment_id}, question={question_number}"
            )
            return result
        except Exception as e:
            logger.error(f"❌ Failed to fetch model answer: {e}", exc_info=True)
            self.conn.rollback()
            return None
