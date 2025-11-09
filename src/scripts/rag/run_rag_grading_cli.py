#!/usr/bin/env python3
"""
Interactive CLI script to grade one or more student submissions using the RAGGrader.
You can specify model, assessment, module, and submission IDs at runtime.
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.services.rag_grader import RAGGrader  # adjust import path if needed

# ------------------------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------------------------
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

log = logging.getLogger(__name__)

# ------------------------------------------------------------------------------
# MAIN EXECUTION
# ------------------------------------------------------------------------------
def main():
    """
    Run interactive grading with RAGGrader.
    """
    print("\n🧠 === RAG Grading CLI ===\n")

    # Prompt for model name
    model_name = input("Enter model name (openai/gemini) [default=openai]: ").strip().lower() or "openai"

    # Prompt for assessment details
    assessment_id = input("Enter Assessment ID: ").strip()
    model_paper_id = input("Enter Model Paper ID: ").strip()
    lecturer_id = input("Enter Lecturer ID: ").strip()
    module_id = input("Enter Module ID: ").strip()

    # Prompt for submission IDs
    submission_input = input("Enter one or more Submission IDs (comma-separated): ").strip()
    submission_ids = [s.strip() for s in submission_input.split(",") if s.strip()]

    # Prompt for top_k context chunks
    top_k_input = input("Enter number of top lecture chunks to use [default=5]: ").strip()
    top_k = int(top_k_input) if top_k_input.isdigit() else 5

    # Confirm
    print("\n⚙️ Configuration:")
    print(f"  Model Name     : {model_name}")
    print(f"  Assessment ID  : {assessment_id}")
    print(f"  Model Paper ID : {model_paper_id}")
    print(f"  Lecturer ID    : {lecturer_id}")
    print(f"  Module ID      : {module_id}")
    print(f"  Submission IDs : {submission_ids}")
    print(f"  Top-K Chunks   : {top_k}")
    confirm = input("\nProceed with grading? (y/n): ").strip().lower()
    if confirm != "y":
        print("❌ Cancelled.")
        return

    # Initialize RAG Grader
    log.info(f"🚀 Initializing RAGGrader with model={model_name}")
    grader = RAGGrader(model_name=model_name)

    # Run grading
    log.info(f"🏁 Starting grading for {len(submission_ids)} submission(s)...")
    results = grader.grade_all_submissions(
        submission_ids=submission_ids,
        model_paper_id=model_paper_id,
        assessment_id=assessment_id,
        lecturer_id=lecturer_id,
        module_id=module_id,
        top_k=top_k
    )

    # Print summary
    print("\n✅ === Grading Completed ===")
    print(f"Total answers graded: {len(results)}")
    for r in results:
        print(f"  → Submission: {r.submission_id}, Q{r.question_number} | Score: {r.score}/{r.max_marks} | Method: {r.grading_method}")

    print("\n💾 Results saved to database with `_rag` suffix.\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Interrupted by user.")
    except Exception as e:
        log.exception(f"❌ Fatal error: {e}")
