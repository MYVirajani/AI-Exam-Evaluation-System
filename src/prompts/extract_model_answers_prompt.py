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
   - **Remove these tags entirely from the text BEFORE extracting question text or answers.**
   - **Under no circumstances should the question text include the image path.**

3. **Extract Fields for Each Lowest-Level Question**
   For each leaf node (e.g., Q1, Q1.a, Q1.i):

   - `"question"`:
       - The exact question text only.
       - Must NOT include any `[Image: ...]` tags, media URLs, or removed tag placeholders.

   - `"answer"`:
       - All expected answer content, including descriptions, reasoning, features, observations, tables, or equations.
       - Include all relevant text except instructions for checking.

   - `"guideline"`:
       - Extract the “Instructions for Checking” section if available.
       - Return verbatim as a single string.
       - If not present, return an empty string.

   - `"marks"`:
       - Extract marks if explicitly mentioned.
       - Use integer values.
       - If missing, return `null`.

   - `"media_urls"`:
       - A list of all image paths extracted from `[Image: ...]` tags belonging to this question.

4. **Special Handling Rules**
   - Tables must be preserved exactly in readable multi-line text.
   - Equations must be included as plain text in the answer.
   - “Key points”, “Expected features”, “Observations”, etc., belong in `"answer"`.
   - Do not include the guideline text inside `"answer"`.
   - Keep helpful newlines for formatting.

-----------------------------------
### Output Format — JSON Only

Return one valid JSON object, following this format:

{
  "answers": {
    "Q1": {
      "i": {
        "a": {
          "question": "Define supervised learning.",
          "answer": "Supervised learning is ...",
          "guideline": "Include mention of labeled data and prediction tasks.",
          "media_urls": ["path/to/image1.png"],
          "marks": 5
        }
      },
      "ii": {
        "question": "Explain overfitting in ML.",
        "answer": "Overfitting happens when ...",
        "guideline": "",
        "media_urls": [],
        "marks": 3
      }
    },
    "Q2": { ... }
  }
}

-----------------------------------
### Strict Rules

* Output **only valid JSON** — no markdown, no explanations.
* Maintain **exact question numbering** (e.g., Q1, Q2.a, Q3.i).
* Every question node MUST include:
  `"question"`, `"answer"`, `"guideline"`, `"marks"`, and `"media_urls"`.
* **All `[Image: ...]` tags must be removed from “question”, “answer”, and “guideline” after extraction.**
* **Media URLs must NEVER appear inside the “question” text.**
* `marks` must be integer or `null`.
* Do not guess, infer, or fix missing data — extract only what exists.
* Keep meaningful original formatting (tables, lists, equations, newlines).
* Trees must reflect the real hierarchy — no merging or skipping.

-----------------------------------
"""
