

# # import logging
# # import os
# # import json
# # from typing import List, Dict, Optional
# # from dotenv import load_dotenv
# # from openai import OpenAI as OpenAIClient
# # import google.generativeai as genai

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
# #             self.api_key = os.getenv("GOOGLE_API_KEY")
# #             genai.configure(api_key=self.api_key)
# #             self.client = genai.GenerativeModel(
# #                 model_name=self.selected_model,
# #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# #                 generation_config={"temperature": temperature}
# #             )
# #         else:
# #             raise ValueError("Unsupported provider")

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


# # # # import logging
# # # # import os
# # # # import json
# # # # from typing import List, Dict, Optional
# # # # from dotenv import load_dotenv

# # # # from openai import OpenAI as OpenAIClient  # Only causes issue if openai is not installed

# # # # from ..models.student_answer import StudentAnswer
# # # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # # # logger = logging.getLogger(__name__)
# # # # load_dotenv()


# # # # class AnswerExtractor:
# # # #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# # # #         self.selected_provider = selected_provider
# # # #         self.selected_model = selected_model
# # # #         self.temperature = temperature

# # # #         if selected_provider == "OpenAI":
# # # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # # #             self.client = OpenAIClient(api_key=self.api_key)

# # # #         elif selected_provider == "GoogleGemini":
# # # #             # ✅ Import Gemini only if needed
# # # #             import google.generativeai as genai

# # # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # # #             genai.configure(api_key=self.api_key)

# # # #             self.client = genai.GenerativeModel(
# # # #                 model_name=self.selected_model,
# # # #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # # #                 generation_config={"temperature": temperature}
# # # #             )

# # # #         else:
# # # #             raise ValueError(f"Unsupported provider: {selected_provider}")

# # # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

# # # #         try:
# # # #             if self.selected_provider == "OpenAI":
# # # #                 response = self.client.chat.completions.create(
# # # #                     model=self.selected_model,
# # # #                     messages=[
# # # #                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# # # #                         {"role": "user", "content": raw_text}
# # # #                     ],
# # # #                     temperature=self.temperature,
# # # #                     max_tokens=4000
# # # #                 )
# # # #                 content = response.choices[0].message.content.strip()
# # # #             else:
# # # #                 response = self.client.generate_content([raw_text])
# # # #                 content = response.text.strip()

# # # #             if content.startswith("```"):
# # # #                 content = content.strip("`").replace("json", "").strip()

# # # #             structured = json.loads(content)
# # # #             metadata = structured.get("metadata", {})
# # # #             answers_json = structured.get("answers", {})

# # # #         except Exception as e:
# # # #             logger.error(f"LLM extraction failed: {e}")
# # # #             return []

# # # #         return self._flatten_structure(
# # # #             answers_json,
# # # #             metadata.get("student_index"),
# # # #             metadata.get("module_code"),
# # # #             metadata.get("exam_year"),
# # # #             metadata.get("exam_month")
# # # #         )

# # # #     def _flatten_structure(
# # # #         self,
# # # #         nested: dict,
# # # #         student_index: Optional[str],
# # # #         module_code: Optional[str],
# # # #         exam_year: Optional[int],
# # # #         exam_month: Optional[int]
# # # #     ) -> List[StudentAnswer]:
# # # #         answers = []

# # # #         def recurse(keys: List[str], value):
# # # #             if isinstance(value, str):
# # # #                 answer = StudentAnswer(
# # # #                     question_id=keys[0] if len(keys) > 0 else None,
# # # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # # #                     answer_text=value.strip(),
# # # #                     student_index=student_index,
# # # #                     module_code=module_code,
# # # #                     exam_year=exam_year,
# # # #                     exam_month=exam_month
# # # #                 )
# # # #                 answers.append(answer)
# # # #             elif isinstance(value, dict):
# # # #                 for sub_key, sub_value in value.items():
# # # #                     recurse(keys + [sub_key], sub_value)

# # # #         for main_q, subs in nested.items():
# # # #             recurse([main_q], subs)

# # # #         return answers


# # # import logging
# # # import os
# # # import json
# # # from typing import List, Dict, Optional
# # # from dotenv import load_dotenv

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
# # #             # ✅ Import OpenAI client only if needed
# # #             from openai import OpenAI as OpenAIClient
# # #             self.api_key = os.getenv("OPENAI_API_KEY")
# # #             self.client = OpenAIClient(api_key=self.api_key)

# # #         elif selected_provider == "GoogleGemini":
# # #             # ✅ Import Gemini only if needed
# # #             import google.generativeai as genai
# # #             self.api_key = os.getenv("GOOGLE_API_KEY")
# # #             genai.configure(api_key=self.api_key)
# # #             self.client = genai.GenerativeModel(
# # #                 model_name=self.selected_model,
# # #                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # #                 generation_config={"temperature": temperature}
# # #             )

# # #         else:
# # #             raise ValueError(f"Unsupported provider: {selected_provider}")

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
# # #             else:
# # #                 response = self.client.generate_content([raw_text])
# # #                 content = response.text.strip()

