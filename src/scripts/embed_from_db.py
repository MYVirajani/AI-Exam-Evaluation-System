

# # # import argparse
# # # from src.controller.embed_from_db_controller import embed_student_answers

# # # if __name__ == "__main__":
# # #     parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
# # #     parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini"], required=True, help="LLM provider")
# # #     parser.add_argument("--model", required=True, help="Embedding model name")
# # #     parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
# # #     parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
# # #     parser.add_argument("--month", required=True, help="Exam month (e.g., January)")

# # #     args = parser.parse_args()

# # #     embed_student_answers(
# # #         provider=args.provider,
# # #         model=args.model,
# # #         module_code=args.module_code,
# # #         year=args.year,
# # #         month=args.month
# # #     )


# # # import argparse
# # # from src.controller.embed_from_db_controller import embed_student_answers

# # # def main(provider, model, module_code, year, month):
# # #     """
# # #     Main function that can be called from Flask API.
    
# # #     Args:
# # #         provider: LLM provider ("OpenAI" or "GoogleGemini")
# # #         model: Embedding model name
# # #         module_code: Module code (e.g., "EG4001")
# # #         year: Exam year (e.g., 2020)
# # #         month: Exam month (e.g., "January")
    
# # #     Returns:
# # #         dict: Result status and message
# # #     """
# # #     try:
# # #         embed_student_answers(
# # #             provider=provider,
# # #             model=model,
# # #             module_code=module_code,
# # #             year=year,
# # #             month=month
# # #         )
        
# # #         return {
# # #             "status": "success",
# # #             "message": f"Successfully embedded student answers for {module_code} {year} {month} using {provider} {model}"
# # #         }
        
# # #     except Exception as e:
# # #         return {
# # #             "status": "error",
# # #             "message": f"Failed to embed student answers: {str(e)}"
# # #         }

# # # if __name__ == "__main__":
# # #     parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
# # #     parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini"], required=True, help="LLM provider")
# # #     parser.add_argument("--model", required=True, help="Embedding model name")
# # #     parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
# # #     parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
# # #     parser.add_argument("--month", required=True, help="Exam month (e.g., January)")

# # #     args = parser.parse_args()

# # #     # Call the main function with parsed arguments
# # #     result = main(
# # #         provider=args.provider,
# # #         model=args.model,
# # #         module_code=args.module_code,
# # #         year=args.year,
# # #         month=args.month
# # #     )
    
# # #     print(f"\nResult: {result}")
    
# # #     if result["status"] == "error":
# # #         exit(1)

# # import argparse
# # import sys
# # from src.controller.embed_from_db_controller import embed_student_answers

# # def main(provider=None, model=None, module_code=None, year=None, month=None):
# #     """
# #     Main function that can be called from Flask API or command line.
    
# #     Args:
# #         provider: LLM provider ("OpenAI" or "GoogleGemini")
# #         model: Embedding model name
# #         module_code: Module code (e.g., "EG4001")
# #         year: Exam year (e.g., 2020)
# #         month: Exam month (e.g., "January")
    
# #     Returns:
# #         dict: Result status and message
# #     """
# #     try:
# #         embed_student_answers(
# #             provider=provider,
# #             model=model,
# #             module_code=module_code,
# #             year=year,
# #             month=month
# #         )
        
# #         return {
# #             "status": "success",
# #             "message": f"Successfully embedded student answers for {module_code} {year} {month} using {provider} {model}"
# #         }
        
# #     except Exception as e:
# #         return {
# #             "status": "error",
# #             "message": f"Failed to embed student answers: {str(e)}"
# #         }

# # def main_cli():
# #     """Command line interface for the script."""
# #     parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
# #     parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini"], required=True, help="LLM provider")
# #     parser.add_argument("--model", required=True, help="Embedding model name")
# #     parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
# #     parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
# #     parser.add_argument("--month", required=True, help="Exam month (e.g., January)")

# #     args = parser.parse_args()

# #     # Call the main function with parsed arguments
# #     result = main(
# #         provider=args.provider,
# #         model=args.model,
# #         module_code=args.module_code,
# #         year=args.year,
# #         month=args.month
# #     )
    
# #     print(f"\nResult: {result}")
    
# #     if result["status"] == "error":
# #         sys.exit(1)

# # if __name__ == "__main__":
# #     main_cli()


# """
# Enhanced student answer embedding script with assessment-specific filtering.
# Embeds student answers that are already extracted and saved in the database.
# """

# import logging
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
# from src.services.database_services.student_answer_db import StudentAnswerService

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# def main(provider: str, model: str, module_code: str, year: int, month: str, 
#          assessment_id: str = None, **kwargs):
#     """
#     Main function to embed student answers with assessment filtering support.
    
#     Args:
#         provider: Embedding provider ("OpenAI" or "GoogleGemini")
#         model: Embedding model name
#         module_code: Module code to filter by
#         year: Exam year to filter by
#         month: Exam month to filter by
#         assessment_id: Assessment ID to filter by (optional)
#         **kwargs: Additional arguments from pipeline calls
        
#     Returns:
#         dict: Result status and details
#     """
#     logger.info(f"🧠 Starting student answer embedding with provider: {provider}")
#     logger.info(f"📊 Filters: {module_code}, {year}-{month}")
#     if assessment_id:
#         logger.info(f"🎯 Assessment: {assessment_id}")

#     # Step 1: Select the correct embedder
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model)
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder(model_name=model)
#     else:
#         raise ValueError(f"❌ Unsupported provider: {provider}")

#     # Step 2: Get suffix based on embedder
#     provider_suffix = embedder.get_table_suffix()
#     logger.info(f"⚙️ Using relational table: student_answers_{provider_suffix}")

