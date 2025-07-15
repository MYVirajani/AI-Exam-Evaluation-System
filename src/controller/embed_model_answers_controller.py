from src.services.database_services.model_answer_embedding_db import ModelAnswerEmbeddingService
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.model_answer_extractor import ModelAnswerExtractor

def embed_model_answers(provider: str, model_name: str, file_text: str):
    extractor = ModelAnswerExtractor(selected_provider=provider, selected_model=model_name)
    model_answers = extractor.extract_model_answers(file_text)

    if not model_answers:
        raise ValueError("No model answers extracted.")

    # Choose embedder
    if provider == "OpenAI":
        embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
    elif provider == "GoogleGemini":
        embedder = GeminiEmbedder()
    else:
        raise ValueError("Invalid embedding provider.")

    # Prepare data
    embedding_map = {}
    for ans in model_answers:
        full_id = ans.full_question_id.lower()
        combined_text = f"{ans.answer_text.strip()} {ans.guideline.strip() if ans.guideline else ''}"
        embedding_map[full_id] = combined_text

    texts = list(embedding_map.values())
    columns = list(embedding_map.keys())

    # Embed
    vectors = embedder.embed(texts)

    # Save
    db = ModelAnswerEmbeddingService()
    db.initialize_table()
    db.save_model_embeddings("model", dict(zip(columns, vectors)))
