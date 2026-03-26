

# # # # import argparse, pathlib, logging, sys
# # # # from docx import Document
# # # # import pdfplumber
# # # # from dotenv import load_dotenv

# # # # from src.utils.token_chunker import chunk_text
# # # # from src.models.lecture_chunk import LectureChunk
# # # # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # # # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # # # from src.services.database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB

# # # # load_dotenv()
# # # # logging.basicConfig(level=logging.INFO)
# # # # log = logging.getLogger(__name__)

# # # # # ────────────────────────────────────────────────
# # # # def read_text(path: pathlib.Path) -> str:
# # # #     if path.suffix.lower() == ".docx":
# # # #         doc = Document(path)
# # # #         return "\n".join(p.text for p in doc.paragraphs)
# # # #     if path.suffix.lower() == ".pdf":
# # # #         with pdfplumber.open(path) as pdf:
# # # #             return "\n".join(p.extract_text() or "" for p in pdf.pages)
# # # #     raise ValueError(f"Unsupported file type: {path.name}")

# # # # # ────────────────────────────────────────────────
# # # # def main() -> None:
# # # #     ap = argparse.ArgumentParser(description="Embed lecture materials into vector DB")
# # # #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="Embedding provider")
# # # #     ap.add_argument("--model", required=True, help="LLM model name (unused here, for logging)")
# # # #     ap.add_argument("--embedder", default="text-embedding-3-small", help="Embedding model ID (e.g., text-embedding-3-small or embedding-001)")
# # # #     ap.add_argument("--root", default="data/Lecture_Material", help="Root directory containing module folders")
# # # #     ap.add_argument("--module", help="Target module code (e.g., EE6250)")
# # # #     ap.add_argument("--max_tokens", type=int, default=1000)
# # # #     ap.add_argument("--overlap", type=int, default=200)
# # # #     args = ap.parse_args()

# # # #     # Prompt for module if not provided
# # # #     if not args.module:
# # # #         print("📚 Available modules under", args.root)
# # # #         for p in pathlib.Path(args.root).iterdir():
# # # #             if p.is_dir():
# # # #                 print(" •", p.name)
# # # #         args.module = input("\nEnter module code to embed: ").strip()

# # # #     module_dir = pathlib.Path(args.root) / args.module
# # # #     if not module_dir.exists():
# # # #         log.error("❌ Folder does not exist: %s", module_dir)
# # # #         sys.exit(1)

# # # #     # Choose embedder
# # # #     embedder = (
# # # #         OpenAIEmbedder(args.embedder)
# # # #         if args.provider == "OpenAI"
# # # #         else GeminiEmbedder(model_name=args.embedder)
# # # #     )

# # # #     # Create vector DB instance
# # # #     vec_db = LectureMaterialEmbeddingDB(embedder)

# # # #     # Scan files
# # # #     files = list(module_dir.rglob("*"))
# # # #     valid_files = [f for f in files if f.suffix.lower() in {".pdf", ".docx"}]
# # # #     if not valid_files:
# # # #         log.warning("⚠️ No supported files found in %s", module_dir)
# # # #         sys.exit(0)

# # # #     for f in valid_files:
# # # #         file_name = f.name
# # # #         if vec_db.document_exists(args.module, file_name):
# # # #             log.info("⚠️ Skipping already embedded document: %s", file_name)
# # # #             continue

# # # #         log.info("📄 Processing: %s", f.relative_to(module_dir))
# # # #         try:
# # # #             raw_text = read_text(f)
# # # #             chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)

# # # #             lecture_chunks = [
# # # #                 LectureChunk(module_code=args.module, source_file=file_name, chunk_id=i, text=txt)
# # # #                 for i, txt in enumerate(chunks) if txt.strip()
# # # #             ]

# # # #             log.info("   → Saving %d chunks", len(lecture_chunks))
# # # #             vec_db.save_chunks(lecture_chunks)

# # # #         except Exception as e:
# # # #             log.error("   ❌ Error processing %s: %s", f.name, str(e))

# # # #     vec_db.close()
# # # #     print(f"✅ Finished embedding for module: {args.module}")

# # # # # ────────────────────────────────────────────────
# # # # if __name__ == "__main__":
# # # #     main()


# # # """
# # # Embed all lecture materials from database.

# # # Example (PowerShell one-liner):
# # #   python -m src.scripts.embed_lecture_materials `
# # #     --provider OpenAI `
# # #     --model text-embedding-3-small `
# # #     --embedder text-embedding-3-small
# # # """

# # # import argparse
# # # import pathlib
# # # import logging
# # # import sys
# # # import os
# # # from docx import Document
# # # import pdfplumber
# # # from dotenv import load_dotenv
# # # import psycopg2
# # # from psycopg2.extras import RealDictCursor

# # # from src.utils.token_chunker import chunk_text
# # # from src.models.lecture_chunk import LectureChunk
# # # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # # from src.services.database_services.lecture_material_embedding_db import (
# # #     LectureMaterialEmbeddingDB,
# # # )

# # # load_dotenv()
# # # logging.basicConfig(level=logging.INFO)
# # # log = logging.getLogger(__name__)


# # # # ──────────────────────────────────────────────────────────────────────
# # # def get_database_connection():
# # #     """Get database connection using environment variables."""
# # #     try:
# # #         conn = psycopg2.connect(
# # #             host=os.getenv('POSTGRES_HOST'),
# # #             port=os.getenv('POSTGRES_PORT'),
# # #             database=os.getenv('POSTGRES_DB'),
# # #             user=os.getenv('POSTGRES_USER'),
# # #             password=os.getenv('POSTGRES_PASSWORD')
# # #         )
# # #         return conn
# # #     except Exception as e:
# # #         log.error(f"Failed to connect to database: {e}")
# # #         sys.exit(1)


# # # # ──────────────────────────────────────────────────────────────────────
# # # def get_all_lecture_materials_from_db(module_filter=None):
# # #     """Retrieve lecture material file paths from database."""
# # #     conn = get_database_connection()
# # #     try:
# # #         with conn.cursor(cursor_factory=RealDictCursor) as cur:
# # #             if module_filter:
# # #                 cur.execute("""
# # #                     SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
# # #                            l.module_id
# # #                     FROM "LectureMaterial" lm
# # #                     JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
# # #                     WHERE l.module_id = %s
# # #                     ORDER BY l.module_id, lm.uploaded_on ASC
# # #                 """, (module_filter,))
# # #             else:
# # #                 cur.execute("""
# # #                     SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
# # #                            l.module_id
# # #                     FROM "LectureMaterial" lm
# # #                     JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
# # #                     ORDER BY l.module_id, lm.uploaded_on ASC
# # #                 """)
            
