from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from src.scripts.lecture_materials.pipeline import process_lecture_materials

router = APIRouter(prefix="/lecture-material", tags=["Lecture Material Processing"])


class LectureMaterialProcessRequest(BaseModel):
    lesson_ids: List[str]  # Accept multiple lesson IDs
    model_ids: List[str] = ["eaa81306-f9e3-4c96-901d-3b7a80a3f4ac"]  # Default model ID


@router.post("/process-extract-embed")
def process_lecture_material_endpoint(request: LectureMaterialProcessRequest):
    """
    Endpoint: Trigger lecture material processing pipeline for multiple lessons and models.
    """
    try:
        process_lecture_materials(
            lesson_ids=request.lesson_ids,
            model_ids=request.model_ids
        )

        return {
            "status": "success",
            "lesson_ids": request.lesson_ids,
            "model_ids": request.model_ids,
            "message": "Lecture material processing completed for all specified lessons and models"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lecture material processing failed: {str(e)}"
        )
