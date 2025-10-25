import os
import json
import logging
from typing import List
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient

from src.prompts.grading_prompt import GRADING_PROMPT_TEMPLATE
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord, GradingMethod

load_dotenv()
log = logging.getLogger(__name__)


class DirectGrader:
    """
    Grades student answers directly using model answers and marking guidelines,
    without retrieval-augmented generation (RAG).
    """

    def __init__(self, provider: str, chat_model: str, embedder: str = None):
        self.provider = provider
        self.chat_model = chat_model
        self.embedder = embedder

        # Initialize database services
        self.student_service = StudentAnswerServiceWithMedia()
        self.model_service = ModelAnswerDBService()
        self.result_db = GradingResultDB()

        # OpenAI client setup
        self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))

    # ----------------------------------------------------------
    # 🔹 Main grading method
    # ----------------------------------------------------------
    def grade_all_submissions(
        self,
        submission_ids: List[str],
        model_answer_paper_id: str,
        assessment_id: str
    ) -> List[GradingResultRecord]:
        """
        Grade all student answers for multiple submissions using direct model-answer comparison.
        """
        if not submission_ids:
            log.warning("⚠️ No submission IDs provided for grading.")
            return []

        all_answers = self.student_service.get_all_answers_by_submission_ids(submission_ids)

        if not all_answers:
            log.info("📭 No student answers found to grade.")
            return []

        graded_records: List[GradingResultRecord] = []

        for answer in all_answers:
            submission_id = answer.get("submission_id")
            question_number = answer.get("question_number")

            try:
                # ✅ Combine student answer text and media summaries
                student_answer_text = (answer.get("answer_text") or "").strip()
                student_media_summaries = answer.get("media_summaries", [])

                # Ensure all media summaries are strings (not dicts)
                if student_media_summaries and isinstance(student_media_summaries[0], dict):
                    student_media_summaries = [
                        json.dumps(ms, ensure_ascii=False) if isinstance(ms, dict) else str(ms)
                        for ms in student_media_summaries
                    ]

                combined_student_answer = student_answer_text
                if student_media_summaries:
                    combined_student_answer += "\n\n[Media Summaries]\n" + "\n".join(student_media_summaries)

                # ✅ Fetch model answer (with guideline)
                model_answer = self.model_service.get_model_answer(
                    model_answer_paper_id=model_answer_paper_id,
                    assessment_id=assessment_id,
                    question_number=question_number
                )

                if not model_answer:
                    log.warning(f"⚠️ No model answer found for question {question_number}")
                    continue

                model_answer_text = model_answer["model_answer"]["answer_text"]
                model_media_summaries = model_answer["model_answer"].get("media_summaries", [])
                guideline_text = model_answer.get("guideline_text", "")
                question_text = model_answer.get("question_text", "")
                max_marks = model_answer.get("max_marks", 0)

                # Convert model media summaries to strings too
                if model_media_summaries and isinstance(model_media_summaries[0], dict):
                    model_media_summaries = [
                        json.dumps(ms, ensure_ascii=False) if isinstance(ms, dict) else str(ms)
                        for ms in model_media_summaries
                    ]

                combined_model_answer = model_answer_text
                if model_media_summaries:
                    combined_model_answer += "\n\n[Media Summaries]\n" + "\n".join(model_media_summaries)

                # Handle blank student answer
                if not student_answer_text and not student_media_summaries:
                    score = 0.0
                    feedback = "No answer provided."
                else:
                    # ✅ Call LLM for grading
                    score, feedback = self._call_llm_openai(
                        question_text=question_text,
                        model_answer=combined_model_answer,
                        student_answer=combined_student_answer,
                        guideline_text=guideline_text,
                        max_marks=max_marks
                    )

                # ✅ Create and store record
                record = GradingResultRecord(
                    submission_id=submission_id,
                    question_number=question_number,
                    score=float(score),
                    max_marks=float(max_marks),
                    feedback=feedback,
                    grading_method='DIRECT',
                    similarity_score=None,
                    context_used=None
                )

                self.result_db.save_result_record(record)
                graded_records.append(record)

            except Exception as e:
                log.error(
                    f"❌ Error grading submission {submission_id}, question {question_number}: {e}",
                    exc_info=True
                )
                # Avoid crash if rollback() isn't implemented
                if hasattr(self.result_db, "rollback"):
                    self.result_db.rollback()

        # Avoid crash if commit() isn't implemented
        if hasattr(self.result_db, "commit"):
            self.result_db.commit()

        log.info(f"✅ Direct grading complete. Total graded answers: {len(graded_records)}")
        return graded_records

    # ----------------------------------------------------------
    # 🔹 OpenAI LLM grading call
    # ----------------------------------------------------------
    def _call_llm_openai(
        self,
        question_text: str,
        model_answer: str,
        student_answer: str,
        guideline_text: str,
        max_marks: float
    ):
        """
        Use OpenAI model to assign a numeric grade and feedback based on model answer and guidelines.
        """
        try:
            prompt = GRADING_PROMPT_TEMPLATE.format(
                question_text=question_text,
                model_answer=model_answer,
                student_answer=student_answer,
                guideline_text=guideline_text,
                max_marks=max_marks
            )

            response = self.client.chat.completions.create(
                model=self.chat_model,
                temperature=0.2,
                max_tokens=500,
                messages=[
                    {"role": "system", "content": "You are an expert academic examiner."},
                    {"role": "user", "content": prompt}
                ]
            )

            content = response.choices[0].message.content.strip()
            if content.startswith("```"):
                content = content.strip("`").replace("json", "").strip()

            # Parse the JSON output
            try:
                parsed = json.loads(content)
                score = float(parsed.get("score", 0))
                feedback = parsed.get("feedback", "No feedback provided.")
            except json.JSONDecodeError:
                log.warning(f"⚠️ Invalid LLM JSON output:\n{content}")
                score = 0.0
                feedback = "Grading failed due to invalid LLM response."

            return score, feedback

        except Exception as e:
            log.error(f"❌ OpenAI grading failed: {e}", exc_info=True)
            return 0.0, "Grading failed due to API error."
