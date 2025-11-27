from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
import logging

# Import the pipeline function
from src.scripts import process_lecture_matrials

router = APIRouter(prefix="/educator", tags=["Lecture Material Embedding"])

logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# API Endpoint to run media extraction for a lesson
# ---------------------------------------------------------
@router.post("/lecture-material-embedding")
async def lecture_material_embedding_endpoint(
    lesson_id: str,
    model_id: Optional[str],
    background_tasks: BackgroundTasks = None
):
    """
    Trigger media extraction, summarisation, tag replacement,
    DB saving, and embedding generation for a specific lesson.
    """

    logger.info(f"📢 Received request: lesson_id={lesson_id}, model_id={model_id}")

    try:
        # Run the heavy task in the background
        background_tasks.add_task(process_lecture_matrials, lesson_id, model_id)

        return JSONResponse(
            content={
                "status": "started",
                "message": "Lecture Material Embedding pipeline has started in background.",
                "lesson_id": lesson_id,
                "model_id": model_id
            },
            status_code=202
        )

    except Exception as e:
        logger.error(f"❌ Failed to queue task: {str(e)}")

        return JSONResponse(
            content={
                "status": "error",
                "message": str(e)
            },
            status_code=500
        )
