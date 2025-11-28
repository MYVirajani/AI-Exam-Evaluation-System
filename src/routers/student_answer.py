# src\routers\student_answer.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

# Import your pipeline runner
from src.scripts.student_answer.pipeline import run_pipeline

router = APIRouter(prefix="/student-answer", tags=["Pipeline Runner"])


class PipelineRequest(BaseModel):
    submission_ids: Optional[List[str]] = None
    assignment_id: Optional[str] = None
    model_id: str

    preprocess: bool = True
    extract: bool = True
    summarize_media: bool = True
    embed: bool = True
    delay_between: float = 0.8


@router.post("/process-extract-embed")
def run_full_pipeline(request: PipelineRequest):
    """
    Run the full exam-evaluation pipeline.
    """

    # Validate: at least submission_ids or assignment_id
    if not request.submission_ids and not request.assignment_id:
        raise HTTPException(
            status_code=400,
            detail="Provide either submission_ids or assignment_id."
        )

    try:
        # Call your pipeline runner
        run_pipeline(
            submission_ids=request.submission_ids,
            assignment_id=request.assignment_id,
            model_id=request.model_id,
            preprocess=request.preprocess,
            extract=request.extract,
            summarize_media=request.summarize_media,
            embed=request.embed,
            delay_between=request.delay_between,
        )

        return {
            "status": "success",
            "message": "Pipeline executed successfully",
            "processed_submissions": request.submission_ids,
            "assignment_id": request.assignment_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline execution failed: {str(e)}"
        )

