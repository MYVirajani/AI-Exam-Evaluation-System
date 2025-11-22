import os
import json
import base64
import logging
import numpy as np
from typing import List
from dotenv import load_dotenv

from openai import OpenAI
from google.generativeai import GenerativeModel, configure as configure_gemini

from src.prompts.rag_grading_prompt import RAG_GRADING_PROMPT_TEMPLATE
from src.services.database_services.lecture_material_vector_db_service import LectureMaterialVectorDBService
from src.services.database_services.model_answer_vector_service import ModelAnswerVectorService
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord

load_dotenv()
log = logging.getLogger(__name__)


class RAGGrader:
    """Retrieval-Augmented Grader using precomputed embeddings for model answers,
    student answers, and lecture materials.
    """

    def __init__(self, model_name: str):
        self.model_name = model_name.lower().strip()
        self.client = None
        self.temperature = 0.2

        # -------------------------------
        # 🔹 Choose provider
        # -------------------------------
        if self.model_name == "openai":
            self.provider = os.getenv("OPENAI_PROVIDER", "openai")
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.chat_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            self.temperature = float(os.getenv("OPENAI_TEMPERATURE", 0.2))
            self.client = OpenAI(api_key=self.api_key)

        elif self.model_name == "gemini":
            self.provider = os.getenv("GEMINI_PROVIDER", "google")
            self.api_key = os.getenv("GOOGLE_API_KEY")
            self.chat_model = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
            self.temperature = float(os.getenv("GEMINI_TEMPERATURE", 0.2))
            configure_gemini(api_key=self.api_key)
            self.client = GenerativeModel(self.chat_model)

        else:
            raise ValueError(f"❌ Unsupported model_name '{model_name}'. Use 'openai' or 'gemini'.")

        # -------------------------------
        # 🔹 DB Services
        # -------------------------------
        self.model_vector_service = ModelAnswerVectorService(ai_model=self.model_name)
        self.lecture_db = LectureMaterialVectorDBService(model_name=self.model_name)
        self.student_vector_service = StudentAnswerVectorService(ai_model=self.model_name)
        self.student_db_service = StudentAnswerServiceWithMedia(ai_model=self.model_name)
        self.result_db = GradingResultDB(ai_model=self.chat_model)

        log.info(f"🧠 RAGGrader initialized with provider={self.provider}, model={self.chat_model}")

    # -------------------------------------------------------------------------
    def grade_all_submissions(self, submission_ids: List[str], model_paper_id: str,
                              assessment_id: str, lecturer_id: str, module_id: str, top_k: int = 5):
        """Grades all submissions using stored embeddings."""
        graded_records = []
        model_answer_db = ModelAnswerDBService(ai_model=self.model_name)

        for submission_id in submission_ids:
            try:
                student_answers = self.student_db_service.get_all_answers(submission_id)
                if not student_answers:
                    log.warning(f"No answers found for submission {submission_id}")
                    continue

                for ans in student_answers:
                    question_number = ans.get("question_number")
                    student_answer_text = (ans.get("answer_text") or "").strip()
                    media_items = ans.get("media_items", [])
                    base64_images = []

                    # --- Step 1: Collect image data
                    for media in media_items:
                        media_url = media.get("media_url")
                        if media_url and os.path.exists(media_url):
                            try:
                                with open(media_url, "rb") as img_file:
                                    base64_images.append(base64.b64encode(img_file.read()).decode("utf-8"))
                            except Exception as e:
                                log.warning(f"⚠️ Could not read image {media_url}: {e}")

                    # --- Step 2: Build student answer description
                    if student_answer_text and base64_images:
                        student_answer_description = (
                            f"The student provided both written and visual components.\n\n"
                            f"**Written Answer:**\n{student_answer_text}\n\n**Images:** Included below."
                        )
                    elif not student_answer_text and base64_images:
                        student_answer_description = "The student's entire answer is in the attached image(s)."
                    elif student_answer_text:
                        student_answer_description = student_answer_text
                    else:
                        student_answer_description = "No answer provided."

                    # --- Step 3: Load embeddings
                    model_embedding = self.model_vector_service.get_embeddings_by_question(
                        assessment_id=assessment_id,
                        model_paper_id=model_paper_id,
                        question_number=question_number
                    )
                    student_embedding = self.student_vector_service.get_student_answer_embeddings(
                        submission_id=submission_id,
                        question_number=question_number
                    )

                    # --- Step 4: Normalize
                    model_embedding = self._normalize_embedding(model_embedding)
                    student_embedding = self._normalize_embedding(student_embedding)

                    if not model_embedding or not student_embedding:
                        log.warning(f"Missing embeddings for Q{question_number}, skipping...")
                        continue

                    # --- Step 5: Retrieve lecture chunks
                    lecture_chunks = self.lecture_db.get_similar_chunks_by_embedding(
                        query_embedding=model_embedding,
                        lecturer_id=lecturer_id,
                        module_id=module_id,
                        top_k=top_k
                    )
                    context_text = "\n\n".join([chunk["content"] for chunk in lecture_chunks])

                    # --- Step 6: Retrieve model answer
                    model_answer_data = model_answer_db.get_model_answer(
                        model_answer_paper_id=model_paper_id,
                        assessment_id=assessment_id,
                        question_number=question_number
                    )
                    if not model_answer_data:
                        log.warning(f"⚠️ No model answer found for Q{question_number}, skipping...")
                        continue

                    question_text = model_answer_data.get("question_text")
                    guideline_text = model_answer_data.get("guideline_text")
                    max_marks = model_answer_data.get("max_marks")
                    model_answer_text = model_answer_data["model_answer"]["answer_text"]

                    # --- Step 7: Similarity
                    sim_score = self._compute_cosine_similarity(
                        np.array(model_embedding),
                        np.array(student_embedding)
                    )

                    # --- Step 8: Prepare full grading context
                    context_full = (
                        f"Question:\n{question_text}\n\n"
                        f"Lecture Context:\n{context_text}\n\n"
                        f"Model Answer:\n{model_answer_text}"
                    )

                    # --- Step 9: LLM grading
                    if self.model_name == "openai":
                        score, feedback = self._call_openai(
                            context_full, question_text, guideline_text, student_answer_description, base64_images, max_marks
                        )
                    else:
                        score, feedback = self._call_gemini(
                            context_full, question_text, guideline_text, student_answer_description, base64_images, max_marks
                        )

                    # --- ✅ Step 10: Save result including full context
                    record = GradingResultRecord(
                        submission_id=submission_id,
                        question_number=question_number,
                        score=float(score),
                        max_marks=max_marks,
                        feedback=feedback,
                        grading_method=f"RAG_{self.chat_model.upper()}",
                        similarity_score=float(sim_score),
                        # short preview for readability
                        context_used=context_full
                    )

                    self.result_db.save_result_record(record, suffix="rag")
                    graded_records.append(record)

            except Exception as e:
                log.error(f"❌ Error grading submission {submission_id}: {e}", exc_info=True)
                self.result_db.rollback()

        self.result_db.commit()
        log.info(f"✅ RAG grading complete. Graded {len(graded_records)} answers.")
        return graded_records

    # -------------------------------------------------------------------------
    def _normalize_embedding(self, embedding):
        try:
            if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], tuple):
                embedding = embedding[0][1]
            if isinstance(embedding, dict):
                embedding = embedding.get("embedding") or embedding.get("vector") or list(embedding.values())[0]
            if isinstance(embedding, str):
                embedding = json.loads(embedding)
            if isinstance(embedding, np.ndarray):
                embedding = embedding.tolist()
            return embedding
        except Exception:
            return None

    # -------------------------------------------------------------------------
    def _compute_cosine_similarity(self, vec1, vec2):
        if vec1 is None or vec2 is None:
            return 0.0
        dot = np.dot(vec1, vec2)
        norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)
        return float(dot / norm) if norm != 0 else 0.0

    # -------------------------------------------------------------------------
    def _call_openai(self, context, question_text, guideline_text, student_answer_description, student_images, max_marks):
        """Calls OpenAI multimodal model and prints raw LLM output."""
        try:
            prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                context=context,
                question_text=question_text,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )

            content = [{"type": "text", "text": prompt}]
            for img in student_images:
                content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img}"}})

            response = self.client.chat.completions.create(
                model=self.chat_model,
                temperature=self.temperature,
                max_tokens=800,
                messages=[
                    {"role": "system", "content": "You are an expert academic examiner."},
                    {"role": "user", "content": content},
                ],
            )

            raw = response.choices[0].message.content.strip()

            print("\n" + "=" * 70)
            print(f"🧠 OPENAI RAW OUTPUT for Question: {question_text}")
            print("-" * 70)
            print(raw)
            print("=" * 70 + "\n")

            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[OpenAI] ❌ Error: {e}", exc_info=True)
            return 0.0, "Grading failed due to OpenAI error."

    # -------------------------------------------------------------------------
    def _call_gemini(self, context, question_text, guideline_text, student_answer_description, student_images, max_marks):
        """Calls Gemini multimodal model and prints raw LLM output."""
        try:
            prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                context=context,
                question_text=question_text,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )

            if student_images:
                parts = [{"text": prompt}] + [
                    {"inline_data": {"mime_type": "image/jpeg", "data": img}} for img in student_images
                ]
                result = self.client.generate_content(parts)
            else:
                result = self.client.generate_content([{"text": prompt}])

            raw = result.candidates[0].content.parts[0].text

            print("\n" + "=" * 70)
            print(f"🧠 GEMINI RAW OUTPUT for Question: {question_text}")
            print("-" * 70)
            print(raw)
            print("=" * 70 + "\n")

            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[Gemini] ❌ Error: {e}", exc_info=True)
            return 0.0, "Grading failed due to Gemini error."

    # -------------------------------------------------------------------------
    def _parse_json_response(self, raw_output: str):
        """Safely parses LLM JSON output."""
        try:
            if raw_output.startswith("```"):
                raw_output = raw_output.strip("`").replace("json", "").strip()
            data = json.loads(raw_output)
            score = float(data.get("score", 0))
            feedback = data.get("feedback", "No feedback provided.")
            return score, feedback
        except Exception:
            print("\n⚠️ INVALID JSON RESPONSE from LLM:\n", raw_output)
            log.warning(f"⚠️ Invalid JSON output:\n{raw_output}")
            return 0.0, "Grading failed due to invalid LLM response."
