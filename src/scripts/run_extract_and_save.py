

# # # # # # import sys
# # # # # # import os
# # # # # # from docx import Document
# # # # # # from pprint import pprint

# # # # # # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # # # # # from src.services.answer_extractor import AnswerExtractor
# # # # # # from src.services.database_services.student_answer_db import StudentAnswerService

# # # # # # def load_docx_text(docx_path: str) -> str:
# # # # # #     doc = Document(docx_path)
# # # # # #     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

# # # # # # if __name__ == "__main__":
# # # # # #     import argparse
# # # # # #     parser = argparse.ArgumentParser(description="Extract and save ALL student answers using LLMs")
# # # # # #     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
# # # # # #     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-1.5-flash)")
# # # # # #     parser.add_argument("--folder", default="data/Answer_Scripts", help="Folder with DOCX files")

# # # # # #     args = parser.parse_args()

# # # # # #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

# # # # # #     for filename in os.listdir(args.folder):
# # # # # #         if filename.lower().endswith(".docx"):
# # # # # #             filepath = os.path.join(args.folder, filename)
# # # # # #             print(f"\n📄 Processing: {filename}")

# # # # # #             try:
# # # # # #                 raw_text = load_docx_text(filepath)
# # # # # #                 answers = extractor.extract_answers_with_llm(raw_text)

# # # # # #                 if not answers:
# # # # # #                     print("❌ No answers extracted.")
# # # # # #                     continue

# # # # # #                 # Print preview
# # # # # #                 pprint([
# # # # # #                     {"question": ans.full_question_id, "answer": ans.answer_text}
# # # # # #                     for ans in answers
# # # # # #                 ])

# # # # # #                 first = answers[0]
# # # # # #                 db = StudentAnswerService(provider_suffix=args.provider)
# # # # # #                 db.initialize_table()
# # # # # #                 db.save_answers(
# # # # # #                     student_index=first.student_index,
# # # # # #                     module_code=first.module_code,
# # # # # #                     year=first.exam_year,
# # # # # #                     month=first.exam_month,
# # # # # #                     answers=answers
# # # # # #                 )
# # # # # #                 db.close()
# # # # # #                 print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
# # # # # #             except Exception as e:
# # # # # #                 print(f"❌ Failed to process {filename}: {e}")

# # # # # import sys
# # # # # import os
# # # # # import time
# # # # # from docx import Document
# # # # # from pprint import pprint

# # # # # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # # # # from src.services.answer_extractor import AnswerExtractor
# # # # # from src.services.database_services.student_answer_db import StudentAnswerService

# # # # # def load_docx_text(docx_path: str) -> str:
# # # # #     doc = Document(docx_path)
# # # # #     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

# # # # # def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
# # # # #     filename = os.path.basename(docx_path)
# # # # #     print(f"\n📄 Processing: {filename}")

# # # # #     try:
# # # # #         raw_text = load_docx_text(docx_path)
# # # # #         answers = extractor.extract_answers_with_llm(raw_text)

# # # # #         if not answers:
# # # # #             print("❌ No answers extracted.")
# # # # #             return

# # # # #         # Preview the result
# # # # #         pprint([
# # # # #             {"question": ans.full_question_id, "answer": ans.answer_text}
# # # # #             for ans in answers
# # # # #         ])

# # # # #         # Save to database
# # # # #         first = answers[0]
# # # # #         db = StudentAnswerService(provider_suffix=provider)
# # # # #         db.initialize_table()
# # # # #         db.save_answers(
# # # # #             student_index=first.student_index,
# # # # #             module_code=first.module_code,
# # # # #             year=first.exam_year,
# # # # #             month=first.exam_month,
# # # # #             answers=answers
# # # # #         )
# # # # #         db.close()

# # # # #         print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
# # # # #     except Exception as e:
# # # # #         print(f"❌ Failed to process {filename}: {e}")

# # # # # if __name__ == "__main__":
# # # # #     import argparse

