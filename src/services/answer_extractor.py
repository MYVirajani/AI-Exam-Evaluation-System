

import logging
import os
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
# import google.generativeai as genai

from ..models.student_answer import StudentAnswer
from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

logger = logging.getLogger(__name__)
load_dotenv()

class AnswerExtractor:
    def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature

        if selected_provider == "OpenAI":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.client = OpenAIClient(api_key=self.api_key)
        elif selected_provider == "GoogleGemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(
                model_name=self.selected_model,
                system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
                generation_config={"temperature": temperature}
            )
        else:
            raise ValueError("Unsupported provider")

    def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
        logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

        try:
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
            else:
                response = self.client.generate_content([raw_text])
                content = response.text.strip()

            if content.startswith("```"):
                content = content.strip("`").replace("json", "").strip()

            structured = json.loads(content)

            metadata = structured.get("metadata", {})
            answers_json = structured.get("answers", {})

        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return []

        return self._flatten_structure(
            answers_json,
            metadata.get("student_index"),
            metadata.get("module_code"),
            metadata.get("exam_year"),
            metadata.get("exam_month")
        )

    def _flatten_structure(
        self,
        nested: dict,
        student_index: Optional[str],
        module_code: Optional[str],
        exam_year: Optional[int],
        exam_month: Optional[int]
    ) -> List[StudentAnswer]:
        answers = []

        def recurse(keys: List[str], value):
            if isinstance(value, str):
                answer = StudentAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    answer_text=value.strip(),
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month
                )
                answers.append(answer)
            elif isinstance(value, dict):
                for sub_key, sub_value in value.items():
                    recurse(keys + [sub_key], sub_value)

        for main_q, subs in nested.items():
            recurse([main_q], subs)

        return answers


# # import logging
# # import os
# # import json
# # from typing import List, Dict, Optional
# # from dotenv import load_dotenv

# # from openai import OpenAI as OpenAIClient  # Only causes issue if openai is not installed

# # from ..models.student_answer import StudentAnswer
# # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # logger = logging.getLogger(__name__)
# # load_dotenv()


# # class AnswerExtractor:
# #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# #         self.selected_provider = selected_provider
# #         self.selected_model = selected_model
# #         self.temperature = temperature

# #         if selected_provider == "OpenAI":
# #             self.api_key = os.getenv("OPENAI_API_KEY")
# #             self.client = OpenAIClient(api_key=self.api_key)

# #         elif selected_provider == "GoogleGemini":
# #             # ✅ Import Gemini only if needed
# #             import google.generativeai as genai

# #             self.api_key = os.getenv("GOOGLE_API_KEY")
# #             genai.configure(api_key=self.api_key)

# #             self.client = genai.GenerativeModel(
# #                 model_name=self.selected_model,
# #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# #                 generation_config={"temperature": temperature}
# #             )

# #         else:
# #             raise ValueError(f"Unsupported provider: {selected_provider}")

# #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# #         try:
# #             if self.selected_provider == "OpenAI":
# #                 response = self.client.chat.completions.create(
# #                     model=self.selected_model,
# #                     messages=[
# #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# #                         {"role": "user", "content": raw_text}
# #                     ],
# #                     temperature=self.temperature,
# #                     max_tokens=4000
# #                 )
# #                 content = response.choices[0].message.content.strip()
# #             else:
# #                 response = self.client.generate_content([raw_text])
# #                 content = response.text.strip()

# #             if content.startswith("```"):
# #                 content = content.strip("`").replace("json", "").strip()

# #             structured = json.loads(content)
# #             metadata = structured.get("metadata", {})
# #             answers_json = structured.get("answers", {})

# #         except Exception as e:
# #             logger.error(f"LLM extraction failed: {e}")
# #             return []

# #         return self._flatten_structure(
# #             answers_json,
# #             metadata.get("student_index"),
# #             metadata.get("module_code"),
# #             metadata.get("exam_year"),
# #             metadata.get("exam_month")
# #         )

# #     def _flatten_structure(
# #         self,
# #         nested: dict,
# #         student_index: Optional[str],
# #         module_code: Optional[str],
# #         exam_year: Optional[int],
# #         exam_month: Optional[int]
# #     ) -> List[StudentAnswer]:
# #         answers = []

# #         def recurse(keys: List[str], value):
# #             if isinstance(value, str):
# #                 answer = StudentAnswer(
# #                     question_id=keys[0] if len(keys) > 0 else None,
# #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# #                     answer_text=value.strip(),
# #                     student_index=student_index,
# #                     module_code=module_code,
# #                     exam_year=exam_year,
# #                     exam_month=exam_month
# #                 )
# #                 answers.append(answer)
# #             elif isinstance(value, dict):
# #                 for sub_key, sub_value in value.items():
# #                     recurse(keys + [sub_key], sub_value)

# #         for main_q, subs in nested.items():
# #             recurse([main_q], subs)

# #         return answers


# import logging
# import os
# import json
# from typing import List, Dict, Optional
# from dotenv import load_dotenv

# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()


# class AnswerExtractor:
#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if selected_provider == "OpenAI":
#             # ✅ Import OpenAI client only if needed
#             from openai import OpenAI as OpenAIClient
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)

#         elif selected_provider == "GoogleGemini":
#             # ✅ Import Gemini only if needed
#             import google.generativeai as genai
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                 generation_config={"temperature": temperature}
#             )

#         else:
#             raise ValueError(f"Unsupported provider: {selected_provider}")

#     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=self.temperature,
#                     max_tokens=4000
#                 )
#                 content = response.choices[0].message.content.strip()
#             else:
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()

#             if content.startswith("```"):
#                 content = content.strip("`").replace("json", "").strip()

#             structured = json.loads(content)
#             metadata = structured.get("metadata", {})
#             answers_json = structured.get("answers", {})

#         except Exception as e:
#             logger.error(f"LLM extraction failed: {e}")
#             return []

#         return self._flatten_structure(
#             answers_json,
#             metadata.get("student_index"),
#             metadata.get("module_code"),
#             metadata.get("exam_year"),
#             metadata.get("exam_month")
#         )

#     def _flatten_structure(
#         self,
#         nested: dict,
#         student_index: Optional[str],
#         module_code: Optional[str],
#         exam_year: Optional[int],
#         exam_month: Optional[int]
#     ) -> List[StudentAnswer]:
#         answers = []

#         def recurse(keys: List[str], value):
#             if isinstance(value, str):
#                 answer = StudentAnswer(
#                     question_id=keys[0] if len(keys) > 0 else None,
#                     sub_question_id=keys[1] if len(keys) > 1 else None,
#                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
#                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
#                     answer_text=value.strip(),
#                     student_index=student_index,
#                     module_code=module_code,
#                     exam_year=exam_year,
#                     exam_month=exam_month
#                 )
#                 answers.append(answer)
#             elif isinstance(value, dict):
#                 for sub_key, sub_value in value.items():
#                     recurse(keys + [sub_key], sub_value)

#         for main_q, subs in nested.items():
#             recurse([main_q], subs)

#         return answers

# import logging
# import os
# import json
# from typing import List, Dict, Optional
# from dotenv import load_dotenv

# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()


# class AnswerExtractor:
#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if selected_provider == "OpenAI":
#             try:
#                 from openai import OpenAI as OpenAIClient
#                 self.api_key = os.getenv("OPENAI_API_KEY")
#                 self.client = OpenAIClient(api_key=self.api_key)
#             except ImportError:
#                 raise ImportError("OpenAI SDK is not installed. Please install `openai` package in this environment.")

#         elif selected_provider == "GoogleGemini":
#             try:
#                 import google.generativeai as genai
#                 self.api_key = os.getenv("GOOGLE_API_KEY")
#                 genai.configure(api_key=self.api_key)
#                 self.client = genai.GenerativeModel(
#                     model_name=self.selected_model,
#                     system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                     generation_config={"temperature": temperature}
#                 )
#             except ImportError:
#                 raise ImportError("Google Gemini SDK is not installed. Please install `google-generativeai` package in this environment.")

#         else:
#             raise ValueError(f"Unsupported provider: {selected_provider}")

#     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=self.temperature,
#                     max_tokens=4000
#                 )
#                 content = response.choices[0].message.content.strip()

#             elif self.selected_provider == "GoogleGemini":
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()
#             else:
#                 raise ValueError("Unsupported provider during LLM extraction")

#             # Clean markdown-style response if present
#             if content.startswith("```"):
#                 content = content.strip("`").replace("json", "").strip()

#             structured = json.loads(content)
#             metadata = structured.get("metadata", {})
#             answers_json = structured.get("answers", {})

#         except Exception as e:
#             logger.error(f"LLM extraction failed: {e}")
#             return []

#         return self._flatten_structure(
#             answers_json,
#             metadata.get("student_index"),
#             metadata.get("module_code"),
#             metadata.get("exam_year"),
#             metadata.get("exam_month")
#         )

#     def _flatten_structure(
#         self,
#         nested: dict,
#         student_index: Optional[str],
#         module_code: Optional[str],
#         exam_year: Optional[int],
#         exam_month: Optional[int]
#     ) -> List[StudentAnswer]:
#         answers = []

#         def recurse(keys: List[str], value):
#             if isinstance(value, str):
#                 answers.append(StudentAnswer(
#                     question_id=keys[0] if len(keys) > 0 else None,
#                     sub_question_id=keys[1] if len(keys) > 1 else None,
#                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
#                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
#                     answer_text=value.strip(),
#                     student_index=student_index,
#                     module_code=module_code,
#                     exam_year=exam_year,
#                     exam_month=exam_month
#                 ))
#             elif isinstance(value, dict):
#                 for sub_key, sub_value in value.items():
#                     recurse(keys + [sub_key], sub_value)

#         for main_q, subs in nested.items():
#             recurse([main_q], subs)

#         return answers
