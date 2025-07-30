

# EXTRACT_STUDENT_ANSWERS_PROMPT = """
# You will receive the full text content of a student's typed or handwritten exam script.

# ---

# ### Your Tasks:

# 1. Extract Exam Metadata (ONLY ONCE)

# From the top section of the document, extract:

# - "student_index" (e.g., "EG/2020/4247")
# - "module_code" (e.g., "EE6250")
# - "exam_year" (e.g., 2025)
# - "exam_month" (e.g., "June")

# Return these inside a "metadata" field.

# ---

# 2. Extract Answers with Correct Question Hierarchy

# Extract all answers **exactly following the hierarchical structure** used in the answer script:

# - Q1) i) a)
# - Q1) ii)
# - Q2) i) b)
# - Q2) ii)
# - etc.

# Make sure to preserve:
# - Main questions: Q1, Q2, Q3, ...
# - Sub-questions: i, ii, iii, ...
# - Sub-sub-questions: a, b, c, ...
# - Sub-sub-sub-questions: 1), 2), ...

# Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

# ---

# ### Output Format (Strict JSON Only)

# Return the result using **only valid JSON**, as shown below:

# {
#   "metadata": {
#     "student_index": "EG/2020/4247",
#     "module_code": "EE6250",
#     "exam_year": 2025,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": {
#         "a": "Answer for Q1 i a",
#         "b": "Answer for Q1 i b"
#       },
#       "ii": "Answer for Q1 ii"
#     },
#     "Q2": {
#       "i": "Answer for Q2 i",
#       "ii": "Answer for Q2 ii"
#     }
#   }
# }

# ---

# ### Important Rules:

# - Do NOT return markdown or explanation — only the JSON object.
# - Use nested structure to match question numbers.
# - If a question has no sub-parts, use a string.
# - Trim any unnecessary whitespace from answers.
# - Begin output with `{` and end with `}`.
# """

EXTRACT_STUDENT_ANSWERS_PROMPT = """
You will receive the full text content of a student's typed or handwritten exam script.

---

### Your Tasks:

1. Extract Exam Metadata (ONLY ONCE)

From the top section of the document, extract:

- "student_index" (e.g., "EG/2020/4247")
- "module_code" (e.g., "EE6250")
- "exam_year" (e.g., 2025)
- "exam_month" (e.g., "June")

Return these inside a "metadata" field.

---

2. Extract Answers with Correct Question Hierarchy (Avoid Over-Splitting)

Extract all answers **exactly following the hierarchical structure** used in the answer script:

- Q1) i) a)
- Q1) ii)
- Q2) i) b)
- Q2) ii)
- etc.

Make sure to preserve:
- Main questions: Q1, Q2, Q3, ...
- Sub-questions: i, ii, iii, ...
- Sub-sub-questions: a, b, c, ...
- Sub-sub-sub-questions: 1), 2), ...

Treat each change in question number as a new section, even if the formatting is inconsistent or spacing is irregular.

---

### Output Format (Strict JSON Only)

Return the result using **only valid JSON**, as shown below:

{
  "metadata": {
    "student_index": "EG/2020/4247",
    "module_code": "EE6250",
    "exam_year": 2025,
    "exam_month": "June"
  },
  "answers": {
    "Q1": {
      "i": {
        "a": "Answer for Q1 i a",
        "b": "Answer for Q1 i b"
      },
      "ii": "Answer for Q1 ii"
    },
    "Q2": {
      "i": "Answer for Q2 i",
      "ii": "Answer for Q2 ii",
      "iv": "Load\nExit\nOpen\nClose"
    }
  }
}

---

### Important Rules:

- DO NOT split bullet points or list items (e.g., "Load", "Exit", "Open", "Close") into sub-questions unless they are clearly labeled (a), b), 1), 2), etc).
- If multiple lines appear under the same sub-question (e.g., Q2.iv), group all list-style lines as a single string with newline characters (`\\n`).
- Treat bullet points or indentation as part of the same answer unless new numbering appears.
- Do NOT return markdown or explanation — only the JSON object.
- Use nested structure to match question numbers.
- If a question has no sub-parts, use a string.
- Trim any unnecessary whitespace from answers.
- Begin output with `{` and end with `}`.
"""
