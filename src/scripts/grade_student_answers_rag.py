#!/usr/bin/env python3
"""
Run this script to grade student answers using the RAGGrader (Retrieval-Augmented Grader).
It retrieves lecture material context, compares with model answers, and grades answers
strictly according to the guideline rubrics.
"""

import os
import sys
import argparse
import logging
from dotenv import load_dotenv

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from src.services.embedding.openai_embedder import OpenAIEmbedder  # Example embedder
from src.services.grading_services.rag_grader import RAGGrader

# ----------------------------------------------------------------------------
# Logging setup
# ----------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)

# ----------------------------------------------------------------------------
# CLI argument parser
# ----------------------------------------------------------------------------
def parse_args():
    parser = argparse.ArgumentParser(description="Run RAG-based grading for student submissions.")
    parser.add_argument("--submission_ids", nargs="+", required=True, help="List of submission IDs to grade")
    parser.add_argument("--model_answer_paper_id", required=True, help="Model answer paper ID")
    parser.add_argument("--assessment_id", required=True, help="Assessment ID")
    parser.add_argument("--lecturer_id", required=True, help="Lecturer ID")
    parser.add_argument("--module_id", required=True, help="Module ID")
    parser.add_argument("--chat_model", default="gpt-4o-mini", help="LLM model for grading (default: gpt-4o-mini)")
    parser.add_argument("--top_k", type=int, default=5, help="Number of lecture material chunks to retrieve")
    return parser.parse_args()

# ----------------------------------------------------------------------------
# MAIN ENTRY POINT
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    load_dotenv()
    args = parse_args()

    try:
        # 🧩 Initialize embedder (you can replace this with any class that implements .embed)
        embedder = OpenAIEmbedder(api_key=os.getenv("OPENAI_API_KEY"))

        # 🧠 Initialize RAGGrader
        grader = RAGGrader(
            provider="OpenAI",
            chat_model=args.chat_model,
            embedder=embedder
        )

        # 🚀 Run grading
        log.info(f"🎯 Starting grading for submissions: {args.submission_ids}")
        results = grader.grade_submissions_answers(
            submission_ids=args.submission_ids,
            model_answer_paper_id=args.model_answer_paper_id,
            assessment_id=args.assessment_id,
            lecturer_id=args.lecturer_id,
            module_id=args.module_id,
            top_k=args.top_k
        )

        log.info(f"✅ Grading complete. {len(results)} answers processed.")
        for r in results:
            log.info(f"📘 Q{r.question_number}: {r.score}/{r.max_marks} — {r.feedback}")

    except Exception as e:
        log.error(f"❌ Grading script failed: {e}", exc_info=True)
        sys.exit(1)
