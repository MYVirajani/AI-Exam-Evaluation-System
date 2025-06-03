import os
from pathlib import Path
from typing import List

def is_valid_pdf(file_path: str) -> bool:
    """Check if file is a valid PDF."""
    return Path(file_path).is_file() and file_path.lower().endswith('.pdf')

def get_file_size(file_path: str) -> int:
    """Get file size in bytes."""
    return os.path.getsize(file_path)

def ensure_directory_exists(directory: str):
    """Create directory if it does not exist."""
    os.makedirs(directory, exist_ok=True)

def list_pdf_files(directory: str) -> List[str]:
    """List all PDF files in a directory."""
    return [str(f) for f in Path(directory).rglob("*.pdf")]