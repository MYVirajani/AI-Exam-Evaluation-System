from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.scripts.model_answer.pipeline import ModelAnswerProcessor

router = APIRouter(prefix="/model-answer", tags=["Model Answer Processing"])


class ModelAnswerRequest(BaseModel):
    model_answer_paper_id: str
    assessment_id: str
    model_id: str
    extract_media: bool = True


@router.post("/process-extract-embed")
def process_model_answer(request: ModelAnswerRequest):
    """
    Run the complete model answer processing pipeline.
    """

    try:
        processor = ModelAnswerProcessor(model_id=request.model_id)

        processor.process_model_answer(
            model_answer_paper_id=request.model_answer_paper_id,
            assessment_id=request.assessment_id,
            model_id=request.model_id,
            extract_media=request.extract_media
        )

        return {
            "status": "success",
            "message": "Model answer processed successfully.",
            "model_answer_paper_id": request.model_answer_paper_id,
            "assessment_id": request.assessment_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Model answer processing failed: {str(e)}"
        )
