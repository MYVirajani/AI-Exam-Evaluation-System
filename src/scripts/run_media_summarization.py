import sys
import os
import logging
from typing import Optional

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.summary.image_summarizer import ImageSummarizerLLM

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def summarize_student_submission(submission_id: str):
    """Summarize media from student submissions."""
    db_service = StudentAnswerServiceWithMedia()
    llm = ImageSummarizerLLM()

    media_records = db_service.get_media_by_submission(submission_id)
    logger.info(f"📸 Found {len(media_records)} student media records for submission {submission_id}")

    for media in media_records:
        image_url = media["media_url"]
        media_id = media["id"]

        logger.info(f"🖼️ Summarizing student media: {image_url}")
        summary = llm.summarize_image(image_url, mode="student")

        if summary:
            db_service.update_media_summary(media_id, summary)
        else:
            logger.warning(f"⚠️ Skipped {media_id} due to summarization error.")

    db_service.close()
    logger.info("✅ Completed student media summarization.")


def summarize_model_answers(assessment_id: str):
    """Summarize media from model answers."""
    db_service = ModelAnswerDBService()
    llm = ImageSummarizerLLM()

    media_records = db_service.get_media_by_assessment(assessment_id)
    logger.info(f"📘 Found {len(media_records)} model media records for assessment {assessment_id}")

    for media in media_records:
        image_url = media["media_url"]
        media_id = media["id"]

        logger.info(f"🖼️ Summarizing model answer media: {image_url}")
        summary = llm.summarize_image(image_url, mode="model")

        if summary:
            db_service.update_media_summary(media_id, summary)
        else:
            logger.warning(f"⚠️ Skipped {media_id} due to summarization error.")

    db_service.close()
    logger.info("✅ Completed model answer media summarization.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run LLM media summarization for student or model answers.")
    parser.add_argument("--mode", required=True, choices=["student", "model"], help="Which type of summarization to run.")
    parser.add_argument("--submission_id", help="Student submission ID (required if mode=student).")
    parser.add_argument("--assessment_id", help="Assessment ID (required if mode=model).")

    args = parser.parse_args()

    if args.mode == "student":
        if not args.submission_id:
            parser.error("--submission_id is required when mode=student")
        summarize_student_submission(args.submission_id)

    elif args.mode == "model":
        if not args.assessment_id:
            parser.error("--assessment_id is required when mode=model")
        summarize_model_answers(args.assessment_id)
