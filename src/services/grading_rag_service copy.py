import os
import json
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient

from src.prompts.grading_prompt import GRADING_PROMPT_TEMPLATE
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord, GradingMethod

load_dotenv()
log = logging.getLogger(__name__)


class RAGGrader:
    def __init__(self, provider: str, chat_model: str, embedder: str):
        """
        RAG-based grader that compares student answers with model answers using an LLM.
        """
        self.provider = provider
        self.chat_model = chat_model
        self.embedder = embedder

        # Initialize DB services
        self.student_service = StudentAnswerServiceWithMedia(provider_suffix=provider)
        self.model_service = ModelAnswerDBService()
        self.result_db = GradingResultDB()

        # Initialize OpenAI client
        self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))

    # ----------------------------------------------------------
    # 🔹 Main method: Grade all student submissions
    # ----------------------------------------------------------
    def grade_all_submissions(
        self,
        submission_ids: List[str],
        model_answer_paper_id: str,
        assessment_id: str
    ) -> List[GradingResultRecord]:
        """
        Grade all student answers for multiple submissions using RAG-based grading.
        """
        if not submission_ids:
            log.warning("⚠️ No submission IDs provided to grade.")
            return []

        all_answers = self.student_service.get_all_answers_by_submission_ids(submission_ids)
        if not all_answers:
            log.info("📭 No student answers found to grade.")
            return []

        graded_records: List[GradingResultRecord] = []

        for answer in all_answers:
            try:
                submission_id = answer["submission_id"]
                question_number = answer["question_number"]

                # ✅ Combine student text + media summaries
                student_answer_text = (answer.get("answer_text") or "").strip()
                student_media_summaries = answer.get("media_summaries", [])
                combined_student_answer = student_answer_text
                if student_media_summaries:
                    combined_student_answer += "\n\n[Media Summaries]\n" + "\n".join(student_media_summaries)

                # Fetch model answer for this question
                model_answer = self.model_service.get_model_answer(
                    model_answer_paper_id=model_answer_paper_id,
                    assessment_id=assessment_id,
                    question_number=question_number
                )

                if not model_answer:
                    log.warning(
                        f"⚠️ No model answer found for "
                        f"assessment_id={assessment_id}, question_number={question_number}"
                    )
                    continue

                # ✅ Combine model answer text + media summaries
                model_answer_text = model_answer["model_answer"]["answer_text"]
                model_media_summaries = model_answer["model_answer"].get("media_summaries", [])
                combined_model_answer = model_answer_text
                if model_media_summaries:
                    combined_model_answer += "\n\n[Media Summaries]\n" + "\n".join(model_media_summaries)

                # Retrieve question text and context
                question_text = model_answer["question_text"]
                retrieved_context = self._retrieve(question_text, model_answer_paper_id)

                # Handle missing student answer
                if not student_answer_text and not student_media_summaries:
                    score = 0.0
                    feedback = "No answer provided."
                    similarity = 0.0
                else:
                    # (Optional) placeholder similarity computation
                    similarity = 1.0

                    # ✅ Call OpenAI for grading
                    score, feedback = self._call_llm_openai(
                        question_text=question_text,
                        model_answer=combined_model_answer,
                        student_answer=combined_student_answer,
                        context=retrieved_context,
                        max_marks=model_answer.get("max_marks", 0)
                    )

                # Build and save grading record
                record = GradingResultRecord(
                    submission_id=submission_id,
                    question_number=question_number,
                    score=float(score),
                    max_marks=float(model_answer.get("max_marks", 0.0)),
                    feedback=feedback,
                    grading_method=GradingMethod.RAG,
                    similarity_score=float(similarity),
                    context_used=retrieved_context
                )

                self.result_db.save_result_record(record)
                graded_records.append(record)

            except Exception as e:
                log.error(
                    f"❌ Error grading submission_id={answer['submission_id']}, "
                    f"question={answer['question_number']}: {e}",
                    exc_info=True
                )
                self.result_db.rollback()

        # Commit all graded results
        self.result_db.commit()
        log.info(f"✅ Grading complete. Total graded answers: {len(graded_records)}")

        return graded_records

    # ----------------------------------------------------------
    # 🔹 OpenAI LLM call
    # ----------------------------------------------------------
    def _call_llm_openai(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        context: str,
        max_marks: float
    ):
        """
        Calls OpenAI to grade a student's answer against the model answer using structured JSON output.
        """
        try:
            prompt = GRADING_PROMPT_TEMPLATE.format(
                question_text=question_text,
                model_answer=model_answer,
                student_answer=student_answer,
                context=context,
                max_marks=max_marks
            )

            response = self.client.chat.completions.create(
                model=self.chat_model,
                temperature=0.2,
                max_tokens=500,
                messages=[
                    {"role": "system", "content": "You are a strict and objective academic grader."},
                    {"role": "user", "content": prompt}
                ]
            )

            content = response.choices[0].message.content.strip()

            # Clean Markdown code blocks
            if content.startswith("```"):
                content = content.strip("`").replace("json", "").strip()

            # Parse JSON output
            try:
                parsed = json.loads(content)
                score = float(parsed.get("score", 0))
                feedback = parsed.get("feedback", "No feedback provided.")
            except json.JSONDecodeError:
                log.warning(f"⚠️ Invalid LLM output:\n{content}")
                score = 0.0
                feedback = "Grading failed due to invalid JSON output."

            return score, feedback

        except Exception as e:
            log.error(f"❌ OpenAI grading failed: {e}", exc_info=True)
            return 0.0, "Grading failed due to API error."

    # ----------------------------------------------------------
    # 🔹 Context retrieval (placeholder)
    # ----------------------------------------------------------
    def _retrieve(self, question_text: str, model_answer_paper_id: str):
        """Retrieve context for a question (placeholder for RAG retrieval)."""
        return f"Retrieved context for paper {model_answer_paper_id} and question: {question_text}"
