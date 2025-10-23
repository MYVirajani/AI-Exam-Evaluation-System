import json
import logging
import os
from typing import List, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

from ..models.model_answer_with_media import ModelAnswer
from ..prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

logger = logging.getLogger(__name__)
load_dotenv()


class ModelAnswerExtractor:
    def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.2):
        """
        Extracts structured model answers using LLMs.
        Supports OpenAI, GoogleGemini, and DeepSeek (via OpenAI fallback).
        """
        self.original_provider = selected_provider
        self.provider = selected_provider
        self.model = selected_model
        self.temperature = temperature

        if self.provider == "OpenAI":
            self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))

        elif self.provider == "GoogleGemini":
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            self.client = genai.GenerativeModel(model_name=self.model)

        elif self.provider == "DeepSeek":
            logger.warning(
                "⚠️ DeepSeek does not support model answer extraction. Falling back to OpenAI (gpt-4o-mini)."
            )
            self.provider = "OpenAI"
            self.model = "gpt-4o-mini"
            self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

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
            module_code=meta.get("module_code"),
            exam_year=meta.get("exam_year"),
            exam_month=meta.get("exam_month")
        )

    # ----------------------------------------------------------
    # 🔹 Call LLM and parse JSON
    # ----------------------------------------------------------
    def _call_llm(self, raw_text: str) -> dict:
        """Send text + extraction prompt to LLM and return parsed JSON."""
        if self.provider == "OpenAI":
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

        else:  # GoogleGemini
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

        # Print LLM response for debugging
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
        module_code: Optional[str],
        exam_year: Optional[int],
        exam_month: Optional[str]
    ) -> List[ModelAnswer]:
        """
        Flatten nested JSON into a list of ModelAnswer objects.
        Handles both legacy and structured media formats.
        """
        flat: List[ModelAnswer] = []

        def recurse(keys: list[str], node):
            # ✅ Case 1: Full model answer with optional media
            if isinstance(node, dict) and {"question", "answer", "guideline", "marks"}.issubset(node.keys()):
                media_urls = []
                media_summary = {}

                # Handle structured media objects (preferred format)
                if "media" in node and isinstance(node["media"], list):
                    for m in node["media"]:
                        url = m.get("url") or m.get("media_url")
                        if url:
                            media_urls.append(url)
                            if "summary" in m:
                                media_summary[url] = m["summary"]

                # Handle legacy media_urls list
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
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month
                ))
                return

            # ✅ Case 2: Nested dictionary — recurse deeper
            elif isinstance(node, dict):
                for k, v in node.items():
                    recurse(keys + [k], v)

            # ✅ Case 3: Unexpected type
            else:
                logger.warning("Unexpected node type under %s: %r", "_".join(keys), node)

        # Start recursion for each top-level question
        for main_q, subtree in nested.items():
            recurse([main_q], subtree)

        return flat
