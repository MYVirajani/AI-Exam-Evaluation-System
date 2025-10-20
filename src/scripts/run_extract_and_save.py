import sys
import os
import time
import pathlib
import json
import re
from docx import Document
from pprint import pprint
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import pdfplumber
import argparse

# Add root path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia


# --------------------------------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------------------------------

def load_docx_text(docx_path: str) -> str:
    """Read text content from a DOCX file."""
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])


def get_provider_suffix(provider: str) -> str:
    """Map provider names to database suffixes."""
    mapping = {
        "DeepSeek": "deepseek",
        "GoogleGemini": "gemini",
        "OpenAI": "openai"
    }
    return mapping.get(provider, provider.lower())


# --------------------------------------------------------------------------
# MAIN EXTRACTION AND SAVE FUNCTION
# --------------------------------------------------------------------------

def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
    filename = os.path.basename(docx_path)
    print(f"\n📄 Processing: {filename}")
    print(f"🔗 Submission ID: {submission_id}")
    print(f"👤 Student: {student_registration_number}")
    print(f"📚 Module: {module_code}")
    print(f"🆔 Assessment: {assessment_id}")

    try:
        # Check if already extracted
        if check_submission_already_extracted(submission_id, provider_suffix):
            print(f"⚠️ Submission {submission_id} already extracted, skipping...")
            return True

        # Load file content
        full_path = resolve_file_path(file_path)
        raw_text = load_file_text(str(full_path))
        
        # Enhanced extraction with robust error handling
        answers = None
        max_extraction_attempts = 3
        
        for attempt in range(max_extraction_attempts):
            try:
                print(f"🔄 Extraction attempt {attempt + 1}/{max_extraction_attempts}")
                answers = extractor.extract_answers_with_llm(raw_text)
                
                if answers:
                    print(f"✅ Successfully extracted {len(answers)} answers on attempt {attempt + 1}")
                    break
                else:
                    print(f"⚠️ No answers extracted on attempt {attempt + 1}")
                    
            except json.JSONDecodeError as json_error:
                print(f"❌ JSON parsing error on attempt {attempt + 1}: {json_error}")
                
                if "Invalid control character" in str(json_error):
                    print("🔧 Detected control character issue - this might be due to LLM response formatting")
                    
                    # If this is not the last attempt, wait and retry
                    if attempt < max_extraction_attempts - 1:
                        print(f"⏳ Waiting 10 seconds before retry...")
                        time.sleep(10)
                        continue
                    else:
                        print("💥 All extraction attempts failed due to JSON parsing errors")
                        answers = None
                        break
                else:
                    # For other JSON errors, re-raise immediately
                    raise json_error
                    
            except Exception as other_error:
                print(f"❌ Other error on attempt {attempt + 1}: {other_error}")
                if attempt == max_extraction_attempts - 1:
                    raise other_error
                else:
                    print(f"⏳ Waiting 10 seconds before retry...")
                    time.sleep(10)
                    continue

        if not answers:
            print("❌ No answers extracted.")
            return

        # ------------------------------------------------------------------
        # PREVIEW EXTRACTED RESULTS
        # ------------------------------------------------------------------
        print("\n🧾 Extracted Answers Preview:")
        for ans in answers:
            print(f"• {ans.full_question_id}:")
            print(f"   📝 {ans.answer_text[:120]}{'...' if len(ans.answer_text) > 120 else ''}")
            if ans.media_urls:
                print(f"   🖼️ Media URLs: {ans.media_urls}")
            else:
                print("   🖼️ Media URLs: None")

        # ------------------------------------------------------------------
        # SAVE TO PROVIDER-SPECIFIC TABLE
        # ------------------------------------------------------------------
        first = answers[0]
        provider_suffix = extractor.provider_suffix

        db = StudentAnswerService(provider_suffix=provider_suffix)
        db.initialize_table()
        
        # Save answers with submission tracking
        db.save_answers_with_submission_tracking(
            student_index=student_registration_number,
            module_code=module_code.upper(),
            year=year,
            month=month,
            answers=answers,
            submission_id=submission_id,
            assessment_id=assessment_id
        )
        db.close()

        print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")

        # ------------------------------------------------------------------
        # SAVE TO NORMALIZED TABLES (only if provider == OpenAI)
        # ------------------------------------------------------------------
        if provider.lower() == "openai":
            print("🗄️  Also saving answers in normalized tables (student_answer + student_answer_media)...")
            db_media = StudentAnswerServiceWithMedia()
            db_media.initialize_tables()
            db_media.save_answers(answers)
            db_media.close()
            print("✅ Successfully saved in normalized tables.")

    except Exception as e:
        print(f"❌ Failed to process {filename}: {e}")


# --------------------------------------------------------------------------
# MAIN SCRIPT ENTRY
# --------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], help="LLM provider")
    parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:7b)")
    parser.add_argument("--folder", required=True, help="Single DOCX file or folder containing DOCX files")

    args = parser.parse_args()
    extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

    if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
        # Single file mode
        extract_and_save(args.folder, extractor, args.provider)

    elif os.path.isdir(args.folder):
        # Folder mode
        for filename in os.listdir(args.folder):
            if filename.lower().endswith(".docx"):
                filepath = os.path.join(args.folder, filename)
                extract_and_save(filepath, extractor, args.provider)

                # Delay for provider rate limits
                if args.provider == "GoogleGemini":
                    time.sleep(10)
                elif args.provider == "DeepSeek":
                    time.sleep(5)

    else:
        print("❌ Invalid --folder path. Must be either a .docx file or a directory.")
