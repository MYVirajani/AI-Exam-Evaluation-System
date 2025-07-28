# # # prompts/rag_prompts.py
# # """
# # RAG system prompts for document retrieval and context evaluation.
# # """

# # class RAGPrompts:
# #     """Collection of prompts for RAG (Retrieval-Augmented Generation) operations."""
    
# #     CONTEXT_SEARCH_QUERY = """
# # Generate an effective search query to find relevant course material for grading this student answer.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **TASK:**
# # Create a search query that will help find relevant lecture notes, textbook content, or course materials 
# # that can be used to verify the accuracy of the student's answer.

# # **GUIDELINES:**
# # - Include key concepts from both question and answer
# # - Use academic terminology
# # - Keep query concise but comprehensive
# # - Focus on factual content that can be verified

# # **OUTPUT:**
# # {search_query}
# # """

# #     DOCUMENT_RELEVANCE_SCORING = """
# # Evaluate how relevant this document excerpt is for grading the given student answer.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **DOCUMENT EXCERPT:**
# # {document_content}

# # **EVALUATION CRITERIA:**
# # 1. **Content Overlap:** Does the document contain information directly related to the question/answer?
# # 2. **Verification Value:** Can this document help verify facts in the student answer?
# # 3. **Grading Utility:** Will this information help in assigning an accurate grade?

# # **RATING SCALE:**
# # - 9-10: Highly relevant, essential for grading
# # - 7-8: Very relevant, helpful for grading
# # - 5-6: Moderately relevant, somewhat useful
# # - 3-4: Low relevance, limited utility
# # - 1-2: Not relevant for grading

# # **OUTPUT FORMAT:**
# # RELEVANCE_SCORE: [1-10]
# # REASONING: [explanation of relevance]
# # KEY_CONCEPTS: [list main concepts that overlap]
# # GRADING_VALUE: [how this helps with grading]
# # """

# #     CONTEXT_SYNTHESIS = """
# # Synthesize the most relevant information from multiple course material excerpts for grading purposes.

# # **QUESTION:**
# # {question_text}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **COURSE MATERIAL EXCERPTS:**
# # {context_chunks}

# # **TASK:**
# # Create a coherent synthesis of the most relevant information that can be used to:
# # 1. Verify factual accuracy of the student answer
# # 2. Identify missing key concepts
# # 3. Assess depth of understanding

# # **GUIDELINES:**
# # - Focus on information directly relevant to the question
# # - Eliminate redundant or irrelevant details
# # - Organize information logically
# # - Highlight key facts for verification

# # **OUTPUT:**
# # **RELEVANT FACTS FOR VERIFICATION:**
# # - [Key fact 1]
# # - [Key fact 2]
# # - [etc.]

# # **KEY CONCEPTS STUDENT SHOULD ADDRESS:**
# # - [Concept 1]
# # - [Concept 2]
# # - [etc.]

# # **ADDITIONAL CONTEXT:**
# # [Any other relevant information for grading]
# # """

# #     HALLUCINATION_CHECK = """
# # Verify if the student's answer contains any information that contradicts or goes beyond the provided course materials.

# # **COURSE MATERIALS:**
# # {context}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **VERIFICATION TASK:**
# # 1. **Fact Checking:** Are all facts in the student answer supported by course materials?
# # 2. **Scope Check:** Does the student introduce information not covered in materials?
# # 3. **Accuracy Check:** Are there any contradictions with course content?

# # **CLASSIFICATION:**
# # - SUPPORTED: Information is backed by course materials
# # - UNSUPPORTED: Information not found in course materials
# # - CONTRADICTED: Information contradicts course materials

# # **OUTPUT FORMAT:**
# # OVERALL_ASSESSMENT: [SUPPORTED/PARTIALLY_SUPPORTED/UNSUPPORTED/CONTRADICTED]

# # SUPPORTED_POINTS:
# # - [Point 1]
# # - [Point 2]

