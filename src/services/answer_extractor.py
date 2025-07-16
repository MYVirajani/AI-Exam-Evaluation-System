
# # """Service for extracting student answers from processed PDF text."""
# # import logging
# # from typing import List, Dict, Optional, Tuple
# # import re
# # from ..models.student_answer import StudentAnswer
# # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT


# # logger = logging.getLogger(__name__)

# # class AnswerExtractor:
# #     """Service for extracting individual student answers from paper text."""
    
# #     def __init__(self):
# #         """Initialize answer extractor."""
# #         self.answer_patterns = self._initialize_answer_patterns()
# #         logger.info("Answer extractor initialized")

# #     def extract_answers(self, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> List[StudentAnswer]:
# #         """
# #         Extract student answers from the processed paper text.
        
# #         Args:
# #             page_texts: Dictionary mapping page numbers to text content
# #             paper_structure: Detected structure from PDF processor
            
# #         Returns:
# #             List of StudentAnswer objects
# #         """
# #         answers = []
# #         questions = paper_structure.get('questions', [])
        
# #         logger.info(f"Extracting answers for {len(questions)} detected questions")
        
# #         for question_info in questions:
# #             question_id = question_info['id']
            
# #             main_answer = self._extract_question_answer(question_id, page_texts, paper_structure)
# #             if main_answer:
# #                 answers.append(main_answer)
            
# #             if 'sub_questions' in question_info:
# #                 for sub_question in question_info['sub_questions']:
# #                     sub_answer = self._extract_sub_question_answer(question_id, sub_question['id'], page_texts, paper_structure)
# #                     if sub_answer:
# #                         answers.append(sub_answer)
        
# #         logger.info(f"Extracted {len(answers)} answers from paper")
# #         return answers

# #     def _extract_question_answer(self, question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
# #         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
# #         if not boundaries:
# #             logger.warning(f"No boundaries found for question {question_id}")
# #             return None

# #         start_page = boundaries.get('start_page', 1)
# #         end_page = boundaries.get('end_page', start_page)

# #         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
# #         answer_text = self._find_answer_in_text(question_id, relevant_text)

# #         return StudentAnswer(
# #             question_id=question_id,
# #             sub_question_id=None,
# #             answer_text=answer_text.strip(),
# #             page_number=start_page,
# #             coordinates=self._estimate_coordinates(answer_text, relevant_text)
# #         ) if answer_text else None

# #     def _extract_sub_question_answer(self, question_id: str, sub_question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
# #         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
# #         if not boundaries:
# #             return None

# #         start_page = boundaries.get('start_page', 1)
# #         end_page = boundaries.get('end_page', start_page)
# #         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])

# #         answer_text = self._find_sub_answer_in_text(sub_question_id, relevant_text)

# #         return StudentAnswer(
# #             question_id=question_id,
# #             sub_question_id=sub_question_id,
# #             answer_text=answer_text.strip(),
# #             page_number=start_page,
# #             coordinates=self._estimate_coordinates(answer_text, relevant_text)
# #         ) if answer_text else None

# #     def _find_answer_in_text(self, question_id: str, text: str) -> str:
# #         question_num = re.search(r'(\d+)', question_id)
# #         if not question_num:
# #             return ""

# #         q_num = question_num.group(1)
# #         patterns = [
# #             rf'(?:Question\s*)?{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|$)',
# #             rf'Q{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=Q\d+[\.\)]|$)',
# #             rf'{q_num}[\.\)]\s*(.+?)(?=\d+[\.\)]|$)',
# #             rf'(?:Question\s*)?{q_num}[\.\)]\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|\Z)',
# #         ]

# #         for pattern in patterns:
# #             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
# #             if match:
# #                 answer = self._clean_answer_text(match.group(1))
# #                 if len(answer) > 10:
# #                     return answer

# #         return self._extract_fallback_answer(q_num, text)

# #     def _find_sub_answer_in_text(self, sub_question_id: str, text: str) -> str:
# #         sub_patterns = [
# #             rf'{sub_question_id}[\.\)]\s*(.+?)(?=\n[a-zA-Z][\.\)]|\n\d+[\.\)]|\Z)',
# #             rf'\({sub_question_id}\)\s*(.+?)(?=\n\([a-zA-Z]\)|\n\d+[\.\)]|\Z)'
# #         ]
# #         for pattern in sub_patterns:
# #             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
# #             if match:
# #                 answer = self._clean_answer_text(match.group(1))
# #                 if len(answer) > 5:
# #                     return answer
# #         return ""

# #     def _clean_answer_text(self, text: str) -> str:
# #         return re.sub(r'\s+', ' ', text).strip()

# #     def _extract_fallback_answer(self, question_num: str, text: str) -> str:
# #         fallback = re.search(rf'{question_num}[\.\)]\s*(.+)', text, re.IGNORECASE | re.DOTALL)
# #         return self._clean_answer_text(fallback.group(1)) if fallback else ""

# #     def _estimate_coordinates(self, answer_text: str, page_text: str) -> Tuple[float, float, float, float]:
# #         return (0.0, 0.0, 0.0, 0.0)  # Placeholder

