import logging
import os
import json
import requests
import re
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

from src.models.student_answer import StudentAnswer
from src.prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT
from src.services.database_services.evaluation_model_db import EvaluationModelService

logger = logging.getLogger(__name__)
load_dotenv()


class AnswerExtractor:
    def __init__(
        self,
        model_id: str,
        ollama_base_url: str = "http://localhost:11434",
        request_timeout: int = 600,
    ):
        self.model_id = model_id
        self.ollama_base_url = ollama_base_url
        self.request_timeout = request_timeout

        model_service = EvaluationModelService()
        config = model_service.get_model_config(model_id)

        if not config:
            raise ValueError(f"❌ No configuration found for model_id={model_id}")

        self.selected_provider = config["provider"].lower()
        self.selected_model = config["chat_model"]
        self.temperature = float(config.get("temperature", 0.3))

        if self.selected_provider == "openai":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.client = OpenAIClient(api_key=self.api_key)

        elif self.selected_provider == "gemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(model_name=self.selected_model)

        elif self.selected_provider == "deepseek":
            try:
                response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
                response.raise_for_status()
                logger.info("✅ Connected to Ollama server")
            except Exception:
                raise ConnectionError(f"Cannot connect to Ollama at {self.ollama_base_url}")
        else:
            raise ValueError(f"❌ Unsupported provider '{self.selected_provider}'")

        logger.info(
            f"🔧 AnswerExtractor initialized: provider={self.selected_provider}, "
            f"model={self.selected_model}, temp={self.temperature}"
        )

    # ===================================================================
    # OLLAMA API
    # ===================================================================

    def _call_ollama_api(self, messages: List[Dict[str, str]], stream=False) -> str:
        payload = {
            "model": self.selected_model,
            "messages": messages,
            "stream": stream,
            "options": {"temperature": self.temperature, "num_ctx": 8192},
        }
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=self.request_timeout,
            )
            response.raise_for_status()
            return response.json().get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"❌ Ollama request failed: {e}")
            raise

    # ===================================================================
    # JSON CLEANERS
    # ===================================================================

    def _clean_llm_output(self, content: str) -> str:
        """Extracts only the JSON part and removes markdown."""
        content = content.strip()

        content = re.sub(r"```json|```", "", content, flags=re.IGNORECASE)
        match = re.search(r"\{[\s\S]*\}", content)
        return match.group(0) if match else content

    def _escape_backslashes(self, text: str) -> str:
        """
        Fix invalid JSON escape sequences such as \h, \e, \b from LaTeX.
        Ensures all LaTeX backslashes are JSON-safe.
        """

        # FIX 1 → Invalid sequences: \hline, \end, \begin
        text = re.sub(r'\\(?=[A-Za-z])', r'\\\\', text)

        # FIX 2 → Triple backslash (\\\hline) → (\\\\hline)
        text = re.sub(r'\\\\\\(?=[A-Za-z])', r'\\\\\\\\', text)

        # FIX 3 → Ensure we don't over-escape:
        text = text.replace("\\\\\\\\", "\\\\")

        return text

    def _force_valid_json(self, content: str) -> str:
        content = re.sub(r",\s*}", "}", content)
        content = re.sub(r",\s*]", "]", content)
        return content.strip()

    def _load_json_strict(self, content: str) -> Optional[dict]:
        try:
            return json.loads(content)
        except Exception as e:
            logger.error(f"❌ JSON LOAD ERROR: {e}\n---- RAW JSON ----\n{content}\n")
            print(f"\n❌ JSON LOAD ERROR:\n{e}\nRAW:\n{content}\n")
            return None

    # ===================================================================
    # MAIN EXTRACTION FUNCTION
    # ===================================================================

    def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
        logger.info(f"🔍 Extracting with {self.selected_provider} → {self.selected_model}")

        try:
            # -----------------------------
            # OPENAI
            # -----------------------------
            if self.selected_provider == "openai":
                response = self.client.chat.completions.create(
                    model=self.selected_model,
                    messages=[
                        {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
                        {"role": "user", "content": raw_text},
                    ],
                    temperature=self.temperature,
                    max_tokens=4000,
                )
                content = response.choices[0].message.content.strip()

            # -----------------------------
            # GEMINI
            # -----------------------------
            elif self.selected_provider == "gemini":
                response = self.client.generate_content(
                    contents=[{"role": "user", "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n{raw_text}"]}],
                    generation_config={"temperature": self.temperature},
                )
                content = response.text.strip()

            # -----------------------------
            # OLLAMA / DeepSeek
            # -----------------------------
            else:
                messages = [
                    {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
                    {"role": "user", "content": raw_text},
                ]
                content = self._call_ollama_api(messages).strip()

            print("\n🟦 RAW LLM RESPONSE:\n", content, "\n")
            logger.info(f"\n🟦 RAW LLM RESPONSE:\n{content}\n")

            # -----------------------------
            # CLEAN + SANITIZE
            # -----------------------------
            content = self._clean_llm_output(content)
            content = self._escape_backslashes(content)
            content = self._force_valid_json(content)

            structured = self._load_json_strict(content)
            if not structured:
                logger.error("❌ Final JSON failed. Returning empty list.")
                return []

            answers_dict = structured.get("answers", {})

        except Exception as e:
            logger.error(f"❌ Extraction error: {e}")
            return []

        return self._flatten_structure(answers_dict)

    # ===================================================================
    # FLATTEN JSON → StudentAnswer
    # ===================================================================

    def _flatten_structure(self, nested: dict) -> List[StudentAnswer]:
        answers = []

        def recurse(path, value):
            if isinstance(value, str):
                answers.append(
                    StudentAnswer(
                        question_id=path[0] if len(path) > 0 else None,
                        sub_question_id=path[1] if len(path) > 1 else None,
                        sub_sub_question_id=path[2] if len(path) > 2 else None,
                        sub_sub_sub_question_id=path[3] if len(path) > 3 else None,
                        answer_text=value.strip(),
                        media_urls=[],
                    )
                )

            elif isinstance(value, dict):
                if "answer_text" in value:
                    answers.append(
                        StudentAnswer(
                            question_id=path[0] if len(path) > 0 else None,
                            sub_question_id=path[1] if len(path) > 1 else None,
                            sub_sub_question_id=path[2] if len(path) > 2 else None,
                            sub_sub_sub_question_id=path[3] if len(path) > 3 else None,
                            answer_text=value.get("answer_text", "").strip(),
                            media_urls=value.get("media_urls", []),
                        )
                    )
                else:
                    for k, v in value.items():
                        recurse(path + [k], v)

        for key, value in nested.items():
            recurse([key], value)

        return answers