# # UNSUPPORTED_POINTS:
# # - [Point 1 with explanation]
# # - [Point 2 with explanation]

# # CONTRADICTED_POINTS:
# # - [Point 1 with explanation]
# # - [Point 2 with explanation]

# # GRADING_RECOMMENDATION: [How these findings should affect the grade]
# # """

# #     KNOWLEDGE_GAP_IDENTIFICATION = """
# # Identify what key information the student missed based on the model answer and course materials.

# # **MODEL ANSWER:**
# # {model_answer}

# # **STUDENT ANSWER:**
# # {student_answer}

# # **COURSE MATERIALS:**
# # {context}

# # **ANALYSIS TASK:**
# # Compare the student answer against both the model answer and course materials to identify:
# # 1. Key concepts that were missed
# # 2. Important details that were omitted
# # 3. Depth of understanding gaps

# # **OUTPUT FORMAT:**
# # MISSING_KEY_CONCEPTS:
# # - [Concept 1: Brief explanation of importance]
# # - [Concept 2: Brief explanation of importance]

# # MISSING_DETAILS:
# # - [Detail 1]
# # - [Detail 2]

# # UNDERSTANDING_GAPS:
# # - [Gap 1: What this suggests about student understanding]
# # - [Gap 2: What this suggests about student understanding]

# # IMPACT_ON_GRADE: [How these gaps should affect the overall score]
# # """

# # class RAGUtilities:
# #     """Utility functions for RAG prompt processing."""
    
# #     @staticmethod
# #     def format_context_chunks(chunks: list, max_length: int = 2000) -> str:
# #         """Format multiple context chunks into a single string."""
# #         formatted_chunks = []
# #         current_length = 0
        
# #         for i, chunk in enumerate(chunks, 1):
# #             chunk_text = f"**Source {i}:**\n{chunk}\n"
# #             if current_length + len(chunk_text) <= max_length:
# #                 formatted_chunks.append(chunk_text)
# #                 current_length += len(chunk_text)
# #             else:
# #                 break
        
# #         return "\n".join(formatted_chunks)
    
# #     @staticmethod
# #     def extract_relevance_score(response: str) -> float:
# #         """Extract relevance score from LLM response."""
# #         import re
        
# #         score_match = re.search(r'RELEVANCE_SCORE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
# #         return float(score_match.group(1)) if score_match else 5.0
    
# #     @staticmethod
# #     def parse_hallucination_check(response: str) -> dict:
# #         """Parse hallucination check response into structured data."""
# #         import re
        
# #         # Extract overall assessment
# #         assessment_match = re.search(r'OVERALL_ASSESSMENT:\s*(\w+)', response, re.IGNORECASE)
# #         assessment = assessment_match.group(1) if assessment_match else "UNKNOWN"
        
# #         # Extract supported points
# #         supported_section = re.search(r'SUPPORTED_POINTS:(.*?)(?=UNSUPPORTED_POINTS:|CONTRADICTED_POINTS:|$)', 
# #                                     response, re.IGNORECASE | re.DOTALL)
# #         supported_points = []
# #         if supported_section:
# #             points = re.findall(r'-\s*(.*)', supported_section.group(1))
# #             supported_points = [point.strip() for point in points]
        
# #         # Extract unsupported points
# #         unsupported_section = re.search(r'UNSUPPORTED_POINTS:(.*?)(?=CONTRADICTED_POINTS:|GRADING_RECOMMENDATION:|$)', 
# #                                       response, re.IGNORECASE | re.DOTALL)
# #         unsupported_points = []
# #         if unsupported_section:
# #             points = re.findall(r'-\s*(.*)', unsupported_section.group(1))
# #             unsupported_points = [point.strip() for point in points]
        
# #         return {
# #             'assessment': assessment,
# #             'supported_points': supported_points,
# #             'unsupported_points': unsupported_points,
# #             'raw_response': response
# #         }