# #     def _initialize_answer_patterns(self) -> List[str]:
# #         return [r'Q(\d+)', r'Question\s+(\d+)', r'(\d+)[\.\)]']


# # import logging
# # import re
# # import os
# # import openai
# # from openai import OpenAI 
# # import json
# # from typing import List, Dict, Optional, Tuple
# # from ..models.student_answer import StudentAnswer
# # from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# # logger = logging.getLogger(__name__)

# # class AnswerExtractor:
# #     """Service for extracting individual student answers from paper text."""
    
# #     def __init__(self):
# #         """Initialize answer extractor."""
# #         self.answer_patterns = self._initialize_answer_patterns()
# #         openai.api_key = os.getenv("OPENAI_API_KEY")
# #         logger.info("Answer extractor initialized")

# #     def extract_answers(self, page_texts: Dict[int, str], paper_structure: Dict[str, any], use_llm: bool = False) -> List[StudentAnswer]:
# #         """
# #         Extract student answers from the processed paper text or raw text.

# #         Args:
# #             page_texts: Dictionary mapping page numbers to text content
# #             paper_structure: Detected structure from PDF processor
# #             use_llm: Optional boolean to force GPT-based extraction

# #         Returns:
# #             List of StudentAnswer objects
# #         """
# #         if use_llm or not paper_structure.get('questions'):
# #             logger.warning("Falling back to GPT-based structured extraction")
# #             full_text = "\n".join([text for text in page_texts.values()])
# #             return self.extract_answers_with_llm(full_text)

# #         answers = []
# #         questions = paper_structure.get('questions', [])
# #         logger.info(f"Extracting answers for {len(questions)} detected questions")
        
# #         for question_info in questions:
# #             question_id = question_info['id']
            
# #             main_answer = self._extract_question_answer(question_id, page_texts, paper_structure)
# #             if main_answer:
# #                 answers.append(main_answer)
            
# #             if 'sub_questions' in question_info:
# #                 for sub_question in question_info['sub_questions']:
# #                     sub_answer = self._extract_sub_question_answer(question_id, sub_question['id'], page_texts, paper_structure)
# #                     if sub_answer:
# #                         answers.append(sub_answer)
        
# #         logger.info(f"Extracted {len(answers)} answers from paper")
# #         return answers

# #     # def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# #     #     """
# #     #     Use GPT-4o to extract answers structured by main and sub-question numbers.
# #     #     """
# #     #     logger.info("Invoking GPT-4 to extract answers from raw text")
# #     #     try:
# #     #         response = openai.ChatCompletion.create(
# #     #             model="gpt-4",
# #     #             messages=[
# #     #                 {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# #     #                 {"role": "user", "content": raw_text}
# #     #             ],
# #     #             temperature=0,
# #     #             max_tokens=3000
# #     #         )
# #     #         content = response['choices'][0]['message']['content']
# #     #         structured = json.loads(content)
# #     #     except Exception as e:
# #     #         logger.error(f"Failed to extract with GPT: {e}")
# #     #         return []

# #     #     answers = []
# #     #     for q_id, sub_questions in structured.items():
# #     #         for sub_id, answer in sub_questions.items():
# #     #             answers.append(StudentAnswer(
# #     #                 question_id=q_id,
# #     #                 sub_question_id=sub_id,
# #     #                 answer_text=answer.strip(),
# #     #                 page_number=0,
# #     #                 coordinates=(0.0, 0.0, 0.0, 0.0)
# #     #             ))

# #     #     logger.info(f"LLM extracted {len(answers)} structured answers")
# #     #     return answers

# #     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
# #         """
# #         Use GPT-4 to extract answers structured by main and sub-question numbers.
# #         """
# #         logger.info("Invoking GPT-4 to extract answers from raw text")
        
# #         try:
# #             client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # ✅ New client-based usage

# #             response = client.chat.completions.create(
# #                 model="gpt-4",
# #                 messages=[
# #                     {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
# #                     {"role": "user", "content": raw_text}
# #                 ],
# #                 temperature=0,
# #                 max_tokens=3000
# #             )
# #             content = response.choices[0].message.content  # ✅ New access path
# #             structured = json.loads(content)

# #         except Exception as e:
# #             logger.error(f"Failed to extract with GPT: {e}")
# #             return []

# #         answers = []
# #         for q_id, sub_questions in structured.items():
# #             for sub_id, answer in sub_questions.items():
# #                 answers.append(StudentAnswer(
# #                     question_id=q_id,
# #                     sub_question_id=sub_id,
# #                     answer_text=answer.strip(),
# #                     page_number=0,
# #                     coordinates=(0.0, 0.0, 0.0, 0.0)
# #                 ))

# #         logger.info(f"LLM extracted {len(answers)} structured answers")
# #         return answers


# #     def _extract_question_answer(self, question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
# #         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
# #         if not boundaries:
# #             logger.warning(f"No boundaries found for question {question_id}")
# #             return None

# #         start_page = boundaries.get('start_page', 1)
# #         end_page = boundaries.get('end_page', start_page)
# #         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
# #         answer_text = self._find_answer_in_text(question_id, relevant_text)

