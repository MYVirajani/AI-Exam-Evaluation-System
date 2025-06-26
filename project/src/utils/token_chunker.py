# import pdfplumber
# from docx import Document
# import openpyxl

# def read_txt(file_path):
#     with open(file_path, 'r', encoding='utf-8') as f:
#         return f.read()

# def read_pdf(file_path):
#     with pdfplumber.open(file_path) as pdf:
#         return '\n'.join(page.extract_text() for page in pdf.pages if page.extract_text())

# def read_docx(file_path):
#     doc = Document(file_path)
#     return '\n'.join(para.text for para in doc.paragraphs)

# def read_excel(file_path):
#     wb = openpyxl.load_workbook(file_path)
#     content = []
#     for sheet in wb.worksheets:
#         for row in sheet.iter_rows(values_only=True):
#             line = ' | '.join(str(cell) for cell in row if cell is not None)
#             if line:
#                 content.append(line)
#     return '\n'.join(content)

# def read_file(file_path):
#     if file_path.endswith('.txt'):
#         return read_txt(file_path)
#     elif file_path.endswith('.pdf'):
#         return read_pdf(file_path)
#     elif file_path.endswith('.docx'):
#          return read_docx(file_path)
#     elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
#         return read_excel(file_path)
#     else:
#         raise ValueError(f"Unsupported file format: {file_path}")


import textwrap

# If you have tiktoken, use it; otherwise fall back to simple split.
try:
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
    def count_tokens(s: str) -> int: return len(enc.encode(s))
    def tokens_to_text(tokens): return enc.decode(tokens)
except ImportError:
    enc = None
    def count_tokens(s: str) -> int: return len(s.split())        # ≈words
    def tokens_to_text(tokens): return " ".join(tokens)

def chunk_text(text: str,
               max_tokens: int = 1000,
               overlap: int = 200) -> list[str]:
    """
    Sliding-window chunking: 1000-token windows with 200-token overlap.
    """
    if enc is None:
        words = text.split()
        step  = max_tokens - overlap
        return [
            " ".join(words[i : i + max_tokens])
            for i in range(0, len(words), step)
        ]

    tokens = enc.encode(text)
    step   = max_tokens - overlap
    return [
        tokens_to_text(tokens[i : i + max_tokens])
        for i in range(0, len(tokens), step)
    ]
