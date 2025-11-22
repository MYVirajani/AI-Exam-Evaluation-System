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
    ASSESSMENT_ID = "EE3501"      # <-- replace with your assessment_id
    MODEL_PAPER_ID = "Control_Systems"    # <-- replace with your model_paper_id
    LECTURER_ID = "Konara"        # <-- replace with your lecturer_id
    MODULE_ID = "EE3501" 
    SUBMISSION_IDS = ["CS_2021_4021"]
    
#     SUBMISSION_IDS = [ "CS_2021_4017", "CS_2021_4018", "CS_2021_4019", "CS_2021_4020",
#     "CS_2021_4021", "CS_2021_4022", "CS_2021_4023", "CS_2021_4024", "CS_2021_4025",
#     "CS_2021_4026", "CS_2021_4027", "CS_2021_4028", "CS_2021_4029", "CS_2021_4030",
#     "CS_2021_4031", "CS_2021_4032", "CS_2021_4033", "CS_2021_4034", "CS_2021_4035",
#     "CS_2021_4036", "CS_2021_4037", "CS_2021_4038", "CS_2021_4039", "CS_2021_4040",
#     "CS_2021_4041", "CS_2021_4042", "CS_2021_4043", "CS_2021_4044", "CS_2021_4045",
#     "CS_2021_4046", "CS_2021_4047", "CS_2021_4048", "CS_2021_4049", "CS_2021_4050"
# ]

    # "CS_2021_4001", "CS_2021_4002", "CS_2021_4003", "CS_2021_4004", "CS_2021_4005",
    # "CS_2021_4006", "CS_2021_4007", "CS_2021_4008", "CS_2021_4009", "CS_2021_4010",
    # "CS_2021_4011", "CS_2021_4012", "CS_2021_4013", "CS_2021_4014", "CS_2021_4015",
    # "CS_2021_4016",

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
