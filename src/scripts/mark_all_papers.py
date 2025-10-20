


# # # # # """
# # # # # Grade ALL papers for a module / exam session.

# # # # # Example
# # # # # -------
# # # # # python -m src.scripts.mark_all_papers ^
# # # # #   --provider OpenAI ^
# # # # #   --llm gpt-4o ^
# # # # #   --embedder text-embedding-3-small ^
# # # # #   --module EE6250 ^
# # # # #   --year 2024 ^
# # # # #   --month June
# # # # # """

# # # # # import argparse
# # # # # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # # # # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # # # # from src.services.grading_rag_service       import RAGGrader

# # # # # def main():
# # # # #     ap = argparse.ArgumentParser()
# # # # #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
# # # # #     ap.add_argument("--llm",      required=True)
# # # # #     ap.add_argument("--embedder", required=True)
# # # # #     ap.add_argument("--module",   required=True)
# # # # #     ap.add_argument("--year",     required=True, type=int)
# # # # #     ap.add_argument("--month",    required=True)
# # # # #     args = ap.parse_args()

# # # # #     embedder = (
# # # # #         OpenAIEmbedder(args.embedder)
# # # # #         if args.provider == "OpenAI"
# # # # #         else GeminiEmbedder(model_name=args.embedder)
# # # # #     )

# # # # #     # ✅ Pass provider to RAGGrader
# # # # #     grader = RAGGrader(provider=args.provider, chat_model=args.llm, embedder=embedder)

# # # # #     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
# # # # #     grader.grade_session(args.module, args.year, args.month)
# # # # #     print("✅ All papers graded.")

# # # # # if __name__ == "__main__":
# # # # #     main()


# # # # """
# # # # Grade ALL papers for a module / exam session.

# # # # Example
# # # # -------
# # # # python -m src.scripts.mark_all_papers ^
# # # #   --provider OpenAI ^
# # # #   --llm gpt-4o ^
# # # #   --embedder text-embedding-3-small ^
# # # #   --module EE6250 ^
# # # #   --year 2024 ^
# # # #   --month June
# # # # """

# # # # import argparse
# # # # import logging
# # # # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # # # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # # # from src.services.grading_rag_service import RAGGrader

# # # # logging.basicConfig(level=logging.INFO)
# # # # logger = logging.getLogger(__name__)

# # # # def main():
# # # #     ap = argparse.ArgumentParser(description="Grade all student answers for a given module and session")
# # # #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
# # # #     ap.add_argument("--llm", required=True, help="Chat model name")
# # # #     ap.add_argument("--embedder", required=True, help="Embedding model")
# # # #     ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
# # # #     ap.add_argument("--year", type=int, required=True, help="Exam year")
# # # #     ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
# # # #     args = ap.parse_args()

# # # #     logger.info(f"📚 Starting grading for {args.module} {args.month} {args.year} using {args.provider}")

# # # #     # Initialize correct embedder based on provider
# # # #     embedder = (
# # # #         OpenAIEmbedder(args.embedder)
# # # #         if args.provider == "OpenAI"
# # # #         else GeminiEmbedder(model_name=args.embedder)
# # # #     )

# # # #     # RAGGrader uses provider to choose correct DB tables
# # # #     grader = RAGGrader(
# # # #         provider=args.provider,
# # # #         chat_model=args.llm,
# # # #         embedder=embedder
# # # #     )

# # # #     # Grade the entire exam session
# # # #     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
# # # #     grader.grade_session(args.module, args.year, args.month)
# # # #     print("✅ All papers graded.")

# # # # if __name__ == "__main__":
# # # #     main()


# # # """
# # # Grade ALL papers for a module / exam session.

# # # Example
# # # -------
# # # python -m src.scripts.mark_all_papers ^
# # #   --provider OpenAI ^
# # #   --llm gpt-4o ^
# # #   --embedder text-embedding-3-small ^
# # #   --module EE3350 ^
# # #   --year 2025 ^
# # #   --month June

# # # Supports DeepSeek locally without passing Ollama URL explicitly.
# # # """

# # # import argparse
# # # import logging
# # # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # # from src.services.grading_rag_service import RAGGrader

# # # logging.basicConfig(level=logging.INFO)
# # # logger = logging.getLogger(__name__)

# # # def main():
# # #     ap = argparse.ArgumentParser(description="Grade all student answers for a given module and session")
# # #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], help="LLM provider")
# # #     ap.add_argument("--llm", required=True, help="Chat model name")
# # #     ap.add_argument("--embedder", required=True, help="Embedding model")
# # #     ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
# # #     ap.add_argument("--year", type=int, required=True, help="Exam year")
# # #     ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
# # #     args = ap.parse_args()

# # #     logger.info(f"📚 Starting grading for {args.module} {args.month} {args.year} using {args.provider}")

