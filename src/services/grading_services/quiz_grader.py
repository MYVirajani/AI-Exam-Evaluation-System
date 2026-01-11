#!/usr/bin/env python3
"""
Fixed and improved RAG-based grading script (updated to always save max_marks
from model_answer even for empty answers / missing embeddings).

Notes:
- Make sure environment variables OPENAI_API_KEY, GOOGLE_API_KEY or ANTHROPIC_API_KEY are set depending on provider.
- The prompt template (RAG_GRADING_PROMPT_TEMPLATE) must exist and contain placeholders:
  {context}, {question_text}, {guideline_text}, {student_answer_description}, {max_marks}
- Provider SDK call lines may need small edits depending on exact SDK versions. See comments marked `# ADAPT`.
"""

import os
import json
import base64
import logging
import numpy as np
from typing import List, Optional
from dotenv import load_dotenv

# External SDK imports - may raise if not installed; leave as optional at runtime
try:
    from openai import OpenAI
except Exception:
    OpenAI = None

try:
    from google.generativeai import GenerativeModel, configure as configure_gemini
except Exception:
    GenerativeModel = None
    configure_gemini = None

# anthropic import is done lazily in constructor if needed

# Project imports (assumed present in your project)
from src.prompts.rag_grading_prompt import RAG_GRADING_PROMPT_TEMPLATE
from src.services.database_services.lecture_material_vector_db_service import LectureMaterialVectorDBService
from src.services.database_services.lecture_material_db_service import LectureMaterialDBService
from src.services.database_services.lesson_db_service import LessonDBService
from src.services.database_services.model_answer_vector_service import ModelAnswerVectorService
from src.services.database_services.student_answer_vector_service import StudentAnswerVectorService
from src.services.database_services.student_answer_service_with_media import StudentAnswerServiceWithMedia
from src.services.database_services.model_answer_db_service import ModelAnswerDBService
from src.services.database_services.evaluation_model_db import EvaluationModelService
from src.services.database_services.grading_result_db_service import GradingResultDB
from src.models.grading_result_record import GradingResultRecord, GradingMethod
from src.services.database_services.assessment_grade_db_service import AssessmentGradeDBService

load_dotenv()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("RAGGrader")


