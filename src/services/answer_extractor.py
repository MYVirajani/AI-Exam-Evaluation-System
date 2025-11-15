

# # # # # # # # # # # import logging
# # # # # # # # # # # import os
# # # # # # # # # # # import json
# # # # # # # # # # # from typing import List, Dict, Optional
# # # # # # # # # # # from dotenv import load_dotenv
# # # # # # # # # # # from openai import OpenAI as OpenAIClient
# # # # # # # # # # # import google.generativeai as genai

# # # # # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # # # # load_dotenv()

# # # # # # # # # # # class AnswerExtractor:
# # # # # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # # # # # #         self.selected_provider = selected_provider
# # # # # # # # # # #         self.selected_model = selected_model
# # # # # # # # # # #         self.temperature = temperature

# # # # # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # # # # #             self.client = OpenAIClient(api_key=self.api_key)
# # # # # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # # # # #             genai.configure(api_key=self.api_key)
# # # # # # # # # # #             self.client = genai.GenerativeModel(
# # # # # # # # # # #                 model_name=self.selected_model,
# # # # # # # # # # #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # # # # # # # # # #                 generation_config={"temperature": temperature}
# # # # # # # # # # #             )
# # # # # # # # # # #         else:
# # # # # # # # # # #             raise ValueError("Unsupported provider")

# # # # # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # # # # #         try:
# # # # # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # # # # #                     model=self.selected_model,
# # # # # # # # # # #                     messages=[
# # # # # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # # # # #                     ],
# # # # # # # # # # #                     temperature=self.temperature,
# # # # # # # # # # #                     max_tokens=4000
# # # # # # # # # # #                 )
# # # # # # # # # # #                 content = response.choices[0].message.content.strip()
# # # # # # # # # # #             else:
# # # # # # # # # # #                 response = self.client.generate_content([raw_text])
# # # # # # # # # # #                 content = response.text.strip()

# # # # # # # # # # #             if content.startswith("```"):
# # # # # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # # # # #             structured = json.loads(content)

# # # # # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # # # # #         except Exception as e:
# # # # # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # # # # #             return []

# # # # # # # # # # #         return self._flatten_structure(
# # # # # # # # # # #             answers_json,
# # # # # # # # # # #             metadata.get("student_index"),
# # # # # # # # # # #             metadata.get("module_code"),
# # # # # # # # # # #             metadata.get("exam_year"),
# # # # # # # # # # #             metadata.get("exam_month")
# # # # # # # # # # #         )

# # # # # # # # # # #     def _flatten_structure(
# # # # # # # # # # #         self,
# # # # # # # # # # #         nested: dict,
# # # # # # # # # # #         student_index: Optional[str],
# # # # # # # # # # #         module_code: Optional[str],
# # # # # # # # # # #         exam_year: Optional[int],
# # # # # # # # # # #         exam_month: Optional[int]
# # # # # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # # # # #         answers = []

# # # # # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # # # # #             if isinstance(value, str):
# # # # # # # # # # #                 answer = StudentAnswer(
# # # # # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # # # # #                     answer_text=value.strip(),
# # # # # # # # # # #                     student_index=student_index,
# # # # # # # # # # #                     module_code=module_code,
# # # # # # # # # # #                     exam_year=exam_year,
# # # # # # # # # # #                     exam_month=exam_month
# # # # # # # # # # #                 )
# # # # # # # # # # #                 answers.append(answer)
# # # # # # # # # # #             elif isinstance(value, dict):
# # # # # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # # # # #         for main_q, subs in nested.items():
# # # # # # # # # # #             recurse([main_q], subs)

# # # # # # # # # # #         return answers


# # # # # # # # # # # # # import logging
# # # # # # # # # # # # # import os
# # # # # # # # # # # # # import json
# # # # # # # # # # # # # from typing import List, Dict, Optional
# # # # # # # # # # # # # from dotenv import load_dotenv

# # # # # # # # # # # # # from openai import OpenAI as OpenAIClient  # Only causes issue if openai is not installed

# # # # # # # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # # # # # # load_dotenv()


# # # # # # # # # # # # # class AnswerExtractor:
# # # # # # # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # # # # # # # #         self.selected_provider = selected_provider
# # # # # # # # # # # # #         self.selected_model = selected_model
# # # # # # # # # # # # #         self.temperature = temperature

# # # # # # # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # # # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # # # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # # # # # # #             # ✅ Import Gemini only if needed
# # # # # # # # # # # # #             import google.generativeai as genai

# # # # # # # # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # # # # # # #             genai.configure(api_key=self.api_key)

# # # # # # # # # # # # #             self.client = genai.GenerativeModel(
# # # # # # # # # # # # #                 model_name=self.selected_model,
# # # # # # # # # # # # #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # # # # # # # # # # # #                 generation_config={"temperature": temperature}
# # # # # # # # # # # # #             )

# # # # # # # # # # # # #         else:
# # # # # # # # # # # # #             raise ValueError(f"Unsupported provider: {selected_provider}")

# # # # # # # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # # # # # # #         try:
# # # # # # # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # # # # # # #                     model=self.selected_model,
# # # # # # # # # # # # #                     messages=[
# # # # # # # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # # # # # # #                     ],
# # # # # # # # # # # # #                     temperature=self.temperature,
# # # # # # # # # # # # #                     max_tokens=4000
# # # # # # # # # # # # #                 )
# # # # # # # # # # # # #                 content = response.choices[0].message.content.strip()
# # # # # # # # # # # # #             else:
# # # # # # # # # # # # #                 response = self.client.generate_content([raw_text])
# # # # # # # # # # # # #                 content = response.text.strip()

# # # # # # # # # # # # #             if content.startswith("```"):
# # # # # # # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # # # # # # #             structured = json.loads(content)
# # # # # # # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # # # # # # #         except Exception as e:
# # # # # # # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # # # # # # #             return []

# # # # # # # # # # # # #         return self._flatten_structure(
# # # # # # # # # # # # #             answers_json,
# # # # # # # # # # # # #             metadata.get("student_index"),
# # # # # # # # # # # # #             metadata.get("module_code"),
# # # # # # # # # # # # #             metadata.get("exam_year"),
# # # # # # # # # # # # #             metadata.get("exam_month")
# # # # # # # # # # # # #         )

# # # # # # # # # # # # #     def _flatten_structure(
# # # # # # # # # # # # #         self,
# # # # # # # # # # # # #         nested: dict,
# # # # # # # # # # # # #         student_index: Optional[str],
# # # # # # # # # # # # #         module_code: Optional[str],
# # # # # # # # # # # # #         exam_year: Optional[int],
# # # # # # # # # # # # #         exam_month: Optional[int]
# # # # # # # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # # # # # # #         answers = []

# # # # # # # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # # # # # # #             if isinstance(value, str):
# # # # # # # # # # # # #                 answer = StudentAnswer(
# # # # # # # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # # # # # # #                     answer_text=value.strip(),
# # # # # # # # # # # # #                     student_index=student_index,
# # # # # # # # # # # # #                     module_code=module_code,
# # # # # # # # # # # # #                     exam_year=exam_year,
# # # # # # # # # # # # #                     exam_month=exam_month
# # # # # # # # # # # # #                 )
# # # # # # # # # # # # #                 answers.append(answer)
# # # # # # # # # # # # #             elif isinstance(value, dict):
# # # # # # # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # # # # # # #         for main_q, subs in nested.items():
# # # # # # # # # # # # #             recurse([main_q], subs)

# # # # # # # # # # # # #         return answers


# # # # # # # # # # # # import logging
# # # # # # # # # # # # import os
# # # # # # # # # # # # import json
# # # # # # # # # # # # from typing import List, Dict, Optional
# # # # # # # # # # # # from dotenv import load_dotenv

# # # # # # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # # # # # load_dotenv()


# # # # # # # # # # # # class AnswerExtractor:
# # # # # # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # # # # # # #         self.selected_provider = selected_provider
# # # # # # # # # # # #         self.selected_model = selected_model
# # # # # # # # # # # #         self.temperature = temperature

# # # # # # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # # # # # #             # ✅ Import OpenAI client only if needed
# # # # # # # # # # # #             from openai import OpenAI as OpenAIClient
# # # # # # # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # # # # # #             # ✅ Import Gemini only if needed
# # # # # # # # # # # #             import google.generativeai as genai
# # # # # # # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # # # # # #             genai.configure(api_key=self.api_key)
# # # # # # # # # # # #             self.client = genai.GenerativeModel(
# # # # # # # # # # # #                 model_name=self.selected_model,
# # # # # # # # # # # #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # # # # # # # # # # #                 generation_config={"temperature": temperature}
# # # # # # # # # # # #             )

# # # # # # # # # # # #         else:
# # # # # # # # # # # #             raise ValueError(f"Unsupported provider: {selected_provider}")

# # # # # # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # # # # # #         try:
# # # # # # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # # # # # #                     model=self.selected_model,
# # # # # # # # # # # #                     messages=[
# # # # # # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # # # # # #                     ],
# # # # # # # # # # # #                     temperature=self.temperature,
# # # # # # # # # # # #                     max_tokens=4000
# # # # # # # # # # # #                 )
# # # # # # # # # # # #                 content = response.choices[0].message.content.strip()
# # # # # # # # # # # #             else:
# # # # # # # # # # # #                 response = self.client.generate_content([raw_text])
# # # # # # # # # # # #                 content = response.text.strip()

# # # # # # # # # # # #             if content.startswith("```"):
# # # # # # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # # # # # #             structured = json.loads(content)
# # # # # # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # # # # # #         except Exception as e:
# # # # # # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # # # # # #             return []

# # # # # # # # # # # #         return self._flatten_structure(
# # # # # # # # # # # #             answers_json,
# # # # # # # # # # # #             metadata.get("student_index"),
# # # # # # # # # # # #             metadata.get("module_code"),
# # # # # # # # # # # #             metadata.get("exam_year"),
# # # # # # # # # # # #             metadata.get("exam_month")
# # # # # # # # # # # #         )

# # # # # # # # # # # #     def _flatten_structure(
# # # # # # # # # # # #         self,
# # # # # # # # # # # #         nested: dict,
# # # # # # # # # # # #         student_index: Optional[str],
# # # # # # # # # # # #         module_code: Optional[str],
# # # # # # # # # # # #         exam_year: Optional[int],
# # # # # # # # # # # #         exam_month: Optional[int]
# # # # # # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # # # # # #         answers = []

# # # # # # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # # # # # #             if isinstance(value, str):
# # # # # # # # # # # #                 answer = StudentAnswer(
# # # # # # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # # # # # #                     answer_text=value.strip(),
# # # # # # # # # # # #                     student_index=student_index,
# # # # # # # # # # # #                     module_code=module_code,
# # # # # # # # # # # #                     exam_year=exam_year,
# # # # # # # # # # # #                     exam_month=exam_month
# # # # # # # # # # # #                 )
# # # # # # # # # # # #                 answers.append(answer)
# # # # # # # # # # # #             elif isinstance(value, dict):
# # # # # # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # # # # # #         for main_q, subs in nested.items():
# # # # # # # # # # # #             recurse([main_q], subs)

# # # # # # # # # # # #         return answers

# # # # # # # # # # import logging
# # # # # # # # # # import os
# # # # # # # # # # import json
# # # # # # # # # # from typing import List, Dict, Optional
# # # # # # # # # # from dotenv import load_dotenv

# # # # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # # # load_dotenv()


# # # # # # # # # # class AnswerExtractor:
# # # # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # # # # #         self.selected_provider = selected_provider
# # # # # # # # # #         self.selected_model = selected_model
# # # # # # # # # #         self.temperature = temperature

# # # # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # # # #             try:
# # # # # # # # # #                 from openai import OpenAI as OpenAIClient
# # # # # # # # # #                 self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # # # #                 self.client = OpenAIClient(api_key=self.api_key)
# # # # # # # # # #             except ImportError:
# # # # # # # # # #                 raise ImportError("OpenAI SDK is not installed. Please install `openai` package in this environment.")

# # # # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # # # #             try:
# # # # # # # # # #                 import google.generativeai as genai
# # # # # # # # # #                 self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # # # #                 genai.configure(api_key=self.api_key)
# # # # # # # # # #                 self.client = genai.GenerativeModel(
# # # # # # # # # #                     model_name=self.selected_model,
# # # # # # # # # #                     system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # # # # # # # # #                     generation_config={"temperature": temperature}
# # # # # # # # # #                 )
# # # # # # # # # #             except ImportError:
# # # # # # # # # #                 raise ImportError("Google Gemini SDK is not installed. Please install `google-generativeai` package in this environment.")

# # # # # # # # # #         else:
# # # # # # # # # #             raise ValueError(f"Unsupported provider: {selected_provider}")

# # # # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # # # #         try:
# # # # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # # # #                     model=self.selected_model,
# # # # # # # # # #                     messages=[
# # # # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # # # #                     ],
# # # # # # # # # #                     temperature=self.temperature,
# # # # # # # # # #                     max_tokens=4000
# # # # # # # # # #                 )
# # # # # # # # # #                 content = response.choices[0].message.content.strip()

# # # # # # # # # #             elif self.selected_provider == "GoogleGemini":
# # # # # # # # # #                 response = self.client.generate_content([raw_text])
# # # # # # # # # #                 content = response.text.strip()
# # # # # # # # # #             else:
# # # # # # # # # #                 raise ValueError("Unsupported provider during LLM extraction")

# # # # # # # # # #             # Clean markdown-style response if present
# # # # # # # # # #             if content.startswith("```"):
# # # # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # # # #             structured = json.loads(content)
# # # # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # # # #         except Exception as e:
# # # # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # # # #             return []

# # # # # # # # # #         return self._flatten_structure(
# # # # # # # # # #             answers_json,
# # # # # # # # # #             metadata.get("student_index"),
# # # # # # # # # #             metadata.get("module_code"),
# # # # # # # # # #             metadata.get("exam_year"),
# # # # # # # # # #             metadata.get("exam_month")
# # # # # # # # # #         )

# # # # # # # # # #     def _flatten_structure(
# # # # # # # # # #         self,
# # # # # # # # # #         nested: dict,
# # # # # # # # # #         student_index: Optional[str],
# # # # # # # # # #         module_code: Optional[str],
# # # # # # # # # #         exam_year: Optional[int],
# # # # # # # # # #         exam_month: Optional[int]
# # # # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # # # #         answers = []

# # # # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # # # #             if isinstance(value, str):
# # # # # # # # # #                 answers.append(StudentAnswer(
# # # # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # # # #                     answer_text=value.strip(),
# # # # # # # # # #                     student_index=student_index,
# # # # # # # # # #                     module_code=module_code,
# # # # # # # # # #                     exam_year=exam_year,
# # # # # # # # # #                     exam_month=exam_month
# # # # # # # # # #                 ))
# # # # # # # # # #             elif isinstance(value, dict):
# # # # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # # # #         for main_q, subs in nested.items():
# # # # # # # # # #             recurse([main_q], subs)

# # # # # # # # # #         return answers


# # # # # # # # # # # import logging
# # # # # # # # # # # import os
# # # # # # # # # # # import json
# # # # # # # # # # # from typing import List, Dict, Optional
# # # # # # # # # # # from dotenv import load_dotenv
# # # # # # # # # # # from openai import OpenAI as OpenAIClient
# # # # # # # # # # # import google.generativeai as genai

# # # # # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # # # # load_dotenv()

# # # # # # # # # # # class AnswerExtractor:
# # # # # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0):
# # # # # # # # # # #         self.selected_provider = selected_provider
# # # # # # # # # # #         self.selected_model = selected_model
# # # # # # # # # # #         self.temperature = temperature

# # # # # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # # # # #             genai.configure(api_key=self.api_key)
# # # # # # # # # # #             self.client = genai.GenerativeModel(
# # # # # # # # # # #                 model_name=self.selected_model
# # # # # # # # # # #             )

# # # # # # # # # # #         else:
# # # # # # # # # # #             raise ValueError("Unsupported provider")

# # # # # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # # # # #         try:
# # # # # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # # # # #                     model=self.selected_model,
# # # # # # # # # # #                     messages=[
# # # # # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # # # # #                     ],
# # # # # # # # # # #                     temperature=self.temperature,
# # # # # # # # # # #                     max_tokens=4000
# # # # # # # # # # #                 )
# # # # # # # # # # #                 content = response.choices[0].message.content.strip()

# # # # # # # # # # #             else:  # GoogleGemini
# # # # # # # # # # #                 response = self.client.generate_content(
# # # # # # # # # # #                     contents=[
# # # # # # # # # # #                         {
# # # # # # # # # # #                             "role": "user",
# # # # # # # # # # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # # # # # # # # # #                         }
# # # # # # # # # # #                     ],
# # # # # # # # # # #                     generation_config={"temperature": self.temperature}
# # # # # # # # # # #                 )
# # # # # # # # # # #                 content = response.text.strip()

# # # # # # # # # # #             if content.startswith("```"):
# # # # # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # # # # #             structured = json.loads(content)

# # # # # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # # # # #         except Exception as e:
# # # # # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # # # # #             return []

# # # # # # # # # # #         return self._flatten_structure(
# # # # # # # # # # #             answers_json,
# # # # # # # # # # #             metadata.get("student_index"),
# # # # # # # # # # #             metadata.get("module_code"),
# # # # # # # # # # #             metadata.get("exam_year"),
# # # # # # # # # # #             metadata.get("exam_month")
# # # # # # # # # # #         )

# # # # # # # # # # #     def _flatten_structure(
# # # # # # # # # # #         self,
# # # # # # # # # # #         nested: dict,
# # # # # # # # # # #         student_index: Optional[str],
# # # # # # # # # # #         module_code: Optional[str],
# # # # # # # # # # #         exam_year: Optional[int],
# # # # # # # # # # #         exam_month: Optional[int]
# # # # # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # # # # #         answers = []

# # # # # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # # # # #             if isinstance(value, str):
# # # # # # # # # # #                 answer = StudentAnswer(
# # # # # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # # # # #                     answer_text=value.strip(),
# # # # # # # # # # #                     student_index=student_index,
# # # # # # # # # # #                     module_code=module_code,
# # # # # # # # # # #                     exam_year=exam_year,
# # # # # # # # # # #                     exam_month=exam_month
# # # # # # # # # # #                 )
# # # # # # # # # # #                 answers.append(answer)
# # # # # # # # # # #             elif isinstance(value, dict):
# # # # # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # # # # #         for main_q, subs in nested.items():
# # # # # # # # # # #             recurse([main_q], subs)

# # # # # # # # # # #         return answers




# # # # # # # # # import logging
# # # # # # # # # import os
# # # # # # # # # import json
# # # # # # # # # from typing import List, Dict, Optional
# # # # # # # # # from dotenv import load_dotenv
# # # # # # # # # from openai import OpenAI as OpenAIClient
# # # # # # # # # import google.generativeai as genai

# # # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # # load_dotenv()

# # # # # # # # # class AnswerExtractor:
# # # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # # # #         self.selected_provider = selected_provider
# # # # # # # # #         self.selected_model = selected_model
# # # # # # # # #         self.temperature = temperature

# # # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # # #             genai.configure(api_key=self.api_key)
# # # # # # # # #             self.client = genai.GenerativeModel(
# # # # # # # # #                 model_name=self.selected_model
# # # # # # # # #             )

# # # # # # # # #         else:
# # # # # # # # #             raise ValueError("Unsupported provider")

# # # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # # #         try:
# # # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # # #                     model=self.selected_model,
# # # # # # # # #                     messages=[
# # # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # # #                     ],
# # # # # # # # #                     temperature=self.temperature,
# # # # # # # # #                     max_tokens=4000
# # # # # # # # #                 )
# # # # # # # # #                 content = response.choices[0].message.content.strip()

# # # # # # # # #             else:  # GoogleGemini
# # # # # # # # #                 response = self.client.generate_content(
# # # # # # # # #                     contents=[
# # # # # # # # #                         {
# # # # # # # # #                             "role": "user",
# # # # # # # # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # # # # # # # #                         }
# # # # # # # # #                     ],
# # # # # # # # #                     generation_config={"temperature": self.temperature}
# # # # # # # # #                 )
# # # # # # # # #                 content = response.text.strip()

# # # # # # # # #             if content.startswith("```"):
# # # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # # #             structured = json.loads(content)

# # # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # # #         except Exception as e:
# # # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # # #             return []

# # # # # # # # #         return self._flatten_structure(
# # # # # # # # #             answers_json,
# # # # # # # # #             metadata.get("student_index"),
# # # # # # # # #             metadata.get("module_code"),
# # # # # # # # #             metadata.get("exam_year"),
# # # # # # # # #             metadata.get("exam_month")
# # # # # # # # #         )

# # # # # # # # #     def _flatten_structure(
# # # # # # # # #         self,
# # # # # # # # #         nested: dict,
# # # # # # # # #         student_index: Optional[str],
# # # # # # # # #         module_code: Optional[str],
# # # # # # # # #         exam_year: Optional[int],
# # # # # # # # #         exam_month: Optional[int]
# # # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # # #         answers = []

# # # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # # #             if isinstance(value, str):
# # # # # # # # #                 answer = StudentAnswer(
# # # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # # #                     answer_text=value.strip(),
# # # # # # # # #                     student_index=student_index,
# # # # # # # # #                     module_code=module_code,
# # # # # # # # #                     exam_year=exam_year,
# # # # # # # # #                     exam_month=exam_month
# # # # # # # # #                 )
# # # # # # # # #                 answers.append(answer)
# # # # # # # # #             elif isinstance(value, dict):
# # # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # # #         for main_q, subs in nested.items():
# # # # # # # # #             recurse([main_q], subs)

# # # # # # # # #         return answers


# # # # # # # # import logging
# # # # # # # # import os
# # # # # # # # import json
# # # # # # # # from typing import List, Dict, Optional
# # # # # # # # from dotenv import load_dotenv
# # # # # # # # from openai import OpenAI as OpenAIClient
# # # # # # # # import google.generativeai as genai
# # # # # # # # from ollama import Ollama  # Added for DeepSeek

# # # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # # logger = logging.getLogger(__name__)
# # # # # # # # load_dotenv()


# # # # # # # # class AnswerExtractor:
# # # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # # #         self.selected_provider = selected_provider
# # # # # # # #         self.selected_model = selected_model
# # # # # # # #         self.temperature = temperature

# # # # # # # #         if selected_provider == "OpenAI":
# # # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # # #             genai.configure(api_key=self.api_key)
# # # # # # # #             self.client = genai.GenerativeModel(model_name=self.selected_model)

# # # # # # # #         elif selected_provider == "DeepSeek":
# # # # # # # #             # Initialize Ollama client and load DeepSeek model
# # # # # # # #             self.client = Ollama()
# # # # # # # #             self.model_instance = self.client.model(self.selected_model)

# # # # # # # #         else:
# # # # # # # #             raise ValueError("Unsupported provider")

# # # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # # #         try:
# # # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # # #                 response = self.client.chat.completions.create(
# # # # # # # #                     model=self.selected_model,
# # # # # # # #                     messages=[
# # # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # # #                     ],
# # # # # # # #                     temperature=self.temperature,
# # # # # # # #                     max_tokens=4000
# # # # # # # #                 )
# # # # # # # #                 content = response.choices[0].message.content.strip()

# # # # # # # #             elif self.selected_provider == "GoogleGemini":
# # # # # # # #                 response = self.client.generate_content(
# # # # # # # #                     contents=[
# # # # # # # #                         {
# # # # # # # #                             "role": "user",
# # # # # # # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # # # # # # #                         }
# # # # # # # #                     ],
# # # # # # # #                     generation_config={"temperature": self.temperature}
# # # # # # # #                 )
# # # # # # # #                 content = response.text.strip()

# # # # # # # #             elif self.selected_provider == "DeepSeek":
# # # # # # # #                 # Query the DeepSeek model installed locally via Ollama
# # # # # # # #                 content = self.model_instance.query(f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}")

# # # # # # # #             else:
# # # # # # # #                 raise ValueError("Unsupported provider")

# # # # # # # #             # Remove code block markers if present
# # # # # # # #             if content.startswith("```"):
# # # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # # #             structured = json.loads(content)
# # # # # # # #             metadata = structured.get("metadata", {})
# # # # # # # #             answers_json = structured.get("answers", {})

# # # # # # # #         except Exception as e:
# # # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # # #             return []

# # # # # # # #         return self._flatten_structure(
# # # # # # # #             answers_json,
# # # # # # # #             metadata.get("student_index"),
# # # # # # # #             metadata.get("module_code"),
# # # # # # # #             metadata.get("exam_year"),
# # # # # # # #             metadata.get("exam_month")
# # # # # # # #         )

# # # # # # # #     def _flatten_structure(
# # # # # # # #         self,
# # # # # # # #         nested: dict,
# # # # # # # #         student_index: Optional[str],
# # # # # # # #         module_code: Optional[str],
# # # # # # # #         exam_year: Optional[int],
# # # # # # # #         exam_month: Optional[int]
# # # # # # # #     ) -> List[StudentAnswer]:
# # # # # # # #         answers = []

