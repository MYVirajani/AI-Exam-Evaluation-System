from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.scripts.lecture_materials.pipeline import process_lecture_materials

router = APIRouter(prefix="/lecture-material", tags=["Lecture Material Processing"])


class LectureMaterialProcessRequest(BaseModel):
    lesson_id: str
    model_id: str = "eaa81306-f9e3-4c96-901d-3b7a80a3f4ac"


@router.post("/process-extract-embed")
def process_lecture_material_endpoint(request: LectureMaterialProcessRequest):
    """
    Endpoint: Trigger lecture material processing pipeline.
    """

    try:
        process_lecture_materials(
            lesson_id=request.lesson_id,
            model_id=request.model_id
        )

        return {
            "status": "success",
            "lesson_id": request.lesson_id,
            "model_id": request.model_id,
            "message": "Lecture material processing completed"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lecture material processing failed: {str(e)}"
        )
