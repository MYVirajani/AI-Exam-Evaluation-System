

import argparse
import logging
import pathlib
import sys
import os
from typing import Iterable, List, Dict, Any, Optional

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


def get_assessment_data(assessment_id: str) -> Optional[Dict[str, Any]]:
    """Get assessment data with module information."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT a.assessment_id, a.created_on, a.module_id,
                       m.module_code, m.module_name
                FROM "Assessment" a
                JOIN "Module" m ON a.module_id = m.module_id
                WHERE a.assessment_id = %s
            """, (assessment_id,))
            
            result = cur.fetchone()
            if result:
                created_date = result['created_on']
                return {
                    'assessment_id': result['assessment_id'],
                    'module_code': result['module_code'],
                    'module_name': result['module_name'],
                    'exam_year': created_date.year,
                    'exam_month': created_date.strftime('%B')
                }
            return None
            
    except Exception as e:
        logger.error(f"Database error getting assessment data: {e}")
        return None
    finally:
        conn.close()


def get_model_answer_file_for_assessment(assessment_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve model answer paper file for specific assessment."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT model_answer_paper_id, assessment_id, file_url, created_on 
                FROM "Model_Answer_Paper" 
                WHERE assessment_id = %s
            """, (assessment_id,))
            
            result = cur.fetchone()
            if result:
                logger.info(f"Found model answer file for assessment {assessment_id}: {result['file_url']}")
                return dict(result)
            else:
                logger.warning(f"No model answer file found for assessment {assessment_id}")
                return None
            
    except Exception as e:
        logger.error(f"Database error: {e}")
        return None
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
    for file in root.rglob("*"):
        if file.suffix.lower() in patterns and file.is_file():
            yield file

def main() -> None:
    ap = argparse.ArgumentParser(description="Extract & embed model answers")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    ap.add_argument("--model", required=True, help="LLM model name (e.g. gpt-4o, gemini-1.5-pro)")
    ap.add_argument("--embedder", default="text-embedding-3-small", help="Embedding model name")
    ap.add_argument("--root", default="data/Model_Answers", help="Root folder of model answers")
    ap.add_argument("--ext", nargs="*", default=[".pdf", ".docx"], help="File extensions (default: .pdf .docx)")
    args = ap.parse_args()

    root = pathlib.Path(args.root)
    if not root.exists():
        logger.error("Root folder does not exist: %s", root)
        return

    # Create extractor - but we'll override the extracted metadata with database data
    extractor = ModelAnswerExtractor(provider, model)

    # Choose embedder
    embedder = OpenAIEmbedder(args.embedder) if args.provider == "OpenAI" else GeminiEmbedder(model_name=args.embedder)

    # Vector DB
    vec_db = ModelAnswerEmbeddingDB(embedder)
    file_patterns = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in args.ext}

    processed = 0
    for file in iter_files(root, file_patterns):
        processed += 1
        print(f"→ {file.relative_to(root)}")
        raw_text = read_text(file)

        answers = extractor.extract(raw_text)
        
        # Override extracted metadata with database-mapped data
        for answer in answers:
            answer.module_code = assessment_data['module_code']
            answer.exam_year = assessment_data['exam_year']
            answer.exam_month = assessment_data['exam_month']
        
        # Save embeddings with assessment context
        vec_db.save_embeddings(answers, assessment_id)
        
        print(f"[green]✅ Successfully processed and embedded model answer for assessment {assessment_id}[/]")
        print(f"[green]   Module: {assessment_data['module_code']}, Year: {assessment_data['exam_year']}, Month: {assessment_data['exam_month']}[/]")

    except Exception as e:
        logger.error(f"Error processing model answer for assessment {assessment_id}: {e}")
        print(f"[red]Error processing model answer: {e}[/]")
    finally:
        vec_db.close()



if __name__ == "__main__":
    main()