class RAGGrader:
    def __init__(self, model_id: str):
        self.model_id = model_id

        model_db = EvaluationModelService()
        config = model_db.get_model_config(model_id)
        if not config:
            raise ValueError(f"No model config found for model_id: {model_id}")

        self.provider = config.get("provider")
        self.chat_model = config.get("chat_model")
        self.embedding_model = config.get("embedding_model")
        self.temperature = float(config.get("temperature", 0.0))
        self.model_name = config.get("model_name")

        log.info(f"[RAGGrader] Loaded model config: provider={self.provider}, "
                 f"chat_model={self.chat_model}, embedding_model={self.embedding_model}, "
                 f"temperature={self.temperature}, model_name={self.model_name}")

        # LLM Clients
        self.client = None
        if self.provider == "openai":
            if OpenAI is None:
                raise ImportError("OpenAI SDK not installed or importable.")
            self.api_key = os.getenv("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError("Missing OPENAI_API_KEY")
            # instantiate OpenAI client
            self.client = OpenAI(api_key=self.api_key)

        elif self.provider == "gemini":
            if configure_gemini is None or GenerativeModel is None:
                raise ImportError("Google Generative AI SDK not installed or importable.")
            self.api_key = os.getenv("GOOGLE_API_KEY")
            if not self.api_key:
                raise ValueError("Missing GOOGLE_API_KEY")
            configure_gemini(api_key=self.api_key)
            # ADAPT: GenerativeModel usage may differ by version
            self.client = GenerativeModel(self.chat_model, generation_config={"temperature": self.temperature, "top_p": 1})

        elif self.provider == "anthropic":
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            if not self.api_key:
                raise ValueError("Missing ANTHROPIC_API_KEY")
            # lazy import in case anthropic not installed
            from anthropic import Anthropic
            self.client = Anthropic(api_key=self.api_key)

        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

        # Database services
        self.model_vector_service = ModelAnswerVectorService(model_id=self.model_id)
        self.model_answer_db = ModelAnswerDBService(model_id=self.model_id)
        self.lecture_vector_db = LectureMaterialVectorDBService(model_id=self.model_id)
        self.lecture_db = LectureMaterialDBService()
        self.student_vector_service = StudentAnswerVectorService(model_id=self.model_id)
        self.student_db_service = StudentAnswerServiceWithMedia(model_id=self.model_id)
        self.result_db = GradingResultDB()
        self.lesson_db = LessonDBService()
        self.assessment_grade_db = AssessmentGradeDBService()
        # unify llm_model label
        self.llm_model = self.provider

    # ---------------------------------------------------------------------
    def _update_student_score_feedback(self, student_answer_id: str, score: float, feedback: str, max_marks: float):
        """
        Compatibility wrapper for updating student answer score & feedback.
        Try to call update_score_and_feedback with max_marks, otherwise fallback.
        """
        try:
            # prefer signature with max_marks if present
            return self.student_db_service.update_score_and_feedback(
                student_answer_id=student_answer_id,
                score=score,
                feedback=feedback,
                max_marks=max_marks
            )
        except TypeError:
            # fallback: older signature without max_marks
            try:
                return self.student_db_service.update_score_and_feedback(
                    student_answer_id=student_answer_id,
                    score=score,
                    feedback=feedback
                )
            except Exception as e:
                log.warning(f"Failed to update student score (fallback) for {student_answer_id}: {e}")
                return False
        except Exception as e:
            log.warning(f"Failed to update student score for {student_answer_id}: {e}")
            return False

    # =======================================================================
    def grade_submissions_answers(self, submission_ids: List[str], 
                                  assessment_id: str, lecturer_id: str, module_id: str,
                                  top_k: int = 5, question_numbers: Optional[List[str]] = None, model_paper_id: str=None,):
        """
        Grade all submissions and return a list of GradingResultRecord objects (in-memory).
        Commits results at the end. Rolls back on errors.
        """
        graded_records = []

        for submission_id in submission_ids:
            try:
                student_answers = self.student_db_service.get_all_answers(submission_id, question_numbers)
                if not student_answers:
                    log.warning(f"No answers found for submission {submission_id}")
                    continue

                for ans in student_answers:
                    question_number = ans.get("question_number")
                    student_answer_id = ans.get("student_answer_id") or ans.get("answer_id") or ans.get("id")
                    student_answer_text = (ans.get("answer_text") or "").strip()

                    base64_images: List[str] = []
                    media_summaries: List[str] = []

                    for media in ans.get("media_items", []) or []:
                        summary = media.get("media_summary", "")
                        if summary:
                            media_summaries.append(summary)

                        media_url = media.get("media_url")
                        # media_url might be a local path or an HTTP URL; handle only local files for now
                        if media_url and not media_url.lower().startswith(("http://", "https://")):
                            if os.path.exists(media_url):
                                try:
                                    with open(media_url, "rb") as f:
                                        encoded = base64.b64encode(f.read()).decode()
                                        base64_images.append(encoded)
                                except Exception as e:
                                    log.error(f"Failed to read media file {media_url}: {e}")
                            else:
                                log.error(f"[Image] Missing file: {media_url}")
                        else:
                            if media_url:
                                # we don't download external images here; store the url as summary instead
                                media_summaries.append(f"(external image) {media_url}")

                    # Build answer description
                    student_answer_description = student_answer_text or ""
                    if media_summaries:
                        student_answer_description += "\n\n---\nImage Summaries:\n" + "\n".join(
                            f"- {s}" for s in media_summaries
                        )

                    # --- IMPORTANT CHANGE: fetch model_answer EARLY so we can always obtain max_marks ---
                    model_data = self.model_answer_db.get_model_answer_by_id(
                        question_id=question_id,
                        assessment_id=assessment_id,
                        question_number=question_number
                    )
                    if not model_data:
                        log.warning(f"No model answer found for question {question_number}, paper {model_paper_id}")
                        # we continue but ensure max_marks = 0 in that case
                        max_marks = 0.0
                        question_id = None
                        question_text = ""
                        guideline_text = ""
                        model_answer_text = ""
                    else:
                        question_type= model_data.get("type")
                        question_id = model_data.get("model_answer_id", None)
                        question_text = model_data.get("question_text", "")
                        guideline_text = model_data.get("guideline_text", "")
                        max_marks = float(model_data.get("max_marks", 0.0) or 0.0)
                        model_answer_text = model_data.get("model_answer", {}).get("answer_text", "")

                    # Handle empty answer (no text, no images, no summaries)
                    if not student_answer_text and not base64_images and not media_summaries:
                        # Save grading result with max_marks from model_data (even if 0)
                        record = GradingResultRecord(
                            submission_id=submission_id,
                            question_number=question_number,
                            question_id=question_id,
                            student_answer_id=student_answer_id,
                            model_id=self.model_id,
                            score=0.0,
                            max_marks=max_marks,
                            feedback="Student hasn't provided the answer.",
                            answer_source="No answer",
                            grading_method=GradingMethod.RAG.value,
                            similarity_score=0.0,
                            context_used="No answer provided."
                        )
                        try:
                            self.result_db.save_result(record=record)
                        except Exception as e:
                            log.error(f"Failed saving grading resu0lt (empty answer) for {submission_id}/{question_number}: {e}", exc_info=True)
                            self.result_db.rollback()
                            continue

                        graded_records.append(record)
                        updated = self._update_student_score_feedback(
                            student_answer_id=student_answer_id,
                            score=0.0,
                            feedback="Student hasn't provided the answer.",
                            max_marks=max_marks
                        )
                        if updated:
                            log.info(f"[GRADE] Updated student answer with 0 score: {student_answer_id} (max_marks={max_marks})")
                        else:
                            log.warning(f"[GRADE] Failed to update student score for: {student_answer_id}")
                        # proceed to next answer
                        continue

                    # Embeddings (we attempt to pull embeddings next)
                    model_emb = self.model_vector_service.get_embeddings_by_question(
                        assessment_id, model_paper_id, question_number
                    )
                    stud_emb = self.student_vector_service.get_student_answer_embeddings(
                        submission_id, question_number
                    )
                    q_emb = model_emb.get("question_embedding") if model_emb else None
                    q_emb = self._normalize_embedding(q_emb)
                    model_emb = self._normalize_embedding(model_emb)
                    stud_emb = self._normalize_embedding(stud_emb)

                    if not model_emb or not stud_emb:
                        log.warning(f"Missing embeddings for submission {submission_id}, question {question_number}")

                        # Save minimal record indicating failure to compute embeddings but save max_marks from model_data
                        record = GradingResultRecord(
                            submission_id=submission_id,
                            question_number=question_number,
                            question_id=question_id,
                            student_answer_id=student_answer_id,
                            model_id=self.model_id,
                            score=0.0,
                            max_marks=max_marks,
                            feedback="Missing embeddings; skipping automatic grading.",
                            answer_source="no-embedding",
                            grading_method=GradingMethod.RAG.value,
                            similarity_score=0.0,
                            context_used="No embedding available."
                        )
                        try:
                            self.result_db.save_result(record)
                        except Exception as e:
                            log.error(f"Failed saving grading result (no embeddings) for {submission_id}/{question_number}: {e}", exc_info=True)
                            self.result_db.rollback()
                            continue

                        graded_records.append(record)
                        updated = self._update_student_score_feedback(
                            student_answer_id=student_answer_id,
                            score=0.0,
                            feedback="Missing embeddings; skipping automatic grading.",
                            max_marks=max_marks
                        )
                        if updated:
                            log.info(f"[GRADE] Updated student answer with 0 score (no embeddings): {student_answer_id} (max_marks={max_marks})")
                        else:
                            log.warning(f"[GRADE] Failed to update student score for: {student_answer_id}")
                        continue

                    # Compute similarity and lecture context
                    sim_score = self._compute_cosine_similarity(
                        np.array(model_emb), np.array(stud_emb)
                    )
                    lessons = self.lesson_db.get_lesson_ids(module_id=module_id, lecturer_id=lecturer_id)

                    lecture_material_ids = self.lecture_db.get_lecture_material_ids_by_lessons(lesson_ids=lessons)

                    # Lecture Context
                    lecture_chunks = self.lecture_vector_db.get_similar_chunks_by_embedding(
                        query_embedding=q_emb,
                        lecture_material_ids=lecture_material_ids,
                        top_k=top_k
                    )
                    context_text = "\n\n".join([c.get("content", "") for c in lecture_chunks])

                    context_full = (
                        f"Question:\n{question_text}\n\n"
                        f"Lecture Context:\n{context_text}\n\n"
                        f"Model Answer:\n{model_answer_text}\n\n"
                    )

                    # LLM Call - unified prompt builder
                    prompt = RAG_GRADING_PROMPT_TEMPLATE.format(
                        context=context_full,
                        question_text=question_text,
                        guideline_text=guideline_text,
                        student_answer_description=student_answer_description,
                        max_marks=max_marks,
                    )

                    # append images as base64 markers in prompt (if any)
                    if base64_images:
                        prompt += "\n\n---\nStudent images (base64):\n"
                        for i, img_b64 in enumerate(base64_images, start=1):
                            # include only a short marker to avoid extremely long prompts; you can include full base64 if desired
                            marker = f"[Image {i}: data:image/jpeg;base64,{img_b64}]"
                            prompt += marker + "\n"

                    # call LLM depending on provider
                    if self.llm_model == "openai":
                        score, feedback, source = self._call_openai(prompt)
                    elif self.llm_model == "gemini":
                        score, feedback, source = self._call_gemini(prompt)
                    else:
                        score, feedback, source = self._call_claude(prompt)

                    # Save Result
                    try:
                        record = GradingResultRecord(
                            submission_id=submission_id,
                            question_number=question_number,
                            question_id=question_id,
                            student_answer_id=student_answer_id,
                            model_id=self.model_id,
                            score=float(score),
                            max_marks=max_marks,
                            feedback=feedback,
                            answer_source=source,
                            grading_method=GradingMethod.RAG.value,
                            similarity_score=float(sim_score),
                            context_used=context_full
                        )
                        self.result_db.save_result(record)
                        graded_records.append(record)
                        updated = self._update_student_score_feedback(
                            student_answer_id=student_answer_id,
                            score=float(score),
                            feedback=feedback,
                            max_marks=max_marks
                        )
                        if updated:
                            log.info(f"[GRADE] Updated student answer: {student_answer_id} score={score} max_marks={max_marks}")
                        else:
                            log.warning(f"[GRADE] Failed to update student score for: {student_answer_id}")
                    except Exception as e:
                        log.error(f"Error saving grading result for {submission_id}/{question_number}: {e}", exc_info=True)
                        try:
                            self.result_db.rollback()
                        except Exception:
                            pass

            except Exception as e:
                log.error(f"Error grading submission {submission_id}: {e}", exc_info=True)
                try:
                    self.result_db.rollback()
                except Exception:
                    pass

        # commit all saved results once done
        try:
            self.result_db.commit()
        except Exception as e:
            log.error("Error committing grading results: %s", e, exc_info=True)
            try:
                self.result_db.rollback()
            except Exception:
                pass

        # FINAL STEP → SAVE TOTAL MARKS INTO Assessment_Grade
        # ----------------------------------------------------------------------
        self.save_total_marks_to_assessment_grade(
            graded_records=graded_records,
            assessment_id=assessment_id
        )

        return graded_records

    # =======================================================================
    #              SAVE TOTAL MARKS PER SUBMISSION  (NEW FUNCTION)
    # =======================================================================
    def save_total_marks_to_assessment_grade(self, graded_records, assessment_id: str):
        """
        Calculate total marks for each submission and store them in Assessment_Grade.
        """

        # Group scores by submission_id
        submissions = {}
        for r in graded_records:
            if r.submission_id not in submissions:
                submissions[r.submission_id] = {"score": 0.0, "max_marks": 0.0}

            submissions[r.submission_id]["score"] += float(r.score or 0)
            submissions[r.submission_id]["max_marks"] += float(r.max_marks or 0)

        # Save totals to Assessment_Grade
        for submission_id, totals in submissions.items():
            total_score = totals["score"]
            total_max_marks = totals["max_marks"]

            try:
                self.assessment_grade_db.upsert_assessment_grade(
                    submission_id=submission_id,
                    assessment_id=assessment_id,
                    model_id=self.model_id,
                    total_score=total_score,
                    total_max_marks=total_max_marks
                )

                log.info(
                    f"[Assessment Grade] Saved totals for {submission_id}: "
                    f"{total_score}/{total_max_marks}"
                )

            except Exception as e:
                log.error(f"❌ Failed saving Assessment_Grade for {submission_id}: {e}")

    # =======================================================================
    def _call_openai(self, prompt: str):
        """Call OpenAI client. Adapt the call if your installed SDK differs."""
        try:
            # Many OpenAI SDK versions accept a messages list. Here we use a single prompt in messages.
            # ADAPT: If your SDK uses `client.chat.completions.create(...)` or `client.responses.create(...)`,
            # adjust this block accordingly.
            if not self.client:
                raise RuntimeError("OpenAI client not initialized")

            messages = [
                {"role": "system", "content": "You are an expert academic examiner."},
                {"role": "user", "content": prompt},
            ]
            # ADAPT: If your OpenAI client has `chat.completions.create`, use that; else try `responses.create`.
            response = None
            try:
                # new OpenAI python-sdk (openai.OpenAI).chat.completions.create
                response = self.client.chat.completions.create(
                    model=self.chat_model,
                    messages=messages,
                    temperature=self.temperature,
                    max_tokens=800,
                    top_p=1,
                )
                raw = response.choices[0].message.content.strip()
            except Exception:
                # fallback to responses API shape
                response = self.client.responses.create(model=self.chat_model, input=prompt, temperature=self.temperature, max_output_tokens=800)
                # many SDKs: response.output_text or response.output[0].content
                raw = getattr(response, "output_text", None) or \
                      (response.output[0].content[0].text if getattr(response, "output", None) else json.dumps(response))
            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[OpenAI] Error: {e}", exc_info=True)
            return 0.0, "OpenAI grading failed.", "text"

    # =======================================================================
    def _call_gemini(self, prompt: str):
        """Call Gemini (Google) client. ADAPT depending on SDK."""
        try:
            if not self.client:
                raise RuntimeError("Gemini client not initialized")

            # ADAPT: Many versions expect a structure like `client.generate(...)` with `prompt` etc.
            # Here we try a couple of likely call shapes.
            raw = None
            try:
                # try `generate_content` as in your original example
                result = self.client.generate_content([{"text": prompt}])
                raw = result.candidates[0].content.parts[0].text
            except Exception:
                # try `generate` style
                result = self.client.generate(prompt=prompt, max_output_tokens=800)
                # extract text depending on structure
                raw = getattr(result, "text", None) or (result.candidates[0].display if getattr(result, "candidates", None) else str(result))

            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[Gemini] Error: {e}", exc_info=True)
            return 0.0, "Gemini grading failed.", "text"

    # =======================================================================
    def _call_claude(self, prompt: str):
        """Call Anthropic/Claude-style client. ADAPT if needed."""
        try:
            if not self.client:
                raise RuntimeError("Claude/Anthropic client not initialized")

            # many anthopic/claude SDKs use messages.create or completions.create
            try:
                msg = self.client.messages.create(model=self.chat_model, max_tokens_to_sample=800, temperature=self.temperature, messages=[{"role": "user", "content": prompt}])
                raw = msg.content[0].text.strip()
            except Exception:
                # alternative shapes:
                res = self.client.completions.create(model=self.chat_model, prompt=prompt, max_tokens=800, temperature=self.temperature)
                raw = getattr(res, "completion", None) or getattr(res, "text", None) or json.dumps(res)

            return self._parse_json_response(raw)
        except Exception as e:
            log.error(f"[Claude] Error: {e}", exc_info=True)
            return 0.0, "Claude grading failed.", "text"

    # =======================================================================
    def _normalize_embedding(self, embedding):
        """Normalize a variety of embedding return shapes to a python list or None."""
        try:
            if embedding is None:
                return None

            # if it's a list of tuples like [(id, vector)]
            if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], tuple):
                embedding = embedding[0][1]

            # if it's a dict with various field names
            if isinstance(embedding, dict):
                if "embedding" in embedding:
                    embedding = embedding["embedding"]
                elif "vector" in embedding:
                    embedding = embedding["vector"]
                elif "data" in embedding and isinstance(embedding["data"], list) and len(embedding["data"]) > 0:
                    # openai style: {"data":[{"embedding": [...]}, ...]}
                    first = embedding["data"][0]
                    if isinstance(first, dict) and "embedding" in first:
                        embedding = first["embedding"]
                    else:
                        embedding = list(first.values())[0]
                else:
                    # pick first value
                    embedding = list(embedding.values())[0]

            if isinstance(embedding, str):
                # maybe a json string
                embedding = json.loads(embedding)

            if isinstance(embedding, np.ndarray):
                embedding = embedding.tolist()

            # final check: must be list of numbers
            if isinstance(embedding, list):
                return [float(x) for x in embedding]
            return None
        except Exception as e:
            log.warning(f"_normalize_embedding failed: {e}")
            return None

    def _compute_cosine_similarity(self, v1, v2):
        if v1 is None or v2 is None:
            return 0.0
        try:
            dot = np.dot(v1, v2)
            norm = np.linalg.norm(v1) * np.linalg.norm(v2)
            return float(dot / norm) if norm != 0 else 0.0
        except Exception as e:
            log.warning(f"Cosine similarity error: {e}")
            return 0.0

    # =======================================================================
    def _parse_json_response(self, raw: str):
        """
        Attempt to parse the LLM response as JSON. If the LLM returned a fenced code block,
        strip that. We expect keys: score, feedback, answer_source (optional).
        """
        try:
            if raw is None:
                raise ValueError("Empty raw response")

            raw = raw.strip()
            # strip fenced code block(s)
            if raw.startswith("```"):
                parts = raw.split("```")
                # find the first part that looks like JSON
                for part in parts:
                    p = part.strip()
                    if p.startswith("{"):
                        raw = p
                        break
                else:
                    # fallback if no {} block found
                    raw = parts[1] if len(parts) > 1 else raw

            # sometimes the model returns text with leading explanation + JSON at the end; find first '{'
            first_brace = raw.find("{")
            if first_brace != -1:
                raw = raw[first_brace:]

            data = json.loads(raw)
            return (
                float(data.get("score", 0.0)),
                data.get("feedback", "No feedback."),
                data.get("answer_source", data.get("source", "text"))
            )
        except Exception:
            log.warning(f"Invalid JSON returned by LLM. Raw output:\n{raw}")
            return 0.0, "Invalid JSON returned by the LLM.", "text"


