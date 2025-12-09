import logging
from src.services.database_services.model_answer_vector_service import ModelAnswerVectorService

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class ModelAnswerEmbeddingValidator:

    def __init__(self, model_id: str):
        self.model_id = model_id
        self.vector_service = ModelAnswerVectorService(model_id=model_id)

    def embeddings_exist(self, assessment_id: str, model_paper_id: str) -> bool:
        """
        Returns True if embeddings already exist for this model answer paper.
        """
        records = self.vector_service.get_vectors_for_paper(
            assessment_id=assessment_id,
            model_paper_id=model_paper_id
        )

        exists = len(records) > 0
        logger.info(f"🔍 Embedding check → exists={exists}, count={len(records)}")
        return exists
