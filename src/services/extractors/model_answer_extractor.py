import json
import logging
import os
from typing import List, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

from ...models.model_answer_with_media import ModelAnswer
from ...prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

logger = logging.getLogger(__name__)
load_dotenv()


class ModelAnswerExtractor:
    def __init__(self, provider: str):
        """
        Extracts structured model answers using LLMs.
        Automatically loads model, API key, and temperature from .env
        based on the provider name: openai, gemini, or deepseek.
        """

        # Normalize provider name (case-insensitive)
        self.provider = provider.strip().lower()

        # 🔹 Load values dynamically from .env
        if self.provider == "openai":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            self.temperature = float(os.getenv("OPENAI_TEMPERATURE", 0.2))
            self.client = OpenAIClient(api_key=self.api_key)

        elif self.provider == "gemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            self.model = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
            self.temperature = float(os.getenv("GEMINI_TEMPERATURE", 0.2))
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(model_name=self.model)

        elif self.provider == "deepseek":
            # DeepSeek may use OpenAI-compatible endpoints
            self.api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY")
            self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
            self.temperature = float(os.getenv("DEEPSEEK_TEMPERATURE", 0.2))
            self.client = OpenAIClient(api_key=self.api_key)

        else:
            raise ValueError(
                f"Unsupported provider: {provider}. Must be one of 'openai', 'gemini', or 'deepseek'."
            )

        logger.info(
            f"✅ Using provider: {self.provider.capitalize()}, Model: {self.model}, Temp: {self.temperature}"
        )

    # ----------------------------------------------------------
    # 🔹 Extract structured answers from raw text
    # ----------------------------------------------------------
    def extract(self, raw_text: str) -> List[ModelAnswer]:
        """Extract a flat list of ModelAnswer objects from input text."""
        json_obj = self._call_llm(raw_text)
        meta = json_obj.get("metadata", {})
        answers_h = json_obj.get("answers", {})

        return self._flatten(
            answers_h,
        )

    # ----------------------------------------------------------
    # 🔹 Call LLM and parse JSON
    # ----------------------------------------------------------
    def _call_llm(self, raw_text: str) -> dict:
        """Send text + extraction prompt to LLM and return parsed JSON."""

        if self.provider == "openai" or self.provider == "deepseek":
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                max_tokens=4000,
                messages=[
                    {"role": "system", "content": EXTRACT_MODEL_ANSWERS_PROMPT},
                    {"role": "user", "content": raw_text}
                ]
            )
            content = response.choices[0].message.content.strip()

        elif self.provider == "gemini":
            response = self.client.generate_content(
                contents=[{
                    "role": "user",
                    "parts": [f"{EXTRACT_MODEL_ANSWERS_PROMPT}\n\n{raw_text}"]
                }],
                generation_config={"temperature": self.temperature}
            )
            content = response.text.strip()

        # Clean up markdown-style ```json blocks
        if content.startswith("```"):
            content = content.strip("`").replace("json", "").strip()

        print("\n===== LLM RAW RESPONSE START =====\n")
        print(content)
        print("\n===== LLM RAW RESPONSE END =====\n")

        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM output: {e}\nContent was:\n{content}")
            raise

    # ----------------------------------------------------------
    # 🔹 Flatten hierarchical answer structure
    # ----------------------------------------------------------
    def _flatten(
        self,
        nested: dict,
    ) -> List[ModelAnswer]:
        """Flatten nested JSON into a list of ModelAnswer objects."""
        flat: List[ModelAnswer] = []

        def recurse(keys: list[str], node):
            if isinstance(node, dict) and {"question", "answer", "guideline", "marks"}.issubset(node.keys()):
                media_urls = []
                media_summary = {}

                # Handle structured media
                if "media" in node and isinstance(node["media"], list):
                    for m in node["media"]:
                        url = m.get("url") or m.get("media_url")
                        if url:
                            media_urls.append(url)
                            if "summary" in m:
                                media_summary[url] = m["summary"]

                elif "media_urls" in node and isinstance(node["media_urls"], list):
                    media_urls = node["media_urls"]

                flat.append(ModelAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    question_text=node.get("question", "").strip(),
                    answer_text=node.get("answer", "").strip(),
                    guideline_text=node.get("guideline", "").strip(),
                    max_marks=node.get("marks"),
                    media_urls=media_urls,
                    media_summary=media_summary,
                ))
                return

            elif isinstance(node, dict):
                for k, v in node.items():
                    recurse(keys + [k], v)

            else:
                logger.warning("Unexpected node type under %s: %r", "_".join(keys), node)

        for main_q, subtree in nested.items():
            recurse([main_q], subtree)

        return flat
