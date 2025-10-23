import logging
from typing import List, Optional
from psycopg2.extras import execute_values
from datetime import datetime
import sys
import os

# Ensure project root is in the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.base_relational_db import BaseRelationalDB
from src.models.model_answer_with_media import ModelAnswer

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerDBService(BaseRelationalDB):
    """Handles saving extracted model answers into the database."""

    def __init__(self):
        super().__init__()
        self._ensure_table_exists()

    def _ensure_table_exists(self):
        """Create the model_answer table if it does not exist."""
        create_table_query = """
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
            media_urls TEXT[],       -- Array of URLs
            media_summary JSONB,
            created_on TIMESTAMP DEFAULT NOW()
        );
        """
        try:
            self.cursor.execute(create_table_query)
            self.conn.commit()
            logger.info("✅ Checked/created table 'model_answer'.")
        except Exception as e:
            logger.error(f"❌ Failed to create 'model_answer' table: {e}")
            self.conn.rollback()
            raise

    def save_model_answers(
        self,
        model_answers: List[ModelAnswer],
        assessment_id: str,
        model_answer_paper_id: str,
        media_summaries: Optional[dict] = None
    ):
        """
        Save all extracted model answers to the 'model_answer' table.

        :param model_answers: List of ModelAnswer objects extracted by LLM
        :param assessment_id: ID of the related assessment
        :param model_answer_paper_id: ID of the model answer paper
        :param media_summaries: Optional dict mapping question_number -> JSON summary
        """
        if not model_answers:
            logger.warning("No model answers to save.")
            return

        insert_query = """
            INSERT INTO model_answer (
                assessment_id,
                model_answer_paper_id,
                question_number,
                question_text,
                answer_text,
                guideline_text,
                max_marks,
                media_urls,
                media_summary,
                created_on
            )
            VALUES %s
        """

        # Prepare data for bulk insert
        values = []
        for ans in model_answers:
            question_number = ans.full_question_id
            summary = None

            # If a media summary dictionary is provided
            if media_summaries and question_number in media_summaries:
                summary = media_summaries[question_number]

            values.append((
                assessment_id,
                model_answer_paper_id,
                question_number,
                ans.question_text,
                ans.answer_text,
                ans.guideline_text,
                ans.max_marks,
                ans.media_urls,        # Stored as TEXT[]
                summary,               # Stored as JSON
                datetime.now()
            ))

        try:
            execute_values(self.cursor, insert_query, values)
            self.commit()
            logger.info(f"✅ Successfully saved {len(values)} model answers to database.")
        except Exception as e:
            logger.error(f"❌ Failed to save model answers: {e}")
            self.conn.rollback()
            raise
