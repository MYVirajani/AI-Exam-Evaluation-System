#!/usr/bin/env python3
import os
import re
import logging
from dotenv import load_dotenv
from docx import Document

from src.services.database_services.lecture_material_db_service import LectureMaterialDBService
from src.services.database_services.lecture_material_vector_db_service import LectureMaterialVectorDBService
from src.services.extractors.media_extractor_service import MediaExtractorService
from src.services.summary.image_summarise_service import ImageSummarizer

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def replace_image_tags_in_docx(docx_path: str, media_items: list) -> list:
    """
    For each item in media_items (dict with keys: media_url, media_summary),
    attempt to replace occurrences of "[Image: {media_url}]" in the DOCX paragraphs and table cells.
    Returns list of media_items that were NOT matched (to be appended at end).
    """
    if not os.path.exists(docx_path):
        raise FileNotFoundError(f"DOCX not found: {docx_path}")

    doc = Document(docx_path)
    unmatched = []
    # Precompute patterns to search for exact substring occurrences
    # We'll treat media_url as literal inside the bracket
    for media in media_items:
        media['matched'] = False

    # Helper to process paragraphs (works for paragraphs and table cell paragraphs)
    def process_paragraphs(paragraphs):
        for p in paragraphs:
            text = p.text
            if not text:
                continue
            for media in media_items:
                pattern = f"[Image: {media['media_url']}]"
                if pattern in text:
                    # Replace all occurrences inside this paragraph
                    new_text = text.replace(pattern, media.get('media_summary') or "")
                    p.text = new_text
                    media['matched'] = True
                    # update text reference in case multiple media are in same paragraph
                    text = new_text

    # Process top-level paragraphs
    process_paragraphs(doc.paragraphs)

    # Process tables (cells)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                process_paragraphs(cell.paragraphs)

    # Collect unmatched media items
    for media in media_items:
        if not media.get('matched', False):
            unmatched.append(media)

    # If there are unmatched summaries, append them at the end under heading "Image Summaries"
    if unmatched:
        doc.add_page_break()
        doc.add_paragraph("Image Summaries:")
        for media in unmatched:
            summary = media.get('media_summary') or ""
            # put the media_url label and the summary
            p = doc.add_paragraph()
            p.add_run(f"{media['media_url']}: ").bold = True
            p.add_run(summary)

    # Save the updated docx back to same path (overwrite)
    doc.save(docx_path)
    return unmatched


