
import logging
import os
from typing import Optional, Tuple, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import openai
import google.generativeai as genai

from src.utils.prompt_utils import PromptTemplates
from ..config.settings import config
from ..models.question import Question, SubQuestion
from ..models.student_answer import StudentAnswer
from ..models.grading_result import GradingResult, GradingMethod
from ..prompts.grading_prompts import GradingPrompts
from .rag_service import RAGService

logger = logging.getLogger(__name__)

class GradingService:
    def __init__(self, selected_provider: str = "OpenAI", selected_model: str = "gpt-4o", temperature: float = 0.3):
        load_dotenv()
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)

        self.model_suffix = "_openai" if selected_provider == "OpenAI" else "_gemini"
        self.rag_service = RAGService(suffix=self.model_suffix)

        if selected_provider == "OpenAI":
            openai.api_key = os.getenv("OPENAI_API_KEY")
            self.client = openai
        elif selected_provider == "GoogleGemini":
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            self.client = genai.GenerativeModel(
                model_name=self.selected_model,
                generation_config={"temperature": self.temperature}
            )
        else:
            raise ValueError(f"Unsupported provider: {selected_provider}")

        logger.info("Grading service initialized with provider: %s, model: %s", selected_provider, selected_model)

    def grade_answer(self, question: Question, student_answer: StudentAnswer, sub_question: Optional[SubQuestion] = None) -> GradingResult:
        logger.info(f"Grading answer for {student_answer.full_question_id}")
        model_answer = sub_question.model_answer if sub_question else question.model_answer
        max_marks = sub_question.marks if sub_question else question.total_marks

        if student_answer.is_empty():
            return self._create_empty_answer_result(question, student_answer, sub_question, model_answer, max_marks)

        relevance_score = self._check_answer_relevance(question.text, student_answer.answer_text)
        if relevance_score < 4:
            return self._create_irrelevant_answer_result(question, student_answer, sub_question, model_answer, max_marks)

        if self.rag_service.is_available():
            result = self._grade_with_rag(question, student_answer, sub_question, model_answer, max_marks)
            if result:
                return result

        logger.info("Falling back to direct LLM grading")
        return self._grade_with_llm(question, student_answer, sub_question, model_answer, max_marks)

    def _grade_with_rag(self, question, student_answer, sub_question, model_answer, max_marks) -> Optional[GradingResult]:
        try:
            context = self.rag_service.get_relevant_context(question, student_answer)
            if not context:
                return None

            context_relevance = self._evaluate_context_relevance(question.text, student_answer.answer_text, context)
            if context_relevance < config.grading.context_relevance_threshold:
                return None

            score, feedback, confidence = self._perform_rag_grading(
                question.text, model_answer, student_answer.answer_text, context, max_marks
            )

            similarity_score = self._calculate_similarity(model_answer, student_answer.answer_text)
            hallucination_check = self.rag_service.check_hallucination(student_answer.answer_text, context)
            adjusted_score = self._adjust_score_for_hallucination(score, hallucination_check)

            return GradingResult(
                question_id=question.id,
                sub_question_id=sub_question.id if sub_question else None,
                student_answer=student_answer.answer_text,
                model_answer=model_answer,
                score=round(adjusted_score, 2),
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

    # Fallback and helper methods stay unchanged...

    def _create_error_fallback_result(self, question, student_answer, sub_question, model_answer, max_marks, error_message) -> GradingResult:
        similarity_score = self._calculate_similarity(model_answer, student_answer.answer_text)
        estimated_score = similarity_score * max_marks

        return GradingResult(
            question_id=question.id,
            sub_question_id=sub_question.id if sub_question else None,
            student_answer=student_answer.answer_text,
            model_answer=model_answer,
            score=round(estimated_score, 2),
            max_marks=max_marks,
            feedback=f"Approximate grade. Similarity-based.",
            similarity_score=similarity_score,
            grading_method=GradingMethod.SIMILARITY_BASED,
            confidence_score=3.0,
            error_details=error_message
        )