#     # Step 3: Initialize database services
#     db_service = StudentAnswerService(provider_suffix=provider_suffix)
#     db_service.initialize_table()

#     # Step 4: Fetch grouped student answers with assessment filtering
#     if assessment_id:
#         # Use assessment-specific filtering
#         grouped_answers = db_service.get_all_answers_grouped(assessment_id=assessment_id)
#         logger.info(f"📊 Found {len(grouped_answers)} student papers for assessment {assessment_id}")
#     else:
#         # Use traditional module/year/month filtering (fallback)
#         grouped_answers = db_service.get_all_answers_grouped(
#             module_code=module_code,
#             year=year,
#             month=month
#         )
#         logger.info(f"📊 Found {len(grouped_answers)} student papers for {module_code} {year}-{month}")

#     if not grouped_answers:
#         logger.warning("⚠️ No student answers found to embed.")
#         db_service.close()
#         return {
#             "status": "warning",
#             "message": "No student answers found to embed",
#             "details": {
#                 "provider": provider,
#                 "assessment_id": assessment_id,
#                 "module_code": module_code,
#                 "filters_used": f"{year}-{month}" if not assessment_id else "assessment_id"
#             }
#         }

#     # Step 5: Initialize vector database and save embeddings
#     vector_db = StudentAnswerEmbeddingDB(embedder)
#     embedded_count = 0
    
#     try:
#         for student_key, answers_list in grouped_answers.items():
#             student_index = student_key[0]  # First element is student_index
#             logger.info(f"🧠 Embedding student: {student_index} ({len(answers_list)} answers)…")
            
#             # Add assessment_id to answers if available
#             if assessment_id:
#                 for answer in answers_list:
#                     if hasattr(answer, 'assessment_id'):
#                         answer.assessment_id = assessment_id
            
#             vector_db.save_embeddings(answers_list, assessment_id=assessment_id)
#             embedded_count += 1

#         logger.info(f"✅ Successfully embedded {embedded_count} student papers")
        
#         return {
#             "status": "success",
#             "message": f"Embedded {embedded_count} student papers successfully",
#             "details": {
#                 "provider": provider,
#                 "embedded_students": embedded_count,
#                 "assessment_id": assessment_id,
#                 "module_code": module_code,
#                 "table_suffix": provider_suffix
#             }
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Error during embedding: {e}")
#         return {
#             "status": "error",
#             "message": f"Embedding failed: {str(e)}",
#             "details": {
#                 "provider": provider,
#                 "assessment_id": assessment_id,
#                 "embedded_count": embedded_count
#             }
#         }
        
#     finally:
#         # Clean up database connections
#         vector_db.close()
#         db_service.close()
#         logger.info("🔄 Database connections closed")


# def embed_student_answers(provider: str, model: str, module_code: str, year: int, month: str,
#                          assessment_id: str = None):
#     """
#     Legacy function for backward compatibility.
#     """
#     return main(provider, model, module_code, year, month, assessment_id)


# if __name__ == "__main__":
#     import argparse
    
#     parser = argparse.ArgumentParser(description="Embed student answers from database")
#     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
#     parser.add_argument("--model", required=True, help="Embedding model name")
#     parser.add_argument("--module-code", required=True, help="Module code")
#     parser.add_argument("--year", type=int, required=True, help="Exam year")
#     parser.add_argument("--month", required=True, help="Exam month")
#     parser.add_argument("--assessment-id", help="Assessment ID for filtering")
    
#     args = parser.parse_args()
    
#     result = main(
#         provider=args.provider,
#         model=args.model,
#         module_code=args.module_code,
#         year=args.year,
#         month=args.month,
#         assessment_id=args.assessment_id
#     )
    
#     print(f"\n📊 Result: {result}")
    
#     if result["status"] == "error":
#         exit(1)

import argparse
import sys
from src.controller.embed_from_db_controller import embed_student_answers

def main(provider=None, model=None, module_code=None, year=None, month=None, 
         student_indexes=None, assessment_id=None):
    """
    Main function that can be called from Flask API or command line.
    
    Args:
        provider: LLM provider ("OpenAI" or "GoogleGemini")
        model: Embedding model name
        module_code: Module code (e.g., "EG4001") - from database mapping
        year: Exam year (e.g., 2020) - from database mapping
        month: Exam month (e.g., "January") - from database mapping
        student_indexes: List of student registration numbers to filter - from page selection
        assessment_id: Assessment ID for filtering - from page context
    
    Returns:
        dict: Result status and message
    """
    try:
        embed_student_answers(
            provider=provider,
            model=model,
            module_code=module_code,
            year=year,
            month=month,
            student_indexes=student_indexes,
            assessment_id=assessment_id
        )
        
        return {
            "status": "success",
            "message": f"Successfully embedded student answers for assessment {assessment_id} using {provider} {model}"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to embed student answers: {str(e)}"
        }

def main_cli():
    """Command line interface for the script."""
    parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
    parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini"], required=True, help="LLM provider")
    parser.add_argument("--model", required=True, help="Embedding model name")
    parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
    parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
    parser.add_argument("--month", required=True, help="Exam month (e.g., January)")
    parser.add_argument("--student-indexes", nargs='+', help="List of student indexes to process")
    parser.add_argument("--assessment-id", help="Assessment ID for filtering")
    
    args = parser.parse_args()
    
    # Call the main function with parsed arguments
    result = main(
        provider=args.provider,
        model=args.model,
        module_code=args.module_code,
        year=args.year,
        month=args.month,
        student_indexes=args.student_indexes,
        assessment_id=args.assessment_id
    )
    
    print(f"\nResult: {result}")
    
    if result["status"] == "error":
        sys.exit(1)

if __name__ == "__main__":
    main_cli()