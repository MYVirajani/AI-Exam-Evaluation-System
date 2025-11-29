import logging
from typing import List, Dict, Any, Optional
from psycopg2.extras import execute_values
from datetime import datetime
import json
import uuid
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.base_relational_db import BaseRelationalDB
from src.models.model_answer_with_media import ModelAnswer

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerDBService(BaseRelationalDB):

    def __init__(self, model_id: str):
        super().__init__()
        self.model_id = model_id

        self.question_table = '"Question"'
        self.question_media_table = '"Question_Media"'

        self._ensure_tables_exist()

    # ---------------------------------------------------------
    # CREATE TABLES
    # ---------------------------------------------------------
    def _ensure_tables_exist(self):
        create_query = f"""
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        CREATE TABLE IF NOT EXISTS {self.question_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            model_id VARCHAR(255) NOT NULL,
            assessment_id VARCHAR(255) NOT NULL,
            model_answer_paper_id VARCHAR(255) NOT NULL,
            type VARCHAR(100),
            question_number VARCHAR(200),
            question_text TEXT,
            answer_text TEXT,
            mcq_answer_options JSONB,
            guideline_text TEXT,
            max_marks INTEGER,
            created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS {self.question_media_table} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            model_id VARCHAR(255) NOT NULL,
            question_id UUID REFERENCES {self.question_table}(id) ON DELETE CASCADE,
            media_url TEXT NOT NULL,
            media_summary TEXT,
            created_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_on TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """

        try:
            self.cursor.execute(create_query)
            self.conn.commit()
            logger.info("✓ Ensured Question + Question_Media tables exist.")
        except Exception:
            logger.error("Failed creating tables", exc_info=True)
            self.conn.rollback()
            raise

    # ---------------------------------------------------------
    # SAVE MODEL ANSWERS
    # ---------------------------------------------------------
    def save_model_answers(
        self,
        model_answers: List[ModelAnswer],
        assessment_id: str,
        model_answer_paper_id: str
    ):

        if not model_answers:
            logger.warning("No model answers provided.")
            return

        try:
            # Clean previous rows
            self.cursor.execute(
                f"""DELETE FROM {self.question_table}
                    WHERE assessment_id=%s AND model_answer_paper_id=%s""",
                (assessment_id, model_answer_paper_id)
            )

            insert_q = f"""
                INSERT INTO {self.question_table} (
                    id,
                    model_id,
                    assessment_id,
                    model_answer_paper_id,
                    type,
                    question_number,
                    question_text,
                    answer_text,
                    mcq_answer_options,
                    guideline_text,
                    max_marks,
                    created_on,
                    updated_on
                ) VALUES %s
            """

            now = datetime.utcnow()
            q_values = []
            id_map = {}  # Map question_number → generated UUID

            for ans in model_answers:
                qid = str(uuid.uuid4())
                q_values.append((
                    qid,
                    self.model_id,
                    assessment_id,
                    model_answer_paper_id,
                    ans.question_type,
                    ans.question_number,
                    ans.question_text,
                    ans.answer_text,
                    [],   
                    ans.guideline_text,
                    ans.max_marks,
                    now,
                    now
                ))
                # Populate the map so media can reference the correct question id
                id_map[ans.question_number] = qid

            # Insert questions
            execute_values(self.cursor, insert_q, q_values)

            # Insert associated media
            media_values = self._prepare_media_values(model_answers, id_map)
            if media_values:
                insert_media = f"""
                    INSERT INTO {self.question_media_table} (
                        id,
                        model_id,
                        question_id,
                        media_url,
                        media_summary,
                        created_on,
                        updated_on
                    ) VALUES %s
                """
                execute_values(self.cursor, insert_media, media_values)

            self.conn.commit()
            logger.info(f"✓ Saved {len(q_values)} questions and {len(media_values)} media items.")

        except Exception:
            logger.error("Failed saving model answers", exc_info=True)
            self.conn.rollback()
            raise

    # ---------------------------------------------------------
    # PREPARE MEDIA VALUES
    # ---------------------------------------------------------
    def _prepare_media_values(self, model_answers, id_map):
        values = []
        now = datetime.utcnow()

        for ans in model_answers:
            qid = id_map.get(ans.question_number)
            if not qid:
                continue

            for url in ans.media_urls or []:
                summary = None
                if isinstance(ans.media_summary, dict):
                    summary = ans.media_summary.get(url)
                values.append((
                    str(uuid.uuid4()),
                    self.model_id,
                    qid,
                    url,
                    summary,
                    now,
                    now
                ))

        return values

    # ---------------------------------------------------------
    # GET MEDIA
    # ---------------------------------------------------------
    def get_media_by_assessment(self, assessment_id, model_paper_id=None):
        try:
            if model_paper_id:
                query = f"""
                    SELECT qm.id, qm.model_id, qm.question_id, qm.media_url,
                           qm.media_summary, q.guideline_text, q.question_number
                    FROM {self.question_media_table} qm
                    JOIN {self.question_table} q ON qm.question_id=q.id
                    WHERE q.assessment_id=%s AND q.model_answer_paper_id=%s
                """
                params = (assessment_id, model_paper_id)
            else:
                query = f"""
                    SELECT qm.id, qm.model_id, qm.question_id, qm.media_url,
                           qm.media_summary, q.guideline_text, q.question_number
                    FROM {self.question_media_table} qm
                    JOIN {self.question_table} q ON qm.question_id=q.id
                    WHERE q.assessment_id=%s
                """
                params = (assessment_id,)

            self.cursor.execute(query, params)
            rows = self.cursor.fetchall()

            return [
                {
                    "id": r[0],
                    "model_id": r[1],
                    "question_id": r[2],
                    "media_url": r[3],
                    "media_summary": r[4],
                    "guideline_text": r[5],
                    "question_number": r[6],
                } for r in rows
            ]

        except Exception:
            logger.error("Failed fetching media", exc_info=True)
            self.conn.rollback()
            return []

    # ---------------------------------------------------------
    # UPDATE MEDIA
    # ---------------------------------------------------------
    def update_media_summary(self, media_id: str, summary: str) -> bool:
        try:
            self.cursor.execute(
                f"""UPDATE {self.question_media_table}
                    SET media_summary=%s, updated_on=NOW() WHERE id=%s""",
                (summary, media_id),
            )
            if self.cursor.rowcount == 0:
                self.conn.rollback()
                return False
            self.conn.commit()
            return True
        except Exception:
            self.conn.rollback()
            return False

    # ---------------------------------------------------------
    # GET ONE MODEL ANSWER
    # ---------------------------------------------------------
    def get_model_answer(self, model_answer_paper_id, assessment_id, question_number):
        try:
            query = f"""
                SELECT 
                    q.id,
                    q.question_number,
                    q.question_text,
                    q.guideline_text,
                    q.answer_text,
                    q.max_marks,
                    ARRAY_REMOVE(ARRAY_AGG(qm.media_summary), NULL)
                FROM {self.question_table} q
                LEFT JOIN {self.question_media_table} qm ON q.id=qm.question_id
                WHERE q.model_answer_paper_id=%s
                  AND q.assessment_id=%s
                  AND q.question_number=%s
                GROUP BY q.id
            """

            self.cursor.execute(query, (model_answer_paper_id, assessment_id, question_number))
            row = self.cursor.fetchone()

            if not row:
                return None

            return {
                "model_answer_id": row[0],
                "question_number": row[1],
                "question_text": row[2],
                "guideline_text": row[3],
                "max_marks": row[5],
                "model_answer": {
                    "answer_text": row[4],
                    "media_summaries": row[6] or []
                }
            }

        except Exception:
            logger.error("Failed fetching model answer", exc_info=True)
            return None
