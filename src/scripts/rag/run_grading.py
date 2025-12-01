import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from src.services.grading_services.rag_grader import RAGGrader

if __name__ == "__main__":
    model_id = "eaa81306-f9e3-4c96-901d-3b7a80a3f4ac"

    grader = RAGGrader(model_id=model_id)

    submission_ids = [
        "c8e553ae-6d44-4900-8dbb-d32b1392a72a"
    ]

    model_paper_id = "e26f77d1-fe6d-4f62-8295-ad8ffba4227c"
    assessment_id = "5b8a8592-487b-41f5-8af8-4f9c7853cd93"
    lecturer_id = "your_lecturer_id"
    module_id = "81afc94a-453a-4f78-aff5-f56f0c6c20ff"

    graded = grader.grade_all_submissions(
        submission_ids=submission_ids,
        model_paper_id=model_paper_id,
        assessment_id=assessment_id,
        lecturer_id=lecturer_id,
        module_id=module_id,
        top_k=5
    )

    print("\n--- GRADING COMPLETE ---")
    print(f"Total graded records: {len(graded)}")
