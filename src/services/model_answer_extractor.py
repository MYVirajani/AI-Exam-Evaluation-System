# # import logging
# # import json
# # import os
# # import openai
# # import google.generativeai as genai
# # from openai import OpenAI as OpenAIClient
# # from typing import List, Dict
# # from dotenv import load_dotenv
# # from ..models.model_answer import ModelAnswer
# # from ..prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

# # logger = logging.getLogger(__name__)
# # load_dotenv()

# # class ModelAnswerExtractor:
# #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# #         self.selected_provider = selected_provider
# #         self.selected_model = selected_model
# #         self.temperature = temperature

# #         if self.selected_provider == "OpenAI":
# #             self.api_key = os.getenv("OPENAI_API_KEY")
# #             self.client = OpenAIClient(api_key=self.api_key)
# #         elif self.selected_provider == "GoogleGemini":
# #             self.api_key = os.getenv("GOOGLE_API_KEY")
# #             genai.configure(api_key=self.api_key)
# #             self.client = genai.GenerativeModel(
# #                 model_name=self.selected_model,
# #                 system_instruction=EXTRACT_MODEL_ANSWERS_PROMPT,
# #                 generation_config={"temperature": self.temperature}
# #             )
# #         else:
# #             raise ValueError("Unsupported provider")

# #     def extract_model_answers(self, raw_text: str) -> List[ModelAnswer]:
# #         logger.info(f"Extracting model answers with {self.selected_provider} model: {self.selected_model}")
# #         try:
# #             if self.selected_provider == "OpenAI":
# #                 response = self.client.chat.completions.create(
# #                     model=self.selected_model,
# #                     messages=[
# #                         {"role": "system", "content": EXTRACT_MODEL_ANSWERS_PROMPT},
# #                         {"role": "user", "content": raw_text}
# #                     ],
# #                     temperature=self.temperature,
# #                     max_tokens=3000
# #                 )
# #                 content = response.choices[0].message.content.strip()

# #             elif self.selected_provider == "GoogleGemini":
# #                 response = self.client.generate_content([raw_text])
# #                 content = response.text.strip()

# #             else:
# #                 raise ValueError("Unsupported provider")

# #             logger.warning(f"RAW LLM OUTPUT:\n{content}")
# #             structured = json.loads(content)

# #             results = []
# #             for q_id, sub_items in structured.items():
# #                 for sub_id, content_obj in sub_items.items():
# #                     results.append(ModelAnswer(
# #                         question_id=q_id,
# #                         sub_question_id=sub_id,
# #                         answer_text=content_obj.get("answer", "").strip(),
# #                         guideline=content_obj.get("guideline")
# #                     ))
# #             return results

# #         except Exception as e:
# #             logger.error(f"Failed to extract model answers: {e}")
# #             return []
# import logging
# import json
# import os
# import openai
# import google.generativeai as genai
# from openai import OpenAI as OpenAIClient
# from typing import List, Dict
# from dotenv import load_dotenv
# from ..models.model_answer import ModelAnswer
# from ..prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()

# class ModelAnswerExtractor:
#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if self.selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)
#         elif self.selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_MODEL_ANSWERS_PROMPT,
#                 generation_config={"temperature": self.temperature}
#             )
#         else:
#             raise ValueError("Unsupported provider")

#     def extract_model_answers(self, raw_text: str) -> List[ModelAnswer]:
#         logger.info(f"Extracting model answers with {self.selected_provider} model: {self.selected_model}")
#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_MODEL_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=self.temperature,
#                     max_tokens=3000
#                 )
#                 content = response.choices[0].message.content.strip()

#             elif self.selected_provider == "GoogleGemini":
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()

#             else:
#                 raise ValueError("Unsupported provider")

#             logger.warning(f"RAW LLM OUTPUT:\n{content}")

#             # ✅ Remove markdown code fences if present
#             if content.startswith("```json"):
#                 content = content[len("```json"):].strip()
#             if content.startswith("```"):
#                 content = content[len("```"):].strip()
#             if content.endswith("```"):
#                 content = content[:-3].strip()

