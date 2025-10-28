


# # """
# # Grade ALL papers for a module / exam session.

# # Example
# # -------
# # python -m src.scripts.mark_all_papers ^
# #   --provider OpenAI ^
# #   --llm gpt-4o ^
# #   --embedder text-embedding-3-large ^
# #   --module EE6250 ^
# #   --year 2024 ^
# #   --month June
# # """

# # import argparse
# # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # from src.services.grading_rag_service       import RAGGrader

# # def main():
# #     ap = argparse.ArgumentParser()
# #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
# #     ap.add_argument("--llm",      required=True)
# #     ap.add_argument("--embedder", required=True)
# #     ap.add_argument("--module",   required=True)
# #     ap.add_argument("--year",     required=True, type=int)
# #     ap.add_argument("--month",    required=True)
# #     args = ap.parse_args()

# #     embedder = (
# #         OpenAIEmbedder(args.embedder)
# #         if args.provider == "OpenAI"
# #         else GeminiEmbedder(model_name=args.embedder)
# #     )

# #     # ✅ Pass provider to RAGGrader
# #     grader = RAGGrader(provider=args.provider, chat_model=args.llm, embedder=embedder)

# #     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
# #     grader.grade_session(args.module, args.year, args.month)
# #     print("✅ All papers graded.")

# # if __name__ == "__main__":
# #     main()


# """
# Grade ALL papers for a module / exam session.

# Example
# -------
# python -m src.scripts.mark_all_papers ^
#   --provider OpenAI ^
#   --llm gpt-4o ^
#   --embedder text-embedding-3-large ^
#   --module EE6250 ^
#   --year 2024 ^
#   --month June
# """

# import argparse
# import logging
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.grading_rag_service import RAGGrader

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# def main():
#     ap = argparse.ArgumentParser(description="Grade all student answers for a given module and session")
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
#     ap.add_argument("--llm", required=True, help="Chat model name")
#     ap.add_argument("--embedder", required=True, help="Embedding model")
#     ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
#     ap.add_argument("--year", type=int, required=True, help="Exam year")
#     ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
#     args = ap.parse_args()

#     logger.info(f"📚 Starting grading for {args.module} {args.month} {args.year} using {args.provider}")

#     # Initialize correct embedder based on provider
#     embedder = (
#         OpenAIEmbedder(args.embedder)
#         if args.provider == "OpenAI"
#         else GeminiEmbedder(model_name=args.embedder)
#     )

#     # RAGGrader uses provider to choose correct DB tables
#     grader = RAGGrader(
#         provider=args.provider,
#         chat_model=args.llm,
#         embedder=embedder
#     )

#     # Grade the entire exam session
#     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
#     grader.grade_session(args.module, args.year, args.month)
#     print("✅ All papers graded.")

# if __name__ == "__main__":
#     main()


import argparse
import logging
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service import RAGGrader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    ap = argparse.ArgumentParser(description="Grade all student answers for a given assessment")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
    ap.add_argument("--llm", required=True, help="Chat model name")
    ap.add_argument("--embedder", required=True, help="Embedding model")
    ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
    ap.add_argument("--year", type=int, required=True, help="Exam year")
    ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
    ap.add_argument("--student-indexes", nargs="+", help="Selected student indexes (registration numbers)")
    ap.add_argument("--assessment-id", required=True, help="Assessment ID for filtering")
    
    args = ap.parse_args()
    
    logger.info(f"📚 Starting assessment-specific grading for assessment {args.assessment_id}")
    logger.info(f"Module: {args.module}, Year: {args.year}, Month: {args.month}")
    logger.info(f"Provider: {args.provider}, Student indexes: {args.student_indexes}")
    
    # Initialize correct embedder based on provider
    embedder = (
        OpenAIEmbedder(args.embedder)
        if args.provider == "OpenAI"
        else GeminiEmbedder(model_name=args.embedder)
    )
    
    # RAGGrader uses provider to choose correct DB tables
    grader = RAGGrader(
        provider=args.provider,
        chat_model=args.llm,
        embedder=embedder
    )
    
    # Grade the assessment with selected students only
    print(f"⏳ Grading assessment {args.assessment_id} for selected students...")
    grader.grade_assessment(
        assessment_id=args.assessment_id,
        module_code=args.module,
        year=args.year,
        month=args.month,
        selected_students=args.student_indexes
    )
    print("✅ Assessment grading completed.")

if __name__ == "__main__":
    main()