# GRADING_PROMPT = """
# You are a strict but fair examiner.

# QUESTION
# ========
# {question_text}

# MODEL ANSWER
# ============
# {model_answer}

# GUIDELINE / MARKING KEY
# =======================
# {guideline}

# CONTEXT (lecture excerpts – may help but are NOT authoritative)
# ==============================================================
# {retrieved_chunks}

# STUDENT ANSWER
# ==============
# {student_answer}

# MAX MARKS ALLOWED: {max_marks}

# INSTRUCTIONS
# ------------
# 1. Compare the student answer with model answer and guideline.
# 2. Consult the context only for clarification.
# 3. Return an INTEGER score from 0 to {max_marks}.
# 4. Provide one brief sentence explaining why.

# OUTPUT (JSON only, no markdown)
# {
#   "score": <int>,
#   "reason": "<short sentence>"
# }
# """

# class RAGPrompts:
#     RAG_QUERY_PROMPT = """
#     You are a strict but fair examiner. Your task is to grade student answers accurately based on the model answer, the marking guideline, and supporting lecture material.

#     QUESTION:
#     ---------
#     {question_text}

#     MODEL ANSWER:
#     -------------
#     {model_answer}

#     MARKING GUIDELINE:
#     ------------------
#     {guideline}

#     CONTEXT (Lecture Excerpts - for reference only):
#     ------------------------------------------------
#     {retrieved_chunks}

#     STUDENT ANSWER:
#     ---------------
#     {student_answer}

#     MAXIMUM MARKS:
#     --------------
#     {max_marks}

#     INSTRUCTIONS:
#     -------------
#     1. Compare the student’s answer with the model answer and the marking guideline.
#     2. Use the context only to clarify subject matter, not as a primary grading source.
#     3. Assign an INTEGER score from 0 to {max_marks} based strictly on correctness and relevance.
#     4. Provide a concise justification for the assigned score.

#     OUTPUT (JSON format only, no markdown or comments):
#     ----------------------------------------------------
#     {
#     "score": <int>,
#     "reason": "<one-sentence explanation>"
#     }
#     """

#     class RAGUtilities:
#         @staticmethod
#         def format_retrieved_chunks(chunks):
#             return "\n\n".join([f"- {chunk}" for chunk in chunks])


# ── src/prompts/rag_prompts.py ────────────────────────────────────────────

# class RAGPrompts:
#     """
#     Holds template strings used by the Retrieval-Augmented Grading pipeline.
#     """

#     # Main prompt sent to the LLM when grading a single question
#     GRADING_PROMPT = """
# You are a strict but fair examiner. Grade the student answer using the
# model answer, marking guideline, and any helpful context from lecture material.

# QUESTION:
# ---------
# {question_text}

# MODEL ANSWER:
# -------------
# {model_answer}

# MARKING GUIDELINE:
# ------------------
# {guideline}

# CONTEXT (lecture excerpts – for reference only):
# ------------------------------------------------
# {retrieved_chunks}

# STUDENT ANSWER:
# ---------------
# {student_answer}

# MAXIMUM MARKS:
# --------------
# {max_marks}

# INSTRUCTIONS:
# -------------
# 1. Compare the student’s answer with the model answer and guideline.
# 2. Use the context *only* to clarify the subject, not as a primary grading source.
# 3. Assign an INTEGER score from 0 to {max_marks}.
# 4. Provide a concise justification for the score.

# OUTPUT (JSON only, no markdown):
# --------------------------------
# {{
#   "score": <int>,
#   "reason": "<one-sentence explanation>"
# }}
# """

#     # (Optional) prompt for similarity-search retrieval
#     RETRIEVAL_PROMPT = """
# Use the following question text to retrieve the most relevant lecture excerpts.

# QUESTION:
# {question_text}
# """


# class RAGUtilities:
#     """
#     Helper utilities for the RAG pipeline.
#     """