# #         return StudentAnswer(
# #             question_id=question_id,
# #             sub_question_id=None,
# #             answer_text=answer_text.strip(),
# #             page_number=start_page,
# #             coordinates=self._estimate_coordinates(answer_text, relevant_text)
# #         ) if answer_text else None

# #     def _extract_sub_question_answer(self, question_id: str, sub_question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
# #         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
# #         if not boundaries:
# #             return None

# #         start_page = boundaries.get('start_page', 1)
# #         end_page = boundaries.get('end_page', start_page)
# #         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
# #         answer_text = self._find_sub_answer_in_text(sub_question_id, relevant_text)

# #         return StudentAnswer(
# #             question_id=question_id,
# #             sub_question_id=sub_question_id,
# #             answer_text=answer_text.strip(),
# #             page_number=start_page,
# #             coordinates=self._estimate_coordinates(answer_text, relevant_text)
# #         ) if answer_text else None

# #     def _find_answer_in_text(self, question_id: str, text: str) -> str:
# #         question_num = re.search(r'(\d+)', question_id)
# #         if not question_num:
# #             return ""
# #         q_num = question_num.group(1)
# #         patterns = [
# #             rf'(?:Question\s*)?{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|$)',
# #             rf'Q{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=Q\d+[\.\)]|$)',
# #             rf'{q_num}[\.\)]\s*(.+?)(?=\d+[\.\)]|$)',
# #             rf'(?:Question\s*)?{q_num}[\.\)]\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|\Z)',
# #         ]
# #         for pattern in patterns:
# #             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
# #             if match:
# #                 answer = self._clean_answer_text(match.group(1))
# #                 if len(answer) > 10:
# #                     return answer
# #         return self._extract_fallback_answer(q_num, text)

# #     def _find_sub_answer_in_text(self, sub_question_id: str, text: str) -> str:
# #         sub_patterns = [
# #             rf'{sub_question_id}[\.\)]\s*(.+?)(?=\n[a-zA-Z][\.\)]|\n\d+[\.\)]|\Z)',
# #             rf'\({sub_question_id}\)\s*(.+?)(?=\n\([a-zA-Z]\)|\n\d+[\.\)]|\Z)'
# #         ]
# #         for pattern in sub_patterns:
# #             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
# #             if match:
# #                 answer = self._clean_answer_text(match.group(1))
# #                 if len(answer) > 5:
# #                     return answer
# #         return ""

# #     def _clean_answer_text(self, text: str) -> str:
# #         return re.sub(r'\s+', ' ', text).strip()

# #     def _extract_fallback_answer(self, question_num: str, text: str) -> str:
# #         fallback = re.search(rf'{question_num}[\.\)]\s*(.+)', text, re.IGNORECASE | re.DOTALL)
# #         return self._clean_answer_text(fallback.group(1)) if fallback else ""

# #     def _estimate_coordinates(self, answer_text: str, page_text: str) -> Tuple[float, float, float, float]:
# #         return (0.0, 0.0, 0.0, 0.0)

# #     def _initialize_answer_patterns(self) -> List[str]:
# #         return [r'Q(\d+)', r'Question\s+(\d+)', r'(\d+)[\.\)]']
# import logging
# import re
# import os
# import json
# import openai
# import google.generativeai as genai
# from openai import OpenAI as OpenAIClient
# from typing import List, Dict, Optional, Tuple
# from dotenv import load_dotenv
# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()


# class AnswerExtractor:
#     """Service for extracting individual student answers from paper text."""

#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         """Initialize answer extractor."""
#         self.answer_patterns = self._initialize_answer_patterns()
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if self.selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)
#             logger.info(f"Initialized OpenAI client with model: {self.selected_model}")
#         elif self.selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                 generation_config={"temperature": self.temperature}
#             )
#             logger.info(f"Initialized Google Gemini client with model: {self.selected_model}")
#         else:
#             raise ValueError("Unsupported LLM provider. Use 'OpenAI' or 'GoogleGemini'.")

#     def extract_answers(self, page_texts: Dict[int, str], paper_structure: Dict[str, any], use_llm: bool = False) -> List[StudentAnswer]:
#         if use_llm or not paper_structure.get('questions'):
#             logger.warning("Falling back to LLM-based structured extraction.")
#             full_text = "\n".join([text for text in page_texts.values()])
#             return self.extract_answers_with_llm(full_text)

#         answers = []
#         questions = paper_structure.get('questions', [])
#         logger.info(f"Extracting answers for {len(questions)} detected questions")

#         for question_info in questions:
#             question_id = question_info['id']

#             main_answer = self._extract_question_answer(question_id, page_texts, paper_structure)
#             if main_answer:
#                 answers.append(main_answer)

#             if 'sub_questions' in question_info:
#                 for sub_question in question_info['sub_questions']:
#                     sub_answer = self._extract_sub_question_answer(question_id, sub_question['id'], page_texts, paper_structure)
#                     if sub_answer:
#                         answers.append(sub_answer)

#         logger.info(f"Extracted {len(answers)} answers using non-LLM extraction")
#         return answers

