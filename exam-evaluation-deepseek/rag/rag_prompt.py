def build_evaluation_prompt(question, student_answer, context, total_marks):
    """Returns a formatted prompt string for LLM-based answer evaluation"""

    context_section = context if context else "No model answer available."

    return f"""
You are a teacher evaluating student answers using only the provided model answer (from teaching material).

The question is worth {total_marks} marks.

Question:
{question}

Model Answer (retrieved from course materials):
{context_section}

Student's Answer:
{student_answer}

Based ONLY on the model answer (context), return JSON with:
- "awarded_marks" (number between 0-{total_marks})
- "feedback" (specific improvement suggestions)
- "key_points_missed" (list of important concepts not mentioned)

Do not use external or general knowledge. If model answer is empty, give minimal marks with appropriate feedback.
Return ONLY JSON.
"""
