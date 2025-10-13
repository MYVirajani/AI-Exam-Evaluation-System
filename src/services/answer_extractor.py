

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
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                 generation_config={"temperature": temperature}
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


# # # import logging
# # # import os
# # # import json
# # # from typing import List, Optional
# # # from dotenv import load_dotenv

# # # from openai import OpenAI as OpenAIClient  # Only causes issue if openai is not installed

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
# # from typing import List, Dict, Optional
# # from dotenv import load_dotenv

# # # from ..models.student_answer import StudentAnswer
# # # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # logger = logging.getLogger(__name__)
# # load_dotenv()


# # class AnswerExtractor:
# #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# #         self.selected_provider = selected_provider
# #         self.selected_model = selected_model
# #         self.temperature = temperature

# #         if selected_provider == "OpenAI":
# #             # ✅ Import OpenAI client only if needed
# #             from openai import OpenAI as OpenAIClient
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

# # #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# # #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

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

# # import logging
# # import os
# # import json
# # from typing import List, Dict, Optional
# # from dotenv import load_dotenv

# # from ..models.student_answer import StudentAnswer
# # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()


# # class AnswerExtractor:
# #     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
# #         self.selected_provider = selected_provider
# #         self.selected_model = selected_model
# #         self.temperature = temperature

# #         if selected_provider == "OpenAI":
# #             try:
# #                 from openai import OpenAI as OpenAIClient
# #                 self.api_key = os.getenv("OPENAI_API_KEY")
# #                 self.client = OpenAIClient(api_key=self.api_key)
# #             except ImportError:
# #                 raise ImportError("OpenAI SDK is not installed. Please install `openai` package in this environment.")

# #         elif selected_provider == "GoogleGemini":
# #             try:
# #                 import google.generativeai as genai
# #                 self.api_key = os.getenv("GOOGLE_API_KEY")
# #                 genai.configure(api_key=self.api_key)
# #                 self.client = genai.GenerativeModel(
# #                     model_name=self.selected_model,
# #                     system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
# #                     generation_config={"temperature": temperature}
# #                 )
# #             except ImportError:
# #                 raise ImportError("Google Gemini SDK is not installed. Please install `google-generativeai` package in this environment.")

# #         else:
# #             raise ValueError(f"Unsupported provider: {selected_provider}")

# #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# #         logger.info(f"Extracting answers using {self.selected_provider} - {self.selected_model}")

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

# #             elif self.selected_provider == "GoogleGemini":
# #                 response = self.client.generate_content([raw_text])
# #                 content = response.text.strip()
# #             else:
# #                 raise ValueError("Unsupported provider during LLM extraction")

# #             # Clean markdown-style response if present
# #             if content.startswith("```"):
# #                 content = content.strip("`").replace("json", "").strip()

# #             structured = json.loads(content)
# #             metadata = structured.get("metadata", {})
# #             answers_json = structured.get("answers", {})

# #         except Exception as e:
# #             logger.error(f"LLM extraction failed: {e}")
# #             return []

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

