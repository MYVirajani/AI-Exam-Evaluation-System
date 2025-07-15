# import os
# from pathlib import Path
# from typing import List

# def is_valid_pdf(file_path: str) -> bool:
#     """Check if file is a valid PDF."""
#     return Path(file_path).is_file() and file_path.lower().endswith('.pdf')

# def get_file_size(file_path: str) -> int:
#     """Get file size in bytes."""
#     return os.path.getsize(file_path)

# def ensure_directory_exists(directory: str):
#     """Create directory if it does not exist."""
#     os.makedirs(directory, exist_ok=True)

# def list_pdf_files(directory: str) -> List[str]:
#     """List all PDF files in a directory."""
#     return [str(f) for f in Path(directory).rglob("*.pdf")]

import os
import re
from pathlib import Path
from typing import List
from docx import Document

def is_valid_pdf(file_path: str) -> bool:
    """Check if file is a valid PDF."""
    return Path(file_path).is_file() and file_path.lower().endswith('.pdf')

def is_valid_docx(file_path: str) -> bool:
    """Check if file is a valid DOCX."""
    return Path(file_path).is_file() and file_path.lower().endswith('.docx')

def get_file_size(file_path: str) -> int:
    """Get file size in bytes."""
    return os.path.getsize(file_path)

def ensure_directory_exists(directory: str):
    """Create directory if it does not exist."""
    os.makedirs(directory, exist_ok=True)

def list_pdf_files(directory: str) -> List[str]:
    """List all PDF files in a directory."""
    return [str(f) for f in Path(directory).rglob("*.pdf")]

def list_docx_files(directory: str) -> List[str]:
    """List all DOCX files in a directory."""
    return [str(f) for f in Path(directory).rglob("*.docx")]

def read_docx_text(file_path: str) -> str:
    """Extract full text from a DOCX file."""
    doc = Document(file_path)
    text = "\n".join(para.text for para in doc.paragraphs)
    return text.strip()

def clean_text(text: str) -> str:
    """Normalize extracted DOCX text for prompt readiness."""
    text = text.replace('\xa0', ' ')     # non-breaking space
    text = text.replace('\t', ' ')       # tabs
    text = re.sub(r' +', ' ', text)      # multiple spaces
    text = re.sub(r'\n{2,}', '\n', text) # extra newlines
    return text.strip()
