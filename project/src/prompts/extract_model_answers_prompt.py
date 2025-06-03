EXTRACT_MODEL_ANSWERS_PROMPT = """
You will receive the content of a lecturer's model answer document.
Your task is to extract the model answers and any provided guidelines and organize them by question and sub-question numbers.

Use the following format strictly:
{
  "Q1": {
    "i": {
      "answer": "Answer text for Q1 i",
      "guideline": "Guideline for Q1 i if any"
    },
    "ii": {
      "answer": "...",
      "guideline": null
    }
  },
  "Q2": {
    "i": {
      "answer": "...",
      "guideline": "..."
    }
  }
}

Guidelines:
- If no guideline is found, set its value to null.
- Do not add any extra explanation or interpretation.
- Keep output clean and JSON-compliant.
"""