# # # # #     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
# # # # #     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"], help="LLM provider")
# # # # #     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash)")
# # # # #     parser.add_argument("--folder", required=True, help="Single DOCX file or folder containing DOCX files")

# # # # #     args = parser.parse_args()
# # # # #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

# # # # #     if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
# # # # #         # Single file mode
# # # # #         extract_and_save(args.folder, extractor, args.provider)
# # # # #     elif os.path.isdir(args.folder):
# # # # #         # Folder mode
# # # # #         for filename in os.listdir(args.folder):
# # # # #             if filename.lower().endswith(".docx"):
# # # # #                 filepath = os.path.join(args.folder, filename)
# # # # #                 extract_and_save(filepath, extractor, args.provider)

# # # # #                 # Delay to respect Gemini rate limits (15 requests/min)
# # # # #                 if args.provider == "GoogleGemini":
# # # # #                     time.sleep(10)
# # # # #     else:
# # # # #         print("❌ Invalid --folder path. Must be either a .docx file or a directory.")


# # # # import sys
# # # # import os
# # # # import time
# # # # from docx import Document
# # # # from pprint import pprint

# # # # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # # # from src.services.answer_extractor import AnswerExtractor
# # # # from src.services.database_services.student_answer_db import StudentAnswerService


# # # # def load_docx_text(docx_path: str) -> str:
# # # #     doc = Document(docx_path)
# # # #     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])


# # # # def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
# # # #     filename = os.path.basename(docx_path)
# # # #     print(f"\n📄 Processing: {filename}")

# # # #     try:
# # # #         raw_text = load_docx_text(docx_path)
# # # #         answers = extractor.extract_answers_with_llm(raw_text)

# # # #         if not answers:
# # # #             print("❌ No answers extracted.")
# # # #             return

# # # #         # Preview the result
# # # #         pprint([
# # # #             {"question": ans.full_question_id, "answer": ans.answer_text}
# # # #             for ans in answers
# # # #         ])

# # # #         # Save to database
# # # #         first = answers[0]
# # # #         db = StudentAnswerService(provider_suffix=provider)
# # # #         db.initialize_table()
# # # #         db.save_answers(
# # # #             student_index=first.student_index,
# # # #             module_code=first.module_code,
# # # #             year=first.exam_year,
# # # #             month=first.exam_month,
# # # #             answers=answers
# # # #         )
# # # #         db.close()

# # # #         print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
# # # #     except Exception as e:
# # # #         print(f"❌ Failed to process {filename}: {e}")


# # # # if __name__ == "__main__":
# # # #     import argparse

# # # #     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
# # # #     parser.add_argument(
# # # #         "--provider",
# # # #         required=True,
# # # #         choices=["OpenAI", "GoogleGemini", "DeepSeek"],
# # # #         help="LLM provider"
# # # #     )
# # # #     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:1.5b)")
# # # #     parser.add_argument("--folder", required=True, help="Single DOCX file or folder containing DOCX files")

# # # #     args = parser.parse_args()
# # # #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

# # # #     if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
# # # #         # Single file mode
# # # #         extract_and_save(args.folder, extractor, args.provider)
# # # #     elif os.path.isdir(args.folder):
# # # #         # Folder mode
# # # #         for filename in os.listdir(args.folder):
# # # #             if filename.lower().endswith(".docx"):
# # # #                 filepath = os.path.join(args.folder, filename)
# # # #                 extract_and_save(filepath, extractor, args.provider)

# # # #                 # Delay to respect Gemini rate limits (15 requests/min)
# # # #                 if args.provider == "GoogleGemini":
# # # #                     time.sleep(10)
# # # #                 elif args.provider == "DeepSeek":
# # # #                     # Optional: add a small delay if needed for Ollama local model
# # # #                     time.sleep(1)
# # # #     else:
# # # #         print("❌ Invalid --folder path. Must be either a .docx file or a directory.")


# # # import sys
# # # import os
# # # import time
# # # from docx import Document
# # # from pprint import pprint

# # # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # # from src.services.answer_extractor import AnswerExtractor
# # # from src.services.database_services.student_answer_db import StudentAnswerService


