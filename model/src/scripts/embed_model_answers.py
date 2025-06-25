import argparse
import sys, os
from docx import Document

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.controller.embed_model_answers_controller import embed_model_answers

def load_docx_text(path):
    doc = Document(path)
    return "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--file", required=True)
    args = parser.parse_args()

    try:
        raw_text = load_docx_text(args.file)
        embed_model_answers(provider=args.provider, model_name=args.model, file_text=raw_text)
    except Exception as e:
        print(f"Failed: {e}")

# import argparse
# import sys, os
# import fitz  # PyMuPDF

# # ✅ Add src path
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# from src.controller.embed_model_answers_controller import embed_model_answers

# def load_pdf_text(pdf_path: str) -> str:
#     if not os.path.exists(pdf_path):
#         raise FileNotFoundError(f"File not found: {pdf_path}")
    
#     doc = fitz.open(pdf_path)
#     text = "\n".join(page.get_text() for page in doc)
#     doc.close()
#     return text

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Extract and embed model answers from PDF")
#     parser.add_argument("--provider", required=True, help="OpenAI or GoogleGemini")
#     parser.add_argument("--model", required=True, help="e.g., gpt-4o, gemini-pro")
#     parser.add_argument("--file", default="data/Answer_Scripts/Model_Answers.pdf", help="Path to PDF file")
#     args = parser.parse_args()

#     try:
#         raw_text = load_pdf_text(args.file)
#         embed_model_answers(provider=args.provider, model_name=args.model, file_text=raw_text)
#         print(f"Successfully embedded model answers using {args.provider}")
#     except Exception as e:
#         print(f"Failed: {e}")
