import json
import logging
from .base_relational_db import BaseRelationalDB

# --------------------------------------------------------------------------
# Configure logging
# --------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)


class StudentMediaDBService(BaseRelationalDB):
    """
    Database service to handle fetching and updating student_answer_media_<ai_model> records.
    Each AI model has its own set of student_answer and student_answer_media tables.
    Example:
      - student_answer_openai
      - student_answer_media_openai
    """

    # ----------------------------------------------------------------------
    # INIT
    # ----------------------------------------------------------------------
    def __init__(self, ai_model: str = "openai"):
        super().__init__()
        self.ai_model = ai_model.lower().replace("-", "_").replace(".", "_")
        self.student_answer_table = f"student_answer_{self.ai_model}"
        self.student_answer_media_table = f"student_answer_media_{self.ai_model}"
        self._ensure_tables_exist()
        logging.info(f"[DB] Using tables: {self.student_answer_table}, {self.student_answer_media_table}")

    # ----------------------------------------------------------------------
    # CREATE TABLES IF NOT EXISTS
    # ----------------------------------------------------------------------
    def _ensure_tables_exist(self):
        """Create dynamic tables for student answers and media if not already present."""
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
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
        try:
            self.cursor.execute(create_query)
            self.conn.commit()
            logging.info(f"✅ Ensured tables exist: {self.student_answer_table}, {self.student_answer_media_table}")
        except Exception as e:
            logging.error(f"❌ Failed to create tables: {e}", exc_info=True)
            self.conn.rollback()
            raise

    # ----------------------------------------------------------------------
    # FETCH MEDIA BY SUBMISSION ID
    # ----------------------------------------------------------------------
    def get_media_by_submission(self, submission_id: str):
        """
        Fetch all media records for a given submission_id from the AI-model-specific table.
        Returns:
            List[Dict[str, str]] = [
                {"id": str, "student_answer_id": str, "media_url": str},
                ...
            ]
        """
        if not submission_id:
            logging.warning("[DB] get_media_by_submission called with empty submission_id.")
            return []

        try:
            query = f"""
                SELECT id, student_answer_id, media_url
                FROM {self.student_answer_media_table}
                WHERE submission_id = %s;
            """
            self.cursor.execute(query, (submission_id,))
            records = self.cursor.fetchall()

            if not records:
                logging.info(f"[DB] No media found for submission_id={submission_id}")
                return []

            return [
                {
                    "id": str(r[0]),
                    "student_answer_id": str(r[1]),
                    "media_url": r[2],
                }
                for r in records
            ]

        except Exception as e:
            logging.error(f"[DB] ❌ Failed to fetch media for submission_id={submission_id}: {e}", exc_info=True)
            self.conn.rollback()
            return []

    # ----------------------------------------------------------------------
    # UPDATE MEDIA SUMMARY
    # ----------------------------------------------------------------------
    def update_media_summary(self, media_id: str, summary_text: str):
        """
        Update media_summary JSON field for a given media record
        in the model-specific student_answer_media_<ai_model> table.
        """
        if not media_id:
            logging.warning("[DB] update_media_summary called with empty media_id.")
            return False

        try:
            summary_json = json.dumps( summary_text)
            query = f"""
                UPDATE {self.student_answer_media_table}
                SET media_summary = %s
                WHERE id = %s;
            """
            self.cursor.execute(query, (summary_json, media_id))

            if self.cursor.rowcount == 0:
                logging.warning(f"[DB] ⚠️ No media found with id={media_id}")
                self.conn.rollback()
                return False

            self.commit()
            logging.info(f"[DB] ✅ Updated media summary for media_id={media_id} in {self.student_answer_media_table}")
            return True

        except Exception as e:
            logging.error(f"[DB] ❌ Failed to update media_id={media_id}: {e}", exc_info=True)
            self.conn.rollback()
            return False