# # # # # # # #         def recurse(keys: List[str], value):
# # # # # # # #             if isinstance(value, str):
# # # # # # # #                 answer = StudentAnswer(
# # # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # # #                     answer_text=value.strip(),
# # # # # # # #                     student_index=student_index,
# # # # # # # #                     module_code=module_code,
# # # # # # # #                     exam_year=exam_year,
# # # # # # # #                     exam_month=exam_month
# # # # # # # #                 )
# # # # # # # #                 answers.append(answer)
# # # # # # # #             elif isinstance(value, dict):
# # # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # # #         for main_q, subs in nested.items():
# # # # # # # #             recurse([main_q], subs)

# # # # # # # #         return answers


# # # # # # # import logging
# # # # # # # import os
# # # # # # # import json
# # # # # # # from typing import List, Optional
# # # # # # # from dotenv import load_dotenv
# # # # # # # from openai import OpenAI as OpenAIClient
# # # # # # # import google.generativeai as genai
# # # # # # # from ollama import Client
# # # # # # #  # For DeepSeek

# # # # # # # from ..models.student_answer import StudentAnswer
# # # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # # logger = logging.getLogger(__name__)
# # # # # # # load_dotenv()


# # # # # # # class AnswerExtractor:
# # # # # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # # # # #         self.selected_provider = selected_provider
# # # # # # #         self.selected_model = selected_model
# # # # # # #         self.temperature = temperature

# # # # # # #         if selected_provider == "OpenAI":
# # # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # # #             if not self.api_key:
# # # # # # #                 raise ValueError("OPENAI_API_KEY not set in .env")
# # # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # # #         elif selected_provider == "GoogleGemini":
# # # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # # #             if not self.api_key:
# # # # # # #                 raise ValueError("GOOGLE_API_KEY not set in .env")
# # # # # # #             genai.configure(api_key=self.api_key)
# # # # # # #             self.client = genai.GenerativeModel(model_name=self.selected_model)

# # # # # # #         elif selected_provider == "DeepSeek":
# # # # # # #             # Initialize Ollama client and load DeepSeek model
# # # # # # #             self.client = Client()
# # # # # # #             self.model_instance = self.client.model(self.selected_model)

# # # # # # #         else:
# # # # # # #             raise ValueError("Unsupported provider")

# # # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # # #         try:
# # # # # # #             if self.selected_provider == "OpenAI":
# # # # # # #                 response = self.client.chat.completions.create(
# # # # # # #                     model=self.selected_model,
# # # # # # #                     messages=[
# # # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # # #                         {"role": "user", "content": raw_text}
# # # # # # #                     ],
# # # # # # #                     temperature=self.temperature,
# # # # # # #                     max_tokens=4000
# # # # # # #                 )
# # # # # # #                 content = response.choices[0].message.content.strip()

# # # # # # #             elif self.selected_provider == "GoogleGemini":
# # # # # # #                 response = self.client.generate_content(
# # # # # # #                     contents=[
# # # # # # #                         {
# # # # # # #                             "role": "user",
# # # # # # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # # # # # #                         }
# # # # # # #                     ],
# # # # # # #                     generation_config={"temperature": self.temperature}
# # # # # # #                 )
# # # # # # #                 content = response.text.strip()

# # # # # # #             elif self.selected_provider == "DeepSeek":
# # # # # # #                 # Use Ollama's generate() method for DeepSeek
# # # # # # #                 response = self.model_instance.generate(
# # # # # # #                     prompt=f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}",
# # # # # # #                     temperature=self.temperature
# # # # # # #                 )
# # # # # # #                 content = response.get("completion", "").strip()

# # # # # # #             else:
# # # # # # #                 raise ValueError("Unsupported provider")

# # # # # # #             # Remove code block markers if present
# # # # # # #             if content.startswith("```"):
# # # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # # #             structured = json.loads(content)
# # # # # # #             metadata = structured.get("metadata", {})
# # # # # # #             answers_json = structured.get("answers", {})

# # # # # # #         except Exception as e:
# # # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # # #             return []

# # # # # # #         return self._flatten_structure(
# # # # # # #             answers_json,
# # # # # # #             metadata.get("student_index"),
# # # # # # #             metadata.get("module_code"),
# # # # # # #             metadata.get("exam_year"),
# # # # # # #             metadata.get("exam_month")
# # # # # # #         )

# # # # # # #     def _flatten_structure(
# # # # # # #         self,
# # # # # # #         nested: dict,
# # # # # # #         student_index: Optional[str],
# # # # # # #         module_code: Optional[str],
# # # # # # #         exam_year: Optional[int],
# # # # # # #         exam_month: Optional[int]
# # # # # # #     ) -> List[StudentAnswer]:
# # # # # # #         answers = []

# # # # # # #         def recurse(keys: List[str], value):
# # # # # # #             if isinstance(value, str):
# # # # # # #                 answer = StudentAnswer(
# # # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # # #                     answer_text=value.strip(),
# # # # # # #                     student_index=student_index,
# # # # # # #                     module_code=module_code,
# # # # # # #                     exam_year=exam_year,
# # # # # # #                     exam_month=exam_month
# # # # # # #                 )
# # # # # # #                 answers.append(answer)
# # # # # # #             elif isinstance(value, dict):
# # # # # # #                 for sub_key, sub_value in value.items():
# # # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # # #         for main_q, subs in nested.items():
# # # # # # #             recurse([main_q], subs)

# # # # # # #         return answers
# # # # # # import logging
# # # # # # import os
# # # # # # import json
# # # # # # from typing import List, Optional
# # # # # # from dotenv import load_dotenv
# # # # # # from openai import OpenAI as OpenAIClient
# # # # # # import google.generativeai as genai
# # # # # # from ollama import Client  # Latest Ollama client for DeepSeek

# # # # # # from ..models.student_answer import StudentAnswer
# # # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # # logger = logging.getLogger(__name__)
# # # # # # load_dotenv()


# # # # # # class AnswerExtractor:
# # # # # #     def __init__(self, selected_provider: str, selected_model: str):
# # # # # #         self.selected_provider = selected_provider
# # # # # #         self.selected_model = selected_model

# # # # # #         if selected_provider == "OpenAI":
# # # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # # #             if not self.api_key:
# # # # # #                 raise ValueError("OPENAI_API_KEY not set in .env")
# # # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # # #         elif selected_provider == "GoogleGemini":
# # # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # # #             if not self.api_key:
# # # # # #                 raise ValueError("GOOGLE_API_KEY not set in .env")
# # # # # #             genai.configure(api_key=self.api_key)
# # # # # #             self.client = genai.GenerativeModel(model_name=self.selected_model)

# # # # # #         elif selected_provider == "DeepSeek":
# # # # # #             # Initialize Ollama client for DeepSeek
# # # # # #             self.client = Client()  # No .model() call anymore

# # # # # #         else:
# # # # # #             raise ValueError("Unsupported provider")

# # # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # # #         try:
# # # # # #             if self.selected_provider == "OpenAI":
# # # # # #                 response = self.client.chat.completions.create(
# # # # # #                     model=self.selected_model,
# # # # # #                     messages=[
# # # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # # #                         {"role": "user", "content": raw_text}
# # # # # #                     ],
# # # # # #                     temperature=0.3,
# # # # # #                     max_tokens=4000
# # # # # #                 )
# # # # # #                 content = response.choices[0].message.content.strip()

# # # # # #             elif self.selected_provider == "GoogleGemini":
# # # # # #                 response = self.client.generate_content(
# # # # # #                     contents=[
# # # # # #                         {
# # # # # #                             "role": "user",
# # # # # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # # # # #                         }
# # # # # #                     ]
# # # # # #                 )
# # # # # #                 content = response.text.strip()

# # # # # #             elif self.selected_provider == "DeepSeek":
# # # # # #                 # Query the DeepSeek model via Ollama Client
# # # # # #                 response = self.client.generate(
# # # # # #                     model=self.selected_model,
# # # # # #                     prompt=f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"
# # # # # #                 )
# # # # # #                 content = response.get("completion", "").strip()

# # # # # #             else:
# # # # # #                 raise ValueError("Unsupported provider")

# # # # # #             # Remove code block markers if present
# # # # # #             if content.startswith("```"):
# # # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # # #             structured = json.loads(content)
# # # # # #             metadata = structured.get("metadata", {})
# # # # # #             answers_json = structured.get("answers", {})

# # # # # #         except Exception as e:
# # # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # # #             return []

# # # # # #         return self._flatten_structure(
# # # # # #             answers_json,
# # # # # #             metadata.get("student_index"),
# # # # # #             metadata.get("module_code"),
# # # # # #             metadata.get("exam_year"),
# # # # # #             metadata.get("exam_month")
# # # # # #         )

# # # # # #     def _flatten_structure(
# # # # # #         self,
# # # # # #         nested: dict,
# # # # # #         student_index: Optional[str],
# # # # # #         module_code: Optional[str],
# # # # # #         exam_year: Optional[int],
# # # # # #         exam_month: Optional[int]
# # # # # #     ) -> List[StudentAnswer]:
# # # # # #         answers = []

# # # # # #         def recurse(keys: List[str], value):
# # # # # #             if isinstance(value, str):
# # # # # #                 answer = StudentAnswer(
# # # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # # #                     answer_text=value.strip(),
# # # # # #                     student_index=student_index,
# # # # # #                     module_code=module_code,
# # # # # #                     exam_year=exam_year,
# # # # # #                     exam_month=exam_month
# # # # # #                 )
# # # # # #                 answers.append(answer)
# # # # # #             elif isinstance(value, dict):
# # # # # #                 for sub_key, sub_value in value.items():
# # # # # #                     recurse(keys + [sub_key], sub_value)

# # # # # #         for main_q, subs in nested.items():
# # # # # #             recurse([main_q], subs)

# # # # # #         return answers

# # # # # import logging
# # # # # import os
# # # # # import json
# # # # # from typing import List, Optional
# # # # # from dotenv import load_dotenv
# # # # # from openai import OpenAI as OpenAIClient
# # # # # import google.generativeai as genai
# # # # # from ollama import Client  # Latest Ollama client for DeepSeek

# # # # # from ..models.student_answer import StudentAnswer
# # # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # # logger = logging.getLogger(__name__)
# # # # # load_dotenv()


# # # # # class AnswerExtractor:
# # # # #     def __init__(self, selected_provider: str, selected_model: str):
# # # # #         self.selected_provider = selected_provider
# # # # #         self.selected_model = selected_model

# # # # #         if selected_provider == "OpenAI":
# # # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # # #             if not self.api_key:
# # # # #                 raise ValueError("OPENAI_API_KEY not set in .env")
# # # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # # #         elif selected_provider == "GoogleGemini":
# # # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # # #             if not self.api_key:
# # # # #                 raise ValueError("GOOGLE_API_KEY not set in .env")
# # # # #             genai.configure(api_key=self.api_key)
# # # # #             self.client = genai.GenerativeModel(model_name=self.selected_model)

# # # # #         elif selected_provider == "DeepSeek":
# # # # #             # Initialize Ollama client for DeepSeek
# # # # #             self.client = Client()  # No .model() call anymore

# # # # #         else:
# # # # #             raise ValueError("Unsupported provider")

# # # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # # #         try:
# # # # #             if self.selected_provider == "OpenAI":
# # # # #                 response = self.client.chat.completions.create(
# # # # #                     model=self.selected_model,
# # # # #                     messages=[
# # # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # # #                         {"role": "user", "content": raw_text}
# # # # #                     ],
# # # # #                     temperature=0.3,
# # # # #                     max_tokens=4000
# # # # #                 )
# # # # #                 content = response.choices[0].message.content.strip()

# # # # #             elif self.selected_provider == "GoogleGemini":
# # # # #                 response = self.client.generate_content(
# # # # #                     contents=[
# # # # #                         {
# # # # #                             "role": "user",
# # # # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # # # #                         }
# # # # #                     ]
# # # # #                 )
# # # # #                 content = response.text.strip()

# # # # #             elif self.selected_provider == "DeepSeek":
# # # # #                 # Query the DeepSeek model via Ollama Client
# # # # #                 response = self.client.generate(
# # # # #                     model=self.selected_model,
# # # # #                     prompt=f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"
# # # # #                 )

# # # # #                 # Debug: show raw response
# # # # #                 logger.debug(f"Raw DeepSeek response: {response}")

# # # # #                 # Updated parsing for latest Ollama client
# # # # #                 results = response.get("results", [])
# # # # #                 if not results:
# # # # #                     logger.error("DeepSeek returned no results")
# # # # #                     return []

# # # # #                 content = results[0].get("completion", "").strip()
# # # # #                 if not content:
# # # # #                     logger.error("DeepSeek completion is empty")
# # # # #                     return []

# # # # #             else:
# # # # #                 raise ValueError("Unsupported provider")