#     # def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#     #     """Extract answers from raw text using the selected LLM."""
#     #     logger.info(f"Extracting answers with {self.selected_provider} model: {self.selected_model}")

#     #     try:
#     #         if self.selected_provider == "OpenAI":
#     #             response = self.client.chat.completions.create(
#     #                 model=self.selected_model,
#     #                 messages=[
#     #                     {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#     #                     {"role": "user", "content": raw_text}
#     #                 ],
#     #                 temperature=0,
#     #                 max_tokens=3000
#     #             )
#     #             content = response.choices[0].message.content

#     #         elif self.selected_provider == "GoogleGemini":
#     #             response = self.client.generate_content([
#     #                 raw_text
#     #             ])
#     #             content = response.text

#     #         structured = json.loads(content)

#     #     except Exception as e:
#     #         logger.error(f"Failed to extract with {self.selected_provider}: {e}")
#     #         return []

#     #     answers = []
#     #     for q_id, sub_questions in structured.items():
#     #         for sub_id, answer in sub_questions.items():
#     #             answers.append(StudentAnswer(
#     #                 question_id=q_id,
#     #                 sub_question_id=sub_id,
#     #                 answer_text=answer.strip(),
#     #                 page_number=0,
#     #                 coordinates=(0.0, 0.0, 0.0, 0.0)
#     #             ))

#     #     logger.info(f"{self.selected_provider} extracted {len(answers)} answers")
#     #     return answers
#     # def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#     #     """Extract answers from raw text using the selected LLM."""
#     #     logger.info(f"Extracting answers with {self.selected_provider} model: {self.selected_model}")

#     #     try:
#     #         if self.selected_provider == "OpenAI":
#     #             response = self.client.chat.completions.create(
#     #                 model=self.selected_model,
#     #                 messages=[
#     #                     {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#     #                     {"role": "user", "content": raw_text}
#     #                 ],
#     #                 temperature=0,
#     #                 max_tokens=3000
#     #             )
#     #             content = response.choices[0].message.content
#     #         elif self.selected_provider == "GoogleGemini":
#     #             response = self.client.generate_content([raw_text])
#     #             content = response.text
#     #         else:
#     #             raise ValueError("Unsupported provider.")

#     #         if not content:
#     #             logger.error(f"{self.selected_provider} returned empty content.")
#     #             return []

#     #         # Log entire output to debug what's returned
#     #         logger.warning(f"RAW LLM OUTPUT:\n{content}")

#     #         try:
#     #             structured = json.loads(content)
#     #         except json.JSONDecodeError as e:
#     #             logger.error(f"Failed to parse JSON: {e}")
#     #             return []

#     #     except Exception as e:
#     #         logger.error(f"Failed to extract with {self.selected_provider}: {e}")
#     #         return []

#     #     answers = []
#     #     for q_id, sub_questions in structured.items():
#     #         for sub_id, answer in sub_questions.items():
#     #             answers.append(StudentAnswer(
#     #                 question_id=q_id,
#     #                 sub_question_id=sub_id,
#     #                 answer_text=answer.strip(),
#     #                 page_number=0,
#     #                 coordinates=(0.0, 0.0, 0.0, 0.0)
#     #             ))

#     #     logger.info(f"{self.selected_provider} extracted {len(answers)} answers")
#     #     return answers
#     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#         """Extract answers from raw text using the selected LLM."""
#         logger.info(f"Extracting answers with {self.selected_provider} model: {self.selected_model}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=0,
#                     max_tokens=3000
#                 )
#                 content = response.choices[0].message.content.strip()

#             elif self.selected_provider == "GoogleGemini":
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()

#             else:
#                 raise ValueError("Unsupported provider.")

#             if not content:
#                 logger.error(f"{self.selected_provider} returned empty content. Check API response or prompt.")
#                 return []

#             # Log the raw output to help debug formatting issues
#             logger.warning(f"RAW LLM OUTPUT:\n{content}")

#             try:
#                 structured = json.loads(content)
#             except json.JSONDecodeError as json_err:
#                 logger.error(f"Failed to parse JSON from {self.selected_provider} output:\n{content}")
#                 logger.error(f"JSON Error: {json_err}")
#                 return []

#         except Exception as e:
#             logger.error(f"Failed to extract with {self.selected_provider}: {e}")
#             return []

#         answers = []
#         for q_id, sub_questions in structured.items():
#             for sub_id, answer in sub_questions.items():
#                 answers.append(StudentAnswer(
#                     question_id=q_id,
#                     sub_question_id=sub_id,
#                     answer_text=answer.strip(),
#                     page_number=0,
#                     coordinates=(0.0, 0.0, 0.0, 0.0)
#                 ))

#         logger.info(f"{self.selected_provider} extracted {len(answers)} answers")
#         return answers


#     def _extract_question_answer(self, question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
#         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
#         if not boundaries:
#             logger.warning(f"No boundaries found for question {question_id}")
#             return None

#         start_page = boundaries.get('start_page', 1)
#         end_page = boundaries.get('end_page', start_page)
#         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
#         answer_text = self._find_answer_in_text(question_id, relevant_text)

