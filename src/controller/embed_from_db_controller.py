from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
from src.services.database_services.student_answer_db import StudentAnswerService
import logging

logger = logging.getLogger(__name__)

def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str,
                         student_indexes: list = None, assessment_id: str = None):
    """
    Embed student answers with assessment-specific filtering and database mapping.
    
    Args:
        provider: LLM provider ("OpenAI" or "GoogleGemini")
        model: Embedding model name
        module_code: Module code from database mapping
        year: Year from database mapping
        month: Month from database mapping
        student_indexes: List of student registration numbers to filter (from page selection)
        assessment_id: Assessment ID for filtering (from page context)
    """
    
    # Step 1: Select the correct embedder
    if provider == "OpenAI":
        embedder = OpenAIEmbedder(model_name=model, provider_suffix="openai")
        provider_suffix = "openai"
        
    elif provider == "GoogleGemini":
        embedder = GeminiEmbedder(model_name=model)
        provider_suffix = "gemini"
        
    elif provider == "DeepSeek":
        print("⚠️ DeepSeek does not support embeddings directly. Using OpenAI embedder for embedding.")
        embedder = OpenAIEmbedder(model_name=model, provider_suffix="deepseek")
        provider_suffix = "deepseek"
        
    else:
        raise ValueError(f"❌ Unsupported provider: {provider}")
    
    # Step 2: Display table being used
    print(f"⚙️ Using relational table: student_answers_{provider_suffix}")
    
    # Step 3: Fetch grouped student answers
    db_service = StudentAnswerService(provider_suffix=provider_suffix)
    grouped_answers = db_service.get_all_answers_grouped(
        module_code=module_code,
        year=year,
        month=month
    )
    
    if not grouped_answers:
        print("⚠️ No student answers found to embed after filtering.")
        return
    
    # Step 4: Save embeddings
    print(f"📊 Found {len(grouped_answers)} student papers to embed.")
    vector_db = StudentAnswerEmbeddingDB(embedder)
    
    for student_index, answers in grouped_answers.items():
        print(f"🧠 Embedding student: {student_index} …")
        vector_db.save_embeddings(answers)
    
    print("✅ All student embeddings saved.")