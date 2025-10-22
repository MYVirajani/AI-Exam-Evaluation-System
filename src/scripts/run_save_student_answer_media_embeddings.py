# src/scripts/run_save_student_answer_media_embeddings.py

import argparse
import logging
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# Adjust import paths if running directly
from src.services.database_services.student_answer_media_embedder import StudentAnswerMediaEmbeddingDB
from src.services.embedding.openai_embedder import OpenAIEmbedder  # or your actual embedder class

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(
        description="Generate and save embeddings for student answers + media summaries."
    )
    parser.add_argument(
        "--submissions",
        nargs="+",
        required=True,
        help="List of submission IDs (space-separated)"
    )
    parser.add_argument(
        "--provider",
        type=str,
        default=None,
        help="Optional provider override (e.g., deepseek, gemini, openai)"
    )
    args = parser.parse_args()

    submission_ids = args.submissions
    provider = args.provider

    try:
        # Initialize embedder (replace with your embedder class)
        embedder = OpenAIEmbedder()

        # Initialize embedding database service
        db_service = StudentAnswerMediaEmbeddingDB(embedder, provider_override=provider)

        logger.info(f"🚀 Starting embedding generation for submissions: {submission_ids}")
        db_service.save_embeddings_for_submissions(submission_ids)
        logger.info("✅ Embeddings successfully saved to vector database.")

    except Exception as e:
        logger.error(f"❌ Error occurred while saving embeddings: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
