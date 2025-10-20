

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
# import logging

# logger = logging.getLogger(__name__)


# def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str,
#                          student_indexes: list = None, assessment_id: str = None):
#     """
#     Embed student answers with assessment-specific filtering and database mapping.
    
#     Args:
#         provider: LLM provider ("OpenAI" or "GoogleGemini")
#         model: Embedding model name
#         module_code: Module code from database mapping
#         year: Year from database mapping
#         month: Month from database mapping
#         student_indexes: List of student registration numbers to filter (from page selection)
#         assessment_id: Assessment ID for filtering (from page context)
#     """
    
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
    
#     # Step 2: Get suffix based on embedder
#     provider_suffix = embedder.get_table_suffix()
#     print(f"⚙️ Using relational table: student_answers_{provider_suffix}")
    
#     # Step 3: Initialize database service
#         raise ValueError(f"❌ Unsupported provider: {provider}")

#     # Step 2: Get suffix based on provider (not just embedder)
#     provider_suffix = provider_override if provider_override else embedder.get_table_suffix()
#     print(f"⚙️ Using relational table: student_answers_{provider_suffix}")

#     # Step 3: Fetch grouped student answers
#     db_service = StudentAnswerService(provider_suffix=provider_suffix)
    
#     # Step 4: Fetch answers based on filtering criteria
#     if assessment_id:
#         print(f"🎯 Filtering by assessment ID: {assessment_id}")
#         grouped_answers_data = db_service.get_all_answers_grouped_by_assessment(assessment_id)
        
#         # Further filter by selected student indexes if provided
#         if student_indexes:
#             print(f"📋 Filtering by {len(student_indexes)} selected students: {student_indexes}")
#             filtered_grouped_answers = {}
            
#             for student_index in student_indexes:
#                 if student_index in grouped_answers_data:
#                     # Extract just the answers for embedding
#                     filtered_grouped_answers[student_index] = grouped_answers_data[student_index]['answers']
#                 else:
#                     print(f"⚠️ Student {student_index} not found in assessment {assessment_id}")
            
#             grouped_answers = filtered_grouped_answers
#         else:
#             # Use all students from the assessment
#             grouped_answers = {k: v['answers'] for k, v in grouped_answers_data.items()}
            
#     else:
#         # Fallback to legacy method using module/year/month
#         print(f"📚 Using legacy filtering: {module_code} {year} {month}")
#         all_grouped_answers = db_service.get_all_answers_grouped(
#             module_code=module_code,
#             year=year,
#             month=month
#         )
        
#         if student_indexes:
#             print(f"📋 Filtering by {len(student_indexes)} selected students: {student_indexes}")
#             grouped_answers = {}
            
#             for student_key, answers in all_grouped_answers.items():
#                 student_index = student_key[0]  # Extract student_index from tuple
#                 if student_index in student_indexes:
#                     grouped_answers[student_index] = answers
#         else:
#             # Convert tuple keys to student_index keys for consistency
#             grouped_answers = {student_key[0]: answers for student_key, answers in all_grouped_answers.items()}
    
#     if not grouped_answers:
#         print("⚠️ No student answers found to embed after filtering.")
#         return
    
#     # Step 5: Save embeddings
#     print(f"📊 Found {len(grouped_answers)} student papers to embed.")
#     vector_db = StudentAnswerEmbeddingDB(embedder)
    
#     for student_index, answers in grouped_answers.items():
#         print(f"🧠 Embedding student: {student_index} ({len(answers)} answers)...")
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
    
#     # Step 6: Log summary
#     total_answers = sum(len(answers) for answers in grouped_answers.values())
#     logger.info(f"Successfully embedded {total_answers} answers from {len(grouped_answers)} students")
    
#     if assessment_id:
#         logger.info(f"Assessment-specific embedding completed for assessment: {assessment_id}")
#     else:
#         logger.info(f"Module-specific embedding completed for: {module_code} {year} {month}")