#             structured = json.loads(content)

#             results = []
#             for q_id, sub_items in structured.items():
#                 for sub_id, content_obj in sub_items.items():
#                     results.append(ModelAnswer(
#                         # question_id=q_id,
#                         # sub_question_id=sub_id,
#                         # answer_text=content_obj.get("answer", "").strip(),
#                         # guideline=content_obj.get("guideline")
#                          question_id=q_id,
#                          sub_question_id=sub_id,
#                          question_text="",  # Placeholder since LLM does not return question_text
#                          answer_text=content_obj.get("answer", "").strip(),
#                          guideline=content_obj.get("guideline")
#                     ))
#             return results

#         except Exception as e:
#             logger.error(f"Failed to extract model answers: {e}")
#             return []


# import json, logging, os
# from typing import List, Optional
# from dotenv import load_dotenv
# from openai import OpenAI as OpenAIClient
# import google.generativeai as genai

# from ..models.model_answer import ModelAnswer
# from ..prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()

# class ModelAnswerExtractor:
#     def __init__(self, provider: str, model: str, temperature: float = 0.2):
#         self.provider, self.model = provider, model
#         self.temperature = temperature

#         if provider == "OpenAI":
#             self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
#         elif provider == "GoogleGemini":
#             genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
#             self.client = genai.GenerativeModel(
#                 model_name=model,
#                 system_instruction=EXTRACT_MODEL_ANSWERS_PROMPT,
#                 generation_config={"temperature": temperature}
#             )
#         else:
#             raise ValueError("Unsupported provider")

#     # ---------- public ----------------------------------------------------
#     def extract(self, raw_text: str) -> List[ModelAnswer]:
#         """Return a *flat* list of ModelAnswer objects."""
#         json_obj = self._call_llm(raw_text)
#         meta      = json_obj.get("metadata", {})
#         answers_h = json_obj.get("answers", {})

#         return self._flatten(
#             answers_h,
#             module_code = meta.get("module_code"),
#             exam_year   = meta.get("exam_year"),
#             exam_month  = meta.get("exam_month")
#         )

#     # ---------- internal --------------------------------------------------
#     def _call_llm(self, raw_text: str) -> dict:
#         if self.provider == "OpenAI":
#             resp = self.client.chat.completions.create(
#                 model      = self.model,
#                 temperature= self.temperature,
#                 max_tokens = 4000,
#                 messages   = [
#                     {"role": "system", "content": EXTRACT_MODEL_ANSWERS_PROMPT},
#                     {"role": "user",   "content": raw_text}
#                 ]
#             )
#             content = resp.choices[0].message.content.strip()
#         else:  # Gemini
#             resp    = self.client.generate_content([raw_text])
#             content = resp.text.strip()

#         if content.startswith("```"):
#             content = content.strip("`").replace("json", "").strip()

#         return json.loads(content)

#     def _flatten(
#         self,
#         nested: dict,
#         module_code: Optional[str],
#         exam_year:   Optional[int],
#         exam_month:  Optional[str]
#     ) -> List[ModelAnswer]:
#         flat: List[ModelAnswer] = []

#         def recurse(keys, node):
#             if isinstance(node, dict) and set(node.keys()) >= {"answer", "guideline", "marks"}:
#                 qa = ModelAnswer(
#                     question_id=keys[0] if len(keys) > 0 else None,
#                     sub_question_id=keys[1] if len(keys) > 1 else None,
#                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
#                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
#                     answer_text=node["answer"].strip(),
#                     guideline_text=node.get("guideline", "").strip(),
#                     max_marks=node.get("marks"),
#                     module_code=module_code,
#                     exam_year=exam_year,
#                     exam_month=exam_month
#                 )
#                 flat.append(qa)
#             else:
#                 for k, v in node.items():
#                     recurse(keys + [k], v)

#         for root_q, subtree in nested.items():
#             recurse([root_q], subtree)