# # #             materials = cur.fetchall()
# # #             log.info(f"Found {len(materials)} lecture materials in database" + 
# # #                     (f" for module {module_filter}" if module_filter else ""))
# # #             return materials
            
# # #     except Exception as e:
# # #         log.error(f"Database error: {e}")
# # #         return []
# # #     finally:
# # #         conn.close()


# # # # ──────────────────────────────────────────────────────────────────────
# # # def get_available_modules():
# # #     """Get list of available modules from database."""
# # #     conn = get_database_connection()
# # #     try:
# # #         with conn.cursor() as cur:
# # #             cur.execute("""
# # #                 SELECT DISTINCT l.module_id 
# # #                 FROM "Lesson" l
# # #                 JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
# # #                 ORDER BY l.module_id
# # #             """)
# # #             modules = [row[0] for row in cur.fetchall()]
# # #             return modules
# # #     except Exception as e:
# # #         log.error(f"Error fetching modules: {e}")
# # #         return []
# # #     finally:
# # #         conn.close()


# # # # ──────────────────────────────────────────────────────────────────────
# # # def get_project_root() -> pathlib.Path:
# # #     """Get the project root directory (current working directory)."""
# # #     return pathlib.Path.cwd()


# # # # ──────────────────────────────────────────────────────────────────────
# # # def read_text(file_path: str) -> str:
# # #     """Read text from PDF, DOCX, or PowerPoint file."""
# # #     # The file_path from database is relative to the parent of project root
# # #     # Current working directory: C:\Users\DELL\Desktop\FYP Code New\AI-Exam-Evaluation-System
# # #     # File should be at: C:\Users\DELL\Desktop\FYP Code New\data\Lecture_Materials\...
# # #     project_root = get_project_root()
# # #     full_path = project_root.parent / file_path
    
# # #     log.info(f"Looking for file at: {full_path}")
    
# # #     if not full_path.exists():
# # #         # Let's also check if it might be in the project directory itself
# # #         alternative_path = project_root / file_path
# # #         log.info(f"Alternative path: {alternative_path}")
        
# # #         if alternative_path.exists():
# # #             full_path = alternative_path
# # #         else:
# # #             # List what's actually in the expected directory
# # #             expected_dir = full_path.parent
# # #             if expected_dir.exists():
# # #                 files_in_dir = list(expected_dir.iterdir())
# # #                 log.error(f"Expected directory exists but file not found. Contents: {[f.name for f in files_in_dir]}")
# # #             else:
# # #                 log.error(f"Expected directory does not exist: {expected_dir}")
# # #             raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
# # #     log.info(f"Successfully found file at: {full_path}")
    
# # #     if full_path.suffix.lower() == ".docx":
# # #         doc = Document(full_path)
# # #         return "\n".join(p.text for p in doc.paragraphs)
# # #     elif full_path.suffix.lower() == ".pdf":
# # #         with pdfplumber.open(full_path) as pdf:
# # #             return "\n".join(p.extract_text() or "" for p in pdf.pages)
# # #     elif full_path.suffix.lower() in [".ppt", ".pptx"]:
# # #         # For PowerPoint files, we need python-pptx library
# # #         try:
# # #             from pptx import Presentation
# # #             prs = Presentation(full_path)
# # #             text_content = []
# # #             for slide in prs.slides:
# # #                 for shape in slide.shapes:
# # #                     if hasattr(shape, "text"):
# # #                         text_content.append(shape.text)
# # #             return "\n".join(text_content)
# # #         except ImportError:
# # #             raise ImportError("python-pptx library is required for PowerPoint files. Install with: pip install python-pptx")
# # #     else:
# # #         raise ValueError(f"Unsupported file type: {full_path.name}")


# # # # ──────────────────────────────────────────────────────────────────────
# # # def main() -> None:
# # #     ap = argparse.ArgumentParser(description="Embed lecture materials from database into vector DB")
# # #     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], 
# # #                    help="Embedding provider")
# # #     ap.add_argument("--model", required=True, 
# # #                    help="LLM model name (unused here, for logging)")
# # #     ap.add_argument("--embedder", default="text-embedding-3-small", 
# # #                    help="Embedding model ID (e.g., text-embedding-3-small or embedding-001)")
# # #     ap.add_argument("--module", 
# # #                    help="Target module code (e.g., EE6250). If not provided, all modules will be processed.")
# # #     ap.add_argument("--max_tokens", type=int, default=1000)
# # #     ap.add_argument("--overlap", type=int, default=200)
# # #     args = ap.parse_args()

# # #     # No interactive prompting - just process all modules if none specified
# # #     if args.module:
# # #         # Verify the specified module exists
# # #         available_modules = get_available_modules()
# # #         if args.module not in available_modules:
# # #             log.error(f"❌ Module '{args.module}' not found in database")
# # #             sys.exit(1)
# # #         log.info(f"Processing specific module: {args.module}")
# # #     else:
# # #         log.info("Processing all modules from database")

# # #     # Get lecture materials from database
# # #     materials = get_all_lecture_materials_from_db(args.module)
    
# # #     if not materials:
# # #         log.error("❌ No lecture materials found in database" + 
# # #                  (f" for module {args.module}" if args.module else "") + 
# # #                  ". Please upload some files first.")
# # #         sys.exit(1)

# # #     # Group materials by module for better logging
# # #     modules = {}
# # #     for material in materials:
# # #         module_id = material['module_id']
# # #         if module_id not in modules:
# # #             modules[module_id] = []
# # #         modules[module_id].append(material)

# # #     log.info(f"Found {len(materials)} files across {len(modules)} modules: {', '.join(modules.keys())}")

# # #     # Choose embedder
# # #     embedder = (
# # #         OpenAIEmbedder(args.embedder)
# # #         if args.provider == "OpenAI"
# # #         else GeminiEmbedder(model_name=args.embedder)
# # #     )
# # #     vec_db = LectureMaterialEmbeddingDB(embedder)

# # #     # Process each material
# # #     total_chunks = 0
# # #     processed_files = 0
# # #     skipped_files = 0
    
# # #     for material in materials:
# # #         file_path = material['file_url']
# # #         file_title = material['description'] or pathlib.Path(file_path).name
# # #         module_id = material['module_id']
        
# # #         # Check if document already exists to avoid duplicates
# # #         if vec_db.document_exists(module_id, file_title):
# # #             log.info(f"⚠️ [{module_id}] Skipping already embedded document: {file_title}")
# # #             skipped_files += 1
# # #             continue
        
# # #         try:
# # #             log.info(f"📄 [{module_id}] Processing: {file_title}")
# # #             raw_text = read_text(file_path)
            
# # #             if not raw_text.strip():
# # #                 log.warning(f"⚠️ No text extracted from {file_title}")
# # #                 continue
            
