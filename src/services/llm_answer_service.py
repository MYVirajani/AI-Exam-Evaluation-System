# src/services/llm_answer_service.py

import json
import logging
from typing import Dict, Any, Tuple
from langchain.prompts import PromptTemplate
from src.prompts.llm_answer_generation_prompts import LLMAnswerGenerationPrompts

log = logging.getLogger(__name__)

class LLMAnswerService:
    """
    Service class to handle LLM answer generation and three-way grading
    """
    
    def __init__(self, chat_model, vector_store, top_k: int = 6):
        """
        Initialize the LLM Answer Service
        
        Args:
            chat_model: Langchain chat model (OpenAI or Google)
            vector_store: PGVector store for RAG retrieval
            top_k: Number of chunks to retrieve for context
        """
        self.chat = chat_model
        self.vector_store = vector_store
        self.top_k = top_k
    
    def generate_llm_answer(self, question_text: str, module_code: str) -> str:
        """
        Generate LLM answer using few-shot prompting and RAG context
        
        Args:
            question_text: The exam question
            module_code: Module code for filtering RAG context
            
        Returns:
            Generated comprehensive answer
        """
        try:
            # Step 1: Retrieve RAG context
            rag_context = self._retrieve_rag_context(question_text, module_code)
            
            # Step 2: Format few-shot examples
            few_shot_examples = LLMAnswerGenerationPrompts.format_few_shot_examples(examples_count=3)
            
            # Step 3: Create generation prompt
            generation_prompt = LLMAnswerGenerationPrompts.ANSWER_GENERATION_PROMPT.format(
                few_shot_examples=few_shot_examples,
                question_text=question_text,
                rag_context=rag_context
            )
            
            # Step 4: Generate answer
            response = self.chat.invoke(generation_prompt).content
            
            log.info(f"✅ Generated LLM answer for question: {question_text[:50]}...")
            return response.strip()
            
        except Exception as e:
            log.error(f"❌ Error generating LLM answer: {e}")
            return f"Error generating comprehensive answer: {str(e)}"
    
    def grade_with_three_way_comparison(self, question_text: str, model_answer: str, 
                                      student_answer: str, max_marks: float, 
                                      guideline: str, module_code: str) -> Dict[str, Any]:
        """
        Grade student answer using three-way comparison (Model + LLM + Context)
        
        Args:
            question_text: The exam question
            model_answer: Lecturer's model answer
            student_answer: Student's answer to grade
            max_marks: Maximum possible marks
            guideline: Marking guideline
            module_code: Module code for RAG context
            
        Returns:
            Dictionary with score, reason, and detailed analysis
        """
        try:
            # Step 1: Generate LLM answer
            llm_generated_answer = self.generate_llm_answer(question_text, module_code)
            
            # Step 2: Get RAG context
            rag_context = self._retrieve_rag_context(question_text, module_code)
            
            # Step 3: Perform three-way grading
            grading_result = self._perform_three_way_grading(
                question_text=question_text,
                model_answer=model_answer,
                llm_generated_answer=llm_generated_answer,
                student_answer=student_answer,
                max_marks=max_marks,
                rag_context=rag_context
            )
            
            # Step 4: Add additional metadata
            grading_result['llm_generated_answer'] = llm_generated_answer
            grading_result['rag_context_used'] = rag_context[:200] + "..." if len(rag_context) > 200 else rag_context
            grading_result['grading_method'] = 'three_way_comparison'
            
            return grading_result
            
        except Exception as e:
            log.error(f"❌ Error in three-way grading: {e}")
            return {
                'score': 0.0,
                'reason': f"Grading error: {str(e)}",
                'model_coverage': "Error occurred",
                'llm_coverage': "Error occurred",
                'llm_generated_answer': "",
                'grading_method': 'error'
            }
    
    def _retrieve_rag_context(self, question_text: str, module_code: str) -> str:
        """
        Retrieve relevant context from vector store
        """
        try:
            docs = self.vector_store.similarity_search(
                question_text, 
                k=self.top_k, 
                filter={"module_code": module_code}
            )
            return "\n---\n".join(d.page_content for d in docs)
        except Exception as e:
            log.warning(f"⚠️ RAG retrieval failed: {e}")
            return "No additional context available."
    
    def _perform_three_way_grading(self, question_text: str, model_answer: str,
                                 llm_generated_answer: str, student_answer: str,
                                 max_marks: float, rag_context: str) -> Dict[str, Any]:
        """
        Perform the actual three-way comparison grading
        """
        # Create grading prompt
        grading_prompt = LLMAnswerGenerationPrompts.THREE_WAY_GRADING_PROMPT.format(
            question_text=question_text,
            model_answer=model_answer,
            llm_generated_answer=llm_generated_answer,
            student_answer=student_answer,
            max_marks=max_marks,
            rag_context=rag_context
        )
        
        # Get grading response
        response = self.chat.invoke(grading_prompt).content
        
        # Clean up response if needed
        if response.startswith("```"):
            response = response.strip("`").replace("json", "").strip()
        
        # Parse JSON response
        return self._parse_grading_response(response, max_marks)
    
    def _parse_grading_response(self, response: str, max_marks: float) -> Dict[str, Any]:
        """
        Parse the JSON grading response from LLM
        """
        try:
            data = json.loads(response)
            
            # Ensure score is within bounds
            score = float(data.get("score", 0))
            score = max(0.0, min(score, max_marks))
            
            return {
                'score': score,
                'reason': data.get("reason", "No reason provided"),
                'model_coverage': data.get("model_coverage", "Not analyzed"),
                'llm_coverage': data.get("llm_coverage", "Not analyzed")
            }
            
        except (json.JSONDecodeError, ValueError) as e:
            log.error(f"❌ JSON parse error in grading response: {e}")
            log.error(f"Raw response: {response}")
            
            # Fallback parsing - try to extract score manually
            import re
            score_match = re.search(r'"score":\s*(\d+\.?\d*)', response)
            score = float(score_match.group(1)) if score_match else 0.0
            score = max(0.0, min(score, max_marks))
            
            return {
                'score': score,
                'reason': "JSON parsing failed - manual extraction used",
                'model_coverage': "Parse error occurred",
                'llm_coverage': "Parse error occurred"
            }
    
    def get_generation_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about LLM answer generation performance
        """
        return {
            'service_status': 'active',
            'top_k_retrieval': self.top_k,
            'few_shot_examples_count': len(LLMAnswerGenerationPrompts.ANSWER_GENERATION_EXAMPLES),
            'grading_method': 'three_way_comparison'
        }