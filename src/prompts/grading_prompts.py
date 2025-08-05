
# # # """
# # # Professional grading prompts for the automated paper marking system.
# # # These prompts are designed to ensure consistent, fair, and accurate grading.
# # # """

# # # class GradingPrompts:
# # #     """Collection of prompts used for automated grading."""
    
# # #     RAG_ASSISTED_GRADING = """
# # # You are an expert academic examiner tasked with grading a student's answer. You must be fair, consistent, and thorough in your evaluation.

# # # **QUESTION:**
# # # {question_text}

# # # **MODEL ANSWER:**
# # # {model_answer}

# # # **STUDENT ANSWER:**
# # # {student_answer}

# # # **RELEVANT COURSE MATERIAL (for reference):**
# # # {context}

# # # **GRADING INSTRUCTIONS:**
# # # 1. **Content Accuracy (70% weight):**
# # #    - Compare student answer against the model answer
# # #    - Verify facts using the provided course material
# # #    - Penalize factual errors heavily
# # #    - Award partial credit for partially correct concepts

# # # 2. **Understanding & Application (20% weight):**
# # #    - Assess conceptual understanding beyond memorization
# # #    - Evaluate application of principles
# # #    - Consider clarity of explanation

# # # 3. **Structure & Communication (10% weight):**
# # #    - Logical organization of ideas
# # #    - Clear expression of concepts
# # #    - Appropriate use of terminology

# # # **MAXIMUM MARKS:** {max_marks}

# # # **IMPORTANT GUIDELINES:**
# # # - Use ONLY information from the model answer and course material
# # # - DO NOT award marks for information not covered in the materials
# # # - Be consistent with marking standards
# # # - Provide specific, constructive feedback
# # # - Round scores to nearest 0.5 marks

# # # **OUTPUT FORMAT:**
# # # SCORE: [numerical score out of {max_marks}]
# # # CONFIDENCE: [confidence level 1-10]
# # # FEEDBACK: [specific feedback explaining the grade]
# # # KEY_POINTS_COVERED: [list key points the student covered correctly]
# # # MISSING_ELEMENTS: [list what the student missed or got wrong]
# # # """

# # #     DIRECT_LLM_GRADING = """
# # # You are an expert academic examiner grading a student's answer. No course material is available, so use your expertise to evaluate the response fairly.

# # # **QUESTION:**
# # # {question_text}

# # # **MODEL ANSWER:**
# # # {model_answer}

# # # **STUDENT ANSWER:**
# # # {student_answer}

# # # **GRADING CRITERIA:**
# # # 1. **Accuracy & Correctness (80%):** Compare against model answer
# # # 2. **Understanding & Depth (20%):** Assess conceptual grasp

# # # **MAXIMUM MARKS:** {max_marks}

# # # **GUIDELINES:**
# # # - Be fair and consistent
# # # - Award partial credit appropriately
# # # - Focus on key concepts from model answer
# # # - Penalize significant factual errors

# # # **OUTPUT FORMAT:**
# # # SCORE: [numerical score out of {max_marks}]
# # # CONFIDENCE: [confidence level 1-10]
# # # FEEDBACK: [brief explanation of grade]
# # # NOTE: [mention this was graded without course material context]
# # # """

# # #     SIMILARITY_ANALYSIS = """
# # # Analyze the semantic similarity between the student answer and model answer for grading purposes.

# # # **MODEL ANSWER:**
# # # {model_answer}

# # # **STUDENT ANSWER:**
# # # {student_answer}

# # # **TASK:**
# # # Rate the similarity on a scale of 0-10 where:
# # # - 0-2: Completely different/incorrect
# # # - 3-4: Some relevant points but major gaps
# # # - 5-6: Partially correct with notable omissions
# # # - 7-8: Mostly correct with minor gaps
# # # - 9-10: Excellent match with model answer

# # # **OUTPUT FORMAT:**
# # # SIMILARITY_SCORE: [0-10]
# # # REASONING: [brief explanation of similarity assessment]
# # # """

# # #     ANSWER_RELEVANCE_CHECK = """
# # # Determine if the student's answer is relevant to the question asked.

# # # **QUESTION:**
# # # {question_text}

# # # **STUDENT ANSWER:**
# # # {student_answer}

# # # **TASK:**
# # # Assess if the student answer addresses the question. Rate relevance 1-10:
# # # - 1-3: Completely off-topic
# # # - 4-6: Partially relevant
# # # - 7-10: Directly relevant

# # # **OUTPUT FORMAT:**
# # # RELEVANCE_SCORE: [1-10]
# # # IS_RELEVANT: [YES/NO]
# # # EXPLANATION: [brief reasoning]
# # # """

# # #     CONTEXT_RELEVANCE_EVALUATION = """
# # # Evaluate how relevant the provided course material is to grading this specific question and answer.

# # # **QUESTION:**
# # # {question_text}

# # # **STUDENT ANSWER:**
# # # {student_answer}

# # # **COURSE MATERIAL:**
# # # {context}

# # # **TASK:**
# # # Rate the relevance of the course material for grading this answer (0-10):
# # # - 0-3: Not useful for grading
# # # - 4-6: Somewhat helpful
# # # - 7-10: Highly relevant and useful

# # # **OUTPUT FORMAT:**
# # # RELEVANCE_RATING: [0-10]
# # # USEFUL_FOR_GRADING: [YES/NO]
# # # REASON: [explanation of relevance]
# # # """

# # #     FEEDBACK_GENERATION = """
# # # Generate constructive feedback for a student based on their graded answer.

# # # **QUESTION:**
# # # {question_text}

# # # **STUDENT ANSWER:**
# # # {student_answer}

# # # **SCORE AWARDED:**
# # # {score}/{max_marks}

# # # **AREAS FOR FEEDBACK:**
# # # - What they did well
# # # - What they missed or got wrong
# # # - Suggestions for improvement
# # # - Encouragement where appropriate

# # # **TONE:** Professional, constructive, encouraging

# # # **OUTPUT:**
# # # {feedback_text}
# # # """

# # # class PromptTemplates:
# # #     """Template utilities for consistent prompt formatting."""
    
# # #     @staticmethod
# # #     def format_grading_prompt(template: str, **kwargs) -> str:
# # #         """Format a grading prompt with provided parameters."""
# # #         return template.format(**kwargs)
    
# # #     @staticmethod
# # #     def extract_score_from_response(response: str) -> tuple[float, str]:
# # #         """Extract score and feedback from LLM response."""
# # #         import re
        
