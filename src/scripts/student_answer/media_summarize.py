import sys
import os
import logging

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.summary.image_summarise_service import ImageSummarizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------
# STUDENT SUBMISSION MEDIA SUMMARIZATION
# ----------------------------------------------------------------------
def summarize_student_submission(submission_id: str, model_id: str):
    """
    Summarize student submission media using the specified model.
    """
    db_service = StudentAnswerServiceWithMedia()
    llm = ImageSummarizer(model_id=model_id)

    # Fetch media filtered by model_id
    media_records = db_service.get_media_by_submission(
        submission_id=submission_id,
        model_id=model_id
    )

    logger.info(f"📸 Found {len(media_records)} student media records for submission {submission_id}")

    for media in media_records:
        media_id = media["id"]
        image_url = media["media_url"]

        logger.info(f"🖼️ Summarizing student media: {image_url}")

        try:
            summary = llm.summarize_image(
                image_url=image_url,
                mode="student",
                domain="Engineering"
            )
        except Exception as e:
            logger.error(f"❌ Error summarizing media {media_id}: {e}", exc_info=True)
            continue

        if summary:
            db_service.update_media_summary(
                media_id=media_id,
                summary=summary,
                model_id=model_id
            )
        else:
            logger.warning(f"⚠️ Summary is empty for media {media_id}. Skipped.")

    db_service.close()
    logger.info(f"✅ Completed summarization for submission {submission_id}.")


# ----------------------------------------------------------------------
# MAIN ENTRY POINT
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run LLM summarization for student submission media.")
    
    parser.add_argument(
        "--submission_id",
        nargs="+",
        required=True,
        help="Student submission IDs to summarize media for."
    )
    
    parser.add_argument(
        "--model_id",
        required=True,
        help="LLM model identifier to use for summarization."
    )

    args = parser.parse_args()

    for sid in args.submission_id:
        logger.info(f"🔍 Processing submission: {sid}")
        summarize_student_submission(sid, args.model_id)
