import logging
from src.services.database_services.evaluation_model_db import EvaluationModelService
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# --------------------------------------------------------
# NEW: Get embedder based on model_id (DB-driven)
# --------------------------------------------------------
def get_embedder_for_model(model_id: str):
    """
    Fetch provider from DB using model_id and return correct embedder instance.
    """

    try:
        model_config = EvaluationModelService().get_model_config(model_id)
    except Exception as e:
        raise RuntimeError(f"❌ Failed to load model config for model_id={model_id}: {e}")

    if not model_config:
        raise ValueError(f"❌ No model configuration found for model_id={model_id}")

    provider = model_config.get("provider")
    if not provider:
        raise ValueError(f"❌ Missing 'provider' field in model config for {model_id}")

    provider_lower = provider.lower()

    logger.info(f"🔎 Embedding provider fetched from DB: {provider_lower}")

    if provider_lower == "openai":
        return OpenAIEmbedder(model_id=model_id)

    elif provider_lower == "gemini":
        return GeminiEmbedder(model_id=model_id)

    else:
        raise ValueError(f"❌ Unsupported embedding provider: {provider}")