# #         return answers


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
    def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3, ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature
        self.ollama_base_url = ollama_base_url
        self.request_timeout = request_timeout  # Default 10 minutes for complex tasks

        if selected_provider == "OpenAI":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.client = OpenAIClient(api_key=self.api_key)

        elif selected_provider == "GoogleGemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(
                model_name=self.selected_model
            )

        elif selected_provider == "DeepSeek":
            # DeepSeek via Ollama - no API key needed for local instance
            # Verify Ollama is running
            try:
                response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
                if response.status_code != 200:
                    raise ConnectionError("Ollama server is not responding")
                logger.info("Connected to Ollama server successfully")
            except requests.exceptions.ConnectionError:
                raise ConnectionError(f"Cannot connect to Ollama server at {self.ollama_base_url}. Make sure Ollama is running.")

        else:
            raise ValueError(f"Unsupported provider: {selected_provider}")

    def _call_ollama_api(self, messages: List[Dict[str, str]], stream: bool = False) -> str:
        """
        Call Ollama API with the given messages
        """
        payload = {
            "model": self.selected_model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": self.temperature,
                "num_ctx": 8192,  # Increase context window
                "num_predict": 4000,  # Increase max tokens
                "top_k": 40,
                "top_p": 0.9
            }
        }

        logger.info(f"Sending request to Ollama with timeout: {self.request_timeout}s")
        
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/chat",
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=self.request_timeout
            )
            response.raise_for_status()
            
            response_data = response.json()
            content = response_data.get("message", {}).get("content", "")
            
            logger.info(f"Received response from Ollama (length: {len(content)} chars)")
            return content
            
        except requests.exceptions.Timeout:
            logger.error(f"Ollama API request timed out after {self.request_timeout} seconds")
            raise Exception(f"Ollama API request timed out after {self.request_timeout} seconds. Try increasing the timeout or using a smaller model.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama API request failed: {e}")
            raise Exception(f"Ollama API request failed: {e}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Ollama response: {e}")
            raise Exception(f"Failed to parse Ollama response: {e}")

    def _call_ollama_api_streaming(self, messages: List[Dict[str, str]]) -> str:
        """
        Call Ollama API with streaming for better handling of long responses
        """
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

        logger.info("Starting streaming request to Ollama...")
        full_content = ""
        
        try:
            with requests.post(
                f"{self.ollama_base_url}/api/chat",
                headers={"Content-Type": "application/json"},
                json=payload,
                stream=True,
                timeout=self.request_timeout
            ) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk_data = json.loads(line.decode('utf-8'))
                            if 'message' in chunk_data and 'content' in chunk_data['message']:
                                content_chunk = chunk_data['message']['content']
                                full_content += content_chunk
                                
                                # Log progress periodically
                                if len(full_content) % 1000 == 0:
                                    logger.info(f"Received {len(full_content)} characters...")
                                    
                            # Check if this is the final chunk
                            if chunk_data.get('done', False):
                                logger.info(f"Streaming completed. Total length: {len(full_content)} characters")
                                break
                                
                        except json.JSONDecodeError:
                            continue  # Skip malformed chunks
                            
            return full_content
            
        except requests.exceptions.Timeout:
            logger.error(f"Streaming request timed out after {self.request_timeout} seconds")
            raise Exception(f"Streaming request timed out after {self.request_timeout} seconds")
        except requests.exceptions.RequestException as e:
            logger.error(f"Streaming request failed: {e}")
            raise Exception(f"Streaming request failed: {e}")

    def _manually_fix_deepseek_json(self, content: str) -> str:
        """
        Manually fix DeepSeek JSON formatting issues
        """
        logger.info("Applying manual JSON fixes...")
        
        # Fix Python-style string joining patterns
        def fix_join_expression(match):
            separator = match.group(1)  # the separator like "\\n"
            array_content = match.group(2)  # content inside the array
            
            # Convert separator to actual character
            actual_separator = separator.replace('\\n', '\n').replace('\\t', '\t')
            
            # Extract items from the array (simple parsing)
            items = []
            current_item = ""
            in_quotes = False
            quote_char = None
            
            for char in array_content:
                if char in ['"', "'"] and not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif char == quote_char and in_quotes:
                    in_quotes = False
                    items.append(current_item)
                    current_item = ""
                    quote_char = None
                elif char == ',' and not in_quotes:
                    if current_item.strip():
                        items.append(current_item.strip())
                        current_item = ""
                elif in_quotes:
                    current_item += char
            
            # Add the last item if there's one
            if current_item.strip():
                items.append(current_item.strip())
            
            # Join items and escape for JSON
            result = actual_separator.join(items)
            # Escape for JSON
            result = result.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            
            return f'"{result}"'
        
        # Pattern to match "separator".join([...])
        join_pattern = r'"([^"]*)"\.join\(\[\s*([^\]]+)\s*\]\)'
        content = re.sub(join_pattern, fix_join_expression, content)
        
        # Additional fixes
        content = re.sub(r',\s*}', '}', content)  # Remove trailing commas before }
        content = re.sub(r',\s*]', ']', content)  # Remove trailing commas before ]
        
        logger.info(f"Fixed JSON length: {len(content)} characters")
        return content

    def _fix_json_formatting(self, content: str) -> str:
        """
        Fix common JSON formatting issues from DeepSeek responses
        """
        # Remove Python-style string joining
        # Replace "\n".join([...]) with proper JSON arrays or strings
        def replace_join_pattern(match):
            separator = match.group(1)  # "\n" or other separator
            items_str = match.group(2)  # the array content
            
            try:
                # Try to evaluate the Python list safely
                import ast
                items = ast.literal_eval(f"[{items_str}]")
                # Join with the separator and escape properly for JSON
                joined = separator.replace('\\n', '\n').join(str(item).strip('"\'') for item in items)
                return f'"{joined}"'
            except:
                # If that fails, just return the original
                return match.group(0)
        
        # Pattern to match "\n".join([...]) or similar
        join_pattern = r'"([^"]*)"\.join\(\[\s*([^\]]+)\s*\]\)'
        content = re.sub(join_pattern, replace_join_pattern, content)
        
        # Fix other common issues
        content = content.replace('"\n"', '"\\n"')  # Fix literal newlines in strings
        content = re.sub(r',\s*}', '}', content)    # Remove trailing commas
        content = re.sub(r',\s*]', ']', content)    # Remove trailing commas in arrays
        
        return content

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

            elif self.selected_provider == "GoogleGemini":
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

            elif self.selected_provider == "DeepSeek":
                logger.info("Starting DeepSeek extraction...")
                
                # Create a more specific prompt for DeepSeek to avoid Python syntax
                deepseek_prompt = EXTRACT_STUDENT_ANSWERS_PROMPT + """

IMPORTANT: Return ONLY valid JSON. Do not use Python syntax like "\\n".join([...]).
For multi-line answers, use proper JSON strings with \\n for newlines.
Example:
"answer": "Line 1\\nLine 2\\nLine 3"

NOT:
"answer": "\\n".join(["Line 1", "Line 2", "Line 3"])
"""
                
                messages = [
                    {"role": "system", "content": deepseek_prompt},
                    {"role": "user", "content": raw_text}
                ]
                
                # Add a warning for long processing times
                logger.warning("DeepSeek-R1 may take several minutes to process due to its reasoning capabilities...")
                
                # Try streaming first, fall back to regular if it fails
                try:
                    logger.info("Attempting streaming request...")
                    content = self._call_ollama_api_streaming(messages).strip()
                    logger.info("Streaming request completed successfully")
                except Exception as stream_error:
                    logger.warning(f"Streaming failed, trying regular request: {stream_error}")
                    content = self._call_ollama_api(messages).strip()
                
                # DeepSeek-R1 models often include thinking process in <think> tags
                # Extract only the actual response content
                if "<think>" in content and "</think>" in content:
                    logger.info("Removing DeepSeek thinking process...")
                    # Find the content after </think>
                    think_end = content.find("</think>")
                    if think_end != -1:
                        content = content[think_end + 8:].strip()
                        logger.info(f"Extracted content after thinking (length: {len(content)} chars)")
                
                # Log the actual content for debugging
                logger.debug(f"DeepSeek response content: {content[:200]}...")  # First 200 chars
                
            else:
                raise ValueError(f"Unsupported provider: {self.selected_provider}")

            # Clean up code block formatting if present
            if content.startswith("```"):
                content = content.strip("`").replace("json", "").strip()

            # Clean and fix common JSON issues before parsing
            content = self._fix_json_formatting(content)
            
            # Parse JSON response
            structured = json.loads(content)

            # Extract metadata if present (for backward compatibility)
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

