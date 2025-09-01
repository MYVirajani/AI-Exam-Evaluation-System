def build_metadata_extraction_prompt(qp_text, model_text, rubric_text, answer_text, file_id, question_no):
    return f"""
Extract and format the information into the following JSON schema:

{{
  "answer_id": "{file_id}-{question_no}",
  "question": "<exact question text>",
  "answer": "<student's answer>",
  "total_marks": <integer or null>,
  "model_answers": "<ideal answer or null>",
  "rubrics": "<marking scheme if available or null>"
}}

Input:
Question Paper:
{qp_text}

Model Answer Sheet:
{model_text or "N/A"}

Marking Scheme:
{rubric_text or "N/A"}

Student Answer:
{answer_text}

Be precise. Return only the JSON output.
"""
