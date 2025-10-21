import json
import logging
from .base_relational_db import BaseRelationalDB

logging.basicConfig(level=logging.INFO)

class StudentMediaDBService(BaseRelationalDB):
    """
    Database service to handle fetching and updating student_answer_media records.
    """

    def get_media_by_submission(self, submission_id: str):
        """
        Fetch all media records for a given submission_id.
        Returns a list of dicts: {id, student_answer_id, media_url}
        """
        try:
            self.cursor.execute("""
                SELECT id, student_answer_id, media_url
                FROM student_answer_media
                WHERE submission_id = %s;
            """, (submission_id,))
            records = self.cursor.fetchall()

            return [
                {
                    "id": r[0],
                    "student_answer_id": r[1],
                    "media_url": r[2]
                }
                for r in records
            ]
        except Exception as e:
            logging.error(f"[DB] Failed to fetch media for submission_id={submission_id}: {e}")
            return []

    def update_media_summary(self, media_id: str, summary_text: str):
        """
        Update media_summary for a given media record.
        """
        try:
            summary_json = json.dumps({"summary": summary_text})
            self.cursor.execute("""
                UPDATE student_answer_media
                SET media_summary = %s
                WHERE id = %s;
            """, (summary_json, media_id))
            self.commit()
            logging.info(f"[DB] ✅ Updated summary for media_id={media_id}")
        except Exception as e:
            logging.error(f"[DB] ❌ Failed to update media_id={media_id}: {e}")
            self.conn.rollback()
