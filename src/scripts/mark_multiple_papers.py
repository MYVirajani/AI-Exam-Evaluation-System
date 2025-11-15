"""
Grade MULTIPLE student papers for a given module/session.

Example:
python -m src.scripts.mark_multiple_papers ^
  --provider OpenAI ^
  --llm gpt-4o ^
  --embedder text-embedding-3-small ^
  --module EE3350 ^
  --year 2025 ^
  --month June ^
  --students EG/2020/4001 EG/2020/4002 EG/2020/4003
"""

import argparse
import logging

from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service import RAGGrader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    ap = argparse.ArgumentParser(description="Grade MULTIPLE student papers")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek", "LocalFinetunedDeepSeek"])
    ap.add_argument("--llm", required=True)
    ap.add_argument("--embedder", required=True)
    ap.add_argument("--module", required=True)
    ap.add_argument("--year", type=int, required=True)
    ap.add_argument("--month", required=True)

    # ⬇️ IMPORTANT: MULTIPLE STUDENTS
    ap.add_argument("--students", nargs="+", required=True,
                    help="List of student index numbers EG/2020/4001 EG/2020/4002 ...")

    ap.add_argument("--ollama-url", default="http://localhost:11434")
    ap.add_argument("--timeout", type=int, default=600)

    args = ap.parse_args()

    logger.info(f"📚 Grading multiple papers for {args.module} {args.month} {args.year}")
    logger.info(f"🧑‍🎓 Students: {args.students}")

    # --------------------------
    # Select the correct embedder
    # --------------------------
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="openai")

    elif args.provider == "GoogleGemini":
        embedder = GeminiEmbedder(model_name=args.embedder)

    elif args.provider == "DeepSeek":
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="deepseek")

    elif args.provider == "LocalFinetunedDeepSeek":
        embedder = OpenAIEmbedder(model_name=args.embedder, provider_suffix="localfinetuneddeepseek")

    # --------------------------
    # Grader initialization
    # --------------------------
    grader_kwargs = {
        "provider": args.provider,
        "chat_model": args.llm,
        "embedder": embedder
    }

    if args.provider == "DeepSeek":
        grader_kwargs["ollama_base_url"] = args.ollama_url
        grader_kwargs["request_timeout"] = args.timeout
        
    elif args.provider == "LocalFinetunedDeepSeek":
        grader_kwargs["chat_model"] = args.llm  # you’ll pass your fine-tuned model path here
        logger.info(f"📂 Local fine-tuned model path: {args.llm}")

    grader = RAGGrader(**grader_kwargs)

    # --------------------------
    # MULTI-STUDENT LOOP
    # --------------------------
    for student in args.students:
        print(f"\n⏳ Grading paper for {student} …")

        try:
            grader.grade_session(
                module=args.module,
                year=args.year,
                month=args.month,
                student=student
            )
            print(f"✅ Graded successfully: {student}")

        except Exception as e:
            print(f"❌ Error grading {student}: {e}")

    print("\n🎉 All requested student papers processed.")

if __name__ == "__main__":
    main()
