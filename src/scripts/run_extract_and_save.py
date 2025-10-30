import sys
import os
import time
from docx import Document
from pprint import pprint

# Add project root to sys.path
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
        # SAVE TO PROVIDER-SPECIFIC TABLE
        # ------------------------------------------------------------------
        first = answers[0]
        provider_suffix = extractor.provider_suffix

        # db = StudentAnswerService(provider_suffix=provider_suffix)
        # db.initialize_table()
        # db.save_answers(
        #     student_index=first.student_index,
        #     module_code=first.module_code,
        #     year=first.exam_year,
        #     month=first.exam_month,
        #     answers=answers
        # )
        # db.close()

        print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")

        # ------------------------------------------------------------------
        # SAVE TO NORMALIZED TABLES (only if provider == OpenAI)
        # ------------------------------------------------------------------
        # if provider.lower() == "openai":
        print("🗄️  Also saving answers in normalized tables (student_answer + student_answer_media)...")
        db_media = StudentAnswerServiceWithMedia(ai_model=extractor.selected_model)
        db_media._ensure_tables_exist()

            # ✅ Corrected call to match the function definition
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

    parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
    parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"],
                        help="LLM provider")
    parser.add_argument("--model", required=True,
                        help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:7b)")
    parser.add_argument("--folder", required=True,
                        help="Single DOCX file or folder containing DOCX files")

    args = parser.parse_args()
    extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

    # ----------------------------------------------------------------------
    # PROCESS SINGLE FILE OR FOLDER
    # ----------------------------------------------------------------------
    if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
        # Single file mode
        extract_and_save(args.folder, extractor, args.provider)

    elif os.path.isdir(args.folder):
        # Folder mode
        for filename in os.listdir(args.folder):
            if filename.lower().endswith(".docx"):
                filepath = os.path.join(args.folder, filename)
                extract_and_save(filepath, extractor, args.provider)

                # Add rate-limit delay depending on provider
                if args.provider == "GoogleGemini":
                    time.sleep(10)
                elif args.provider == "DeepSeek":
                    time.sleep(5)

    else:
        print("❌ Invalid --folder path. Must be either a .docx file or a directory.")