#         return StudentAnswer(
#             question_id=question_id,
#             sub_question_id=None,
#             answer_text=answer_text.strip(),
#             page_number=start_page,
#             coordinates=self._estimate_coordinates(answer_text, relevant_text)
#         ) if answer_text else None

#     def _extract_sub_question_answer(self, question_id: str, sub_question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
#         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
#         if not boundaries:
#             return None

#         start_page = boundaries.get('start_page', 1)
#         end_page = boundaries.get('end_page', start_page)
#         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
#         answer_text = self._find_sub_answer_in_text(sub_question_id, relevant_text)

#         return StudentAnswer(
#             question_id=question_id,
#             sub_question_id=sub_question_id,
#             answer_text=answer_text.strip(),
#             page_number=start_page,
#             coordinates=self._estimate_coordinates(answer_text, relevant_text)
#         ) if answer_text else None

#     def _find_answer_in_text(self, question_id: str, text: str) -> str:
#         question_num = re.search(r'(\d+)', question_id)
#         if not question_num:
#             return ""
#         q_num = question_num.group(1)
#         patterns = [
#             rf'(?:Question\s*)?{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|$)',
#             rf'Q{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=Q\d+[\.\)]|$)',
#             rf'{q_num}[\.\)]\s*(.+?)(?=\d+[\.\)]|$)',
#             rf'(?:Question\s*)?{q_num}[\.\)]\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|\Z)',
#         ]
#         for pattern in patterns:
#             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
#             if match:
#                 answer = self._clean_answer_text(match.group(1))
#                 if len(answer) > 10:
#                     return answer
#         return self._extract_fallback_answer(q_num, text)

#     def _find_sub_answer_in_text(self, sub_question_id: str, text: str) -> str:
#         sub_patterns = [
#             rf'{sub_question_id}[\.\)]\s*(.+?)(?=\n[a-zA-Z][\.\)]|\n\d+[\.\)]|\Z)',
#             rf'\({sub_question_id}\)\s*(.+?)(?=\n\([a-zA-Z]\)|\n\d+[\.\)]|\Z)'
#         ]
#         for pattern in sub_patterns:
#             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
#             if match:
#                 answer = self._clean_answer_text(match.group(1))
#                 if len(answer) > 5:
#                     return answer
#         return ""

#     def _clean_answer_text(self, text: str) -> str:
#         return re.sub(r'\s+', ' ', text).strip()

#     def _extract_fallback_answer(self, question_num: str, text: str) -> str:
#         fallback = re.search(rf'{question_num}[\.\)]\s*(.+)', text, re.IGNORECASE | re.DOTALL)
#         return self._clean_answer_text(fallback.group(1)) if fallback else ""

#     def _estimate_coordinates(self, answer_text: str, page_text: str) -> Tuple[float, float, float, float]:
#         return (0.0, 0.0, 0.0, 0.0)

#     def _initialize_answer_patterns(self) -> List[str]:
#         return [r'Q(\d+)', r'Question\s+(\d+)', r'(\d+)[\.\)]']
# import logging
# import re
# import os
# import json
# import openai
# import google.generativeai as genai
# from openai import OpenAI as OpenAIClient
# from typing import List, Dict, Optional, Tuple
# from dotenv import load_dotenv
# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()


# class AnswerExtractor:
#     """Service for extracting individual student answers from paper text."""

#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         """Initialize answer extractor."""
#         self.answer_patterns = self._initialize_answer_patterns()
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if self.selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)
#             logger.info(f"Initialized OpenAI client with model: {self.selected_model}")
#         elif self.selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                 generation_config={"temperature": self.temperature}
#             )
#             logger.info(f"Initialized Google Gemini client with model: {self.selected_model}")
#         else:
#             raise ValueError("Unsupported LLM provider. Use 'OpenAI' or 'GoogleGemini'.")

#     def extract_answers(self, page_texts: Dict[int, str], paper_structure: Dict[str, any], use_llm: bool = False) -> List[StudentAnswer]:
#         if use_llm or not paper_structure.get('questions'):
#             logger.warning("Falling back to LLM-based structured extraction.")
#             full_text = "\n".join([text for text in page_texts.values()])
#             return self.extract_answers_with_llm(full_text)

#         answers = []
#         questions = paper_structure.get('questions', [])
#         logger.info(f"Extracting answers for {len(questions)} detected questions")

#         for question_info in questions:
#             question_id = question_info['id']

#             main_answer = self._extract_question_answer(question_id, page_texts, paper_structure)
#             if main_answer:
#                 answers.append(main_answer)

#             if 'sub_questions' in question_info:
#                 for sub_question in question_info['sub_questions']:
#                     sub_answer = self._extract_sub_question_answer(question_id, sub_question['id'], page_texts, paper_structure)
#                     if sub_answer:
#                         answers.append(sub_answer)

#         logger.info(f"Extracted {len(answers)} answers using non-LLM extraction")
#         return answers

#     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#         """Extract answers from raw text using the selected LLM."""
#         logger.info(f"Extracting answers with {self.selected_provider} model: {self.selected_model}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=0,
#                     max_tokens=3000
#                 )
#                 content = response.choices[0].message.content.strip()

