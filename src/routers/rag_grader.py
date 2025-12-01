from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dataclasses import asdict  # ✅ added

from src.services.grading_services.rag_grader import RAGGrader

router = APIRouter(prefix="/rag-grader", tags=["RAG Grader"])


class GradeRequest(BaseModel):
    model_id: str
    submission_ids: List[str]
    model_paper_id: str
    assessment_id: str
    lecturer_id: str
    module_id: str
    top_k: int = 5
    question_numbers: Optional[List[str]] = None


@router.post("/grade")
async def grade_submissions(request: GradeRequest):
    try:
        grader = RAGGrader(model_id=request.model_id)

        results = grader.grade_submissions_answers(
            submission_ids=request.submission_ids,
            model_paper_id=request.model_paper_id,
            assessment_id=request.assessment_id,
            lecturer_id=request.lecturer_id,
            module_id=request.module_id,
            top_k=request.top_k,
            question_numbers=request.question_numbers,
        )

        return {
            "status": "success",
            "count": len(results),
            "results": [asdict(r) for r in results]  
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