# # # # #             # Remove code block markers if present
# # # # #             if content.startswith("```"):
# # # # #                 content = content.strip("`").replace("json", "").strip()

# # # # #             structured = json.loads(content)
# # # # #             metadata = structured.get("metadata", {})
# # # # #             answers_json = structured.get("answers", {})

# # # # #         except Exception as e:
# # # # #             logger.error(f"LLM extraction failed: {e}")
# # # # #             return []

# # # # #         return self._flatten_structure(
# # # # #             answers_json,
# # # # #             metadata.get("student_index"),
# # # # #             metadata.get("module_code"),
# # # # #             metadata.get("exam_year"),
# # # # #             metadata.get("exam_month")
# # # # #         )

# # # # #     def _flatten_structure(
# # # # #         self,
# # # # #         nested: dict,
# # # # #         student_index: Optional[str],
# # # # #         module_code: Optional[str],
# # # # #         exam_year: Optional[int],
# # # # #         exam_month: Optional[int]
# # # # #     ) -> List[StudentAnswer]:
# # # # #         answers = []

# # # # #         def recurse(keys: List[str], value):
# # # # #             if isinstance(value, str):
# # # # #                 answer = StudentAnswer(
# # # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # # #                     answer_text=value.strip(),
# # # # #                     student_index=student_index,
# # # # #                     module_code=module_code,
# # # # #                     exam_year=exam_year,
# # # # #                     exam_month=exam_month
# # # # #                 )
# # # # #                 answers.append(answer)
# # # # #             elif isinstance(value, dict):
# # # # #                 for sub_key, sub_value in value.items():
# # # # #                     recurse(keys + [sub_key], sub_value)

# # # # #         for main_q, subs in nested.items():
# # # # #             recurse([main_q], subs)

# # # # #         return answers


# # # # import sys
# # # # import os
# # # # import time
# # # # from docx import Document
# # # # from pprint import pprint

# # # # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # # # from src.services.answer_extractor import AnswerExtractor
# # # # from src.services.database_services.student_answer_db import StudentAnswerService

# # # # def load_docx_text(docx_path: str) -> str:
# # # #     doc = Document(docx_path)
# # # #     return "\n".join([para.text.strip() for para in doc.paragraphs if para.text.strip()])

# # # # def extract_and_save(docx_path: str, extractor: AnswerExtractor, provider: str):
# # # #     filename = os.path.basename(docx_path)
# # # #     print(f"\n📄 Processing: {filename}")

# # # #     try:
# # # #         raw_text = load_docx_text(docx_path)
# # # #         answers = extractor.extract_answers_with_llm(raw_text)

# # # #         if not answers:
# # # #             print("❌ No answers extracted.")
# # # #             return

# # # #         # Preview the result
# # # #         pprint([
# # # #             {"question": ans.full_question_id, "answer": ans.answer_text}
# # # #             for ans in answers
# # # #         ])

# # # #         # Save to database
# # # #         first = answers[0]
# # # #         db = StudentAnswerService(provider_suffix=provider)
# # # #         db.initialize_table()
# # # #         db.save_answers(
# # # #             student_index=first.student_index,
# # # #             module_code=first.module_code,
# # # #             year=first.exam_year,
# # # #             month=first.exam_month,
# # # #             answers=answers
# # # #         )
# # # #         db.close()

# # # #         print(f"✅ Saved answers for {first.student_index} | {first.module_code} | {first.exam_year}-{first.exam_month}")
# # # #     except Exception as e:
# # # #         print(f"❌ Failed to process {filename}: {e}")

# # # # if __name__ == "__main__":
# # # #     import argparse

# # # #     parser = argparse.ArgumentParser(description="Extract and save student answers using LLMs")
# # # #     parser.add_argument(
# # # #         "--provider",
# # # #         required=True,
# # # #         choices=["OpenAI", "GoogleGemini", "DeepSeekGroq"],  # ✅ added DeepSeek
# # # #         help="LLM provider"
# # # #     )
# # # #     parser.add_argument("--model", required=True, help="Model name (e.g., gpt-4o, gemini-2.0-flash, deepseek-r1-distill-llama-70b)")
# # # #     parser.add_argument("--folder", required=True, help="Single DOCX file or folder containing DOCX files")

# # # #     args = parser.parse_args()
# # # #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)

# # # #     if os.path.isfile(args.folder) and args.folder.endswith(".docx"):
# # # #         # Single file mode
# # # #         extract_and_save(args.folder, extractor, args.provider)
# # # #     elif os.path.isdir(args.folder):
# # # #         # Folder mode
# # # #         for filename in os.listdir(args.folder):
# # # #             if filename.lower().endswith(".docx"):
# # # #                 filepath = os.path.join(args.folder, filename)
# # # #                 extract_and_save(filepath, extractor, args.provider)

# # # #                 # Delay for Gemini rate limits (15 requests/min)
# # # #                 if args.provider == "GoogleGemini":
# # # #                     time.sleep(10)
# # # #     else:
# # # #         print("❌ Invalid --folder path. Must be either a .docx file or a directory.")


# # # import logging
# # # import os
# # # import json
# # # from typing import List, Optional
# # # from dotenv import load_dotenv
# # # from openai import OpenAI as OpenAIClient
# # # import google.generativeai as genai
# # # import requests

# # # from ..models.student_answer import StudentAnswer
# # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # logger = logging.getLogger(__name__)
# # # load_dotenv()

# # # class AnswerExtractor:
# # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # #         self.selected_provider = selected_provider
# # #         self.selected_model = selected_model
# # #         self.temperature = temperature

# # #         if selected_provider == "OpenAI":
# # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # #             self.client = OpenAIClient(api_key=self.api_key)

# # #         elif selected_provider == "GoogleGemini":
# # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # #             genai.configure(api_key=self.api_key)
# # #             self.client = genai.GenerativeModel(model_name=self.selected_model)

# # #         elif selected_provider == "DeepSeek":  # ✅ Added DeepSeek
# # #             self.ollama_url = "http://localhost:11434/api/generate"

# # #         else:
# # #             raise ValueError("Unsupported provider")

# # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # #         try:
# # #             if self.selected_provider == "OpenAI":
# # #                 response = self.client.chat.completions.create(
# # #                     model=self.selected_model,
# # #                     messages=[
# # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # #                         {"role": "user", "content": raw_text}
# # #                     ],
# # #                     temperature=self.temperature,
# # #                     max_tokens=4000
# # #                 )
# # #                 content = response.choices[0].message.content.strip()

# # #             elif self.selected_provider == "GoogleGemini":
# # #                 response = self.client.generate_content(
# # #                     contents=[
# # #                         {
# # #                             "role": "user",
# # #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# # #                         }
# # #                     ],
# # #                     generation_config={"temperature": self.temperature}
# # #                 )
# # #                 content = response.text.strip()

# # #             elif self.selected_provider == "DeepSeek":  # ✅ Ollama REST API
# # #                 # Force DeepSeek to ONLY return JSON
# # #                 deepseek_prompt = (
# # #                     f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n"
# # #                     f"{raw_text}\n\n"
# # #                     "Return the result strictly as valid JSON with the structure:\n"
# # #                     "{\n"
# # #                     '  "metadata": {\n'
# # #                     '    "student_index": "string",\n'
# # #                     '    "module_code": "string",\n'
# # #                     '    "exam_year": 2020,\n'
# # #                     '    "exam_month": 1\n'
# # #                     "  },\n"
# # #                     '  "answers": {\n'
# # #                     '    "Q1": "Answer text",\n'
# # #                     '    "Q2": {\n'
# # #                     '      "a": "Sub-answer text"\n'
# # #                     "    }\n"
# # #                     "  }\n"
# # #                     "}\n"
# # #                     "Do not include explanations, markdown, or extra text."
# # #                 )

# # #                 payload = {
# # #                     "model": self.selected_model,
# # #                     "prompt": deepseek_prompt,
# # #                     "options": {"temperature": self.temperature},
# # #                     "stream": False
# # #                 }

# # #                 response = requests.post(self.ollama_url, json=payload)
# # #                 response.raise_for_status()
# # #                 data = response.json()
# # #                 content = data.get("response", "").strip()

# # #             else:
# # #                 raise ValueError("Unsupported provider")

# # #             # Debug raw LLM response
# # #             logger.debug(f"Raw LLM output:\n{content}")

# # #             # Clean fenced code blocks if present
# # #             if content.startswith("```"):
# # #                 content = content.strip("`").replace("json", "").strip()

# # #             try:
# # #                 structured = json.loads(content)
# # #             except Exception as e:
# # #                 logger.error(f"JSON parsing failed: {e}")
# # #                 return []

# # #             metadata = structured.get("metadata", {})
# # #             answers_json = structured.get("answers", {})

# # #         except Exception as e:
# # #             logger.error(f"LLM extraction failed: {e}")
# # #             return []

# # #         return self._flatten_structure(
# # #             answers_json,
# # #             metadata.get("student_index"),
# # #             metadata.get("module_code"),
# # #             metadata.get("exam_year"),
# # #             metadata.get("exam_month")
# # #         )

# # #     def _flatten_structure(
# # #         self,
# # #         nested: dict,
# # #         student_index: Optional[str],
# # #         module_code: Optional[str],
# # #         exam_year: Optional[int],
# # #         exam_month: Optional[int]
# # #     ) -> List[StudentAnswer]:
# # #         answers = []

# # #         def recurse(keys: List[str], value):
# # #             if isinstance(value, str):
# # #                 answer = StudentAnswer(
# # #                     question_id=keys[0] if len(keys) > 0 else None,
# # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # #                     answer_text=value.strip(),
# # #                     student_index=student_index,
# # #                     module_code=module_code,
# # #                     exam_year=exam_year,
# # #                     exam_month=exam_month
# # #                 )
# # #                 answers.append(answer)
# # #             elif isinstance(value, dict):
# # #                 for sub_key, sub_value in value.items():
# # #                     recurse(keys + [sub_key], sub_value)

# # #         for main_q, subs in nested.items():
# # #             recurse([main_q], subs)

# # #         return answers

# # import logging
# # import os
# # import json
# # import requests
# # from typing import List, Dict, Optional
# # from dotenv import load_dotenv
# # from openai import OpenAI as OpenAIClient
# # import google.generativeai as genai

# # from ..models.student_answer import StudentAnswer
# # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # logger = logging.getLogger(__name__)
# # load_dotenv()

# # class AnswerExtractor:
# #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3, ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
# #         self.selected_provider = selected_provider
# #         self.selected_model = selected_model
# #         self.temperature = temperature
# #         self.ollama_base_url = ollama_base_url
# #         self.request_timeout = request_timeout  # Default 10 minutes for complex tasks

# #         if selected_provider == "OpenAI":
# #             self.api_key = os.getenv("OPENAI_API_KEY")
# #             self.client = OpenAIClient(api_key=self.api_key)

# #         elif selected_provider == "GoogleGemini":
# #             self.api_key = os.getenv("GOOGLE_API_KEY")
# #             genai.configure(api_key=self.api_key)
# #             self.client = genai.GenerativeModel(
# #                 model_name=self.selected_model
# #             )

# #         elif selected_provider == "DeepSeek":
# #             # DeepSeek via Ollama - no API key needed for local instance
# #             # Verify Ollama is running
# #             try:
# #                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
# #                 if response.status_code != 200:
# #                     raise ConnectionError("Ollama server is not responding")
# #                 logger.info("Connected to Ollama server successfully")
# #             except requests.exceptions.ConnectionError:
# #                 raise ConnectionError(f"Cannot connect to Ollama server at {self.ollama_base_url}. Make sure Ollama is running.")

# #         else:
# #             raise ValueError(f"Unsupported provider: {selected_provider}")

# #     def _call_ollama_api(self, messages: List[Dict[str, str]], stream: bool = False) -> str:
# #         """
# #         Call Ollama API with the given messages
# #         """
# #         payload = {
# #             "model": self.selected_model,
# #             "messages": messages,
# #             "stream": stream,
# #             "options": {
# #                 "temperature": self.temperature,
# #                 "num_ctx": 8192,  # Increase context window
# #                 "num_predict": 4000,  # Increase max tokens
# #                 "top_k": 40,
# #                 "top_p": 0.9
# #             }
# #         }

# #         logger.info(f"Sending request to Ollama with timeout: {self.request_timeout}s")
        
# #         try:
# #             response = requests.post(
# #                 f"{self.ollama_base_url}/api/chat",
# #                 headers={"Content-Type": "application/json"},
# #                 json=payload,
# #                 timeout=self.request_timeout
# #             )
# #             response.raise_for_status()
            
# #             response_data = response.json()
# #             content = response_data.get("message", {}).get("content", "")
            
