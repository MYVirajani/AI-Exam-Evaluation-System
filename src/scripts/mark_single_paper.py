"""
Grade ONE student paper via the RAG pipeline.

Example (PowerShell one-liner)
--------------------------------
python -m src.scripts.mark_single_paper ^
  --provider OpenAI ^
  --llm gpt-4o ^
  --embedder text-embedding-3-small ^
  --index EG/2020/4247 ^
  --module EE6250 ^
  --year 2024 ^
  --month June
"""
import argparse
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service       import RAGGrader
from src.services.database_services.student_answer_db import StudentAnswerService

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    ap.add_argument("--llm",      required=True, help="Chat model name, e.g. gpt-4o")
    ap.add_argument("--embedder", required=True, help="Embedding model name")
    ap.add_argument("--index",    required=True, help="Student index, e.g. EG/2020/4247")
    ap.add_argument("--module",   required=True, help="Module code, e.g. EE6250")
    ap.add_argument("--year",     required=True, type=int)
    ap.add_argument("--month",    required=True)
    args = ap.parse_args()

    # pick embedder
    embedder = (OpenAIEmbedder(args.embedder)
                if args.provider == "OpenAI"
                else GeminiEmbedder(model_name=args.embedder))

    grader = RAGGrader(args.provider, args.llm, embedder)

    # fetch student answers for that paper
    sa_db = StudentAnswerService()
    answers = sa_db.get_all_answers_for_embedding(
        args.index, args.module, args.year, args.month
    )

    if not answers:
        print("❌ No student answers found for that paper.")
        return

    print(f"⏳ Grading {args.index} …")
    grader._grade_paper(          # internal helper does one paper
        args.index, args.module, args.year, args.month, answers
    )
    print("✅ Done.")

if __name__ == "__main__":
    main()
