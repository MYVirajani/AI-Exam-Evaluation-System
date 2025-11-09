import os
import json
import logging
import numpy as np
from typing import List
from dotenv import load_dotenv

from openai import OpenAI
from google.generativeai import GenerativeModel, configure as configure_gemini

from src.prompts.rag_grading_prompt import RAG_GRADING_PROMPT_TEMPLATE
from src.services.database_services.lecture_material_vector_db_service import LectureMaterialDBService
from src.services.database_services.model_answer_vector_service import ModelAnswerVectorService
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord

load_dotenv()
log = logging.getLogger(__name__)


class RAGGrader:
    """
    Retrieval-Augmented Grader using precomputed embeddings for model answers,
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
        self.lecture_db = LectureMaterialDBService(model_name=self.model_name)
        self.student_vector_service = StudentAnswerVectorService(ai_model=self.model_name)
        self.student_db_service = StudentAnswerServiceWithMedia(ai_model=self.model_name)
        self.result_db = GradingResultDB(ai_model=self.chat_model)

        log.info(f"🧠 RAGGrader initialized with provider={self.provider}, model={self.chat_model}")

    # -------------------------------------------------------------------------
    # 🔹 Grade all submissions
    # -------------------------------------------------------------------------
    def grade_all_submissions(self, submission_ids: List[str], model_paper_id: str,
                              assessment_id: str, lecturer_id: str, module_id: str, top_k: int = 5):
        """Grades all submissions using stored embeddings."""
        graded_records = []

        for submission_id in submission_ids:
            try:
                # get all answers of this submission
                student_answers = self.student_db_service.get_all_answers(submission_id)
                if not student_answers:
                    log.warning(f"No answers found for submission {submission_id}")
                    continue

                for ans in student_answers:
                    question_number = ans.get("question_number")
                    student_answer_text = (ans.get("answer_text") or "").strip()

                    # --- Step 1: Load embeddings
                    model_embedding = self.model_vector_service.get_embeddings_by_question(
                        assessment_id=assessment_id,
                        model_paper_id=model_paper_id,
                        question_number=question_number
                    )
                    student_embedding = self.student_vector_service.get_student_answer_embeddings(
                        submission_id=submission_id,
                        question_number=question_number
                    )

                    # 🔍 Print retrieved embeddings for debugging
                    print(f"\n--- EMBEDDING DEBUG ---")
                    print(f"Submission ID: {submission_id} | Question: {question_number}")
                    print(f"Model Embedding (raw): {str(model_embedding)[:300]}...")
                    print(f"Student Embedding (raw): {str(student_embedding)[:300]}...")
                    print("----------------------")

                    # --- Step 1.1: Normalize embeddings
                    model_embedding = self._normalize_embedding(model_embedding)
                    student_embedding = self._normalize_embedding(student_embedding)

                    # ✅ Print normalized embeddings
                    print(f"Model Embedding (normalized): {type(model_embedding)} | len={len(model_embedding)}")
                    print(f"Student Embedding (normalized): {type(student_embedding)} | len={len(student_embedding)}")

                    if not model_embedding or not student_embedding:
                        log.warning(f"Missing embeddings for Q{question_number}, skipping...")
                        continue

                    # --- Step 2: Retrieve similar lecture chunks
                    lecture_chunks = self.lecture_db.get_similar_chunks_by_question_embedding(
                        question_embedding=model_embedding,
                        lecturer_id=lecturer_id,
                        module_id=module_id,
                        top_k=top_k
                    )
                    context_text = "\n\n".join([chunk["content"] for chunk in lecture_chunks])

                    # --- Step 3: Compute similarity
                    sim_score = self._compute_cosine_similarity(
                        np.array(model_embedding),
                        np.array(student_embedding)
                    )

                    # --- Step 4: Prepare context for LLM grading
                    question_text = ans.get("question_text", "")
                    guideline_text = ans.get("guideline_text", "")
                    max_marks = float(ans.get("max_marks", 0))
                    model_answer_text = ans.get("model_answer_text", "")

                    context = (
                        f"Question: {question_text}\n\n"
                        f"Lecture Context:\n{context_text}\n\n"
                        f"Model Answer:\n{model_answer_text}"
                    )

                    # --- Step 5: Perform LLM grading
                    if self.model_name == "openai":
                        score, feedback = self._call_openai(
                            context, guideline_text, student_answer_text, max_marks
                        )
                    else:
                        score, feedback = self._call_gemini(
                            context, guideline_text, student_answer_text, max_marks
                        )

                    # --- Step 6: Save grading result
                    record = GradingResultRecord(
                        submission_id=submission_id,
                        question_number=question_number,
                        score=float(score),
                        max_marks=max_marks,
                        feedback=feedback,
                        grading_method=f"RAG_{self.provider.upper()}",
                        similarity_score=float(sim_score),
                        context_used=context_text[:1000],
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
    # 🔹 Normalize embeddings (fix for dict/str issues)
    # -------------------------------------------------------------------------
    def _normalize_embedding(self, embedding):
        """Convert embedding (tuple, str, list, etc.) to list[float]."""
        try:
            # Handle case where embedding is list of tuples [(id, '[...]')]
            if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], tuple):
                # Extract the second element (actual embedding string)
                embedding = embedding[0][1]

            if isinstance(embedding, dict):
                embedding = embedding.get("embedding") or embedding.get("vector") or list(embedding.values())[0]

            if isinstance(embedding, str):
                embedding = json.loads(embedding)

            if isinstance(embedding, np.ndarray):
                embedding = embedding.tolist()

            if not isinstance(embedding, list):
                embedding = list(embedding)

            return [float(x) for x in embedding]
        except Exception as e:
            log.error(f"⚠️ Error normalizing embedding: {e}")
            return []

    # -------------------------------------------------------------------------
    # 🔹 Compute cosine similarity (precomputed vectors)
    # -------------------------------------------------------------------------
    def _compute_cosine_similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """Computes cosine similarity between two embeddings."""
        try:
            similarity = float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
            return round(similarity, 4)
        except Exception as e:
            log.error(f"⚠️ Error computing cosine similarity: {e}")
            return 0.0

    # -------------------------------------------------------------------------
    # 🔹 LLM grading calls
    # -------------------------------------------------------------------------
    def _call_openai(self, context, guideline_text, student_answer_text, max_marks):
        try:
            prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                question_text=context,
                guideline_text=guideline_text,
                student_answer_description=student_answer_text,
                max_marks=max_marks
            )
            response = self.client.chat.completions.create(
                model=self.chat_model,
                temperature=self.temperature,
                max_tokens=800,
                messages=[
                    {"role": "system", "content": "You are an expert academic examiner."},
                    {"role": "user", "content": prompt},
                ],
            )
            raw_output = response.choices[0].message.content.strip()
            return self._parse_json_response(raw_output)
        except Exception as e:
            log.error(f"[OpenAI] Grading failed: {e}", exc_info=True)
            return 0.0, "OpenAI API error."

    def _call_gemini(self, context, guideline_text, student_answer_text, max_marks):
        try:
            prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                question_text=context,
                guideline_text=guideline_text,
                student_answer_description=student_answer_text,
                max_marks=max_marks
            )
            response = self.client.generate_content(prompt)
            raw_output = response.text.strip() if hasattr(response, "text") else str(response)
            return self._parse_json_response(raw_output)
        except Exception as e:
            log.error(f"[Gemini] Grading failed: {e}", exc_info=True)
            return 0.0, "Gemini API error."

    # -------------------------------------------------------------------------
    # 🔹 Safe JSON parse
    # -------------------------------------------------------------------------
    def _parse_json_response(self, raw_output: str):
        try:
            if raw_output.startswith("```"):
                raw_output = raw_output.strip("`").replace("json", "").strip()
            data = json.loads(raw_output)
            return float(data.get("score", 0)), data.get("feedback", "No feedback.")
        except Exception:
            log.warning(f"⚠️ Invalid LLM output:\n{raw_output}")
            return 0.0, "Invalid JSON response."