# #             logger.info(f"Received response from Ollama (length: {len(content)} chars)")
# #             return content
            
# #         except requests.exceptions.Timeout:
# #             logger.error(f"Ollama API request timed out after {self.request_timeout} seconds")
# #             raise Exception(f"Ollama API request timed out after {self.request_timeout} seconds. Try increasing the timeout or using a smaller model.")
# #         except requests.exceptions.RequestException as e:
# #             logger.error(f"Ollama API request failed: {e}")
# #             raise Exception(f"Ollama API request failed: {e}")
# #         except json.JSONDecodeError as e:
# #             logger.error(f"Failed to parse Ollama response: {e}")
# #             raise Exception(f"Failed to parse Ollama response: {e}")

# #     def _call_ollama_api_streaming(self, messages: List[Dict[str, str]]) -> str:
# #         """
# #         Call Ollama API with streaming for better handling of long responses
# #         """
# #         payload = {
# #             "model": self.selected_model,
# #             "messages": messages,
# #             "stream": True,
# #             "options": {
# #                 "temperature": self.temperature,
# #                 "num_ctx": 8192,
# #                 "num_predict": 4000,
# #                 "top_k": 40,
# #                 "top_p": 0.9
# #             }
# #         }

# #         logger.info("Starting streaming request to Ollama...")
# #         full_content = ""
        
# #         try:
# #             with requests.post(
# #                 f"{self.ollama_base_url}/api/chat",
# #                 headers={"Content-Type": "application/json"},
# #                 json=payload,
# #                 stream=True,
# #                 timeout=self.request_timeout
# #             ) as response:
# #                 response.raise_for_status()
                
# #                 for line in response.iter_lines():
# #                     if line:
# #                         try:
# #                             chunk_data = json.loads(line.decode('utf-8'))
# #                             if 'message' in chunk_data and 'content' in chunk_data['message']:
# #                                 content_chunk = chunk_data['message']['content']
# #                                 full_content += content_chunk
                                
# #                                 # Log progress periodically
# #                                 if len(full_content) % 1000 == 0:
# #                                     logger.info(f"Received {len(full_content)} characters...")
                                    
# #                             # Check if this is the final chunk
# #                             if chunk_data.get('done', False):
# #                                 logger.info(f"Streaming completed. Total length: {len(full_content)} characters")
# #                                 break
                                
# #                         except json.JSONDecodeError:
# #                             continue  # Skip malformed chunks
                            
# #             return full_content
            
# #         except requests.exceptions.Timeout:
# #             logger.error(f"Streaming request timed out after {self.request_timeout} seconds")
# #             raise Exception(f"Streaming request timed out after {self.request_timeout} seconds")
# #         except requests.exceptions.RequestException as e:
# #             logger.error(f"Streaming request failed: {e}")
# #             raise Exception(f"Streaming request failed: {e}")

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

# #             elif self.selected_provider == "GoogleGemini":
# #                 response = self.client.generate_content(
# #                     contents=[
# #                         {
# #                             "role": "user",
# #                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
# #                         }
# #                     ],
# #                     generation_config={"temperature": self.temperature}
# #                 )
# #                 content = response.text.strip()

# #             elif self.selected_provider == "DeepSeek":
# #                 logger.info("Starting DeepSeek extraction...")
# #                 messages = [
# #                     {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# #                     {"role": "user", "content": raw_text}
# #                 ]
                
# #                 # Add a warning for long processing times
# #                 logger.warning("DeepSeek-R1 may take several minutes to process due to its reasoning capabilities...")
                
# #                 # Try streaming first, fall back to regular if it fails
# #                 try:
# #                     logger.info("Attempting streaming request...")
# #                     content = self._call_ollama_api_streaming(messages).strip()
# #                     logger.info("Streaming request completed successfully")
# #                 except Exception as stream_error:
# #                     logger.warning(f"Streaming failed, trying regular request: {stream_error}")
# #                     content = self._call_ollama_api(messages).strip()
                
# #                 # DeepSeek-R1 models often include thinking process in <think> tags
# #                 # Extract only the actual response content
# #                 if "<think>" in content and "</think>" in content:
# #                     logger.info("Removing DeepSeek thinking process...")
# #                     # Find the content after </think>
# #                     think_end = content.find("</think>")
# #                     if think_end != -1:
# #                         content = content[think_end + 8:].strip()
# #                         logger.info(f"Extracted content after thinking (length: {len(content)} chars)")
                
# #                 # Log the actual content for debugging
# #                 logger.debug(f"DeepSeek response content: {content[:200]}...")  # First 200 chars
                
# #             else:
# #                 raise ValueError(f"Unsupported provider: {self.selected_provider}")

# #             # Clean up code block formatting if present
# #             if content.startswith("```"):
# #                 content = content.strip("`").replace("json", "").strip()

# #             # Parse JSON response
# #             structured = json.loads(content)

# #             metadata = structured.get("metadata", {})
# #             answers_json = structured.get("answers", {})

# #         except json.JSONDecodeError as e:
# #             logger.error(f"Failed to parse JSON response from {self.selected_provider}: {e}")
# #             logger.error(f"Raw response content: {content}")
# #             return []
# #         except Exception as e:
# #             logger.error(f"LLM extraction failed with {self.selected_provider}: {e}")
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

# #     def test_connection(self) -> bool:
# #         """
# #         Test the connection to the selected provider
# #         """
# #         try:
# #             if self.selected_provider == "DeepSeek":
# #                 # Test with a simple message
# #                 test_messages = [{"role": "user", "content": "Hello, respond with 'Connection successful'"}]
# #                 response = self._call_ollama_api(test_messages)
# #                 return "successful" in response.lower() or len(response.strip()) > 0
            
# #             # For other providers, you can add similar test methods
# #             return True
            
# #         except Exception as e:
# #             logger.error(f"Connection test failed for {self.selected_provider}: {e}")
# #             return False

# #     def get_available_models(self) -> List[str]:
# #         """
# #         Get list of available models for the selected provider
# #         """
# #         if self.selected_provider == "DeepSeek":
# #             try:
# #                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
# #                 response.raise_for_status()
# #                 data = response.json()
# #                 models = [model.get("name", "") for model in data.get("models", [])]
# #                 return [model for model in models if "deepseek" in model.lower()]
# #             except Exception as e:
# #                 logger.error(f"Failed to get available models: {e}")
# #                 return []
        
# #         # For other providers, return empty list or implement similar functionality
# #         return []

# import logging
# import os
# import json
# import requests
# import re
# from typing import List, Dict, Optional
# from dotenv import load_dotenv
# from openai import OpenAI as OpenAIClient
# import google.generativeai as genai

# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()

# class AnswerExtractor:
#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3, ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature
#         self.ollama_base_url = ollama_base_url
#         self.request_timeout = request_timeout  # Default 10 minutes for complex tasks

#         if selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)

#         elif selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model
#             )

#         elif selected_provider == "DeepSeek":
#             # DeepSeek via Ollama - no API key needed for local instance
#             # Verify Ollama is running
#             try:
#                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
#                 if response.status_code != 200:
#                     raise ConnectionError("Ollama server is not responding")
#                 logger.info("Connected to Ollama server successfully")
#             except requests.exceptions.ConnectionError:
#                 raise ConnectionError(f"Cannot connect to Ollama server at {self.ollama_base_url}. Make sure Ollama is running.")

#         else:
#             raise ValueError(f"Unsupported provider: {selected_provider}")

#     def _call_ollama_api(self, messages: List[Dict[str, str]], stream: bool = False) -> str:
#         """
#         Call Ollama API with the given messages
#         """
#         payload = {
#             "model": self.selected_model,
#             "messages": messages,
#             "stream": stream,
#             "options": {
#                 "temperature": self.temperature,
#                 "num_ctx": 8192,  # Increase context window
#                 "num_predict": 4000,  # Increase max tokens
#                 "top_k": 40,
#                 "top_p": 0.9
#             }
#         }

#         logger.info(f"Sending request to Ollama with timeout: {self.request_timeout}s")
        
#         try:
#             response = requests.post(
#                 f"{self.ollama_base_url}/api/chat",
#                 headers={"Content-Type": "application/json"},
#                 json=payload,
#                 timeout=self.request_timeout
#             )
#             response.raise_for_status()
            
#             response_data = response.json()
#             content = response_data.get("message", {}).get("content", "")
            
#             logger.info(f"Received response from Ollama (length: {len(content)} chars)")
#             return content
            
#         except requests.exceptions.Timeout:
#             logger.error(f"Ollama API request timed out after {self.request_timeout} seconds")
#             raise Exception(f"Ollama API request timed out after {self.request_timeout} seconds. Try increasing the timeout or using a smaller model.")
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Ollama API request failed: {e}")
#             raise Exception(f"Ollama API request failed: {e}")
#         except json.JSONDecodeError as e:
#             logger.error(f"Failed to parse Ollama response: {e}")
#             raise Exception(f"Failed to parse Ollama response: {e}")

#     def _call_ollama_api_streaming(self, messages: List[Dict[str, str]]) -> str:
#         """
#         Call Ollama API with streaming for better handling of long responses
#         """
#         payload = {
#             "model": self.selected_model,
#             "messages": messages,
#             "stream": True,
#             "options": {
#                 "temperature": self.temperature,
#                 "num_ctx": 8192,
#                 "num_predict": 4000,
#                 "top_k": 40,
#                 "top_p": 0.9
#             }
#         }

#         logger.info("Starting streaming request to Ollama...")
#         full_content = ""
        
#         try:
#             with requests.post(
#                 f"{self.ollama_base_url}/api/chat",
#                 headers={"Content-Type": "application/json"},
#                 json=payload,
#                 stream=True,
#                 timeout=self.request_timeout
#             ) as response:
#                 response.raise_for_status()
                
#                 for line in response.iter_lines():
#                     if line:
#                         try:
#                             chunk_data = json.loads(line.decode('utf-8'))
#                             if 'message' in chunk_data and 'content' in chunk_data['message']:
#                                 content_chunk = chunk_data['message']['content']
#                                 full_content += content_chunk
                                
#                                 # Log progress periodically
#                                 if len(full_content) % 1000 == 0:
#                                     logger.info(f"Received {len(full_content)} characters...")
                                    
#                             # Check if this is the final chunk
#                             if chunk_data.get('done', False):
#                                 logger.info(f"Streaming completed. Total length: {len(full_content)} characters")
#                                 break
                                
#                         except json.JSONDecodeError:
#                             continue  # Skip malformed chunks
                            
#             return full_content
            
#         except requests.exceptions.Timeout:
#             logger.error(f"Streaming request timed out after {self.request_timeout} seconds")
#             raise Exception(f"Streaming request timed out after {self.request_timeout} seconds")
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Streaming request failed: {e}")
#             raise Exception(f"Streaming request failed: {e}")

#     def _manually_fix_deepseek_json(self, content: str) -> str:
#         """
#         Manually fix DeepSeek JSON formatting issues
#         """
#         logger.info("Applying manual JSON fixes...")
        
#         # Fix Python-style string joining patterns
#         def fix_join_expression(match):
#             separator = match.group(1)  # the separator like "\\n"
#             array_content = match.group(2)  # content inside the array
            
#             # Convert separator to actual character
#             actual_separator = separator.replace('\\n', '\n').replace('\\t', '\t')
            
#             # Extract items from the array (simple parsing)
#             items = []
#             current_item = ""
#             in_quotes = False
#             quote_char = None
            
#             for char in array_content:
#                 if char in ['"', "'"] and not in_quotes:
#                     in_quotes = True
#                     quote_char = char
#                 elif char == quote_char and in_quotes:
#                     in_quotes = False
#                     items.append(current_item)
#                     current_item = ""
#                     quote_char = None
#                 elif char == ',' and not in_quotes:
#                     if current_item.strip():
#                         items.append(current_item.strip())
#                         current_item = ""
#                 elif in_quotes:
#                     current_item += char
            
#             # Add the last item if there's one
#             if current_item.strip():
#                 items.append(current_item.strip())
            
#             # Join items and escape for JSON
#             result = actual_separator.join(items)
#             # Escape for JSON
#             result = result.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            
#             return f'"{result}"'
        
#         # Pattern to match "separator".join([...])
#         join_pattern = r'"([^"]*)"\.join\(\[\s*([^\]]+)\s*\]\)'
#         content = re.sub(join_pattern, fix_join_expression, content)
        
#         # Additional fixes
#         content = re.sub(r',\s*}', '}', content)  # Remove trailing commas before }
#         content = re.sub(r',\s*]', ']', content)  # Remove trailing commas before ]
        
#         logger.info(f"Fixed JSON length: {len(content)} characters")
#         return content

