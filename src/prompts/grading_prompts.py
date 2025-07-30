
# # """
# # Professional grading prompts for the automated paper marking system.
# # These prompts are designed to ensure consistent, fair, and accurate grading.
# # """

# # class GradingPrompts:
# #     """Collection of prompts used for automated grading."""
    
# #     RAG_ASSISTED_GRADING = """
# # You are an expert academic examiner tasked with grading a student's answer. You must be fair, consistent, and thorough in your evaluation.

# # **QUESTION:**
# # {question_text}

# # **MODEL ANSWER:**
# # {model_answer}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **RELEVANT COURSE MATERIAL (for reference):**
# # {context}

# # **GRADING INSTRUCTIONS:**
# # 1. **Content Accuracy (70% weight):**
# #    - Compare student answer against the model answer
# #    - Verify facts using the provided course material
# #    - Penalize factual errors heavily
# #    - Award partial credit for partially correct concepts

# # 2. **Understanding & Application (20% weight):**
# #    - Assess conceptual understanding beyond memorization
# #    - Evaluate application of principles
# #    - Consider clarity of explanation

# # 3. **Structure & Communication (10% weight):**
# #    - Logical organization of ideas
# #    - Clear expression of concepts
# #    - Appropriate use of terminology

# # **MAXIMUM MARKS:** {max_marks}

# # **IMPORTANT GUIDELINES:**
# # - Use ONLY information from the model answer and course material
# # - DO NOT award marks for information not covered in the materials
# # - Be consistent with marking standards
# # - Provide specific, constructive feedback
# # - Round scores to nearest 0.5 marks

# # **OUTPUT FORMAT:**
# # SCORE: [numerical score out of {max_marks}]
# # CONFIDENCE: [confidence level 1-10]
# # FEEDBACK: [specific feedback explaining the grade]
# # KEY_POINTS_COVERED: [list key points the student covered correctly]
# # MISSING_ELEMENTS: [list what the student missed or got wrong]
# # """

# #     DIRECT_LLM_GRADING = """
# # You are an expert academic examiner grading a student's answer. No course material is available, so use your expertise to evaluate the response fairly.

# # **QUESTION:**
# # {question_text}

# # **MODEL ANSWER:**
# # {model_answer}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **GRADING CRITERIA:**
# # 1. **Accuracy & Correctness (80%):** Compare against model answer
# # 2. **Understanding & Depth (20%):** Assess conceptual grasp

# # **MAXIMUM MARKS:** {max_marks}

# # **GUIDELINES:**
# # - Be fair and consistent
# # - Award partial credit appropriately
# # - Focus on key concepts from model answer
# # - Penalize significant factual errors

# # **OUTPUT FORMAT:**
# # SCORE: [numerical score out of {max_marks}]
# # CONFIDENCE: [confidence level 1-10]
# # FEEDBACK: [brief explanation of grade]
# # NOTE: [mention this was graded without course material context]
# # """

# #     SIMILARITY_ANALYSIS = """
# # Analyze the semantic similarity between the student answer and model answer for grading purposes.

# # **MODEL ANSWER:**
# # {model_answer}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **TASK:**
# # Rate the similarity on a scale of 0-10 where:
# # - 0-2: Completely different/incorrect
# # - 3-4: Some relevant points but major gaps
# # - 5-6: Partially correct with notable omissions
# # - 7-8: Mostly correct with minor gaps
# # - 9-10: Excellent match with model answer

# # **OUTPUT FORMAT:**
# # SIMILARITY_SCORE: [0-10]
# # REASONING: [brief explanation of similarity assessment]
# # """

# #     ANSWER_RELEVANCE_CHECK = """
# # Determine if the student's answer is relevant to the question asked.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **TASK:**
# # Assess if the student answer addresses the question. Rate relevance 1-10:
# # - 1-3: Completely off-topic
# # - 4-6: Partially relevant
# # - 7-10: Directly relevant

# # **OUTPUT FORMAT:**
# # RELEVANCE_SCORE: [1-10]
# # IS_RELEVANT: [YES/NO]
# # EXPLANATION: [brief reasoning]
# # """

