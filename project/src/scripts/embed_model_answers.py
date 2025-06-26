# # import argparse
# # import sys, os
# # from docx import Document

# # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # from src.controller.embed_model_answers_controller import embed_model_answers

# # def load_docx_text(path):
# #     doc = Document(path)
# #     return "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])

# # if __name__ == "__main__":
# #     parser = argparse.ArgumentParser()
# #     parser.add_argument("--provider", required=True)
# #     parser.add_argument("--model", required=True)
# #     parser.add_argument("--file", required=True)
# #     args = parser.parse_args()

# #     try:
# #         raw_text = load_docx_text(args.file)
# #         embed_model_answers(provider=args.provider, model_name=args.model, file_text=raw_text)
# #     except Exception as e:
# #         print(f"Failed: {e}")

# # import argparse
# # import sys, os
# # import fitz  # PyMuPDF

# # # ✅ Add src path
# # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # from src.controller.embed_model_answers_controller import embed_model_answers

# # def load_pdf_text(pdf_path: str) -> str:
# #     if not os.path.exists(pdf_path):
# #         raise FileNotFoundError(f"File not found: {pdf_path}")
    
# #     doc = fitz.open(pdf_path)
# #     text = "\n".join(page.get_text() for page in doc)
# #     doc.close()
# #     return text

# # if __name__ == "__main__":
# #     parser = argparse.ArgumentParser(description="Extract and embed model answers from PDF")
# #     parser.add_argument("--provider", required=True, help="OpenAI or GoogleGemini")
# #     parser.add_argument("--model", required=True, help="e.g., gpt-4o, gemini-pro")
# #     parser.add_argument("--file", default="data/Answer_Scripts/Model_Answers.pdf", help="Path to PDF file")
# #     args = parser.parse_args()

# #     try:
# #         raw_text = load_pdf_text(args.file)
# #         embed_model_answers(provider=args.provider, model_name=args.model, file_text=raw_text)
# #         print(f"Successfully embedded model answers using {args.provider}")
# #     except Exception as e:
# #         print(f"Failed: {e}")
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
# from src.services.model_answer_extractor import ModelAnswerExtractor
# from src.services.database_services.model_answer_embedding_db import (
#     ModelAnswerEmbeddingDB,
# )


# def _make_embedder(provider: str, model: str):
#     return OpenAIEmbedder(model) if provider == "OpenAI" else GeminiEmbedder(model)


# def run_model_answer_pipeline(file_path: str, provider: str, model: str):
#     extractor = ModelAnswerExtractor(provider, model)
#     answers = extractor.extract(file_path)

#     embedder = _make_embedder(provider, model)
#     vector_db = ModelAnswerEmbeddingDB(embedder)
#     vector_db.save_embeddings(answers)


#!/usr/bin/env python
# """
# CLI:
#   python -m scripts.embed_model_answers \
#          --provider OpenAI --model gpt-4o-mini \
#          --embedder text-embedding-3-small \
#          --root data/Model_Answers
# """
# import argparse, pathlib, logging

# from docx import Document                                  # pip install python-docx
# import pdfplumber                                          # pip install pdfplumber
# from src.services.model_answer_extractor import ModelAnswerExtractor
# from src.services.embedding.openai_embedder  import OpenAIEmbedder
# from src.services.embedding.gemini_embedder  import GeminiEmbedder
# from src.services.database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB

# logging.basicConfig(level=logging.INFO)

# def read_text(path: pathlib.Path) -> str:
#     if path.suffix.lower() == ".docx":
#         doc = Document(path)
#         return "\n".join(p.text for p in doc.paragraphs)
#     if path.suffix.lower() == ".pdf":
#         with pdfplumber.open(path) as pdf:
#             return "\n".join(p.extract_text() or "" for p in pdf.pages)
#     raise ValueError(f"Unsupported file type: {path.name}")

