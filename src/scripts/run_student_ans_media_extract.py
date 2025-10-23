import sys
import os

# Ensure project root is in the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.media_extractor_service import MediaExtractorService
from src.services.database_services.base_relational_db import BaseRelationalDB


class SubmissionProcessor(BaseRelationalDB):
    def __init__(self):
        super().__init__()
        self.media_extractor = MediaExtractorService()

    def process_submission(self, submission_id: str):
        print("🔍 Started processing submission:", submission_id)

        # Fetch file URL from DB
        self.cursor.execute("SELECT file_url FROM submission WHERE submission_id = %s;", (submission_id,))
        row = self.cursor.fetchone()

        if not row or not row[0]:
            print(f"⚠️ No file URL found for submission {submission_id}")
            return

        file_url = row[0]
        print(f"📂 Processing submission {submission_id} -> {file_url}")

        try:
            updated_file_url = self.media_extractor.process_docx(file_url)
        except Exception as e:
            print(f"❌ Error while processing document: {e}")
            return

        # Update DB with new file URL
        try:
            self.cursor.execute(
                "UPDATE submission SET updated_file_url = %s WHERE submission_id = %s;",
                (updated_file_url, submission_id),
            )
            self.commit()
            print(f"✅ Saved updated file URL for submission {submission_id}")
        except Exception as e:
            print(f"❌ Failed to update DB: {e}")


# ✅ Entry point
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("⚠️ Usage: python -m src.scripts.run_student_ans_media_extract <submission_id>")
        sys.exit(1)

    submission_id = sys.argv[1]

    print("🚀 Running Student Answer Media Extract Script")
    processor = SubmissionProcessor()
    processor.process_submission(submission_id)
    print("🏁 Finished.")
