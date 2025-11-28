#!/usr/bin/env python3
"""
pipeline.py

Full pipeline:
  - (optional) Preprocess DOCX: extract images/equations/tables -> save updated doc + extracted media
  - Extract answers using AnswerExtractor -> save to Student_Answer + Student_Answer_Media
  - Summarize media (images) via ImageSummarizer -> save media_summary
  - Generate & store embeddings via StudentAnswerVectorService

Usage examples:
  # Preprocess + extract + summarize + embed for list of submissions
  python pipeline.py --submission_ids FC_2020_4001 FC_2020_4002 --model_id openai --preprocess --extract --summarize_media --embed

  # Process by assignment
  python pipeline.py --assignment_id ASSIGN_2024_001 --model_id gemini --extract --embed
"""

import os
import sys
import time
import logging
from typing import List, Optional

# Add project root to sys.path (adjust if necessary)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from dotenv import load_dotenv
load_dotenv()

# Services (assumed implemented in your project)
from src.services.database_services.submission_db_service import SubmissionService
from src.services.extractors.media_extractor_service import MediaExtractorService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.summary.image_summarise_service import ImageSummarizer
from src.services.extractors.answer_extractor import AnswerExtractor
from src.services.extractors.content_extractor_service import ContentExtractorService
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# -------------------------
# Helpers
# -------------------------
def preprocess_submission_docx(sub: dict, submission_db: SubmissionService, media_service: MediaExtractorService) -> Optional[str]:
    """
    If submission has a file_url and is a .docx and media_extracted_file_url is null,
    process the DOCX (extract images, tables, equations), save updated doc and update DB.
    Returns the path to the updated docx (or original file_url if nothing changed).
    """
    submission_id = sub.get("submission_id")
    file_url = sub.get("file_url")
    media_extracted = sub.get("media_extracted_file_url")

    if not file_url:
        logger.warning(f"[preprocess] submission {submission_id} has no file_url, skipping preprocess.")
        return None

    # If already has media_extracted_file_url, return it
    if media_extracted:
        logger.info(f"[preprocess] submission {submission_id} already has media_extracted_file_url, skipping preprocess.")
        return media_extracted

    if not file_url.lower().endswith(".docx"):
        logger.info(f"[preprocess] submission {submission_id} file is not a DOCX ({file_url}), skipping preprocess.")
        return file_url

    # Destination folder for extracted media (create per-submission)
    file_dir = os.path.dirname(file_url) or "."
    extracted_folder = os.path.join(file_dir, "extracted_media", submission_id)
    os.makedirs(extracted_folder, exist_ok=True)

    try:
        logger.info(f"[preprocess] Processing DOCX for submission {submission_id} -> {file_url}")
        updated_path, extracted_media_urls = media_service.process_document(file_url=file_url, dest_folder=extracted_folder)

        # Update DB with updated_path
        updated = submission_db.update_media_extracted_url(submission_id, updated_path)
        if not updated:
            logger.warning(f"[preprocess] Failed to update DB media_extracted_file_url for submission {submission_id}")
        else:
            logger.info(f"[preprocess] Updated DB media_extracted_file_url for submission {submission_id} -> {updated_path}")

        logger.info(f"[preprocess] Extracted {len(extracted_media_urls)} media files for submission {submission_id}")
        return updated_path

    except Exception as e:
        logger.exception(f"[preprocess] Error preprocessing submission {submission_id}: {e}")
        return file_url


def extract_answers_and_save(file_url: str, submission_id: str, model_id: str):
    """
    Extract answers using AnswerExtractor and save them to normalized tables via StudentAnswerServiceWithMedia.
    """
    try:
        logger.info(f"[extract] Extracting text from {file_url} for submission {submission_id}")

        # FIXED: create instance
        extractor_service = ContentExtractorService()
        raw_text = extractor_service.extract_text(file_url)

        extractor = AnswerExtractor(model_id=model_id)
        answers = extractor.extract_answers_with_llm(raw_text)
        print(f"[extract] Extracted {len(answers)} answers for submission {submission_id}")

        if not answers:
            logger.warning(f"[extract] No answers extracted for submission {submission_id}")
            return False

        logger.info(f"[extract] Extracted {len(answers)} answers for submission {submission_id} — saving to DB")
        db_media = StudentAnswerServiceWithMedia(model_id=model_id)
        try:
            if hasattr(db_media, "_ensure_tables_exist"):
                db_media._ensure_tables_exist()
        except Exception:
            logger.debug("Ignoring _ensure_tables_exist() error", exc_info=True)

        db_media.save_answers(answers=answers, submission_id=submission_id)
        db_media.close()
        logger.info(f"[extract] Saved answers for submission {submission_id}")
        return True

    except Exception as e:
        logger.exception(f"[extract] Failed extracting/saving for submission {submission_id}: {e}")
        return False

