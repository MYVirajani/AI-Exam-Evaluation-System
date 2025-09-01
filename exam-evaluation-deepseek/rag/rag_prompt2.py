def build_evaluation_prompt(question, student_answer, context, total_marks):
    """Returns a formatted prompt string for LLM-based answer evaluation"""

    if context:
        context_section = context
        instruction = "Base your evaluation STRICTLY on the provided model answer (context). Do NOT use external or general knowledge."
    else:
        context_section = "No model answer available."
        instruction = "Model answer is not available. You may use your general knowledge to evaluate the student's response."

    return f"""
You are a teacher evaluating student answers.

The question is worth {total_marks} marks.

Question:
{question}

Model Answer (retrieved from course materials):
{context_section}

Student's Answer:
{student_answer}

{instruction}

Return JSON with:
- "awarded_marks" (number between 0-{total_marks})
- "feedback" (specific improvement suggestions)
- "key_points_missed" (list of important concepts not mentioned)

Return ONLY JSON.
"""