#             elif self.selected_provider == "GoogleGemini":
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()

#             else:
#                 raise ValueError("Unsupported provider.")

#             if not content:
#                 logger.error(f"{self.selected_provider} returned empty content. Check API response or prompt.")
#                 return []

#             logger.warning(f"RAW LLM OUTPUT:\n{content}")

#             # Strip markdown-style backticks and json hint
#             if content.startswith("```"):
#                 content = content.strip().strip("`")
#                 if content.lower().startswith("json"):
#                     content = content[4:].strip()

#             try:
#                 structured = json.loads(content)
#             except json.JSONDecodeError as json_err:
#                 logger.error(f"Failed to parse JSON from {self.selected_provider} output:\n{content}")
#                 logger.error(f"JSON Error: {json_err}")
#                 return []

#         except Exception as e:
#             logger.error(f"Failed to extract with {self.selected_provider}: {e}")
#             return []

#         answers = []
#         for q_id, sub_questions in structured.items():
#             for sub_id, answer in sub_questions.items():
#                 answers.append(StudentAnswer(
#                     question_id=q_id,
#                     sub_question_id=sub_id,
#                     answer_text=answer.strip(),
#                     page_number=0,
#                     coordinates=(0.0, 0.0, 0.0, 0.0)
#                 ))

#         logger.info(f"{self.selected_provider} extracted {len(answers)} answers")
#         return answers

#     def _extract_question_answer(self, question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
#         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
#         if not boundaries:
#             logger.warning(f"No boundaries found for question {question_id}")
#             return None

#         start_page = boundaries.get('start_page', 1)
#         end_page = boundaries.get('end_page', start_page)
#         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
#         answer_text = self._find_answer_in_text(question_id, relevant_text)

#         return StudentAnswer(
#             question_id=question_id,
#             sub_question_id=None,
#             answer_text=answer_text.strip(),
#             page_number=start_page,
#             coordinates=self._estimate_coordinates(answer_text, relevant_text)
#         ) if answer_text else None

#     def _extract_sub_question_answer(self, question_id: str, sub_question_id: str, page_texts: Dict[int, str], paper_structure: Dict[str, any]) -> Optional[StudentAnswer]:
#         boundaries = paper_structure.get('question_boundaries', {}).get(question_id, {})
#         if not boundaries:
#             return None

#         start_page = boundaries.get('start_page', 1)
#         end_page = boundaries.get('end_page', start_page)
#         relevant_text = "\n".join([page_texts.get(page_num, '') for page_num in range(start_page, end_page + 1)])
#         answer_text = self._find_sub_answer_in_text(sub_question_id, relevant_text)

#         return StudentAnswer(
#             question_id=question_id,
#             sub_question_id=sub_question_id,
#             answer_text=answer_text.strip(),
#             page_number=start_page,
#             coordinates=self._estimate_coordinates(answer_text, relevant_text)
#         ) if answer_text else None

#     def _find_answer_in_text(self, question_id: str, text: str) -> str:
#         question_num = re.search(r'(\d+)', question_id)
#         if not question_num:
#             return ""
#         q_num = question_num.group(1)
#         patterns = [
#             rf'(?:Question\s*)?{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|$)',
#             rf'Q{q_num}[\.\)]\s*.*?\n\s*(.+?)(?=Q\d+[\.\)]|$)',
#             rf'{q_num}[\.\)]\s*(.+?)(?=\d+[\.\)]|$)',
#             rf'(?:Question\s*)?{q_num}[\.\)]\s*(.+?)(?=(?:Question\s*)?\d+[\.\)]|\Z)',
#         ]
#         for pattern in patterns:
#             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
#             if match:
#                 answer = self._clean_answer_text(match.group(1))
#                 if len(answer) > 10:
#                     return answer
#         return self._extract_fallback_answer(q_num, text)

#     def _find_sub_answer_in_text(self, sub_question_id: str, text: str) -> str:
#         sub_patterns = [
#             rf'{sub_question_id}[\.\)]\s*(.+?)(?=\n[a-zA-Z][\.\)]|\n\d+[\.\)]|\Z)',
#             rf'\({sub_question_id}\)\s*(.+?)(?=\n\([a-zA-Z]\)|\n\d+[\.\)]|\Z)'
#         ]
#         for pattern in sub_patterns:
#             match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
#             if match:
#                 answer = self._clean_answer_text(match.group(1))
#                 if len(answer) > 5:
#                     return answer
#         return ""

#     def _clean_answer_text(self, text: str) -> str:
#         return re.sub(r'\s+', ' ', text).strip()

#     def _extract_fallback_answer(self, question_num: str, text: str) -> str:
#         fallback = re.search(rf'{question_num}[\.\)]\s*(.+)', text, re.IGNORECASE | re.DOTALL)
#         return self._clean_answer_text(fallback.group(1)) if fallback else ""

#     def _estimate_coordinates(self, answer_text: str, page_text: str) -> Tuple[float, float, float, float]:
#         return (0.0, 0.0, 0.0, 0.0)

