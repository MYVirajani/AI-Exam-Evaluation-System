import logging
import os
import json
import requests
import re
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

from ..models.student_answer import StudentAnswer
from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

logger = logging.getLogger(__name__)
load_dotenv()


class AnswerExtractor:
    def __init__(
        self,
        selected_provider: str,
        selected_model: str,
        temperature: float = 0.3,
        ollama_base_url: str = "http://localhost:11434",
        request_timeout: int = 600
    ):
        """
        Initialize AnswerExtractor for OpenAI, Gemini, or DeepSeek.
        """
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature
        self.ollama_base_url = ollama_base_url
        self.request_timeout = request_timeout

        if selected_provider == "OpenAI":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.client = OpenAIClient(api_key=self.api_key)

        elif selected_provider == "GoogleGemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(model_name=self.selected_model)

        elif selected_provider == "DeepSeek":
            try:
                response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
                if response.status_code != 200:
                    raise ConnectionError("Ollama server is not responding")
                logger.info("✅ Connected to Ollama server successfully")
            except requests.exceptions.ConnectionError:
                raise ConnectionError(
                    f"Cannot connect to Ollama server at {self.ollama_base_url}. Make sure Ollama is running."
                )
        else:
            raise ValueError(f"Unsupported provider: {selected_provider}")

    # ===================================================================
    # ----------------------- LLM API HANDLERS --------------------------
    # ===================================================================

    def _call_ollama_api(self, messages: List[Dict[str, str]], stream: bool = False) -> str:
        """
        Sends messages to a locally running Ollama instance.
        """
        payload = {
            "model": self.selected_model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": self.temperature,
                "num_ctx": 8192,
                "num_predict": 4000,
                "top_k": 40,
                "top_p": 0.9
            }
        }

        logger.info(f"🧠 Sending request to Ollama with timeout={self.request_timeout}s")

        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/chat",
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=self.request_timeout
            )
            response.raise_for_status()
            data = response.json()
            return data.get("message", {}).get("content", "")

        except Exception as e:
            logger.error(f"❌ Ollama API request failed: {e}")
            raise

    # ===================================================================
    # -------------------- JSON CLEANING HELPERS ------------------------
    # ===================================================================

    def _fix_json_formatting(self, content: str) -> str:
        """Fix common JSON formatting issues in LLM outputs."""
        content = re.sub(r',\s*}', '}', content)
        content = re.sub(r',\s*]', ']', content)
        return content.strip()

    def _manually_fix_deepseek_json(self, content: str) -> str:
        """Try to repair broken JSON for DeepSeek outputs."""
        content = re.sub(r',\s*}', '}', content)
        content = re.sub(r',\s*]', ']', content)
        return content.strip()

    # ===================================================================
    # ------------------- LLM ANSWER EXTRACTION -------------------------
    # ===================================================================

    def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
        """
        Use the selected LLM to extract structured answers and media URLs.
        """
        logger.info(f"🔍 Extracting answers using {self.selected_provider} - {self.selected_model}")

        try:
            # ---- 1️⃣ Send to selected provider ----
            if self.selected_provider == "OpenAI":
                response = self.client.chat.completions.create(
                    model=self.selected_model,
                    messages=[
                        {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
                        {"role": "user", "content": raw_text}
                    ],
                    temperature=self.temperature,
                    max_tokens=4000
                )
                content = response.choices[0].message.content.strip()

            elif self.selected_provider == "GoogleGemini":
                response = self.client.generate_content(
                    contents=[
                        {"role": "user", "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]}
                    ],
                    generation_config={"temperature": self.temperature}
                )
                content = response.text.strip()

            elif self.selected_provider == "DeepSeek":
                messages = [
                    {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
                    {"role": "user", "content": raw_text}
                ]
                content = self._call_ollama_api(messages).strip()

            else:
                raise ValueError(f"Unsupported provider: {self.selected_provider}")

            # ---- 2️⃣ Log & save raw response ----
            os.makedirs("logs/llm_raw_outputs", exist_ok=True)
            with open(f"logs/llm_raw_outputs/raw_{self.selected_provider}.txt", "w", encoding="utf-8") as f:
                f.write(content)

            print("\n" + "=" * 80)
            print(f"🔍 RAW LLM OUTPUT ({self.selected_provider} - {self.selected_model}):")
            print("=" * 80)
            print(content[:5000])
            print("\n" + "=" * 80 + "\n")

            # ---- 3️⃣ Clean JSON ----
            if content.startswith("```"):
                content = content.strip("`").replace("json", "").strip()
            content = self._fix_json_formatting(content)

            # ---- 4️⃣ Parse JSON ----
            structured = json.loads(content)
            metadata = structured.get("metadata", {})
            answers_json = structured.get("answers", {})

        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Extraction failed: {e}")
            return []

        # ---- 5️⃣ Flatten to StudentAnswer list ----
        return self._flatten_structure(
            answers_json,
            metadata.get("student_index"),
            metadata.get("module_code"),
            metadata.get("exam_year"),
            metadata.get("exam_month")
        )

    # ===================================================================
    # ------------------- STRUCTURE FLATTENER ---------------------------
    # ===================================================================

    def _flatten_structure(
        self,
        nested: dict,
        student_index: Optional[str],
        module_code: Optional[str],
        exam_year: Optional[int],
        exam_month: Optional[str]
    ) -> List[StudentAnswer]:
        """
        Convert nested LLM output (answers + media URLs) into flat StudentAnswer objects.
        Handles both nested and sibling media URL structures.
        """
        answers: List[StudentAnswer] = []

        def recurse(keys: List[str], value):
            # Case 1: simple string answer (e.g., "a": "Answer text")
            if isinstance(value, str):
                ans = StudentAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    answer_text=value.strip(),
                    media_urls=[],
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month,
                )
                answers.append(ans)

            # Case 2: dict with "answer_text" + "media_urls"
            elif isinstance(value, dict) and "answer_text" in value:
                ans = StudentAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    answer_text=value.get("answer_text", "").strip(),
                    media_urls=value.get("media_urls", []) or [],
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month,
                )
                answers.append(ans)

            # Case 3: dict with possible sibling media_urls (e.g., "a": "...", "media_urls": [...])
            elif isinstance(value, dict):
                last_answer_before_media = None
                for sub_key, sub_value in value.items():
                    if sub_key == "media_urls" and isinstance(sub_value, list):
                        if answers and answers[-1].full_question_id.startswith("_".join(keys)):
                            answers[-1].media_urls.extend(sub_value)
                    else:
                        recurse(keys + [sub_key], sub_value)

        # Begin recursion
        for main_q, subs in nested.items():
            recurse([main_q], subs)

        return answers

    # ===================================================================
    # ------------------- CONNECTION / UTILITIES ------------------------
    # ===================================================================

    def test_connection(self) -> bool:
        """
        Test connectivity to the selected LLM provider.
        """
        try:
            if self.selected_provider == "DeepSeek":
                test_messages = [{"role": "user", "content": "Respond with 'Connection successful'"}]
                response = self._call_ollama_api(test_messages)
                return "successful" in response.lower()
            return True
        except Exception as e:
            logger.error(f"Connection test failed for {self.selected_provider}: {e}")
            return False

    @property
    def provider_suffix(self) -> str:
        """Return normalized provider name for DB suffix."""
        if self.selected_provider.lower() == "openai":
            return "openai"
        elif "gemini" in self.selected_provider.lower():
            return "gemini"
        elif "deepseek" in self.selected_provider.lower():
            return "deepseek"
        else:
            return "unknown"