# # # def load_docx_text(docx_path: str) -> str:
# # #     doc = Document(docx_path)
# # #     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])


# # # def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
# # #     filename = os.path.basename(docx_path)
# # #     print(f"\n📄 Processing: {filename}")

# # #     try:
# # #         raw_text = load_docx_text(docx_path)
# # #         answers = extractor.extract_answers_with_llm(raw_text)

# # #         if not answers:
# # #             print("❌ No answers extracted.")
# # #             return

# # #         # Preview the result
# # #         pprint([{"question": ans.full_question_id, "answer": ans.answer_text} for ans in answers])

# # #         # Save to database
# # #         first = answers[0]
# # #         db = StudentAnswerService(provider_suffix=provider)
# # #         db.initialize_table()
# # #         db.save_answers(
# # #             student_index=first.student_index,
# # #             module_code=first.module_code,
# # #             year=first.exam_year,
# # #             month=first.exam_month,
# # #             answers=answers
# # #         )
# # #         db.close()

# # #         print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
# # #     except Exception as e:
# # #         print(f"❌ Failed to process {filename}: {e}")


# # # if __name__ == "__main__":
# # #     import argparse

# # #     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
# # #     parser.add_argument(
# # #         "--provider",
# # #         required=True,
# # #         choices=["OpenAI", "GoogleGemini", "DeepSeek"],  # DeepSeek included
# # #         help="LLM provider"
# # #     )
# # #     parser.add_argument(
# # #         "--model",
# # #         required=True,
# # #         help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:7b)"
# # #     )
# # #     parser.add_argument(
# # #         "--folder",
# # #         required=True,
# # #         help="Single DOCX file or folder containing DOCX files"
# # #     )

# # #     args = parser.parse_args()
# # #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

# # #     if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
# # #         # Single file mode
# # #         extract_and_save(args.folder, extractor, args.provider)

# # #     elif os.path.isdir(args.folder):
# # #         # Folder mode
# # #         for filename in os.listdir(args.folder):
# # #             if filename.lower().endswith(".docx"):
# # #                 filepath = os.path.join(args.folder, filename)
# # #                 extract_and_save(filepath, extractor, args.provider)

# # #                 # Optional delay to prevent rate limits or CPU overload
# # #                 if args.provider == "GoogleGemini":
# # #                     time.sleep(10)  # Gemini rate limits
# # #                 elif args.provider == "DeepSeek":
# # #                     time.sleep(1)   # Ollama local model small delay

# # #     else:
# # #         print("❌ Invalid --folder path. Must be either a .docx file or a directory.")


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

# #     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
# #     parser.add_argument(
# #         "--provider",
# #         required=True,
# #         choices=["OpenAI", "GoogleGemini", "DeepSeek"],  # ✅ Added DeepSeek
# #         help="LLM provider"
# #     )
# #     parser.add_argument(
# #         "--model",
# #         required=True,
# #         help="Model name (e.g., gpt-4o, gemini-pro, deepseek-r1-distill-llama-70b)"
# #     )
# #     parser.add_argument(
# #         "--file",
# #         default="data/Answer_Scripts/EE6250_EG-2020-4247.docx",
# #         help="Path to DOCX answer script"
# #     )

# #     args = parser.parse_args()

# #     # 1. Load answer script text
# #     raw_text = load_docx_text(args.file)

# #     # 2. Extract answers (and metadata) using LLM
# #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)
# #     answers = extractor.extract_answers_with_llm(raw_text)

# #     if not answers:
# #         print("❌ No answers extracted.")
# #         sys.exit(1)

# #     # ✅ Print extracted answers for verification
# #     print("\n🧾 Extracted Answers (before saving to DB):\n")
# #     pprint([
# #         {
# #             "question": ans.full_question_id,
# #             "answer": ans.answer_text
# #         }
# #         for ans in answers
# #     ])

