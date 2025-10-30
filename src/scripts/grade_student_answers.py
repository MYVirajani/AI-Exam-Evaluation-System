#!/usr/bin/env python3
"""
Run this script to grade student answers saved in the database
using the DirectGrader (no RAG, guideline-based).
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Add project root to sys.path (so imports work regardless of where script is run)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from src.services.grader import DirectGrader

# ---------------------------------------------------------------
# 🔧 Configuration
# ---------------------------------------------------------------
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------
# 🧠 Main entry point
# ---------------------------------------------------------------
def main():
    """
    Run grading for student submissions.
    Example usage:
        python -m src.scripts.grade_student_answers <model_answer_paper_id> <assessment_id> <submission_id_1> [<submission_id_2> ...] <provider> <ai_model>

    Example:
        python -m src.scripts.grade_student_answers PAPER1 EE5351_2025_SEPTEMBER EG_2020_4010 GoogleGemini gemini-2.0-flash
    """

    # ---- Parse CLI args ----
    if len(sys.argv) < 6:
        print(
            "Usage: python -m src.scripts.grade_student_answers "
            "<model_answer_paper_id> <assessment_id> <submission_id_1> [<submission_id_2> ...] <provider> <ai_model>"
        )
        sys.exit(1)

    model_answer_paper_id = sys.argv[1]
    assessment_id = sys.argv[2]
    provider = sys.argv[-2]
    ai_model = sys.argv[-1]
    submission_ids = sys.argv[3:-2]

    logger.info("🚀 Starting grading process...")
    logger.info(f"Model Paper ID: {model_answer_paper_id}")
    logger.info(f"Assessment ID: {assessment_id}")
    logger.info(f"Submissions: {submission_ids}")
    logger.info(f"AI Provider: {provider}")
    logger.info(f"AI Model: {ai_model}")

    # ---- Initialize grader with correct model ----
    grader = DirectGrader(
        provider=provider,
        chat_model=ai_model
    )

    # ---- Run grading ----
    graded_results = grader.grade_all_submissions(
        submission_ids=submission_ids,
        model_answer_paper_id=model_answer_paper_id,
        assessment_id=assessment_id
    )

    # ---- Summary ----
    if not graded_results:
        logger.warning("⚠️ No grading results generated.")
    else:
        logger.info("✅ Grading complete. Summary:")
        for record in graded_results:
            logger.info(
                f"Submission: {record.submission_id}, "
                f"Q{record.question_number}: {record.score}/{record.max_marks} - {record.feedback}"
            )

    logger.info("🎉 Done!")


# ---------------------------------------------------------------
# 🏁 Run script
# ---------------------------------------------------------------
if __name__ == "__main__":
    main()
