import json
import logging
from .base_relational_db import BaseRelationalDB

# --------------------------------------------------------------------------
# Configure logging
# --------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)


class StudentMediaDBService(BaseRelationalDB):
    """
    Database service to handle fetching and updating student_answer_media records.
    """

    # ----------------------------------------------------------------------
    # FETCH MEDIA BY SUBMISSION ID
    # ----------------------------------------------------------------------
    def get_media_by_submission(self, submission_id: str):
        """
        Fetch all media records for a given submission_id.
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
            self.cursor.execute("""
                SELECT id, student_answer_id, media_url
                FROM student_answer_media
                WHERE submission_id = %s;
            """, (submission_id,))
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
        Update media_summary JSON field for a given media record.
        """
        if not media_id:
            logging.warning("[DB] update_media_summary called with empty media_id.")
            return False

        try:
            summary_json = json.dumps({"summary": summary_text})
            self.cursor.execute("""
                UPDATE student_answer_media
                SET media_summary = %s
                WHERE id = %s;
            """, (summary_json, media_id))
            
            # ✅ Ensure at least one row was updated
            if self.cursor.rowcount == 0:
                logging.warning(f"[DB] ⚠️ No media found with id={media_id}")
                self.conn.rollback()
                return False

            self.commit()
            logging.info(f"[DB] ✅ Updated media summary for media_id={media_id}")
            return True

        except Exception as e:
            logging.error(f"[DB] ❌ Failed to update media_id={media_id}: {e}", exc_info=True)
            self.conn.rollback()
            return False