# #     # 3. Save answers to DB
# #     first = answers[0]
# #     db = StudentAnswerService()
# #     db.initialize_table()
# #     db.save_answers(
# #         student_index=first.student_index,
# #         module_code=first.module_code,
# #         year=first.exam_year,
# #         month=first.exam_month,
# #         answers=answers
# #     )
# #     db.close()

# #     print(f"\n✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")


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
#     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek"], help="LLM provider")  # ✅ Added DeepSeek
#     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:7b)")
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
from docx import Document
from pprint import pprint

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.services.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService

def load_docx_text(docx_path: str) -> str:
    doc = Document(docx_path)
    return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

def get_provider_suffix(provider: str) -> str:
    """Map provider names to database suffixes"""
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

        # Preview the result
        pprint([
            {"question": ans.full_question_id, "answer": ans.answer_text}
            for ans in answers
        ])

        # Save to database - use the mapped provider suffix from extractor
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
    parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:7b,unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit)")
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

                # Delay to respect Gemini rate limits (15 requests/min)
                if args.provider == "GoogleGemini":
                    time.sleep(10)
                # Add delay for DeepSeek if needed
                elif args.provider == "DeepSeek":
                    time.sleep(5)  # Adjust as needed for DeepSeek rate limits
                elif args.provider == "LocalFinetunedDeepSeek":
                    time.sleep(5) 
    else:
        print("❌ Invalid --folder path. Must be either a .docx file or a directory.")

# import sys
# import os
# import time
# from docx import Document
# from pprint import pprint
# import re
# import json

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# from src.services.answer_extractor import AnswerExtractor
# from src.services.database_services.student_answer_db import StudentAnswerService

# def load_docx_text(docx_path: str) -> str:
#     doc = Document(docx_path)
#     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

# def get_provider_suffix(provider: str) -> str:
#     """Map provider names to database suffixes"""
#     mapping = {
#         "LocalFinetunedDeepSeek": "localfinetuneddeepseek",
#         "DeepSeek": "deepseek",
#         "GoogleGemini": "gemini",
#         "OpenAI": "openai"
#     }
#     return mapping.get(provider, provider.lower())

# def parse_plain_text_to_json(raw_text: str) -> dict:
#     """
#     Converts plain extracted text to structured JSON.
#     Assumes the text contains:
#     - Index Number
#     - Module
#     - Exam Year & Month
#     - QnA with sub-parts
#     """
#     metadata = {}
#     answers = {}

#     # Extract metadata
#     index_match = re.search(r"Index Number:\s*(.*)", raw_text)
#     if index_match:
#         metadata["student_index"] = index_match.group(1).strip()
#     module_match = re.search(r"(Module|Module Code):\s*(.*)", raw_text)
#     if module_match:
#         metadata["module_code"] = module_match.group(2).strip()
#     exam_match = re.search(r"(\d{4})\s+([A-Za-z]+)", raw_text)
#     if exam_match:
#         metadata["exam_year"] = int(exam_match.group(1))
#         metadata["exam_month"] = exam_match.group(2)

#     # Split into questions by pattern Q<number>)
#     question_blocks = re.split(r"(Q\d+)\.", raw_text)
#     for i in range(1, len(question_blocks), 2):
#         q_num = question_blocks[i].strip()
#         q_text = question_blocks[i + 1].strip()
#         # Find sub-questions (i), (ii), etc.
#         sub_answers = re.split(r"\(([ivxlcdm]+)\)", q_text)
#         if len(sub_answers) > 1:
#             sub_dict = {}
#             for j in range(1, len(sub_answers), 2):
#                 key = sub_answers[j].strip()
#                 value = sub_answers[j + 1].strip().replace("\n\n", "\n")
#                 sub_dict[key] = value
#             answers[q_num] = sub_dict
#         else:
#             answers[q_num] = q_text.strip()

#     return {"metadata": metadata, "answers": answers}

# def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
#     filename = os.path.basename(docx_path)
#     print(f"\n📄 Processing: {filename}")

#     try:
#         raw_text = load_docx_text(docx_path)
#         extracted = extractor.extract_answers_with_llm(raw_text)

