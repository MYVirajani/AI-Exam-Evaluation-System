EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the full text of an *official model-answer or marking guide* document.
The text may include charts, tables, or image references represented as:
[Image: <absolute_or_relative_path_to_image>]

It may also contain **mathematical equations** or **tabular data** representing problem data or solutions.

-----------------------------------
### Your Tasks

1. **Detect Question Hierarchy**
   - Identify each main question and sub-question using their numbering patterns (e.g., Q1, Q1.a, Q1.i).
   - Maintain exact hierarchy and numbering as in the original document.

2. **Extract Fields for Each Question**
   For each lowest-level question (e.g., Q1, Q1.i, Q1.a):
   - `"question"`: The question text (e.g., “Draw a bar chart to represent the data.”).
   - `"answer"`: Everything describing the **expected answer or model content**, including:
       - Explanations, key points, purposes, observations, expected features, or data tables.
       - Any content except “Instructions for Checking”.
   - `"guideline"`: The *“Instructions for Checking”* section under that question.
       - If found, extract it verbatim as a single string.
       - If not found, set `"guideline": ""`.
   - `"marks"`: Total marks for the question (integer if given, else `null`).
   - `"media_urls"`: A list of image paths extracted from `[Image: ...]` tags (if any).

3. **Special Handling Rules**
   - When a question includes **tables**, preserve the table content as readable text (rows separated by newlines, columns separated by tabs or commas).
   - When “Key Points”, “Expected Chart Features”, or “Observations” appear, include them as part of the `"answer"` field.
   - Do **not** include “Instructions for Checking” in the `"answer"`.
   - Maintain meaningful newlines and formatting for clarity (especially for multi-line data).

-----------------------------------
### Output Format — JSON Only

Return one valid JSON object using this structure:

{
  "answers": {
    "Q1": {
      "i": {
        "a": {
          "question": "Define supervised learning.",
          "answer": "Supervised learning is ...",
          "guideline": "Include mention of labeled data and prediction tasks.",
          "media_urls": ["path/to/image1.png", "path/to/image2.jpg"],
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

* Output **only valid JSON** — no markdown, no explanations, no code fences.
* Maintain **exact question numbering** (e.g., Q1, Q2_a, Q3_i).
* Each question node **must contain**:
  `"question"`, `"answer"`, `"guideline"`, `"marks"`, and `"media_urls"`.
* Remove `[Image: ...]` tags from text body after extracting URLs.
* Preserve **tables, equations, and lists** exactly as they appear.
* `marks` must be an integer if explicitly given, or `null` if not found.
* `media_urls` must always be a list (e.g., `[]` if none).
* Do not infer or summarize missing data.
* Do not merge or omit sub-questions unless explicitly hierarchical in numbering.
* Keep internal newlines (`\\n`) where formatting is meaningful.

-----------------------------------
"""
