import os
import sys
import logging

from src.services.extractors.media_extractor_service import MediaExtractorService
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.model_answer_paper_db_service import ModelAnswerPaperDB
from src.services.extractors.content_extractor_service import ContentExtractorService
from src.services.extractors.model_answer_extractor import ModelAnswerExtractor
from src.services.summary.image_summarise_service import ImageSummarizer

logger = logging.getLogger(__name__)


class ModelAnswerProcessor:

    def __init__(self, model_id: str):
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
        extract_media: bool = True   # 🔥 media extraction enabled by default
    ):

        logger.info(f"\n🔍 Fetching model answer paper: {model_answer_paper_id}")
        record = self.model_answer_paper_db.get_model_answer_paper(
            id=model_answer_paper_id,
            assessment_id=assessment_id
        )

        original_file = record["file_url"]
        extracted_file_url = record.get("media_extracted_file_path")

        # ---------------------------------------------------------
        # STEP 1 — Extract media (DOCX only)
        # ---------------------------------------------------------
        if extract_media:
            logger.info("\n===== STEP 1: MEDIA EXTRACTION (ENABLED BY DEFAULT) =====")

            if original_file.lower().endswith(".docx"):
                dest_folder = os.path.join(os.path.dirname(original_file), "extracted_media")

                logger.info("📤 Extracting images/equations/tables from DOCX...")

                updated_docx, media_files = self.media_extractor.process_document(
                    file_url=original_file,
                    dest_folder=dest_folder
                )

                logger.info(f"✅ Media extracted: {len(media_files)} files")
                logger.info(f"📁 Updated DOCX path: {updated_docx}")

                # Save updated file path
                self.model_answer_paper_db.update_media_extracted_file_url(
                    id=model_answer_paper_id,
                    new_url=updated_docx
                )

                extracted_file_url = updated_docx

            else:
                logger.info("ℹ️ Not a DOCX → Skipping media extraction.")
                extracted_file_url = original_file

        else:
            logger.info("ℹ️ Media extraction disabled by user override.")
            extracted_file_url = extracted_file_url or original_file

        # ---------------------------------------------------------
        # STEP 2 — Extract raw text
        # ---------------------------------------------------------
        logger.info("\n===== STEP 2: TEXT EXTRACTION =====")

        if not os.path.exists(extracted_file_url):
            raise FileNotFoundError(f"❌ File not found: {extracted_file_url}")

        logger.info(f"📄 Extracting text from file: {extracted_file_url}")
        raw_text = self.content_extractor.extract_text(extracted_file_url)

        # ---------------------------------------------------------
        # STEP 3 — Extract structured Q/A
        # ---------------------------------------------------------
        logger.info("\n===== STEP 3: RUNNING MODEL ANSWER EXTRACTOR =====")

        extractor = ModelAnswerExtractor(model_id=model_id)
        results = extractor.extract(raw_text)

        if not results:
            logger.warning("⚠️ No structured model answers extracted.")
            return

        logger.info(f"📌 Extracted {len(results)} questions from model answer paper")

        # ---------------------------------------------------------
        # STEP 4 — Save extracted model answers into DB
        # ---------------------------------------------------------
        logger.info("\n===== STEP 4: SAVING MODEL ANSWERS =====")

        db_service = ModelAnswerDBService(model_id=model_id)
        try:
            db_service.save_model_answers(
                model_answers=results,
                assessment_id=assessment_id,
                model_answer_paper_id=model_answer_paper_id
            )
        finally:
            db_service.close()

        logger.info("💾 Saved extracted questions + media to database.")

        # ---------------------------------------------------------
        # STEP 5 — Fetch media for summarization
        # ---------------------------------------------------------
        logger.info("\n===== STEP 5: FETCHING MODEL ANSWER MEDIA =====")

        media_service = ModelAnswerDBService(model_id=model_id)
        media_items = media_service.get_media_by_assessment(
            assessment_id=assessment_id,
            model_paper_id=model_answer_paper_id
        )

        logger.info(f"📸 Found {len(media_items)} media items to summarize.")

        if not media_items:
            logger.info("ℹ️ No media items found → Skipping summarization.")
            return

        # ---------------------------------------------------------
        # STEP 6 — Summarize each image and update DB
        # ---------------------------------------------------------
        logger.info("\n===== STEP 6: SUMMARIZING MODEL ANSWER IMAGES =====")

        summarizer = ImageSummarizer(model_id=self.model_id)

        for item in media_items:
            media_id = item["id"]
            image_path = item["media_url"]
            guideline_text = item.get("guideline_text")

            logger.info(f"\n🖼️ Processing Image: {image_path}")
            logger.info(f"📌 Media ID: {media_id}, Question {item['question_number']}")

            summary = summarizer.summarize_image(
                image_path=image_path,
                mode="model",
                domain="Engineering",
                guideline_text=guideline_text
            )

            if summary:
                logger.info("✅ Summary generated. Updating database...")
                success = media_service.update_media_summary(media_id, summary)

                if success:
                    logger.info("💾 DB Update Success.")
                else:
                    logger.error("❌ Failed to update DB for media summary.")

            else:
                logger.error("❌ Summary generation failed. Skipping DB update.")

        logger.info("\n🎉 SUCCESS: Model answer processing (text + media + summarization) complete.\n")


# ---------------------------------------------------------------
# CLI Entry Point
# ---------------------------------------------------------------
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Process model answer papers")
    parser.add_argument("--model_answer_paper_id", required=True)
    parser.add_argument("--assessment_id", required=True)
    parser.add_argument("--model_id", required=True)

    # 🔥 Default now TRUE — user must explicitly disable it
    parser.add_argument(
        "--extract_media",
        action="store_false",
        help="Disable media extraction (default: enabled)"
    )

    args = parser.parse_args()

    processor = ModelAnswerProcessor(model_id=args.model_id)

    processor.process_model_answer(
        model_answer_paper_id=args.model_answer_paper_id,
        assessment_id=args.assessment_id,
        model_id=args.model_id,
        extract_media=args.extract_media   
    )
