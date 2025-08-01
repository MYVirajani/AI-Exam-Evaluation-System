

# # import sys
# # import os
# # from docx import Document
# # from pprint import pprint

# # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # from src.services.answer_extractor import AnswerExtractor
# # from src.services.database_services.student_answer_db import StudentAnswerService

# # def load_docx_text(docx_path: str) -> str:
# #     doc = Document(docx_path)
# #     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

# # if __name__ == "__main__":
# #     import argparse
# #     parser = argparse.ArgumentParser(description="Extract and save ALL student answers using LLMs")
# #     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
# #     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-1.5-flash)")
# #     parser.add_argument("--folder", default="data/Answer_Scripts", help="Folder with DOCX files")

# #     args = parser.parse_args()

# #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

# #     for filename in os.listdir(args.folder):
# #         if filename.lower().endswith(".docx"):
# #             filepath = os.path.join(args.folder, filename)
# #             print(f"\n📄 Processing: {filename}")

# #             try:
# #                 raw_text = load_docx_text(filepath)
# #                 answers = extractor.extract_answers_with_llm(raw_text)

# #                 if not answers:
# #                     print("❌ No answers extracted.")
# #                     continue

# #                 # Print preview
# #                 pprint([
# #                     {"question": ans.full_question_id, "answer": ans.answer_text}
# #                     for ans in answers
# #                 ])

# #                 first = answers[0]
# #                 db = StudentAnswerService(provider_suffix=args.provider)
# #                 db.initialize_table()
# #                 db.save_answers(
# #                     student_index=first.student_index,
# #                     module_code=first.module_code,
# #                     year=first.exam_year,
# #                     month=first.exam_month,
# #                     answers=answers
# #                 )
# #                 db.close()
# #                 print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
# #             except Exception as e:
# #                 print(f"❌ Failed to process {filename}: {e}")

# import sys
# import os
# import time
# from docx import Document
# from pprint import pprint

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# from src.services.answer_extractor import AnswerExtractor
# from src.services.database_services.student_answer_db import StudentAnswerService

# def load_docx_text(docx_path: str) -> str:
#     doc = Document(docx_path)
#     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

# def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
#     filename = os.path.basename(docx_path)
#     print(f"\n📄 Processing: {filename}")

#     try:
#         raw_text = load_docx_text(docx_path)
#         answers = extractor.extract_answers_with_llm(raw_text)

#         if not answers:
#             print("❌ No answers extracted.")
#             return

#         # Preview the result
#         pprint([
#             {"question": ans.full_question_id, "answer": ans.answer_text}
#             for ans in answers
#         ])

#         # Save to database
#         first = answers[0]
#         db = StudentAnswerService(provider_suffix=provider)
#         db.initialize_table()
#         db.save_answers(
#             student_index=first.student_index,
#             module_code=first.module_code,
#             year=first.exam_year,
#             month=first.exam_month,
#             answers=answers
#         )
#         db.close()

#         print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
#     except Exception as e:
#         print(f"❌ Failed to process {filename}: {e}")

# if __name__ == "__main__":
#     import argparse

#     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
#     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
#     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash)")
#     parser.add_argument("--folder", required=True, help="Single DOCX file or folder containing DOCX files")

#     args = parser.parse_args()
#     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

#     if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
#         # Single file mode
#         extract_and_save(args.folder, extractor, args.provider)
#     elif os.path.isdir(args.folder):
#         # Folder mode
#         for filename in os.listdir(args.folder):
#             if filename.lower().endswith(".docx"):
#                 filepath = os.path.join(args.folder, filename)
#                 extract_and_save(filepath, extractor, args.provider)

#                 # Delay to respect Gemini rate limits (15 requests/min)
#                 if args.provider == "GoogleGemini":
#                     time.sleep(10)
#     else:
#         print("❌ Invalid --folder path. Must be either a .docx file or a directory.")


import sys
import os
import time
import pathlib
from docx import Document
from pprint import pprint
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import pdfplumber

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService

load_dotenv()

def get_database_connection():
    """Get database connection using environment variables."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            port=os.getenv('POSTGRES_PORT'),
            database=os.getenv('POSTGRES_DB'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD')
        )
        return conn
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        sys.exit(1)

def get_submissions_from_db():
    """Retrieve all submission file paths from database using new schema."""
    conn = get_database_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT submission_id, assessment_id, student_id, file_url, submission_time 
                FROM "Submission" 
                ORDER BY assessment_id, submission_time ASC
            """)
            
            submissions = cur.fetchall()
            print(f"Found {len(submissions)} submissions in database")
            return submissions
            
    except Exception as e:
        print(f"Database error: {e}")
        return []
    finally:
        conn.close()