#     @staticmethod
#     def format_retrieved_chunks(chunks) -> str:
#         """
#         Turn a list/iterable of chunk strings into a readable block for the prompt.
#         """
#         return "\n\n".join(f"- {chunk}" for chunk in chunks)

# ***********************************************************
# class RAGPrompts:
#     """
#     Holds template strings used by the Retrieval-Augmented Grading pipeline.
#     """

#     # Main prompt sent to the LLM when grading a single question
#     GRADING_PROMPT = """
# You are a strict but fair examiner. Grade the student answer using the
# model answer, marking guideline, and any helpful context from lecture material.

# QUESTION:
# ---------
# {question_text}

# MODEL ANSWER:
# -------------
# {model_answer}

# MARKING GUIDELINE:
# ------------------
# {guideline}

# CONTEXT (lecture excerpts – for reference only):
# ------------------------------------------------
# {retrieved_chunks}

# STUDENT ANSWER:
# ---------------
# {student_answer}

# MAXIMUM MARKS:
# --------------
# {max_marks}

# INSTRUCTIONS:
# -------------
# 1. Compare the student’s answer with the model answer and guideline.
# 2. Use the context *only* to clarify the subject, not as a primary grading source.
# 3. Assign a FLOAT score from 0 to {max_marks}.
# 4. Provide a concise justification for the score.

# OUTPUT (JSON only, no markdown):
# --------------------------------
# {{
#   "score": <float>,
#   "reason": "<one-sentence explanation>"
# }}
# """

#     # Prompt for similarity-search retrieval
#     RETRIEVAL_PROMPT = """
# Use the following question text to retrieve the most relevant lecture excerpts.

# QUESTION:
# {question_text}
# """


# class RAGUtilities:
#     """
#     Helper utilities for the RAG pipeline.
#     """

#     @staticmethod
#     def format_retrieved_chunks(chunks) -> str:
#         """
#         Turn a list/iterable of chunk strings into a readable block for the prompt.
#         """
#         return "\n\n".join(f"- {chunk}" for chunk in chunks)

# src/prompts/rag_prompts.py

from src.prompts.few_shot_examples import FewShotExamples