#         if provider == "LocalFinetunedDeepSeek":
#             # If output is plain text, convert to structured JSON
#             if isinstance(extracted, str):
#                 json_data = parse_plain_text_to_json(extracted)
#             elif isinstance(extracted, list):
#                 # Sometimes fine-tuned models return a list of strings
#                 json_data = parse_plain_text_to_json("\n".join(extracted))
#             else:
#                 json_data = extracted
#             pprint(json_data)

#             # Save to DB
#             metadata = json_data.get("metadata", {})
#             answers_list = []
#             for q_num, sub_dict in json_data.get("answers", {}).items():
#                 if isinstance(sub_dict, dict):
#                     for sub_num, ans_text in sub_dict.items():
#                         answers_list.append(
#                             type("Answer", (object,), {
#                                 "full_question_id": f"{q_num}_{sub_num}",
#                                 "answer_text": ans_text,
#                                 "student_index": metadata.get("student_index"),
#                                 "module_code": metadata.get("module_code"),
#                                 "exam_year": metadata.get("exam_year"),
#                                 "exam_month": metadata.get("exam_month")
#                             })()
#                         )
#                 else:
#                     answers_list.append(
#                         type("Answer", (object,), {
#                             "full_question_id": q_num,
#                             "answer_text": sub_dict,
#                             "student_index": metadata.get("student_index"),
#                             "module_code": metadata.get("module_code"),
#                             "exam_year": metadata.get("exam_year"),
#                             "exam_month": metadata.get("exam_month")
#                         })()
#                     )

#             if not answers_list:
#                 print("❌ No answers extracted.")
#                 return

#             provider_suffix = get_provider_suffix(provider)
#             db = StudentAnswerService(provider_suffix=provider_suffix)
#             db.initialize_table()
#             db.save_answers(
#                 student_index=metadata.get("student_index"),
#                 module_code=metadata.get("module_code"),
#                 year=metadata.get("exam_year"),
#                 month=metadata.get("exam_month"),
#                 answers=answers_list
#             )
#             db.close()
#             print(f"✅ Saved answers for {metadata.get('student_index')} | {metadata.get('module_code')} | {metadata.get('exam_year')}-{metadata.get('exam_month')}")
#         else:
#             # Existing behavior for other providers
#             if not extracted:
#                 print("❌ No answers extracted.")
#                 return

#             pprint([{"question": ans.full_question_id, "answer": ans.answer_text} for ans in extracted])
#             first = extracted[0]
#             provider_suffix = extractor.provider_suffix
#             db = StudentAnswerService(provider_suffix=provider_suffix)
#             db.initialize_table()
#             db.save_answers(
#                 student_index=first.student_index,
#                 module_code=first.module_code,
#                 year=first.exam_year,
#                 month=first.exam_month,
#                 answers=extracted
#             )
#             db.close()
#             print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")

#     except Exception as e:
#         print(f"❌ Failed to process {filename}: {e}")


# if __name__ == "__main__":
#     import argparse

#     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
#     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini", "DeepSeek", "LocalFinetunedDeepSeek"], help="LLM provider")
#     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1:7b,unsloth/DeepSeek-R1-Distill-Qwen-7B-unsloth-bnb-4bit)")
#     parser.add_argument("--folder", required=True, help="Single DOCX file or folder containing DOCX files")

#     args = parser.parse_args()
#     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

#     if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
#         extract_and_save(args.folder, extractor, args.provider)
#     elif os.path.isdir(args.folder):
#         for filename in os.listdir(args.folder):
#             if filename.lower().endswith(".docx"):
#                 filepath = os.path.join(args.folder, filename)
#                 extract_and_save(filepath, extractor, args.provider)

#                 # Rate limiting
#                 if args.provider == "GoogleGemini":
#                     time.sleep(10)
#                 elif args.provider in ["DeepSeek", "LocalFinetunedDeepSeek"]:
#                     time.sleep(5)
#     else:
#         print("❌ Invalid --folder path. Must be either a .docx file or a directory.")
