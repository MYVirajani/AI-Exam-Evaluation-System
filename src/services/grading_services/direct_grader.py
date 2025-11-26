import os
import json
import base64
import logging
from typing import List
from dotenv import load_dotenv

# --- Provider SDK imports ---
from openai import OpenAI as OpenAIClient
from google import genai  # Gemini
import requests

from src.prompts.grading_prompt import GRADING_PROMPT_TEMPLATE
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord

load_dotenv()
log = logging.getLogger(__name__)


class DirectGrader:
    """
    Grades student answers using various LLM providers (OpenAI, Gemini, DeepSeek).
    Supports image-based and summary-based grading modes.
    """

    def __init__(self, provider: str, chat_model: str, embedder: str = None, mode: str = "image"):
        """
        Initializes DirectGrader with given provider and model.

        Args:
            provider (str): AI provider, e.g., 'OpenAI', 'GoogleGemini', 'DeepSeek'
            chat_model (str): model name, e.g., 'gpt-4o-mini', 'gemini-2.0-flash'
            embedder (str, optional): embedding model (unused here)
            mode (str): 'image' or 'summary'
        """
        if mode not in ["image", "summary"]:
            raise ValueError("❌ Invalid mode. Must be 'image' or 'summary'.")

        self.provider = provider.lower().strip()
        self.chat_model = chat_model.strip()
        self.embedder = embedder
        self.mode = mode

        # Initialize database services with AI model suffix
        self.student_service = StudentAnswerServiceWithMedia(ai_model=self.chat_model)
        self.model_service = ModelAnswerDBService(ai_model=self.chat_model)
        self.result_db = GradingResultDB(ai_model=self.chat_model)

        # Initialize LLM client
        if "gpt" in self.chat_model or self.provider == "openai":
            self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
        elif "gemini" in self.chat_model or self.provider in ["google", "google-gemini", "googlegemini"]:
            self.client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        elif "deepseek" in self.chat_model or self.provider == "deepseek":
            self.client = os.getenv("DEEPSEEK_API_KEY")
        else:
            raise ValueError(f"❌ Unsupported provider: {provider}")

        log.info(f"📘 DirectGrader initialized for {provider} ({chat_model}) in '{mode}' mode.")

    # -------------------------------------------------------------------------
    # 🔹 Main grading loop
    # -------------------------------------------------------------------------
    def grade_all_submissions(self, submission_ids: List[str], model_answer_paper_id: str, assessment_id: str):
        """Grades all student answers for given submissions."""
        if not submission_ids:
            log.warning("⚠️ No submission IDs provided.")
            return []

        all_answers = self.student_service.get_all_answers_by_submission_ids(submission_ids)
        log.info(f"✅ Retrieved {len(all_answers)} answers for {len(submission_ids)} submissions")

        if not all_answers:
            log.info("📭 No student answers found.")
            return []

        graded_records = []

        for answer in all_answers:
            submission_id = answer.get("submission_id")
            question_number = answer.get("question_number")

            try:
                student_answer_text = (answer.get("answer_text") or "").strip()
                media_items = answer.get("media_items", [])
                base64_images = []

                # Encode images for LLM
                if self.mode == "image":
                    for media in media_items:
                        media_url = media.get("media_url")
                        if media_url and os.path.exists(media_url):
                            with open(media_url, "rb") as img_file:
                                base64_images.append(base64.b64encode(img_file.read()).decode("utf-8"))

                # Fetch model answer from DB
                model_answer = self.model_service.get_model_answer(
                    model_answer_paper_id=model_answer_paper_id,
                    assessment_id=assessment_id,
                    question_number=question_number,
                )

                if not model_answer:
                    log.warning(f"⚠️ No model answer found for Q{question_number}")
                    continue

                question_text = model_answer.get("question_text", "")
                guideline_text = model_answer.get("guideline_text", "")
                max_marks = model_answer.get("max_marks", 0)
                model_ans_data = model_answer.get("model_answer", {})

                combined_model_answer = model_ans_data.get("answer_text", "").strip()
                summaries = model_ans_data.get("media_summaries", [])
                if summaries:
                    combined_model_answer += "\n\n---\nModel Answer Image Summary:\n" + "\n".join(summaries)

                # Prepare student answer text
                if self.mode == "summary":
                    student_summaries = [m.get("media_summary", "") for m in media_items if m.get("media_summary")]
                    combined_summary = "\n".join(f"[{i+1}] {s}" for i, s in enumerate(student_summaries))
                    student_answer_description = (
                        f"{student_answer_text}\n\n---\nStudent Image Summary:\n{combined_summary}"
                        if combined_summary else student_answer_text
                    )
                    base64_images = []
                else:
                    if student_answer_text and base64_images:
                        student_answer_description = (
                            f"The student provided a written answer and supporting image(s).\n\n"
                            f"**Written Answer:**\n{student_answer_text}\n\n**Image(s):** included below."
                        )
                    elif not student_answer_text and base64_images:
                        student_answer_description = "The student's answer is entirely in the attached image(s)."
                    elif student_answer_text:
                        student_answer_description = student_answer_text
                    else:
                        student_answer_description = "No answer provided."

                # Call appropriate LLM
                if "gemini" in self.chat_model:
                    score, feedback = self._call_gemini(
                        question_text, combined_model_answer, guideline_text,
                        student_answer_description, base64_images, max_marks
                    )
                elif "deepseek" in self.chat_model:
                    score, feedback = self._call_deepseek(
                        question_text, combined_model_answer, guideline_text,
                        student_answer_description, max_marks
                    )
                else:
                    score, feedback, answer_source = self._call_openai(
                        question_text, combined_model_answer, guideline_text,
                        student_answer_description, base64_images, max_marks
                    )

                # Save result
                record = GradingResultRecord(
                    submission_id=submission_id,
                    question_number=question_number,
                    score=float(score),
                    max_marks=float(max_marks),
                    feedback=feedback,
                    answer_source=answer_source,
                    grading_method=f"{self.provider.upper()}_{self.mode.upper()}",
                    similarity_score=None,
                    context_used=None,
                )

                self.result_db.save_result_record(record)
                graded_records.append(record)

            except Exception as e:
                log.error(f"❌ Error grading {submission_id} Q{question_number}: {e}", exc_info=True)
                self.result_db.rollback()

        self.result_db.commit()
        log.info(f"✅ Grading complete. Total graded answers: {len(graded_records)}")
        return graded_records

    # -------------------------------------------------------------------------
    # 🔹 OpenAI multimodal grading
    # -------------------------------------------------------------------------
    def _call_openai(self, question_text, model_answer, guideline_text, student_answer_description, student_images, max_marks):
        try:
            prompt = GRADING_PROMPT_TEMPLATE.format(
                question_text=question_text,
                model_answer=model_answer,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )

            content = [{"type": "text", "text": prompt}]
            for img in student_images:
                content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}})

            response = self.client.chat.completions.create(
                model=self.chat_model,
                temperature=0.2,
                max_tokens=800,
                messages=[
                    {"role": "system", "content": "You are an expert academic examiner."},
                    {"role": "user", "content": content},
                ],
            )

            raw = response.choices[0].message.content.strip()
            return self._parse_json_response(raw)

        except Exception as e:
            log.error(f"[OpenAI] ❌ Error: {e}", exc_info=True)
            return 0.0, "Grading failed due to OpenAI API error."

    # -------------------------------------------------------------------------
    # 🔹 Gemini grading (text or image)
    # -------------------------------------------------------------------------
    def _call_gemini(self, question_text, model_answer, guideline_text, student_answer_description, student_images, max_marks):
        try:
            prompt = GRADING_PROMPT_TEMPLATE.format(
                question_text=question_text,
                model_answer=model_answer,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )

            model = self.client.models.generate_content
            if student_images:
                parts = [{"text": prompt}] + [{"inline_data": {"mime_type": "image/jpeg", "data": img}} for img in student_images]
                result = model(model=self.chat_model, contents=parts)
            else:
                result = model(model=self.chat_model, contents=[{"text": prompt}])

            raw = result.candidates[0].content.parts[0].text
            return self._parse_json_response(raw)

        except Exception as e:
            log.error(f"[Gemini] ❌ Error: {e}", exc_info=True)
            return 0.0, "Grading failed due to Gemini API error."

    # -------------------------------------------------------------------------
    # 🔹 DeepSeek grading (text-only)
    # -------------------------------------------------------------------------
    def _call_deepseek(self, question_text, model_answer, guideline_text, student_answer_description, max_marks):
        try:
            prompt = GRADING_PROMPT_TEMPLATE.format(
                question_text=question_text,
                model_answer=model_answer,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )

            response = requests.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.client}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.chat_model,
                    "messages": [
                        {"role": "system", "content": "You are an expert academic examiner."},
                        {"role": "user", "content": prompt},
                    ],
                },
                timeout=60,
            )
            response.raise_for_status()
            raw = response.json()["choices"][0]["message"]["content"]
            return self._parse_json_response(raw)

        except Exception as e:
            log.error(f"[DeepSeek] ❌ Error: {e}", exc_info=True)
            return 0.0, "Grading failed due to DeepSeek API error."

    # -------------------------------------------------------------------------
    # 🔹 Parse JSON output
    # -------------------------------------------------------------------------
    def _parse_json_response(self, raw_output: str):
        try:
            if raw_output.startswith("```"):
                raw_output = raw_output.strip("`").replace("json", "").strip()
            data = json.loads(raw_output)
            score = float(data.get("score", 0))
            feedback = data.get("feedback", "No feedback provided.")
            return score, feedback
        except Exception:
            log.warning(f"⚠️ Invalid JSON output:\n{raw_output}")
            return 0.0, "Grading failed due to invalid LLM response."
