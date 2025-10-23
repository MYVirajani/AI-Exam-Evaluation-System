import logging
from typing import List
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
    """Handles saving extracted model answers and their media into the database."""

    def __init__(self):
        super().__init__()
        self._ensure_tables_exist()

    def _ensure_tables_exist(self):
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

    def save_model_answers(
        self,
        model_answers: List[ModelAnswer],
        assessment_id: str,
        model_answer_paper_id: str
    ):
        """
        Save model answers and related media into two normalized tables:
        - model_answer
        - model_answer_media
        """

        if not model_answers:
            logger.warning("No model answers to save.")
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

        # Prepare data for model_answer table
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
            # Insert model_answer records and get their IDs
            execute_values(self.cursor, model_answer_query, model_answer_values)
            inserted_rows = self.cursor.fetchall()  # [(id, question_number), ...]

            # Map question_number → model_answer_id
            id_map = {row[1]: row[0] for row in inserted_rows}

            # Prepare media entries
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
                        assessment_id,  # Add assessment_id here
                        url,
                        summary,
                        datetime.now()
                    ))

            # Insert media records if available
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
            logger.info(f"✅ Saved {len(model_answer_values)} model answers and {len(media_values)} media items.")
        except Exception as e:
            logger.error(f"❌ Failed to save model answers and media: {e}")
            self.conn.rollback()
            raise