# # #         # Extract score
# # #         score_match = re.search(r'SCORE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
# # #         score = float(score_match.group(1)) if score_match else 0.0
        
# # #         # Extract feedback
# # #         feedback_match = re.search(r'FEEDBACK:\s*(.*?)(?=\n[A-Z_]+:|$)', response, re.IGNORECASE | re.DOTALL)
# # #         feedback = feedback_match.group(1).strip() if feedback_match else "No feedback provided."
        
# # #         return score, feedback
    
# # #     @staticmethod
# # #     def extract_confidence_from_response(response: str) -> float:
# # #         """Extract confidence score from LLM response."""
# # #         import re
        
# # #         confidence_match = re.search(r'CONFIDENCE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
# # #         return float(confidence_match.group(1)) if confidence_match else 5.0


# # class GradingPrompts:
# #     """Collection of prompts used for automated grading."""

# #     RAG_ASSISTED_GRADING = """
# # You are a strict and professional academic examiner.

# # Your task is to grade the following student answer using:
# # 1. The **model answer**
# # 2. The **grading instructions** (mark breakdown)
# # 3. The **retrieved course material** (if needed)

# # ---
# # **QUESTION:**
# # {question_text}

# # **MODEL ANSWER:**
# # {model_answer}

# # **GRADING INSTRUCTIONS:**
# # {guideline}

# # **MAXIMUM MARKS:**
# # {max_marks}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **RETRIEVED COURSE MATERIAL (REFERENCE):**
# # {retrieved_chunks}

# # ---

# # Follow these instructions carefully:
# # - Grade based **only** on the given grading instructions.
# # - Award **only partial marks** if only some conditions are met.
# # - **Do not** award full marks unless **all** expected criteria are clearly covered.
# # - Use retrieved material only for fact-checking and terminology clarity.
# # - Avoid hallucinations. Do not make assumptions not grounded in the model answer or course material.
# # - Justify each score briefly and clearly.

# # ---

# # Return your result in **strict JSON format**:

# # {{
# #   "score": <numerical_score_out_of_{max_marks}>,
# #   "confidence": <1_to_10>,
# #   "feedback": "<brief explanation of marks awarded and what was missing>",
# #   "key_points_covered": ["..."],
# #   "missing_elements": ["..."]
# # }}
# # """

# #     DIRECT_LLM_GRADING = """
# # You are an academic examiner grading a student's answer **without course material**.

# # Use only the model answer and your subject knowledge to evaluate the answer.

# # ---
# # **QUESTION:**
# # {question_text}

# # **MODEL ANSWER:**
# # {model_answer}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **MAXIMUM MARKS:** {max_marks}

# # ---

# # Be fair and consistent. Award marks only for valid, relevant, and correct content.

# # Return the result in **JSON format** like:

# # {{
# #   "score": <score_out_of_{max_marks}>,
# #   "confidence": <1_to_10>,
# #   "feedback": "<short reason>",
# #   "note": "Graded without retrieved context"
# # }}
# # """

# #     SIMILARITY_ANALYSIS = """
# # Compare the semantic similarity between the model and student answers.

# # **MODEL ANSWER:**
# # {model_answer}

# # **STUDENT ANSWER:**
# # {student_answer}

# # Rate similarity from 0 to 10:
# # - 0–2: Completely different
# # - 3–4: Some overlap but major gaps
# # - 5–6: Partial understanding
# # - 7–8: Mostly correct with few gaps
# # - 9–10: Excellent match

# # Return in JSON:
# # {{
# #   "similarity_score": <0_to_10>,
# #   "reasoning": "<brief explanation>"
# # }}
# # """

# #     ANSWER_RELEVANCE_CHECK = """
# # Check if the student's answer is relevant to the question.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # Rate relevance from 1 to 10:
# # - 1–3: Off-topic
# # - 4–6: Partially relevant
# # - 7–10: Directly answers the question

# # Return in JSON:
# # {{
# #   "relevance_score": <1_to_10>,
# #   "is_relevant": "<YES/NO>",
# #   "explanation": "<brief reasoning>"
# # }}
# # """

# #     CONTEXT_RELEVANCE_EVALUATION = """
# # Evaluate how helpful the provided context is for grading this answer.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **COURSE MATERIAL:**
# # {context}

# # Rate context relevance from 0 to 10:
# # - 0–3: Not useful
# # - 4–6: Somewhat helpful
# # - 7–10: Highly relevant

# # Return in JSON:
# # {{
# #   "relevance_rating": <0_to_10>,
# #   "useful_for_grading": "<YES/NO>",
# #   "reason": "<explanation>"
# # }}
# # """

# #     FEEDBACK_GENERATION = """
# # You are generating constructive feedback based on a student's answer and their score.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **SCORE AWARDED:**
# # {score}/{max_marks}

# # Return constructive feedback in bullet points:
# # - What the student did well
# # - What they missed
# # - Suggestions for improvement
# # - Encouragement

# # Return in plain text.
# # """

# # # ===========================
# # # Prompt Formatting Utilities
# # # ===========================

# # class PromptTemplates:
# #     """Utility for formatting and parsing LLM prompts and responses."""

# #     @staticmethod
# #     def format_grading_prompt(template: str, **kwargs) -> str:
# #         """Apply values to placeholders in the template."""
# #         return template.format(**kwargs)

# #     @staticmethod
# #     def extract_score_from_response(response: str) -> tuple[float, str]:
# #         """Extract score and feedback from LLM JSON-style response."""
# #         import json, re

# #         try:
# #             json_obj = json.loads(re.search(r'\{.*\}', response, re.DOTALL).group(0))
# #             score = float(json_obj.get("score", 0))
# #             feedback = json_obj.get("feedback", "No feedback provided.")
# #             return score, feedback
# #         except Exception as e:
# #             print(f"❌ Failed to parse score: {e}")
# #             return 0.0, "Invalid format"

# #     @staticmethod
# #     def extract_confidence_from_response(response: str) -> float:
# #         """Extract confidence score from LLM response."""
# #         import json, re

# #         try:
# #             json_obj = json.loads(re.search(r'\{.*\}', response, re.DOTALL).group(0))
# #             return float(json_obj.get("confidence", 5.0))
# #         except Exception as e:
# #             print(f"❌ Failed to parse confidence: {e}")
# #             return 5.0


# class GradingPrompts:
#     """Collection of prompts used for automated grading."""

#     RAG_ASSISTED_GRADING = """
# You are a strict academic examiner grading a student's answer using:
# 1. The official model answer
# 2. The grading instructions (with specific mark breakdowns)
# 3. The retrieved course material (for reference only)

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

