import sys
import os
from docx import Document

# ✅ Fix import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.answer_extractor import AnswerExtractor

def load_docx_text(docx_path: str) -> str:
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test student answer extraction using LLMs")
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
    parser.add_argument("--model", required=True)
    parser.add_argument("--file", required=True)

    args = parser.parse_args()

    raw_text = load_docx_text(args.file)

    extractor = AnswerExtractor(
        selected_provider=args.provider,
        selected_model=args.model
    )

    answers = extractor.extract_answers_with_llm(raw_text)

    print(f"\nExtracted Answers using {args.provider} ({args.model}):\n" + "-" * 60)
    for ans in answers:
        label = f"{ans.question_id})" if not ans.sub_question_id else f"{ans.question_id}) {ans.sub_question_id})"
        print(label)
        print(f"Answer: {ans.answer_text}\n")