# # #             if content.startswith("```"):
# # #                 content = content.strip("`").replace("json", "").strip()

# # #             structured = json.loads(content)
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

# # # import logging
# # # import os
# # # import json
# # # from typing import List, Dict, Optional
# # # from dotenv import load_dotenv

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
# # #             try:
# # #                 from openai import OpenAI as OpenAIClient
# # #                 self.api_key = os.getenv("OPENAI_API_KEY")
# # #                 self.client = OpenAIClient(api_key=self.api_key)
# # #             except ImportError:
# # #                 raise ImportError("OpenAI SDK is not installed. Please install `openai` package in this environment.")

# # #         elif selected_provider == "GoogleGemini":
# # #             try:
# # #                 import google.generativeai as genai
# # #                 self.api_key = os.getenv("GOOGLE_API_KEY")
# # #                 genai.configure(api_key=self.api_key)
# # #                 self.client = genai.GenerativeModel(
# # #                     model_name=self.selected_model,
# # #                     system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# # #                     generation_config={"temperature": temperature}
# # #                 )
# # #             except ImportError:
# # #                 raise ImportError("Google Gemini SDK is not installed. Please install `google-generativeai` package in this environment.")

# # #         else:
# # #             raise ValueError(f"Unsupported provider: {selected_provider}")

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
# # #                 response = self.client.generate_content([raw_text])
# # #                 content = response.text.strip()
# # #             else:
# # #                 raise ValueError("Unsupported provider during LLM extraction")

# # #             # Clean markdown-style response if present
# # #             if content.startswith("```"):
# # #                 content = content.strip("`").replace("json", "").strip()

# # #             structured = json.loads(content)
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
# # #                 answers.append(StudentAnswer(
# # #                     question_id=keys[0] if len(keys) > 0 else None,
# # #                     sub_question_id=keys[1] if len(keys) > 1 else None,
# # #                     sub_sub_question_id=keys[2] if len(keys) > 2 else None,
# # #                     sub_sub_sub_question_id=keys[3] if len(keys) > 3 else None,
# # #                     answer_text=value.strip(),
# # #                     student_index=student_index,
# # #                     module_code=module_code,
# # #                     exam_year=exam_year,
# # #                     exam_month=exam_month
# # #                 ))
# # #             elif isinstance(value, dict):
# # #                 for sub_key, sub_value in value.items():
# # #                     recurse(keys + [sub_key], sub_value)

# # #         for main_q, subs in nested.items():
# # #             recurse([main_q], subs)

# # #         return answers


# import logging
# import os
# import json
# from typing import List, Dict, Optional
# from dotenv import load_dotenv
# from openai import OpenAI as OpenAIClient
# import google.generativeai as genai

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
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)

#         elif selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model
#             )

#         else:
#             raise ValueError("Unsupported provider")

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

#             else:  # GoogleGemini
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

