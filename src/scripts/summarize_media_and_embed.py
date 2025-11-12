import sys
import os
import logging

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.student_media_db_service import StudentMediaDBService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.model_answer_vector_service import ModelAnswerVectorService
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService  
from src.services.summary.image_summarizer import ImageSummarizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------
# STUDENT SUBMISSION MEDIA SUMMARIZATION
# ----------------------------------------------------------------------
def summarize_student_submission(submission_id: str, selected_model: str):
    """
    Summarize student submission media using the specified model.
    """
    db_service = StudentMediaDBService(ai_model=selected_model)
    llm = ImageSummarizer(provider_key=selected_model)

    media_records = db_service.get_media_by_submission(submission_id)
    logger.info(f"📸 Found {len(media_records)} student media records for submission {submission_id}")

    for media in media_records:
        image_url = media["media_url"]
        media_id = media["id"]

        logger.info(f"🖼️ Summarizing student media: {image_url}")
        summary = llm.summarize_image(image_url, mode="student", domain="Engineering")

        if summary:
            db_service.update_media_summary(media_id, summary)
        else:
            logger.warning(f"⚠️ Skipped {media_id} due to summarization error.")

    db_service.close()
    logger.info(f"✅ Completed summarization for submission {submission_id}.")


# ----------------------------------------------------------------------
# MODEL ANSWER MEDIA SUMMARIZATION
# ----------------------------------------------------------------------
def summarize_model_answers(assessment_id: str, model_paper_id: str = None, selected_model: str = "gpt-4o"):
    """
    Summarize model answer media (filtered by assessment_id and model_paper_id).
    """
    db_service = ModelAnswerDBService(ai_model=selected_model)
    llm = ImageSummarizer(provider_key=selected_model)

    media_records = db_service.get_media_by_assessment(assessment_id, model_paper_id)
    logger.info(
        f"📘 Found {len(media_records)} model media records for assessment_id={assessment_id}"
        + (f", model_paper_id={model_paper_id}" if model_paper_id else "")
    )

    if not media_records:
        logger.warning("⚠️ No model answer media found for summarization.")
        db_service.close()
        return

    for media in media_records:
        image_url = media["media_url"]
        media_id = media["id"]

        logger.info(f"🖼️ Summarizing model answer media: {image_url}")
        summary = llm.summarize_image(image_url, mode="model", domain="Computer Science Algorithm Design")

        if summary:
            db_service.update_media_summary(media_id, summary)
        else:
            logger.warning(f"⚠️ Skipped {media_id} due to summarization error.")

    db_service.close()
    logger.info("✅ Completed model answer media summarization.")


# ----------------------------------------------------------------------
# MODEL ANSWER EMBEDDING (AFTER SUMMARIZATION)
# ----------------------------------------------------------------------
def embed_model_answers(model_paper_id: str, assessment_id: str, selected_model: str):
    """Embed model answers and store embeddings."""
    db_service = ModelAnswerDBService(ai_model=selected_model)
    vector_service = ModelAnswerVectorService(ai_model=selected_model)

    logger.info(f"🚀 Starting embedding for model_paper_id={model_paper_id}, assessment_id={assessment_id}")

    try:
        vector_service.embed_and_store_model_answers(
            model_paper_id=model_paper_id,
            assessment_id=assessment_id,
            db_service=db_service,
        )
        logger.info("✅ Model answer embeddings successfully stored.")
    except Exception as e:
        logger.error(f"❌ Failed to embed model answers: {e}")
    finally:
        db_service.close()
        vector_service.close()


# ----------------------------------------------------------------------
# ✅ NEW: STUDENT ANSWER EMBEDDING
# ----------------------------------------------------------------------
def embed_student_answers(submission_id: str, selected_model: str):
    """
    Embed summarized student answers (text + image summaries)
    and store embeddings for retrieval-based grading.
    """

    db_service = StudentAnswerServiceWithMedia(ai_model=selected_model)
    vector_service = StudentAnswerVectorService(ai_model=selected_model)

    logger.info(f"🚀 Starting embedding for student submission_id={submission_id}")

    try:
        vector_service.embed_and_store_student_answers(
            submission_id=submission_id,
            db_service=db_service,
        )
        logger.info(f"✅ Successfully stored embeddings for submission_id={submission_id}")
    except Exception as e:
        logger.error(f"❌ Failed to embed student answers for submission_id={submission_id}: {e}")
    finally:
        db_service.close()
        vector_service.close()


# ----------------------------------------------------------------------
# MAIN ENTRY POINT
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run LLM summarization or embedding for student/model answers.")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["student", "model", "embed_model", "embed_student"],
        help="Choose operation: student summarization, model summarization, or embedding.",
    )
    parser.add_argument("--submission_id", nargs="+", help="Student submission IDs (required if mode=student/embed_student).")
    parser.add_argument("--assessment_id", help="Assessment ID (required if mode=model or embed_model).")
    parser.add_argument("--model_paper_id", help="Model paper ID (optional for model mode, required for embed_model).")
    parser.add_argument("--selected_model", required=True, help="Model key (e.g., openai, gemini, deepseek).")

    args = parser.parse_args()

    if args.mode == "student":
        if not args.submission_id:
            parser.error("--submission_id is required when mode=student")
        for sid in args.submission_id:
            logger.info(f"🔍 Processing submission: {sid}")
            summarize_student_submission(sid, args.selected_model)

    elif args.mode == "model":
        if not args.assessment_id:
            parser.error("--assessment_id is required when mode=model")
        summarize_model_answers(args.assessment_id, args.model_paper_id, selected_model=args.selected_model)

    elif args.mode == "embed_model":
        if not args.assessment_id or not args.model_paper_id:
            parser.error("--assessment_id and --model_paper_id are required when mode=embed_model")
        embed_model_answers(args.model_paper_id, args.assessment_id, selected_model=args.selected_model)

    elif args.mode == "embed_student":
        if not args.submission_id:
            parser.error("--submission_id is required when mode=embed_student")
        for sid in args.submission_id:
            embed_student_answers(sid, selected_model=args.selected_model)