# # #             # Create chunks
# # #             chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)
            
# # #             # Create LectureChunk objects
# # #             lecture_chunks = [
# # #                 LectureChunk(module_code=module_id, source_file=file_title, chunk_id=idx, text=txt)
# # #                 for idx, txt in enumerate(chunks) if txt.strip()
# # #             ]
            
# # #             if lecture_chunks:
# # #                 log.info(f"   → Saving {len(lecture_chunks)} chunks")
# # #                 vec_db.save_chunks(lecture_chunks)
# # #                 total_chunks += len(lecture_chunks)
# # #                 processed_files += 1
# # #             else:
# # #                 log.warning(f"⚠️ No valid chunks created from {file_title}")
                
# # #         except Exception as e:
# # #             log.error(f"❌ Error processing {file_title}: {e}")
# # #             continue

# # #     vec_db.close()
    
# # #     # Final summary
# # #     print(f"\n✅ Embedding Summary:")
# # #     print(f"   • Processed files: {processed_files}")
# # #     print(f"   • Skipped files: {skipped_files}")
# # #     print(f"   • Total chunks created: {total_chunks}")
# # #     print(f"   • Modules: {', '.join(modules.keys())}")
    
# # #     if processed_files > 0:
# # #         print(f"🎉 Successfully embedded {processed_files} files with {total_chunks} chunks!")
# # #     else:
# # #         print("⚠️ No new files were processed")


# # # if __name__ == "__main__":
# # #     main()

# # """
# # Embed lecture materials from database with module filtering support.
# # Enhanced to support module_id filtering for assessment-specific embedding.
# # """

# # import argparse
# # import pathlib
# # import logging
# # import sys
# # import os
# # from docx import Document
# # import pdfplumber
# # from dotenv import load_dotenv
# # import psycopg2
# # from psycopg2.extras import RealDictCursor

# # from src.utils.token_chunker import chunk_text
# # from src.models.lecture_chunk import LectureChunk
# # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # from src.services.embedding.gemini_embedder import GeminiEmbedder
# # from src.services.database_services.lecture_material_embedding_db import (
# #     LectureMaterialEmbeddingDB,
# # )

# # load_dotenv()
# # logging.basicConfig(level=logging.INFO)
# # log = logging.getLogger(__name__)


# # def get_database_connection():
# #     """Get database connection using environment variables."""
# #     try:
# #         conn = psycopg2.connect(
# #             host=os.getenv('POSTGRES_HOST'),
# #             port=os.getenv('POSTGRES_PORT'),
# #             database=os.getenv('POSTGRES_DB'),
# #             user=os.getenv('POSTGRES_USER'),
# #             password=os.getenv('POSTGRES_PASSWORD')
# #         )
# #         return conn
# #     except Exception as e:
# #         log.error(f"Failed to connect to database: {e}")
# #         sys.exit(1)


# # def get_module_code_from_id(module_id):
# #     """Get module code from module ID."""
# #     conn = get_database_connection()
# #     try:
# #         with conn.cursor() as cur:
# #             cur.execute("""
# #                 SELECT module_code FROM "Module" WHERE module_id = %s
# #             """, (module_id,))
# #             result = cur.fetchone()
# #             return result[0] if result else None
# #     except Exception as e:
# #         log.error(f"Error fetching module code: {e}")
# #         return None
# #     finally:
# #         conn.close()


# # def get_all_lecture_materials_from_db(module_filter=None):
# #     """
# #     Retrieve lecture material file paths from database.
    
# #     Args:
# #         module_filter: Can be module_id (UUID) or module_code (string)
# #     """
# #     conn = get_database_connection()
# #     try:
# #         with conn.cursor(cursor_factory=RealDictCursor) as cur:
# #             if module_filter:
# #                 # Check if it's a module_id (UUID format) or module_code
# #                 if len(module_filter) > 10 and '-' in module_filter:
# #                     # Looks like a UUID (module_id)
# #                     cur.execute("""
# #                         SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
# #                                l.module_id, m.module_code
# #                         FROM "LectureMaterial" lm
# #                         JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
# #                         JOIN "Module" m ON l.module_id = m.module_id
# #                         WHERE l.module_id = %s
# #                         ORDER BY lm.uploaded_on ASC
# #                     """, (module_filter,))
# #                 else:
# #                     # Looks like a module_code
# #                     cur.execute("""
# #                         SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
# #                                l.module_id, m.module_code
# #                         FROM "LectureMaterial" lm
# #                         JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
# #                         JOIN "Module" m ON l.module_id = m.module_id
# #                         WHERE m.module_code = %s
# #                         ORDER BY lm.uploaded_on ASC
# #                     """, (module_filter,))
# #             else:
# #                 cur.execute("""
# #                     SELECT lm.material_id, lm.lesson_id, lm.file_url, lm.uploaded_on, lm.description,
# #                            l.module_id, m.module_code
# #                     FROM "LectureMaterial" lm
# #                     JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
# #                     JOIN "Module" m ON l.module_id = m.module_id
# #                     ORDER BY m.module_code, lm.uploaded_on ASC
# #                 """)
            
# #             materials = cur.fetchall()
# #             log.info(f"Found {len(materials)} lecture materials in database" + 
# #                     (f" for module filter {module_filter}" if module_filter else ""))
# #             return materials
            
# #     except Exception as e:
# #         log.error(f"Database error: {e}")
# #         return []
# #     finally:
# #         conn.close()


# # def get_available_modules():
# #     """Get list of available modules from database."""
# #     conn = get_database_connection()
# #     try:
# #         with conn.cursor() as cur:
# #             cur.execute("""
# #                 SELECT DISTINCT m.module_id, m.module_code 
# #                 FROM "Module" m
# #                 JOIN "Lesson" l ON m.module_id = l.module_id
# #                 JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
# #                 ORDER BY m.module_code
# #             """)
# #             modules = cur.fetchall()
# #             return modules
# #     except Exception as e:
# #         log.error(f"Error fetching modules: {e}")
# #         return []
# #     finally:
# #         conn.close()


# # def get_project_root() -> pathlib.Path:
# #     """Get the project root directory (current working directory)."""
# #     return pathlib.Path.cwd()


# # def read_text(file_path: str) -> str:
# #     """Read text from PDF, DOCX, or PowerPoint file."""
# #     project_root = get_project_root()
# #     full_path = project_root.parent / file_path
    
# #     log.info(f"Looking for file at: {full_path}")
    
# #     if not full_path.exists():
# #         alternative_path = project_root / file_path
# #         log.info(f"Alternative path: {alternative_path}")
        