# #     CONTEXT_RELEVANCE_EVALUATION = """
# # Evaluate how relevant the provided course material is to grading this specific question and answer.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **COURSE MATERIAL:**
# # {context}

# # **TASK:**
# # Rate the relevance of the course material for grading this answer (0-10):
# # - 0-3: Not useful for grading
# # - 4-6: Somewhat helpful
# # - 7-10: Highly relevant and useful

# # **OUTPUT FORMAT:**
# # RELEVANCE_RATING: [0-10]
# # USEFUL_FOR_GRADING: [YES/NO]
# # REASON: [explanation of relevance]
# # """

# #     FEEDBACK_GENERATION = """
# # Generate constructive feedback for a student based on their graded answer.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **SCORE AWARDED:**
# # {score}/{max_marks}

# # **AREAS FOR FEEDBACK:**
# # - What they did well
# # - What they missed or got wrong
# # - Suggestions for improvement
# # - Encouragement where appropriate

# # **TONE:** Professional, constructive, encouraging

# # **OUTPUT:**
# # {feedback_text}
# # """

# # class PromptTemplates:
# #     """Template utilities for consistent prompt formatting."""
    
# #     @staticmethod
# #     def format_grading_prompt(template: str, **kwargs) -> str:
# #         """Format a grading prompt with provided parameters."""
# #         return template.format(**kwargs)
    
# #     @staticmethod
# #     def extract_score_from_response(response: str) -> tuple[float, str]:
# #         """Extract score and feedback from LLM response."""
# #         import re
        
# #         # Extract score
# #         score_match = re.search(r'SCORE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
# #         score = float(score_match.group(1)) if score_match else 0.0
        
# #         # Extract feedback
# #         feedback_match = re.search(r'FEEDBACK:\s*(.*?)(?=\n[A-Z_]+:|$)', response, re.IGNORECASE | re.DOTALL)
# #         feedback = feedback_match.group(1).strip() if feedback_match else "No feedback provided."
        
# #         return score, feedback
    
# #     @staticmethod
# #     def extract_confidence_from_response(response: str) -> float:
# #         """Extract confidence score from LLM response."""
# #         import re
        
# #         confidence_match = re.search(r'CONFIDENCE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
# #         return float(confidence_match.group(1)) if confidence_match else 5.0


# class GradingPrompts:
#     """Collection of prompts used for automated grading."""

#     RAG_ASSISTED_GRADING = """
# You are a strict and professional academic examiner.

# Your task is to grade the following student answer using:
# 1. The **model answer**
# 2. The **grading instructions** (mark breakdown)
# 3. The **retrieved course material** (if needed)

# ---
# **QUESTION:**
# {question_text}

# **MODEL ANSWER:**
# {model_answer}

# **GRADING INSTRUCTIONS:**
# {guideline}

# **MAXIMUM MARKS:**
# {max_marks}

# **STUDENT ANSWER:**
# {student_answer}

# **RETRIEVED COURSE MATERIAL (REFERENCE):**
# {retrieved_chunks}

# ---

# Follow these instructions carefully:
# - Grade based **only** on the given grading instructions.
# - Award **only partial marks** if only some conditions are met.
# - **Do not** award full marks unless **all** expected criteria are clearly covered.
# - Use retrieved material only for fact-checking and terminology clarity.
# - Avoid hallucinations. Do not make assumptions not grounded in the model answer or course material.
# - Justify each score briefly and clearly.

# ---

# Return your result in **strict JSON format**:

# {{
#   "score": <numerical_score_out_of_{max_marks}>,
#   "confidence": <1_to_10>,
#   "feedback": "<brief explanation of marks awarded and what was missing>",
#   "key_points_covered": ["..."],
#   "missing_elements": ["..."]
# }}
# """

#     DIRECT_LLM_GRADING = """
# You are an academic examiner grading a student's answer **without course material**.

# Use only the model answer and your subject knowledge to evaluate the answer.

# ---
# **QUESTION:**
# {question_text}

# **MODEL ANSWER:**
# {model_answer}

# **STUDENT ANSWER:**
# {student_answer}

# **MAXIMUM MARKS:** {max_marks}

# ---

