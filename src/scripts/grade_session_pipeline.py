import argparse
import logging
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.grading_rag_service import RAGGrader
from src.services.database_services.student_answer_db import StudentAnswerService


def main():
    parser = argparse.ArgumentParser(description="Grade a full exam session using RAG pipeline")
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    parser.add_argument("--llm", required=True, help="Chat model name, e.g. gpt-4o")
    parser.add_argument("--embedder", required=True, help="Embedding model name")
    parser.add_argument("--module", required=True, help="Module code, e.g. EE6250")
    parser.add_argument("--year", required=True, type=int, help="Exam year")
    parser.add_argument("--month", required=True, help="Exam month")

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)
    log = logging.getLogger("GradingPipeline")

    # Choose embedder
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(args.embedder)
    else:
        embedder = GeminiEmbedder(model_name=args.embedder)

    # Initialize grader with LLM and embedder
    grader = RAGGrader(args.provider, args.llm, embedder)

    # Grade the entire session
    log.info(f"\n\n⏳ Grading all papers for {args.module} {args.month} {args.year} …")
    grader.grade_session(args.module, args.year, args.month)
    log.info("\n✅ All student papers in session graded successfully.")


if __name__ == "__main__":
    main()
