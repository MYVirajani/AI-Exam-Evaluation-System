# src/scripts/lecture_material_embed.py

import os
import argparse
import logging
from dotenv import load_dotenv

# Embedders
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

# Vector DB service
from src.services.database_services.lecture_material_vector_db_service import (
    LectureMaterialVectorDBService,
)

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def read_lecture_material(file_path: str) -> str:
    """
    Read lecture material content from .txt, .md, or .pdf documents.
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext in [".txt", ".md"]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to read text file {file_path}: {e}")
            return ""

    elif ext == ".pdf":
        try:
            import PyPDF2

            text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"

            return text.strip()
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            return ""

    logger.warning(f"Unsupported file type: {file_path}. Skipping.")
    return ""


def load_embedder(embedder_name: str):
    """
    Load the appropriate embedding provider.
    """
    embedder_name = embedder_name.lower()

    if embedder_name == "openai":
        return OpenAIEmbedder()
    elif embedder_name == "gemini":
        return GeminiEmbedder()
    else:
        raise ValueError(f"Unsupported embedder: {embedder_name}")


def main():
    parser = argparse.ArgumentParser(description="Embed lecture materials into vector DB")

    parser.add_argument(
        "--embedder",
        required=True,
        choices=["openai", "gemini"],
        help="Embedding provider to use",
    )
    parser.add_argument("--module_id", required=True)
    parser.add_argument("--lecturer_id", required=True)
    parser.add_argument(
        "--folder",
        required=False,
        default="data/Lecture_Materials/Flow_Charts",
        help="Base lecture materials folder",
    )

    args = parser.parse_args()

    # Load embedder
    embedder = load_embedder(args.embedder)

    # Create DB service
    db_service = LectureMaterialVectorDBService(args.embedder)

    # Dynamic folder path: <base_folder>/<module_id>
    module_folder = os.path.join(args.folder)

    if not os.path.exists(module_folder):
        logger.error(f"Lecture materials folder not found: {module_folder}")
        return

    logger.info(
        f"🚀 Starting embedding for module={args.module_id}, "
        f"lecturer={args.lecturer_id} using embedder={args.embedder}"
    )

    for filename in os.listdir(module_folder):
        file_path = os.path.join(module_folder, filename)

        if not os.path.isfile(file_path):
            continue

        lecture_material_id = os.path.splitext(filename)[0]

        # Skip duplicates
        # if db_service.already_exists(args.lecturer_id, args.module_id, lecture_material_id):
        #     logger.info(f"⏭ Skipping (already embedded): {lecture_material_id}")
        #     continue

        # Extract text
        content = read_lecture_material(file_path)

        if not content.strip():
            logger.warning(f"No readable content in {filename}. Skipping.")
            continue

        # Save to DB
        try:
            db_service.save_lecture_material(
                lecturer_id=args.lecturer_id,
                module_id=args.module_id,
                lecture_material_id=lecture_material_id,
                file_path=file_path,
                full_content=content,
            )
            logger.info(f"✅ Saved embedding: {lecture_material_id}")

        except Exception as e:
            logger.error(f"❌ Failed to process {filename}: {e}", exc_info=True)

    db_service.close()
    logger.info("🎉 Embedding completed successfully.")


if __name__ == "__main__":
    main()
