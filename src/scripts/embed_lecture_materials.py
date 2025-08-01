

# import argparse, pathlib, logging, sys
# from docx import Document
# import pdfplumber
# from dotenv import load_dotenv

# from src.utils.token_chunker import chunk_text
# from src.models.lecture_chunk import LectureChunk
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB

# load_dotenv()
# logging.basicConfig(level=logging.INFO)
# log = logging.getLogger(__name__)

# # ────────────────────────────────────────────────
# def read_text(path: pathlib.Path) -> str:
#     if path.suffix.lower() == ".docx":
#         doc = Document(path)
#         return "\n".join(p.text for p in doc.paragraphs)
#     if path.suffix.lower() == ".pdf":
#         with pdfplumber.open(path) as pdf:
#             return "\n".join(p.extract_text() or "" for p in pdf.pages)
#     raise ValueError(f"Unsupported file type: {path.name}")

# # ────────────────────────────────────────────────
# def main() -> None:
#     ap = argparse.ArgumentParser(description="Embed lecture materials into vector DB")
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="Embedding provider")
#     ap.add_argument("--model", required=True, help="LLM model name (unused here, for logging)")
#     ap.add_argument("--embedder", default="text-embedding-3-small", help="Embedding model ID (e.g., text-embedding-3-small or embedding-001)")
#     ap.add_argument("--root", default="data/Lecture_Material", help="Root directory containing module folders")
#     ap.add_argument("--module", help="Target module code (e.g., EE6250)")
#     ap.add_argument("--max_tokens", type=int, default=1000)
#     ap.add_argument("--overlap", type=int, default=200)
#     args = ap.parse_args()

#     # Prompt for module if not provided
#     if not args.module:
#         print("📚 Available modules under", args.root)
#         for p in pathlib.Path(args.root).iterdir():
#             if p.is_dir():
#                 print(" •", p.name)
#         args.module = input("\nEnter module code to embed: ").strip()

#     module_dir = pathlib.Path(args.root) / args.module
#     if not module_dir.exists():
#         log.error("❌ Folder does not exist: %s", module_dir)
#         sys.exit(1)

#     # Choose embedder
#     embedder = (
#         OpenAIEmbedder(args.embedder)
#         if args.provider == "OpenAI"
#         else GeminiEmbedder(model_name=args.embedder)
#     )

#     # Create vector DB instance
#     vec_db = LectureMaterialEmbeddingDB(embedder)

#     # Scan files
#     files = list(module_dir.rglob("*"))
#     valid_files = [f for f in files if f.suffix.lower() in {".pdf", ".docx"}]
#     if not valid_files:
#         log.warning("⚠️ No supported files found in %s", module_dir)
#         sys.exit(0)

#     for f in valid_files:
#         file_name = f.name
#         if vec_db.document_exists(args.module, file_name):
#             log.info("⚠️ Skipping already embedded document: %s", file_name)
#             continue

#         log.info("📄 Processing: %s", f.relative_to(module_dir))
#         try:
#             raw_text = read_text(f)
#             chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)

#             lecture_chunks = [
#                 LectureChunk(module_code=args.module, source_file=file_name, chunk_id=i, text=txt)
#                 for i, txt in enumerate(chunks) if txt.strip()
#             ]

#             log.info("   → Saving %d chunks", len(lecture_chunks))
#             vec_db.save_chunks(lecture_chunks)

#         except Exception as e:
#             log.error("   ❌ Error processing %s: %s", f.name, str(e))

#     vec_db.close()
#     print(f"✅ Finished embedding for module: {args.module}")

# # ────────────────────────────────────────────────
# if __name__ == "__main__":
#     main()


"""
Embed all lecture materials from database.

Example (PowerShell one-liner):
  python -m src.scripts.embed_lecture_materials `
    --provider OpenAI `
    --model text-embedding-3-small `
    --embedder text-embedding-3-small
"""

import argparse
import pathlib
import logging
import sys
import os
from docx import Document
import pdfplumber
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

from src.utils.token_chunker import chunk_text
from src.models.lecture_chunk import LectureChunk
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.lecture_material_embedding_db import (
    LectureMaterialEmbeddingDB,
)

load_dotenv()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────
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
        log.error(f"Failed to connect to database: {e}")
        sys.exit(1)


# ──────────────────────────────────────────────────────────────────────
def get_all_lecture_materials_from_db(module_filter=None):
    """Retrieve lecture material file paths from database."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if module_filter:
                cur.execute("""
                    SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
                           l.module_id
                    FROM "LectureMaterial" lm
                    JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
                    WHERE l.module_id = %s
                    ORDER BY l.module_id, lm.uploaded_on ASC
                """, (module_filter,))
            else:
                cur.execute("""
                    SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
                           l.module_id
                    FROM "LectureMaterial" lm
                    JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
                    ORDER BY l.module_id, lm.uploaded_on ASC
                """)
            
            materials = cur.fetchall()
            log.info(f"Found {len(materials)} lecture materials in database" + 
                    (f" for module {module_filter}" if module_filter else ""))
            return materials
            
    except Exception as e:
        log.error(f"Database error: {e}")
        return []
    finally:
        conn.close()


# ──────────────────────────────────────────────────────────────────────
def get_available_modules():
    """Get list of available modules from database."""
    conn = get_database_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT l.module_id 
                FROM "Lesson" l
                JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
                ORDER BY l.module_id
            """)
            modules = [row[0] for row in cur.fetchall()]
            return modules
    except Exception as e:
        log.error(f"Error fetching modules: {e}")
        return []
    finally:
        conn.close()


# ──────────────────────────────────────────────────────────────────────
def get_project_root() -> pathlib.Path:
    """Get the project root directory (current working directory)."""
    return pathlib.Path.cwd()


