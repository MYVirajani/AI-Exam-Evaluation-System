# prompts/rag_prompts.py
"""
RAG system prompts for document retrieval and context evaluation.
"""

class RAGPrompts:
    """Collection of prompts for RAG (Retrieval-Augmented Generation) operations."""
    
    CONTEXT_SEARCH_QUERY = """
Generate an effective search query to find relevant course material for grading this student answer.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**TASK:**
Create a search query that will help find relevant lecture notes, textbook content, or course materials 
that can be used to verify the accuracy of the student's answer.

**GUIDELINES:**
- Include key concepts from both question and answer
- Use academic terminology
- Keep query concise but comprehensive
- Focus on factual content that can be verified

**OUTPUT:**
{search_query}
"""

    DOCUMENT_RELEVANCE_SCORING = """
Evaluate how relevant this document excerpt is for grading the given student answer.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**DOCUMENT EXCERPT:**
{document_content}

**EVALUATION CRITERIA:**
1. **Content Overlap:** Does the document contain information directly related to the question/answer?
2. **Verification Value:** Can this document help verify facts in the student answer?
3. **Grading Utility:** Will this information help in assigning an accurate grade?

**RATING SCALE:**
- 9-10: Highly relevant, essential for grading
- 7-8: Very relevant, helpful for grading
- 5-6: Moderately relevant, somewhat useful
- 3-4: Low relevance, limited utility
- 1-2: Not relevant for grading

**OUTPUT FORMAT:**
RELEVANCE_SCORE: [1-10]
REASONING: [explanation of relevance]
KEY_CONCEPTS: [list main concepts that overlap]
GRADING_VALUE: [how this helps with grading]
"""

    CONTEXT_SYNTHESIS = """
Synthesize the most relevant information from multiple course material excerpts for grading purposes.

**QUESTION:**
{question_text}

**STUDENT ANSWER:**
{student_answer}

**COURSE MATERIAL EXCERPTS:**
{context_chunks}

**TASK:**
Create a coherent synthesis of the most relevant information that can be used to:
1. Verify factual accuracy of the student answer
2. Identify missing key concepts
3. Assess depth of understanding

**GUIDELINES:**
- Focus on information directly relevant to the question
- Eliminate redundant or irrelevant details
- Organize information logically
- Highlight key facts for verification

**OUTPUT:**
**RELEVANT FACTS FOR VERIFICATION:**
- [Key fact 1]
- [Key fact 2]
- [etc.]

**KEY CONCEPTS STUDENT SHOULD ADDRESS:**
- [Concept 1]
- [Concept 2]
- [etc.]

**ADDITIONAL CONTEXT:**
[Any other relevant information for grading]
"""

    HALLUCINATION_CHECK = """
Verify if the student's answer contains any information that contradicts or goes beyond the provided course materials.

**COURSE MATERIALS:**
{context}

**STUDENT ANSWER:**
{student_answer}

**VERIFICATION TASK:**
1. **Fact Checking:** Are all facts in the student answer supported by course materials?
2. **Scope Check:** Does the student introduce information not covered in materials?
3. **Accuracy Check:** Are there any contradictions with course content?

**CLASSIFICATION:**
- SUPPORTED: Information is backed by course materials
- UNSUPPORTED: Information not found in course materials
- CONTRADICTED: Information contradicts course materials

**OUTPUT FORMAT:**
OVERALL_ASSESSMENT: [SUPPORTED/PARTIALLY_SUPPORTED/UNSUPPORTED/CONTRADICTED]

SUPPORTED_POINTS:
- [Point 1]
- [Point 2]

UNSUPPORTED_POINTS:
- [Point 1 with explanation]
- [Point 2 with explanation]

CONTRADICTED_POINTS:
- [Point 1 with explanation]
- [Point 2 with explanation]

GRADING_RECOMMENDATION: [How these findings should affect the grade]
"""

    KNOWLEDGE_GAP_IDENTIFICATION = """
Identify what key information the student missed based on the model answer and course materials.

**MODEL ANSWER:**
{model_answer}

**STUDENT ANSWER:**
{student_answer}

**COURSE MATERIALS:**
{context}

**ANALYSIS TASK:**
Compare the student answer against both the model answer and course materials to identify:
1. Key concepts that were missed
2. Important details that were omitted
3. Depth of understanding gaps

**OUTPUT FORMAT:**
MISSING_KEY_CONCEPTS:
- [Concept 1: Brief explanation of importance]
- [Concept 2: Brief explanation of importance]

MISSING_DETAILS:
- [Detail 1]
- [Detail 2]

UNDERSTANDING_GAPS:
- [Gap 1: What this suggests about student understanding]
- [Gap 2: What this suggests about student understanding]

IMPACT_ON_GRADE: [How these gaps should affect the overall score]
"""

class RAGUtilities:
    """Utility functions for RAG prompt processing."""
    
    @staticmethod
    def format_context_chunks(chunks: list, max_length: int = 2000) -> str:
        """Format multiple context chunks into a single string."""
        formatted_chunks = []
        current_length = 0
        
        for i, chunk in enumerate(chunks, 1):
            chunk_text = f"**Source {i}:**\n{chunk}\n"
            if current_length + len(chunk_text) <= max_length:
                formatted_chunks.append(chunk_text)
                current_length += len(chunk_text)
            else:
                break
        
        return "\n".join(formatted_chunks)
    
    @staticmethod
    def extract_relevance_score(response: str) -> float:
        """Extract relevance score from LLM response."""
        import re
        
        score_match = re.search(r'RELEVANCE_SCORE:\s*(\d+\.?\d*)', response, re.IGNORECASE)
        return float(score_match.group(1)) if score_match else 5.0
    
    @staticmethod
    def parse_hallucination_check(response: str) -> dict:
        """Parse hallucination check response into structured data."""
        import re
        
        # Extract overall assessment
        assessment_match = re.search(r'OVERALL_ASSESSMENT:\s*(\w+)', response, re.IGNORECASE)
        assessment = assessment_match.group(1) if assessment_match else "UNKNOWN"
        
        # Extract supported points
        supported_section = re.search(r'SUPPORTED_POINTS:(.*?)(?=UNSUPPORTED_POINTS:|CONTRADICTED_POINTS:|$)', 
                                    response, re.IGNORECASE | re.DOTALL)
        supported_points = []
        if supported_section:
            points = re.findall(r'-\s*(.*)', supported_section.group(1))
            supported_points = [point.strip() for point in points]
        
        # Extract unsupported points
        unsupported_section = re.search(r'UNSUPPORTED_POINTS:(.*?)(?=CONTRADICTED_POINTS:|GRADING_RECOMMENDATION:|$)', 
                                      response, re.IGNORECASE | re.DOTALL)
        unsupported_points = []
        if unsupported_section:
            points = re.findall(r'-\s*(.*)', unsupported_section.group(1))
            unsupported_points = [point.strip() for point in points]
        
        return {
            'assessment': assessment,
            'supported_points': supported_points,
            'unsupported_points': unsupported_points,
            'raw_response': response
        }