#     def _initialize_answer_patterns(self) -> List[str]:
#         return [r'Q(\d+)', r'Question\s+(\d+)', r'(\d+)[\.\)]']
# import logging
# import os
# import json
# import openai
# import google.generativeai as genai
# from openai import OpenAI as OpenAIClient
# from typing import List, Dict, Tuple
# from dotenv import load_dotenv
# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()

# class AnswerExtractor:
#     """Service for extracting student answers from text using LLMs only."""

#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if self.selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)
#             logger.info(f"Initialized OpenAI client with model: {self.selected_model}")
#         elif self.selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                 generation_config={"temperature": self.temperature}
#             )
#             logger.info(f"Initialized Google Gemini client with model: {self.selected_model}")
#         else:
#             raise ValueError("Unsupported LLM provider. Use 'OpenAI' or 'GoogleGemini'.")

#     def extract_answers(self, page_texts: Dict[int, str]) -> List[StudentAnswer]:
#         full_text = "\n".join([text for text in page_texts.values()])
#         return self.extract_answers_with_llm(full_text)

#     def extract_answers_with_llm(self, raw_text: str) -> List[StudentAnswer]:
#         logger.info(f"Extracting answers with {self.selected_provider} model: {self.selected_model}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=0,
#                     max_tokens=3000
#                 )
#                 content = response.choices[0].message.content.strip()

#             elif self.selected_provider == "GoogleGemini":
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()
#             else:
#                 raise ValueError("Unsupported provider.")

#             if not content:
#                 logger.error(f"{self.selected_provider} returned empty content.")
#                 return []

#             logger.warning(f"RAW LLM OUTPUT:\n{content}")

#             # Handle code-style blocks or JSON markers
#             if content.startswith("```"):
#                 content = content.strip("`")
#                 if content.lower().startswith("json"):
#                     content = content[4:].strip()

#             try:
#                 structured = json.loads(content)
#             except json.JSONDecodeError as e:
#                 logger.error(f"Failed to parse JSON:\n{content}")
#                 logger.error(f"JSON Error: {e}")
#                 return []

#         except Exception as e:
#             logger.error(f"Failed to extract with {self.selected_provider}: {e}")
#             return []

#         answers = []
#         for q_id, sub_questions in structured.items():
#             for sub_id, answer in sub_questions.items():
#                 answers.append(StudentAnswer(
#                     question_id=q_id,
#                     sub_question_id=sub_id,
#                     answer_text=answer.strip(),
#                     page_number=0,
#                     coordinates=(0.0, 0.0, 0.0, 0.0)
#                 ))

#         logger.info(f"{self.selected_provider} extracted {len(answers)} answers")
#         return answers

# import logging
# import os
# import json
# import openai
# import google.generativeai as genai
# from openai import OpenAI as OpenAIClient
# from typing import List, Dict, Tuple, Optional
# from dotenv import load_dotenv
# from ..models.student_answer import StudentAnswer
# from ..prompts.extract_answers_prompt import EXTRACT_STUDENT_ANSWERS_PROMPT

# logger = logging.getLogger(__name__)
# load_dotenv()

# class AnswerExtractor:
#     """Service for extracting student answers from text using LLMs only."""

#     def __init__(self, selected_provider: str, selected_model: str, temperature: float = 0.3):
#         self.selected_provider = selected_provider
#         self.selected_model = selected_model
#         self.temperature = temperature

#         if self.selected_provider == "OpenAI":
#             self.api_key = os.getenv("OPENAI_API_KEY")
#             self.client = OpenAIClient(api_key=self.api_key)
#             logger.info(f"Initialized OpenAI client with model: {self.selected_model}")
#         elif self.selected_provider == "GoogleGemini":
#             self.api_key = os.getenv("GOOGLE_API_KEY")
#             genai.configure(api_key=self.api_key)
#             self.client = genai.GenerativeModel(
#                 model_name=self.selected_model,
#                 system_instruction=EXTRACT_STUDENT_ANSWERS_PROMPT,
#                 generation_config={"temperature": self.temperature}
#             )
#             logger.info(f"Initialized Google Gemini client with model: {self.selected_model}")
#         else:
#             raise ValueError("Unsupported LLM provider. Use 'OpenAI' or 'GoogleGemini'.")

#     def extract_answers(self, page_texts: Dict[int, str], student_index: Optional[str] = None) -> List[StudentAnswer]:
#         full_text = "\n".join([text for text in page_texts.values()])
#         return self.extract_answers_with_llm(full_text, student_index=student_index)

#     def extract_answers_with_llm(self, raw_text: str, student_index: Optional[str] = None) -> List[StudentAnswer]:
#         logger.info(f"Extracting answers with {self.selected_provider} model: {self.selected_model}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=0,
#                     max_tokens=3000
#                 )
#                 content = response.choices[0].message.content.strip()

#             elif self.selected_provider == "GoogleGemini":
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()
#             else:
#                 raise ValueError("Unsupported provider.")

#             if not content:
#                 logger.error(f"{self.selected_provider} returned empty content.")
#                 return []

#             logger.warning(f"RAW LLM OUTPUT:\n{content}")

#             if content.startswith("```"):
#                 content = content.strip("`")
#                 if content.lower().startswith("json"):
#                     content = content[4:].strip()