# ──────────────────────────────────────────────────────────────────────
def read_text(file_path: str) -> str:
    """Read text from PDF, DOCX, or PowerPoint file."""
    # The file_path from database is relative to the parent of project root
    # Current working directory: C:\Users\DELL\Desktop\FYP Code New\AI-Exam-Evaluation-System
    # File should be at: C:\Users\DELL\Desktop\FYP Code New\data\Lecture_Materials\...
    project_root = get_project_root()
    full_path = project_root.parent / file_path
    
    log.info(f"Looking for file at: {full_path}")
    
    if not full_path.exists():
        # Let's also check if it might be in the project directory itself
        alternative_path = project_root / file_path
        log.info(f"Alternative path: {alternative_path}")
        
        if alternative_path.exists():
            full_path = alternative_path
        else:
            # List what's actually in the expected directory
            expected_dir = full_path.parent
            if expected_dir.exists():
                files_in_dir = list(expected_dir.iterdir())
                log.error(f"Expected directory exists but file not found. Contents: {[f.name for f in files_in_dir]}")
            else:
                log.error(f"Expected directory does not exist: {expected_dir}")
            raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
    log.info(f"Successfully found file at: {full_path}")
    
    if full_path.suffix.lower() == ".docx":
        doc = Document(full_path)
        return "\n".join(p.text for p in doc.paragraphs)
    elif full_path.suffix.lower() == ".pdf":
        with pdfplumber.open(full_path) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    elif full_path.suffix.lower() in [".ppt", ".pptx"]:
        # For PowerPoint files, we need python-pptx library
        try:
            from pptx import Presentation
            prs = Presentation(full_path)
            text_content = []
            for slide in prs.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text_content.append(shape.text)
            return "\n".join(text_content)
        except ImportError:
            raise ImportError("python-pptx library is required for PowerPoint files. Install with: pip install python-pptx")
    else:
        raise ValueError(f"Unsupported file type: {full_path.name}")


# ──────────────────────────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser(description="Embed lecture materials from database into vector DB")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], 
                   help="Embedding provider")
    ap.add_argument("--model", required=True, 
                   help="LLM model name (unused here, for logging)")
    ap.add_argument("--embedder", default="text-embedding-3-small", 
                   help="Embedding model ID (e.g., text-embedding-3-small or embedding-001)")
    ap.add_argument("--module", 
                   help="Target module code (e.g., EE6250). If not provided, all modules will be processed.")
    ap.add_argument("--max_tokens", type=int, default=1000)
    ap.add_argument("--overlap", type=int, default=200)
    args = ap.parse_args()

    # No interactive prompting - just process all modules if none specified
    if args.module:
        # Verify the specified module exists
        available_modules = get_available_modules()
        if args.module not in available_modules:
            log.error(f"❌ Module '{args.module}' not found in database")
            sys.exit(1)
        log.info(f"Processing specific module: {args.module}")
    else:
        log.info("Processing all modules from database")

    # Get lecture materials from database
    materials = get_all_lecture_materials_from_db(args.module)
    
    if not materials:
        log.error("❌ No lecture materials found in database" + 
                 (f" for module {args.module}" if args.module else "") + 
                 ". Please upload some files first.")
        sys.exit(1)

    # Group materials by module for better logging
    modules = {}
    for material in materials:
        module_id = material['module_id']
        if module_id not in modules:
            modules[module_id] = []
        modules[module_id].append(material)

    log.info(f"Found {len(materials)} files across {len(modules)} modules: {', '.join(modules.keys())}")

    # Choose embedder
    embedder = (
        OpenAIEmbedder(args.embedder)
        if args.provider == "OpenAI"
        else GeminiEmbedder(model_name=args.embedder)
    )
    vec_db = LectureMaterialEmbeddingDB(embedder)

    # Process each material
    total_chunks = 0
    processed_files = 0
    skipped_files = 0
    
    for material in materials:
        file_path = material['file_url']
        file_title = material['description'] or pathlib.Path(file_path).name
        module_id = material['module_id']
        
        # Check if document already exists to avoid duplicates
        if vec_db.document_exists(module_id, file_title):
            log.info(f"⚠️ [{module_id}] Skipping already embedded document: {file_title}")
            skipped_files += 1
            continue
        
        try:
            log.info(f"📄 [{module_id}] Processing: {file_title}")
            raw_text = read_text(file_path)
            
            if not raw_text.strip():
                log.warning(f"⚠️ No text extracted from {file_title}")
                continue
            
            # Create chunks
            chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)
            
            # Create LectureChunk objects
            lecture_chunks = [
                LectureChunk(module_code=module_id, source_file=file_title, chunk_id=idx, text=txt)
                for idx, txt in enumerate(chunks) if txt.strip()
            ]
            
            if lecture_chunks:
                log.info(f"   → Saving {len(lecture_chunks)} chunks")
                vec_db.save_chunks(lecture_chunks)
                total_chunks += len(lecture_chunks)
                processed_files += 1
            else:
                log.warning(f"⚠️ No valid chunks created from {file_title}")
                
        except Exception as e:
            log.error(f"❌ Error processing {file_title}: {e}")
            continue

    vec_db.close()
    
    # Final summary
    print(f"\n✅ Embedding Summary:")
    print(f"   • Processed files: {processed_files}")
    print(f"   • Skipped files: {skipped_files}")
    print(f"   • Total chunks created: {total_chunks}")
    print(f"   • Modules: {', '.join(modules.keys())}")
    
    if processed_files > 0:
        print(f"🎉 Successfully embedded {processed_files} files with {total_chunks} chunks!")
    else:
        print("⚠️ No new files were processed")


if __name__ == "__main__":
    main()