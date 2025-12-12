EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the full text of an *official model-answer or marking guide* document.
The text may include charts, tables, equations, or image references written as:
[Image: <absolute_or_relative_path>]

Your job is to extract the question hierarchy and model answers in a clean JSON structure.

-----------------------------------
### Your Tasks

1. **Detect Question Hierarchy**
   - Identify every main question and sub-question using numbering patterns (e.g., Q1, Q1.a, Q1.i).
   - Preserve the original hierarchy exactly as in the document.

2. **Pre-processing of Image References**
   - Detect all `[Image: ...]` patterns.
   - Extract the image paths into a list under `"media_urls"`.
   - Remove these tags entirely from the text BEFORE extracting question text, answers, or guidelines.
   - Under no circumstances should the question text include the image path.

3. **Extract Fields for Each Lowest-Level Question**
   For each leaf node (e.g., Q1, Q1.a, Q1.i):

   - **"question"**:
       - The exact question text only.
       - Must NOT contain `[Image: ...]` or any image paths.

   - **"answer"**:
       - Include all expected answer content: descriptions, reasoning, features, tables, equations, etc.
       - Do not include guideline text.

   - **"guideline"**:
       - Extract the “Instructions for Checking” section if present.
       - Return as a single verbatim string.
       - If missing, return an empty string "".

   - **"marks"**:
       - Extract the marks exactly as shown in the document.
       - Marks **may be a decimal number** (e.g., 1, 1.5, 0.75, 2.0).
       - Output marks as a JSON number (not string), OR null if missing.
       - **Never round, truncate, or convert decimals to integers.**

   - **"media_urls"**:
       - A list of all image paths extracted from `[Image: ...]` tags associated with this question.

   - **"type"**:
       - Must be exactly one of:
         MCQ, SHORT, ESSAY, LIST, GRAPH, DIAGRAM, TABLE, None
       - Infer based on structure if not explicitly stated.

4. **Special Handling Rules**
   - Tables must be preserved in readable multi-line format.
   - Equations should be returned as plain text.
   - Observations, key points, and features belong in `"answer"`.
   - Keep meaningful original formatting.

-----------------------------------
### Output Format — JSON Only

Return exactly one valid JSON object in this structure:

{
  "answers": {
    "Q1": {
      "i": {
        "a": {
          "question": "Define supervised learning.",
          "answer": "Supervised learning is ...",
          "guideline": "Include mention of labeled data and prediction tasks.",
          "media_urls": ["path/to/image1.png"],
          "marks": 5.0,
          "type": "SHORT"
        }
      },
      "ii": {
        "question": "Explain overfitting in ML.",
        "answer": "Overfitting happens when ...",
        "guideline": "",
        "media_urls": [],
        "marks": 3.5,
        "type": "ESSAY"
      }
    },
    "Q2": { ... }
  }
}

-----------------------------------
### Strict Rules

* Output **only valid JSON** — no markdown, code fences, or commentary.
* Maintain **exact question numbering** from the original text.
* Every leaf question MUST include:
  "question", "answer", "guideline", "marks", "media_urls", "type".
* `"marks"` must be a **decimal number or null** — do NOT round to an integer.
* All `[Image: ...]` tags must be removed from question/answer/guideline fields.
* Media URLs must NEVER appear inside the “question” field.
* Preserve formatting such as lists, newlines, equations, and tables.
* Do not hallucinate missing information — extract only what exists.
* The hierarchy must reflect the real structure without merging or skipping.

-----------------------------------
"""
