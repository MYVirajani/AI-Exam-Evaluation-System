import os
import json
import re
import traceback
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import pandas as pd
from docx import Document
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify

# Load environment variables
print("[STEP 1] Loading environment variables...")
load_dotenv()

# Initialize Hugging Face client
print("[STEP 2] Initializing Hugging Face API client...")
client = InferenceClient(
    provider="auto",
    api_key=os.getenv("HF_TOKEN"),
)

# ---------------- File Parsing Functions ---------------- #
def extract_text_from_excel(file_path: str) -> str:
    print("[INFO] Extracting text from Excel file...")
    df = pd.read_excel(file_path)
    return "\n".join(df.astype(str).apply(lambda row: " | ".join(row), axis=1))

def extract_text_from_docx(file_path: str) -> str:
    print("[INFO] Extracting text from DOCX file...")
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

def extract_text_from_xml(file_path: str) -> str:
    print("[INFO] Extracting text from XML file...")
    tree = ET.parse(file_path)
    root = tree.getroot()
    return ET.tostring(root, encoding="unicode")

def extract_text_from_xhtml(file_path: str) -> str:
    print("[INFO] Extracting text from XHTML/HTML file...")
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "lxml")
    return soup.get_text(separator="\n")

FILE_PARSERS = {
    ".xlsx": extract_text_from_excel,
    ".xls": extract_text_from_excel,
    ".docx": extract_text_from_docx,
    ".xml": extract_text_from_xml,
    ".xhtml": extract_text_from_xhtml,
    ".html": extract_text_from_xhtml,
    ".htm": extract_text_from_xhtml,
}

def parse_file(file_path: str) -> str:
    print(f"[STEP 3] Parsing file: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in FILE_PARSERS:
        raise ValueError(f"Unsupported file type: {ext}")
    return FILE_PARSERS[ext](file_path)

# ---------------- LLM Extraction ---------------- #
def extract_questions(text_content: str):
    print("[STEP 4] Sending content to LLM for question extraction...")
    prompt = f"""
You are a strict parser that must **NOT change, reword, or interpret** the questions, answers, or options in any way.
You must only extract and format them exactly as they appear in the given content, with the following adjustment for MCQs:

Follow these strict rules:
1. Preserve all original text exactly, including spelling, punctuation, and formatting.
2. Do not remove, add, or alter any part of the question or answers, except:
   - For MCQs, remove the option index/label (e.g., "A)", "B.", "1)") and keep only the option text.
3. If a question has options, include them in the same wording and order (without their indices/labels).
4. "correctAnswer" must contain the **exact text** of the correct option (index/label removed).
5. If there are no options (e.g., SHORT questions), return an empty array for "options" and "correctAnswer" should be the exact correct text from the source.
6. For "marks", if not explicitly mentioned, set it to null (do NOT guess).
7. Output must be a pure JSON array of objects with the fields:
   - "type" (string, e.g., MCQ, SHORT, TRUE_FALSE, etc., extracted exactly if given, else null)
   - "question" (string, exactly as in source)
   - "correctAnswer" (string, EXACT text of correct answer, without any index/label)
   - "options" (array of strings, each option text only, no indices/labels)
   - "marks" (integer or null)

Example 1:
Input:
Q1. What is 2 + 2?
A) 3
B) 4
C) 5
Correct answer: B) 4
Marks: 1

Output:
[
  {{
    "type": "MCQ",
    "question": "What is 2 + 2?",
    "correctAnswer": "4",
    "options": ["3", "4", "5"],
    "marks": 1
  }}
]

Example 2:
Input:
Q2. Who wrote 'Romeo and Juliet'?
Correct answer: William Shakespeare
Marks: 2

Output:
[
  {{
    "type": "SHORT",
    "question": "Who wrote 'Romeo and Juliet'?",
    "correctAnswer": "William Shakespeare",
    "options": [],
    "marks": 2
  }}
]

Now parse the following content using the same rules:
{text_content}

Respond ONLY with the JSON array. No explanations, no code blocks, no extra text.
"""


    try:
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
            messages=[{"role": "user", "content": prompt}],
            temperature=0 
        )
        response_text = completion.choices[0].message.content.strip()
        print("[INFO] Raw LLM response received.")

        # Extract only the first JSON array from the response
        match = re.search(r"\[\s*{[\s\S]*?}\s*\]", response_text)
        if not match:
            print("⚠ No valid JSON array found in LLM output.")
            return []

        json_str = match.group(0).strip()

        # Debug: Show the extracted JSON substring
        print("[DEBUG] Extracted JSON substring:")
        print(json_str[:500] + ("..." if len(json_str) > 500 else ""))

        # Load JSON safely
        parsed_questions = json.loads(json_str)
        print("[STEP 5] JSON successfully parsed.")
        return parsed_questions

    except json.JSONDecodeError as e:
        print(f"⚠ JSON parsing failed even after cleanup: {e}")
        return []
    except Exception:
        traceback.print_exc()
        return []

# ---------------- Flask API ---------------- #
app = Flask(__name__)

@app.route("/extract-questions", methods=["POST"])
def extract_questions_endpoint():
    """API endpoint to extract questions from a given file path."""
    try:
        print("\n================ NEW REQUEST ================")
        data = request.get_json()
        file_path = data.get("file_path")

        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "Invalid or missing file_path"}), 400

        # Step 3: Parse file
        content = parse_file(file_path)

        # Step 4: Extract questions
        questions_json = extract_questions(content)

        # Step 6: Final output
        print("[STEP 6] Extraction complete. Questions found:")
        print(json.dumps(questions_json, indent=2, ensure_ascii=False))

        return jsonify(questions_json), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("[INFO] Starting Flask server...")
    app.run(debug=True)
