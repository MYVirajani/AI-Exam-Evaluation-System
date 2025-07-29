

EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the full text of an *official model-answer or marking guide*.

-----------------------------
**Your Tasks:**

1. Extract global metadata once:
   - "module_code": e.g., "EE6250"
   - "exam_year": e.g., 2025
   - "exam_month": e.g., "June"

2. Extract all answers using the **exact question hierarchy** from the document.
   Example structure: Q1 → Q1.i → Q1.i.a

3. For each lowest-level question node, extract:
   - "question": The actual question text (if available, else use "")
   - "answer": The model answer content
   - "guideline": Bullet points or marking instructions (or empty string if not present)
   - "marks": Maximum marks (as a decimal, or null if not available)

-----------------------------
**Output Format (JSON only)**

Your response **must** be a single valid JSON object with this structure:

{
  "metadata": {
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "a": {
          "question": "Define supervised learning.",
          "answer": "Supervised learning is ...",
          "guideline": "Include mention of labeled data and prediction tasks.",
          "marks": 5
        }
      },
      "ii": {
        "question": "Explain overfitting in ML.",
        "answer": "Overfitting happens when ...",
        "guideline": "",
        "marks": 3
      }
    },
    "Q2": { ... }
  }
}

-----------------------------
**Strict Rules:**

*  Return only valid JSON. No markdown, no triple backticks.
*  Do NOT use flat keys like "Q1_i_answer". Use nested objects only.
*  Every answer leaf must include **all 4 fields**: question, answer, guideline, marks.
*  Return empty strings ("") or null for missing fields.
*  Clean up spacing and ensure well-formatted output.
"""
