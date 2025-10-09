

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

import argparse, pathlib, logging, sys
from docx import Document
import pdfplumber
from dotenv import load_dotenv

from src.utils.token_chunker import chunk_text
from src.models.lecture_chunk import LectureChunk
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB

load_dotenv()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ────────────────────────────────────────────────
def read_text(path: pathlib.Path) -> str:
    if path.suffix.lower() == ".docx":
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    if path.suffix.lower() == ".pdf":
        with pdfplumber.open(path) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    raise ValueError(f"Unsupported file type: {path.name}")

# ────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser(description="Embed lecture materials into vector DB")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], help="Embedding provider")
    ap.add_argument("--model", required=True, help="LLM model name (unused here, for logging)")
    ap.add_argument("--embedder", default="text-embedding-3-small", help="Embedding model ID (e.g., text-embedding-3-small or embedding-001)")
    ap.add_argument("--root", default="data/Lecture_Material", help="Root directory containing module folders")
    ap.add_argument("--module", help="Target module code (e.g., EE6250)")
    ap.add_argument("--max_tokens", type=int, default=1000)
    ap.add_argument("--overlap", type=int, default=200)
    args = ap.parse_args()

    # Prompt for module if not provided
    if not args.module:
        print("📚 Available modules under", args.root)
        for p in pathlib.Path(args.root).iterdir():
            if p.is_dir():
                print(" •", p.name)
        args.module = input("\nEnter module code to embed: ").strip()

    module_dir = pathlib.Path(args.root) / args.module
    if not module_dir.exists():
        log.error("❌ Folder does not exist: %s", module_dir)
        sys.exit(1)

    # Choose embedder
    provider_override = None
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(args.embedder)
    elif args.provider == "GoogleGemini":
        embedder = GeminiEmbedder(model_name=args.embedder)
    elif args.provider == "DeepSeek":
        print("⚠️ DeepSeek selected: using OpenAI embeddings but saving in DeepSeek table")
        embedder = OpenAIEmbedder("text-embedding-3-small")
        provider_override = "deepseek"
    else:
        raise ValueError(f"Unsupported provider: {args.provider}")

    # Create vector DB instance
    vec_db = LectureMaterialEmbeddingDB(embedder, provider_override=provider_override)

    # Scan files
    files = list(module_dir.rglob("*"))
    valid_files = [f for f in files if f.suffix.lower() in {".pdf", ".docx"}]
    if not valid_files:
        log.warning("⚠️ No supported files found in %s", module_dir)
        sys.exit(0)

    for f in valid_files:
        file_name = f.name
        if vec_db.document_exists(args.module, file_name):
            log.info("⚠️ Skipping already embedded document: %s", file_name)
            continue

        log.info("📄 Processing: %s", f.relative_to(module_dir))
        try:
            raw_text = read_text(f)
            chunks = chunk_text(raw_text, max_tokens=args.max_tokens, overlap=args.overlap)

            lecture_chunks = [
                LectureChunk(module_code=args.module, source_file=file_name, chunk_id=i, text=txt)
                for i, txt in enumerate(chunks) if txt.strip()
            ]

            log.info("   → Saving %d chunks", len(lecture_chunks))
            vec_db.save_chunks(lecture_chunks)

        except Exception as e:
            log.error("   ❌ Error processing %s: %s", f.name, str(e))

    vec_db.close()
    print(f"✅ Finished embedding for module: {args.module}")

# ────────────────────────────────────────────────
if __name__ == "__main__":
    main()
