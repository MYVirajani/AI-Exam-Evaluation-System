

# # # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # # from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # from src.services.database_services.student_answer_db import StudentAnswerService

# # # def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str):
# # #     # Step 1: Select the correct embedder
# # #     if provider == "OpenAI":
# # #         embedder = OpenAIEmbedder(model)
# # #     elif provider == "GoogleGemini":
# # #         embedder = GeminiEmbedder(model)
# # #     else:
# # #         raise ValueError(f"Unsupported provider: {provider}")

# # #     provider_suffix = embedder.get_table_suffix()  


# # #     db_service = StudentAnswerService(provider_suffix=provider_suffix)

    
# # #     grouped_answers = db_service.get_all_answers_grouped(module_code=module_code, year=year, month=month)

   
# # #     vector_db = StudentAnswerEmbeddingDB(embedder)
# # #     for key, answers in grouped_answers.items():
# # #         vector_db.save_embeddings(answers)


# # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # from src.services.database_services.student_answer_db import StudentAnswerService


# # def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str):
# #     # Step 1: Select the correct embedder
# #     if provider == "OpenAI":
# #         embedder = OpenAIEmbedder(model)
# #     elif provider == "GoogleGemini":
# #         embedder = GeminiEmbedder(model)
# #     else:
# #         raise ValueError(f"❌ Unsupported provider: {provider}")

# #     # Step 2: Get suffix based on embedder
# #     provider_suffix = embedder.get_table_suffix()
# #     print(f"⚙️ Using relational table: student_answers_{provider_suffix}")

# #     # Step 3: Fetch grouped student answers
# #     db_service = StudentAnswerService(provider_suffix=provider_suffix)
# #     grouped_answers = db_service.get_all_answers_grouped(
# #         module_code=module_code,
# #         year=year,
# #         month=month
# #     )

# #     if not grouped_answers:
# #         print("⚠️ No student answers found to embed.")
# #         return

# #     # Step 4: Save embeddings
# #     print(f"📊 Found {len(grouped_answers)} student papers to embed.")
# #     vector_db = StudentAnswerEmbeddingDB(embedder)
# #     for student_index, answers in grouped_answers.items():
# #         print(f"🧠 Embedding student: {student_index} …")
# #         vector_db.save_embeddings(answers)

# #     print("✅ All student embeddings saved.")


# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
# from src.services.database_services.student_answer_db import StudentAnswerService


# def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str):
#     # Step 1: Select the correct embedder
#     provider_override = None

#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model)
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder(model)
#     elif provider == "DeepSeek":
#         print("⚠️ DeepSeek does not support embeddings directly. Using OpenAI embedder for embedding.")
#         openai_model = "text-embedding-3-small"  # fallback
#         embedder = OpenAIEmbedder(openai_model)
#         provider_override = "deepseek"  # ensure consistency in table naming
#     else:
#         raise ValueError(f"❌ Unsupported provider: {provider}")

#     # Step 2: Get suffix based on provider (not just embedder)
#     provider_suffix = provider_override if provider_override else embedder.get_table_suffix()
#     print(f"⚙️ Using relational table: student_answers_{provider_suffix}")

#     # Step 3: Fetch grouped student answers
#     db_service = StudentAnswerService(provider_suffix=provider_suffix)
#     grouped_answers = db_service.get_all_answers_grouped(
#         module_code=module_code,
#         year=year,
#         month=month
#     )

#     if not grouped_answers:
#         print("⚠️ No student answers found to embed.")
#         return

#     # Step 4: Save embeddings
#     print(f"📊 Found {len(grouped_answers)} student papers to embed.")
#     vector_db = StudentAnswerEmbeddingDB(embedder, provider_override=provider_override)
#     for student_index, answers in grouped_answers.items():
#         print(f"🧠 Embedding student: {student_index} …")
#         vector_db.save_embeddings(answers)

#     print("✅ All student embeddings saved.")


from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
from src.services.database_services.student_answer_db import StudentAnswerService


def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str):
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
        print("⚠️ No student answers found to embed.")
        return
    
    # Step 4: Save embeddings
    print(f"📊 Found {len(grouped_answers)} student papers to embed.")
    vector_db = StudentAnswerEmbeddingDB(embedder)
    
    for student_index, answers in grouped_answers.items():
        print(f"🧠 Embedding student: {student_index} …")
        vector_db.save_embeddings(answers)
    
    print("✅ All student embeddings saved.")