# Be fair and consistent. Award marks only for valid, relevant, and correct content.

# Return the result in **JSON format** like:

# {{
#   "score": <score_out_of_{max_marks}>,
#   "confidence": <1_to_10>,
#   "feedback": "<short reason>",
#   "note": "Graded without retrieved context"
# }}
# """

#     SIMILARITY_ANALYSIS = """
# Compare the semantic similarity between the model and student answers.

# **MODEL ANSWER:**
# {model_answer}

# **STUDENT ANSWER:**
# {student_answer}

# Rate similarity from 0 to 10:
# - 0–2: Completely different
# - 3–4: Some overlap but major gaps
# - 5–6: Partial understanding
# - 7–8: Mostly correct with few gaps
# - 9–10: Excellent match

# Return in JSON:
# {{
#   "similarity_score": <0_to_10>,
#   "reasoning": "<brief explanation>"
# }}
# """

#     ANSWER_RELEVANCE_CHECK = """
# Check if the student's answer is relevant to the question.

# **QUESTION:**
# {question_text}

# **STUDENT ANSWER:**
# {student_answer}

# Rate relevance from 1 to 10:
# - 1–3: Off-topic
# - 4–6: Partially relevant
# - 7–10: Directly answers the question

# Return in JSON:
# {{
#   "relevance_score": <1_to_10>,
#   "is_relevant": "<YES/NO>",
#   "explanation": "<brief reasoning>"
# }}
# """

#     CONTEXT_RELEVANCE_EVALUATION = """
# Evaluate how helpful the provided context is for grading this answer.

# **QUESTION:**
# {question_text}

# **STUDENT ANSWER:**
# {student_answer}

# **COURSE MATERIAL:**
# {context}

# Rate context relevance from 0 to 10:
# - 0–3: Not useful
# - 4–6: Somewhat helpful
# - 7–10: Highly relevant

# Return in JSON:
# {{
#   "relevance_rating": <0_to_10>,
#   "useful_for_grading": "<YES/NO>",
#   "reason": "<explanation>"
# }}
# """

#     FEEDBACK_GENERATION = """
# You are generating constructive feedback based on a student's answer and their score.

# **QUESTION:**
# {question_text}

# **STUDENT ANSWER:**
# {student_answer}

# **SCORE AWARDED:**
# {score}/{max_marks}

# Return constructive feedback in bullet points:
# - What the student did well
# - What they missed
# - Suggestions for improvement
# - Encouragement

# Return in plain text.
# """

# # ===========================
# # Prompt Formatting Utilities
# # ===========================

# class PromptTemplates:
#     """Utility for formatting and parsing LLM prompts and responses."""

#     @staticmethod
#     def format_grading_prompt(template: str, **kwargs) -> str:
#         """Apply values to placeholders in the template."""
#         return template.format(**kwargs)

#     @staticmethod
#     def extract_score_from_response(response: str) -> tuple[float, str]:
#         """Extract score and feedback from LLM JSON-style response."""
#         import json, re

#         try:
#             json_obj = json.loads(re.search(r'\{.*\}', response, re.DOTALL).group(0))
#             score = float(json_obj.get("score", 0))
#             feedback = json_obj.get("feedback", "No feedback provided.")
#             return score, feedback
#         except Exception as e:
#             print(f"❌ Failed to parse score: {e}")
#             return 0.0, "Invalid format"

#     @staticmethod
#     def extract_confidence_from_response(response: str) -> float:
#         """Extract confidence score from LLM response."""
#         import json, re

#         try:
#             json_obj = json.loads(re.search(r'\{.*\}', response, re.DOTALL).group(0))
#             return float(json_obj.get("confidence", 5.0))
#         except Exception as e:
#             print(f"❌ Failed to parse confidence: {e}")
#             return 5.0