class RAGPrompts:
    """
    Holds template strings used by the Retrieval-Augmented Grading pipeline.
    ENHANCED with few-shot prompting and three-way comparison support.
    """

    # ORIGINAL prompt (kept for backward compatibility)
    GRADING_PROMPT_ORIGINAL = """
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
1. Compare the student's answer with the model answer and guideline.
2. Use the context *only* to clarify the subject, not as a primary grading source.
3. Assign a FLOAT score from 0 to {max_marks}.
4. Provide a concise justification for the score.

OUTPUT (JSON only, no markdown):
--------------------------------
{{
  "score": <float>,
  "reason": "<one-sentence explanation>"
}}
"""

    # NEW: Enhanced grading prompt with few-shot examples
    GRADING_PROMPT = """
You are a strict but fair examiner. Grade the student answer using few-shot learning and the provided references.

**FEW-SHOT LEARNING EXAMPLES:**

{few_shot_examples}

---

**NOW APPLY THIS APPROACH:**

QUESTION:
---------
{question_text}

MODEL ANSWER (Lecturer's Official Answer):
------------------------------------------
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
1. **Learn from examples above**: Apply the same grading logic and standards
2. **Primary Reference**: Compare against model answer and guideline
3. **Context Usage**: Use lecture context only for clarification, not as primary source
4. **Scoring**: Assign a FLOAT score from 0 to {max_marks}
5. **Consistency**: Maintain the same rigor as shown in examples

OUTPUT (JSON only, no markdown):
--------------------------------
{{
  "score": <float>,
  "reason": "<concise explanation following example style>"
}}
"""

    # NEW: Three-way comparison prompt with few-shot learning
    THREE_WAY_GRADING_PROMPT = """
You are a strict but fair examiner. Grade using THREE-WAY COMPARISON with few-shot learning.

**FEW-SHOT GRADING EXAMPLES:**

{few_shot_examples}

---

**NOW APPLY THREE-WAY COMPARISON:**

QUESTION:
---------
{question_text}

**1. MODEL ANSWER (Official Reference - 40% weight):**
{model_answer}

**2. LLM-GENERATED ANSWER (Comprehensive Reference - 40% weight):**
{llm_generated_answer}

**3. MARKING GUIDELINE:**
{guideline}

**4. CONTEXT (Supporting Material - 20% weight):**
{retrieved_chunks}

STUDENT ANSWER:
---------------
{student_answer}

MAXIMUM MARKS:
--------------
{max_marks}

INSTRUCTIONS:
-------------
1. **Follow Examples**: Apply the three-way comparison logic shown above
2. **Weight Distribution**: 40% model answer, 40% LLM answer, 20% context+guideline
3. **Scoring Logic**: 
   - Full marks if student matches quality of both primary references
   - Partial credit for covering concepts from either reference
   - Use context and guideline for clarification and additional points
4. **Comprehensive Assessment**: Consider completeness shown in LLM-generated answer

OUTPUT (JSON only, no markdown):
--------------------------------
{{
  "score": <float>,
  "reason": "<explanation of three-way comparison>",
  "model_coverage": "<how well student covered model answer>",
  "llm_coverage": "<how well student covered LLM answer>"
}}
"""

    # NEW: LLM answer generation prompt with few-shot examples
    LLM_ANSWER_GENERATION_PROMPT = """
You are an expert academic assistant. Generate comprehensive answers using few-shot learning.

**FEW-SHOT GENERATION EXAMPLES:**

{generation_examples}

---

**YOUR TASK:**
Generate a comprehensive answer following the same quality and approach as the examples above.

QUESTION:
---------
{question_text}

COURSE MATERIAL CONTEXT:
------------------------
{rag_context}

INSTRUCTIONS:
-------------
1. **Learn from Examples**: Match the depth, structure, and quality shown above
2. **Combine Sources**: Use both course context AND your knowledge
3. **Comprehensive Coverage**: Include definitions, explanations, examples where appropriate
4. **Academic Quality**: Maintain formal, accurate academic writing
5. **Logical Structure**: Organize information clearly and logically

**GENERATED ANSWER:**
"""

    # Prompt for similarity-search retrieval
    RETRIEVAL_PROMPT = """
Use the following question text to retrieve the most relevant lecture excerpts.

QUESTION:
{question_text}
"""