#             try:
#                 structured = json.loads(content)
#             except json.JSONDecodeError as e:
#                 logger.error(f"Failed to parse JSON:\n{content}")
#                 logger.error(f"JSON Error: {e}")
#                 return []

#         except Exception as e:
#             logger.error(f"Failed to extract with {self.selected_provider}: {e}")
#             return []

#         answers = []
#         for q_id, sub_questions in structured.items():
#             for sub_id, answer in sub_questions.items():
#                 answers.append(StudentAnswer(
#                     question_id=q_id,
#                     sub_question_id=sub_id,
#                     answer_text=answer.strip(),
#                     page_number=0,
#                     coordinates=(0.0, 0.0, 0.0, 0.0),
#                 ))

#         logger.info(f"{self.selected_provider} extracted {len(answers)} answers")
#         return answers


# import logging
# import os
# import json
# from typing import List, Dict, Optional, Tuple
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

#     def extract_answers_with_llm(self, raw_text: str, student_index: Optional[str] = None) -> List[StudentAnswer]:
#         logger.info(f"Extracting answers using {self.selected_provider}")

#         try:
#             if self.selected_provider == "OpenAI":
#                 response = self.client.chat.completions.create(
#                     model=self.selected_model,
#                     messages=[
#                         {"role": "system", "content": EXTRACT_STUDENT_ANSWERS_PROMPT},
#                         {"role": "user", "content": raw_text}
#                     ],
#                     temperature=0.3,
#                     max_tokens=4000
#                 )
#                 content = response.choices[0].message.content.strip()
#             else:
#                 response = self.client.generate_content([raw_text])
#                 content = response.text.strip()

#             if content.startswith("```"):
#                 content = content.strip("`").replace("json", "").strip()

#             structured = json.loads(content)

#         except Exception as e:
#             logger.error(f"LLM extraction failed: {e}")
#             return []

#         return self._flatten_structure(structured, student_index)

#     def _flatten_structure(self, nested: dict, student_index: Optional[str]) -> List[StudentAnswer]:
#         answers = []

#         def recurse(qid, sub_dict, parent_keys=[]):
#             for sub_id, value in sub_dict.items():
#                 if isinstance(value, str):  # Base case
#                     answer = StudentAnswer(
#                         question_id=qid,
#                         sub_question_id=parent_keys[0] if len(parent_keys) > 0 else None,
#                         sub_sub_question_id=parent_keys[1] if len(parent_keys) > 1 else None,
#                         answer_text=value.strip(),
#                         student_index=student_index
#                     )
#                     answers.append(answer)
#                 elif isinstance(value, dict):  # Recurse deeper
#                     recurse(qid, value, parent_keys + [sub_id])

#         for main_q, subs in nested.items():
#             recurse(main_q, subs)

#         return answers


# import logging
# import os
# import json
# from typing import List, Dict, Optional, Tuple
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

#     def extract_answers_with_llm(
#         self,
#         raw_text: str,
#         student_index: Optional[str] = None,
#         module_code: Optional[str] = None,
#         exam_year: Optional[int] = None,
#         exam_month: Optional[int] = None
#     ) -> List[StudentAnswer]:

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

#         except Exception as e:
#             logger.error(f"LLM extraction failed: {e}")
#             return []

#         return self._flatten_structure(
#             structured,
#             student_index,
#             module_code,
#             exam_year,
#             exam_month
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

#         def recurse(qid, sub_dict, parent_keys=[]):
#             for sub_id, value in sub_dict.items():
#                 if isinstance(value, str):  # Base case
#                     answer = StudentAnswer(
#                         question_id=qid,
#                         sub_question_id=parent_keys[0] if len(parent_keys) > 0 else None,
#                         sub_sub_question_id=parent_keys[1] if len(parent_keys) > 1 else None,
#                         answer_text=value.strip(),
#                         student_index=student_index,
#                         module_code=module_code,
#                         exam_year=exam_year,
#                         exam_month=exam_month
#                     )
#                     answers.append(answer)
#                 elif isinstance(value, dict):  # Recurse deeper
#                     recurse(qid, value, parent_keys + [sub_id])

#         for main_q, subs in nested.items():
#             recurse(main_q, subs)

#         return answers


# import logging
# import os
# import json
# from typing import List, Dict, Optional, Tuple
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

#         def recurse(qid, sub_dict, parent_keys=[]):
#             for sub_id, value in sub_dict.items():
#                 if isinstance(value, str):  # Base case
#                     answer = StudentAnswer(
#                         question_id=qid,
#                         sub_question_id=parent_keys[0] if len(parent_keys) > 0 else None,
#                         sub_sub_question_id=parent_keys[1] if len(parent_keys) > 1 else None,
#                         answer_text=value.strip(),
#                         student_index=student_index,
#                         module_code=module_code,
#                         exam_year=exam_year,
#                         exam_month=exam_month
#                     )
#                     answers.append(answer)
#                 elif isinstance(value, dict):  # Recurse deeper
#                     recurse(qid, value, parent_keys + [sub_id])

#         for main_q, subs in nested.items():
#             recurse(main_q, subs)

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
