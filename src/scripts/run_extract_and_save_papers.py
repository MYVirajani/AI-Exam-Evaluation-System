import sys
import os
import time
from docx import Document
from pprint import pprint

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService

def load_docx_text(docx_path: str) -> str:
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

def standardize_index(student: str) -> str:
    """Convert EG/2020/4034 → EG20204034 for matching."""
    return student.replace("/", "").replace("-", "").replace("_", "").upper()

def get_provider_suffix(provider: str) -> str:
    mapping = {
        "LocalFinetunedDeepSeek": "localfinetuneddeepseek",
        "DeepSeek": "deepseek",
        "GoogleGemini": "gemini",
        "OpenAI": "openai"
    }
    return mapping.get(provider, provider.lower())

def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
    filename = os.path.basename(docx_path)
    print(f"\n📄 Processing: {filename}")

    try:
        raw_text = load_docx_text(docx_path)
        answers = extractor.extract_answers_with_llm(raw_text)

        if not answers:
            print("❌ No answers extracted.")
            return

        pprint([
            {"question": ans.full_question_id, "answer": ans.answer_text}
            for ans in answers
        ])

        first = answers[0]
        provider_suffix = extractor.provider_suffix
        db = StudentAnswerService(provider_suffix=provider_suffix)
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

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek", "LocalFinetunedDeepSeek"], help="LLM provider")
    parser.add_argument("--model", required=True, help="Model name")
    parser.add_argument("--folder", required=True, help="DOCX file or folder containing DOCX files")
    parser.add_argument("--student", help="One or multiple student indexes, separated by commas (ex: EG/2020/4034,EG/2020/4055)")

    args = parser.parse_args()
    extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

    # -----------------------------
    # SINGLE DOCX MODE
    # -----------------------------
    if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
        extract_and_save(args.folder, extractor, args.provider)
        sys.exit(0)

    # -----------------------------
    # FOLDER MODE
    # -----------------------------
    if os.path.isdir(args.folder):
        files = sorted([f for f in os.listdir(args.folder) if f.lower().endswith(".docx")])

        # -----------------------------
        # MULTI-STUDENT MODE
        # -----------------------------
        if args.student:
            # Split comma-separated student indexes
            student_list_raw = args.student.split(",")
            students = [standardize_index(s.strip()) for s in student_list_raw]

            print(f"🎯 Target students: {student_list_raw}")
            print(f"🔍 Matching keys: {students}")

            matched = []

            for f in files:
                normalized_filename = f.replace("-", "").replace("_", "").replace(" ", "").upper()

                for stu_key in students:
                    if stu_key in normalized_filename:
                        matched.append(f)
                        break  # avoid duplicate add for same file

            if not matched:
                print(f"❌ No files found for students: {args.student}")
                sys.exit(1)

            print(f"📌 Matched files: {matched}")

            # Process each matched file
            for filename in matched:
                filepath = os.path.join(args.folder, filename)
                extract_and_save(filepath, extractor, args.provider)

                if args.provider == "GoogleGemini":
                    time.sleep(10)
                elif args.provider in ["DeepSeek", "LocalFinetunedDeepSeek"]:
                    time.sleep(5)

            sys.exit(0)

        # -----------------------------
        # RUN ALL PAPERS
        # -----------------------------
        for filename in files:
            filepath = os.path.join(args.folder, filename)
            extract_and_save(filepath, extractor, args.provider)

            if args.provider == "GoogleGemini":
                time.sleep(10)
            elif args.provider in ["DeepSeek", "LocalFinetunedDeepSeek"]:
                time.sleep(5)

    else:
        print("❌ Invalid --folder path. Must be .docx file or directory.")