class RAGUtilities:
    """
    Helper utilities for the RAG pipeline with few-shot support.
    """

    @staticmethod
    def format_retrieved_chunks(chunks) -> str:
        """
        Turn a list/iterable of chunk strings into a readable block for the prompt.
        """
        if not chunks:
            return "No relevant context retrieved."
        return "\n\n".join(f"- {chunk}" for chunk in chunks)

    @staticmethod
    def format_grading_prompt_with_examples(question_text: str, model_answer: str,
                                          guideline: str, retrieved_chunks: str,
                                          student_answer: str, max_marks: float,
                                          domain: str = 'ML') -> str:
        """
        Format the grading prompt with few-shot examples
        
        Args:
            question_text: The exam question
            model_answer: Lecturer's model answer
            guideline: Marking guideline
            retrieved_chunks: RAG context chunks
            student_answer: Student's answer
            max_marks: Maximum marks for the question
            domain: Domain for examples ('ML', 'CS', 'EE')
        """
        few_shot_examples = FewShotExamples.format_grading_examples(domain, count=2)
        
        return RAGPrompts.GRADING_PROMPT.format(
            few_shot_examples=few_shot_examples,
            question_text=question_text,
            model_answer=model_answer,
            guideline=guideline,
            retrieved_chunks=retrieved_chunks,
            student_answer=student_answer,
            max_marks=max_marks
        )
    
    @staticmethod
    def format_three_way_grading_prompt(question_text: str, model_answer: str,
                                      llm_generated_answer: str, guideline: str,
                                      retrieved_chunks: str, student_answer: str,
                                      max_marks: float, domain: str = 'ML') -> str:
        """
        Format the three-way grading prompt with few-shot examples
        """
        few_shot_examples = FewShotExamples.format_grading_examples(domain, count=2)
        
        return RAGPrompts.THREE_WAY_GRADING_PROMPT.format(
            few_shot_examples=few_shot_examples,
            question_text=question_text,
            model_answer=model_answer,
            llm_generated_answer=llm_generated_answer,
            guideline=guideline,
            retrieved_chunks=retrieved_chunks,
            student_answer=student_answer,
            max_marks=max_marks
        )
    
    @staticmethod
    def format_llm_generation_prompt(question_text: str, rag_context: str,
                                   domain: str = 'ML') -> str:
        """
        Format the LLM answer generation prompt with few-shot examples
        """
        generation_examples = FewShotExamples.format_generation_examples(domain, count=2)
        
        return RAGPrompts.LLM_ANSWER_GENERATION_PROMPT.format(
            generation_examples=generation_examples,
            question_text=question_text,
            rag_context=rag_context
        )
    
    @staticmethod
    def detect_domain_from_module(module_code: str) -> str:
        """
        Detect domain from module code for appropriate few-shot examples
        
        Args:
            module_code: Module code like "EE6250", "CS101", "ML5050"
            
        Returns:
            Domain string ('EE', 'CS', 'ML', 'GENERIC')
        """
        if not module_code:
            return 'GENERIC'
        
        module_upper = module_code.upper()
        
        if module_upper.startswith('EE'):
            return 'EE'
        elif module_upper.startswith('CS'):
            return 'CS'
        elif module_upper.startswith('ML') or 'MACHINE' in module_upper or 'AI' in module_upper:
            return 'ML'
        else:
            return 'GENERIC'
    
    @staticmethod
    def parse_json_response(response: str) -> dict:
        """
        Parse JSON response from LLM, with fallback handling
        
        Args:
            response: Raw LLM response
            
        Returns:
            Parsed dictionary with error handling
        """
        import json
        import re
        
        # Clean up response
        if response.startswith("```"):
            response = response.strip("`").replace("json", "").strip()
        
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            # Fallback: try to extract key information manually
            score_match = re.search(r'"score":\s*(\d+\.?\d*)', response)
            reason_match = re.search(r'"reason":\s*"([^"]*)"', response)
            
            fallback_result = {
                'score': float(score_match.group(1)) if score_match else 0.0,
                'reason': reason_match.group(1) if reason_match else "Failed to parse response"
            }
            
            # Try to extract additional fields for three-way grading
            model_coverage_match = re.search(r'"model_coverage":\s*"([^"]*)"', response)
            llm_coverage_match = re.search(r'"llm_coverage":\s*"([^"]*)"', response)
            
            if model_coverage_match:
                fallback_result['model_coverage'] = model_coverage_match.group(1)
            if llm_coverage_match:
                fallback_result['llm_coverage'] = llm_coverage_match.group(1)
            
            return fallback_result
    
    @staticmethod
    def validate_grading_response(response_data: dict, max_marks: float) -> dict:
        """
        Validate and clean grading response data
        
        Args:
            response_data: Parsed response dictionary
            max_marks: Maximum possible marks
            
        Returns:
            Validated and cleaned response
        """
        # Ensure score is within bounds
        score = float(response_data.get('score', 0))
        score = max(0.0, min(score, max_marks))
        response_data['score'] = score
        
        # Ensure required fields exist
        if 'reason' not in response_data:
            response_data['reason'] = "No explanation provided"
        
        # Clean up text fields
        for field in ['reason', 'model_coverage', 'llm_coverage']:
            if field in response_data and isinstance(response_data[field], str):
                response_data[field] = response_data[field].strip()
        
        return response_data
