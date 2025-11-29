import json
import logging
import os
from typing import List, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

from src.models.model_answer_with_media import ModelAnswer
from src.prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT
from src.services.database_services.evaluation_model_db import EvaluationModelService


logger = logging.getLogger(__name__)
load_dotenv()


class ModelAnswerExtractor:
    def __init__(self, model_id):
        """
        Extracts structured model answers using LLMs.
        Loads ALL configuration from Evaluation_Model table via get_model_config().
        Only API keys are loaded from .env.
        """

        # Load configuration from DB
        model_service = EvaluationModelService()
        model_config = model_service.get_model_config(model_id)

        if not model_config:
            raise ValueError(f"No model config found for id={model_id}")

        # Core fields
        self.provider = model_config["provider"].lower()
        self.temperature = float(model_config.get("temperature", 0.2))
        self.chat_model = model_config.get("chat_model")  

        # -----------------------------
        # Provider-specific initialization
        # -----------------------------
        if self.provider == "openai":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.model = self.chat_model
            self.client = OpenAIClient(api_key=self.api_key)

        elif self.provider == "gemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.model = self.chat_model
            self.client = genai.GenerativeModel(model_name=self.model)

        elif self.provider == "deepseek":
            self.api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY")
            self.model = self.chat_model
            self.client = OpenAIClient(api_key=self.api_key)

        else:
            raise ValueError(
                f"Unsupported provider: {self.provider}. Must be openai, gemini, or deepseek."
            )

        logger.info(
            f"✅ Loaded Model Config → Provider: {self.provider}, Model: {self.model}, Temp: {self.temperature}"
        )

    # ----------------------------------------------------------
    # Extract structured answers from raw text
    # ----------------------------------------------------------
    def extract(self, raw_text: str) -> List[ModelAnswer]:
        json_obj = self._call_llm(raw_text)
        answers_h = json_obj.get("answers", {})
        return self._flatten(answers_h)

    # ----------------------------------------------------------
    # Call LLM and parse JSON
    # ----------------------------------------------------------
    def _call_llm(self, raw_text: str) -> dict:
        """Send text + extraction prompt to LLM and return parsed JSON."""

        if self.provider in ["openai", "deepseek"]:
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

        # Clean up ```json blocks
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
    # Flatten nested dict → List[ModelAnswer]
    # ----------------------------------------------------------
    def _flatten(self, nested: dict) -> List[ModelAnswer]:
        flat: List[ModelAnswer] = []

        def recurse(keys: list[str], node):
            if isinstance(node, dict) and {"question", "answer", "guideline", "marks"}.issubset(node):
                media_urls = []
                media_summary = {}

                if "media" in node and isinstance(node["media"], list):
                    for m in node["media"]:
                        url = m.get("url") or m.get("media_url")
                        if url:
                            media_urls.append(url)
                            if "summary" in m:
                                media_summary[url] = m["summary"]

                elif "media_urls" in node:
                    media_urls = node.get("media_urls", [])

                flat.append(ModelAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    question_text=node.get("question", "").strip(),
                    answer_text=node.get("answer", "").strip(),
                    guideline_text=node.get("guideline", "").strip(),
                    max_marks=node.get("marks"),
                    question_type=node.get("type"),
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
