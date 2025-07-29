

import sys
import os
from docx import Document
from pprint import pprint

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService

def load_docx_text(docx_path: str) -> str:
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Extract and save ALL student answers using LLMs")
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
    parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-1.5-flash)")
    parser.add_argument("--folder", default="data/Answer_Scripts", help="Folder with DOCX files")

    args = parser.parse_args()

    extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

    for filename in os.listdir(args.folder):
        if filename.lower().endswith(".docx"):
            filepath = os.path.join(args.folder, filename)
            print(f"\n📄 Processing: {filename}")

            try:
                raw_text = load_docx_text(filepath)
                answers = extractor.extract_answers_with_llm(raw_text)

                if not answers:
                    print("❌ No answers extracted.")
                    continue

                # Print preview
                pprint([
                    {"question": ans.full_question_id, "answer": ans.answer_text}
                    for ans in answers
                ])

                first = answers[0]
                db = StudentAnswerService(provider_suffix=args.provider)
                db.initialize_table()
                db.save_answers(
                    student_index=first.student_index,
                    module_code=first.module_code,
                    year=first.exam_year,
                    month=first.exam_month,
                    answers=answers
                )
                db.close()
                print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
            except Exception as e:
                print(f"❌ Failed to process {filename}: {e}")