# #         if alternative_path.exists():
# #             full_path = alternative_path
# #         else:
# #             expected_dir = full_path.parent
# #             if expected_dir.exists():
# #                 files_in_dir = list(expected_dir.iterdir())
# #                 log.error(f"Expected directory exists but file not found. Contents: {[f.name for f in files_in_dir]}")
# #             else:
# #                 log.error(f"Expected directory does not exist: {expected_dir}")
# #             raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
# #     log.info(f"Successfully found file at: {full_path}")
    
# #     if full_path.suffix.lower() == ".docx":
# #         doc = Document(full_path)
# #         return "\n".join(p.text for p in doc.paragraphs)
# #     elif full_path.suffix.lower() == ".pdf":
# #         with pdfplumber.open(full_path) as pdf:
# #             return "\n".join(p.extract_text() or "" for p in pdf.pages)
# #     elif full_path.suffix.lower() in [".ppt", ".pptx"]:
# #         try:
# #             from pptx import Presentation
# #             prs = Presentation(full_path)
# #             text_content = []
# #             for slide in prs.slides:
# #                 for shape in slide.shapes:
# #                     if hasattr(shape, "text"):
# #                         text_content.append(shape.text)
# #             return "\n".join(text_content)
# #         except ImportError:
# #             raise ImportError("python-pptx library is required for PowerPoint files. Install with: pip install python-pptx")
# #     else:
# #         raise ValueError(f"Unsupported file type: {full_path.name}")


# # def main(provider=None, model=None, embedder=None, module_id=None, **kwargs) -> None:
# #     """
# #     Main function for embedding lecture materials.
    
# #     Args:
# #         provider: Embedding provider ("OpenAI" or "GoogleGemini")
# #         model: LLM model name (for logging)
# #         embedder: Embedding model ID
# #         module_id: Target module ID (UUID) or module_code to filter materials
# #         **kwargs: Additional arguments
# #     """
# #     # Handle command line arguments if called as script
# #     if provider is None:
# #         ap = argparse.ArgumentParser(description="Embed lecture materials from database into vector DB")
# #         ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], 
# #                        help="Embedding provider")
# #         ap.add_argument("--model", required=True, 
# #                        help="LLM model name (unused here, for logging)")
# #         ap.add_argument("--embedder", default="text-embedding-3-small", 
# #                        help="Embedding model ID")
# #         ap.add_argument("--module", 
# #                        help="Target module code or ID. If not provided, all modules will be processed.")
# #         ap.add_argument("--max_tokens", type=int, default=1000)
# #         ap.add_argument("--overlap", type=int, default=200)
# #         args = ap.parse_args()
        
# #         provider = args.provider
# #         model = args.model
# #         embedder = args.embedder
# #         module_id = args.module
# #         max_tokens = args.max_tokens
# #         overlap = args.overlap
# #     else:
# #         # Called from Flask API
# #         if not embedder:
# #             embedder = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'
# #         max_tokens = kwargs.get('max_tokens', 1000)
# #         overlap = kwargs.get('overlap', 200)

# #     log.info(f"Starting lecture material embedding with provider: {provider}")
# #     log.info(f"Target module filter: {module_id}")

# #     # Validate module exists if specified
# #     if module_id:
# #         available_modules = get_available_modules()
# #         module_exists = any(
# #             mod[0] == module_id or mod[1] == module_id 
# #             for mod in available_modules
# #         )
# #         if not module_exists:
# #             log.error(f"❌ Module '{module_id}' not found in database")
# #             return {"status": "error", "message": f"Module {module_id} not found"}

# #     # Get lecture materials from database
# #     materials = get_all_lecture_materials_from_db(module_id)
    
# #     if not materials:
# #         log.error("❌ No lecture materials found in database" + 
# #                  (f" for module {module_id}" if module_id else ""))
# #         return {"status": "error", "message": "No lecture materials found"}

# #     # Group materials by module for better logging
# #     modules = {}
# #     for material in materials:
# #         module_code = material['module_code']
# #         if module_code not in modules:
# #             modules[module_code] = []
# #         modules[module_code].append(material)

# #     log.info(f"Found {len(materials)} files across {len(modules)} modules: {', '.join(modules.keys())}")

# #     # Choose embedder
# #     embedder_service = (
# #         OpenAIEmbedder(embedder)
# #         if provider == "OpenAI"
# #         else GeminiEmbedder(model_name=embedder)
# #     )
# #     vec_db = LectureMaterialEmbeddingDB(embedder_service)

# #     # Process each material
# #     total_chunks = 0
# #     processed_files = 0
# #     skipped_files = 0
    
# #     for material in materials:
# #         file_path = material['file_url']
# #         file_title = material['description'] or pathlib.Path(file_path).name
# #         module_code = material['module_code']  # Use module_code from database
        
# #         # Check if document already exists to avoid duplicates
# #         if vec_db.document_exists(module_code, file_title):
# #             log.info(f"⚠️ [{module_code}] Skipping already embedded document: {file_title}")
# #             skipped_files += 1
# #             continue
        
# #         try:
# #             log.info(f"📄 [{module_code}] Processing: {file_title}")
# #             raw_text = read_text(file_path)
            
# #             if not raw_text.strip():
# #                 log.warning(f"⚠️ No text extracted from {file_title}")
# #                 continue
            
# #             # Create chunks
# #             chunks = chunk_text(raw_text, max_tokens=max_tokens, overlap=overlap)
            
# #             # Create LectureChunk objects with module_code
# #             lecture_chunks = [
# #                 LectureChunk(module_code=module_code, source_file=file_title, chunk_id=idx, text=txt)
# #                 for idx, txt in enumerate(chunks) if txt.strip()
# #             ]
            
# #             if lecture_chunks:
# #                 log.info(f"   → Saving {len(lecture_chunks)} chunks")
# #                 vec_db.save_chunks(lecture_chunks)
# #                 total_chunks += len(lecture_chunks)
# #                 processed_files += 1
# #             else:
# #                 log.warning(f"⚠️ No valid chunks created from {file_title}")
                
# #         except Exception as e:
# #             log.error(f"❌ Error processing {file_title}: {e}")
# #             continue

# #     vec_db.close()
    
# #     # Final summary
# #     summary_msg = f"Embedding Summary: {processed_files} processed, {skipped_files} skipped, {total_chunks} chunks created"
# #     print(f"\n✅ {summary_msg}")
# #     print(f"   • Modules: {', '.join(modules.keys())}")
    
# #     if processed_files > 0:
# #         print(f"🎉 Successfully embedded {processed_files} files with {total_chunks} chunks!")
# #         return {
# #             "status": "success", 
# #             "message": summary_msg,
# #             "details": {
# #                 "processed_files": processed_files,
# #                 "skipped_files": skipped_files, 
# #                 "total_chunks": total_chunks,
# #                 "modules": list(modules.keys())
# #             }
# #         }
# #     else:
# #         print("⚠️ No new files were processed")
# #         return {
# #             "status": "warning",
# #             "message": "No new files were processed", 
# #             "details": {"skipped_files": skipped_files}
# #         }