def extract_media_for_lesson(lesson_id: str, model_id: str):
    """
    Steps:
        1. Get lecture materials for lesson_id
        2. Extract media
        3. Summarize using selected provider (model_id)
        4. Save media summary in DB with model_id = provider
        5. If media_extracted_file_url not null -> fetch media list for the lesson,
           replace [Image: media_url] tokens in extracted docx with corresponding media_summary,
           append unmatched summaries, save docx
        6. Generate embeddings for the updated docx and insert into vector DB
    """
    db = LectureMaterialDBService()
    extractor = MediaExtractorService()
    summarizer = ImageSummarizer(model_id)

    logger.info(f"🔍 Fetching lecture materials for lesson: {lesson_id}")
    lecture_materials = db.fetch_lecture_materials_by_lesson(lesson_id)

    if not lecture_materials:
        logger.warning(f"No lecture materials found for lesson {lesson_id}")
        db.close()
        return

    # Initialize vector DB service (we will use same model_id to build embedder)
    try:
        vector_service = LectureMaterialVectorDBService(model_id=model_id)
    except Exception as e:
        logger.error(f"Failed to initialize LectureMaterialVectorDBService: {e}")
        vector_service = None

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

        logger.info(f"\n📄 Processing File: {file_url} (lecture_material_id={lecture_material_id})")

        if not os.path.exists(file_url):
            logger.error(f"❌ File not found: {file_url}")
            continue

        parent_folder = os.path.dirname(file_url)
        extracted_dest = os.path.join(parent_folder, "extracted_media")

        # extract media from file (DOCX -> images extracted)
        try:
            updated_doc_path, extracted_media_paths = extractor.process_document(file_url, extracted_dest)
            logger.info(f"✅ Updated DOCX Created: {updated_doc_path}")
        except Exception as e:
            logger.error(f"❌ Failed to extract media from {file_url}: {e}")
            continue

        # ----------------------------------------------------
        # SAVE extracted media URLs + SUMMARIES into DB
        # ----------------------------------------------------
        saved_any_media = False
        if extracted_media_paths:
            logger.info(f"🖼 Saving {len(extracted_media_paths)} extracted media items...")

            for media_path in extracted_media_paths:
                try:
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

                    db.insert_media(
                        model_id=model_id,
                        lecture_material_id=lecture_material_id,
                        media_url=media_path,
                        media_summary=summary_text
                    )
                    saved_any_media = True
                    logger.info(f"   → Inserted media: {media_path}")

                except Exception as e:
                    logger.error(f"❌ Failed inserting media {media_path}: {e}")

        # ----------------------------------------------------
        # Update lecture_material.extracted_file_url (DB)
        # ----------------------------------------------------
        try:
            db.update_extracted_file_path(lecture_material_id, updated_doc_path)
            logger.info(f"📌 Updated DB: extracted_file_url = {updated_doc_path}")
        except Exception as e:
            logger.error(f"❌ Failed to update extracted_file_url: {e}")

        # ----------------------------------------------------
        # If extracted_file_url exists -> fetch media summaries for this lesson
        # and replace [Image: media_url] tokens with summaries
        # ----------------------------------------------------
        try:
            if updated_doc_path and os.path.exists(updated_doc_path):
                # fetch all lecture_material entries for this lesson with their media
                full_data = db.get_full_material_data_by_lesson_ids([lesson_id])
                # find the entry for current lecture_material_id
                current_entry = None
                for entry in full_data:
                    if str(entry["lecture_material_id"]) == str(lecture_material_id):
                        current_entry = entry
                        break

                if current_entry:
                    media_items = current_entry.get("media", [])
                    if media_items:
                        # replace tokens in the docx. This function also appends unmatched summaries.
                        unmatched = replace_image_tags_in_docx(updated_doc_path, media_items)
                        if unmatched:
                            logger.info(f"   → {len(unmatched)} media summaries appended at end for {updated_doc_path}")
                        else:
                            logger.info(f"   → All media tags replaced in {updated_doc_path}")
                    else:
                        logger.info(f"   → No media rows found for lecture_material_id={lecture_material_id}")
                else:
                    logger.warning(f"   → Could not find lecture material entry for id={lecture_material_id} in full_data")
            else:
                logger.warning(f"   → Extracted DOCX not present for lecture_material_id={lecture_material_id}")

        except Exception as e:
            logger.error(f"❌ Failed to replace image tags in docx for {lecture_material_id}: {e}")

        # ----------------------------------------------------
        # Generate embeddings for the updated docx and insert into vector DB
        # ----------------------------------------------------
        if vector_service:
            try:
                # NOTE: lecturer_id set to "unknown" — replace if you have a real lecturer id
                lecturer_id = "unknown"
                module_id = lesson_id
                logger.info(f"🔗 Generating & storing embeddings for lecture_material_id={lecture_material_id}")
                vector_service.generate_and_store_embeddings(
                    lecturer_id=lecturer_id,
                    module_id=module_id,
                    lecture_material_id=str(lecture_material_id),
                    file_path=updated_doc_path
                )
            except Exception as e:
                logger.error(f"❌ Failed to generate/store embeddings: {e}")

    # close DBs
    try:
        db.close()
    except Exception:
        pass

    if vector_service:
        try:
            vector_service.close()
        except Exception:
            pass

    logger.info("\n🎉 Media extraction + summarization + DB update + embeddings completed!\n")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract media for lecture materials of a lesson")
    parser.add_argument("--lesson_id", required=True, help="Lesson ID to extract media for")
    parser.add_argument(
        "--model_id",
        required=False,
        default="eaa81306-f9e3-4c96-901d-3b7a80a3f4ac",
        help="Evaluation model_id to use for summarizer & embedder"
    )

    args = parser.parse_args()

    extract_media_for_lesson(args.lesson_id, args.model_id)
