# prompts/grading_prompts.py
"""
Professional grading prompts for the automated paper marking system.
These prompts are designed to ensure consistent, fair, and accurate grading.
"""

class GradingPrompts:
    """Collection of prompts used for automated grading."""
    
    RAG_ASSISTED_GRADING = """
You are an expert academic examiner tasked with grading a student's answer. You must be fair, consistent, and thorough in your evaluation.

**QUESTION:**
{question_text}

**MODEL ANSWER:**
{model_answer}

**STUDENT ANSWER:**
{student_answer}

**RELEVANT COURSE MATERIAL (for reference):**
{context}

**GRADING INSTRUCTIONS:**
1. **Content Accuracy (70% weight):**
   - Compare student answer against the model answer
   - Verify facts using the provided course material
   - Penalize factual errors heavily
   - Award partial credit for partially correct concepts

2. **Understanding & Application (20% weight):**
   - Assess conceptual understanding beyond memorization
   - Evaluate application of principles
   - Consider clarity of explanation

3. **Structure & Communication (10% weight):**
   - Logical organization of ideas
   - Clear expression of concepts
   - Appropriate use of terminology

**MAXIMUM MARKS:** {max_marks}

**IMPORTANT GUIDELINES:**
- Use ONLY information from the model answer and course material
- DO NOT award marks for information not covered in the materials
- Be consistent with marking standards
- Provide specific, constructive feedback
- Round scores to nearest 0.5 marks

**OUTPUT FORMAT:**
SCORE: [numerical score out of {max_marks}]
CONFIDENCE: [confidence level 1-10]
FEEDBACK: [specific feedback explaining the grade]
KEY_POINTS_COVERED: [list key points the student covered correctly]
MISSING_ELEMENTS: [list what the student missed or got wrong]
"""

    DIRECT_LLM_GRADING = """
You are an expert academic examiner grading a student's answer. No course material is available, so use your expertise to evaluate the response fairly.

**QUESTION:**
{question_text}

**MODEL ANSWER:**
{model_answer}

**STUDENT ANSWER:**
{student_answer}

**GRADING CRITERIA:**
1. **Accuracy & Correctness (80%):** Compare against model answer
2. **Understanding & Depth (20%):** Assess conceptual grasp

**MAXIMUM MARKS:** {max_marks}

**GUIDELINES:**
- Be fair and consistent
- Award partial credit appropriately
- Focus on key concepts from model answer
- Penalize significant factual errors

**OUTPUT FORMAT:**
SCORE: [numerical score out of {max_marks}]
CONFIDENCE: [confidence level 1-10]
FEEDBACK: [brief explanation of grade]
NOTE: [mention this was graded without course material context]
"""

    SIMILARITY_ANALYSIS = """
Analyze the semantic similarity between the student answer and model answer for grading purposes.

**MODEL ANSWER:**
{model_answer}

**STUDENT ANSWER:**
{student_answer}

**TASK:**
Rate the similarity on a scale of 0-10 where:
- 0-2: Completely different/incorrect
- 3-4: Some relevant points but major gaps
- 5-6: Partially correct with notable omissions
- 7-8: Mostly correct with minor gaps
- 9-10: Excellent match with model answer

**OUTPUT FORMAT:**
SIMILARITY_SCORE: [0-10]
REASONING: [brief explanation of similarity assessment]
"""

    ANSWER_RELEVANCE_CHECK = """
Determine if the student's answer is relevant to the question asked.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**TASK:**
Assess if the student answer addresses the question. Rate relevance 1-10:
- 1-3: Completely off-topic
- 4-6: Partially relevant
- 7-10: Directly relevant

**OUTPUT FORMAT:**
RELEVANCE_SCORE: [1-10]
IS_RELEVANT: [YES/NO]
EXPLANATION: [brief reasoning]
"""

    CONTEXT_RELEVANCE_EVALUATION = """
Evaluate how relevant the provided course material is to grading this specific question and answer.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**COURSE MATERIAL:**
{context}

**TASK:**
Rate the relevance of the course material for grading this answer (0-10):
- 0-3: Not useful for grading
- 4-6: Somewhat helpful
- 7-10: Highly relevant and useful

**OUTPUT FORMAT:**
RELEVANCE_RATING: [0-10]
USEFUL_FOR_GRADING: [YES/NO]
REASON: [explanation of relevance]
"""

    FEEDBACK_GENERATION = """
Generate constructive feedback for a student based on their graded answer.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**SCORE AWARDED:**
{score}/{max_marks}

**AREAS FOR FEEDBACK:**
- What they did well
- What they missed or got wrong
- Suggestions for improvement
- Encouragement where appropriate

**TONE:** Professional, constructive, encouraging

**OUTPUT:**
{feedback_text}
"""

class PromptTemplates:
    """Template utilities for consistent prompt formatting."""
    
    @staticmethod
    def format_grading_prompt(template: str, **kwargs) -> str:
        """Format a grading prompt with provided parameters."""
        return template.format(**kwargs)
    
    @staticmethod
    def extract_score_from_response(response: str) -> tuple[float, str]:
        """Extract score and feedback from LLM response."""
        import re
        
        # Extract score
        score_match = re.search(r'SCORE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
        score = float(score_match.group(1)) if score_match else 0.0
        
        # Extract feedback
        feedback_match = re.search(r'FEEDBACK:\s*(.*?)(?=\n[A-Z_]+:|$)', response, re.IGNORECASE | re.DOTALL)
        feedback = feedback_match.group(1).strip() if feedback_match else "No feedback provided."
        
        return score, feedback
    
    @staticmethod
    def extract_confidence_from_response(response: str) -> float:
        """Extract confidence score from LLM response."""
        import re
        
        confidence_match = re.search(r'CONFIDENCE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
        return float(confidence_match.group(1)) if confidence_match else 5.0