# # if __name__ == "__main__":
# #     result = main()
# #     if isinstance(result, dict) and result.get("status") == "error":
# #         sys.exit(1)

# """
# Enhanced lecture material embedding script with module-specific filtering.
# Now supports database-driven processing with module filtering.
# """

# import os
# import argparse
# import logging
# import psycopg2
# from psycopg2.extras import RealDictCursor
# from dotenv import load_dotenv
# from pathlib import Path

# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # from src.utils.token_chunker import read_file
# from src.utils.text_processing import clean_text
# from src.models.lecture_chunk import LectureChunk

# load_dotenv()
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)


# def get_database_connection():
#     """Get database connection using environment variables."""
#     try:
#         conn = psycopg2.connect(
#             host=os.getenv('POSTGRES_HOST'),
#             port=os.getenv('POSTGRES_PORT'),
#             database=os.getenv('POSTGRES_DB'),
#             user=os.getenv('POSTGRES_USER'),
#             password=os.getenv('POSTGRES_PASSWORD')
#         )
#         return conn
#     except Exception as e:
#         logger.error(f"Failed to connect to database: {e}")
#         raise


# def get_lecture_materials_from_db(module_id: str = None):
#     """Retrieve lecture material file paths from database with optional module filtering."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             if module_id:
#                 # Filter by specific module
#                 cur.execute("""
#                     SELECT lm.material_id, lm.module_id, lm.file_url, lm.created_on,
#                            m.module_code, m.module_name
#                     FROM "LectureMaterial" lm
#                     JOIN "Module" m ON lm.module_id = m.module_id
#                     WHERE lm.module_id = %s
#                     ORDER BY lm.created_on ASC
#                 """, (module_id,))
#             else:
#                 # Get all lecture materials
#                 cur.execute("""
#                     SELECT lm.material_id, lm.module_id, lm.file_url, lm.created_on,
#                            m.module_code, m.module_name
#                     FROM "LectureMaterial" lm
#                     JOIN "Module" m ON lm.module_id = m.module_id
#                     ORDER BY lm.created_on ASC
#                 """)
            
#             materials = cur.fetchall()
#             logger.info(f"Found {len(materials)} lecture materials in database")
#             return materials
            
#     except Exception as e:
#         logger.error(f"Database error: {e}")
#         return []
#     finally:
#         conn.close()


# def resolve_file_path(file_path: str) -> Path:
#     """Resolve database file path to actual file location."""
#     project_root = Path.cwd()
#     # Try parent directory first (where data folder should be)
#     full_path = project_root.parent / file_path
    
#     if not full_path.exists():
#         # Try alternative path in project directory
#         alternative_path = project_root / file_path
#         if alternative_path.exists():
#             full_path = alternative_path
#         else:
#             raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
#     return full_path


# def chunk_text(text, chunk_size=1000):
#     """Split text into chunks of approximately chunk_size words."""
#     words = text.split()
#     chunks = []
#     for i in range(0, len(words), chunk_size):
#         chunk = ' '.join(words[i:i+chunk_size])
#         if chunk.strip():  # Only add non-empty chunks
#             chunks.append(chunk)
#     return chunks


# def main(provider: str = None, model: str = None, embedder_name: str = None, 
#          module_id: str = None, **kwargs):
#     """
#     Main function that can be called from Flask API or command line.
    
#     Args:
#         provider: LLM provider ("OpenAI" or "GoogleGemini")
#         model: Model name (used for extraction, not embedding)
#         embedder_name: Embedding model name
#         module_id: Filter by specific module ID
#         **kwargs: Additional arguments from pipeline calls
        
#     Returns:
#         dict: Result status and details
#     """
    
#     # Handle command line arguments if called as script
#     if provider is None:
#         parser = argparse.ArgumentParser(description="Embed lecture materials from database")
#         parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
#         parser.add_argument("--model", required=True, help="Model name for processing")
#         parser.add_argument("--embedder", help="Embedding model name")
#         parser.add_argument("--module", help="Module ID to filter by")
        
#         args = parser.parse_args()
#         provider = args.provider
#         model = args.model
#         embedder_name = args.embedder
#         module_id = args.module

#     # Set default embedder if not provided
#     if not embedder_name:
#         embedder_name = 'text-embedding-3-small' if provider == 'OpenAI' else 'models/embedding-001'

#     logger.info(f"🔧 Starting lecture material embedding with provider: {provider}")
#     if module_id:
#         logger.info(f"📚 Filtering by module ID: {module_id}")

#     # Initialize embedder
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model_name=embedder_name)
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder(model_name=embedder_name)
#     else:
#         raise ValueError(f"Unsupported provider: {provider}")

#     # Initialize database
#     db = LectureMaterialEmbeddingDB(embedder)
    
#     # Get lecture materials from database
#     materials = get_lecture_materials_from_db(module_id)
    
#     if not materials:
#         logger.warning("⚠️ No lecture materials found in database")
#         db.close()
#         return {
#             "status": "warning",
#             "message": "No lecture materials found",
#             "details": {
#                 "provider": provider,
#                 "module_id": module_id
#             }
#         }

#     processed_count = 0
#     error_count = 0
#     total_chunks = 0

#     try:
#         for material in materials:
#             try:
#                 file_path = material['file_url']
#                 material_id = material['material_id']
#                 module_code = material['module_code']
                
#                 logger.info(f"📄 Processing: {Path(file_path).name}")
#                 logger.info(f"   Module: {module_code} (ID: {material['module_id']})")
                
#                 # Resolve file path and load content
#                 full_path = resolve_file_path(file_path)
                
#                 # Check if file extension is supported
#                 if full_path.suffix.lower() not in ['.pdf', '.docx', '.txt']:
#                     logger.warning(f"Skipping unsupported file type: {full_path.name}")
#                     continue
                
#                 content = read_file(str(full_path))
                
#                 if not content or not content.strip():
#                     logger.warning(f"No content extracted from {full_path.name}")
#                     continue
                
#                 # Clean and chunk the content
#                 cleaned_content = clean_text(content)
#                 chunks = chunk_text(cleaned_content, chunk_size=1000)
                
#                 if not chunks:
#                     logger.warning(f"No chunks created from {full_path.name}")
#                     continue
                
