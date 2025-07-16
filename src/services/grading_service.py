# # src/services/grading_service.py
# """Core grading service that orchestrates the entire grading process."""
# import logging
# from typing import Optional, List, Tuple
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
# import numpy as np

# from ..config.settings import config
# from ..models.question import Question, SubQuestion
# from ..models.student_answer import StudentAnswer
# from ..models.grading_result import GradingResult, GradingMethod
# from ..prompts.grading_prompts import GradingPrompts, PromptTemplates
# from .rag_service import RAGService

# logger = logging.getLogger(__name__)

# class GradingService:
#     """Main service for grading student answers."""
    
#     def __init__(self):
#         """Initialize grading service with dependencies."""
#         self.rag_service = RAGService()
#         self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
#         logger.info("Grading service initialized")
    
#     def grade_answer(self, question: Question, student_answer: StudentAnswer, 
#                     sub_question: Optional[SubQuestion] = None) -> GradingResult:
        # """
        # Grade a single student answer.
        
        # Args:
        #     question: The question being answered
        #     student_answer: The student's answer
        #     sub_question: Optional sub-question if applicable
            
        # Returns:
        #     GradingResult with score, feedback, and metadata
        # """
        # logger.info(f"Grading answer for {student_answer.full_question_id}")
import logging
from typing import Optional, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
from dotenv import load_dotenv
import openai
import google.generativeai as genai

from ..config.settings import config
from ..models.question import Question, SubQuestion
from ..models.student_answer import StudentAnswer
from ..models.grading_result import GradingResult, GradingMethod
from ..prompts.grading_prompts import GradingPrompts, PromptTemplates
from .rag_service import RAGService

logger = logging.getLogger(__name__)

