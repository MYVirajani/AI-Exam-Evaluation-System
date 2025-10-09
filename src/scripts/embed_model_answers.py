

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

import argparse
import logging
import pathlib
from typing import Iterable
from docx import Document
import pdfplumber
from rich import print

from src.services.model_answer_extractor import ModelAnswerExtractor
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def read_text(path: pathlib.Path) -> str:
    if path.suffix.lower() == ".docx":
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    elif path.suffix.lower() == ".pdf":
        with pdfplumber.open(path) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    raise ValueError(f"Unsupported file type: {path.name}")


def iter_files(root: pathlib.Path, patterns: Iterable[str]) -> Iterable[pathlib.Path]:
    for file in root.rglob("*"):
        if file.suffix.lower() in patterns and file.is_file():
            yield file


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract & embed model answers")
    ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"])
    ap.add_argument("--model", required=True, help="LLM model name (e.g. gpt-4o, gemini-1.5-pro, deepseek-chat)")
    ap.add_argument("--embedder", default="text-embedding-3-small", help="Embedding model name")
    ap.add_argument("--root", default="data/Model_Answers", help="Root folder of model answers")
    ap.add_argument("--ext", nargs="*", default=[".pdf", ".docx"], help="File extensions (default: .pdf .docx)")
    args = ap.parse_args()

    root = pathlib.Path(args.root)
    if not root.exists():
        logger.error("Root folder does not exist: %s", root)
        return

    print(f"[bold]⏳ Scanning [cyan]{root}[/] …[/]")

    extractor = ModelAnswerExtractor(args.provider, args.model)

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

    # Vector DB
    vec_db = ModelAnswerEmbeddingDB(embedder, provider_override=provider_override)
    file_patterns = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in args.ext}

    processed = 0
    for file in iter_files(root, file_patterns):
        processed += 1
        print(f"→ {file.relative_to(root)}")
        raw_text = read_text(file)

        answers = extractor.extract(raw_text)
        vec_db.save_embeddings(answers)

    vec_db.close()
    msg = "No model-answer files found." if processed == 0 else f"✅ Done. {processed} file(s) processed."
    print(f"[green]{msg}[/]")


if __name__ == "__main__":
    main()

