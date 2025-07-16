"""
Grade ALL papers for a module / exam session.

Example
-------
python -m src.scripts.mark_all_papers ^
  --provider OpenAI ^
  --llm gpt-4o ^
  --embedder text-embedding-3-small ^
  --module EE6250 ^
  --year 2024 ^
  --month June
"""
import argparse
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service       import RAGGrader

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    ap.add_argument("--llm",      required=True)
    ap.add_argument("--embedder", required=True)
    ap.add_argument("--module",   required=True)
    ap.add_argument("--year",     required=True, type=int)
    ap.add_argument("--month",    required=True)
    args = ap.parse_args()

    embedder = (OpenAIEmbedder(args.embedder)
                if args.provider == "OpenAI"
                else GeminiEmbedder(model_name=args.embedder))

    grader = RAGGrader(args.provider, args.llm, embedder)
    print(f"⏳ Grading all papers for {args.module} {args.month} {args.year} …")
    grader.grade_session(args.module, args.year, args.month)
    print("✅ All papers graded.")

if __name__ == "__main__":
    main()
