import os
import sys
import time
from dotenv import load_dotenv
from pprint import pprint

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.extractors.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.submission_db_service import SubmissionService
from src.services.extractors.content_extractor_service import ContentExtractorService
from src.scripts.student_answer.media_extraction_and_save import MediaExtractorService


# --------------------------------------------------------------------------
# FUNCTION: Extract & Save
# --------------------------------------------------------------------------

def extract_and_save(file_url: str, submission_id: str, extractor: AnswerExtractor, model_id: str):
    """Extract answers and save them into database tables."""

    print(f"\n📄 Processing submission: {submission_id}")

    try:
        # ----------------------------------------------------------
        # 1. Extract Text
        # ----------------------------------------------------------
        raw_text = ContentExtractorService.extract_text(file_url)
        answers = extractor.extract_answers_with_llm(raw_text)

        if not answers:
            print("❌ No answers extracted.")
            return

        # ----------------------------------------------------------
        # 2. Preview Extracted Content
        # ----------------------------------------------------------
        print("\n🧾 Extracted Answers Preview:")
        for ans in answers:
            print(f"• {ans.full_question_id}:")
            print(f"   📝 {ans.answer_text[:120]}{'...' if len(ans.answer_text) > 120 else ''}")
            print(f"   🖼️ Media URLs: {getattr(ans, 'media_urls', None)}")

        # ----------------------------------------------------------
        # 3. Save Answers to Database
        # ----------------------------------------------------------
        print("🗄️  Saving answers in normalized tables...")

        db_media = StudentAnswerServiceWithMedia(model_id=model_id)
        db_media._ensure_tables_exist()
        db_media.save_answers(answers=answers, submission_id=submission_id)
        db_media.close()

        print(f"✅ Successfully saved extracted answers for submission_id={submission_id}")

    except Exception as e:
        print(f"❌ Error processing submission {submission_id}: {e}")


# --------------------------------------------------------------------------
# FUNCTION: PREPROCESS DOCX BEFORE EXTRACTION
# --------------------------------------------------------------------------

def preprocess_docx_if_needed(submission: dict, submission_service: SubmissionService):
    """
    Preprocess DOCX submissions:
        - Extract images, tables, equations
        - Save updated doc
        - Update DB media_extracted_file_url
    """

    file_url = submission.get("file_url")
    if not file_url or not file_url.lower().endswith(".docx"):
        return file_url  # no change

    submission_id = submission["submission_id"]

    print(f"📝 Preprocessing DOCX for submission {submission_id}...")

    extractor = MediaExtractorService()

    dest_folder = os.path.join(
        os.path.dirname(file_url),
        "extracted_media",
        submission_id
    )

    try:
        updated_doc_path, media_urls = extractor.process_document(
            file_url=file_url,
            dest_folder=dest_folder
        )

        # Update DB
        submission_service.update_media_extracted_url(submission_id, updated_doc_path)

        print(f"✔ Updated DOCX saved: {updated_doc_path}")
        print(f"✔ Extracted Media Count: {len(media_urls)}")

        return updated_doc_path

    except Exception as e:
        print(f"❌ Error preprocessing DOCX for submission {submission_id}: {e}")
        return file_url


# --------------------------------------------------------------------------
# MAIN SCRIPT ENTRY FUNCTION
# --------------------------------------------------------------------------

def process_submissions(
        submission_ids: list | None,
        assignment_id: str | None,
        model_id: str,
        preprocess: bool = False
):
    """
    Process submissions based on user arguments.
    Priority:
        1. If submission_ids are provided → use them
        2. Else if assignment_id is provided → fetch all submissions for that assignment
    """

    submission_service = SubmissionService()

    # ----------------------------------------------------------
    # Decide which submissions to process
    # ----------------------------------------------------------

    if submission_ids:
        print("🔍 Fetching submissions by submission_ids...")
        submissions = submission_service.get_submissions_by_ids(submission_ids)

    elif assignment_id:
        print("🔍 Fetching all submissions for assignment_id:", assignment_id)
        submissions = submission_service.get_submissions_by_assignment(assignment_id)

    else:
        print("❌ Error: You must provide submission_ids or assignment_id")
        return

    if not submissions:
        print("❌ No submissions found.")
        return

    print(f"📦 Found {len(submissions)} submissions to process...\n")

    extractor = AnswerExtractor(model_id=model_id)

    # ----------------------------------------------------------
    # Process Each Submission
    # ----------------------------------------------------------

    for sub in submissions:
        submission_id = sub["submission_id"]

        # ----------------------------------------------------------
        # OPTIONAL: PRE-PROCESS DOCX BEFORE EXTRACTION
        # ----------------------------------------------------------
        if preprocess:
            new_url = preprocess_docx_if_needed(sub, submission_service)
        else:
            new_url = sub.get("media_extracted_file_url") or sub.get("file_url")

        if not new_url:
            print(f"⚠️ Submission {submission_id} has no usable file. Skipping.")
            continue

        # ----------------------------------------------------------
        # RUN ANSWER EXTRACTION
        # ----------------------------------------------------------
        extract_and_save(
            file_url=new_url,
            submission_id=submission_id,
            extractor=extractor,
            model_id=model_id
        )

        time.sleep(1)  # small delay for stability


# --------------------------------------------------------------------------
# USAGE EXAMPLE
# --------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract and Save Student Answers from Submissions")

    parser.add_argument(
        "--submission_ids",
        nargs="+",
        help="List of submission IDs to process."
    )

    parser.add_argument(
        "--assignment_id",
        help="Assignment ID to fetch all related submissions."
    )

    parser.add_argument(
        "--model_id",
        required=True,
        help="AI model ID to use for answer extraction."
    )

    parser.add_argument(
        "--preprocess",
        action="store_true",
        help="Preprocess DOCX files to extract media before answer extraction."
    )

    args = parser.parse_args()

    process_submissions(
        submission_ids=args.submission_ids,
        assignment_id=args.assignment_id,
        model_id=args.model_id,
        preprocess=args.preprocess
    )