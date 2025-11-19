import re

def clean_text(text: str) -> str:
    """Remove extra whitespace/newlines."""
    return re.sub(r"\s+", " ", text).strip()


def chunk_text(text: str, max_tokens: int = 350, overlap: int = 50):
    """
    Chunk text into overlapping segments.
    max_tokens is approx token count (1 token ~ 4 chars).
    """
    text = clean_text(text)
    approx_chars = max_tokens * 4

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + approx_chars
        chunk = text[start:end]

        # Do not split mid-sentence → extend to nearest '.' or newline
        last_period = chunk.rfind(".")
        if last_period != -1 and end < text_length:
            end = start + last_period + 1
            chunk = text[start:end]

        chunks.append(chunk.strip())
        start = max(0, end - overlap * 4)  # overlap in chars

    return chunks
