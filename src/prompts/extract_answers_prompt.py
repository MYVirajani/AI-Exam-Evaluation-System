# EXTRACT_STUDENT_ANSWERS_PROMPT = """
# You will receive the raw content of a student's written exam paper. Your task is to:

# 1. Extract exam metadata from the top of the document, including:
#    - student_index (e.g., EG/2020/4247)
#    - module_code (e.g., CS101)
#    - exam_year (e.g., 2024)
#    - exam_month (e.g., June)

# 2. Extract answers for each question and sub-question, **preserving the question hierarchy exactly** as shown. This includes:
#    - Q1), Q2), etc.
#    - Sub-questions like i), ii), iii), etc.
#    - Sub-sub-questions like a), b), c)
#    - Nested numbering like (1), (2)

# 💡 Notes:
# - Detect structure from prefixes like `Q1)`, `i)`, `a)` and `(1)` and nest answers accordingly.
# - If a question like `Q1)` has multiple sub-answers (e.g., `i)`, `ii)`), return it as a nested dictionary:
#   {
#     "Q1": {
#       "i": "...",
#       "ii": "..."
#     }
#   }
# - If `Q1)` has a single full answer with no sub-parts, return as string:
#   { "Q1": "..." }

# ---

# 📦 Output JSON format (strict):

# {
#   "metadata": {
#     "student_index": "EG/2020/4247",
#     "module_code": "CS101",
#     "exam_year": 2024,
#     "exam_month": "June"
#   },
#   "answers": {
#     "Q1": {
#       "i": "Answer to Q1 i)",
#       "ii": "Answer to Q1 ii)"
#     },
#     "Q2": "Single answer to Q2"
#   }
# }

# Return only valid JSON. Do not include explanations or extra comments.
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

2. Extract Answers with Correct Question Hierarchy

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
      "ii": "Answer for Q2 ii"
    }
  }
}

---

### Important Rules:

- Do NOT return markdown or explanation — only the JSON object.
- Use nested structure to match question numbers.
- If a question has no sub-parts, use a string.
- Trim any unnecessary whitespace from answers.
- Begin output with `{` and end with `}`.
"""