#     def _fix_json_formatting(self, content: str) -> str:
#         """
#         Fix common JSON formatting issues from DeepSeek responses
#         """
#         # Remove Python-style string joining
#         # Replace "\n".join([...]) with proper JSON arrays or strings
#         def replace_join_pattern(match):
#             separator = match.group(1)  # "\n" or other separator
#             items_str = match.group(2)  # the array content
            
#             try:
#                 # Try to evaluate the Python list safely
#                 import ast
#                 items = ast.literal_eval(f"[{items_str}]")
#                 # Join with the separator and escape properly for JSON
#                 joined = separator.replace('\\n', '\n').join(str(item).strip('"\'') for item in items)
#                 return f'"{joined}"'
#             except:
#                 # If that fails, just return the original
#                 return match.group(0)
        
#         # Pattern to match "\n".join([...]) or similar
#         join_pattern = r'"([^"]*)"\.join\(\[\s*([^\]]+)\s*\]\)'
#         content = re.sub(join_pattern, replace_join_pattern, content)
        
#         # Fix other common issues
#         content = content.replace('"\n"', '"\\n"')  # Fix literal newlines in strings
#         content = re.sub(r',\s*}', '}', content)    # Remove trailing commas
#         content = re.sub(r',\s*]', ']', content)    # Remove trailing commas in arrays
        
#         return content

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
#                 response = self.client.generate_content(
#                     contents=[
#                         {
#                             "role": "user",
#                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
#                         }
#                     ],
#                     generation_config={"temperature": self.}
#                 )
#                 content = response.text.strip()

#             elif self.selected_provider == "DeepSeek":
#                 logger.info("Starting DeepSeek extraction...")
                
#                 # Create a more specific prompt for DeepSeek to avoid Python syntax
#                 deepseek_prompt = EXTRACT_STUDENT_ANSWERS_PROMPT + """

# IMPORTANT: Return ONLY valid JSON. Do not use Python syntax like "\\n".join([...]).
# For multi-line answers, use proper JSON strings with \\n for newlines.
# Example:
# "answer": "Line 1\\nLine 2\\nLine 3"

# NOT:
# "answer": "\\n".join(["Line 1", "Line 2", "Line 3"])
# """
                
#                 messages = [
#                     {"role": "system", "content": deepseek_prompt},
#                     {"role": "user", "content": raw_text}
#                 ]
                
#                 # Add a warning for long processing times
#                 logger.warning("DeepSeek-R1 may take several minutes to process due to its reasoning capabilities...")
                
#                 # Try streaming first, fall back to regular if it fails
#                 try:
#                     logger.info("Attempting streaming request...")
#                     content = self._call_ollama_api_streaming(messages).strip()
#                     logger.info("Streaming request completed successfully")
#                 except Exception as stream_error:
#                     logger.warning(f"Streaming failed, trying regular request: {stream_error}")
#                     content = self._call_ollama_api(messages).strip()
                
#                 # DeepSeek-R1 models often include thinking process in <think> tags
#                 # Extract only the actual response content
#                 if "<think>" in content and "</think>" in content:
#                     logger.info("Removing DeepSeek thinking process...")
#                     # Find the content after </think>
#                     think_end = content.find("</think>")
#                     if think_end != -1:
#                         content = content[think_end + 8:].strip()
#                         logger.info(f"Extracted content after thinking (length: {len(content)} chars)")
                
#                 # Log the actual content for debugging
#                 logger.debug(f"DeepSeek response content: {content[:200]}...")  # First 200 chars
                
#             else:
#                 raise ValueError(f"Unsupported provider: {self.selected_provider}")

#             # Clean up code block formatting if present
#             if content.startswith("```"):
#                 content = content.strip("`").replace("json", "").strip()

#             # Clean and fix common JSON issues before parsing
#             content = self._fix_json_formatting(content)
            
#             # Parse JSON response
#             structured = json.loads(content)

#             metadata = structured.get("metadata", {})
#             answers_json = structured.get("answers", {})

#         except json.JSONDecodeError as e:
#             logger.error(f"Failed to parse JSON response from {self.selected_provider}: {e}")
#             logger.error(f"Raw response content: {content}")
            
#             # For DeepSeek, try to manually fix common issues and retry
#             if self.selected_provider == "DeepSeek":
#                 logger.info("Attempting to manually fix DeepSeek JSON response...")
#                 try:
#                     fixed_content = self._manually_fix_deepseek_json(content)
#                     logger.info("Attempting to parse manually fixed JSON...")
#                     structured = json.loads(fixed_content)
                    
#                     metadata = structured.get("metadata", {})
#                     answers_json = structured.get("answers", {})
                    
#                     logger.info("✅ Successfully parsed manually fixed JSON!")
                    
#                     return self._flatten_structure(
#                         answers_json,
#                         metadata.get("student_index"),
#                         metadata.get("module_code"),
#                         metadata.get("exam_year"),
#                         metadata.get("exam_month")
#                     )
#                 except Exception as fix_error:
#                     logger.error(f"Manual JSON fix also failed: {fix_error}")
            
#             return []
#         except Exception as e:
#             logger.error(f"LLM extraction failed with {self.selected_provider}: {e}")
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

#     def test_connection(self) -> bool:
#         """
#         Test the connection to the selected provider
#         """
#         try:
#             if self.selected_provider == "DeepSeek":
#                 # Test with a simple message
#                 test_messages = [{"role": "user", "content": "Hello, respond with 'Connection successful'"}]
#                 response = self._call_ollama_api(test_messages)
#                 return "successful" in response.lower() or len(response.strip()) > 0
            
#             # For other providers, you can add similar test methods
#             return True
            
#         except Exception as e:
#             logger.error(f"Connection test failed for {self.selected_provider}: {e}")
#             return False

#     def get_available_models(self) -> List[str]:
#         """
#         Get list of available models for the selected provider
#         """
#         if self.selected_provider == "DeepSeek":
#             try:
#                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
#                 response.raise_for_status()
#                 data = response.json()
#                 models = [model.get("name", "") for model in data.get("models", [])]
#                 return [model for model in models if "deepseek" in model.lower()]
#             except Exception as e:
#                 logger.error(f"Failed to get available models: {e}")
#                 return []
        
#         # For other providers, return empty list or implement similar functionality
#         return []

#     @property
#     def provider_suffix(self) -> str:
#         """
#         Get the provider suffix for file naming and compatibility
#         """
#         if self.selected_provider == "DeepSeek":
#             return "deepseek"
#         elif self.selected_provider == "GoogleGemini":
#             return "gemini" 
#         elif self.selected_provider == "OpenAI":
#             return "openai"
#         else:
#             return self.selected_provider.lower()

# import logging
# import os
# import json
# import requests
# import re
# from typing import List, Dict, Optional
# from dotenv import load_dotenv
# from openai import OpenAI as OpenAIClient
# import google.generativeai as genai

# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()

# class AnswerExtractor:
#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3, ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature
#         self.ollama_base_url = ollama_base_url
#         self.request_timeout = request_timeout  # Default 10 minutes for complex tasks

#         if selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)

#         elif selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model
#             )

#         elif selected_provider == "DeepSeek":
#             # DeepSeek via Ollama - no API key needed for local instance
#             # Verify Ollama is running
#             try:
#                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
#                 if response.status_code != 200:
#                     raise ConnectionError("Ollama server is not responding")
#                 logger.info("Connected to Ollama server successfully")
#             except requests.exceptions.ConnectionError:
#                 raise ConnectionError(f"Cannot connect to Ollama server at {self.ollama_base_url}. Make sure Ollama is running.")

#         else:
#             raise ValueError(f"Unsupported provider: {selected_provider}")

#     def _call_ollama_api(self, messages: List[Dict[str, str]], stream: bool = False) -> str:
#         """
#         Call Ollama API with the given messages
#         """
#         payload = {
#             "model": self.selected_model,
#             "messages": messages,
#             "stream": stream,
#             "options": {
#                 "temperature": self.temperature,
#                 "num_ctx": 8192,  # Increase context window
#                 "num_predict": 4000,  # Increase max tokens
#                 "top_k": 40,
#                 "top_p": 0.9
#             }
#         }

#         logger.info(f"Sending request to Ollama with timeout: {self.request_timeout}s")
        
#         try:
#             response = requests.post(
#                 f"{self.ollama_base_url}/api/chat",
#                 headers={"Content-Type": "application/json"},
#                 json=payload,
#                 timeout=self.request_timeout
#             )
#             response.raise_for_status()
            
#             response_data = response.json()
#             content = response_data.get("message", {}).get("content", "")
            
#             logger.info(f"Received response from Ollama (length: {len(content)} chars)")
#             return content
            
#         except requests.exceptions.Timeout:
#             logger.error(f"Ollama API request timed out after {self.request_timeout} seconds")
#             raise Exception(f"Ollama API request timed out after {self.request_timeout} seconds. Try increasing the timeout or using a smaller model.")
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Ollama API request failed: {e}")
#             raise Exception(f"Ollama API request failed: {e}")
#         except json.JSONDecodeError as e:
#             logger.error(f"Failed to parse Ollama response: {e}")
#             raise Exception(f"Failed to parse Ollama response: {e}")

#     def _call_ollama_api_streaming(self, messages: List[Dict[str, str]]) -> str:
#         """
#         Call Ollama API with streaming for better handling of long responses
#         """
#         payload = {
#             "model": self.selected_model,
#             "messages": messages,
#             "stream": True,
#             "options": {
#                 "temperature": self.temperature,
#                 "num_ctx": 8192,
#                 "num_predict": 4000,
#                 "top_k": 40,
#                 "top_p": 0.9
#             }
#         }

#         logger.info("Starting streaming request to Ollama...")
#         full_content = ""
        
#         try:
#             with requests.post(
#                 f"{self.ollama_base_url}/api/chat",
#                 headers={"Content-Type": "application/json"},
#                 json=payload,
#                 stream=True,
#                 timeout=self.request_timeout
#             ) as response:
#                 response.raise_for_status()
                
#                 for line in response.iter_lines():
#                     if line:
#                         try:
#                             chunk_data = json.loads(line.decode('utf-8'))
#                             if 'message' in chunk_data and 'content' in chunk_data['message']:
#                                 content_chunk = chunk_data['message']['content']
#                                 full_content += content_chunk
                                
#                                 # Log progress periodically
#                                 if len(full_content) % 1000 == 0:
#                                     logger.info(f"Received {len(full_content)} characters...")
                                    
#                             # Check if this is the final chunk
#                             if chunk_data.get('done', False):
#                                 logger.info(f"Streaming completed. Total length: {len(full_content)} characters")
#                                 break
                                
#                         except json.JSONDecodeError:
#                             continue  # Skip malformed chunks
                            
#             return full_content
            
#         except requests.exceptions.Timeout:
#             logger.error(f"Streaming request timed out after {self.request_timeout} seconds")
#             raise Exception(f"Streaming request timed out after {self.request_timeout} seconds")
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Streaming request failed: {e}")
#             raise Exception(f"Streaming request failed: {e}")

#     def _manually_fix_deepseek_json(self, content: str) -> str:
#         """
#         Manually fix DeepSeek JSON formatting issues
#         """
#         logger.info("Applying manual JSON fixes...")
        
#         # Fix Python-style string joining patterns
#         def fix_join_expression(match):
#             separator = match.group(1)  # the separator like "\\n"
#             array_content = match.group(2)  # content inside the array
            
#             # Convert separator to actual character
#             actual_separator = separator.replace('\\n', '\n').replace('\\t', '\t')
            
#             # Extract items from the array (simple parsing)
#             items = []
#             current_item = ""
#             in_quotes = False
#             quote_char = None
            
#             for char in array_content:
#                 if char in ['"', "'"] and not in_quotes:
#                     in_quotes = True
#                     quote_char = char
#                 elif char == quote_char and in_quotes:
#                     in_quotes = False
#                     items.append(current_item)
#                     current_item = ""
#                     quote_char = None
#                 elif char == ',' and not in_quotes:
#                     if current_item.strip():
#                         items.append(current_item.strip())
#                         current_item = ""
#                 elif in_quotes:
#                     current_item += char
            
#             # Add the last item if there's one
#             if current_item.strip():
#                 items.append(current_item.strip())
            
#             # Join items and escape for JSON
#             result = actual_separator.join(items)
#             # Escape for JSON
#             result = result.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            
#             return f'"{result}"'
        
#         # Pattern to match "separator".join([...])
#         join_pattern = r'"([^"]*)"\.join\(\[\s*([^\]]+)\s*\]\)'
#         content = re.sub(join_pattern, fix_join_expression, content)
        
#         # Additional fixes
#         content = re.sub(r',\s*}', '}', content)  # Remove trailing commas before }
#         content = re.sub(r',\s*]', ']', content)  # Remove trailing commas before ]
        
