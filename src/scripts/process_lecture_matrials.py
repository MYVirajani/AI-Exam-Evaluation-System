import os
import logging
from dotenv import load_dotenv

from src.services.database_services.lecture_material_db_service import LectureMaterialDBService
from src.services.extractors.media_extractor_service import MediaExtractorService
from src.services.summary.image_summarise_service import ImageSummarizer

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_media_for_lesson(lesson_id: str, model_id: str):
    """
    Steps:
        1. Get lecture materials for lesson_id
        2. Extract media
        3. Summarize using selected provider (openai/gemini)
        4. Save media summary in DB with model_id = provider
    """

    db = LectureMaterialDBService()
    extractor = MediaExtractorService()

    # Initialize summarizer with provider from command argument
    summarizer = ImageSummarizer(model_id)

    logger.info(f"🔍 Fetching lecture materials for lesson: {lesson_id}")
    lecture_materials = db.fetch_lecture_materials_by_lesson(lesson_id)

    if not lecture_materials:
        logger.warning(f"No lecture materials found for lesson {lesson_id}")
        return

    for material in lecture_materials:
        (
            lecture_material_id,
            lesson_id,
            file_name,
            file_url,
            extracted_file_url,
            created_on,
            updated_on,
            description
        ) = material

        logger.info(f"\n📄 Processing File: {file_url}")

        if not os.path.exists(file_url):
            logger.error(f"❌ File not found: {file_url}")
            continue

        parent_folder = os.path.dirname(file_url)
        extracted_dest = os.path.join(parent_folder, "extracted_media")

        # extract media from file
        updated_doc_path, extracted_media_paths = extractor.process_document(file_url, extracted_dest)
        logger.info(f"✅ Updated DOCX Created: {updated_doc_path}")

        # ----------------------------------------------------
        # SAVE extracted media URLs + SUMMARIES into DB
        # ----------------------------------------------------
        if extracted_media_paths:
            logger.info(f"🖼 Saving {len(extracted_media_paths)} extracted media items...")

            for media_path in extracted_media_paths:
                try:
                    # -------- LLM SUMMARY GENERATION ----------
                    logger.info(f"🤖 Summarizing media: {media_path}")
                    summary_text = summarizer.summarize_image(
                        image_path=media_path,
                        mode="model",
                        domain="Engineering"
                    )

                    if summary_text:
                        logger.info("   → Summary generated successfully")
                    else:
                        logger.warning("   → No summary generated")
                        summary_text = None

                    print("media_summary:", summary_text)

                    # -------- DATABASE INSERTION (SAVE model_id = provider) --------
                    db.insert_media(
                        model_id=model_id,  
                        lecture_material_id=lecture_material_id,
                        media_url=media_path,
                        media_summary=summary_text
                    )

                    logger.info(f"   → Inserted media: {media_path}")

                except Exception as e:
                    logger.error(f"❌ Failed inserting media {media_path}: {e}")

        # ----------------------------------------------------
        # Update lecture_material.extracted_file_url
        # ----------------------------------------------------
        try:
            db.update_extracted_file_path(lecture_material_id, updated_doc_path)
            logger.info(f"📌 Updated DB: extracted_file_url = {updated_doc_path}")
        except Exception as e:
            logger.error(f"❌ Failed to update extracted_file_url: {e}")

    db.close()
    logger.info("\n🎉 Media extraction + summarization + DB update completed successfully!\n")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract media for lecture materials of a lesson")
    parser.add_argument("--lesson_id", required=True, help="Lesson ID to extract media for")
    parser.add_argument(
        "--model_id",
        required=False,
        default="eaa81306-f9e3-4c96-901d-3b7a80a3f4ac"
    )

    args = parser.parse_args()

    extract_media_for_lesson(args.lesson_id, args.model_id)
