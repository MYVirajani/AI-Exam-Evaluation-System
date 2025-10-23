# import os
# import json
# from json_creator.parser import load_text_from_pdf
# from json_creator.extractor import extract_metadata

# def get_pdf_text(prompt_msg, optional=False):
#     path = input(prompt_msg).strip()
#     if not path:
#         return "" if optional else None

#     if not os.path.exists(path) or not path.endswith(".pdf"):
#         if optional:
#             print(f"⚠️ Optional file '{path}' not found. Skipping...")
#             return ""
#         else:
#             raise FileNotFoundError(f"❌ Required file '{path}' not found.")
    
#     return load_text_from_pdf(path)

# def process_answer_scripts():
#     print("📄 Please provide the following file paths (press Enter to skip optional ones):")

#     qp_text = get_pdf_text("📘 Path to *Question Paper* PDF: ")
#     model_text = get_pdf_text("📗 Path to *Model Answers* PDF (optional): ", optional=True)
#     rubric_text = get_pdf_text("📕 Path to *Marking Scheme* PDF (optional): ", optional=True)

#     answer_dir = input("📂 Path to *Answer Scripts* folder: ").strip()
#     if not os.path.isdir(answer_dir):
#         raise NotADirectoryError(f"❌ Invalid folder path: {answer_dir}")

#     output_dir = "outputs"
#     os.makedirs(output_dir, exist_ok=True)

#     for file in os.listdir(answer_dir):
#         if not file.endswith(".pdf"):
#             continue

#         file_id = os.path.splitext(file)[0]
#         print(f"🔍 Processing: {file_id}")

#         answer_text = load_text_from_pdf(os.path.join(answer_dir, file))

#         results = []
#         for question_no in ["Q1-i", "Q1-ii", "Q1-iii", "Q2-i"]:  # Customize this list
#             result = extract_metadata(qp_text, model_text, rubric_text, answer_text, file_id, question_no)
#             results.append(result)

#         # Save result to separate file
#         output_path = os.path.join(output_dir, f"{file_id}.json")
#         with open(output_path, "w") as f:
#             json.dump(results, f, indent=2)
#         print(f"✅ Output saved to: {output_path}")

# if __name__ == "__main__":
#     try:
#         process_answer_scripts()
#         print("🎉 All answer scripts processed.")
#     except Exception as e:
#         print(f"❌ Error: {e}")


import os
import json
import re
from json_creator.parser import load_text_from_pdf
from json_creator.extractor import extract_metadata

QUESTION_PATTERN = r"(Q\d+-[ivx]+)[\.:]?"  # e.g., Q1-i, Q1-ii, etc.

def get_pdf_text(prompt_msg, optional=False):
    path = input(prompt_msg).strip()
    if not path:
        return "" if optional else None

    if not os.path.exists(path) or not path.endswith(".pdf"):
        if optional:
            print(f"⚠️ Optional file '{path}' not found. Skipping...")
            return ""
        else:
            raise FileNotFoundError(f"❌ Required file '{path}' not found.")
    
    return load_text_from_pdf(path)

def split_answers_by_question(answer_text):
    matches = list(re.finditer(QUESTION_PATTERN, answer_text))
    question_answers = {}

    for i in range(len(matches)):
        question_no = matches[i].group(1)
        start = matches[i].start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(answer_text)
        question_answers[question_no] = answer_text[start:end].strip()

    return question_answers

def process_answer_scripts():
    print("📄 Please provide the following file paths (press Enter to skip optional ones):")

    qp_text = get_pdf_text("📘 Path to *Question Paper* PDF: ")
    model_text = get_pdf_text("📗 Path to *Model Answers* PDF (optional): ", optional=True)
    rubric_text = get_pdf_text("📕 Path to *Marking Scheme* PDF (optional): ", optional=True)

    answer_dir = input("📂 Path to *Answer Scripts* folder: ").strip()
    if not os.path.isdir(answer_dir):
        raise NotADirectoryError(f"❌ Invalid folder path: {answer_dir}")

    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    for file in os.listdir(answer_dir):
        if not file.endswith(".pdf"):
            continue

        file_id = os.path.splitext(file)[0]
        print(f"🔍 Processing: {file_id}")

        full_answer_text = load_text_from_pdf(os.path.join(answer_dir, file))
        answers_by_question = split_answers_by_question(full_answer_text)

        results = []
        for question_no in ["Q1-i", "Q1-ii", "Q1-iii", "Q2-i"]:  # Customize this list as needed
            answer_part = answers_by_question.get(question_no, "")
            result = extract_metadata(qp_text, model_text, rubric_text, answer_part, file_id, question_no)
            results.append(result)

        # Save result to separate file
        output_path = os.path.join(output_dir, f"{file_id}.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"✅ Output saved to: {output_path}")

if __name__ == "__main__":
    try:
        process_answer_scripts()
        print("🎉 All answer scripts processed.")
    except Exception as e:
        print(f"❌ Error: {e}")