class GradingPrompts:
    """Collection of prompts used for automated grading."""

    RAG_ASSISTED_GRADING = """
You are a strict academic examiner grading a student's answer using:
1. The official model answer
2. The grading instructions (with specific mark breakdowns)
3. The retrieved course material (for reference only)

---
**QUESTION:**
{question_text}

**MODEL ANSWER:**
{model_answer}

**GRADING INSTRUCTIONS:**
{guideline}

**MAXIMUM MARKS:**
{max_marks}

**STUDENT ANSWER:**
{student_answer}

**RETRIEVED COURSE MATERIAL (REFERENCE):**
{retrieved_chunks}
---

🛑 **IMPORTANT**:
- If the student answer is **empty**, only whitespace, or lacks meaningful content — assign a **score of 0** immediately, with a reason `"No answer provided"`.

🎯 Grading Instructions:
- ✅ Use ONLY the grading instructions for score allocation.
- ✅ Award partial marks ONLY when criteria are **clearly met**.
- ❌ Do NOT award marks for vague or unrelated statements.
- ❌ Do NOT assume intent — grade what is explicitly stated.
- ✅ Use course material only for verifying facts or terminology — not for inferring meaning.

---

📤 Return your result in strict JSON:

{{
  "score": <decimal score out of {max_marks}>,
  "confidence": <1-10>,
  "feedback": "<brief explanation of marks awarded and missing elements>",
  "key_points_covered": ["..."],
  "missing_elements": ["..."]
}}
"""

    DIRECT_LLM_GRADING = """
You are an academic examiner grading a student's answer using:
- The official model answer
- Your subject knowledge (NO course material)

---
**QUESTION:**
{question_text}

**MODEL ANSWER:**
{model_answer}

**STUDENT ANSWER:**
{student_answer}

**MAXIMUM MARKS:** {max_marks}

---

🛑 If the student answer is blank, whitespace, or meaningless, return a score of 0 immediately with the note `"No answer provided"`.

📌 Otherwise, follow these rules:
- Be fair and consistent.
- Only reward answers that **clearly demonstrate** understanding aligned with the model answer.

📤 Return JSON format:

{{
  "score": <score out of {max_marks}>,
  "confidence": <1-10>,
  "feedback": "<brief reason>",
  "note": "Graded without retrieved context"
}}
"""

    SIMILARITY_ANALYSIS = """
Compare the semantic similarity between the model and student answers.

**MODEL ANSWER:**
{model_answer}

**STUDENT ANSWER:**
{student_answer}

🛑 If the student answer is blank or meaningless, return score 0 with reason: "Empty or invalid answer".

Rate similarity from 0 to 10:
- 0–2: Completely different
- 3–4: Some overlap but major gaps
- 5–6: Partial understanding
- 7–8: Mostly correct with few gaps
- 9–10: Excellent match

Return in JSON:
{{
  "similarity_score": <0_to_10>,
  "reasoning": "<brief explanation>"
}}
"""

    ANSWER_RELEVANCE_CHECK = """
Check if the student's answer is relevant to the question.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

🛑 If the student answer is blank or off-topic, set relevance_score = 0 and is_relevant = "NO"

Rate relevance from 1 to 10:
- 1–3: Off-topic
- 4–6: Partially relevant
- 7–10: Directly answers the question

Return in JSON:
{{
  "relevance_score": <1_to_10>,
  "is_relevant": "<YES/NO>",
  "explanation": "<brief reasoning>"
}}
"""

    CONTEXT_RELEVANCE_EVALUATION = """
Evaluate how helpful the provided context is for grading this answer.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**COURSE MATERIAL:**
{context}

🛑 If the student answer is empty, you may still evaluate how useful the course material **would have been** for answering it.

Rate context relevance from 0 to 10:
- 0–3: Not useful
- 4–6: Somewhat helpful
- 7–10: Highly relevant

Return in JSON:
{{
  "relevance_rating": <0_to_10>,
  "useful_for_grading": "<YES/NO>",
  "reason": "<explanation>"
}}
"""

    FEEDBACK_GENERATION = """
You are generating professional feedback for a student based on their answer and grade.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**SCORE AWARDED:**
{score}/{max_marks}

🛑 If score is 0 and answer is empty or meaningless, return:
- "No answer was provided. Please ensure you write something meaningful for every question."

Otherwise, return feedback in bullet points:
- ✅ What the student did well
- ❌ What was incorrect or missing
- 💡 Suggestions for improvement
- 🙌 Encouragement

Return in plain text (no JSON).
"""
