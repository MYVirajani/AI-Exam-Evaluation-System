#!/usr/bin/env python3
"""
Run this script to grade one or more student submissions using the RAGGrader.
"""

import os
import sys
import logging
from dotenv import load_dotenv
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.services.grading_services.rag_grader import RAGGrader 

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
    Run grading for one or more submissions using the RAGGrader.
    """
    # === Editable Parameters ===
    MODEL_NAME = "gemini"  # "openai" or "gemini"
    ASSESSMENT_ID = "EE6250_2025_JUNE"      # <-- replace with your assessment_id
    MODEL_PAPER_ID = "TEST"    # <-- replace with your model_paper_id
    LECTURER_ID = "L123"        # <-- replace with your lecturer_id
    MODULE_ID = "EE6250"          # <-- replace with your module_id
    SUBMISSION_IDS = ["EG_2020_4010"]   # <-- list of one or more submission IDs to grade

    log.info(f"🚀 Starting RAG grading for {len(SUBMISSION_IDS)} submission(s) using model={MODEL_NAME}")

    # Initialize RAG Grader
    grader = RAGGrader(model_name=MODEL_NAME)

    # Run grading
    results = grader.grade_all_submissions(
        submission_ids=SUBMISSION_IDS,
        model_paper_id=MODEL_PAPER_ID,
        assessment_id=ASSESSMENT_ID,
        lecturer_id=LECTURER_ID,
        module_id=MODULE_ID,
        top_k=5
    )

    # Print summary
    log.info(f"✅ Completed grading. Total answers graded: {len(results)}")
    for r in results:
        log.info(
            f"Submission: {r.submission_id}, Q{r.question_number} — "
            f"Score: {r.score}/{r.max_marks}, Similarity: {r.similarity_score}, "
            f"Method: {r.grading_method}"
        )

if __name__ == "__main__":
    main()
