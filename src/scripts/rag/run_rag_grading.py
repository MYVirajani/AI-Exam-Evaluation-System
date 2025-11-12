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
    ASSESSMENT_ID = "OPERATING_SYSTEMS"      # <-- replace with your assessment_id
    MODEL_PAPER_ID = "OS"    # <-- replace with your model_paper_id
    LECTURER_ID = "L123"        # <-- replace with your lecturer_id
    MODULE_ID = "EE5351" 
    SUBMISSION_IDS=["EG_2022_4034"]
#     SUBMISSION_IDS = [
#     "EG_2022_4001", "EG_2022_4002", "EG_2022_4003", "EG_2022_4004", "EG_2022_4005",
#     "EG_2022_4006", "EG_2022_4007", "EG_2022_4008", "EG_2022_4009", "EG_2022_4010",
#     "EG_2022_4011", "EG_2022_4012", "EG_2022_4013", "EG_2022_4014", "EG_2022_4015",
#     "EG_2022_4016", "EG_2022_4017", "EG_2022_4018", "EG_2022_4019", "EG_2022_4020",
#     "EG_2022_4021", "EG_2022_4022", "EG_2022_4023", "EG_2022_4024", "EG_2022_4025",
#     "EG_2022_4026", "EG_2022_4027", "EG_2022_4028", "EG_2022_4029", "EG_2022_4030",
#     "EG_2022_4031", "EG_2022_4032", "EG_2022_4033", "EG_2022_4034", "EG_2022_4035",
#     "EG_2022_4036", "EG_2022_4037", "EG_2022_4038", "EG_2022_4039", "EG_2022_4040"
# ]

#     SUBMISSION_IDS = [
#     "EG_2021_4001", "EG_2021_4002", "EG_2021_4003", "EG_2021_4004", "EG_2021_4005",
#     "EG_2021_4006", "EG_2021_4007", "EG_2021_4008", "EG_2021_4009", "EG_2021_4010",
#     "EG_2021_4011", "EG_2021_4012", "EG_2021_4013", "EG_2021_4014", "EG_2021_4015",
#     "EG_2021_4016", "EG_2021_4017", "EG_2021_4018", "EG_2021_4019", "EG_2021_4020",
#     "EG_2021_4021", "EG_2021_4022", "EG_2021_4023", "EG_2021_4024", "EG_2021_4025",
#     "EG_2021_4026", "EG_2021_4027", "EG_2021_4028", "EG_2021_4029", "EG_2021_4030",
#     "EG_2021_4031", "EG_2021_4032", "EG_2021_4033", "EG_2021_4034", "EG_2021_4035",
#     "EG_2021_4036", "EG_2021_4037", "EG_2021_4038", "EG_2021_4039", "EG_2021_4040",
#     "EG_2021_4041", "EG_2021_4042", "EG_2021_4043", "EG_2021_4044", "EG_2021_4045",
#     "EG_2021_4046", "EG_2021_4047", "EG_2021_4048", "EG_2021_4049", "EG_2021_4050"
# ]
  # <-- list of one or more submission IDs to grade

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
