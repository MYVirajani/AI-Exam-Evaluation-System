import logging
from typing import Optional, Dict, Any, List
from .base_relational_db import BaseRelationalDB

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class SubmissionService(BaseRelationalDB):

    def __init__(self):
        super().__init__()
        self.table_name = '"Submission"'
        logger.info(f"[DB] SubmissionService initialized (table={self.table_name})")

    # ==================================================================================
    # GET SINGLE SUBMISSION BY submission_id
    # ==================================================================================
    def get_submission_by_submission_id(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single submission record using submission_id."""

        query = f"""
        SELECT 
            submission_id,
            student_id,
            assessment_id,
            type,
            submission_start_at,
            submission_end_at,
            file_url,
            media_extracted_file_url,
            ip_address,
            device_info,
            student_score,
            is_graded,
            is_handwritten,
            handwritten_file_url
        FROM {self.table_name}
        WHERE submission_id = %s;
        """

        try:
            self.cursor.execute(query, (submission_id,))
            row = self.cursor.fetchone()

            if not row:
                logger.info(f"[DB] No submission found for submission_id={submission_id}")
                return None

            columns = [
                "submission_id", "student_id", "assessment_id", "type",
                "submission_start_at", "submission_end_at", "file_url",
                "media_extracted_file_url", "ip_address", "device_info",
                "student_score", "is_graded", "is_handwritten",
                "handwritten_file_url"
            ]

            return dict(zip(columns, row))

        except Exception as e:
            logger.error(f"❌ Failed to fetch submission_id={submission_id}: {e}", exc_info=True)
            self.conn.rollback()
            return None

    # ==================================================================================
    # GET MULTIPLE SUBMISSIONS BY submission_ids ARRAY
    # ==================================================================================
    def get_submissions_by_ids(self, submission_ids: List[str]) -> List[Dict[str, Any]]:
        """Fetch multiple submissions using an array of submission_ids."""

        if not submission_ids:
            return []

        query = f"""
        SELECT 
            submission_id,
            student_id,
            assessment_id,
            type,
            submission_start_at,
            submission_end_at,
            file_url,
            media_extracted_file_url,
            ip_address,
            device_info,
            student_score,
            is_graded,
            is_handwritten,
            handwritten_file_url
        FROM {self.table_name}
        WHERE submission_id = ANY(%s)
        ORDER BY submission_start_at DESC;
        """

        try:
            self.cursor.execute(query, (submission_ids,))
            rows = self.cursor.fetchall()

            columns = [
                "submission_id", "student_id", "assessment_id", "type",
                "submission_start_at", "submission_end_at", "file_url",
                "media_extracted_file_url", "ip_address", "device_info",
                "student_score", "is_graded", "is_handwritten",
                "handwritten_file_url"
            ]

            return [dict(zip(columns, row)) for row in rows]

        except Exception as e:
            logger.error(f"❌ Failed to fetch submissions for submission_ids={submission_ids}: {e}", exc_info=True)
            self.conn.rollback()
            return []

    # ==================================================================================
    # GET ALL SUBMISSIONS UNDER assessment_id
    # ==================================================================================
    def get_submissions_by_assignment(self, assessment_id: str) -> List[Dict[str, Any]]:
        """Fetch all submissions under an assessment_id."""

        query = f"""
        SELECT 
            submission_id,
            student_id,
            assessment_id,
            type,
            submission_start_at,
            submission_end_at,
            file_url,
            media_extracted_file_url,
            ip_address,
            device_info,
            student_score,
            is_graded,
            is_handwritten,
            handwritten_file_url
        FROM {self.table_name}
        WHERE assessment_id = %s
        ORDER BY submission_start_at DESC;
        """

        try:
            self.cursor.execute(query, (assessment_id,))
            rows = self.cursor.fetchall()

            columns = [
                "submission_id", "student_id", "assessment_id", "type",
                "submission_start_at", "submission_end_at", "file_url",
                "media_extracted_file_url", "ip_address", "device_info",
                "student_score", "is_graded", "is_handwritten",
                "handwritten_file_url"
            ]

            return [dict(zip(columns, row)) for row in rows]

        except Exception as e:
            logger.error(f"❌ Failed to fetch submissions for assessment_id={assessment_id}: {e}", exc_info=True)
            self.conn.rollback()
            return []

    # ==================================================================================
    # UPDATE media_extracted_file_url
    # ==================================================================================
    def update_media_extracted_url(self, submission_id: str, new_url: str) -> bool:
        """Update the media_extracted_file_url for the given submission."""

        query = f"""
        UPDATE {self.table_name}
        SET media_extracted_file_url = %s
        WHERE submission_id = %s;
        """

        try:
            self.cursor.execute(query, (new_url, submission_id))

            if self.cursor.rowcount == 0:
                logger.warning(
                    f"[DB] ⚠️ No submission found to update media_extracted_file_url "
                    f"(submission_id={submission_id})"
                )
                self.conn.rollback()
                return False

            self.conn.commit()
            logger.info(
                f"✅ media_extracted_file_url updated successfully for submission_id={submission_id}"
            )
            return True

        except Exception as e:
            logger.error(
                f"❌ Failed to update media_extracted_file_url for submission_id={submission_id}: {e}",
                exc_info=True
            )
            self.conn.rollback()
            return False