#         return flat

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
    def __init__(self, provider: str, model: str, temperature: float = 0.2):
        self.provider = provider
        self.model = model
        self.temperature = temperature

        if provider == "OpenAI":
            self.client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
        elif provider == "GoogleGemini":
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            self.client = genai.GenerativeModel(
                model_name=model,
                system_instruction=EXTRACT_MODEL_ANSWERS_PROMPT,
                generation_config={"temperature": temperature}
            )
        else:
            raise ValueError("Unsupported provider")

    # ---------- public ----------------------------------------------------
    def extract(self, raw_text: str) -> List[ModelAnswer]:
        """Return a *flat* list of ModelAnswer objects."""
        json_obj = self._call_llm(raw_text)
        meta = json_obj.get("metadata", {})
        answers_h = json_obj.get("answers", {})

        return self._flatten(
            answers_h,
            module_code=meta.get("module_code"),
            exam_year=meta.get("exam_year"),
            exam_month=meta.get("exam_month")
        )

    # ---------- internal --------------------------------------------------
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
        else:  # Gemini
            response = self.client.generate_content([raw_text])
            content = response.text.strip()

        if content.startswith("```"):
            content = content.strip("`").replace("json", "").strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM output: {e}")
            raise

        # ---------- internal --------------------------------------------------
        # ---------- internal --------------------------------------------------
    def _flatten(
        self,
        nested: dict,
        module_code: Optional[str],
        exam_year:   Optional[int],
        exam_month:  Optional[str]
    ) -> List[ModelAnswer]:
        """
        Recursively walk the nested answer tree→return a flat list.
        Handles two kinds of leaves:
          • {question, answer, guideline, marks}
          • plain string (answer only)
        """
        flat: List[ModelAnswer] = []

        def recurse(keys: list[str], node):
            # ---------------------------------- #
            # case 1: complete leaf (dict)       #
            # ---------------------------------- #
            if isinstance(node, dict) and {"question", "answer", "guideline", "marks"}.issubset(node.keys()):
                flat.append(
                    ModelAnswer(
                        # hierarchy
                        question_id             = keys[0] if len(keys) > 0 else None,
                        sub_question_id         = keys[1] if len(keys) > 1 else None,
                        sub_sub_question_id     = keys[2] if len(keys) > 2 else None,
                        sub_sub_sub_question_id = keys[3] if len(keys) > 3 else None,
                        # content
                        question_text  = node["question"].strip(),
                        answer_text    = node["answer"].strip(),
                        guideline_text = node.get("guideline", "").strip(),
                        max_marks      = node.get("marks"),
                        # metadata
                        module_code = module_code,
                        exam_year   = exam_year,
                        exam_month  = exam_month,
                    )
                )
                return

            # ---------------------------------- #
            # case 2: answer is a plain string   #
            # ---------------------------------- #
            if isinstance(node, str):
                flat.append(
                    ModelAnswer(
                        question_id             = keys[0] if len(keys) > 0 else None,
                        sub_question_id         = keys[1] if len(keys) > 1 else None,
                        sub_sub_question_id     = keys[2] if len(keys) > 2 else None,
                        sub_sub_sub_question_id = keys[3] if len(keys) > 3 else None,
                        answer_text   = node.strip(),
                        module_code   = module_code,
                        exam_year     = exam_year,
                        exam_month    = exam_month,
                    )
                )
                logger.warning("Leaf '%s' had no question/guideline/marks; stored answer only.", "_".join(keys))
                return

            # ---------------------------------- #
            # case 3: dict but not a leaf; recurse
            # ---------------------------------- #
            if isinstance(node, dict):
                for k, v in node.items():
                    recurse(keys + [k], v)
            else:
                # Anything else (None, list, int…) is unexpected; log & skip
                logger.warning("Unexpected node type under %s: %r", "_".join(keys), node)

        # kick-off at the top level
        for main_q, subtree in nested.items():
            recurse([main_q], subtree)

        return flat



        for root_q, subtree in nested.items():
            recurse([root_q], subtree)

        return flat