#                 # Create LectureChunk objects
#                 lecture_chunks = []
#                 for i, chunk_text in enumerate(chunks):
#                     chunk = LectureChunk(
#                         module_code=module_code,
#                         source_file=Path(file_path).name,
#                         chunk_id=i,
#                         text=chunk_text,
#                         module_id=material['module_id'] if hasattr(LectureChunk, 'module_id') else None
#                     )
#                     lecture_chunks.append(chunk)
                
#                 # Save chunks to database
#                 db.save_chunks(lecture_chunks, module_id=material['module_id'])
                
#                 processed_count += 1
#                 total_chunks += len(lecture_chunks)
                
#                 logger.info(f"✅ Processed: {Path(file_path).name} ({len(lecture_chunks)} chunks)")
                
#             except Exception as e:
#                 logger.error(f"❌ Error processing {material.get('file_url', 'unknown')}: {e}")
#                 error_count += 1
#                 continue

#         logger.info(f"🎯 Processing complete: {processed_count} files, {total_chunks} chunks, {error_count} errors")
        
#         return {
#             "status": "success",
#             "message": f"Processed {processed_count} lecture material files",
#             "details": {
#                 "provider": provider,
#                 "processed_files": processed_count,
#                 "total_chunks": total_chunks,
#                 "errors": error_count,
#                 "module_id": module_id
#             }
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Critical error during processing: {e}")
#         return {
#             "status": "error", 
#             "message": f"Processing failed: {str(e)}",
#             "details": {
#                 "provider": provider,
#                 "processed_files": processed_count,
#                 "errors": error_count
#             }
#         }
        
#     finally:
#         db.close()


# def embed_lecture_materials(directory: str, module_code: str):
#     """
#     Legacy function for backward compatibility - processes local directory.
#     """
#     logger.warning("Using legacy directory processing mode")
    
#     # Use OpenAI as default for legacy mode
#     embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     db = LectureMaterialEmbeddingDB(embedder)

#     if not os.path.exists(directory):
#         logger.error(f"Directory not found: {directory}")
#         return {"status": "error", "message": "Directory not found"}

#     processed_count = 0
#     error_count = 0

#     try:
#         for filename in os.listdir(directory):
#             file_path = os.path.join(directory, filename)
#             try:
#                 content = read_file(file_path)
#                 cleaned = clean_text(content)
#                 chunks = chunk_text(cleaned)

#                 lecture_chunks = [
#                     LectureChunk(
#                         module_code=module_code,
#                         source_file=filename,
#                         chunk_id=i,
#                         text=chunk
#                     ) for i, chunk in enumerate(chunks)
#                 ]

#                 db.save_chunks(lecture_chunks)
#                 processed_count += 1
#                 logger.info(f"Processed: {filename}")
                
#             except Exception as e:
#                 logger.error(f"Skipping {filename}: {e}")
#                 error_count += 1

#         return {
#             "status": "success",
#             "message": f"Processed {processed_count} files from directory",
#             "details": {
#                 "processed": processed_count,
#                 "errors": error_count,
#                 "directory": directory,
#                 "module_code": module_code
#             }
#         }
        
#     finally:
#         db.close()


# if __name__ == "__main__":
#     result = main()
#     print(f"\n📊 Result: {result}")
    
#     if result["status"] == "error":
#         exit(1)


# """
# Embed all lecture materials from database with assessment-specific filtering.

# Example (PowerShell one-liner):
#   python -m src.scripts.embed_lecture_materials `
#     --provider OpenAI `
#     --model text-embedding-3-small `
#     --embedder text-embedding-3-small `
#     --assessment-id ASS123
# """

# import argparse
# import pathlib
# import logging
# import sys
# import os
# from docx import Document
# import pdfplumber
# from dotenv import load_dotenv
# import psycopg2
# from psycopg2.extras import RealDictCursor