# # -------------------------------------------------------------------------
# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
#     ap.add_argument("--model",    required=True, help="LLM used for extraction")
#     ap.add_argument("--embedder", default="text-embedding-3-small")
#     ap.add_argument("--root",     default="data/Model_Answers")
#     args = ap.parse_args()

#     print(f"[bold]⏳ Scanning {args.root} ...[/]")
#     root = pathlib.Path(args.root)

#     extractor = ModelAnswerExtractor(args.provider, args.model)
#     embedder  = (OpenAIEmbedder(args.embedder) if args.provider=="OpenAI"
#                  else GeminiEmbedder())
#     vec_db    = ModelAnswerEmbeddingDB(embedder)

#     for file in root.glob("*"):
#         if not file.suffix.lower() in {".docx", ".pdf"}:  # skip others
#             continue

#         print(f"→ {file.name}")
#         raw = read_text(file)
#         answers = extractor.extract(raw)
#         vec_db.save_embeddings(answers)

#     vec_db.close()
#     print("[green]✅ Done.[/]")

# if __name__ == "__main__":
#     main()


"""
Run from the project root:

  python -m src.scripts.embed_model_answers \
         --provider OpenAI \
         --model gpt-4o \
         --embedder text-embedding-3-small \
         --root data/Model_Answers
"""

import argparse
import logging
import pathlib
from typing import Iterable

from docx import Document          # pip install python-docx
import pdfplumber                  # pip install pdfplumber
from rich import print             # pip install rich

# project imports
from src.services.model_answer_extractor import ModelAnswerExtractor
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.model_answer_embedding_db import (
    ModelAnswerEmbeddingDB,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
    ap.add_argument(
        "--root",
        default="data/Model_Answers",
        help="Folder holding .pdf / .docx model answers",
    )
    ap.add_argument(
        "--ext",
        nargs="*",
        default=[".pdf", ".docx"],
        help="File extensions to process (default: .pdf .docx)",
    )

    args = ap.parse_args()
    root = pathlib.Path(args.root)

    if not root.exists():
        logger.error("Root folder does not exist: %s", root)
        return

    print(f"[bold]⏳ Scanning [cyan]{root}[/] …[/]")

    extractor = ModelAnswerExtractor(args.provider, args.model)

    # choose embedding backend
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(args.embedder)
    else:  # GoogleGemini
        embedder = GeminiEmbedder(model_name=args.embedder)

    vec_db = ModelAnswerEmbeddingDB(embedder)

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
"""
Run from the project root:

  python -m src.scripts.embed_model_answers \
         --provider OpenAI \
         --model gpt-4o \
         --embedder text-embedding-3-small \
         --root data/Model_Answers
"""

import argparse
import logging
import pathlib
from typing import Iterable

from docx import Document          # pip install python-docx
import pdfplumber                  # pip install pdfplumber
from rich import print             # pip install rich

# project imports
from src.services.model_answer_extractor import ModelAnswerExtractor
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.model_answer_embedding_db import (
    ModelAnswerEmbeddingDB,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
    ap.add_argument(
        "--root",
        default="data/Model_Answers",
        help="Folder holding .pdf / .docx model answers",
    )
    ap.add_argument(
        "--ext",
        nargs="*",
        default=[".pdf", ".docx"],
        help="File extensions to process (default: .pdf .docx)",
    )

    args = ap.parse_args()
    root = pathlib.Path(args.root)

    if not root.exists():
        logger.error("Root folder does not exist: %s", root)
        return

    print(f"[bold]⏳ Scanning [cyan]{root}[/] …[/]")

    extractor = ModelAnswerExtractor(args.provider, args.model)

    # choose embedding backend
    if args.provider == "OpenAI":
        embedder = OpenAIEmbedder(args.embedder)
    else:  # GoogleGemini
        embedder = GeminiEmbedder(model_name=args.embedder)

    vec_db = ModelAnswerEmbeddingDB(embedder)

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