# Simple command-line runner for quick testing
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run RAG grading for a list of submissions (IDs).")
    parser.add_argument("--model-id", required=True, help="Evaluation model id (used to fetch config)")
    parser.add_argument("--submission-ids", required=True, help="Comma-separated submission ids to grade")
    parser.add_argument("--model-paper-id", required=True, help="Model answer paper id")
    parser.add_argument("--assessment-id", required=True, help="Assessment id")
    parser.add_argument("--lecturer-id", required=True, help="Lecturer id")
    parser.add_argument("--module-id", required=True, help="Module id")
    parser.add_argument("--top-k", type=int, default=5, help="Top K lecture chunks to retrieve for context")
    parser.add_argument("--question-numbers", type=str, default=None, help="Comma-separated question numbers to grade (all if omitted)")
    args = parser.parse_args()

    submission_ids = [s.strip() for s in args.submission_ids.split(",") if s.strip()]
    grader = RAGGrader(model_id=args.model_id)
    results = grader.grade_submissions_answers(
        submission_ids=submission_ids,
        model_paper_id=args.model_paper_id,
        assessment_id=args.assessment_id,
        lecturer_id=args.lecturer_id,
        module_id=args.module_id,
        top_k=5,
        question_numbers=[qn.strip() for qn in args.question_numbers.split(",")] if args.question_numbers else None
    )

    print(f"Graded {len(results)} answer records.")
    for r in results:
        try:
            print(json.dumps({
                "submission_id": r.submission_id,
                "question_number": r.question_number,
                "student_answer_id": r.student_answer_id,
                "score": r.score,
                "max_marks": r.max_marks,
                "similarity_score": r.similarity_score,
                "answer_source": r.answer_source
            }))
        except Exception:
            print("Unable to print a record (unexpected shape).")