# from src.utils.token_chunker import chunk_text
# from src.models.lecture_chunk import LectureChunk
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.database_services.lecture_material_embedding_db import (
#     LectureMaterialEmbeddingDB,
# )

# load_dotenv()
# logging.basicConfig(level=logging.INFO)
# log = logging.getLogger(__name__)


# # ──────────────────────────────────────────────────────────────────────
# def get_database_connection():
#     """Get database connection using environment variables."""
#     try:
#         conn = psycopg2.connect(
#             host=os.getenv('POSTGRES_HOST'),
#             port=os.getenv('POSTGRES_PORT'),
#             database=os.getenv('POSTGRES_DB'),
#             user=os.getenv('POSTGRES_USER'),
#             password=os.getenv('POSTGRES_PASSWORD')
#         )
#         return conn
#     except Exception as e:
#         log.error(f"Failed to connect to database: {e}")
#         sys.exit(1)


# # ──────────────────────────────────────────────────────────────────────
# def get_assessment_related_lecture_materials(assessment_id):
#     """Retrieve lecture materials related to specific assessment through module and lessons."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT DISTINCT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
#                        lm.uploaded_on, lm.description,
#                        l.lesson_id, l.title as lesson_title,
#                        m.module_id, m.module_code, m.module_name
#                 FROM "Assessment" a
#                 JOIN "Module" m ON a.module_id = m.module_id
#                 JOIN "Lesson" l ON m.module_id = l.module_id
#                 JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
#                 WHERE a.assessment_id = %s
#                 ORDER BY lm.uploaded_on ASC
#             """, (assessment_id,))
            
#             materials = cur.fetchall()
#             log.info(f"Found {len(materials)} lecture materials for assessment {assessment_id}")
#             return materials
            
#     except Exception as e:
#         log.error(f"Database error: {e}")
#         return []
#     finally:
#         conn.close()


# def get_all_lecture_materials_from_db(module_filter=None):
#     """Retrieve lecture material file paths from database."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             if module_filter:
#                 cur.execute("""
#                     SELECT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
#                            lm.uploaded_on, lm.description,
#                            l.module_id
#                     FROM "LectureMaterial" lm
#                     JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
#                     WHERE l.module_id = %s
#                     ORDER BY l.module_id, lm.uploaded_on ASC
#                 """, (module_filter,))
#             else:
#                 cur.execute("""
#                     SELECT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
#                            lm.uploaded_on, lm.description,
#                            l.module_id
#                     FROM "LectureMaterial" lm
#                     JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
#                     ORDER BY l.module_id, lm.uploaded_on ASC
#                 """)
            
#             materials = cur.fetchall()
#             log.info(f"Found {len(materials)} lecture materials in database" + 
#                     (f" for module {module_filter}" if module_filter else ""))
#             return materials
            
#     except Exception as e:
#         log.error(f"Database error: {e}")
#         return []
#     finally:
#         conn.close()


# # ──────────────────────────────────────────────────────────────────────
# def get_available_modules():
#     """Get list of available modules from database."""
#     conn = get_database_connection()
#     try:
#         with conn.cursor() as cur:
#             cur.execute("""
#                 SELECT DISTINCT l.module_id 
#                 FROM "Lesson" l
#                 JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
#                 ORDER BY l.module_id
#             """)
#             modules = [row[0] for row in cur.fetchall()]
#             return modules
#     except Exception as e:
#         log.error(f"Error fetching modules: {e}")
#         return []
#     finally:
#         conn.close()


# # ──────────────────────────────────────────────────────────────────────
# def get_project_root() -> pathlib.Path:
#     """Get the project root directory (current working directory)."""
#     return pathlib.Path.cwd()


# # ──────────────────────────────────────────────────────────────────────
# def read_text(file_path: str) -> str:
#     """Read text from PDF, DOCX, or PowerPoint file."""
#     # The file_path from database is relative to the parent of project root
#     project_root = get_project_root()
#     full_path = project_root.parent / file_path
    
#     log.info(f"Looking for file at: {full_path}")
    
#     if not full_path.exists():
#         # Let's also check if it might be in the project directory itself
#         alternative_path = project_root / file_path
#         log.info(f"Alternative path: {alternative_path}")
        
#         if alternative_path.exists():
#             full_path = alternative_path
#         else:
#             # List what's actually in the expected directory
#             expected_dir = full_path.parent
#             if expected_dir.exists():
#                 files_in_dir = list(expected_dir.iterdir())
#                 log.error(f"Expected directory exists but file not found. Contents: {[f.name for f in files_in_dir]}")
#             else:
#                 log.error(f"Expected directory does not exist: {expected_dir}")
#             raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
#     log.info(f"Successfully found file at: {full_path}")
    
#     if full_path.suffix.lower() == ".docx":
#         doc = Document(full_path)
#         return "\n".join(p.text for p in doc.paragraphs)
#     elif full_path.suffix.lower() == ".pdf":
#         with pdfplumber.open(full_path) as pdf:
#             return "\n".join(p.extract_text() or "" for p in pdf.pages)
#     elif full_path.suffix.lower() in [".ppt", ".pptx"]:
#         # For PowerPoint files, we need python-pptx library
#         try:
#             from pptx import Presentation
#             prs = Presentation(full_path)
#             text_content = []
#             for slide in prs.slides:
#                 for shape in slide.shapes:
#                     if hasattr(shape, "text"):
#                         text_content.append(shape.text)
#             return "\n".join(text_content)
#         except ImportError:
#             raise ImportError("python-pptx library is required for PowerPoint files. Install with: pip install python-pptx")
#     else:
#         raise ValueError(f"Unsupported file type: {full_path.name}")


# # ──────────────────────────────────────────────────────────────────────
# def get_document_identifier(material):
#     """Get a unique identifier for the document to check for duplicates."""
#     # Use file_name if available, otherwise use description or filename from path
#     if material.get('file_name'):
#         return material['file_name']
#     elif material.get('description'):
#         return material['description']
#     else:
#         return pathlib.Path(material['file_url']).name


# # ──────────────────────────────────────────────────────────────────────
# def main() -> None:
#     ap = argparse.ArgumentParser(description="Embed lecture materials from database into vector DB")
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], 
#                    help="Embedding provider")
#     ap.add_argument("--model", required=True, 
#                    help="LLM model name (unused here, for logging)")
#     ap.add_argument("--embedder", default="text-embedding-3-small", 
#                    help="Embedding model ID (e.g., text-embedding-3-small or embedding-001)")
#     ap.add_argument("--module", 
#                    help="Target module code (e.g., EE6250). If not provided, all modules will be processed.")
#     ap.add_argument("--assessment-id", 
#                    help="Target assessment ID to filter related lecture materials")
#     ap.add_argument("--max_tokens", type=int, default=1000)
#     ap.add_argument("--overlap", type=int, default=200)
#     args = ap.parse_args()

#     # Get lecture materials based on filters
#     materials = []
    
#     if args.assessment_id:
#         # Filter lecture materials by assessment
#         log.info(f"Processing lecture materials for assessment: {args.assessment_id}")
#         materials = get_assessment_related_lecture_materials(args.assessment_id)
        
#         if not materials:
#             log.error(f"❌ No lecture materials found for assessment {args.assessment_id}")
#             sys.exit(1)
            
#     elif args.module:
#         # Filter by module
#         available_modules = get_available_modules()
#         if args.module not in available_modules:
#             log.error(f"❌ Module '{args.module}' not found in database")
#             sys.exit(1)
#         log.info(f"Processing specific module: {args.module}")
#         materials = get_all_lecture_materials_from_db(args.module)
        
#     else:
#         # Process all modules
#         log.info("Processing all modules from database")
#         materials = get_all_lecture_materials_from_db()

#     if not materials:
#         log.error("❌ No lecture materials found in database. Please upload some files first.")
#         sys.exit(1)

#     # Group materials by module for better logging
#     modules = {}
#     for material in materials:
#         module_key = material.get('module_code') or material.get('module_id', 'unknown')
#         if module_key not in modules:
#             modules[module_key] = []
#         modules[module_key].append(material)

#     log.info(f"Found {len(materials)} files across {len(modules)} modules: {', '.join(modules.keys())}")

#     # Choose embedder
#     embedder = (
#         OpenAIEmbedder(args.embedder)
#         if args.provider == "OpenAI"
#         else GeminiEmbedder(model_name=args.embedder)
#     )
#     vec_db = LectureMaterialEmbeddingDB(embedder)

#     # Process each material
#     total_chunks = 0
#     processed_files = 0
#     skipped_files = 0
    
#     for material in materials:
#         file_path = material['file_url']
#         file_identifier = get_document_identifier(material)
#         module_key = material.get('module_code') or material.get('module_id', 'unknown')
        
#         # Check if document already exists to avoid duplicates
#         # Use file_identifier for checking duplicates
#         if vec_db.document_exists(module_key, file_identifier):
#             log.info(f"⚠️ [{module_key}] Skipping already embedded document: {file_identifier}")
#             skipped_files += 1
#             continue
        
#         try:
#             log.info(f"📄 [{module_key}] Processing: {file_identifier}")
#             raw_text = read_text(file_path)
            
#             if not raw_text.strip():
#                 log.warning(f"⚠️ No text extracted from {file_identifier}")
#                 continue
            
#             # Create chunks
#             chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)
            
#             # Create LectureChunk objects
#             lecture_chunks = [
#                 LectureChunk(
#                     module_code=module_key, 
#                     source_file=file_identifier, 
#                     chunk_id=idx, 
#                     text=txt
#                 )
#                 for idx, txt in enumerate(chunks) if txt.strip()
#             ]
            
