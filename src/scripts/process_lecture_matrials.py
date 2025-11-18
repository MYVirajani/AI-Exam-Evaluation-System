import os
import logging
from dotenv import load_dotenv

from src.services.database_services.lecture_material_db_service import LectureMaterialDBService
from src.services.extractors.media_extractor_service import MediaExtractorService

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_media_for_lesson(lesson_id: str):
    """
    Steps:
        1. Get all lecture materials for the lesson_id
        2. Extract media from each file (images/tables/equations → LaTeX)
        3. Save extracted media into extracted_media folder
        4. Insert extracted media entries into lecture_material_media table
        5. Update extracted_file_url in lecture_material table
    """

    db = LectureMaterialDBService()
    extractor = MediaExtractorService()

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

        # Destination folder for extracted media
        parent_folder = os.path.dirname(file_url)
        extracted_dest = os.path.join(parent_folder, "extracted_media")

        # Extract media + generate updated docx → returns media_paths also
        updated_doc_path, extracted_media_paths = extractor.process_document(file_url, extracted_dest)

        logger.info(f"✅ Updated DOCX Created: {updated_doc_path}")

        # ----------------------------------------------------
        # SAVE extracted media URLs into lecture_material_media table
        # ----------------------------------------------------
        if extracted_media_paths:
            logger.info(f"🖼 Saving {len(extracted_media_paths)} extracted media items...")

            for media_path in extracted_media_paths:
                try:
                    db.insert_media(
                        model_id=None,                     # must be null
                        lecture_material_id=lecture_material_id,
                        media_url=media_path
                    )
                    logger.info(f"   → Inserted media: {media_path}")

                except Exception as e:
                    logger.error(f"❌ Failed inserting media {media_path}: {e}")

        # ----------------------------------------------------
        # Update lecture_material extracted_file_url
        # ----------------------------------------------------
        db.update_extracted_file_path(lecture_material_id, updated_doc_path)
        logger.info(f"📌 Updated DB: extracted_file_url = {updated_doc_path}")

    db.close()
    logger.info("\n🎉 Media extraction + DB update completed successfully!\n")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract media for lecture materials of a lesson")
    parser.add_argument("--lesson_id", required=True, help="Lesson ID to extract media for")

    args = parser.parse_args()

    extract_media_for_lesson(args.lesson_id)
