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


"""
Grade a single paper for a module / exam session.

Example:
---------
python -m src.scripts.mark_single_paper ^
  --provider OpenAI ^
  --llm gpt-4o ^
  --embedder text-embedding-3-small ^
  --module EE3350 ^
  --year 2025 ^
  --month June ^
  --student EG/2020/4001
"""

import argparse
import logging
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service import RAGGrader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    ap = argparse.ArgumentParser(description="Grade a single student paper for a given session")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
    ap.add_argument("--llm", required=True, help="Chat model name")
    ap.add_argument("--embedder", required=True, help="Embedding model name")
    ap.add_argument("--module", required=True, help="Module code (e.g. EE3350)")
    ap.add_argument("--year", type=int, required=True, help="Exam year")
    ap.add_argument("--month", required=True, help="Exam month (e.g. June)")
    ap.add_argument("--student", required=True, help="Student index (e.g. EG/2020/4001)")
    args = ap.parse_args()

    logger.info(f"📚 Grading single paper for {args.student} in {args.module} {args.month} {args.year} using {args.provider}")

    # Initialize embedder
    embedder = (
        OpenAIEmbedder(args.embedder)
        if args.provider == "OpenAI"
        else GeminiEmbedder(model_name=args.embedder)
    )

    # RAGGrader handles retrieval, LLM, scoring, and DB saving
    grader = RAGGrader(
        provider=args.provider,
        chat_model=args.llm,
        embedder=embedder
    )

    # Grade only this student's paper
    grader.grade_session(
        module=args.module,
        year=args.year,
        month=args.month,
        student=args.student
    )

    print("✅ Single paper graded.")

if __name__ == "__main__":
    main()
