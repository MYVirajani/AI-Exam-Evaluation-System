
class RAGPrompts:
    """
    Holds template strings used by the Retrieval-Augmented Grading pipeline.
    """

   
    GRADING_PROMPT = """
You are a strict but fair examiner. Grade the student answer using the
model answer, marking guideline, and any helpful context from lecture material.

QUESTION:
---------
{question_text}

MODEL ANSWER:
-------------
{model_answer}

MARKING GUIDELINE:
------------------
{guideline}

CONTEXT (lecture excerpts – for reference only):
------------------------------------------------
{retrieved_chunks}

STUDENT ANSWER:
---------------
{student_answer}

MAXIMUM MARKS:
--------------
{max_marks}

INSTRUCTIONS:
-------------
1. Compare the student’s answer with the model answer and guideline.
2. Use the context *only* to clarify the subject, not as a primary grading source.
3. Assign an INTEGER score from 0 to {max_marks}.
4. Provide a concise justification for the score.

OUTPUT (JSON only, no markdown):
--------------------------------
{{
  "score": <int>,
  "reason": "<one-sentence explanation>"
}}
"""

    # Prompt for similarity-search retrieval
    RETRIEVAL_PROMPT = """
Use the following question text to retrieve the most relevant lecture excerpts.

QUESTION:
{question_text}
"""


class RAGUtilities:
    """
    Helper utilities for the RAG pipeline.
    """

    @staticmethod
    def format_retrieved_chunks(chunks) -> str:
        """
        Turn a list/iterable of chunk strings into a readable block for the prompt.
        """
        return "\n\n".join(f"- {chunk}" for chunk in chunks)
