"""
Run RAG grading.

• One paper:
  python -m src.scripts.run_rag_grading --provider OpenAI --llm gpt-4o \
         --embedder text-embedding-3-small --module EE6250 --year 2025 \
         --month June --student EG/2020/4247

• Whole exam session:
  python -m src.scripts.run_rag_grading --provider OpenAI --llm gpt-4o \
         --embedder text-embedding-3-small --module EE6250 --year 2025 \
         --month June --all
"""
import argparse
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service      import RAGGrader

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    ap.add_argument("--llm",      required=True)
    ap.add_argument("--embedder", required=True)
    ap.add_argument("--module",   required=True)
    ap.add_argument("--year",     required=True, type=int)
    ap.add_argument("--month",    required=True)
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--student", help="grade one student paper")
    group.add_argument("--all", action="store_true", help="grade whole session")
    args = ap.parse_args()

    embedder = (OpenAIEmbedder(args.embedder)
                if args.provider == "OpenAI"
                else GeminiEmbedder(model_name=args.embedder))

    grader = RAGGrader(args.provider, args.llm, embedder)
    grader.grade_session(args.module, args.year, args.month,
                         student=args.student if not args.all else None)

if __name__ == "__main__":
    main()
