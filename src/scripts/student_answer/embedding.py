import sys
import os
import logging

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------
# STUDENT ANSWER EMBEDDING PIPELINE
# ----------------------------------------------------------------------
def embed_student_answers(submission_id: str, model_id: str):
    """
    Embed summarized student answers (text + image summaries)
    and save them in the vector DB.
    """

    db_service = StudentAnswerServiceWithMedia(model_id=model_id)
    vector_service = StudentAnswerVectorService(model_id=model_id)

    logger.info(f"🚀 Starting embedding for submission_id={submission_id}, model_id={model_id}")

    try:
        vector_service.embed_and_store_student_answers(
            submission_id=submission_id,
            db_service=db_service,
        )

        logger.info(f"✅ Successfully stored embeddings for submission_id={submission_id}")

    except Exception as e:
        logger.error(
            f"❌ Failed embedding for submission_id={submission_id}: {e}",
            exc_info=True
        )
    finally:
        # Ensure clean shutdown
        try:
            db_service.close()
        except Exception:
            pass

        try:
            vector_service.close()
        except Exception:
            pass


# ----------------------------------------------------------------------
# MAIN ENTRY POINT
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Embed summarized student answers for RAG grading.")
    
    parser.add_argument(
        "--submission_id",
        nargs="+",
        required=True,
        help="List of submission IDs to embed."
    )
    
    parser.add_argument(
        "--model_id",
        required=True,
        help="LLM model identifier used for embedding."
    )

    args = parser.parse_args()

    for submission_id in args.submission_id:
        embed_student_answers(
            submission_id=submission_id,
            model_id=args.model_id
        )
