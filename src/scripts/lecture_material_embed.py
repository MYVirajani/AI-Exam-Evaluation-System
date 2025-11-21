# src/scripts/lecture_material_embed.py

import os
import argparse
import logging

from dotenv import load_dotenv

# Import embedders
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder

# Import DB service
from src.services.database_services.lecture_material_vector_db_service import LectureMaterialVectorDBService

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def read_lecture_material(file_path: str) -> str:
    """Read lecture material content from text-like files."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext in [".txt", ".md"]:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    elif ext in [".pdf"]:
        try:
            import PyPDF2
            text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
            return ""
    else:
        logger.warning(f"Unsupported file type: {file_path}. Skipping.")
        return ""


def get_embedder(embedder_name: str):
    """Factory to return the correct embedder."""
    if embedder_name.lower() == "openai":
        return OpenAIEmbedder()
    elif embedder_name.lower() == "gemini":
        return GeminiEmbedder()
    else:
        raise ValueError(f"Unsupported embedder: {embedder_name}")


def main():
    parser = argparse.ArgumentParser(description="Embed lecture materials into vector DB")
    parser.add_argument("--embedder", required=True, help="Embedder to use: openai or gemini")
    parser.add_argument("--module_id", required=True, help="Module ID associated with the lecture materials")
    parser.add_argument("--lecturer_id", required=True, help="Lecturer ID associated with the lecture materials")
    args = parser.parse_args()

    embedder = get_embedder(args.embedder)
    db_service = LectureMaterialVectorDBService(args.embedder)

    folder_path = os.path.join("data", "Lecture_Materials")

    if not os.path.exists(folder_path):
        logger.error(f"Lecture materials folder not found: {folder_path}")
        return

    logger.info(f"Starting embedding for module {args.module_id} and lecturer {args.lecturer_id} using {args.embedder}...")

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if not os.path.isfile(file_path):
            continue

        lecture_material_id = os.path.splitext(filename)[0]
        content = read_lecture_material(file_path)

        if not content:
            logger.warning(f"No readable content found in {filename}. Skipping.")
            continue

        try:
            # For now, embed whole file as single text (can be chunked later)
            embeddings = embedder.embed([content])
            db_service.bulk_insert_embeddings(
                lecturer_id=args.lecturer_id,
                module_id=args.module_id,
                file_path=file_path,
                lecture_material_id=lecture_material_id,
                contents=[content],
                embeddings=embeddings
            )
        except Exception as e:
            logger.error(f"Failed to process {filename}: {e}")

    db_service.close()
    logger.info("✅ Embedding completed successfully.")


if __name__ == "__main__":
    main()
