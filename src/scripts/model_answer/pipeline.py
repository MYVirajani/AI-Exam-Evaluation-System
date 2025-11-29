import os
import sys
import logging

from src.services.extractors.media_extractor_service import MediaExtractorService
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.model_answer_paper_db_service import ModelAnswerPaperDB
from src.services.extractors.content_extractor_service import ContentExtractorService
from src.services.extractors.model_answer_extractor import ModelAnswerExtractor

# ---------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)


class ModelAnswerProcessor:

    def __init__(self, model_id: str):
        logger.info(f"🛠 Initializing ModelAnswerProcessor with model_id={model_id}")
        self.model_id = model_id
        self.media_extractor = MediaExtractorService()
        self.model_answer_service = ModelAnswerDBService(model_id=model_id)
        self.model_answer_paper_db = ModelAnswerPaperDB()
        self.content_extractor = ContentExtractorService()

    # -------------------------------------------------------------
    # Main Pipeline
    # -------------------------------------------------------------
    def process_model_answer(
        self,
        model_answer_paper_id: str,
        assessment_id: str,
        model_id: str,
        extract_media: bool = True 
    ):

        logger.info(f"🔍 Fetching model answer paper from DB: id={model_answer_paper_id}, assessment={assessment_id}")

        record = self.model_answer_paper_db.get_model_answer_paper(
            id=model_answer_paper_id,
            assessment_id=assessment_id
        )

        if not record:
            logger.error(f"❌ No record found for model_answer_paper_id={model_answer_paper_id}")
            return

        logger.info(f"📄 DB Record Loaded: {record}")

        original_file = record["file_url"]
        extracted_file_url = record.get("media_extracted_file_path")

        logger.info(f"📁 Original file: {original_file}")
        logger.info(f"📁 Extracted file path (if exists): {extracted_file_url}")

        # ---------------------------------------------------------
        # STEP 1 — Extract media (DOCX only)
        # ---------------------------------------------------------
        if extract_media:
            logger.info("🔧 Media extraction ENABLED")

            if original_file.lower().endswith(".docx"):

                dest_folder = os.path.join(
                    os.path.dirname(original_file),
                    "extracted_media"
                )

                logger.info(f"📤 Extracting media from DOCX → {dest_folder}")

                updated_docx, media_files = self.media_extractor.process_document(
                    file_url=original_file,
                    dest_folder=dest_folder
                )

                logger.info(f"✅ Media extracted: {len(media_files)} files")
                logger.info(f"📄 New DOCX with media replaced: {updated_docx}")

                # Save updated DOCX path
                self.model_answer_paper_db.update_media_extracted_file_url(
                    id=model_answer_paper_id,
                    new_url=updated_docx
                )

                extracted_file_url = updated_docx

            else:
                logger.info("ℹ️ Not a DOCX file → Skipping media extraction.")
                extracted_file_url = original_file

        else:
            logger.info("⏭ Media extraction DISABLED. Using existing extracted file if available.")
            extracted_file_url = extracted_file_url or original_file

        # ---------------------------------------------------------
        # STEP 2 — Extract raw text
        # ---------------------------------------------------------
        logger.info(f"📂 Checking file exists: {extracted_file_url}")

        if not os.path.exists(extracted_file_url):
            logger.error(f"❌ File not found on disk: {extracted_file_url}")
            raise FileNotFoundError(f"File not found: {extracted_file_url}")

        logger.info(f"📄 Extracting text → {extracted_file_url}")
        raw_text = self.content_extractor.extract_text(extracted_file_url)
        logger.info(f"✏️ Text extracted. Length = {len(raw_text)} chars")

        # ---------------------------------------------------------
        # STEP 3 — Extract structured Q/A
        # ---------------------------------------------------------
        logger.info("🧠 Running ModelAnswerExtractor...")

        extractor = ModelAnswerExtractor(model_id=model_id)
        results = extractor.extract(raw_text)

        if not results:
            logger.warning("⚠️ No model answers extracted from document.")
            return

        logger.info(f"📌 Total Questions Extracted: {len(results)}")

        for i, ans in enumerate(results, start=1):
            logger.info(
                f"  → Extracted Q{i}: {ans.question_number} | type={ans.question_type}"
            )

        # ---------------------------------------------------------
        # STEP 4 — Save to DB
        # ---------------------------------------------------------
        logger.info("💾 Saving extracted model answers to database...")

        db_service = ModelAnswerDBService(model_id=model_id)

        try:
            db_service.save_model_answers(
                model_answers=results,
                assessment_id=assessment_id,
                model_answer_paper_id=model_answer_paper_id
            )

            logger.info("📦 Model answers saved successfully.")

        except Exception as e:
            logger.exception("❌ Error occurred while saving model answers")
            raise e

        finally:
            logger.info("🔒 Closing DB connection...")
            db_service.close()

        logger.info("🎉 COMPLETED: Model answer processing pipeline finished successfully.")


# ---------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Process model answer papers")

    parser.add_argument("--model_answer_paper_id", required=True)
    parser.add_argument("--assessment_id", required=True)
    parser.add_argument("--model_id", required=True)

    # 🔥 DEFAULT = True (media extraction ON)
    parser.add_argument(
        "--extract_media",
        action="store_false",   # user must add this to turn OFF media extraction
        help="Disable media extraction (enabled by default)"
    )

    args = parser.parse_args()

    logger.info("🚀 Starting Model Answer Processing Pipeline...")

    processor = ModelAnswerProcessor(model_id=args.model_id)

    processor.process_model_answer(
        model_answer_paper_id=args.model_answer_paper_id,
        assessment_id=args.assessment_id,
        model_id=args.model_id,
        extract_media=args.extract_media 
    )
