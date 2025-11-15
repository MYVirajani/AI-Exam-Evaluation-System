# """
# Grade ONE student paper via the RAG pipeline.

# Example (PowerShell one-liner)
# --------------------------------
# python -m src.scripts.mark_single_paper ^
#   --provider OpenAI ^
#   --llm gpt-4o ^
#   --embedder text-embedding-3-small ^
#   --index EG/2020/4247 ^
#   --module EE6250 ^
#   --year 2024 ^
#   --month June
# """
# import argparse
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.grading_rag_service       import RAGGrader
# from src.services.database_services.student_answer_db import StudentAnswerService

# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
#     ap.add_argument("--llm",      required=True, help="Chat model name, e.g. gpt-4o")
#     ap.add_argument("--embedder", required=True, help="Embedding model name")
#     ap.add_argument("--index",    required=True, help="Student index, e.g. EG/2020/4247")
#     ap.add_argument("--module",   required=True, help="Module code, e.g. EE6250")
#     ap.add_argument("--year",     required=True, type=int)
#     ap.add_argument("--month",    required=True)
#     args = ap.parse_args()

#     # pick embedder
#     embedder = (OpenAIEmbedder(args.embedder)
#                 if args.provider == "OpenAI"
#                 else GeminiEmbedder(model_name=args.embedder))

#     grader = RAGGrader(args.provider, args.llm, embedder)

#     # fetch student answers for that paper
#     sa_db = StudentAnswerService()
#     answers = sa_db.get_all_answers_for_embedding(
#         args.index, args.module, args.year, args.month
#     )

#     if not answers:
#         print("No student answers found for that paper.")
#         return

#     print(f"⏳ Grading {args.index} …")
#     grader._grade_paper(          # internal helper does one paper
#         args.index, args.module, args.year, args.month, answers
#     )
#     print("Done.")

# if __name__ == "__main__":
#     main()


# """
# Grade a single paper for a module / exam session.

# Example:
# ---------
# python -m src.scripts.mark_single_paper ^
#   --provider OpenAI ^
#   --llm gpt-4o ^
#   --embedder text-embedding-3-small ^
#   --module EE3350 ^
#   --year 2025 ^
#   --month June ^
#   --student EG/2020/4001
# """

# import argparse
# import logging
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.grading_rag_service import RAGGrader

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# def main():
#     ap = argparse.ArgumentParser(description="Grade a single student paper for a given session")
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
#     ap.add_argument("--llm", required=True, help="Chat model name")
#     ap.add_argument("--embedder", required=True, help="Embedding model name")
#     ap.add_argument("--module", required=True, help="Module code (e.g. EE3350)")
#     ap.add_argument("--year", type=int, required=True, help="Exam year")
#     ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
#     ap.add_argument("--student", required=True, help="Student index (e.g. EG/2020/4001)")
#     args = ap.parse_args()

#     logger.info(f"📚 Grading single paper for {args.student} in {args.module} {args.month} {args.year} using {args.provider}")

#     # Initialize embedder
#     embedder = (
#         OpenAIEmbedder(args.embedder)
#         if args.provider == "OpenAI"
#         else GeminiEmbedder(model_name=args.embedder)
#     )

#     # RAGGrader handles retrieval, LLM, scoring, and DB saving
#     grader = RAGGrader(
#         provider=args.provider,
#         chat_model=args.llm,
#         embedder=embedder
#     )

#     # Grade only this student's paper
#     grader.grade_session(
#         module=args.module,
#         year=args.year,
#         month=args.month,
#         student=args.student
#     )

#     print("✅ Single paper graded.")

# if __name__ == "__main__":
#     main()

"""
Grade a single paper for a module / exam session.

Example
-------
# OpenAI
python -m src.scripts.mark_single_paper ^
  --provider OpenAI ^
  --llm gpt-4o ^
  --embedder text-embedding-3-small ^
  --module EE3350 ^
  --year 2025 ^
  --month June ^
  --student EG/2020/4001

# Google Gemini
python -m src.scripts.mark_single_paper ^
  --provider GoogleGemini ^
  --llm gemini-1.5-pro ^
  --embedder text-embedding-004 ^
  --module EE3350 ^
  --year 2025 ^
  --month June ^
  --student EG/2020/4001

# DeepSeek
python -m src.scripts.mark_single_paper ^
  --provider DeepSeek ^
  --llm deepseek-r1:7b ^
  --embedder text-embedding-3-small ^
  --module EE3350 ^
  --year 2025 ^
  --month June ^
  --student EG/2020/4001 ^
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
    ap = argparse.ArgumentParser(description="Grade a single student paper for a given module and session")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek", "LocalFinetunedDeepSeek"],
                    help="LLM provider")
    ap.add_argument("--llm", required=True, help="Chat model name")
    ap.add_argument("--embedder", required=True,
                    help="Embedding model (for DeepSeek, use OpenAI embedding model)")
    ap.add_argument("--module", required=True, help="Module code (e.g. EE3350)")
    ap.add_argument("--year", type=int, required=True, help="Exam year")
    ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
    ap.add_argument("--student", required=True, help="Student index (e.g. EG/2020/4001)")
    ap.add_argument("--ollama-url", default="http://localhost:11434",
                    help="Ollama base URL (for DeepSeek only)")
    ap.add_argument("--timeout", type=int, default=600,
                    help="Request timeout in seconds (for DeepSeek only)")
    args = ap.parse_args()

    logger.info(f"📚 Grading single paper for {args.student} in {args.module} {args.month} {args.year} using {args.provider}")

    # Initialize correct embedder based on provider
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="openai")
        logger.info(f"Using OpenAI embeddings: {args.embedder}")

    elif args.provider == "GoogleGemini":
        embedder = GeminiEmbedder(model_name=args.embedder)
        logger.info(f"Using Gemini embeddings: {args.embedder}")

    elif args.provider == "DeepSeek":
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="deepseek")
        logger.info(f"🔧 DeepSeek using OpenAI embeddings ({args.embedder}) with 'deepseek' table suffix")
    
    elif args.provider == "LocalFinetunedDeepSeek":
        # Use OpenAI embedding model but a separate DB suffix for clarity
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="localfinetuneddeepseek")
        logger.info(f"🧠 Using Local Fine-Tuned DeepSeek model with embeddings: {args.embedder}")

    else:
        raise ValueError(f"Unsupported provider: {args.provider}")

    # Initialize grader with provider-specific options
    grader_kwargs = {
        "provider": args.provider,
        "chat_model": args.llm,
        "embedder": embedder
    }

    if args.provider == "DeepSeek":
        grader_kwargs["ollama_base_url"] = args.ollama_url
        grader_kwargs["request_timeout"] = args.timeout
        logger.info(f"🌐 Ollama URL: {args.ollama_url}")
        logger.info(f"⏱️ Timeout: {args.timeout}s")
        
    elif args.provider == "LocalFinetunedDeepSeek":
        grader_kwargs["chat_model"] = args.llm  # you’ll pass your fine-tuned model path here
        logger.info(f"📂 Local fine-tuned model path: {args.llm}")

    grader = RAGGrader(**grader_kwargs)

    # Grade only this student's paper
    print(f"⏳ Grading single paper: {args.student} for {args.module} {args.month} {args.year} …")
    if args.provider == "DeepSeek":
        print("⚠️  Note: DeepSeek grading may take longer due to its reasoning process")

    grader.grade_session(
        module=args.module,
        year=args.year,
        month=args.month,
        student=args.student
    )

    print(f"✅ Paper graded successfully for {args.student} ({args.module} {args.month} {args.year}).")

if __name__ == "__main__":
    main()