#             if lecture_chunks:
#                 log.info(f"   → Saving {len(lecture_chunks)} chunks")
#                 vec_db.save_chunks(lecture_chunks)
#                 total_chunks += len(lecture_chunks)
#                 processed_files += 1
#             else:
#                 log.warning(f"⚠️ No valid chunks created from {file_identifier}")
                
#         except Exception as e:
#             log.error(f"❌ Error processing {file_identifier}: {e}")
#             continue

#     vec_db.close()
    
#     # Final summary
#     print(f"\n✅ Embedding Summary:")
#     print(f"   • Processed files: {processed_files}")
#     print(f"   • Skipped files: {skipped_files}")
#     print(f"   • Total chunks created: {total_chunks}")
#     print(f"   • Modules: {', '.join(modules.keys())}")
#     if args.assessment_id:
#         print(f"   • Assessment ID: {args.assessment_id}")
    
#     if processed_files > 0:
#         print(f"🎉 Successfully embedded {processed_files} files with {total_chunks} chunks!")
#     else:
#         print("⚠️ No new files were processed")


# if __name__ == "__main__":
#     main()

"""
Embed all lecture materials from database with assessment-specific filtering.

Example (PowerShell one-liner):
  python -m src.scripts.embed_lecture_materials `
    --provider OpenAI `
    --model text-embedding-3-small `
    --embedder text-embedding-3-small `
    --assessment-id ASS123
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
def get_assessment_related_lecture_materials(assessment_id):
    """Retrieve lecture materials related to specific assessment through module and lessons."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
                       lm.uploaded_on, lm.description,
                       l.lesson_id, l.title as lesson_title,
                       m.module_id, m.module_code, m.module_name
                FROM "Assessment" a
                JOIN "Module" m ON a.module_id = m.module_id
                JOIN "Lesson" l ON m.module_id = l.module_id
                JOIN "LectureMaterial" lm ON l.lesson_id = lm.lesson_id
                WHERE a.assessment_id = %s
                ORDER BY lm.uploaded_on ASC
            """, (assessment_id,))
            
            materials = cur.fetchall()
            log.info(f"Found {len(materials)} lecture materials for assessment {assessment_id}")
            return materials
            
    except Exception as e:
        log.error(f"Database error: {e}")
        return []
    finally:
        conn.close()


def get_all_lecture_materials_from_db(module_filter=None):
    """Retrieve lecture material file paths from database."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if module_filter:
                cur.execute("""
                    SELECT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
                           lm.uploaded_on, lm.description,
                           l.module_id
                    FROM "LectureMaterial" lm
                    JOIN "Lesson" l ON lm.lesson_id = l.lesson_id
                    WHERE l.module_id = %s
                    ORDER BY l.module_id, lm.uploaded_on ASC
                """, (module_filter,))
            else:
                cur.execute("""
                    SELECT lm.material_id, lm.lesson_id, lm.file_name, lm.file_url, 
                           lm.uploaded_on, lm.description,
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
def get_document_identifier(material):
    """Get a unique identifier for the document to check for duplicates."""
    # Use file_name if available, otherwise use description or filename from path
    if material.get('file_name'):
        return material['file_name']
    elif material.get('description'):
        return material['description']
    else:
        return pathlib.Path(material['file_url']).name


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
    ap.add_argument("--assessment-id", 
                   help="Target assessment ID to filter related lecture materials")
    ap.add_argument("--max_tokens", type=int, default=1000)
    ap.add_argument("--overlap", type=int, default=200)
    args = ap.parse_args()

    # Get lecture materials based on filters
    materials = []
    
    if args.assessment_id:
        # Filter lecture materials by assessment
        log.info(f"Processing lecture materials for assessment: {args.assessment_id}")
        materials = get_assessment_related_lecture_materials(args.assessment_id)
        
        if not materials:
            log.error(f"❌ No lecture materials found for assessment {args.assessment_id}")
            sys.exit(1)
            
    elif args.module:
        # Filter by module
        available_modules = get_available_modules()
        if args.module not in available_modules:
            log.error(f"❌ Module '{args.module}' not found in database")
            sys.exit(1)
        log.info(f"Processing specific module: {args.module}")
        materials = get_all_lecture_materials_from_db(args.module)
        
    else:
        # Process all modules
        log.info("Processing all modules from database")
        materials = get_all_lecture_materials_from_db()

    if not materials:
        log.error("❌ No lecture materials found in database. Please upload some files first.")
        sys.exit(1)

    # Group materials by module for better logging
    modules = {}
    for material in materials:
        module_key = material.get('module_code') or material.get('module_id', 'unknown')
        if module_key not in modules:
            modules[module_key] = []
        modules[module_key].append(material)

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
        file_identifier = get_document_identifier(material)
        module_key = material.get('module_code') or material.get('module_id', 'unknown')
        
        # Check if document already exists to avoid duplicates
        # Pass assessment_id to check for existing embeddings
        if vec_db.document_exists(module_key, file_identifier, args.assessment_id):
            log.info(f"⚠️ [{module_key}] Skipping already embedded document: {file_identifier} (Assessment: {args.assessment_id})")
            skipped_files += 1
            continue
        
        try:
            log.info(f"📄 [{module_key}] Processing: {file_identifier}")
            raw_text = read_text(file_path)
            
            if not raw_text.strip():
                log.warning(f"⚠️ No text extracted from {file_identifier}")
                continue
            
            # Create chunks
            chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)
            
            # Create LectureChunk objects
            lecture_chunks = [
                LectureChunk(
                    assessment_id=args.assessment_id,
                    module_code=module_key, 
                    source_file=file_identifier, 
                    chunk_id=idx, 
                    text=txt
                )
                for idx, txt in enumerate(chunks) if txt.strip()
            ]
            
            if lecture_chunks:
                log.info(f"   → Saving {len(lecture_chunks)} chunks")
                # Pass assessment_id when saving chunks
                vec_db.save_chunks(lecture_chunks, args.assessment_id)
                total_chunks += len(lecture_chunks)
                processed_files += 1
            else:
                log.warning(f"⚠️ No valid chunks created from {file_identifier}")
                
        except Exception as e:
            log.error(f"❌ Error processing {file_identifier}: {e}")
            continue

    vec_db.close()
    
    # Final summary
    print(f"\n✅ Embedding Summary:")
    print(f"   • Processed files: {processed_files}")
    print(f"   • Skipped files: {skipped_files}")
    print(f"   • Total chunks created: {total_chunks}")
    print(f"   • Modules: {', '.join(modules.keys())}")
    if args.assessment_id:
        print(f"   • Assessment ID: {args.assessment_id}")
    
    if processed_files > 0:
        print(f"🎉 Successfully embedded {processed_files} files with {total_chunks} chunks!")
    else:
        print("⚠️ No new files were processed")


if __name__ == "__main__":
    main()