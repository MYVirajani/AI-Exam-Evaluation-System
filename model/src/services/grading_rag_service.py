# src/services/grading_rag_service.py

from langchain_community.vectorstores.pgvector import PGVector
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
from models.student_answer import StudentAnswer
from models.model_answer import ModelAnswer
from models.question import Question
from prompts.grading_prompts import GradingPrompts
from prompts.rag_prompts import RAGPrompts, RAGUtilities
from config.settings import config
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class GradingRAGService:
    def __init__(self, provider: str):
        self.provider = provider
        self.embedding_function = OpenAIEmbeddings(
            api_key=config.openai.api_key,
            model=config.openai.embedding_model
        )

        self.vector_db = PGVector(
            collection_name=config.database.lecture_collection,
            connection_string=config.database.connection_string,
            embedding_function=self.embedding_function
        )

        self.client = OpenAI(api_key=config.openai.api_key)

    def retrieve_context(self, question: Question, student_answer: StudentAnswer) -> str:
        search_query = RAGUtilities.create_query(question.text, student_answer.answer_text)
        documents = self.vector_db.similarity_search(search_query, k=3)
        return RAGUtilities.format_context_chunks([doc.page_content for doc in documents])

    def grade_answer(self, question: Question, model_answer: ModelAnswer, student_answer: StudentAnswer) -> dict:
        context = self.retrieve_context(question, student_answer)

        prompt = GradingPrompts.RAG_ASSISTED_GRADING.format(
            question_text=question.text,
            model_answer=model_answer.answer_text,
            student_answer=student_answer.answer_text,
            context=context,
            max_marks=2
        )

        response = self.client.chat.completions.create(
            model=config.openai.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800
        )

        output = response.choices[0].message.content
        score, feedback = GradingPrompts.extract_score_from_response(output)
        confidence = GradingPrompts.extract_confidence_from_response(output)

        return {
            "score": score,
            "feedback": feedback,
            "confidence": confidence,
            "raw": output
        }
