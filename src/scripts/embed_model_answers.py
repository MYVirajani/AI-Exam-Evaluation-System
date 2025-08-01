

# import argparse
# import logging
# import pathlib
# from typing import Iterable
# from docx import Document
# import pdfplumber
# from rich import print

# from src.services.model_answer_extractor import ModelAnswerExtractor
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# def read_text(path: pathlib.Path) -> str:
#     if path.suffix.lower() == ".docx":
#         doc = Document(path)
#         return "\n".join(p.text for p in doc.paragraphs)
#     elif path.suffix.lower() == ".pdf":
#         with pdfplumber.open(path) as pdf:
#             return "\n".join(p.extract_text() or "" for p in pdf.pages)
#     raise ValueError(f"Unsupported file type: {path.name}")

# def iter_files(root: pathlib.Path, patterns: Iterable[str]) -> Iterable[pathlib.Path]:
#     for file in root.rglob("*"):
#         if file.suffix.lower() in patterns and file.is_file():
#             yield file

# def main() -> None:
#     ap = argparse.ArgumentParser(description="Extract & embed model answers")
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
#     ap.add_argument("--model", required=True, help="LLM model name (e.g. gpt-4o, gemini-1.5-pro)")
#     ap.add_argument("--embedder", default="text-embedding-3-small", help="Embedding model name")
#     ap.add_argument("--root", default="data/Model_Answers", help="Root folder of model answers")
#     ap.add_argument("--ext", nargs="*", default=[".pdf", ".docx"], help="File extensions (default: .pdf .docx)")
#     args = ap.parse_args()

#     root = pathlib.Path(args.root)
#     if not root.exists():
#         logger.error("Root folder does not exist: %s", root)
#         return

#     print(f"[bold]⏳ Scanning [cyan]{root}[/] …[/]")

#     extractor = ModelAnswerExtractor(args.provider, args.model)

#     # Choose embedder
#     embedder = OpenAIEmbedder(args.embedder) if args.provider == "OpenAI" else GeminiEmbedder(model_name=args.embedder)

#     # Vector DB
#     vec_db = ModelAnswerEmbeddingDB(embedder)
#     file_patterns = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in args.ext}

#     processed = 0
#     for file in iter_files(root, file_patterns):
#         processed += 1
#         print(f"→ {file.relative_to(root)}")
#         raw_text = read_text(file)

#         answers = extractor.extract(raw_text)
#         vec_db.save_embeddings(answers)

#     vec_db.close()
#     msg = "No model-answer files found." if processed == 0 else f"✅ Done. {processed} file(s) processed."
#     print(f"[green]{msg}[/]")

# if __name__ == "__main__":
#     main()


"""
Run from the project root:

  python -m src.scripts.embed_model_answers \
         --provider OpenAI \
         --model gpt-4o \
         --embedder text-embedding-3-small
"""

import argparse
import logging
import pathlib
import sys
import os
from typing import Iterable, List, Dict, Any

