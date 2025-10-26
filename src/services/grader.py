import os
import json
import base64
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient

from src.prompts.grading_prompt import GRADING_PROMPT_TEMPLATE
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord

load_dotenv()
log = logging.getLogger(__name__)


class DirectGrader:
    """
    Grades student answers using two modes:
    1. mode='image' → Send student answer text + image(s) to the LLM.
    2. mode='summary' → Send student answer text combined with media summary only (no images).
    """

    def __init__(self, provider: str, chat_model: str, embedder: str = None, mode: str = "image"):
        """
        :param provider: LLM provider name (e.g., 'OpenAI')
        :param chat_model: Model name (e.g., 'gpt-4o-mini')
        :param embedder: Optional embedder reference
        :param mode: 'image' or 'summary' (default 'image')
        """
        if mode not in ["image", "summary"]:
            raise ValueError("❌ Invalid mode. Must be 'image' or 'summary'.")

        self.provider = provider
        self.chat_model = chat_model
        self.embedder = embedder
        self.mode = mode

        self.student_service = StudentAnswerServiceWithMedia()
        self.model_service = ModelAnswerDBService()
        self.result_db = GradingResultDB()
        self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))

        log.info(f"📘 DirectGrader initialized in '{self.mode}' mode.")

    # ----------------------------------------------------------
    # 🔹 Main grading loop
    # ----------------------------------------------------------
    def grade_all_submissions(
        self,
        submission_ids: List[str],
        model_answer_paper_id: str,
        assessment_id: str
    ) -> List[GradingResultRecord]:

        if not submission_ids:
            log.warning("⚠️ No submission IDs provided.")
            return []

        all_answers = self.student_service.get_all_answers_by_submission_ids(submission_ids)
        if not all_answers:
            log.info("📭 No student answers found.")
            return []

        graded_records: List[GradingResultRecord] = []

        for answer in all_answers:
            submission_id = answer.get("submission_id")
            question_number = answer.get("question_number")

            try:
                student_answer_text = (answer.get("answer_text") or "").strip()
                media_items = answer.get("media_items", [])

                # ----------------------------------------------------------
                # 🖼️ Handle image mode: convert image paths to base64
                # ----------------------------------------------------------
                base64_images = []
                if self.mode == "image":
                    for media in media_items:
                        media_url = media.get("media_url")
                        if not media_url or not os.path.exists(media_url):
                            continue
                        try:
                            with open(media_url, "rb") as img_file:
                                img_b64 = base64.b64encode(img_file.read()).decode("utf-8")
                                base64_images.append(img_b64)
                            log.debug(f"Encoded image: {media_url}")
                        except Exception as e:
                            log.warning(f"⚠️ Failed to read image {media_url}: {e}")

                # ----------------------------------------------------------
                # 📘 Get model answer info
                # ----------------------------------------------------------
                model_answer = self.model_service.get_model_answer(
                    model_answer_paper_id=model_answer_paper_id,
                    assessment_id=assessment_id,
                    question_number=question_number
                )

                if not model_answer:
                    log.warning(f"⚠️ No model answer found for Q{question_number}")
                    continue

                question_text = model_answer.get("question_text", "")
                guideline_text = model_answer.get("guideline_text", "")
                max_marks = model_answer.get("max_marks", 0)

                model_answer_data = model_answer.get("model_answer", {})
                answer_text = model_answer_data.get("answer_text", "") or ""
                media_summaries = model_answer_data.get("media_summaries", []) or []

                combined_model_answer = answer_text.strip()
                if media_summaries:
                    combined_model_answer += "\n\n---\nModel Answer Image Summary:\n"
                    for i, summary in enumerate(media_summaries, start=1):
                        combined_model_answer += f"\n[{i}] {summary}"

                # ----------------------------------------------------------
                # 🧠 Combine student answer text with mode logic
                # ----------------------------------------------------------
                if self.mode == "summary":
                    # Combine media summaries with text
                    summaries = [
                        m.get("media_summary", "")
                        for m in media_items if m.get("media_summary")
                    ]
                    combined_summary = "\n".join(f"[{i+1}] {s}" for i, s in enumerate(summaries))
                    student_combined = student_answer_text
                    if combined_summary:
                        student_combined += "\n\n---\nStudent Image Summary:\n" + combined_summary
                    student_answer_description = student_combined.strip()
                    base64_images = []  # No images sent in this mode

                else:
                    # Default image mode description
                    if student_answer_text and base64_images:
                        student_answer_description = (
                            f"The student provided both a written answer and supporting image(s).\n\n"
                            f"**Written Answer:**\n{student_answer_text}\n\n"
                            f"**Image(s):** included below."
                        )
                    elif not student_answer_text and base64_images:
                        student_answer_description = "The student's answer is entirely in the attached image(s)."
                    elif student_answer_text and not base64_images:
                        student_answer_description = student_answer_text
                    else:
                        student_answer_description = "No answer provided."

                # ----------------------------------------------------------
                # 🚀 Send to LLM
                # ----------------------------------------------------------
                if not student_answer_text and not base64_images:
                    score, feedback = 0.0, "No answer provided."
                else:
                    score, feedback = self._call_llm_openai_multimodal(
                        question_text=question_text,
                        model_answer=combined_model_answer,
                        guideline_text=guideline_text,
                        student_answer_description=student_answer_description,
                        student_images=base64_images,
                        max_marks=max_marks
                    )

                # ----------------------------------------------------------
                # 💾 Save results
                # ----------------------------------------------------------
                record = GradingResultRecord(
                    submission_id=submission_id,
                    question_number=question_number,
                    score=float(score),
                    max_marks=float(max_marks),
                    feedback=feedback,
                    grading_method=f"DIRECT_{self.mode.upper()}",
                    similarity_score=None,
                    context_used=None,
                )

                self.result_db.save_result_record(record)
                graded_records.append(record)

            except Exception as e:
                log.error(f"❌ Error grading {submission_id} Q{question_number}: {e}", exc_info=True)
                if hasattr(self.result_db, "rollback"):
                    self.result_db.rollback()

        if hasattr(self.result_db, "commit"):
            self.result_db.commit()

        log.info(f"✅ Grading complete. Total graded answers: {len(graded_records)}")
        return graded_records

    # ----------------------------------------------------------
    # 🔹 OpenAI LLM call
    # ----------------------------------------------------------
    def _call_llm_openai_multimodal(
        self,
        question_text: str,
        model_answer: str,
        guideline_text: str,
        student_answer_description: str,
        student_images: List[str],
        max_marks: float
    ):
        try:
            # Build prompt
            text_prompt = GRADING_PROMPT_TEMPLATE.format(
                question_text=question_text,
                model_answer=model_answer,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )

            content = [{"type": "text", "text": text_prompt}]
            for img_b64 in student_images:
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}
                })

            # Send request
            response = self.client.chat.completions.create(
                model=self.chat_model,
                temperature=0.0,
                max_tokens=800,
                messages=[
                    {"role": "system", "content": "You are an expert academic examiner."},
                    {"role": "user", "content": content},
                ],
            )

            raw_output = response.choices[0].message.content.strip()
            if raw_output.startswith("```"):
                raw_output = raw_output.strip("`").replace("json", "").strip()

            try:
                parsed = json.loads(raw_output)
                score = float(parsed.get("score", 0))
                feedback = parsed.get("feedback", "No feedback provided.")
            except json.JSONDecodeError:
                log.warning(f"⚠️ Invalid JSON output:\n{raw_output}")
                score, feedback = 0.0, "Grading failed due to invalid LLM response."

            return score, feedback

        except Exception as e:
            log.error(f"❌ Multimodal grading error: {e}", exc_info=True)
            return 0.0, "Grading failed due to API error."