import logging
import os
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient
import google.generativeai as genai

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
                model_name=self.selected_model
            )

        else:
            raise ValueError("Unsupported provider")

    def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
        """
        Extract answers using LLM - only extracts question IDs and answer text.
        Metadata (student_index, module_code, etc.) should be set separately from database mapping.
        """
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

            else:  # GoogleGemini
                response = self.client.generate_content(
                    contents=[
                        {
                            "role": "user",
                            "parts": [f"{EXTRACT_STUDENT_ANSWERS_PROMPT}\n\n{raw_text}"]
                        }
                    ],
                    generation_config={"temperature": self.temperature}
                )
                content = response.text.strip()

            if content.startswith("```"):
                content = content.strip("`").replace("json", "").strip()

            structured = json.loads(content)

            # Extract metadata if present (for backward compatibility)
            metadata = structured.get("metadata", {})
            answers_json = structured.get("answers", {})

            # Create answers with extracted question structure
            answers = self._flatten_structure(
                answers_json,
                metadata.get("student_index"),
                metadata.get("module_code"), 
                metadata.get("exam_year"),
                metadata.get("exam_month")
            )
            
            logger.info(f"Successfully extracted {len(answers)} answers from document")
            return answers

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            logger.error(f"LLM response content: {content[:500]}...")
            return []
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return []

    def extract_answers_with_db_mapping(self, raw_text: str, student_index: str, module_code: str, 
                                      exam_year: int, exam_month: str) -> List[StudentAnswer]:
        """
        Extract answers and immediately apply database-mapped metadata.
        This ensures all answers have correct metadata from database regardless of what LLM extracts.
        """
        logger.info(f"Extracting answers with database mapping for {student_index} | {module_code} | {exam_year}-{exam_month}")
        
        # First extract answers normally
        answers = self.extract_answers_with_llm(raw_text)
        
        if not answers:
            return []
        
        # Override all metadata with database-mapped values
        for answer in answers:
            answer.student_index = student_index
            answer.module_code = module_code.upper()  # Normalize to uppercase
            answer.exam_year = exam_year
            answer.exam_month = exam_month
        
        logger.info(f"Applied database mapping to {len(answers)} answers")
        return answers

    def _flatten_structure(
        self,
        nested: dict,
        student_index: Optional[str],
        module_code: Optional[str],
        exam_year: Optional[int],
        exam_month: Optional[str]
    ) -> List[StudentAnswer]:
        """
        Flatten nested answer structure into list of StudentAnswer objects.
        Note: Metadata parameters are kept for backward compatibility but can be overridden later.
        """
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

    def validate_extracted_answers(self, answers: List[StudentAnswer], 
                                 expected_student_index: str = None,
                                 expected_module_code: str = None) -> Dict[str, any]:
        """
        Validate extracted answers against expected values and provide diagnostics.
        """
        validation_result = {
            'valid': True,
            'total_answers': len(answers),
            'issues': [],
            'metadata_consistency': True
        }
        
        if not answers:
            validation_result['valid'] = False
            validation_result['issues'].append("No answers extracted")
            return validation_result
        
        # Check for empty answers
        empty_answers = [ans for ans in answers if not ans.answer_text.strip()]
        if empty_answers:
            validation_result['issues'].append(f"{len(empty_answers)} empty answers found")
        
        # Check metadata consistency
        unique_students = set(ans.student_index for ans in answers if ans.student_index)
        unique_modules = set(ans.module_code for ans in answers if ans.module_code)
        unique_years = set(ans.exam_year for ans in answers if ans.exam_year)
        unique_months = set(ans.exam_month for ans in answers if ans.exam_month)
        
        if len(unique_students) > 1:
            validation_result['issues'].append(f"Inconsistent student indexes: {unique_students}")
            validation_result['metadata_consistency'] = False
        
        if len(unique_modules) > 1:
            validation_result['issues'].append(f"Inconsistent module codes: {unique_modules}")
            validation_result['metadata_consistency'] = False
            
        # Check against expected values if provided
        if expected_student_index and unique_students:
            actual_student = list(unique_students)[0]
            if actual_student != expected_student_index:
                validation_result['issues'].append(
                    f"Student index mismatch: expected {expected_student_index}, got {actual_student}"
                )
        
        if expected_module_code and unique_modules:
            actual_module = list(unique_modules)[0]
            if actual_module.upper() != expected_module_code.upper():
                validation_result['issues'].append(
                    f"Module code mismatch: expected {expected_module_code}, got {actual_module}"
                )
        
        # Check question ID patterns
        question_ids = [ans.full_question_id for ans in answers]
        duplicate_ids = []
        seen_ids = set()
        for qid in question_ids:
            if qid in seen_ids:
                duplicate_ids.append(qid)
            seen_ids.add(qid)
        
        if duplicate_ids:
            validation_result['issues'].append(f"Duplicate question IDs: {duplicate_ids}")
        
        validation_result['question_ids'] = sorted(question_ids)
        validation_result['metadata_summary'] = {
            'students': list(unique_students),
            'modules': list(unique_modules), 
            'years': list(unique_years),
            'months': list(unique_months)
        }
        
        # Overall validation
        if validation_result['issues']:
            validation_result['valid'] = len(validation_result['issues']) == 0
        
        return validation_result

    def extract_with_retry(self, raw_text: str, max_retries: int = 3, 
                          student_index: str = None, module_code: str = None,
                          exam_year: int = None, exam_month: str = None) -> List[StudentAnswer]:
        """
        Extract answers with retry logic and optional database mapping.
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"Extraction attempt {attempt + 1}/{max_retries}")
                
                if all([student_index, module_code, exam_year, exam_month]):
                    # Use database mapping if all parameters provided
                    answers = self.extract_answers_with_db_mapping(
                        raw_text, student_index, module_code, exam_year, exam_month
                    )
                else:
                    # Use standard extraction
                    answers = self.extract_answers_with_llm(raw_text)
                
                if answers:
                    # Validate the results
                    validation = self.validate_extracted_answers(
                        answers, student_index, module_code
                    )
                    
                    if validation['valid'] or attempt == max_retries - 1:
                        # Accept results if valid or this is the last attempt
                        if not validation['valid']:
                            logger.warning(f"Final attempt has validation issues: {validation['issues']}")
                        
                        logger.info(f"Successfully extracted {len(answers)} answers on attempt {attempt + 1}")
                        return answers
                    else:
                        logger.warning(f"Validation failed on attempt {attempt + 1}: {validation['issues']}")
                        if attempt < max_retries - 1:
                            logger.info(f"Retrying extraction...")
                            continue
                
                else:
                    logger.warning(f"No answers extracted on attempt {attempt + 1}")
                    if attempt < max_retries - 1:
                        logger.info(f"Retrying extraction...")
                        continue
                
            except Exception as e:
                logger.error(f"Error on extraction attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    logger.error("All extraction attempts failed")
                    raise e
                else:
                    logger.info(f"Waiting before retry...")
                    continue
        
        return []