#         logger.info(f"Fixed JSON length: {len(content)} characters")
#         return content

#     def _fix_json_formatting(self, content: str) -> str:
#         """
#         Fix common JSON formatting issues from DeepSeek responses
#         """
#         # Remove Python-style string joining
#         # Replace "\n".join([...]) with proper JSON arrays or strings
#         def replace_join_pattern(match):
#             separator = match.group(1)  # "\n" or other separator
#             items_str = match.group(2)  # the array content
            
#             try:
#                 # Try to evaluate the Python list safely
#                 import ast
#                 items = ast.literal_eval(f"[{items_str}]")
#                 # Join with the separator and escape properly for JSON
#                 joined = separator.replace('\\n', '\n').join(str(item).strip('"\'') for item in items)
#                 return f'"{joined}"'
#             except:
#                 # If that fails, just return the original
#                 return match.group(0)
        
#         # Pattern to match "\n".join([...]) or similar
#         join_pattern = r'"([^"]*)"\.join\(\[\s*([^\]]+)\s*\]\)'
#         content = re.sub(join_pattern, replace_join_pattern, content)
        
#         # Fix other common issues
#         content = content.replace('"\n"', '"\\n"')  # Fix literal newlines in strings
#         content = re.sub(r',\s*}', '}', content)    # Remove trailing commas
#         content = re.sub(r',\s*]', ']', content)    # Remove trailing commas in arrays
        
#         return content

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
#                 response = self.client.generate_content(
#                     contents=[
#                         {
#                             "role": "user",
#                             "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
#                         }
#                     ],
#                     generation_config={"temperature": self.temperature}
#                 )
#                 content = response.text.strip()

#             elif self.selected_provider == "DeepSeek":
#                 logger.info("Starting DeepSeek extraction...")
                
#                 # Create a more specific prompt for DeepSeek to avoid Python syntax
# #                 deepseek_prompt = EXTRACT_STUDENT_ANSWERS_PROMPT + """

# # IMPORTANT: Return ONLY valid JSON. Do not use Python syntax like "\\n".join([...]).
# # For multi-line answers, use proper JSON strings with \\n for newlines.
# # Example:
# # "answer": "Line 1\\nLine 2\\nLine 3"

# # NOT:
# # "answer": "\\n".join(["Line 1", "Line 2", "Line 3"])
# # """
    
#                 # DeepSeek prompt with strict metadata instructions
#                 deepseek_prompt = EXTRACT_STUDENT_ANSWERS_PROMPT + """

# IMPORTANT INSTRUCTIONS:
# - Return ONLY valid JSON.
# - DO NOT modify, infer, or reformat metadata values.
# - Copy all metadata values EXACTLY as they appear in the input (e.g., "EG/2020/4004").
# - Never add spaces, dashes, or other formatting to student_index, module_code, exam_year, or exam_month.
# - If a metadata field is missing, set it to null.
# - Do NOT add extra fields or change their names.
# - For multi-line answers, use \\n within a single JSON string.

# Example:
# "answer": "Line 1\\nLine 2\\nLine 3"

# NOT:
# "answer": "\\n".join(["Line 1", "Line 2", "Line 3"])
# """
                
#                 messages = [
#                     {"role": "system", "content": deepseek_prompt},
#                     {"role": "user", "content": raw_text}
#                 ]
                
#                 # Add a warning for long processing times
#                 logger.warning("DeepSeek-R1 may take several minutes to process due to its reasoning capabilities...")
                
#                 # Try streaming first, fall back to regular if it fails
#                 try:
#                     logger.info("Attempting streaming request...")
#                     content = self._call_ollama_api_streaming(messages).strip()
#                     logger.info("Streaming request completed successfully")
#                 except Exception as stream_error:
#                     logger.warning(f"Streaming failed, trying regular request: {stream_error}")
#                     content = self._call_ollama_api(messages).strip()
                
#                 # DeepSeek-R1 models often include thinking process in <think> tags
#                 # Extract only the actual response content
#                 if "<think>" in content and "</think>" in content:
#                     logger.info("Removing DeepSeek thinking process...")
#                     # Find the content after </think>
#                     think_end = content.find("</think>")
#                     if think_end != -1:
#                         content = content[think_end + 8:].strip()
#                         logger.info(f"Extracted content after thinking (length: {len(content)} chars)")
                
#                 # Log the actual content for debugging
#                 logger.debug(f"DeepSeek response content: {content[:200]}...")  # First 200 chars
                
#             else:
#                 raise ValueError(f"Unsupported provider: {self.selected_provider}")

#             # Clean up code block formatting if present
#             if content.startswith("```"):
#                 content = content.strip("`").replace("json", "").strip()

#             # Clean and fix common JSON issues before parsing
#             content = self._fix_json_formatting(content)
            
#             # Parse JSON response
#             structured = json.loads(content)

#             metadata = structured.get("metadata", {})
#             answers_json = structured.get("answers", {})

#         except json.JSONDecodeError as e:
#             logger.error(f"Failed to parse JSON response from {self.selected_provider}: {e}")
#             logger.error(f"Raw response content: {content}")
            
#             # For DeepSeek, try to manually fix common issues and retry
#             if self.selected_provider == "DeepSeek":
#                 logger.info("Attempting to manually fix DeepSeek JSON response...")
#                 try:
#                     fixed_content = self._manually_fix_deepseek_json(content)
#                     logger.info("Attempting to parse manually fixed JSON...")
#                     structured = json.loads(fixed_content)
                    
#                     metadata = structured.get("metadata", {})
#                     answers_json = structured.get("answers", {})
                    
#                     logger.info("✅ Successfully parsed manually fixed JSON!")
                    
#                     return self._flatten_structure(
#                         answers_json,
#                         metadata.get("student_index"),
#                         metadata.get("module_code"),
#                         metadata.get("exam_year"),
#                         metadata.get("exam_month")
#                     )
#                 except Exception as fix_error:
#                     logger.error(f"Manual JSON fix also failed: {fix_error}")
            
#             return []
#         except Exception as e:
#             logger.error(f"LLM extraction failed with {self.selected_provider}: {e}")
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

#     def test_connection(self) -> bool:
#         """
#         Test the connection to the selected provider
#         """
#         try:
#             if self.selected_provider == "DeepSeek":
#                 # Test with a simple message
#                 test_messages = [{"role": "user", "content": "Hello, respond with 'Connection successful'"}]
#                 response = self._call_ollama_api(test_messages)
#                 return "successful" in response.lower() or len(response.strip()) > 0
            
#             # For other providers, you can add similar test methods
#             return True
            
#         except Exception as e:
#             logger.error(f"Connection test failed for {self.selected_provider}: {e}")
#             return False

#     def get_available_models(self) -> List[str]:
#         """
#         Get list of available models for the selected provider
#         """
#         if self.selected_provider == "DeepSeek":
#             try:
#                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
#                 response.raise_for_status()
#                 data = response.json()
#                 models = [model.get("name", "") for model in data.get("models", [])]
#                 return [model for model in models if "deepseek" in model.lower()]
#             except Exception as e:
#                 logger.error(f"Failed to get available models: {e}")
#                 return []
        
#         # For other providers, return empty list or implement similar functionality
#         return []

#     @property
#     def provider_suffix(self) -> str:
#         """
#         Get the provider suffix for file naming and compatibility
#         """
#         mapping = {
#             "DeepSeek": "deepseek",
#             "GoogleGemini": "gemini",
#             "OpenAI": "openai"
#         }
#         return mapping.get(self.selected_provider, self.selected_provider.lower())

########################################################
# import logging
# import os
# import json
# import requests
# import re
# from typing import List, Dict, Optional
# from dotenv import load_dotenv
# from openai import OpenAI as OpenAIClient
# import google.generativeai as genai

# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT
# # from ..services.local_finetune_model import LocalFinetuneDeepseek


# logger = logging.getLogger(__name__)
# load_dotenv()


# class AnswerExtractor:
#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3,
#                  ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature
#         self.ollama_base_url = ollama_base_url
#         self.request_timeout = request_timeout  # 10 minutes default for DeepSeek reasoning models

#         if selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)

#         elif selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(model_name=self.selected_model)

#         elif selected_provider == "DeepSeek":
#             # Validate that Ollama is running
#             try:
#                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
#                 if response.status_code != 200:
#                     raise ConnectionError("Ollama server not responding")
#                 logger.info("✅ Connected to Ollama successfully")
#             except requests.exceptions.ConnectionError:
#                 raise ConnectionError(f"❌ Cannot connect to Ollama at {self.ollama_base_url}. Please start Ollama.")
        
#         elif selected_provider == "LocalFinetunedDeepseek":
            
#             self.client = LocalFinetuneDeepseek()
#             logger.info("✅ Connected to LocalFinetuneDeepseek successfully")      
        
#         else:
#             raise ValueError(f"Unsupported provider: {selected_provider}")

#     # -----------------------------
#     # Ollama (DeepSeek) API Helpers
#     # -----------------------------
#     def _call_ollama_api(self, messages: List[Dict[str, str]]) -> str:
#         payload = {
#             "model": self.selected_model,
#             "messages": messages,
#             "stream": False,
#             "options": {
#                 "temperature": self.temperature,
#                 "num_ctx": 8192,
#                 "num_predict": 4000,
#                 "top_k": 40,
#                 "top_p": 0.9
#             }
#         }

#         try:
#             response = requests.post(
#                 f"{self.ollama_base_url}/api/chat",
#                 headers={"Content-Type": "application/json"},
#                 json=payload,
#                 timeout=self.request_timeout
#             )
#             response.raise_for_status()
#             data = response.json()
#             return data.get("message", {}).get("content", "")
#         except Exception as e:
#             logger.error(f"Ollama request failed: {e}")
#             raise

#     def _call_ollama_api_streaming(self, messages: List[Dict[str, str]]) -> str:
#         payload = {
#             "model": self.selected_model,
#             "messages": messages,
#             "stream": True,
#             "options": {
#                 "temperature": self.temperature,
#                 "num_ctx": 8192,
#                 "num_predict": 4000,
#                 "top_k": 40,
#                 "top_p": 0.9
#             }
#         }

#         logger.info("🔄 Streaming response from DeepSeek...")
#         full_content = ""

#         with requests.post(
#             f"{self.ollama_base_url}/api/chat",
#             headers={"Content-Type": "application/json"},
#             json=payload,
#             stream=True,
#             timeout=self.request_timeout
#         ) as response:
#             response.raise_for_status()
#             for line in response.iter_lines():
#                 if not line:
#                     continue
#                 try:
#                     chunk = json.loads(line.decode('utf-8'))
#                     msg = chunk.get("message", {}).get("content", "")
#                     full_content += msg
#                     if chunk.get("done"):
#                         break
#                 except json.JSONDecodeError:
#                     continue

#         logger.info(f"✅ Streaming complete. Total length: {len(full_content)} chars")
#         return full_content

#     # -----------------------------
#     # JSON Cleanup Helpers
#     # -----------------------------
#     def _fix_json_formatting(self, content: str) -> str:
#         """Fix DeepSeek-style invalid JSON with Python syntax or trailing commas"""
#         content = re.sub(r'"[^"]*"\.join\(\[[^\]]*\]\)', '"INVALID_JOIN_SYNTAX"', content)
#         content = re.sub(r',\s*([\]}])', r'\1', content)  # Remove trailing commas
#         content = content.replace('“', '"').replace('”', '"')
#         content = re.sub(r"\\'", "'", content)
#         return content.strip()

#     def _manually_fix_deepseek_json(self, content: str) -> str:
#         """Try to recover valid JSON from malformed DeepSeek responses"""
#         content = self._fix_json_formatting(content)
#         match = re.search(r'\{.*\}', content, re.DOTALL)
#         return match.group(0) if match else content

#     # -----------------------------
#     # Main Extraction Logic
#     # -----------------------------
#     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#         logger.info(f"🧠 Extracting answers using {self.selected_provider} - {self.selected_model}")

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
#                 response = self.client.generate_content(
#                     contents=[{"role": "user", "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]}],
#                     generation_config={"temperature": self.temperature}
#                 )
#                 content = response.text.strip()

#             elif self.selected_provider == "DeepSeek":
#                 deepseek_prompt = EXTRACT_STUDENT_ANSWERS_PROMPT + """

# IMPORTANT OUTPUT RULES:
# - Return ONLY valid JSON (no markdown, no text).
# - Never use Python expressions like "\\n".join([...]).
# - Multi-line answers must use "\\n" inside a single string.
# - Preserve metadata exactly as in input (e.g., "EG/2020/4004").
# - If missing, use null for any metadata field.
# - JSON keys: "metadata" and "answers" are mandatory.
# Example:
# {
#   "metadata": {"student_index": "EG/2020/4004", "module_code": "CS6050", "exam_year": 2025, "exam_month": "June"},
#   "answers": {"Q1_a": {"answer": "First line\\nSecond line"}}
# }
# """
#                 messages = [
#                     {"role": "system", "content": deepseek_prompt},
#                     {"role": "user", "content": raw_text}
#                 ]