# 🛑 **IMPORTANT**:
# - If the student answer is **empty**, only whitespace, or lacks meaningful content — assign a **score of 0** immediately, with a reason `"No answer provided"`.

# 🎯 Grading Instructions:
# - ✅ Use ONLY the grading instructions for score allocation.
# - ✅ Award partial marks ONLY when criteria are **clearly met**.
# - ❌ Do NOT award marks for vague or unrelated statements.
# - ❌ Do NOT assume intent — grade what is explicitly stated.
# - ✅ Use course material only for verifying facts or terminology — not for inferring meaning.

# ---

# 📤 Return your result in strict JSON:

# {{
#   "score": <decimal score out of {max_marks}>,
#   "confidence": <1-10>,
#   "feedback": "<brief explanation of marks awarded and missing elements>",
#   "key_points_covered": ["..."],
#   "missing_elements": ["..."]
# }}
# """

#     DIRECT_LLM_GRADING = """
# You are an academic examiner grading a student's answer using:
# - The official model answer
# - Your subject knowledge (NO course material)

# ---
# **QUESTION:**
# {question_text}

# **MODEL ANSWER:**
# {model_answer}

# **STUDENT ANSWER:**
# {student_answer}

# **MAXIMUM MARKS:** {max_marks}

# ---

# 🛑 If the student answer is blank, whitespace, or meaningless, return a score of 0 immediately with the note `"No answer provided"`.

# 📌 Otherwise, follow these rules:
# - Be fair and consistent.
# - Only reward answers that **clearly demonstrate** understanding aligned with the model answer.

# 📤 Return JSON format:

# {{
#   "score": <score out of {max_marks}>,
#   "confidence": <1-10>,
#   "feedback": "<brief reason>",
#   "note": "Graded without retrieved context"
# }}
# """

#     SIMILARITY_ANALYSIS = """
# Compare the semantic similarity between the model and student answers.

# **MODEL ANSWER:**
# {model_answer}

# **STUDENT ANSWER:**
# {student_answer}

# 🛑 If the student answer is blank or meaningless, return score 0 with reason: "Empty or invalid answer".

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

# 🛑 If the student answer is blank or off-topic, set relevance_score = 0 and is_relevant = "NO"

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

# 🛑 If the student answer is empty, you may still evaluate how useful the course material **would have been** for answering it.

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
# You are generating professional feedback for a student based on their answer and grade.

# **QUESTION:**
# {question_text}

# **STUDENT ANSWER:**
# {student_answer}

# **SCORE AWARDED:**
# {score}/{max_marks}

# 🛑 If score is 0 and answer is empty or meaningless, return:
# - "No answer was provided. Please ensure you write something meaningful for every question."

# Otherwise, return feedback in bullet points:
# - ✅ What the student did well
# - ❌ What was incorrect or missing
# - 💡 Suggestions for improvement
# - 🙌 Encouragement

# Return in plain text (no JSON).
# """