#     print("✅ All student embeddings saved.")


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
    
    # Step 2: Get suffix based on embedder
    provider_suffix = embedder.get_table_suffix()
    
    # Step 2: Display table being used
    print(f"⚙️ Using relational table: student_answers_{provider_suffix}")
    
    # Step 3: Initialize database service
    
    # Step 3: Fetch grouped student answers
    db_service = StudentAnswerService(provider_suffix=provider_suffix)
    
    # Step 4: Fetch answers based on filtering criteria
    if assessment_id:
        print(f"🎯 Filtering by assessment ID: {assessment_id}")
        grouped_answers_data = db_service.get_all_answers_grouped_by_assessment(assessment_id)
        
        # Further filter by selected student indexes if provided
        if student_indexes:
            print(f"📋 Filtering by {len(student_indexes)} selected students: {student_indexes}")
            filtered_grouped_answers = {}
            
            for student_index in student_indexes:
                if student_index in grouped_answers_data:
                    # Extract just the answers for embedding
                    filtered_grouped_answers[student_index] = grouped_answers_data[student_index]['answers']
                else:
                    print(f"⚠️ Student {student_index} not found in assessment {assessment_id}")
            
            grouped_answers = filtered_grouped_answers
        else:
            # Use all students from the assessment
            grouped_answers = {k: v['answers'] for k, v in grouped_answers_data.items()}
            
    else:
        # Fallback to legacy method using module/year/month
        print(f"📚 Using legacy filtering: {module_code} {year} {month}")
        all_grouped_answers = db_service.get_all_answers_grouped(
            module_code=module_code,
            year=year,
            month=month
        )
        
        if student_indexes:
            print(f"📋 Filtering by {len(student_indexes)} selected students: {student_indexes}")
            grouped_answers = {}
            
            for student_key, answers in all_grouped_answers.items():
                student_index = student_key[0]  # Extract student_index from tuple
                if student_index in student_indexes:
                    grouped_answers[student_index] = answers
        else:
            # Convert tuple keys to student_index keys for consistency
            grouped_answers = {student_key[0]: answers for student_key, answers in all_grouped_answers.items()}
    
    grouped_answers = db_service.get_all_answers_grouped(
        module_code=module_code,
        year=year,
        month=month
    )
    
    if not grouped_answers:
        print("⚠️ No student answers found to embed after filtering.")
        return
    
    # Step 5: Save embeddings with assessment/submission tracking
    
    # Step 4: Save embeddings
    print(f"📊 Found {len(grouped_answers)} student papers to embed.")
    vector_db = StudentAnswerEmbeddingDB(embedder)
    
    for student_index, answers_data in grouped_answers.items():
        # Handle both new format (with metadata) and legacy format (just answers)
        if isinstance(answers_data, dict) and 'answers' in answers_data:
            answers = answers_data['answers']
            submission_id = answers_data.get('submission_id')
            print(f"🧠 Embedding student: {student_index} ({len(answers)} answers) | Submission: {submission_id}...")
        else:
            # Legacy format - answers_data is directly the list of answers
            answers = answers_data
            submission_id = None
            print(f"🧠 Embedding student: {student_index} ({len(answers)} answers)...")
        
        vector_db.save_embeddings(
            answers=answers, 
            assessment_id=assessment_id,
            submission_id=submission_id
        )
    
    
    for student_index, answers in grouped_answers.items():
        print(f"🧠 Embedding student: {student_index} …")
        vector_db.save_embeddings(answers)
    
    print("✅ All student embeddings saved.")
    
    # Step 6: Log summary
    total_answers = sum(len(answers) for answers in grouped_answers.values())
    logger.info(f"Successfully embedded {total_answers} answers from {len(grouped_answers)} students")
    
    if assessment_id:
        logger.info(f"Assessment-specific embedding completed for assessment: {assessment_id}")
    else:
        logger.info(f"Module-specific embedding completed for: {module_code} {year} {month}")