#                 logger.warning("DeepSeek-R1 may take several minutes to process...")
#                 try:
#                     content = self._call_ollama_api_streaming(messages).strip()
#                 except Exception as e:
#                     logger.warning(f"Streaming failed: {e}. Trying regular request...")
#                     content = self._call_ollama_api(messages).strip()

#                 # Remove DeepSeek reasoning (<think> blocks)
#                 if "<think>" in content and "</think>" in content:
#                     content = content.split("</think>")[-1].strip()
                    
#             elif selected_provider == "LocalFinetunedDeepSeek":
#                 from src.services.local_finetuned_extractor import LocalFinetunedExtractor
#                 self.model = LocalFinetunedExtractor(selected_model)
#                 prompt = f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"
#                 content = local_model.extract(prompt)

                
#             else:
#                 raise ValueError(f"Unsupported provider: {self.selected_provider}")

#             # Cleanup code blocks like ```json ... ```
#             if content.startswith("```"):
#                 content = re.sub(r"^```[a-zA-Z]*|```$", "", content).strip()

#             # Fix formatting issues before parsing
#             content = self._fix_json_formatting(content)

#             # Parse JSON
#             structured = json.loads(content)
#             metadata = structured.get("metadata", {})
#             answers_json = structured.get("answers", {})

#         except json.JSONDecodeError:
#             logger.error(f"❌ JSON parsing failed. Attempting repair...")
#             if self.selected_provider == "DeepSeek":
#                 try:
#                     fixed_content = self._manually_fix_deepseek_json(content)
#                     structured = json.loads(fixed_content)
#                     metadata = structured.get("metadata", {})
#                     answers_json = structured.get("answers", {})
#                     logger.info("✅ Fixed JSON successfully!")
#                 except Exception as fix_error:
#                     logger.error(f"Manual JSON fix failed: {fix_error}")
#                     return []
#             else:
#                 return []

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

#     # -----------------------------
#     # Utility Methods
#     # -----------------------------
#     def _flatten_structure(self, nested: dict, student_index: Optional[str],
#                            module_code: Optional[str], exam_year: Optional[int],
#                            exam_month: Optional[int]) -> List[StudentAnswer]:
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

#     def test_connection(self) -> bool:
#         try:
#             if self.selected_provider == "DeepSeek":
#                 msg = [{"role": "user", "content": "Hello, respond with 'Connection successful'"}]
#                 resp = self._call_ollama_api(msg)
#                 return "successful" in resp.lower() or len(resp.strip()) > 0
#             return True
#         except Exception as e:
#             logger.error(f"Connection test failed: {e}")
#             return False

#     def get_available_models(self) -> List[str]:
#         if self.selected_provider == "DeepSeek":
#             try:
#                 data = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10).json()
#                 return [m["name"] for m in data.get("models", []) if "deepseek" in m["name"].lower()]
#             except Exception as e:
#                 logger.error(f"Failed to get models: {e}")
#                 return []
#         return []

#     @property
#     def provider_suffix(self) -> str:
#         return {
#             "DeepSeek": "deepseek",
#             "GoogleGemini": "gemini",
#             "OpenAI": "openai",
#             "LocalFinetunedDeepSeek": "localfinetuneddeepseek"
#         }.get(self.selected_provider, self.selected_provider.lower())


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
# from src.services.local_finetuned_extractor import LocalFinetunedExtractor

logger = logging.getLogger(__name__)
load_dotenv()


class AnswerExtractor:
    def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3,
                 ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature
        self.ollama_base_url = ollama_base_url
        self.request_timeout = request_timeout  # 10 minutes default for DeepSeek reasoning models

        if selected_provider == "OpenAI" or selected_provider == "LocalFinetunedDeepSeek":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.client = OpenAIClient(api_key=self.api_key)

        elif selected_provider == "GoogleGemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(model_name=self.selected_model)

        elif selected_provider == "DeepSeek" :
            # Validate that Ollama is running
            try:
                response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
                if response.status_code != 200:
                    raise ConnectionError("Ollama server not responding")
                logger.info("✅ Connected to Ollama successfully")
            except requests.exceptions.ConnectionError:
                raise ConnectionError(f"❌ Cannot connect to Ollama at {self.ollama_base_url}. Please start Ollama.")
        
            
        else:
            raise ValueError(f"Unsupported provider: {selected_provider}")

    # -----------------------------
    # Ollama (DeepSeek) API Helpers
    # -----------------------------
    def _call_ollama_api(self, messages: List[Dict[str, str]]) -> str:
        payload = {
            "model": self.selected_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_ctx": 8192,
                "num_predict": 4000,
                "top_k": 40,
                "top_p": 0.9
            }
        }

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
            logger.error(f"Ollama request failed: {e}")
            raise

    def _call_ollama_api_streaming(self, messages: List[Dict[str, str]]) -> str:
        payload = {
            "model": self.selected_model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": self.temperature,
                "num_ctx": 8192,
                "num_predict": 4000,
                "top_k": 40,
                "top_p": 0.9
            }
        }

        logger.info("🔄 Streaming response from DeepSeek...")
        full_content = ""

        with requests.post(
            f"{self.ollama_base_url}/api/chat",
            headers={"Content-Type": "application/json"},
            json=payload,
            stream=True,
            timeout=self.request_timeout
        ) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if not line:
                    continue
                try:
                    chunk = json.loads(line.decode('utf-8'))
                    msg = chunk.get("message", {}).get("content", "")
                    full_content += msg
                    if chunk.get("done"):
                        break
                except json.JSONDecodeError:
                    continue

        logger.info(f"✅ Streaming complete. Total length: {len(full_content)} chars")
        return full_content

    # -----------------------------
    # JSON Cleanup Helpers
    # -----------------------------
    def _fix_json_formatting(self, content: str) -> str:
        """Fix DeepSeek-style invalid JSON with Python syntax or trailing commas"""
        content = re.sub(r'"[^"]*"\.join\(\[[^\]]*\]\)', '"INVALID_JOIN_SYNTAX"', content)
        content = re.sub(r',\s*([\]}])', r'\1', content)  # Remove trailing commas
        content = content.replace('“', '"').replace('”', '"')
        content = re.sub(r"\\'", "'", content)
        return content.strip()

    def _manually_fix_deepseek_json(self, content: str) -> str:
        """Try to recover valid JSON from malformed DeepSeek responses"""
        content = self._fix_json_formatting(content)
        match = re.search(r'\{.*\}', content, re.DOTALL)
        return match.group(0) if match else content

    # -----------------------------
    # Main Extraction Logic
    # -----------------------------
    def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
        logger.info(f"🧠 Extracting answers using {self.selected_provider} - {self.selected_model}")

        try:
            if self.selected_provider in ["OpenAI", "LocalFinetunedDeepSeek"]:
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
                    contents=[{"role": "user", "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]}],
                    generation_config={"temperature": self.temperature}
                )
                content = response.text.strip()

            elif self.selected_provider =="DeepSeek":
                deepseek_prompt = EXTRACT_STUDENT_ANSWERS_PROMPT + """

IMPORTANT OUTPUT RULES:
- Return ONLY valid JSON (no markdown, no text).
- Never use Python expressions like "\\n".join([...]).
- Multi-line answers must use "\\n" inside a single string.
- Preserve metadata exactly as in input (e.g., "EG/2020/4004").
- If missing, use null for any metadata field.
- JSON keys: "metadata" and "answers" are mandatory.
Example:
{
  "metadata": {"student_index": "EG/2020/4004", "module_code": "CS6050", "exam_year": 2025, "exam_month": "June"},
  "answers": {"Q1_a": {"answer": "First line\\nSecond line"}}
}
"""
                messages = [
                    {"role": "system", "content": deepseek_prompt},
                    {"role": "user", "content": raw_text}
                ]

                logger.warning("DeepSeek-R1 may take several minutes to process...")
                try:
                    content = self._call_ollama_api_streaming(messages).strip()
                except Exception as e:
                    logger.warning(f"Streaming failed: {e}. Trying regular request...")
                    content = self._call_ollama_api(messages).strip()

                # Remove DeepSeek reasoning (<think> blocks)
                if "<think>" in content and "</think>" in content:
                    content = content.split("</think>")[-1].strip()
                    
            # elif self.selected_provider == "LocalFinetunedDeepSeek":
            #     from src.services.local_finetuned_extractor import LocalFinetunedExtractor
            #     local_model = LocalFinetunedExtractor(self.selected_model)
            #     prompt = f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"
            #     content = local_model.extract(prompt)
            
            # elif self.selected_provider == "LocalFinetunedDeepSeek":
            #     logger.info("🧠 Using local fine-tuned DeepSeek model for extraction...")
            #     try:
            #         local_model = LocalFinetunedExtractor(self.selected_model)
            #         prompt = f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"
            #         content = local_model.extract(prompt)

            #         # Remove <think> blocks if any
            #         if "<think>" in content and "</think>" in content:
            #             content = content.split("</think>")[-1].strip()

            #         # Always parse JSON (safe now)
            #         structured = json.loads(content)
            #         metadata = structured.get("metadata", {})
            #         answers_json = structured.get("answers", {})

            #         return self._flatten_structure(
            #             answers_json,
            #             metadata.get("student_index"),
            #             metadata.get("module_code"),
            #             metadata.get("exam_year"),
            #             metadata.get("exam_month")
            #         )

            #     except Exception as e:
            #         logger.error(f"❌ Local fine-tuned DeepSeek extraction failed: {e}")
            #         return []


            else:
                raise ValueError(f"Unsupported provider: {self.selected_provider}")

            # Cleanup code blocks like ```json ... ```
            if content.startswith("```"):
                content = re.sub(r"^```[a-zA-Z]*|```$", "", content).strip()

            # Fix formatting issues before parsing
            content = self._fix_json_formatting(content)

            # Parse JSON
            structured = json.loads(content)
            metadata = structured.get("metadata", {})
            answers_json = structured.get("answers", {})

        except json.JSONDecodeError:
            logger.error(f"❌ JSON parsing failed. Attempting repair...")
            if self.selected_provider == "DeepSeek":
                try:
                    fixed_content = self._manually_fix_deepseek_json(content)
                    structured = json.loads(fixed_content)
                    metadata = structured.get("metadata", {})
                    answers_json = structured.get("answers", {})
                    logger.info("✅ Fixed JSON successfully!")
                except Exception as fix_error:
                    logger.error(f"Manual JSON fix failed: {fix_error}")
                    return []
            else:
                return []

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

    # -----------------------------
    # Utility Methods
    # -----------------------------
    def _flatten_structure(self, nested: dict, student_index: Optional[str],
                           module_code: Optional[str], exam_year: Optional[int],
                           exam_month: Optional[int]) -> List[StudentAnswer]:
        answers = []

        def recurse(keys: List[str], value):
            if isinstance(value, str):
                answers.append(StudentAnswer(
                    question_id=keys[0] if len(keys) > 0 else None,
                    sub_question_id=keys[1] if len(keys) > 1 else None,
                    sub_sub_question_id=keys[2] if len(keys) > 2 else None,
                    sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
                    answer_text=value.strip(),
                    student_index=student_index,
                    module_code=module_code,
                    exam_year=exam_year,
                    exam_month=exam_month
                ))
            elif isinstance(value, dict):
                for sub_key, sub_value in value.items():
                    recurse(keys + [sub_key], sub_value)

        for main_q, subs in nested.items():
            recurse([main_q], subs)

        return answers

    def test_connection(self) -> bool:
        try:
            if self.selected_provider == "DeepSeek":
                msg = [{"role": "user", "content": "Hello, respond with 'Connection successful'"}]
                resp = self._call_ollama_api(msg)
                return "successful" in resp.lower() or len(resp.strip()) > 0
            return True
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False

    def get_available_models(self) -> List[str]:
        if self.selected_provider == "DeepSeek":
            try:
                data = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10).json()
                return [m["name"] for m in data.get("models", []) if "deepseek" in m["name"].lower()]
            except Exception as e:
                logger.error(f"Failed to get models: {e}")
                return []
        return []

    @property
    def provider_suffix(self) -> str:
        return {
            "DeepSeek": "deepseek",
            "GoogleGemini": "gemini",
            "OpenAI": "openai",
            "LocalFinetunedDeepSeek": "localfinetuneddeepseek"
        }.get(self.selected_provider, self.selected_provider.lower())
