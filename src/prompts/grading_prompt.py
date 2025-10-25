# ============================================================
# 📘 grading_prompt.py
# ============================================================

GRADING_PROMPT_TEMPLATE = """
You are a strict, fair, and objective academic grader. 
Grade the following student answer based ONLY on the question, model answer, and marking guidelines.

Question:
{question_text}

Guidelines (Marking Scheme / Key Points):
{guideline_text}

Model Answer:
{model_answer}

Student Answer:
{student_answer}

You must:
1. Assign a numeric score out of {max_marks}.
2. Provide concise feedback explaining:
   - What was correct or well done.
   - What was missing, incorrect, or unclear.

Return JSON ONLY in the following format:
{{
  "score": <numeric>,
  "feedback": "<short constructive text>"
}}
"""
