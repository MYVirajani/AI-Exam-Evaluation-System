from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dataclasses import asdict  

from src.scripts.rag.pipeline import start_grading_pipeline  

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
        # 🔥 Run full pipeline: validation → embedding → grading
        results = start_grading_pipeline(request)

        return {
            "status": "success",
            "count": len(results),
            "results": [asdict(r) for r in results]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
