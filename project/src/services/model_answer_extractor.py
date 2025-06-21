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
#             structured = json.loads(content)

#             results = []
#             for q_id, sub_items in structured.items():
#                 for sub_id, content_obj in sub_items.items():
#                     results.append(ModelAnswer(
#                         question_id=q_id,
#                         sub_question_id=sub_id,
#                         answer_text=content_obj.get("answer", "").strip(),
#                         guideline=content_obj.get("guideline")
#                     ))
#             return results

#         except Exception as e:
#             logger.error(f"Failed to extract model answers: {e}")
#             return []
import logging
import json
import os
import openai
import google.generativeai as genai
from openai import OpenAI as OpenAIClient
from typing import List, Dict
from dotenv import load_dotenv
from ..models.model_answer import ModelAnswer
from ..prompts.extract_model_answers_prompt import EXTRACT_MODEL_ANSWERS_PROMPT

logger = logging.getLogger(__name__)
load_dotenv()

class ModelAnswerExtractor:
    def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
        self.selected_provider = selected_provider
        self.selected_model = selected_model
        self.temperature = temperature

        if self.selected_provider == "OpenAI":
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.client = OpenAIClient(api_key=self.api_key)
        elif self.selected_provider == "GoogleGemini":
            self.api_key = os.getenv("GOOGLE_API_KEY")
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(
                model_name=self.selected_model,
                system_instruction=EXTRACT_MODEL_ANSWERS_PROMPT,
                generation_config={"temperature": self.temperature}
            )
        else:
            raise ValueError("Unsupported provider")

    def extract_model_answers(self, raw_text: str) -> List[ModelAnswer]:
        logger.info(f"Extracting model answers with {self.selected_provider} model: {self.selected_model}")
        try:
            if self.selected_provider == "OpenAI":
                response = self.client.chat.completions.create(
                    model=self.selected_model,
                    messages=[
                        {"role": "system", "content": EXTRACT_MODEL_ANSWERS_PROMPT},
                        {"role": "user", "content": raw_text}
                    ],
                    temperature=self.temperature,
                    max_tokens=3000
                )
                content = response.choices[0].message.content.strip()

            elif self.selected_provider == "GoogleGemini":
                response = self.client.generate_content([raw_text])
                content = response.text.strip()

            else:
                raise ValueError("Unsupported provider")

            logger.warning(f"RAW LLM OUTPUT:\n{content}")

            # ✅ Remove markdown code fences if present
            if content.startswith("```json"):
                content = content[len("```json"):].strip()
            if content.startswith("```"):
                content = content[len("```"):].strip()
            if content.endswith("```"):
                content = content[:-3].strip()

            structured = json.loads(content)

            results = []
            for q_id, sub_items in structured.items():
                for sub_id, content_obj in sub_items.items():
                    results.append(ModelAnswer(
                        # question_id=q_id,
                        # sub_question_id=sub_id,
                        # answer_text=content_obj.get("answer", "").strip(),
                        # guideline=content_obj.get("guideline")
                         question_id=q_id,
                         sub_question_id=sub_id,
                         question_text="",  # Placeholder since LLM does not return question_text
                         answer_text=content_obj.get("answer", "").strip(),
                         guideline=content_obj.get("guideline")
                    ))
            return results

        except Exception as e:
            logger.error(f"Failed to extract model answers: {e}")
            return []
