# src/prompts/extract_answers_prompt.py

EXTRACT_STUDENT_ANSWERS_PROMPT = """
You will receive the content of a student's exam answer sheet. Your task is to extract answers 
and organize them according to main and sub-question numbers.

Use the following format strictly:
{
  "Q1": {
    "i": "Answer text for Q1 i",
    "ii": "Answer text for Q1 ii"
  },
  "Q2": {
    "i": "Answer text for Q2 i",
    ...
  }
}

Guidelines:
- Only extract actual question-answer pairs from the text.
- Do not add any extra explanation or interpretation.
- Maintain the order and integrity of the original text.
- Keep answers clean and trimmed.
"""
