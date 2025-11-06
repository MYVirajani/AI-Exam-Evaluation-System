import os
import sys
import logging
from docx import Document

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.model_answer_extractor import ModelAnswerExtractor
from src.services.database_services.model_answer_db_service import ModelAnswerDBService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper: Read DOCX content
# ---------------------------------------------------------------------------
def read_docx_text(file_path: str) -> str:
    """Reads all text (paragraphs + tables) from a DOCX file."""
    doc = Document(file_path)
    full_text = []

    # Extract paragraphs
    for para in doc.paragraphs:
        if para.text.strip():
            full_text.append(para.text.strip())

    # Extract table content
    for table in doc.tables:
        for row in table.rows:
            row_text = [cell.text.strip() for cell in row.cells]
            if any(row_text):
                full_text.append("\t".join(row_text))

    return "\n".join(full_text)


# ---------------------------------------------------------------------------
# Main Function: Extract and Save Model Answers
# ---------------------------------------------------------------------------
def extract_and_save_model_answers(
    file_path: str,
    assessment_id: str,
    model_answer_paper_id: str,
    ai_provider: str = None
):
    """
    Extract model answers using the selected AI provider and save them to
    provider/model-specific tables in the database.
    """

    if not os.path.exists(file_path):
        logger.error(f"❌ File not found: {file_path}")
        sys.exit(1)

    logger.info(f"📘 Reading DOCX file: {file_path}")
    raw_text = read_docx_text(file_path)

    # -----------------------------------------------------------------------
    # Determine AI Provider (Model/Temp will be auto-loaded from .env)
    # -----------------------------------------------------------------------
    ai_provider = (ai_provider or os.getenv("AI_PROVIDER", "openai")).strip().lower()

    logger.info(f"🚀 Initializing ModelAnswerExtractor (Provider: {ai_provider})...")

    try:
        extractor = ModelAnswerExtractor(provider=ai_provider)
    except ValueError as e:
        logger.error(f"❌ Invalid provider: {e}")
        sys.exit(1)

    # -----------------------------------------------------------------------
    # Extract Model Answers
    # -----------------------------------------------------------------------
    logger.info("🧠 Extracting structured model answers...")
    model_answers = extractor.extract(raw_text)

    if not model_answers:
        logger.warning("⚠️ No model answers extracted from the document.")
        return

    logger.info(f"✅ Extracted {len(model_answers)} model answers. Saving to database...")

    # -----------------------------------------------------------------------
    # Save to Dynamic Tables (based on provider/model from .env)
    # -----------------------------------------------------------------------
    model_name = extractor.model.lower().replace("-", "_").replace(".", "_")

    try:
        db_service = ModelAnswerDBService(ai_model=model_name)
        db_service.save_model_answers(
            model_answers=model_answers,
            assessment_id=assessment_id,
            model_answer_paper_id=model_answer_paper_id
        )
        logger.info(
            f"🎯 Successfully saved extracted data to tables "
            f"'model_answer_{model_name}' and "
            f"'model_answer_media_{model_name}'."
        )
    except Exception as e:
        logger.error(f"❌ Database operation failed: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db_service.close()


# ---------------------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(
            "Usage: python extract_and_save_model_answers.py "
            "<file_path> <assessment_id> <model_answer_paper_id> [<ai_provider>]"
        )
        sys.exit(1)

    file_path = sys.argv[1]
    assessment_id = sys.argv[2]
    model_answer_paper_id = sys.argv[3]
    ai_provider = sys.argv[4] if len(sys.argv) > 4 else None

    extract_and_save_model_answers(file_path, assessment_id, model_answer_paper_id, ai_provider)