# # #     # Initialize embedding model
# # #     # DeepSeek uses OpenAI embeddings internally, no special embedder needed
# # #     embedder = (
# # #         OpenAIEmbedder(args.embedder)
# # #         if args.provider in ["OpenAI", "DeepSeek"]
# # #         else GeminiEmbedder(model_name=args.embedder)
# # #     )

# # #     # Initialize RAGGrader (supports DeepSeek locally)
# # #     grader = RAGGrader(
# # #         provider=args.provider,
# # #         chat_model=args.llm,
# # #         embedder=embedder
# # #     )

# # #     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
# # #     grader.grade_session(args.module, args.year, args.month)
# # #     print("✅ All papers graded.")

# # # if __name__ == "__main__":
# # #     main()


# # """
# # Grade ALL papers for a module / exam session.

# # Example
# # -------
# # python -m src.scripts.mark_all_papers ^
# #   --provider OpenAI ^
# #   --llm gpt-4o ^
# #   --embedder text-embedding-3-small ^
# #   --module EE3350 ^
# #   --year 2025 ^
# #   --month June

# # Supports DeepSeek locally without passing Ollama URL explicitly.
# # """

# # import argparse
# # import logging
# # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # from src.services.grading_rag_service import RAGGrader

# # logging.basicConfig(level=logging.INFO)
# # logger = logging.getLogger(__name__)

# # def main():
# #     ap = argparse.ArgumentParser(description="Grade all student answers for a given module and session")
# #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], help="LLM provider")
# #     ap.add_argument("--llm", required=True, help="Chat model name")
# #     ap.add_argument("--embedder", required=True, help="Embedding model")
# #     ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
# #     ap.add_argument("--year", type=int, required=True, help="Exam year")
# #     ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
# #     args = ap.parse_args()

# #     logger.info(f"📚 Starting grading for {args.module} {args.month} {args.year} using {args.provider}")

# #     # Initialize embedding model
# #     # DeepSeek uses OpenAI embeddings internally, but we suffix tables with "deepseek"
# #     embedder = (
# #         OpenAIEmbedder(args.embedder)
# #         if args.provider in ["OpenAI", "DeepSeek"]
# #         else GeminiEmbedder(model_name=args.embedder)
# #     )

# #     # Initialize RAGGrader
# #     grader = RAGGrader(
# #         provider=args.provider,
# #         llm_model=args.llm,   # ✅ updated argument name
# #         embedder=embedder,
# #         module=args.module,
# #         year=args.year,
# #         month=args.month
# #     )

# #     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
# #     grader.grade_session(args.module, args.year, args.month)
# #     print("✅ All papers graded.")

# # if __name__ == "__main__":
# #     main()

# """
# Grade ALL papers for a module / exam session.

# Example
# -------
# # OpenAI
# python -m src.scripts.mark_all_papers ^
#   --provider OpenAI ^
#   --llm gpt-4o ^
#   --embedder text-embedding-3-small ^
#   --module EE6250 ^
#   --year 2024 ^
#   --month June

# # Google Gemini
# python -m src.scripts.mark_all_papers ^
#   --provider GoogleGemini ^
#   --llm gemini-1.5-pro ^
#   --embedder text-embedding-004 ^
#   --module EE6250 ^
#   --year 2024 ^
#   --month June

# # DeepSeek
# python -m src.scripts.mark_all_papers ^
#   --provider DeepSeek ^
#   --llm deepseek-r1:latest ^
#   --embedder text-embedding-3-small ^
#   --module EE6250 ^
#   --year 2024 ^
#   --month June ^
#   --ollama-url http://localhost:11434 ^
#   --timeout 600
# """

# import argparse
# import logging
# import logging
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.grading_rag_service import RAGGrader

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)
# from src.services.grading_rag_service import RAGGrader

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# def main():
#     ap = argparse.ArgumentParser(description="Grade all student answers for a given module and session")
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], 
#                     help="LLM provider")
#     ap.add_argument("--llm", required=True, help="Chat model name")
#     ap.add_argument("--embedder", required=True, 
#                     help="Embedding model (for DeepSeek, use OpenAI embedding model)")
#     ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
#     ap.add_argument("--year", type=int, required=True, help="Exam year")
#     ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
#     ap.add_argument("--ollama-url", default="http://localhost:11434", 
#                     help="Ollama base URL (for DeepSeek only)")
#     ap.add_argument("--timeout", type=int, default=600, 
#                     help="Request timeout in seconds (for DeepSeek only)")
#     args = ap.parse_args()

#     logger.info(f"📚 Starting grading for {args.module} {args.month} {args.year} using {args.provider}")

