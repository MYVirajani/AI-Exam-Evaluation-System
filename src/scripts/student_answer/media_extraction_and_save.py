import os
import sys
import logging
from typing import List, Optional
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.submission_db_service import SubmissionDBService
from src.services.extractors.media_extractor_service import MediaExtractorService

load_dotenv()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# =====================================================================
#   PREPROCESS SINGLE SUBMISSION
# =====================================================================
def preprocess_submission(submission: dict, media_service: MediaExtractorService, db: SubmissionDBService):
    submission_id = submission["submission_id"]
    original_file = submission.get("file_url")
    media_file = submission.get("media_extracted_file_url")

    print(f"\n---------------------------------------------")
    print(f"📄 Submission ID     : {submission_id}")
    print(f"📁 Original File URL : {original_file}")
    print(f"🖼️ Media Extracted?  : {media_file is not None}")
    print("---------------------------------------------")

    # ---------------------------------------------------------
    # Skip if no file exists
    # ---------------------------------------------------------
    if not original_file:
        print("❌ No file_url found → Skipping.")
        return

    # ---------------------------------------------------------
    # If already processed → skip
    # ---------------------------------------------------------
    if media_file:
        print("ℹ️ Already processed → Skipping.")
        return

    # ---------------------------------------------------------
    # Only preprocess DOCX files
    # ---------------------------------------------------------
    if not original_file.lower().endswith(".docx"):
        print("⚠️ Not a DOCX document → Skipping.")
        return

    # ---------------------------------------------------------
    # Destination folder
    # ---------------------------------------------------------
    file_dir = os.path.dirname(original_file)
    extracted_media_dir = os.path.join(file_dir, "extracted_media")

    # ---------------------------------------------------------
    # Process DOCX
    # ---------------------------------------------------------
    print("🔧 Processing DOCX and extracting media...")

    try:
        updated_file_path, extracted_media_urls = media_service.process_document(
            file_url=original_file,
            dest_folder=extracted_media_dir
        )

        print(f"✅ Saved updated DOCX: {updated_file_path}")
        print(f"📸 Extracted {len(extracted_media_urls)} media files.")

        # -----------------------------------------------------
        # Update DB
        # -----------------------------------------------------
        db.update_media_extracted_file_url(submission_id, updated_file_path)
        print(f"💾 Database Updated for submission_id={submission_id}")

    except Exception as e:
        print(f"❌ Error processing submission {submission_id}: {e}")


# =====================================================================
#   PROCESS SUBMISSIONS (BY submission_ids OR assignment_id)
# =====================================================================
def process_submissions(
    submission_ids: Optional[List[str]] = None,
    assignment_id: Optional[str] = None
):
    db = SubmissionDBService()
    media_service = MediaExtractorService()

    # ---------------------------------------------------------
    # Determine mode
    # ---------------------------------------------------------
    if submission_ids:
        print("\n🔍 Fetching submissions by submission_ids...")
        submissions = []
        for sid in submission_ids:
            record = db.get_submission_by_submission_id(sid)
            if record:
                submissions.append(record)
    elif assignment_id:
        print(f"\n🔍 Fetching submissions for assignment_id={assignment_id}...")
        submissions = db.get_submissions_by_assessment_id(assignment_id)
    else:
        print("❌ Provide either submission_ids or assignment_id.")
        return

    # ---------------------------------------------------------
    # No submissions found?
    # ---------------------------------------------------------
    if not submissions:
        print("⚠️ No submissions found.")
        return

    print(f"📦 Total Submissions to Process: {len(submissions)}\n")

    # ---------------------------------------------------------
    # Process in loop
    # ---------------------------------------------------------
    for submission in submissions:
        preprocess_submission(submission, media_service, db)

    db.close()
    print("\n🎉 FINISHED PROCESSING ALL SUBMISSIONS\n")


# =====================================================================
#   MAIN ENTRY (optional CLI usage)
# =====================================================================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Process Submission DOCX Media Extractor")
    parser.add_argument("--submission_ids", nargs="*", help="List of submission IDs")
    parser.add_argument("--assignment_id", type=str, help="Assessment/Assignment ID")

    args = parser.parse_args()

    process_submissions(
        submission_ids=args.submission_ids,
        assignment_id=args.assignment_id
    )