def resolve_file_path(file_path: str) -> pathlib.Path:
    """Resolve database file path to actual file location."""
    project_root = pathlib.Path.cwd()
    # Try parent directory first (where data folder should be)
    full_path = project_root.parent / file_path
    
    if not full_path.exists():
        # Try alternative path in project directory
        alternative_path = project_root / file_path
        if alternative_path.exists():
            full_path = alternative_path
        else:
            raise FileNotFoundError(f"File not found at: {full_path} or {alternative_path}")
    
    return full_path

def load_docx_text(docx_path: str) -> str:
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

def load_pdf_text(pdf_path: str) -> str:
    with pdfplumber.open(pdf_path) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)

def load_file_text(file_path: str) -> str:
    """Load text from file based on extension."""
    path_obj = pathlib.Path(file_path)
    if path_obj.suffix.lower() == '.docx':
        return load_docx_text(file_path)
    elif path_obj.suffix.lower() == '.pdf':
        return load_pdf_text(file_path)
    else:
        raise ValueError(f"Unsupported file format: {path_obj.suffix}")

def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
    filename = os.path.basename(docx_path)
    print(f"\n📄 Processing: {filename}")

    try:
        raw_text = load_docx_text(docx_path)
        answers = extractor.extract_answers_with_llm(raw_text)

        if not answers:
            print("❌ No answers extracted.")
            return

        # Preview the result
        pprint([
            {"question": ans.full_question_id, "answer": ans.answer_text}
            for ans in answers
        ])

        # Save to database
        first = answers[0]
        db = StudentAnswerService(provider_suffix=provider)
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
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
    parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash)")
    parser.add_argument("--folder", help="Single DOCX file or folder containing DOCX files")
    parser.add_argument("--from-db", action="store_true", help="Process files from database instead of folder")

    args = parser.parse_args()
    extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

    if args.from_db:
        # Database mode - process all files from database
        submissions = get_submissions_from_db()
        
        if not submissions:
            print("No submissions found in database.")
            sys.exit(1)
        
        # Process all files from database
        db = StudentAnswerService(provider_suffix=args.provider)
        db.initialize_table()
        
        for submission in submissions:
            try:
                file_path = submission['file_url']
                assessment_id = submission['assessment_id']
                student_id = submission['student_id']
                
                print(f"\n📄 Processing: {pathlib.Path(file_path).name} (Assessment: {assessment_id}, Student: {student_id})")
                
                # Resolve file path and load text
                full_path = resolve_file_path(file_path)
                raw_text = load_file_text(str(full_path))
                
                # Extract answers using LLM
                answers = extractor.extract_answers_with_llm(raw_text)

                if not answers:
                    print("❌ No answers extracted.")
                    continue

                # Print extracted answers for verification
                print("\nExtracted Answers (before saving to DB):\n")
                pprint([
                    {
                        "question": ans.full_question_id,
                        "answer": ans.answer_text
                    }
                    for ans in answers
                ])

                # Save answers to DB
                first = answers[0]
                db.save_answers(
                    student_index=first.student_index,
                    module_code=first.module_code,
                    year=first.exam_year,
                    month=first.exam_month,
                    answers=answers
                )

                print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
                
                # Delay to respect Gemini rate limits (15 requests/min)
                if args.provider == "GoogleGemini":
                    time.sleep(10)
                
            except Exception as e:
                print(f"❌ Error processing {pathlib.Path(submission['file_url']).name}: {e}")
                continue
        
        db.close()
        
    elif args.folder:
        # Original folder/file mode
        if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
            # Single file mode
            extract_and_save(args.folder, extractor, args.provider)
        elif os.path.isdir(args.folder):
            # Folder mode
            for filename in os.listdir(args.folder):
                if filename.lower().endswith(".docx"):
                    filepath = os.path.join(args.folder, filename)
                    extract_and_save(filepath, extractor, args.provider)

                    # Delay to respect Gemini rate limits (15 requests/min)
                    if args.provider == "GoogleGemini":
                        time.sleep(10)
        else:
            print("❌ Invalid --folder path. Must be either a .docx file or a directory.")
    else:
        print("❌ Please specify either --folder for file/folder mode or --from-db for database mode.")