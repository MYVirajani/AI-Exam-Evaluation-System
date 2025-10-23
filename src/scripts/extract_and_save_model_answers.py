import os
import sys
import logging
from docx import Document

# Local imports
from src.services.model_answer_extractor import ModelAnswerExtractor
from src.services.database_services.model_answer_db_service import ModelAnswerDBService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def read_docx_text(file_path: str) -> str:
    """Reads all text from a DOCX file, including paragraphs and table content."""
    doc = Document(file_path)
    full_text = []

    # Extract paragraphs
    for para in doc.paragraphs:
        if para.text.strip():
            full_text.append(para.text.strip())

    # Extract table content
    for table in doc.tables:
        table_text = []
        for row in table.rows:
            row_text = [cell.text.strip() for cell in row.cells]
            table_text.append("\t".join(row_text))
        full_text.append("\n".join(table_text))

    return "\n".join(full_text)


def extract_and_save_model_answers(file_path: str, assessment_id: str, model_answer_paper_id: str):
    """Extract model answers using LLM and save them to the database."""
    if not os.path.exists(file_path):
        logger.error(f"❌ File not found: {file_path}")
        sys.exit(1)

    logger.info(f"📘 Reading DOCX file: {file_path}")
    raw_text = read_docx_text(file_path)

    logger.info("🚀 Initializing ModelAnswerExtractor (OpenAI gpt-4o-mini)...")
    extractor = ModelAnswerExtractor(selected_provider="OpenAI", selected_model="gpt-4o-mini")

    logger.info("🧠 Extracting structured model answers...")
    model_answers = extractor.extract(raw_text)

    if not model_answers:
        logger.warning("⚠️ No model answers extracted.")
        return

    logger.info(f"✅ Extracted {len(model_answers)} model answers. Saving to database...")

    db_service = ModelAnswerDBService()
    db_service.save_model_answers(
        model_answers=model_answers,
        assessment_id=assessment_id,
        model_answer_paper_id=model_answer_paper_id
    )
    db_service.close()

    logger.info("🎯 All model answers and media saved successfully!")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python extract_and_save_model_answers.py <file_path> <assessment_id> <model_answer_paper_id>")
        sys.exit(1)

    file_path = sys.argv[1]
    assessment_id = sys.argv[2]
    model_answer_paper_id = sys.argv[3]

    extract_and_save_model_answers(file_path, assessment_id, model_answer_paper_id)
