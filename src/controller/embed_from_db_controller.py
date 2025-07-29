

from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
from src.services.database_services.student_answer_db import StudentAnswerService

def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str):
    # Step 1: Select the correct embedder
    if provider == "OpenAI":
        embedder = OpenAIEmbedder(model)
    elif provider == "GoogleGemini":
        embedder = GeminiEmbedder(model)
    else:
        raise ValueError(f"Unsupported provider: {provider}")

    provider_suffix = embedder.get_table_suffix()  


    db_service = StudentAnswerService(provider_suffix=provider_suffix)

    
    grouped_answers = db_service.get_all_answers_grouped(module_code=module_code, year=year, month=month)

   
    vector_db = StudentAnswerEmbeddingDB(embedder)
    for key, answers in grouped_answers.items():
        vector_db.save_embeddings(answers)