from docx import Document
import pdfplumber
from rich import print
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# project imports
from src.services.model_answer_extractor import ModelAnswerExtractor
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.model_answer_embedding_db import (
    ModelAnswerEmbeddingDB,
)

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
#                            Database helpers                                 #
# --------------------------------------------------------------------------- #
def get_database_connection():
    """Get database connection using environment variables."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            database=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD')
        )
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        sys.exit(1)


def get_model_answer_files_from_db() -> List[Dict[str, Any]]:
    """Retrieve all model answer paper file paths from database."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT model_answer_paper_id, assessment_id, file_url, created_on 
                FROM "Model_Answer_Paper" 
                ORDER BY created_on ASC
            """)
            
            files = cur.fetchall()
            logger.info(f"Found {len(files)} model answer files in database")
            return files
            
    except Exception as e:
        logger.error(f"Database error: {e}")
        return []
    finally:
        conn.close()


def get_project_root() -> pathlib.Path:
    """Get the project root directory (current working directory)."""
    return pathlib.Path.cwd()


def resolve_file_path(file_path: str) -> pathlib.Path:
    """Resolve database file path to actual file location."""
    project_root = get_project_root()
    # Try parent directory first (where data folder should be)
    full_path = project_root.parent / file_path
    
    logger.info(f"Looking for file at: {full_path}")
    
    if not full_path.exists():
        # Try alternative path in project directory
        alternative_path = project_root / file_path
        logger.info(f"Alternative path: {alternative_path}")
        
        if alternative_path.exists():
            full_path = alternative_path
        else:
            # List what's actually in the expected directory
            expected_dir = full_path.parent
            if expected_dir.exists():
                files_in_dir = list(expected_dir.iterdir())
                logger.error(f"Expected directory exists but file not found. Contents: {[f.name for f in files_in_dir]}")
            else:
                logger.error(f"Expected directory does not exist: {expected_dir}")
            raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
    logger.info(f"Successfully found file at: {full_path}")
    return full_path


# --------------------------------------------------------------------------- #
#                              File helpers                                   #
# --------------------------------------------------------------------------- #
def read_text(path: pathlib.Path) -> str:
    """Return plain text from .docx or .pdf (raise on others)."""
    suffix = path.suffix.lower()

    if suffix == ".docx":
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)

    if suffix == ".pdf":
        with pdfplumber.open(path) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)

    raise ValueError(f"Unsupported file type: {path.name}")


def iter_files(root: pathlib.Path, patterns: Iterable[str]) -> Iterable[pathlib.Path]:
    """Yield files under *root* whose suffix matches one of *patterns*."""
    for file in root.rglob("*"):
        if file.suffix.lower() in patterns and file.is_file():
            yield file


# --------------------------------------------------------------------------- #
#                               Main routine                                  #
# --------------------------------------------------------------------------- #
def main() -> None:
    ap = argparse.ArgumentParser(description="Extract & embed model answers")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    ap.add_argument(
        "--model",
        required=True,
        help="LLM used for extraction (e.g. gpt-4o, gemini-1.5-pro)",
    )
    ap.add_argument(
        "--embedder",
        default="text-embedding-3-small",
        help="Embedding model name (OpenAI or Gemini)",
    )
    args = ap.parse_args()

    logger.info("Processing all model answer files from database")

    extractor = ModelAnswerExtractor(args.provider, args.model)

    # Choose embedding backend
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(args.embedder)
    else:  # GoogleGemini
        embedder = GeminiEmbedder(model_name=args.embedder)

    vec_db = ModelAnswerEmbeddingDB(embedder)
    processed = 0

    print(f"[bold]⏳ Fetching model answer files from database…[/]")
    
    # Get files from database
    db_files = get_model_answer_files_from_db()
    
    if not db_files:
        print("[yellow]No model answer files found in database.[/]")
        vec_db.close()
        return

    # Process each file from database
    for db_file in db_files:
        try:
            file_url = db_file['file_url']
            file_id = db_file['model_answer_paper_id']
            assessment_id = db_file['assessment_id']
            
            print(f"→ Processing: {pathlib.Path(file_url).name} (ID: {file_id}, Assessment: {assessment_id})")
            
            # Resolve file path and load text
            full_path = resolve_file_path(file_url)
            
            # Check if file extension is supported
            if full_path.suffix.lower() not in ['.pdf', '.docx']:
                logger.warning(f"Skipping unsupported file type: {full_path.name}")
                continue
            
            raw_text = read_text(full_path)
            
            if not raw_text.strip():
                logger.warning(f"No text extracted from {full_path.name}")
                continue
            
            # Extract and embed answers
            answers = extractor.extract(raw_text)
            vec_db.save_embeddings(answers)
            
            processed += 1
            
        except Exception as e:
            logger.error(f"Error processing {pathlib.Path(db_file['file_url']).name}: {e}")
            continue

    vec_db.close()

    if processed == 0:
        msg = "[yellow]No model-answer files found or processed.[/]"
    else:
        msg = f"[green]✅ Done. {processed} file(s) processed and embedded.[/]"
    
    print(f"{msg}")


if __name__ == "__main__":
    main()