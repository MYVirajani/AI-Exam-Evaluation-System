"""
Extract answers from a PDF / DOCX script and store them in
the student_answers table **and** embed them (optional).

Usage (PowerShell one-liner):
python -m src.scripts.extract_student_answers `
  --provider OpenAI `
  --model gpt-4o `
  --path data/Answer_Scripts/student_answer1.pdf
"""
import argparse, pathlib, logging
from src.services.answer_extractor          import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService
from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    ap.add_argument("--model",    required=True)
    ap.add_argument("--path",     required=True,
                    help="PDF / DOCX answer script")
    ap.add_argument("--embedder", default="text-embedding-3-small")
    args = ap.parse_args()

    extractor = AnswerExtractor(args.provider, args.model)
    stu_db    = StudentAnswerService()

    # choose embedder only if you also want vector-DB storage
    embedder  = (OpenAIEmbedder(args.embedder) if args.provider=="OpenAI"
                 else GeminiEmbedder())
    vec_db    = StudentAnswerEmbeddingDB(embedder)

    raw = pathlib.Path(args.path).read_bytes()
    answers = extractor.extract_answers_with_llm(raw.decode(errors="ignore"))

    if not answers:
        log.error("Nothing extracted – aborting.")
        return

    meta = answers[0]          # they all share same meta
    stu_db.save_answers(
        meta.student_index,
        meta.module_code,
        meta.exam_year,
        meta.exam_month,
        answers
    )
    vec_db.save_embeddings(answers)
    stu_db.close(); vec_db.close()
    log.info("✅ Stored answers for %s", meta.student_index)

if __name__ == "__main__":
    main()
