import sys
import os
import time
from docx import Document
from pprint import pprint
from dotenv import load_dotenv

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.extractors.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia


# --------------------------------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------------------------------

def load_docx_text(docx_path: str) -> str:
    """Read text content from a DOCX file."""
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])


# --------------------------------------------------------------------------
# MAIN EXTRACTION AND SAVE FUNCTION
# --------------------------------------------------------------------------

def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
    """Extract answers from a DOCX and save them into provider-specific and normalized tables."""
    filename = os.path.basename(docx_path)
    submission_id = os.path.splitext(filename)[0]  # ✅ Remove .docx extension
    print(f"\n📄 Processing: {filename}")
    print(f"🆔 Using submission_id: {submission_id}")

    try:
        # ------------------------------------------------------------------
        # LOAD AND EXTRACT ANSWERS
        # ------------------------------------------------------------------
        raw_text = load_docx_text(docx_path)
        answers = extractor.extract_answers_with_llm(raw_text)

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
            if getattr(ans, "media_urls", None):
                print(f"   🖼️ Media URLs: {ans.media_urls}")
            else:
                print("   🖼️ Media URLs: None")

        # ------------------------------------------------------------------
        # SAVE TO DATABASE
        # ------------------------------------------------------------------
        first = answers[0]

        print(f"✅ Saving answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")

        # ✅ Normalized tables (student_answer + student_answer_media)
        print("🗄️  Saving answers in normalized tables...")
        db_media = StudentAnswerServiceWithMedia(ai_model=provider)
        db_media._ensure_tables_exist()
        db_media.save_answers(answers=answers, submission_id=submission_id)
        db_media.close()
        print(f"✅ Successfully saved in normalized tables for submission_id={submission_id}.")

    except Exception as e:
        print(f"❌ Failed to process {filename}: {e}")


# --------------------------------------------------------------------------
# MAIN SCRIPT ENTRY
# --------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse

    load_dotenv()

    parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
    parser.add_argument(
        "--provider",
        required=True,
        choices=["openai", "gemini", "deepseek"],
        help="LLM provider to use (reads model + temperature from .env)"
    )
    parser.add_argument(
        "--folder",
        required=True,
        help="Single DOCX file or folder containing DOCX files"
    )

    args = parser.parse_args()

    # ----------------------------------------------------------------------
    # READ MODEL + TEMPERATURE FROM .env
    # ----------------------------------------------------------------------
    provider_key = args.provider.lower()

    provider_env_key = f"{provider_key.upper()}_PROVIDER"
    model_env_key = f"{provider_key.upper()}_MODEL"
    temp_env_key = f"{provider_key.upper()}_TEMPERATURE"

    selected_provider = os.getenv(provider_env_key)
    selected_model = os.getenv(model_env_key)
    temperature = float(os.getenv(temp_env_key, 0.3))

    if not selected_provider or not selected_model:
        raise ValueError(f"❌ Missing environment configuration for {args.provider} in .env file.")

    print(f"🔧 Loaded config from .env → Provider: {selected_provider}, Model: {selected_model}, Temp: {temperature}")

    extractor = AnswerExtractor(provider=selected_provider)


    # ----------------------------------------------------------------------
    # PROCESS SINGLE FILE OR FOLDER
    # ----------------------------------------------------------------------
    if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
        extract_and_save(args.folder, extractor, selected_provider)

    elif os.path.isdir(args.folder):
        for filename in os.listdir(args.folder):
            if filename.lower().endswith(".docx"):
                filepath = os.path.join(args.folder, filename)
                extract_and_save(filepath, extractor, selected_provider)

                # Optional rate limiting by provider
                if provider_key == "gemini":
                    time.sleep(10)
                elif provider_key == "deepseek":
                    time.sleep(5)
    else:
        print("❌ Invalid --folder path. Must be either a .docx file or a directory.")
