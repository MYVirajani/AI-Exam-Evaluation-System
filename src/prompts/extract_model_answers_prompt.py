# EXTRACT_MODEL_ANSWERS_PROMPT = """
# You are given a model answer script containing questions and corresponding marking schemes.

# Extract the following for each question and sub-question:
# - Full Question ID (e.g., Q1, Q1_a, Q2_b_i)
# - Question Text
# - Answer Key Points (summarize the key points expected in the answer)
# - Marks (if mentioned)
# - Marking Instructions (guidelines for evaluators if present)

# Return the extracted details in JSON format using the structure:
# [
#   {
#     "question_id": "Q1",
#     "sub_question_id": "a",
#     "sub_sub_question_id": null,
#     "full_question_id": "Q1_a",
#     "question_text": "...",
#     "key_points": "...",
#     "marks": 5,
#     "marking_instruction": "..."
#   },
#   ...
# ]
# Make sure the hierarchy of sub-questions is preserved.
# Guidelines:
# - If no guideline is found, set its value to null.
# - Do not add any extra explanation or interpretation.
# - Keep output clean and JSON-compliant.
# """

# EXTRACT_MODEL_ANSWERS_PROMPT = """
# You will receive the full text of an *official model-answer / marking guide*.

# ---------------------------------
# **Tasks**

# 1. Extract global metadata once:
#    - "module_code"  (e.g., EE6250)
#    - "exam_year"    (e.g., 2025)
#    - "exam_month"   (e.g., June)

# 2. Extract answers **with the exact question hierarchy** that appears in the document
#    (Q1, Q1 i, Q1 i a …).

#    Each leaf must contain:
#    - "answer"      → canonical model answer text
#    - "guideline"   → bullet points / marking rubric (if present, else empty string)
#    - "marks"       → maximum marks for this leaf (integer, if present, else null)

# ---------------------------------
# **Output (JSON only)**

# {
#   "metadata": {...},
#   "answers": {
#     "Q1": {
#       "i": {
#         "a": {
#           "answer": "Lorem ipsum...",
#           "guideline": "Key points: ...",
#           "marks": 5
#         }
#       },
#       "ii": {
#         "answer": "…",
#         "guideline": "",
#         "marks": 4
#       }
#     },
#     "Q2": { ... }
#   }
# }

# Rules:
# * Begin with `{`, end with `}` – no markdown.
# * Preserve hierarchy.
# * Omit explanations.
# """

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
   - "marks": Maximum marks (as an integer, or null if not available)

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