class GradingPrompts:
    """Collection of prompts used for automated grading with few-shot examples."""

    RAG_ASSISTED_GRADING = """
You are a strict academic examiner grading a student's answer using:
1. The official model answer
2. The grading instructions (with specific mark breakdowns)
3. The retrieved course material (for reference only)

---

### COMPREHENSIVE GRADING EXAMPLES:

*Example 1: Perfect Answer - Full Marks*
Question: "Define supervised learning and give one example."
Model Answer: "Supervised learning is a machine learning approach where algorithms learn from labeled training data to make predictions on new, unseen data. Example: Email spam detection."
Guidelines: "Definition with labeled data (2 marks), prediction aspect (1 mark), valid example (1 mark)"
Max Marks: 4
Student Answer: "Supervised learning uses labeled datasets where input-output pairs are known to train algorithms that can predict outcomes for new data. For example, training a model to classify emails as spam or not spam using a dataset of pre-labeled emails."

Grading Result:
json
{
  "score": 4.0,
  "confidence": 10,
  "feedback": "Perfect answer! Complete definition including labeled data and prediction capability, with an excellent, detailed example.",
  "key_points_covered": ["labeled data concept", "input-output pairs", "prediction on new data", "detailed valid example"],
  "missing_elements": []
}


*Example 2: Good Answer - Near Full Marks*
Question: "List three types of machine learning with brief descriptions."
Model Answer: "1. Supervised - uses labeled data, 2. Unsupervised - finds patterns in unlabeled data, 3. Reinforcement - learns through rewards/penalties"
Guidelines: "Each type named (1 mark each), each description (1 mark each) = 6 marks total"
Max Marks: 6
Student Answer: "1. Supervised learning - uses training data with known answers, 2. Unsupervised learning - discovers hidden patterns in data, 3. Reinforcement learning - agent learns by trial and error"

Grading Result:
json
{
  "score": 5.5,
  "confidence": 9,
  "feedback": "Excellent identification of all three types with good descriptions. Minor deduction as reinforcement learning description could mention rewards/penalties more explicitly.",
  "key_points_covered": ["all three types correctly named", "supervised description accurate", "unsupervised pattern discovery", "reinforcement trial-and-error concept"],
  "missing_elements": ["explicit mention of rewards/penalties in reinforcement learning"]
}


*Example 3: Partial Answer - Half Marks*
Question: "Explain overfitting and how to prevent it."
Model Answer: "Overfitting occurs when model learns training data too specifically, including noise, leading to poor generalization. Prevention: cross-validation, regularization, more data."
Guidelines: "Definition (2 marks), generalization issue (1 mark), prevention methods (2 marks each, max 3 methods)"
Max Marks: 8
Student Answer: "Overfitting is when a model memorizes the training data and doesn't work well on new data. You can prevent it by using more training data."

Grading Result:
json
{
  "score": 4.0,
  "confidence": 8,
  "feedback": "Good basic understanding of overfitting and its impact on generalization. Mentioned one valid prevention method but missing other important techniques like cross-validation and regularization.",
  "key_points_covered": ["basic overfitting definition", "poor performance on new data", "more data as prevention"],
  "missing_elements": ["learning noise/details too specifically", "cross-validation", "regularization techniques"]
}


*Example 4: Weak Answer - Low Marks*
Question: "What is data preprocessing and why is it important?"
Model Answer: "Data preprocessing involves cleaning, transforming, and preparing raw data before ML algorithms. Important because raw data has errors, inconsistencies, different scales that affect model performance."
Guidelines: "Definition of preprocessing (2 marks), importance explanation (3 marks)"
Max Marks: 5
Student Answer: "Data preprocessing is about data. It's important because data needs to be good."

Grading Result:
json
{
  "score": 0.5,
  "confidence": 9,
  "feedback": "Very vague response showing minimal understanding. Answer lacks specific details about what preprocessing involves or why it's important for machine learning.",
  "key_points_covered": ["mentions data is important"],
  "missing_elements": ["specific preprocessing activities", "cleaning/transforming data", "impact on model performance", "concrete reasons for importance"]
}


*Example 5: Wrong Topic - Zero Marks*
Question: "Describe neural networks and their basic structure."
Model Answer: "Neural networks are computational models inspired by biological brains, consisting of interconnected nodes in layers (input, hidden, output) that process information through weighted connections."
Guidelines: "Basic definition (2 marks), layer structure (2 marks), connection concept (1 mark)"
Max Marks: 5
Student Answer: "Database management systems use tables to store data with primary keys and foreign keys for relationships between tables."

Grading Result:
json
{
  "score": 0,
  "confidence": 10,
  "feedback": "Answer discusses database systems, which is completely unrelated to neural networks. Please review the course material on artificial neural networks and their architecture.",
  "key_points_covered": [],
  "missing_elements": ["neural network definition", "brain-inspired concept", "layer structure", "node connections", "information processing"]
}


*Example 6: Empty Answer - Zero Marks*
Question: "Define machine learning."
Student Answer: ""
OR Student Answer: "   "
OR Student Answer: "I don't know"
OR Student Answer: "N/A"

Grading Result:
json
{
  "score": 0,
  "confidence": 10,
  "feedback": "No answer provided",
  "key_points_covered": [],
  "missing_elements": ["Complete answer required"]
}


*Example 7: Essay Question - Comprehensive Assessment*
Question: "Discuss the challenges in machine learning and propose solutions. (15 marks)"
Model Answer: "Major challenges include: 1) Data quality issues 2) Overfitting 3) Interpretability 4) Computational complexity. Solutions involve preprocessing, regularization, explainable AI, and efficient algorithms."
Guidelines: "Introduction (2 marks), Each challenge identified (2 marks each, max 4), Each solution (1.5 marks each), Conclusion (1 mark)"
Max Marks: 15
Student Answer: "Machine learning faces several challenges. Data quality is a problem because data can be messy with missing values and errors. Overfitting happens when models learn training data too well. To solve data issues, we can clean and preprocess data. For overfitting, we can use techniques like cross-validation. These solutions help improve model performance."

Grading Result:
json
{
  "score": 9.0,
  "confidence": 8,
  "feedback": "Good structured response covering key challenges and solutions. Identified data quality and overfitting issues with appropriate solutions. Missing discussion of interpretability and computational complexity challenges. Could benefit from more detailed explanations and a stronger conclusion.",
  "key_points_covered": ["data quality challenge", "overfitting problem", "preprocessing solution", "cross-validation technique", "logical structure"],
  "missing_elements": ["interpretability challenge", "computational complexity", "explainable AI solutions", "efficient algorithms", "comprehensive conclusion"]
}


*Example 8: List Question - Complete Performance Analysis*
Question: "List five advantages of cloud computing."
Model Answer: "1. Scalability 2. Cost-effectiveness 3. Accessibility 4. Automatic updates 5. Reliability/backup"
Guidelines: "1 mark for each correct advantage (max 5)"
Max Marks: 5
Student Answer: "1. Can scale up or down as needed 2. Cheaper than buying hardware 3. Access from anywhere 4. Don't need to update software manually 5. Data is backed up automatically"

Grading Result:
json
{
  "score": 5.0,
  "confidence": 10,
  "feedback": "Excellent comprehensive answer! All five advantages correctly identified with clear, detailed explanations showing strong understanding of cloud computing benefits.",
  "key_points_covered": ["scalability with flexibility", "cost benefits over hardware", "remote accessibility", "automatic software updates", "data backup/reliability"],
  "missing_elements": []
}


---
*QUESTION:*
{question_text}

*MODEL ANSWER:*
{model_answer}

*GRADING INSTRUCTIONS:*
{guideline}

*MAXIMUM MARKS:*
{max_marks}

*STUDENT ANSWER:*
{student_answer}

*RETRIEVED COURSE MATERIAL (REFERENCE):*
{retrieved_chunks}
---

🛑 *ZERO-SHOT RULE*:
If the student answer is:
- empty,
- contains only whitespace,
- or lacks meaningful content (like just "N/A", "don't know", or random letters),

➡ Then IMMEDIATELY assign a *score of 0* with reason: "No answer provided" — *do not evaluate further*.

🎯 Grading Instructions (only if answer is valid):
- ✅ Use ONLY the grading instructions for score allocation.
- ✅ Award partial marks ONLY when criteria are clearly met.
- ✅ Compare against the model answer for accuracy verification.
- ❌ Do NOT award marks for vague or unrelated statements.
- ❌ Do NOT infer intent beyond what is clearly stated.
- ✅ Use course material only for fact-checking or verifying terminology.
- ✅ Be consistent with the grading examples provided above.

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

### COMPREHENSIVE GRADING EXAMPLES:

*Example 1: Technical Question - Excellent Answer*
Question: "Explain the difference between supervised and unsupervised learning."
Model Answer: "Supervised learning uses labeled data to train models for prediction, while unsupervised learning finds patterns in unlabeled data without predefined outcomes."
Max Marks: 4
Student Answer: "Supervised learning has input-output pairs for training and makes predictions, while unsupervised learning only has inputs and discovers hidden patterns without knowing the expected output."

Grading Result:
json
{
  "score": 4.0,
  "confidence": 9,
  "feedback": "Excellent answer clearly distinguishing both approaches. Correctly identified key aspects: labeled vs unlabeled data, prediction vs pattern discovery.",
  "note": "Graded without retrieved context"
}


*Example 2: Technical Question - Good Answer*
Question: "Explain the difference between supervised and unsupervised learning."
Model Answer: "Supervised learning uses labeled data to train models for prediction, while unsupervised learning finds patterns in unlabeled data without predefined outcomes."
Max Marks: 4
Student Answer: "Supervised learning has input-output pairs for training, unsupervised learning only has inputs and finds hidden patterns."

Grading Result:
json
{
  "score": 3.5,
  "confidence": 8,
  "feedback": "Good understanding demonstrated. Correctly identified key differences but could be more precise about prediction vs pattern discovery aspects.",
  "note": "Graded without retrieved context"
}


*Example 3: Conceptual Question - Partial Answer*
Question: "What is machine learning?"
Model Answer: "Machine learning is a subset of AI that enables computers to learn from data without explicit programming."
Max Marks: 3
Student Answer: "Machine learning is when computers learn from data."

Grading Result:
json
{
  "score": 1.5,
  "confidence": 8,
  "feedback": "Basic understanding shown - correctly identifies data learning aspect but missing key elements like AI relationship and avoiding explicit programming.",
  "note": "Graded without retrieved context"
}


*Example 4: Conceptual Question - Poor Answer*
Question: "What is machine learning?"
Model Answer: "Machine learning is a subset of AI that enables computers to learn from data without explicit programming."
Max Marks: 3
Student Answer: "It's about computers and data."

Grading Result:
json
{
  "score": 0.5,
  "confidence": 9,
  "feedback": "Very basic response lacking detail. Shows minimal understanding of the concept but missing key elements like learning aspect and AI relationship.",
  "note": "Graded without retrieved context"
}


*Example 5: List Question - Complete Answer*
Question: "List three advantages of using databases."
Model Answer: "1. Data integrity 2. Concurrent access 3. Data security"
Max Marks: 3
Student Answer: "1. Ensures data accuracy and consistency 2. Multiple users can access simultaneously 3. Provides access controls and backup"

Grading Result:
json
{
  "score": 3.0,
  "confidence": 10,
  "feedback": "Perfect answer with detailed explanations of all three advantages showing excellent understanding.",
  "note": "Graded without retrieved context"
}


*Example 6: List Question - Partial Answer*
Question: "List three advantages of using databases."
Model Answer: "1. Data integrity 2. Concurrent access 3. Data security"
Max Marks: 3
Student Answer: "Data integrity, multiple access"

Grading Result:
json
{
  "score": 2.0,
  "confidence": 8,
  "feedback": "Good identification of two advantages but missing third advantage (data security). Answers provided are correct.",
  "note": "Graded without retrieved context"
}


*Example 7: Empty Answer*
Student Answer: "" OR "I don't know" OR "None" OR "N/A"

Grading Result:
json
{
  "score": 0,
  "confidence": 10,
  "feedback": "No answer provided",
  "note": "Graded without retrieved context"
}


*Example 8: Irrelevant Answer*
Question: "What is supervised learning?"
Model Answer: "Supervised learning uses labeled data to train models for prediction."
Max Marks: 3
Student Answer: "Database normalization reduces data redundancy by organizing tables."

Grading Result:
json
{
  "score": 0,
  "confidence": 10,
  "feedback": "Answer discusses database concepts which are unrelated to supervised learning. Please focus on machine learning concepts.",
  "note": "Graded without retrieved context"
}


---
*QUESTION:*
{question_text}

*MODEL ANSWER:*
{model_answer}

*STUDENT ANSWER:*
{student_answer}

*MAXIMUM MARKS:* {max_marks}

---

🛑 *ZERO-SHOT RULE*:
If the student answer is:
- empty,
- whitespace-only,
- or meaningless (e.g., "N/A", "none", gibberish)

➡ Return immediately:

{{
  "score": 0,
  "confidence": 10,
  "feedback": "No answer provided",
  "note": "Graded without retrieved context"
}}

📌 Otherwise:
- Grade fairly and consistently following the examples above.
- Reward answers only when they clearly demonstrate correct understanding aligned with the model answer.
- Consider partial credit for partially correct responses.
- Be specific in feedback about what was correct and what was missing.

📤 Return in JSON format as shown above.
"""

    SIMILARITY_ANALYSIS = """
Compare the semantic similarity between the model and student answers.

---

### COMPREHENSIVE SIMILARITY EXAMPLES:

*Example 1: Perfect Match (Score: 10)*
Model: "Machine learning is a subset of AI that enables computers to learn from data without explicit programming."
Student: "Machine learning is a subset of artificial intelligence that allows computers to learn from data without being explicitly programmed."
Reasoning: "Identical meaning with perfect conceptual alignment and equivalent terminology."

*Example 2: Excellent Similarity (Score: 9)*
Model: "Supervised learning uses labeled data to train models for prediction tasks."
Student: "Supervised learning utilizes labeled datasets to build predictive models."
Reasoning: "Same core concepts with high precision, minor variation in terminology."

*Example 3: Very Good Similarity (Score: 8)*
Model: "Neural networks consist of interconnected nodes organized in layers."
Student: "Neural networks are made up of connected neurons arranged in different layers."
Reasoning: "Same structure and concept, using 'neurons' instead of 'nodes' which is acceptable terminology."

*Example 4: Good Similarity (Score: 7)*
Model: "Data preprocessing involves cleaning, transforming, and organizing raw data before feeding it to ML algorithms."
Student: "Data preprocessing means cleaning and preparing data before using it in machine learning."
Reasoning: "Captures main concepts but misses some details like transformation and organization."

*Example 5: Moderate Similarity (Score: 6)*
Model: "Cross-validation is used to assess model performance by partitioning data into training and validation sets."
Student: "Cross-validation helps test how well a model works by splitting data."
Reasoning: "Basic concept correct but lacks precision about partitioning methodology and purpose."

*Example 6: Partial Similarity (Score: 5)*
Model: "Overfitting occurs when a model learns training data too specifically, including noise, resulting in poor generalization."
Student: "Overfitting happens when a model memorizes the training data."
Reasoning: "Basic concept correct but missing critical aspects of noise and generalization."

*Example 7: Limited Similarity (Score: 4)*
Model: "Feature engineering involves selecting and transforming variables to improve model performance."
Student: "Feature engineering is about working with features in machine learning."
Reasoning: "Very basic understanding, mentions features and ML but lacks specific details about selection and transformation."

*Example 8: Low Similarity (Score: 3)*
Model: "Regularization techniques help prevent overfitting by adding penalty terms to the loss function."
Student: "Regularization is used in machine learning to help with problems."
Reasoning: "Vague connection to topic but lacks understanding of the actual process and purpose."

*Example 9: Minimal Similarity (Score: 2)*
Model: "Gradient descent is an optimization algorithm that iteratively adjusts parameters to minimize loss."
Student: "Gradient descent has something to do with algorithms."
Reasoning: "Extremely basic recognition of algorithmic nature but no understanding of optimization or parameters."

*Example 10: Poor Similarity (Score: 1)*
Model: "Clustering algorithms group similar data points together without supervision."
Student: "You need to use data in machine learning."
Reasoning: "Only mentions data and ML but completely misses clustering concept and unsupervised nature."

*Example 11: No Similarity - Empty Answer (Score: 0)*
Student: "" OR "   " OR "N/A" OR "I don't know" OR "none"
Reasoning: "No answer provided or meaningless content."

*Example 12: No Similarity - Wrong Topic (Score: 0)*
Model: "Neural networks consist of interconnected nodes organized in layers."
Student: "Database management systems store information in tables with primary and foreign keys."
Reasoning: "Completely unrelated topic, no conceptual overlap."

---

*MODEL ANSWER:*
{model_answer}

*STUDENT ANSWER:*
{student_answer}

🛑 *ZERO-SHOT RULE*:
If the student answer is blank, nonsense, or clearly invalid, return:

{{
  "similarity_score": 0,
  "reasoning": "No answer provided"
}}

Rate similarity from 0 to 10:
- 0: No answer, gibberish, or completely unrelated
- 1-2: Minimal connection, major misunderstanding
- 3-4: Some basic understanding but significant gaps
- 5-6: Partial understanding with important missing elements
- 7-8: Good understanding with minor gaps or imprecision
- 9: Excellent match with minor terminology differences
- 10: Perfect conceptual alignment

Return in JSON:
{{
  "similarity_score": <0_to_10>,
  "reasoning": "<brief explanation>"
}}
"""

    ANSWER_RELEVANCE_CHECK = """
Check if the student's answer is relevant to the question.

---

### COMPREHENSIVE RELEVANCE EXAMPLES:

*Example 1: Perfectly Relevant (Score: 10)*
Question: "Define machine learning."
Student: "Machine learning is a branch of AI where computers learn patterns from data to make predictions."
Result: "Directly answers the question with accurate definition and key concepts."

*Example 2: Highly Relevant (Score: 9)*
Question: "List three types of machine learning."
Student: "Supervised learning, unsupervised learning, and reinforcement learning are the main types."
Result: "Directly answers with correct examples, perfectly on-topic."

*Example 3: Very Relevant (Score: 8)*
Question: "Explain overfitting in machine learning."
Student: "Overfitting occurs when a model learns training data too well and fails to generalize to new data."
Result: "Directly addresses overfitting with good explanation."

*Example 4: Mostly Relevant (Score: 7)*
Question: "What is data preprocessing?"
Student: "Data preprocessing involves cleaning data and preparing it for analysis in AI systems."
Result: "Addresses preprocessing but uses 'AI systems' instead of specifically ML context."

*Example 5: Moderately Relevant (Score: 6)*
Question: "Describe neural networks."
Student: "Neural networks are used in artificial intelligence to solve complex problems."
Result: "Related to neural networks and AI but lacks specific architectural details requested."

*Example 6: Partially Relevant (Score: 5)*
Question: "What is supervised learning?"
Student: "Supervised learning is a type of machine learning that uses data."
Result: "Identifies it as ML type but missing key aspects like labeling and prediction."

*Example 7: Somewhat Relevant (Score: 4)*
Question: "Explain gradient descent."
Student: "Gradient descent is used in machine learning algorithms."
Result: "Correctly places in ML context but doesn't explain what it actually does."

*Example 8: Minimally Relevant (Score: 3)*
Question: "What is cross-validation?"
Student: "Cross-validation has to do with testing in computer science."
Result: "Very general connection to testing and CS but misses ML-specific context."

*Example 9: Barely Relevant (Score: 2)*
Question: "Define clustering algorithms."
Student: "Algorithms are important in programming and software development."
Result: "Mentions algorithms but completely misses clustering and ML context."

*Example 10: Not Relevant (Score: 1)*
Question: "Explain backpropagation algorithm."
Student: "Databases store information in tables with rows and columns."
Result: "Different topic entirely, no relevance to neural networks or algorithms."

*Example 11: No Answer (Score: 0)*
Question: "What is gradient descent?"
Student: "" OR "I don't know" OR "N/A" OR "xyz123" OR "none"
Result: "No meaningful answer provided."

---

*QUESTION:*
{question_text}

*STUDENT ANSWER:*
{student_answer}

🛑 *ZERO-SHOT RULE*:
If the student answer is blank, gibberish, or clearly meaningless:

{{
  "relevance_score": 0,
  "is_relevant": "NO",
  "explanation": "No answer provided or meaningless content"
}}

Otherwise, rate relevance from 1 to 10:
- 1-2: Completely off-topic or wrong subject area
- 3-4: Tangentially related but misses the main point
- 5-6: Addresses the general topic but lacks specificity
- 7-8: Good relevance with minor deviations
- 9-10: Directly addresses the question

Return in JSON:
{{
  "relevance_score": <0_to_10>,
  "is_relevant": "<YES/NO>",
  "explanation": "<brief reasoning>"
}}
"""

    CONTEXT_RELEVANCE_EVALUATION = """
Evaluate how helpful the provided context is for grading this answer.

---

### COMPREHENSIVE CONTEXT RELEVANCE EXAMPLES:

*Example 1: Highly Relevant Context (Score: 9)*
Question: "Explain convolutional neural networks."
Student: "CNNs use filters to detect features in images through convolution operations."
Context: "Convolutional Neural Networks (CNNs) are deep learning models that use convolution operations with learnable filters to extract hierarchical features from input data, particularly effective for image processing tasks. The architecture consists of convolutional layers, pooling layers, and fully connected layers..."
Result: "Context provides comprehensive information directly relevant to grading CNN knowledge including architecture details and applications."

*Example 2: Very Relevant Context (Score: 8)*
Question: "What is overfitting and how to prevent it?"
Student: "Overfitting happens when model memorizes training data. Use cross-validation to prevent it."
Context: "Overfitting occurs when a model learns training data too specifically, including noise and outliers, resulting in poor generalization to new data. Prevention techniques include cross-validation, regularization (L1/L2), dropout, early stopping, and increasing training data size..."
Result: "Context directly addresses both overfitting definition and prevention methods, very useful for comprehensive grading."

*Example 3: Relevant Context (Score: 7)*
Question: "Define supervised learning."
Student: "Supervised learning uses labeled data for training."
Context: "Supervised learning is a machine learning paradigm where algorithms learn from labeled training examples consisting of input-output pairs. Common applications include classification and regression tasks. Examples include decision trees, neural networks, and support vector machines..."
Result: "Context provides good definition and examples, helpful for verifying student understanding and identifying missing elements."

*Example 4: Moderately Relevant Context (Score: 6)*
Question: "What is data preprocessing?"
Student: "Data preprocessing cleans and prepares data."
Context: "Machine learning workflows typically involve several stages: data collection, preprocessing, model selection, training, validation, and deployment. Data quality is crucial for model performance. Common issues include missing values, outliers, and inconsistent formatting..."
Result: "Context touches on preprocessing importance but doesn't provide specific techniques or detailed explanations."

*Example 5: Somewhat Relevant Context (Score: 5)*
Question: "Explain neural networks."
Student: "Neural networks are inspired by the brain and have layers."
Context: "Artificial intelligence encompasses various approaches including rule-based systems, machine learning, and deep learning. Machine learning algorithms can be categorized as supervised, unsupervised, or reinforcement learning. Each approach has specific use cases and advantages..."
Result: "Context provides general ML background but lacks specific neural network architecture details needed for grading."

*Example 6: Limited Relevance Context (Score: 4)*
Question: "What is gradient descent?"
Student: "Gradient descent is an optimization method."
Context: "Machine learning models require various mathematical concepts including linear algebra, calculus, and statistics. Optimization is important in ML. Popular programming languages for ML include Python and R with libraries like scikit-learn and TensorFlow..."
Result: "Context mentions optimization briefly but doesn't explain gradient descent specifics or methodology."

*Example 7: Minimally Relevant Context (Score: 3)*
Question: "Define supervised learning."
Student: "Supervised learning uses labeled data for training."
Context: "Artificial intelligence encompasses various fields including robotics, expert systems, and natural language processing. Computer vision is another important AI application. Recent advances include transformer architectures and large language models..."
Result: "Context is too general about AI and doesn't provide specific information about supervised learning."

*Example 8: Poor Context Relevance (Score: 2)*
Question: "Explain clustering algorithms."
Student: "Clustering groups similar data points."
Context: "Software engineering principles include modularity, abstraction, and encapsulation. Object-oriented programming languages like Java and C++ support these concepts. Version control systems help manage code changes..."
Result: "Context is about software engineering, completely unrelated to machine learning or clustering."

*Example 9: Not Relevant Context (Score: 1)*
Question: "What is reinforcement learning?"
Student: "Reinforcement learning involves agents learning through rewards."
Context: "Database normalization involves organizing data into tables to reduce redundancy. Primary keys uniquely identify records in relational databases. SQL is used to query relational databases..."
Result: "Context is about databases, completely unrelated to machine learning or reinforcement learning."

*Example 10: No Context Available (Score: 0)*
Question: "Describe backpropagation."
Student: "Backpropagation trains neural networks."
Context: ""
Result: "No context provided to assist with grading."

*Example 11: Empty Student Answer with Good Context (Score: 8)*
Question: "Describe neural network architecture."
Student: ""
Context: "Neural networks consist of layers of interconnected nodes. Input layer receives data, hidden layers process information through weighted connections and activation functions, output layer produces final results. Common architectures include feedforward, convolutional, and recurrent neural networks..."
Result: "Despite empty student answer, context would have been very helpful for providing model answer and comprehensive grading criteria."

*Example 12: Wrong Answer with Relevant Context (Score: 7)*
Question: "What is machine learning?"
Student: "Machine learning is about databases and SQL queries."
Context: "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. It includes supervised learning (classification, regression), unsupervised learning (clustering, dimensionality reduction), and reinforcement learning..."
Result: "Context provides excellent ML definition and categorization, very useful for identifying that student answer is completely incorrect."

---

*QUESTION:*
{question_text}

*STUDENT ANSWER:*
{student_answer}

*COURSE MATERIAL:*
{context}

🛑 If the student answer is empty or missing, you may still evaluate how useful the course material *would have been* for answering it.

Rate context relevance from 0 to 10:
- 0: No context provided
- 1-2: Context completely unrelated to question topic
- 3-4: Context touches on general subject but not specific question
- 5-6: Context somewhat helpful but missing key details
- 7-8: Context provides good relevant information for grading
- 9-10: Context directly addresses question topic with comprehensive details

Return in JSON:
{{
  "relevance_rating": <0_to_10>,
  "useful_for_grading": "<YES/NO>",
  "reason": "<explanation>"
}}
"""

    FEEDBACK_GENERATION = """
You are generating professional feedback for a student based on their answer and grade.

---

### COMPREHENSIVE FEEDBACK EXAMPLES:

*Example 1: Full Marks - Excellent Answer*
Question: "Define machine learning and give two examples."
Student Answer: "Machine learning is a subset of artificial intelligence that enables computers to learn patterns from data and make predictions without being explicitly programmed for each task. Examples: 1) Email spam detection - algorithms learn from labeled emails to classify new emails as spam or not spam. 2) Recommendation systems - platforms like Netflix use viewing history to suggest movies users might like."
Score: 10/10
Feedback: "Outstanding answer! You provided a comprehensive definition that includes all key elements: ML as subset of AI, learning from data, pattern recognition, and prediction without explicit programming. Your examples are excellent and well-explained, showing clear understanding of practical applications. The spam detection example perfectly illustrates supervised learning, while the recommendation system shows how ML applies to real-world problems."

*Example 2: Near Full Marks - Very Good Answer*
Question: "List four advantages of cloud computing."
Student Answer: "1. Scalability - can increase or decrease resources based on demand, 2. Cost savings - no need to buy expensive hardware upfront, 3. Accessibility - can access from anywhere with internet, 4. Automatic updates - software is updated by the provider"
Score: 8/8
Feedback: "Excellent comprehensive answer! You correctly identified all four key advantages with clear, detailed explanations. Your understanding of scalability, cost benefits, remote access, and automatic maintenance is spot-on. Each point demonstrates practical knowledge of cloud computing benefits."

*Example 3: Good Performance - Partial Marks*
Question: "Explain overfitting in machine learning and suggest two prevention methods."
Student Answer: "Overfitting is when a model learns the training data too well and doesn't work on new data. You can prevent it by using cross-validation and getting more training data."
Score: 6/10
Feedback: "Good basic understanding of overfitting and its impact on generalization! You correctly identified the core problem and provided two valid prevention methods. To improve your answer: 1) Explain WHY overfitting occurs (learning noise and specific details), 2) Describe HOW cross-validation helps prevent overfitting, 3) Consider additional methods like regularization or early stopping. Your foundation is solid - just needs more depth and technical detail."

*Example 4: Satisfactory - Basic Understanding*
Question: "What is supervised learning? Provide one example."
Student Answer: "Supervised learning uses data that has answers to train models. Example: predicting house prices."
Score: 4/8
Feedback: "You demonstrate basic understanding that supervised learning uses labeled data ('data that has answers'). Your house price prediction example is relevant. However, your answer needs more detail: 1) Explain that 'answers' means input-output pairs or labels, 2) Mention the goal of making predictions on new, unseen data, 3) Elaborate on your example - what input features (size, location, etc.) would predict house prices. You're on the right track but need to develop your explanations further."

*Example 5: Below Average - Insufficient Detail*
Question: "Describe the main components of a neural network."
Student Answer: "Neural networks have layers and nodes that are connected."
Score: 2/10
Feedback: "You've identified the basic structure (layers and connected nodes) but your answer lacks the detail needed for full credit. To improve: 1) Specify the types of layers (input, hidden, output), 2) Explain what nodes/neurons do (receive inputs, apply weights, use activation functions), 3) Describe how information flows through the network, 4) Mention concepts like weights, biases, and activation functions. Review the course material on neural network architecture for more comprehensive understanding."

*Example 6: Poor Performance - Major Gaps*
Question: "What is data preprocessing and why is it important in machine learning?"
Student Answer: "Data preprocessing is about data. It's important because data needs to be good."
Score: 1/10
Feedback: "Your answer shows you recognize that data preprocessing involves data and that data quality matters, but it lacks specific details needed for academic credit. Focus on: 1) What preprocessing actually involves (cleaning, transforming, handling missing values, normalization), 2) WHY these steps are necessary (raw data has errors, different scales, inconsistencies), 3) HOW poor data affects model performance, 4) Specific preprocessing techniques. Please review the course material on data preparation and try to provide concrete examples in your answers."

*Example 7: Zero Marks - Empty Answer*
Question: "Define clustering in machine learning."
Student Answer: ""
Score: 0/5
Feedback: "No answer was provided. Please ensure you write something meaningful for every question."

*Example 8: Zero Marks - Completely Wrong Topic*
Question: "Explain gradient descent algorithm."
Student Answer: "Databases use tables to store information with primary keys and foreign keys for creating relationships between different tables."
Score: 0/8
Feedback: "Your answer discusses database management concepts, which are completely unrelated to gradient descent. Gradient descent is an optimization algorithm used in machine learning to minimize loss functions by iteratively adjusting model parameters. Please review the course material on optimization algorithms and machine learning fundamentals. Make sure to read questions carefully and focus your answers on the specific topic asked."

*Example 9: Zero Marks - Meaningless Content*
Question: "What is reinforcement learning?"
Student Answer: "I don't know anything about this topic. N/A."
Score: 0/6
Feedback: "No meaningful answer was provided. Even if you're unsure, try to write something based on what you might remember from lectures or readings. Reinforcement learning is about agents learning through interaction with environments using rewards and penalties. Please review the course material and attempt to answer all questions, even if you can only provide basic information."

*Example 10: Essay Question - Mixed Performance*
Question: "Discuss the challenges in implementing machine learning systems in real-world applications. Provide specific examples and potential solutions. (20 marks)"
Student Answer: "Machine learning has many challenges in real world. Data can be bad quality with missing values and errors. This makes models not work well. Another problem is that models can be too complex and hard to understand. To fix data problems, we need to clean the data first. For complexity, we can use simpler models. Also, getting enough data is hard sometimes. Companies need to collect more data or use techniques like data augmentation."
Score: 12/20
Feedback: "Good identification of key challenges: data quality, model interpretability, and insufficient data. You provided relevant solutions like data cleaning, simpler models, and data augmentation. Strengths: 1) Clear structure addressing multiple challenges, 2) Practical solutions offered, 3) Recognition of real-world implementation issues. Areas for improvement: 1) Provide specific examples (e.g., healthcare ML systems face privacy constraints), 2) Discuss additional challenges like computational costs, model deployment, or bias, 3) Elaborate on solutions with more technical detail, 4) Include a stronger conclusion. Your foundation is solid - focus on adding depth and concrete examples in future essays."

*Example 11: List Question - Partially Correct*
Question: "List five types of machine learning algorithms."
Student Answer: "1. Decision trees, 2. Neural networks, 3. Linear regression, 4. Clustering"
Score: 4/10
Feedback: "You correctly identified four valid machine learning algorithms, showing good knowledge of different ML approaches. Decision trees, neural networks, linear regression, and clustering are all important ML techniques. However, you missed providing a fifth algorithm as requested. Consider adding algorithms like: support vector machines, random forests, k-nearest neighbors, or naive Bayes. Also, note that clustering is more specifically an unsupervised learning technique. For future responses, make sure to provide the exact number of items requested in the question."

*Example 12: Short Answer - Excellent Technical Detail*
Question: "Explain the bias-variance tradeoff in machine learning."
Student Answer: "The bias-variance tradeoff describes the relationship between a model's ability to capture true patterns (bias) and its sensitivity to training data variations (variance). High bias models (like linear regression) make strong assumptions and may underfit, missing important patterns. High variance models (like deep neural networks) are very flexible but may overfit to training data noise. The goal is finding optimal complexity that minimizes total error = bias² + variance + irreducible error. Techniques like cross-validation help find this balance."
Score: 10/10
Feedback: "Exceptional answer demonstrating deep understanding of this fundamental ML concept! You correctly explained both bias and variance, provided relevant examples (linear regression for high bias, neural networks for high variance), connected the concepts to underfitting/overfitting, included the mathematical relationship, and mentioned practical solutions like cross-validation. This level of technical accuracy and comprehensive coverage is exactly what's expected for full marks."

---

*QUESTION:*
{question_text}

*STUDENT ANSWER:*
{student_answer}

*SCORE AWARDED:*
{score}/{max_marks}

🛑 *Special Cases:*

If score is 0 and the answer is empty, nonsense, or clearly meaningless:
Return: "No answer was provided. Please ensure you write something meaningful for every question."

If score is 0 and the answer is irrelevant to the question:
Explain why the answer is off-topic and provide guidance on the correct topic area.

If score is 0 and the answer shows some attempt but is fundamentally incorrect:
Acknowledge the effort but explain the major misconceptions and provide study guidance.

📝 *For all other cases, provide structured feedback covering:*

✅ *Positive aspects:* What the student did well (even if minimal)
❌ *Issues identified:* What was incorrect, incomplete, or missing  
💡 *Specific improvements:* Concrete suggestions for better answers
🎯 *Study guidance:* Key concepts to review or areas to focus on
🔄 *Encouragement:* Constructive tone that motivates learning

*Format:* Write in clear paragraphs (not bullet points) with a professional, supportive tone. Be specific about what was correct and what needs improvement. Provide actionable advice for better performance in future.

Return in plain text (no JSON formatting).
"""