class GradingService:
    """Main service for grading student answers."""

    def __init__(self, selected_provider: str = "OpenAI", selected_model: str = "gpt-4o", temperature: float = 0.3):
        """Initialize grading service with dependencies and model selection."""
        load_dotenv()
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.rag_service = RAGService()

        if selected_provider == "OpenAI":
            self.api_key = os.getenv("OPENAI_API_KEY")
            openai.api_key = self.api_key
            self.client = openai
        elif selected_provider == "GoogleGemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(
                model_name=self.selected_model,
                generation_config={"temperature": self.temperature}
            )
        else:
            raise ValueError(f"Unsupported provider: {selected_provider}")

        logger.info("Grading service initialized with provider: %s, model: %s", selected_provider, selected_model)

    def grade_answer(self, question: Question, student_answer: StudentAnswer, 
                     sub_question: Optional[SubQuestion] = None) -> GradingResult:
        """
        Grade a single student answer.

        Args:
            question: The question being answered
            student_answer: The student's answer
            sub_question: Optional sub-question if applicable

        Returns:
            GradingResult with score, feedback, and metadata
        """
        logger.info(f"Grading answer for {student_answer.full_question_id}")        
        # Determine which answer to compare against
        model_answer = sub_question.model_answer if sub_question else question.model_answer
        max_marks = sub_question.marks if sub_question else question.total_marks
        
        # Check if answer is empty
        if student_answer.is_empty():
            return self._create_empty_answer_result(
                question, student_answer, sub_question, model_answer, max_marks
            )
        
        # Check answer relevance first
        relevance_score = self._check_answer_relevance(question.text, student_answer.answer_text)
        if relevance_score < 4:  
            return self._create_irrelevant_answer_result(
                question, student_answer, sub_question, model_answer, max_marks
            )
        
        # Try RAG-assisted grading first
        if self.rag_service.is_available():
            result = self._grade_with_rag(question, student_answer, sub_question, model_answer, max_marks)
            if result:
                return result
        
        # Fallback to direct LLM grading
        logger.info("Falling back to direct LLM grading")
        return self._grade_with_llm(question, student_answer, sub_question, model_answer, max_marks)
    
    def _grade_with_rag(self, question: Question, student_answer: StudentAnswer, 
                       sub_question: Optional[SubQuestion], model_answer: str, 
                       max_marks: int) -> Optional[GradingResult]:
        """Grade using RAG-assisted approach."""
        try:
            # Get relevant context
            context = self.rag_service.get_relevant_context(question, student_answer)
            if not context:
                logger.info("No relevant context found, skipping RAG grading")
                return None
            
            # Check context relevance
            context_relevance = self._evaluate_context_relevance(
                question.text, student_answer.answer_text, context
            )
            
            if context_relevance < config.grading.context_relevance_threshold:
                logger.info("Context not sufficiently relevant for grading")
                return None
            
            # Perform RAG-assisted grading
            score, feedback, confidence = self._perform_rag_grading(
                question.text, model_answer, student_answer.answer_text, context, max_marks
            )
            
            # Calculate similarity score
            similarity_score = self._calculate_similarity(model_answer, student_answer.answer_text)
            
            # Check for hallucinations
            hallucination_check = self.rag_service.check_hallucination(
                student_answer.answer_text, context
            )
            
            # Adjust score based on hallucination check
            adjusted_score = self._adjust_score_for_hallucination(score, hallucination_check)
            
            return GradingResult(
                question_id=question.id,
                sub_question_id=sub_question.id if sub_question else None,
                student_answer=student_answer.answer_text,
                model_answer=model_answer,
                score=adjusted_score,
                max_marks=max_marks,
                feedback=feedback,
                similarity_score=similarity_score,
                grading_method=GradingMethod.RAG_ASSISTED,
                confidence_score=confidence,
                context_used=context[:500] + "..." if len(context) > 500 else context
            )
            
        except Exception as e:
            logger.error(f"Error in RAG grading: {e}")
            return None
    
    def _grade_with_llm(self, question: Question, student_answer: StudentAnswer, 
                       sub_question: Optional[SubQuestion], model_answer: str, 
                       max_marks: int) -> GradingResult:
        """Grade using direct LLM approach without RAG."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            prompt = GradingPrompts.DIRECT_LLM_GRADING.format(
                question_text=question.text,
                model_answer=model_answer,
                student_answer=student_answer.answer_text,
                max_marks=max_marks
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature,
                max_tokens=1000
            )
            
            # Extract score and feedback
            score, feedback = PromptTemplates.extract_score_from_response(
                response.choices[0].message.content
            )
            confidence = PromptTemplates.extract_confidence_from_response(
                response.choices[0].message.content
            )
            
            # Calculate similarity score
            similarity_score = self._calculate_similarity(model_answer, student_answer.answer_text)
            
            return GradingResult(
                question_id=question.id,
                sub_question_id=sub_question.id if sub_question else None,
                student_answer=student_answer.answer_text,
                model_answer=model_answer,
                score=min(score, max_marks),  # Ensure score doesn't exceed max
                max_marks=max_marks,
                feedback=feedback,
                similarity_score=similarity_score,
                grading_method=GradingMethod.DIRECT_LLM,
                confidence_score=confidence
            )
            
        except Exception as e:
            logger.error(f"Error in direct LLM grading: {e}")
            return self._create_error_fallback_result(
                question, student_answer, sub_question, model_answer, max_marks, str(e)
            )
    
    def _perform_rag_grading(self, question_text: str, model_answer: str, 
                           student_answer: str, context: str, max_marks: int) -> Tuple[float, str, float]:
        """Perform the actual RAG-assisted grading."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        prompt = GradingPrompts.RAG_ASSISTED_GRADING.format(
            question_text=question_text,
            model_answer=model_answer,
            student_answer=student_answer,
            context=context,
            max_marks=max_marks
        )
        
        response = client.chat.completions.create(
            model=config.openai.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=config.openai.temperature,
            max_tokens=1200
        )
        
        # Extract score, feedback, and confidence
        score, feedback = PromptTemplates.extract_score_from_response(
            response.choices[0].message.content
        )
        confidence = PromptTemplates.extract_confidence_from_response(
            response.choices[0].message.content
        )
        
        return min(score, max_marks), feedback, confidence
    
    def _calculate_similarity(self, model_answer: str, student_answer: str) -> float:
        """Calculate semantic similarity between model and student answers."""
        try:
            # Use TF-IDF vectorization for similarity
            documents = [model_answer.lower(), student_answer.lower()]
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            return float(similarity_matrix[0][0])
        except Exception as e:
            logger.warning(f"Error calculating similarity: {e}")
            return 0.0
    
    def _check_answer_relevance(self, question_text: str, student_answer: str) -> float:
        """Check if student answer is relevant to the question."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            prompt = GradingPrompts.ANSWER_RELEVANCE_CHECK.format(
                question_text=question_text,
                student_answer=student_answer
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature,
                max_tokens=300
            )
            
            # Extract relevance score
            import re
            score_match = re.search(r'RELEVANCE_SCORE:\s*(\d+\.?\d*)', 
                                  response.choices[0].message.content, re.IGNORECASE)
            return float(score_match.group(1)) if score_match else 5.0
            
        except Exception as e:
            logger.warning(f"Error checking answer relevance: {e}")
            return 5.0  # Neutral score on error
    
    def _evaluate_context_relevance(self, question_text: str, student_answer: str, context: str) -> float:
        """Evaluate how relevant the retrieved context is for grading."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            prompt = GradingPrompts.CONTEXT_RELEVANCE_EVALUATION.format(
                question_text=question_text,
                student_answer=student_answer,
                context=context
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature,
                max_tokens=300
            )
            
            # Extract relevance rating
            import re
            rating_match = re.search(r'RELEVANCE_RATING:\s*(\d+\.?\d*)', 
                                   response.choices[0].message.content, re.IGNORECASE)
            rating = float(rating_match.group(1)) if rating_match else 5.0
            return rating / 10.0  # Convert to 0-1 scale
            
        except Exception as e:
            logger.warning(f"Error evaluating context relevance: {e}")
            return 0.5  # Neutral score on error
    
    def _adjust_score_for_hallucination(self, original_score: float, hallucination_check: dict) -> float:
        """Adjust score based on hallucination detection results."""
        assessment = hallucination_check.get('assessment', 'UNKNOWN')
        
        if assessment == 'CONTRADICTED':
            # Significant penalty for contradicting course materials
            penalty = original_score * 0.3  # 30% penalty
            adjusted_score = max(0, original_score - penalty)
            logger.info(f"Applied hallucination penalty: -{penalty:.2f}")
            return adjusted_score
        elif assessment == 'UNSUPPORTED':
            # Moderate penalty for unsupported claims
            penalty = original_score * 0.15  # 15% penalty
            adjusted_score = max(0, original_score - penalty)
            logger.info(f"Applied unsupported content penalty: -{penalty:.2f}")
            return adjusted_score
        else:
            # No penalty for supported content
            return original_score
    
    def _create_empty_answer_result(self, question: Question, student_answer: StudentAnswer, 
                                  sub_question: Optional[SubQuestion], model_answer: str, 
                                  max_marks: int) -> GradingResult:
        """Create result for empty answers."""
        return GradingResult(
            question_id=question.id,
            sub_question_id=sub_question.id if sub_question else None,
            student_answer=student_answer.answer_text,
            model_answer=model_answer,
            score=0.0,
            max_marks=max_marks,
            feedback="No answer provided. Please ensure you attempt all questions.",
            similarity_score=0.0,
            grading_method=GradingMethod.ERROR_FALLBACK,
            confidence_score=10.0  # High confidence in zero score for empty answer
        )
    
    def _create_irrelevant_answer_result(self, question: Question, student_answer: StudentAnswer, 
                                       sub_question: Optional[SubQuestion], model_answer: str, 
                                       max_marks: int) -> GradingResult:
        """Create result for irrelevant answers."""
        return GradingResult(
            question_id=question.id,
            sub_question_id=sub_question.id if sub_question else None,
            student_answer=student_answer.answer_text,
            model_answer=model_answer,
            score=0.0,
            max_marks=max_marks,
            feedback="Answer does not address the question asked. Please read the question carefully and provide a relevant response.",
            similarity_score=0.0,
            grading_method=GradingMethod.ERROR_FALLBACK,
            confidence_score=8.0
        )
    
    def _create_error_fallback_result(self, question: Question, student_answer: StudentAnswer, 
                                    sub_question: Optional[SubQuestion], model_answer: str, 
                                    max_marks: int, error_message: str) -> GradingResult:
        """Create result when grading fails."""
        # Use similarity-based scoring as fallback
        similarity_score = self._calculate_similarity(model_answer, student_answer.answer_text)
        estimated_score = similarity_score * max_marks
        
        return GradingResult(
            question_id=question.id,
            sub_question_id=sub_question.id if sub_question else None,
            student_answer=student_answer.answer_text,
            model_answer=model_answer,
            score=estimated_score,
            max_marks=max_marks,
            feedback=f"Answer graded using similarity analysis due to technical issues. Score is approximate. Similarity to model answer: {similarity_score:.2f}",
            similarity_score=similarity_score,
            grading_method=GradingMethod.SIMILARITY_BASED,
            confidence_score=3.0,  # Low confidence for fallback method
            error_details=error_message
        )
    
    def batch_grade_answers(self, questions: List[Question], 
                          student_answers: List[StudentAnswer]) -> List[GradingResult]:
        """Grade multiple answers in batch."""
        results = []
        
        for student_answer in student_answers:
            # Find corresponding question
            question = None
            sub_question = None
            
            for q in questions:
                if q.id == student_answer.question_id:
                    question = q
                    if student_answer.sub_question_id:
                        sub_question = q.get_sub_question(student_answer.sub_question_id)
                    break
            
            if not question:
                logger.error(f"Question {student_answer.question_id} not found")
                continue
            
            # Grade the answer
            result = self.grade_answer(question, student_answer, sub_question)
            results.append(result)
            
            logger.info(f"Graded {student_answer.full_question_id}: {result.score}/{result.max_marks}")
        
        return results
    
    def generate_detailed_feedback(self, result: GradingResult) -> str:
        """Generate detailed feedback for a grading result."""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.openai.api_key)
        
        try:
            prompt = GradingPrompts.FEEDBACK_GENERATION.format(
                question_text=f"Question {result.question_id}",
                student_answer=result.student_answer,
                score=result.score,
                max_marks=result.max_marks
            )
            
            response = client.chat.completions.create(
                model=config.openai.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.openai.temperature + 0.1,  # Slightly higher temperature for creativity
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating detailed feedback: {e}")
            return result.feedback  # Return original feedback as fallback