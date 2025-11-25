import os
import json
import base64
import logging
import numpy as np
from typing import List, Optional
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
from src.models.grading_result_record import GradingResultRecord, GradingMethod

load_dotenv()
log = logging.getLogger(__name__)


class RAGGrader:
    def __init__(self, model_name: str):
        self.model_name = model_name.lower().strip()
        self.temperature = 0.0
        self.client = None

        # -----------------------------
        # PROVIDER INITIALIZATION
        # -----------------------------
        if self.model_name == "openai":
            self.provider = "openai"
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.chat_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            self.temperature = float(os.getenv("OPENAI_TEMPERATURE", 0.0))
            self.client = OpenAI(api_key=self.api_key)
            embedding_model = "openai"

        elif self.model_name == "gemini":
            self.provider = "google"
            self.api_key = os.getenv("GOOGLE_API_KEY")
            self.chat_model = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
            self.temperature = float(os.getenv("GEMINI_TEMPERATURE", 0.0))
            configure_gemini(api_key=self.api_key)
            self.client = GenerativeModel(
                self.chat_model,
                generation_config={"temperature": self.temperature, "top_p": 1}
            )
            embedding_model = "gemini"

        elif self.model_name == "claude":
            self.provider = "anthropic"
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            self.chat_model = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-latest")
            from anthropic import Anthropic
            self.client = Anthropic(api_key=self.api_key)
            embedding_model = "openai"
            log.info("Claude selected → falling back to GEMINI embeddings.")

        else:
            raise ValueError(f"Unsupported model '{model_name}'.")

        # -----------------------------
        # VECTOR + DB SERVICES
        # -----------------------------
        self.model_vector_service = ModelAnswerVectorService(ai_model=embedding_model)
        self.lecture_db = LectureMaterialVectorDBService(model_name=embedding_model)
        self.student_vector_service = StudentAnswerVectorService(ai_model=embedding_model)
        self.student_db_service = StudentAnswerServiceWithMedia(ai_model=embedding_model)
        self.result_db = GradingResultDB(ai_model=self.model_name)
        self.model_answer_db = ModelAnswerDBService(ai_model=embedding_model)

        self.embedding_model = embedding_model
        self.llm_model = self.model_name

    # -------------------------------------------------------------------------
    def grade_all_submissions(self, submission_ids: List[str], model_paper_id: str,
                              assessment_id: str, lecturer_id: str, module_id: str,
                              top_k: int = 5):

        graded_records = []

        for submission_id in submission_ids:
            try:
                student_answers = self.student_db_service.get_all_answers(submission_id)
                if not student_answers:
                    log.warning(f"No answers found for submission {submission_id}")
                    continue

                for ans in student_answers:
                    question_number = ans.get("question_number")
                    student_answer_text = (ans.get("answer_text") or "").strip()
                    base64_images = []
                    media_summaries = []

                    media_items = ans.get("media_items", [])
                    for media in media_items:
                        summary = media.get("media_summary", "").strip()
                        if summary:
                            media_summaries.append(summary)
                        media_url = media.get("media_url")
                        if media_url and os.path.exists(media_url):
                            try:
                                with open(media_url, "rb") as img_file:
                                    encoded = base64.b64encode(img_file.read()).decode("utf-8")
                                    base64_images.append(encoded)
                            except Exception as e:
                                log.error(f"[Image Load Error] Could not read '{media_url}': {e}", exc_info=True)
                        else:
                            if media_url:
                                log.error(f"[Image Load Error] File missing: {media_url}")

                    # -----------------------------
                    # HANDLE EMPTY ANSWERS
                    # -----------------------------
                    if not student_answer_text and not base64_images and not media_summaries:
                        record = GradingResultRecord(
                            submission_id=submission_id,
                            question_number=question_number,
                            score=0.0,
                            max_marks=0.0,
                            feedback="Student hasn't provided the answer.",
                            answer_source="No answer provided.",
                            grading_method=GradingMethod.RAG.value,
                            similarity_score=0.0,
                            context_used="No answer provided."
                        )
                        self.result_db.save_result_record(record, suffix="rag")
                        graded_records.append(record)
                        continue

                    # -----------------------------
                    # BUILD STUDENT DESCRIPTION
                    # -----------------------------
                    student_answer_description = student_answer_text
                    if media_summaries:
                        student_answer_description += "\n\n---\nImage Summaries:\n" + "\n".join([f"- {s}" for s in media_summaries])

                    # -----------------------------
                    # FETCH EMBEDDINGS
                    # -----------------------------
                    model_embedding = self.model_vector_service.get_embeddings_by_question(
                        assessment_id=assessment_id,
                        model_paper_id=model_paper_id,
                        question_number=question_number
                    )
                    student_embedding = self.student_vector_service.get_student_answer_embeddings(
                        submission_id=submission_id,
                        question_number=question_number
                    )
                    model_embedding = self._normalize_embedding(model_embedding)
                    student_embedding = self._normalize_embedding(student_embedding)

                    if not model_embedding or not student_embedding:
                        log.warning(f"No embeddings for Q{question_number}, skipping...")
                        continue

                    # -----------------------------
                    # RETRIEVE LECTURE CONTEXT
                    # -----------------------------
                    lecture_chunks = self.lecture_db.get_similar_chunks_by_embedding(
                        query_embedding=model_embedding,
                        lecturer_id=lecturer_id,
                        module_id=module_id,
                        top_k=top_k
                    )
                    context_text = "\n\n".join([chunk["content"] for chunk in lecture_chunks])

                    # -----------------------------
                    # MODEL ANSWER
                    # -----------------------------
                    model_answer_data = self.model_answer_db.get_model_answer(
                        model_answer_paper_id=model_paper_id,
                        assessment_id=assessment_id,
                        question_number=question_number
                    )
                    if not model_answer_data:
                        log.warning(f"No model answer found for Q{question_number}")
                        continue

                    question_text = model_answer_data.get("question_text", "")
                    guideline_text = model_answer_data.get("guideline_text", "")
                    max_marks = model_answer_data.get("max_marks", 0.0)
                    model_answer_text = model_answer_data["model_answer"]["answer_text"]

                    sim_score = self._compute_cosine_similarity(
                        np.array(model_embedding), np.array(student_embedding)
                    )

                    context_full = (
                        f"Question:\n{question_text}\n\n"
                        f"Lecture Context:\n{context_text}\n\n"
                        f"Model Answer:\n{model_answer_text}\n\n"
                    )

                    # -----------------------------
                    # LLM CALL
                    # -----------------------------
                    if self.llm_model == "openai":
                        score, feedback, answer_source = self._call_openai(
                            context_full, question_text, guideline_text,
                            student_answer_description, base64_images, max_marks
                        )
                    elif self.llm_model == "gemini":
                        score, feedback, answer_source = self._call_gemini(
                            context_full, question_text, guideline_text,
                            student_answer_description, base64_images, max_marks
                        )
                    elif self.llm_model == "claude":
                        score, feedback, answer_source = self._call_claude(
                            context_full, question_text, guideline_text,
                            student_answer_description, base64_images, max_marks
                        )

                    # -----------------------------
                    # SAVE RESULT
                    # -----------------------------
                    record = GradingResultRecord(
                        submission_id=submission_id,
                        question_number=question_number,
                        score=float(score),
                        max_marks=max_marks,
                        feedback=feedback,
                        answer_source=answer_source,
                        grading_method=GradingMethod.RAG.value,
                        similarity_score=float(sim_score),
                        context_used=context_full
                    )
                    self.result_db.save_result_record(record, suffix="rag")
                    graded_records.append(record)

            except Exception as e:
                log.error(f"Error grading submission {submission_id}: {e}", exc_info=True)
                self.result_db.rollback()

        self.result_db.commit()
        return graded_records

    # -------------------------------------------------------------------------
    def _call_claude(self, context, question_text, guideline_text,
                     student_answer_description, student_images, max_marks):
        try:
            prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                context=context,
                question_text=question_text,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )
            msg = self.client.messages.create(
                model=self.chat_model,
                max_tokens=800,
                temperature=self.temperature,
                messages=[{"role": "user", "content": prompt}]
            )
            raw = msg.content[0].text.strip()
            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[Claude] Error: {e}", exc_info=True)
            return 0.0, "Claude grading failed.", "text"

    # -------------------------------------------------------------------------
    def _call_openai(self, context, question_text, guideline_text,
                     student_answer_description, student_images, max_marks):
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
                top_p=1,
                max_tokens=800,
                messages=[
                    {"role": "system", "content": "You are an expert academic examiner."},
                    {"role": "user", "content": content}
                ],
            )
            raw = response.choices[0].message.content.strip()
            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[OpenAI] Error: {e}", exc_info=True)
            return 0.0, "OpenAI grading failed.", "text"

    # -------------------------------------------------------------------------
    def _call_gemini(self, context, question_text, guideline_text,
                     student_answer_description, student_images, max_marks):
        try:
            prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                context=context,
                question_text=question_text,
                guideline_text=guideline_text,
                student_answer_description=student_answer_description,
                max_marks=max_marks,
            )
            parts = [{"text": prompt}]
            for img in student_images:
                parts.append({"inline_data": {"mime_type": "image/jpeg", "data": img}})
            result = self.client.generate_content(parts)
            raw = result.candidates[0].content.parts[0].text
            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[Gemini] Error: {e}", exc_info=True)
            return 0.0, "Gemini grading failed.", "text"

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
    def _parse_json_response(self, raw_output: str):
        try:
            if raw_output.startswith("```"):
                raw_output = raw_output.strip("`").replace("json", "").strip()
            data = json.loads(raw_output)
            score = float(data.get("score", 0))
            feedback = data.get("feedback", "No feedback.")
            answer_source = data.get("answer_source", "text")  # default to "text"
            return score, feedback, answer_source
        except Exception:
            log.warning(f"Invalid JSON returned:\n{raw_output}")
            return 0.0, "Invalid JSON returned by the LLM.", "text"