#     # Initialize correct embedder based on provider
#     if args.provider == "OpenAI":
#         embedder = OpenAIEmbedder(args.embedder)
#     elif args.provider == "GoogleGemini":
#         embedder = GeminiEmbedder(model_name=args.embedder)
#     elif args.provider == "DeepSeek":
#         # DeepSeek uses OpenAI embeddings but with DeepSeek suffix
#         embedder = OpenAIEmbedder(args.embedder, provider_suffix="deepseek")
#         logger.info(f"🔧 DeepSeek will use OpenAI embeddings ({args.embedder}) with 'deepseek' table suffix")
#     else:
#         raise ValueError(f"Unsupported provider: {args.provider}")

#     # RAGGrader uses provider to choose correct DB tables and LLM
#     grader_kwargs = {
#         "provider": args.provider,
#         "chat_model": args.llm,
#         "embedder": embedder
#     }
    
#     # Add DeepSeek-specific parameters
#     if args.provider == "DeepSeek":
#         grader_kwargs["ollama_base_url"] = args.ollama_url
#         grader_kwargs["request_timeout"] = args.timeout
#         logger.info(f"🌐 Ollama URL: {args.ollama_url}")
#         logger.info(f"⏱️  Timeout: {args.timeout}s")

#     grader = RAGGrader(**grader_kwargs)

#     # Grade the entire exam session
#     print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
#     if args.provider == "DeepSeek":
#         print("⚠️  Note: DeepSeek grading may take longer due to its reasoning process")
    
#     grader.grade_session(args.module, args.year, args.month)
#     print("✅ All papers graded.")

# if __name__ == "__main__":
#     main()

"""
Grade ALL papers for a module / exam session.

Example
-------
# OpenAI
python -m src.scripts.mark_all_papers ^
  --provider OpenAI ^
  --llm gpt-4o ^
  --embedder text-embedding-3-small ^
  --module EE6250 ^
  --year 2024 ^
  --month June

# Google Gemini
python -m src.scripts.mark_all_papers ^
  --provider GoogleGemini ^
  --llm gemini-1.5-pro ^
  --embedder text-embedding-004 ^
  --module EE6250 ^
  --year 2024 ^
  --month June

# DeepSeek
python -m src.scripts.mark_all_papers ^
  --provider DeepSeek ^
  --llm deepseek-R1:7b ^
  --embedder text-embedding-3-small ^
  --module EE6250 ^
  --year 2024 ^
  --month June ^
  --ollama-url http://localhost:11434 ^
  --timeout 600
"""

import argparse
import logging
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service import RAGGrader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    ap = argparse.ArgumentParser(description="Grade all student answers for a given module and session")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], 
                    help="LLM provider")
    ap.add_argument("--llm", required=True, help="Chat model name")
    ap.add_argument("--embedder", required=True, 
                    help="Embedding model (for DeepSeek, use OpenAI embedding model)")
    ap.add_argument("--module", required=True, help="Module code (e.g. EE6250)")
    ap.add_argument("--year", type=int, required=True, help="Exam year")
    ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
    ap.add_argument("--ollama-url", default="http://localhost:11434", 
                    help="Ollama base URL (for DeepSeek only)")
    ap.add_argument("--timeout", type=int, default=600, 
                    help="Request timeout in seconds (for DeepSeek only)")
    args = ap.parse_args()
    
    logger.info(f"📚 Starting assessment-specific grading for assessment {args.assessment_id}")
    logger.info(f"Module: {args.module}, Year: {args.year}, Month: {args.month}")
    logger.info(f"Provider: {args.provider}, Student indexes: {args.student_indexes}")
    
    # Initialize correct embedder based on provider
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="openai")
        logger.info(f"Using OpenAI embeddings: {args.embedder}")
        
    elif args.provider == "GoogleGemini":
        embedder = GeminiEmbedder(model_name=args.embedder)
        logger.info(f"Using Gemini embeddings: {args.embedder}")
        
    elif args.provider == "DeepSeek":
        # DeepSeek uses OpenAI embeddings but with DeepSeek suffix for tables
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="deepseek")
        logger.info(f"🔧 DeepSeek using OpenAI embeddings ({args.embedder}) with 'deepseek' table suffix")
        
    else:
        raise ValueError(f"Unsupported provider: {args.provider}")

    # RAGGrader uses provider to choose correct DB tables and LLM
    grader_kwargs = {
        "provider": args.provider,
        "chat_model": args.llm,
        "embedder": embedder
    }
    
    # Add DeepSeek-specific parameters
    if args.provider == "DeepSeek":
        grader_kwargs["ollama_base_url"] = args.ollama_url
        grader_kwargs["request_timeout"] = args.timeout
        logger.info(f"🌐 Ollama URL: {args.ollama_url}")
        logger.info(f"⏱️  Timeout: {args.timeout}s")

    grader = RAGGrader(**grader_kwargs)

    # Grade the entire exam session
    print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
    if args.provider == "DeepSeek":
        print("⚠️  Note: DeepSeek grading may take longer due to its reasoning process")
    
    grader.grade_session(args.module, args.year, args.month)
    print("✅ All papers graded.")

if __name__ == "__main__":
    main()