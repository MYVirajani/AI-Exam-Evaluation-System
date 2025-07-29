

import json
import logging
import os
from typing import List, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

from ..models.model_answer import ModelAnswer
from ..prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

logger = logging.getLogger(__name__)
load_dotenv()

class ModelAnswerExtractor:
    def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.2):
        self.provider = selected_provider
        self.model = selected_model
        self.temperature = temperature

        if self.provider == "OpenAI":
            self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
        elif self.provider == "GoogleGemini":
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            self.client = genai.GenerativeModel(
                model_name=self.model,
                system_instruction=EXTRACT_MODEL_ANSWERS_PROMPT,
                generation_config={"temperature": self.temperature}
            )
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")

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

    def _call_llm(self, raw_text: str) -> dict:
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
        else:
            response = self.client.generate_content([raw_text])
            content = response.text.strip()

        if content.startswith("```"):
            content = content.strip("`").replace("json", "").strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM output: {e}")
            raise

    def _flatten(
        self,
        nested: dict,
        module_code: Optional[str],
        exam_year: Optional[int],
        exam_month: Optional[str]
    ) -> List[ModelAnswer]:
        flat: List[ModelAnswer] = []

        def recurse(keys: list[str], node):
            if isinstance(node, dict) and {"question", "answer", "guideline", "marks"}.issubset(node.keys()):
                flat.append(ModelAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    question_text=node["question"].strip(),
                    answer_text=node["answer"].strip(),
                    guideline_text=node.get("guideline", "").strip(),
                    max_marks=node.get("marks"),
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month,
                ))
                return

            if isinstance(node, str):
                flat.append(ModelAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    answer_text=node.strip(),
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month,
                ))
                logger.warning("Leaf '%s' had no question/guideline/marks; stored answer only.", "_".join(keys))
                return

            if isinstance(node, dict):
                for k, v in node.items():
                    recurse(keys + [k], v)
            else:
                logger.warning("Unexpected node type under %s: %r", "_".join(keys), node)

        for main_q, subtree in nested.items():
            recurse([main_q], subtree)

        return flat