def summarize_media_for_submission(submission_id: str, model_id: str):
    """
    For a submission, summarize each media item (images) and save the summary.
    """
    try:
        db_media = StudentAnswerServiceWithMedia(model_id=model_id)
        summarizer = ImageSummarizer(model_id=model_id)

        media_records = db_media.get_media_by_submission(submission_id=submission_id, model_id=model_id)
        logger.info(f"[summarize_media] Found {len(media_records)} media records for submission {submission_id}")

        for media in media_records:
            media_id = media.get("id")
            media_url = media.get("media_url")
            logger.info(f"[summarize_media] Summarizing media {media_id} ({media_url})")

            try:
                summary = summarizer.summarize_image(media_url, mode="student", domain="General")
            except Exception as ex:
                logger.exception(f"[summarize_media] Error summarizing media {media_id}: {ex}")
                continue

            if summary:
                # Save summary into DB (pass model_id to ensure per-model isolation)
                updated = db_media.update_media_summary(media_id=media_id, summary=summary, model_id=model_id)
                if updated:
                    logger.info(f"[summarize_media] Saved summary for media {media_id}")
                else:
                    logger.warning(f"[summarize_media] Failed to save summary for media {media_id}")
            else:
                logger.warning(f"[summarize_media] Empty summary for media {media_id}, skipped.")

        db_media.close()
    except Exception as e:
        logger.exception(f"[summarize_media] Failed to summarize media for submission {submission_id}: {e}")


def embed_submission_answers(submission_id: str, model_id: str):
    """
    Generate embeddings for saved student answers for given submission and model_id.
    """
    try:
        # db_service for fetching answers for embedding — pass model_id via constructor if your
        # StudentAnswerServiceWithMedia is model-aware
        db_service = StudentAnswerServiceWithMedia(model_id=model_id)
        vec_service = StudentAnswerVectorService(model_id=model_id)

        logger.info(f"[embed] Embedding answers for submission {submission_id} using model {model_id}")
        vec_service.embed_and_store_student_answers(submission_id=submission_id, db_service=db_service)

        # Close resources
        db_service.close()
        vec_service.close()
        logger.info(f"[embed] Completed embeddings for submission {submission_id}")

    except Exception as e:
        logger.exception(f"[embed] Failed to embed answers for submission {submission_id}: {e}")


# -------------------------
# Main pipeline runner
# -------------------------
def run_pipeline(
    submission_ids: Optional[List[str]],
    assignment_id: Optional[str],
    model_id: str,
    preprocess: bool = False,
    extract: bool = True,
    summarize_media: bool = True,
    embed: bool = True,
    delay_between: float = 0.8
):
    """
    Run pipeline for either a list of submission_ids or an assignment_id.
    """
    submission_db = SubmissionService()
    media_service = MediaExtractorService()

    # decide which submissions to process
    submissions = []
    if submission_ids:
        logger.info(f"[run] Fetching {len(submission_ids)} submission(s) by id")
        submissions = submission_db.get_submissions_by_ids(submission_ids)
    elif assignment_id:
        logger.info(f"[run] Fetching submissions by assignment_id={assignment_id}")
        submissions = submission_db.get_submissions_by_assignment(assessment_id=assignment_id)
    else:
        logger.error("[run] No submission_ids or assignment_id provided — nothing to do")
        return

    if not submissions:
        logger.warning("[run] No submissions returned by DB, exiting.")
        return

    logger.info(f"[run] Processing {len(submissions)} submission(s)")

    for sub in submissions:
        sid = sub.get("submission_id")
        logger.info(f"\n===== START: submission {sid} =====")

        # 1) Preprocess DOCX (optional)
        file_to_use = None
        if preprocess:
            updated_path = preprocess_submission_docx(sub=sub, submission_db=submission_db, media_service=media_service)
            file_to_use = updated_path or sub.get("file_url")
        else:
            file_to_use = sub.get("media_extracted_file_url") or sub.get("file_url")

        if extract:
            if not file_to_use:
                logger.warning(f"[run] submission {sid} has no file to extract from — skipping extract step")
            else:
                extract_success = extract_answers_and_save(file_url=file_to_use, submission_id=sid, model_id=model_id)
                if not extract_success:
                    logger.warning(f"[run] extraction failed for submission {sid}")

        if summarize_media:
            summarize_media_for_submission(submission_id=sid, model_id=model_id)

        if embed:
            # give a little time for DB writes to settle if needed
            time.sleep(0.4)
            embed_submission_answers(submission_id=sid, model_id=model_id)

        logger.info(f"===== DONE: submission {sid} =====\n")
        time.sleep(delay_between)

    # close services
    try:
        submission_db.close()
    except Exception:
        pass

    logger.info("[run] Pipeline finished for all submissions.")


# -------------------------
# CLI
# -------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Full preprocessing + extraction + summarization + embedding pipeline")
    parser.add_argument("--submission_ids", nargs="*", help="List of submission IDs to process")
    parser.add_argument("--assignment_id", help="Assignment/assessment id to process")
    parser.add_argument("--model_id", required=True, help="Model id to use for extraction/summarization/embedding")
    parser.add_argument("--preprocess", action="store_true", help="Preprocess DOCX files (extract images/tables/equations)")
    parser.add_argument("--extract", action="store_true", default=True, help="Run answer extraction and save (default True)")
    parser.add_argument("--summarize_media", action="store_true", help="Summarize extracted media (images) and save")
    parser.add_argument("--embed", action="store_true", help="Generate & save embeddings for extracted answers")
    parser.add_argument("--delay", type=float, default=0.8, help="Delay (seconds) between processing submissions")
    args = parser.parse_args()

    # normalize flags
    run_pipeline(
        submission_ids=args.submission_ids if args.submission_ids else None,
        assignment_id=args.assignment_id if args.assignment_id else None,
        model_id=args.model_id,
        preprocess=args.preprocess,
        extract=args.extract,
        summarize_media=args.summarize_media,
        embed=args.embed,
        delay_between=args.delay,
    )
