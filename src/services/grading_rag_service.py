

# # # # # # # import json
# # # # # # # import logging
# # # # # # # import os
# # # # # # # from typing import List

# # # # # # # from langchain_community.chat_models import ChatOpenAI
# # # # # # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # # # # # # from langchain_community.embeddings import OpenAIEmbeddings
# # # # # # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # # # # # from langchain.prompts import PromptTemplate
# # # # # # # from langchain_community.vectorstores import PGVector
# # # # # # # from src.utils.prompt_utils import PromptTemplates

# # # # # # # from .database_services.student_answer_db import StudentAnswerService
# # # # # # # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # # # # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # # # # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # # # # # from .database_services.grading_result_db import GradingResultDB

# # # # # # # from .embedding.abstract_embedder import AbstractEmbedder
# # # # # # # from ..prompts.rag_prompts import RAGPrompts
# # # # # # # from ..models.grading_result import GradingResult, GradingMethod

# # # # # # # log = logging.getLogger(__name__)

# # # # # # # class RAGGrader:
# # # # # # #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# # # # # # #         self.provider = provider
# # # # # # #         self.top_k = top_k
# # # # # # #         self.embedder = embedder
# # # # # # #         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

# # # # # # #         if provider == "OpenAI":
# # # # # # #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# # # # # # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # # # # # #         else:
# # # # # # #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# # # # # # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# # # # # # #         # Vector store for lecture material
# # # # # # #         self.vstore = PGVector(
# # # # # # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # # # # # #             collection_name=f"lecture_material_chunks_{self.suffix}",
# # # # # # #             embedding_function=self.lc_embed,
# # # # # # #         )

# # # # # # #         # Relational DB and embedding DBs
# # # # # # #         # self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
# # # # # # #         self.stu_db = StudentAnswerService(provider_suffix=self.provider)

# # # # # # #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# # # # # # #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# # # # # # #         self.result_db = GradingResultDB()

# # # # # # #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# # # # # # #         print(f"📘 Starting grading for: {module} {month} {year}")
# # # # # # #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# # # # # # #         count = 0
# # # # # # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # # # # # #             if (mod, yr, mon) != (module, year, month):
# # # # # # #                 continue
# # # # # # #             if student and stu != student:
# # # # # # #                 continue

# # # # # # #             print(f"📝 Grading student: {stu}")
# # # # # # #             self._grade_paper(stu, mod, yr, mon, ans_list)
# # # # # # #             count += 1

# # # # # # #         if count == 0:
# # # # # # #             print("⚠️ No matching student answers found for this session.")
# # # # # # #         else:
# # # # # # #             print(f"✅ Finished grading {count} student(s).")

# # # # # # #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# # # # # # #         total = 0.0
# # # # # # #         possible = 0.0
# # # # # # #         graded_ok = 0
# # # # # # #         skipped = 0

# # # # # # #         for sa in answers:
# # # # # # #             if not sa.answer_text or sa.answer_text.strip() == "":
# # # # # # #                 skipped += 1
# # # # # # #                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
# # # # # # #                 continue

# # # # # # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # # # # # #             if not ma:
# # # # # # #                 skipped += 1
# # # # # # #                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# # # # # # #                 continue

# # # # # # #             # fetch context from lecture materials
# # # # # # #             retrieved_blocks = self._retrieve(ma["question_text"], module)

# # # # # # #             # fetch student answer embedding for RAG
# # # # # # #             student_embedding = self.stu_embed_db.get_embedding(
# # # # # # #                 student_index=stu_idx,
# # # # # # #                 full_question_id=sa.full_question_id,
# # # # # # #                 module_code=module,
# # # # # # #                 exam_year=year,
# # # # # # #                 exam_month=month
# # # # # # #             )

# # # # # # #             # send prompt to LLM
# # # # # # #             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

# # # # # # #             self.result_db.save_question_mark(
# # # # # # #                 GradingResult(
# # # # # # #                     student_index=stu_idx,
# # # # # # #                     module_code=module,
# # # # # # #                     exam_year=year,
# # # # # # #                     exam_month=month,
# # # # # # #                     full_question_id=sa.full_question_id,
# # # # # # #                     mark=score,
# # # # # # #                     max_marks=ma["max_marks"] or 0,
# # # # # # #                     reason=reason,
# # # # # # #                     grading_method=GradingMethod.RAG,
# # # # # # #                     model_name=self.chat.model_name if hasattr(self.chat, "model_name") else "unknown"
# # # # # # #                 )
# # # # # # #             )
# # # # # # #             graded_ok += 1
# # # # # # #             total += score
# # # # # # #             possible += ma["max_marks"] or 0

# # # # # # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible, model_name=self.embedder.get_model_name())
# # # # # # #         self.result_db.commit()

# # # # # # #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# # # # # # #                  stu_idx, total, possible, graded_ok, skipped)

# # # # # # #     def _retrieve(self, question_text: str, module: str) -> str:
# # # # # # #         docs = self.vstore.similarity_search(
# # # # # # #             question_text, k=self.top_k, filter={"module_code": module}
# # # # # # #         )
# # # # # # #         return "\n---\n".join(d.page_content for d in docs)

# # # # # # #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
# # # # # # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # # # # # #             question_text=ma_dict["question_text"] or "",
# # # # # # #             model_answer=ma_dict["answer_text"],
# # # # # # #             guideline=ma_dict["guideline_text"] or "",
# # # # # # #             max_marks=ma_dict["max_marks"] or 0,
# # # # # # #             retrieved_chunks=retrieved,
# # # # # # #             student_answer=student_answer_text,
# # # # # # #         )

# # # # # # #         response = self.chat.invoke(prompt).content
# # # # # # #         if response.startswith("```"):
# # # # # # #             response = response.strip("`").replace("json", "").strip()

# # # # # # #         try:
# # # # # # #             data = json.loads(response)
# # # # # # #             return float(data["score"]), data["reason"]
# # # # # # #         except Exception as e:
# # # # # # #             log.error("❌ JSON parse error: %s\nRaw LLM response: %s", e, response)
# # # # # # #             return 0.0, "Invalid LLM response"


# # # # # # import json
# # # # # # import logging
# # # # # # import os
# # # # # # import re
# # # # # # from typing import List

# # # # # # from langchain_community.chat_models import ChatOpenAI
# # # # # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # # # # # from langchain_community.embeddings import OpenAIEmbeddings
# # # # # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # # # # from langchain.prompts import PromptTemplate
# # # # # # from langchain_community.vectorstores import PGVector

# # # # # # from src.utils.prompt_utils import PromptTemplates
# # # # # # from .database_services.student_answer_db import StudentAnswerService
# # # # # # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # # # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # # # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # # # # from .database_services.grading_result_db import GradingResultDB
# # # # # # from .embedding.abstract_embedder import AbstractEmbedder
# # # # # # from ..prompts.rag_prompts import RAGPrompts
# # # # # # from ..models.grading_result import GradingResult, GradingMethod

# # # # # # log = logging.getLogger(__name__)

# # # # # # class RAGGrader:
# # # # # #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# # # # # #         self.provider = provider
# # # # # #         self.top_k = top_k
# # # # # #         self.embedder = embedder
# # # # # #         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

# # # # # #         if provider == "OpenAI":
# # # # # #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# # # # # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # # # # #         else:
# # # # # #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# # # # # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# # # # # #         # Vector store for lecture material
# # # # # #         self.vstore = PGVector(
# # # # # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # # # # #             collection_name=f"lecture_material_chunks_{self.suffix}",
# # # # # #             embedding_function=self.lc_embed,
# # # # # #         )

# # # # # #         self.stu_db = StudentAnswerService(provider_suffix=self.provider)
# # # # # #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# # # # # #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# # # # # #         self.result_db = GradingResultDB()

# # # # # #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# # # # # #         print(f"📘 Starting grading for: {module} {month} {year}")
# # # # # #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# # # # # #         count = 0
# # # # # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # # # # #             if (mod, yr, mon) != (module, year, month):
# # # # # #                 continue
# # # # # #             if student and stu != student:
# # # # # #                 continue

# # # # # #             print(f"📝 Grading student: {stu}")
# # # # # #             self._grade_paper(stu, mod, yr, mon, ans_list)
# # # # # #             count += 1

# # # # # #         if count == 0:
# # # # # #             print("⚠️ No matching student answers found for this session.")
# # # # # #         else:
# # # # # #             print(f"✅ Finished grading {count} student(s).")

# # # # # #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# # # # # #         total = 0.0
# # # # # #         possible = 0.0
# # # # # #         graded_ok = 0
# # # # # #         skipped = 0

# # # # # #         for sa in answers:
# # # # # #             if not sa.answer_text or sa.answer_text.strip() == "":
# # # # # #                 skipped += 1
# # # # # #                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
# # # # # #                 continue

# # # # # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # # # # #             if not ma:
# # # # # #                 skipped += 1
# # # # # #                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# # # # # #                 continue

# # # # # #             retrieved_blocks = self._retrieve(ma["question_text"], module)

# # # # # #             student_embedding = self.stu_embed_db.get_embedding(
# # # # # #                 student_index=stu_idx,
# # # # # #                 full_question_id=sa.full_question_id,
# # # # # #                 module_code=module,
# # # # # #                 exam_year=year,
# # # # # #                 exam_month=month
# # # # # #             )

# # # # # #             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

# # # # # #             self.result_db.save_question_mark(
# # # # # #                 GradingResult(
# # # # # #                     student_index=stu_idx,
# # # # # #                     module_code=module,
# # # # # #                     exam_year=year,
# # # # # #                     exam_month=month,
# # # # # #                     full_question_id=sa.full_question_id,
# # # # # #                     mark=score,
# # # # # #                     max_marks=ma["max_marks"] or 0,
# # # # # #                     reason=reason,
# # # # # #                     grading_method=GradingMethod.RAG,
# # # # # #                     model_name=self.chat.model_name if hasattr(self.chat, "model_name") else "unknown"
# # # # # #                 )
# # # # # #             )
# # # # # #             graded_ok += 1
# # # # # #             total += score
# # # # # #             possible += ma["max_marks"] or 0

# # # # # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible, model_name=self.embedder.get_model_name())
# # # # # #         self.result_db.commit()

# # # # # #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# # # # # #                  stu_idx, total, possible, graded_ok, skipped)

# # # # # #     def _retrieve(self, question_text: str, module: str) -> str:
# # # # # #         docs = self.vstore.similarity_search(
# # # # # #             question_text, k=self.top_k, filter={"module_code": module}
# # # # # #         )
# # # # # #         return "\n---\n".join(d.page_content for d in docs)

# # # # # #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
# # # # # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # # # # #             question_text=ma_dict["question_text"] or "",
# # # # # #             model_answer=ma_dict["answer_text"],
# # # # # #             guideline=ma_dict["guideline_text"] or "",
# # # # # #             max_marks=ma_dict["max_marks"] or 0,
# # # # # #             retrieved_chunks=retrieved,
# # # # # #             student_answer=student_answer_text,
# # # # # #         )

# # # # # #         response = self.chat.invoke(prompt).content

# # # # # #         def extract_json_object(text: str):
# # # # # #             try:
# # # # # #                 match = re.search(r'\{.*?\}', text, re.DOTALL)
# # # # # #                 if match:
# # # # # #                     return json.loads(match.group(0))
# # # # # #             except json.JSONDecodeError as e:
# # # # # #                 log.error("❌ JSON decode error: %s", e)
# # # # # #             return None

# # # # # #         data = extract_json_object(response)

# # # # # #         if data:
# # # # # #             return float(data.get("score", 0)), data.get("reason", "No reason provided")
# # # # # #         else:
# # # # # #             log.error("❌ JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
# # # # # #             return 0.0, "Invalid LLM response"


# # # # # import json
# # # # # import logging
# # # # # import os
# # # # # import re
# # # # # from typing import List

# # # # # from langchain_community.chat_models import ChatOpenAI
# # # # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # # # # from langchain_community.embeddings import OpenAIEmbeddings
# # # # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # # # from langchain.prompts import PromptTemplate
# # # # # from langchain_community.vectorstores import PGVector

# # # # # from src.utils.prompt_utils import PromptTemplates
# # # # # from .database_services.student_answer_db import StudentAnswerService
# # # # # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # # # from .database_services.grading_result_db import GradingResultDB
# # # # # from .embedding.abstract_embedder import AbstractEmbedder
# # # # # from ..prompts.rag_prompts import RAGPrompts
# # # # # from ..models.grading_result import GradingResult, GradingMethod

# # # # # log = logging.getLogger(__name__)

# # # # # class RAGGrader:
# # # # #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# # # # #         self.provider = provider
# # # # #         self.top_k = top_k
# # # # #         self.embedder = embedder
# # # # #         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

# # # # #         if provider == "OpenAI":
# # # # #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# # # # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # # # #         else:
# # # # #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# # # # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# # # # #         # Vector store for lecture material
# # # # #         self.vstore = PGVector(
# # # # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # # # #             collection_name=f"lecture_material_chunks_{self.suffix}",
# # # # #             embedding_function=self.lc_embed,
# # # # #         )

# # # # #         self.stu_db = StudentAnswerService(provider_suffix=self.provider.lower())
# # # # #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# # # # #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# # # # #         self.result_db = GradingResultDB(provider_suffix=self.provider.lower())

# # # # #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# # # # #         print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
# # # # #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# # # # #         count = 0
# # # # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # # # #             if (mod, yr, mon) != (module, year, month):
# # # # #                 continue
# # # # #             if student and stu != student:
# # # # #                 continue

# # # # #             print(f"\U0001F4DD Grading student: {stu}")
# # # # #             self._grade_paper(stu, mod, yr, mon, ans_list)
# # # # #             count += 1

# # # # #         if count == 0:
# # # # #             print("⚠️ No matching student answers found for this session.")
# # # # #         else:
# # # # #             print(f"✅ Finished grading {count} student(s).")

# # # # #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# # # # #         total = 0.0
# # # # #         possible = 0.0
# # # # #         graded_ok = 0
# # # # #         skipped = 0

# # # # #         for sa in answers:
# # # # #             if not sa.answer_text or sa.answer_text.strip() == "":
# # # # #                 skipped += 1
# # # # #                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
# # # # #                 continue

# # # # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # # # #             if not ma:
# # # # #                 skipped += 1
# # # # #                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# # # # #                 continue

# # # # #             retrieved_blocks = self._retrieve(ma["question_text"], module)

# # # # #             student_embedding = self.stu_embed_db.get_embedding(
# # # # #                 student_index=stu_idx,
# # # # #                 full_question_id=sa.full_question_id,
# # # # #                 module_code=module,
# # # # #                 exam_year=year,
# # # # #                 exam_month=month
# # # # #             )

# # # # #             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

# # # # #             self.result_db.save_question_mark(
# # # # #                 GradingResult(
# # # # #                     student_index=stu_idx,
# # # # #                     module_code=module,
# # # # #                     exam_year=year,
# # # # #                     exam_month=month,
# # # # #                     full_question_id=sa.full_question_id,
# # # # #                     score=score,
# # # # #                     max_marks=ma["max_marks"] or 0,
# # # # #                     feedback=reason,
# # # # #                     similarity_score=0.0,
# # # # #                     grading_method=GradingMethod.RAG,
# # # # #                     confidence_score=1.0
# # # # #                 )
# # # # #             )
# # # # #             graded_ok += 1
# # # # #             total += score
# # # # #             possible += ma["max_marks"] or 0

# # # # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# # # # #         self.result_db.commit()

# # # # #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# # # # #                  stu_idx, total, possible, graded_ok, skipped)

# # # # #     def _retrieve(self, question_text: str, module: str) -> str:
# # # # #         docs = self.vstore.similarity_search(
# # # # #             question_text, k=self.top_k, filter={"module_code": module}
# # # # #         )
# # # # #         return "\n---\n".join(d.page_content for d in docs)

# # # # #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
# # # # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # # # #             question_text=ma_dict["question_text"] or "",
# # # # #             model_answer=ma_dict["answer_text"],
# # # # #             guideline=ma_dict["guideline_text"] or "",
# # # # #             max_marks=ma_dict["max_marks"] or 0,
# # # # #             retrieved_chunks=retrieved,
# # # # #             student_answer=student_answer_text,
# # # # #         )

# # # # #         response = self.chat.invoke(prompt).content

# # # # #         def extract_json_object(text: str):
# # # # #             try:
# # # # #                 match = re.search(r'\{.*?\}', text, re.DOTALL)
# # # # #                 if match:
# # # # #                     return json.loads(match.group(0))
# # # # #             except json.JSONDecodeError as e:
# # # # #                 log.error("❌ JSON decode error: %s", e)
# # # # #             return None

# # # # #         data = extract_json_object(response)

# # # # #         if data:
# # # # #             return float(data.get("score", 0)), data.get("reason", "No reason provided")
# # # # #         else:
# # # # #             log.error("❌ JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
# # # # #             return 0.0, "Invalid LLM response"


# # # # import json
# # # # import logging
# # # # import os
# # # # import re
# # # # from typing import List

# # # # from langchain_community.chat_models import ChatOpenAI
# # # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # # # from langchain_community.embeddings import OpenAIEmbeddings
# # # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # # from langchain.prompts import PromptTemplate
# # # # from langchain_community.vectorstores import PGVector

# # # # from src.utils.prompt_utils import PromptTemplates
# # # # from .database_services.student_answer_db import StudentAnswerService
# # # # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # # from .database_services.grading_result_db import GradingResultDB
# # # # from .embedding.abstract_embedder import AbstractEmbedder
# # # # from ..prompts.rag_prompts import RAGPrompts
# # # # from ..models.grading_result import GradingResult, GradingMethod

# # # # log = logging.getLogger(__name__)

# # # # class RAGGrader:
# # # #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# # # #         self.provider = provider
# # # #         self.top_k = top_k
# # # #         self.embedder = embedder
# # # #         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

# # # #         if provider == "OpenAI":
# # # #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# # # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # # #         else:
# # # #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# # # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# # # #         # Vector store for lecture material
# # # #         self.vstore = PGVector(
# # # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # # #             collection_name=f"lecture_material_chunks_{self.suffix}",
# # # #             embedding_function=self.lc_embed,
# # # #         )

# # # #         self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
# # # #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# # # #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# # # #         self.result_db = GradingResultDB(provider_suffix=self.suffix)

# # # #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# # # #         print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
# # # #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# # # #         count = 0
# # # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # # #             if (mod, yr, mon) != (module, year, month):
# # # #                 continue
# # # #             if student and stu != student:
# # # #                 continue

# # # #             print(f"\U0001F4DD Grading student: {stu}")
# # # #             self._grade_paper(stu, mod, yr, mon, ans_list)
# # # #             count += 1

# # # #         if count == 0:
# # # #             print("⚠️ No matching student answers found for this session.")
# # # #         else:
# # # #             print(f"✅ Finished grading {count} student(s).")

# # # #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# # # #         total = 0.0
# # # #         possible = 0.0
# # # #         graded_ok = 0
# # # #         skipped = 0

# # # #         for sa in answers:
# # # #             if not sa.answer_text or sa.answer_text.strip() == "":
# # # #                 skipped += 1
# # # #                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
# # # #                 continue

# # # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # # #             if not ma:
# # # #                 skipped += 1
# # # #                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# # # #                 continue

# # # #             retrieved_blocks = self._retrieve(ma["question_text"], module)

# # # #             student_embedding = self.stu_embed_db.get_embedding(
# # # #                 student_index=stu_idx,
# # # #                 full_question_id=sa.full_question_id,
# # # #                 module_code=module,
# # # #                 exam_year=year,
# # # #                 exam_month=month
# # # #             )

# # # #             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

# # # #             self.result_db.save_question_mark(
# # # #                 GradingResult(
# # # #                     student_index=stu_idx,
# # # #                     module_code=module,
# # # #                     exam_year=year,
# # # #                     exam_month=month,
# # # #                     full_question_id=sa.full_question_id,
# # # #                     # mark=score,
# # # #                     score=score,
# # # #                     max_marks=ma["max_marks"] or 0,
# # # #                     feedback=reason,
# # # #                     similarity_score=0.0,
# # # #                     grading_method=GradingMethod.RAG,
# # # #                     confidence_score=1.0
# # # #                 )
# # # #             )
# # # #             graded_ok += 1
# # # #             total += score
# # # #             possible += ma["max_marks"] or 0

# # # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# # # #         self.result_db.commit()

# # # #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# # # #                  stu_idx, total, possible, graded_ok, skipped)

# # # #     def _retrieve(self, question_text: str, module: str) -> str:
# # # #         docs = self.vstore.similarity_search(
# # # #             question_text, k=self.top_k, filter={"module_code": module}
# # # #         )
# # # #         return "\n---\n".join(d.page_content for d in docs)

# # # #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
# # # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # # #             question_text=ma_dict["question_text"] or "",
# # # #             model_answer=ma_dict["answer_text"],
# # # #             guideline=ma_dict["guideline_text"] or "",
# # # #             max_marks=ma_dict["max_marks"] or 0,
# # # #             retrieved_chunks=retrieved,
# # # #             student_answer=student_answer_text,
# # # #         )

# # # #         response = self.chat.invoke(prompt).content

# # # #         def extract_json_object(text: str):
# # # #             try:
# # # #                 match = re.search(r'\{.*?\}', text, re.DOTALL)
# # # #                 if match:
# # # #                     return json.loads(match.group(0))
# # # #             except json.JSONDecodeError as e:
# # # #                 log.error("❌ JSON decode error: %s", e)
# # # #             return None

# # # #         data = extract_json_object(response)

# # # #         if data:
# # # #             return float(data.get("score", 0)), data.get("reason", "No reason provided")
# # # #         else:
# # # #             log.error("❌ JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
# # # #             return 0.0, "Invalid LLM response"

# # # import json
# # # import logging
# # # import os
# # # import re
# # # from typing import List

# # # from langchain_community.chat_models import ChatOpenAI
# # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # # from langchain_community.embeddings import OpenAIEmbeddings
# # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # from langchain.prompts import PromptTemplate
# # # from langchain_community.vectorstores import PGVector

# # # from src.utils.prompt_utils import PromptTemplates
# # # from .database_services.student_answer_db import StudentAnswerService
# # # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # from .database_services.grading_result_db import GradingResultDB
# # # from .embedding.abstract_embedder import AbstractEmbedder
# # # from ..prompts.rag_prompts import RAGPrompts
# # # from ..models.grading_result import GradingResult, GradingMethod

# # # log = logging.getLogger(__name__)

# # # class RAGGrader:
# # #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# # #         self.provider = provider
# # #         self.top_k = top_k
# # #         self.embedder = embedder
# # #         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

# # #         if provider == "OpenAI":
# # #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # #         else:
# # #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# # #         # Vector store for lecture material
# # #         self.vstore = PGVector(
# # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # #             collection_name=f"lecture_material_chunks_{self.suffix}",
# # #             embedding_function=self.lc_embed,
# # #         )

# # #         self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
# # #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# # #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# # #         self.result_db = GradingResultDB(provider_suffix=self.suffix)

# # #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# # #         print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
# # #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# # #         count = 0
# # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # #             if (mod, yr, mon) != (module, year, month):
# # #                 continue
# # #             if student and stu != student:
# # #                 continue

# # #             print(f"\U0001F4DD Grading student: {stu}")
# # #             self._grade_paper(stu, mod, yr, mon, ans_list)
# # #             count += 1

# # #         if count == 0:
# # #             print("⚠️ No matching student answers found for this session.")
# # #         else:
# # #             print(f"✅ Finished grading {count} student(s).")

# # #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# # #         total = 0.0
# # #         possible = 0.0
# # #         graded_ok = 0
# # #         skipped = 0

# # #         for sa in answers:
# # #             # First check if model answer exists - this determines if we skip or grade
# # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # #             if not ma:
# # #                 skipped += 1
# # #                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# # #                 continue

# # #             # If model answer exists, we always grade (even for empty student answers)
# # #             if not sa.answer_text or sa.answer_text.strip() == "":
# # #                 # Handle empty student answer - assign 0 score with appropriate reason
# # #                 score = 0.0
# # #                 reason = "Student did not provide an answer."
# # #                 log.info("📝 Empty student answer for %s – assigning 0 score.", sa.full_question_id)
# # #             else:
# # #                 # Normal grading flow for non-empty answers
# # #                 retrieved_blocks = self._retrieve(ma["question_text"], module)

# # #                 student_embedding = self.stu_embed_db.get_embedding(
# # #                     student_index=stu_idx,
# # #                     full_question_id=sa.full_question_id,
# # #                     module_code=module,
# # #                     exam_year=year,
# # #                     exam_month=month
# # #                 )

# # #                 score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

# # #             # Save the grading result (whether empty answer or graded)
# # #             self.result_db.save_question_mark(
# # #                 GradingResult(
# # #                     student_index=stu_idx,
# # #                     module_code=module,
# # #                     exam_year=year,
# # #                     exam_month=month,
# # #                     full_question_id=sa.full_question_id,
# # #                     score=score,
# # #                     max_marks=ma["max_marks"] or 0,
# # #                     feedback=reason,
# # #                     similarity_score=0.0,
# # #                     grading_method=GradingMethod.RAG,
# # #                     confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0
# # #                 )
# # #             )
# # #             graded_ok += 1
# # #             total += score
# # #             possible += ma["max_marks"] or 0

# # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# # #         self.result_db.commit()

# # #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# # #                  stu_idx, total, possible, graded_ok, skipped)

# # #     def _retrieve(self, question_text: str, module: str) -> str:
# # #         docs = self.vstore.similarity_search(
# # #             question_text, k=self.top_k, filter={"module_code": module}
# # #         )
# # #         return "\n---\n".join(d.page_content for d in docs)

# # #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
# # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # #             question_text=ma_dict["question_text"] or "",
# # #             model_answer=ma_dict["answer_text"],
# # #             guideline=ma_dict["guideline_text"] or "",
# # #             max_marks=ma_dict["max_marks"] or 0,
# # #             retrieved_chunks=retrieved,
# # #             student_answer=student_answer_text,
# # #         )

# # #         response = self.chat.invoke(prompt).content

# # #         def extract_json_object(text: str):
# # #             try:
# # #                 match = re.search(r'\{.*?\}', text, re.DOTALL)
# # #                 if match:
# # #                     return json.loads(match.group(0))
# # #             except json.JSONDecodeError as e:
# # #                 log.error("❌ JSON decode error: %s", e)
# # #             return None

# # #         data = extract_json_object(response)

# # #         if data:
# # #             return float(data.get("score", 0)), data.get("reason", "No reason provided")
# # #         else:
# # #             log.error("❌ JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
# # #             return 0.0, "Invalid LLM response"

# # # import json
# # # import logging
# # # import os
# # # import re
# # # from typing import List

# # # from langchain_community.chat_models import ChatOpenAI
# # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # # from langchain_community.embeddings import OpenAIEmbeddings
# # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # from langchain.prompts import PromptTemplate
# # # from langchain_community.vectorstores import PGVector
# # # from sklearn.metrics.pairwise import cosine_similarity
# # # import numpy as np

# # # from src.utils.prompt_utils import PromptTemplates
# # # from .database_services.student_answer_db import StudentAnswerService
# # # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # from .database_services.grading_result_db import GradingResultDB
# # # from .embedding.abstract_embedder import AbstractEmbedder
# # # from ..prompts.rag_prompts import RAGPrompts
# # # from ..models.grading_result import GradingResult, GradingMethod

# # # log = logging.getLogger(__name__)

# # # class RAGGrader:
# # #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# # #         self.provider = provider
# # #         self.top_k = top_k
# # #         self.embedder = embedder
# # #         self.suffix = embedder.get_table_suffix()

# # #         if provider == "OpenAI":
# # #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # #         else:
# # #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# # #         self.vstore = PGVector(
# # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # #             collection_name=f"lecture_material_chunks_{self.suffix}",
# # #             embedding_function=self.lc_embed,
# # #         )

# # #         self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
# # #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# # #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# # #         self.result_db = GradingResultDB(provider_suffix=self.provider)

# # #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# # #         print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
# # #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# # #         count = 0
# # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # #             if (mod, yr, mon) != (module, year, month):
# # #                 continue
# # #             if student and stu != student:
# # #                 continue

# # #             print(f"\U0001F4DD Grading student: {stu}")
# # #             self._grade_paper(stu, mod, yr, mon, ans_list)
# # #             count += 1

# # #         if count == 0:
# # #             print("\u26a0\ufe0f No matching student answers found for this session.")
# # #         else:
# # #             print(f"\u2705 Finished grading {count} student(s).")

# # #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# # #         total = 0.0
# # #         possible = 0.0
# # #         graded_ok = 0
# # #         skipped = 0

# # #         for sa in answers:
# # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # #             if not ma:
# # #                 skipped += 1
# # #                 log.warning("\u26a0\ufe0f  Model answer missing for %s – skipping.", sa.full_question_id)
# # #                 continue

# # #             student_embedding = self.stu_embed_db.get_embedding(
# # #                 student_index=stu_idx,
# # #                 full_question_id=sa.full_question_id,
# # #                 module_code=module,
# # #                 exam_year=year,
# # #                 exam_month=month
# # #             )

# # #             model_embedding = self.embedder.embed([ma["answer_text"]])[0] if ma["answer_text"] else None

# # #             similarity = 0.0
# # #             if student_embedding is not None and model_embedding is not None:
# # #                 similarity = float(cosine_similarity([student_embedding], [model_embedding])[0][0])

# # #             if not sa.answer_text or sa.answer_text.strip() == "":
# # #                 score = 0.0
# # #                 reason = "Student did not provide an answer."
# # #                 log.info("\ud83d\udcdd Empty student answer for %s – assigning 0 score.", sa.full_question_id)
# # #             else:
# # #                 retrieved_blocks = self._retrieve(ma["question_text"], module)
# # #                 score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks, similarity)

# # #             self.result_db.save_question_mark(
# # #                 GradingResult(
# # #                     student_index=stu_idx,
# # #                     module_code=module,
# # #                     exam_year=year,
# # #                     exam_month=month,
# # #                     full_question_id=sa.full_question_id,
# # #                     # mark=score,
# # #                     score=score,
# # #                     max_marks=ma["max_marks"] or 0,
# # #                     feedback=reason,
# # #                     similarity_score=similarity,
# # #                     grading_method=GradingMethod.RAG,
# # #                     confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0
# # #                 )
# # #             )
# # #             graded_ok += 1
# # #             total += score
# # #             possible += ma["max_marks"] or 0

# # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# # #         self.result_db.commit()

# # #         log.info("\u2705 %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# # #                  stu_idx, total, possible, graded_ok, skipped)

# # #     def _retrieve(self, question_text: str, module: str) -> str:
# # #         docs = self.vstore.similarity_search(
# # #             question_text, k=self.top_k, filter={"module_code": module}
# # #         )
# # #         return "\n---\n".join(d.page_content for d in docs)

# # #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved, similarity_score: float) -> tuple[float, str]:
# # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # #             question_text=ma_dict["question_text"] or "",
# # #             model_answer=ma_dict["answer_text"],
# # #             guideline=ma_dict["guideline_text"] or "",
# # #             max_marks=ma_dict["max_marks"] or 0,
# # #             retrieved_chunks=retrieved,
# # #             student_answer=student_answer_text,
# # #             similarity_score=similarity_score
# # #         )

# # #         response = self.chat.invoke(prompt).content

# # #         def extract_json_object(text: str):
# # #             try:
# # #                 match = re.search(r'\{.*?\}', text, re.DOTALL)
# # #                 if match:
# # #                     return json.loads(match.group(0))
# # #             except json.JSONDecodeError as e:
# # #                 log.error("\u274c JSON decode error: %s", e)
# # #             return None

# # #         data = extract_json_object(response)

# # #         if data:
# # #             return float(data.get("score", 0)), data.get("reason", "No reason provided")
# # #         else:
# # #             log.error("\u274c JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
# # #             return 0.0, "Invalid LLM response"

# # import json
# # import logging
# # import os
# # import re
# # import numpy as np
# # from typing import List

# # from langchain_community.chat_models import ChatOpenAI
# # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # from langchain_community.embeddings import OpenAIEmbeddings
# # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # from langchain.prompts import PromptTemplate
# # from langchain_community.vectorstores import PGVector

# # from src.utils.prompt_utils import PromptTemplates
# # from .database_services.student_answer_db import StudentAnswerService
# # from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # from .database_services.grading_result_db import GradingResultDB
# # from .embedding.abstract_embedder import AbstractEmbedder
# # from ..prompts.rag_prompts import RAGPrompts
# # from ..models.grading_result import GradingResult, GradingMethod

# # log = logging.getLogger(__name__)


# # class RAGGrader:
# #     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
# #         self.provider = provider
# #         self.top_k = top_k
# #         self.embedder = embedder
# #         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

# #         if provider == "OpenAI":
# #             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
# #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# #         else:
# #             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
# #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

# #         self.vstore = PGVector(
# #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# #             collection_name=f"lecture_material_chunks_{self.suffix}",
# #             embedding_function=self.lc_embed,
# #         )

# #         self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
# #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# #         self.result_db = GradingResultDB(provider_suffix=self.provider)

# #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# #         print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
# #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# #         count = 0
# #         for (stu, mod, yr, mon), ans_list in groups.items():
# #             if (mod, yr, mon) != (module, year, month):
# #                 continue
# #             if student and stu != student:
# #                 continue

# #             print(f"\U0001F4DD Grading student: {stu}")
# #             self._grade_paper(stu, mod, yr, mon, ans_list)
# #             count += 1

# #         if count == 0:
# #             print("⚠️ No matching student answers found for this session.")
# #         else:
# #             print(f"✅ Finished grading {count} student(s).")

# #     # def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# #     #     total = 0.0
# #     #     possible = 0.0
# #     #     graded_ok = 0
# #     #     skipped = 0

# #     #     for sa in answers:
# #     #         ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# #     #         if not ma:
# #     #             skipped += 1
# #     #             log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# #     #             continue

# #     #         # Always grade — even for empty
# #     #         if not sa.answer_text or sa.answer_text.strip() == "":
# #     #             score = 0.0
# #     #             reason = "Student did not provide an answer."
# #     #             similarity = 0.0
# #     #             log.info("📝 Empty student answer for %s – assigning 0 score.", sa.full_question_id)
# #     #         else:
# #     #             retrieved_blocks = self._retrieve(ma["question_text"], module)

# #     #             stu_vec = self.stu_embed_db.get_embedding(
# #     #                 student_index=stu_idx,
# #     #                 full_question_id=sa.full_question_id,
# #     #                 module_code=module,
# #     #                 exam_year=year,
# #     #                 exam_month=month
# #     #             )

# #     #             mod_vec = self.mod_db.get_embedding(
# #     #                 full_question_id=sa.full_question_id,
# #     #                 module_code=module,
# #     #                 exam_year=year,
# #     #                 exam_month=month
# #     #             )

# #     #             similarity = self._cosine_similarity(stu_vec, mod_vec) if stu_vec is not None and mod_vec is not None else 0.0

# #     #             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks, similarity)

# #     #         self.result_db.save_question_mark(
# #     #             GradingResult(
# #     #                 student_index=stu_idx,
# #     #                 module_code=module,
# #     #                 exam_year=year,
# #     #                 exam_month=month,
# #     #                 full_question_id=sa.full_question_id,
# #     #                 score=score,
# #     #                 max_marks=ma["max_marks"] or 0,
# #     #                 feedback=reason,
# #     #                 similarity_score=similarity,
# #     #                 grading_method=GradingMethod.RAG,
# #     #                 confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0
# #     #             )
# #     #         )
# #     #         graded_ok += 1
# #     #         total += score
# #     #         possible += ma["max_marks"] or 0

# #     #     self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# #     #     self.result_db.commit()

# #     #     log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# #     #              stu_idx, total, possible, graded_ok, skipped)
# #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# #         total = 0.0
# #         possible = 0.0
# #         graded_ok = 0
# #         skipped = 0

# #         # ✅ Retrieval cache to ensure consistent context across students
# #         retrieval_cache = {}

# #         # ✅ Retrieval cache to ensure consistent context across students
# #         retrieval_cache = {}

# #         for sa in answers:
# #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# #             if not ma:
# #                 skipped += 1
# #                 log.warning("\u26a0\ufe0f  Model answer missing for %s – skipping.", sa.full_question_id)
# #                 continue

# #             # ✅ Use cached retrieval if already fetched for this question
# #             if sa.full_question_id not in retrieval_cache:
# #                 retrieved_blocks = self._retrieve(ma["question_text"], module)
# #                 retrieval_cache[sa.full_question_id] = retrieved_blocks
# #             else:
# #                 retrieved_blocks = retrieval_cache[sa.full_question_id]

# #             # ✅ Grade even empty
# #             if not sa.answer_text or sa.answer_text.strip() == "":
# #                 score = 0.0
# #                 reason = "Student did not provide an answer."
# #                 similarity = 0.0
# #                 log.info("📝 Empty student answer for %s – assigning 0 score.", sa.full_question_id)
# #             else:
# #                 stu_vec = self.stu_embed_db.get_embedding(
# #                     student_index=stu_idx,
# #                     full_question_id=sa.full_question_id,
# #                     module_code=module,
# #                     exam_year=year,
# #                     exam_month=month
# #                 )

# #                 mod_vec = self.mod_db.get_embedding(
# #                     full_question_id=sa.full_question_id,
# #                     module_code=module,
# #                     exam_year=year,
# #                     exam_month=month
# #                 )

# #                 similarity = self._cosine_similarity(stu_vec, mod_vec) if stu_vec is not None and mod_vec is not None else 0.0

# #                 score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks, similarity)

# #             self.result_db.save_question_mark(
# #                 GradingResult(
# #                     student_index=stu_idx,
# #                     module_code=module,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     full_question_id=sa.full_question_id,
# #                     score=score,
# #                     max_marks=ma["max_marks"] or 0,
# #                     feedback=reason,
# #                     similarity_score=similarity,
# #                     grading_method=GradingMethod.RAG,
# #                     confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0
# #                 )
# #             )
# #             graded_ok += 1
# #             total += score
# #             possible += ma["max_marks"] or 0

# #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# #         self.result_db.commit()

# #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# #                 stu_idx, total, possible, graded_ok, skipped)

# #     def _cosine_similarity(self, v1, v2):
# #         a = np.array(v1)
# #         b = np.array(v2)
# #         a_norm = a / np.linalg.norm(a)
# #         b_norm = b / np.linalg.norm(b)
# #         return float(np.dot(a_norm, b_norm))

# #     def _retrieve(self, question_text: str, module: str) -> str:
# #         docs = self.vstore.similarity_search(
# #             question_text, k=self.top_k, filter={"module_code": module}
# #         )
# #         return "\n---\n".join(d.page_content for d in docs)

# #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved: str, similarity_score: float) -> tuple[float, str]:
# #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# #             question_text=ma_dict["question_text"] or "",
# #             model_answer=ma_dict["answer_text"],
# #             guideline=ma_dict["guideline_text"] or "",
# #             max_marks=ma_dict["max_marks"] or 0,
# #             retrieved_chunks=retrieved,
# #             student_answer=student_answer_text,
# #             similarity_score=similarity_score
# #         )

# #         response = self.chat.invoke(prompt).content

# #         def extract_json_object(text: str):
# #             try:
# #                 match = re.search(r'\{.*?\}', text, re.DOTALL)
# #                 if match:
# #                     return json.loads(match.group(0))
# #             except json.JSONDecodeError as e:
# #                 log.error("\u274c JSON decode error: %s", e)
# #             return None

# #         data = extract_json_object(response)

# #         if data:
# #             return float(data.get("score", 0)), data.get("reason", "No reason provided")
# #         else:
# #             log.error("\u274c JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
# #             return 0.0, "Invalid LLM response"



# import json
# import logging
# import os
# import re
# import requests
# import numpy as np
# from typing import List

# # from langchain_community.chat_models import ChatOpenAI
# # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# # from langchain_community.embeddings import OpenAIEmbeddings
# # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # from langchain.prompts import PromptTemplate
# # from langchain_community.vectorstores import PGVector

# from src.utils.prompt_utils import PromptTemplates
# from .database_services.student_answer_db import StudentAnswerService
# from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# from .database_services.grading_result_db import GradingResultDB
# from .embedding.abstract_embedder import AbstractEmbedder
# from ..prompts.rag_prompts import RAGPrompts
# from ..models.grading_result import GradingResult, GradingMethod

# logger = logging.getLogger(__name__)

# class RAGGrader:
#     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6,
#                  ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
#         self.provider = provider
#         self.top_k = top_k
#         self.embedder = embedder
#         self.suffix = embedder.get_table_suffix()
#         self.ollama_base_url = ollama_base_url
#         self.request_timeout = request_timeout

#         # Initialize chat client based on provider
#         if provider == "OpenAI":
#             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
#             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())

#         elif provider == "GoogleGemini":
#             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
#             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

#         elif provider == "DeepSeek":
#             # Ollama DeepSeek does not require an API key
#             try:
#                 response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
#                 if response.status_code != 200:
#                     raise ConnectionError("Ollama server is not responding")
#                 logger.info("Connected to Ollama server successfully")
#             except requests.exceptions.ConnectionError:
#                 raise ConnectionError(f"Cannot connect to Ollama server at {self.ollama_base_url}. Make sure Ollama is running.")
#             self.chat = None  # DeepSeek will be called via _call_ollama_api
#             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())  # embeddings still use OpenAI

#         else:
#             raise ValueError(f"Unsupported provider: {provider}")

#         # Vector store
#         self.vstore = PGVector(
#             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
#             collection_name=f"lecture_material_chunks_{self.suffix}",
#             embedding_function=self.lc_embed,
#         )

#         self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
#         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
#         self.mod_db = ModelAnswerEmbeddingDB(embedder)
#         self.result_db = GradingResultDB(provider_suffix=self.provider)

#     # ------------------- DeepSeek API Calls -------------------
#     def _call_ollama_api(self, messages: List[dict], stream: bool = False) -> str:
#         payload = {
#             "model": self.embedder.get_table_suffix(),
#             "messages": messages,
#             "stream": stream,
#             "options": {
#                 "temperature": 0.0,
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
#             return response.json().get("message", {}).get("content", "")
#         except Exception as e:
#             logger.error(f"Ollama API failed: {e}")
#             return ""

#     # ------------------- Grading -------------------
#     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
#         print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
#         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# #         count = 0
# #         for (stu, mod, yr, mon), ans_list in groups.items():
# #             if (mod, yr, mon) != (module, year, month):
# #                 continue
# #             if student and stu != student:
# #                 continue

# #             print(f"\U0001F4DD Grading student: {stu}")
# #             self._grade_paper(stu, mod, yr, mon, ans_list)
# #             count += 1

# #         if count == 0:
# #             print("⚠️ No matching student answers found for this session.")
# #         else:
# #             print(f"✅ Finished grading {count} student(s).")

#     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
#         total = 0.0
#         possible = 0.0
#         graded_ok = 0
#         skipped = 0
#         retrieval_cache = {}

#         for sa in answers:
#             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
#             if not ma:
#                 skipped += 1
#                 logger.warning("⚠️ Model answer missing for %s – skipping.", sa.full_question_id)
#                 continue

#             # Retrieval cache
#             if sa.full_question_id not in retrieval_cache:
#                 retrieved_blocks = self._retrieve(ma["question_text"], module)
#                 retrieval_cache[sa.full_question_id] = retrieved_blocks
#             else:
#                 retrieved_blocks = retrieval_cache[sa.full_question_id]

#             # Empty answer
#             if not sa.answer_text or sa.answer_text.strip() == "":
#                 score = 0.0
#                 reason = "Student did not provide an answer."
#                 similarity = 0.0
#                 logger.info("📝 Empty student answer for %s – assigning 0 score.", sa.full_question_id)
#             else:
#                 stu_vec = self.stu_embed_db.get_embedding(
#                     student_index=stu_idx,
#                     full_question_id=sa.full_question_id,
#                     module_code=module,
#                     exam_year=year,
#                     exam_month=month
#                 )
#                 mod_vec = self.mod_db.get_embedding(
#                     full_question_id=sa.full_question_id,
#                     module_code=module,
#                     exam_year=year,
#                     exam_month=month
#                 )
#                 similarity = self._cosine_similarity(stu_vec, mod_vec) if stu_vec is not None and mod_vec is not None else 0.0
#                 score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks, similarity)

#             self.result_db.save_question_mark(
#                 GradingResult(
#                     student_index=stu_idx,
#                     module_code=module,
#                     exam_year=year,
#                     exam_month=month,
#                     full_question_id=sa.full_question_id,
#                     score=score,
#                     max_marks=ma["max_marks"] or 0,
#                     feedback=reason,
#                     similarity_score=similarity,
#                     grading_method=GradingMethod.RAG,
#                     confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0
#                 )
#             )
#             graded_ok += 1
#             total += score
#             possible += ma["max_marks"] or 0

#         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
#         self.result_db.commit()
#         logger.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)", stu_idx, total, possible, graded_ok, skipped)

#     # ------------------- LLM Call -------------------
#     def _call_llm(self, student_answer_text: str, ma_dict, retrieved: str, similarity_score: float) -> tuple[float, str]:
#         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
#             question_text=ma_dict["question_text"] or "",
#             model_answer=ma_dict["answer_text"],
#             guideline=ma_dict["guideline_text"] or "",
#             max_marks=ma_dict["max_marks"] or 0,
#             retrieved_chunks=retrieved,
#             student_answer=student_answer_text,
#             similarity_score=similarity_score
#         )

#         if self.provider in ["OpenAI", "GoogleGemini"]:
#             response = self.chat.invoke(prompt).content
#         elif self.provider == "DeepSeek":
#             messages = [
#                 {"role": "system", "content": prompt},
#                 {"role": "user", "content": student_answer_text}
#             ]
#             response = self._call_ollama_api(messages)
#         else:
#             response = ""

#         # Extract JSON from response

import json
import logging
import os
import re
import requests
import numpy as np
from typing import List, Dict, Tuple

from langchain_community.chat_models import ChatOpenAI
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import PGVector

from src.utils.prompt_utils import PromptTemplates
from .database_services.student_answer_db import StudentAnswerService
from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
from .database_services.grading_result_db import GradingResultDB
from .embedding.abstract_embedder import AbstractEmbedder
from ..prompts.rag_prompts import RAGPrompts
from ..models.grading_result import GradingResult, GradingMethod

log = logging.getLogger(__name__)


class RAGGrader:
    def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6, ollama_base_url: str = "http://localhost:11434", request_timeout: int = 600):
        self.provider = provider
        self.top_k = top_k
        self.embedder = embedder
        self.suffix = embedder.get_table_suffix()  # "openai", "gemini", or "deepseek"
        self.ollama_base_url = ollama_base_url
        self.request_timeout = request_timeout

        if provider == "OpenAI":
            self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
            self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
        elif provider == "GoogleGemini":
            self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
            self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")
        elif provider == "DeepSeek":
            # DeepSeek uses Ollama for chat and OpenAI embeddings
            self.chat_model = chat_model
            self.chat = None  # We'll use custom Ollama calls
            # Use OpenAI embeddings for DeepSeek as mentioned
            self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
            
            # Verify Ollama connection
            try:
                response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
                if response.status_code != 200:
                    raise ConnectionError("Ollama server is not responding")
                log.info("Connected to Ollama server successfully for DeepSeek grading")
            except requests.exceptions.ConnectionError:
                raise ConnectionError(f"Cannot connect to Ollama at {self.ollama_base_url}")
        else:
            raise ValueError(f"Unsupported provider: {provider}")

        self.vstore = PGVector(
            connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
            collection_name=f"lecture_material_chunks_{self.suffix}",
            embedding_function=self.lc_embed,
        )

        self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
        self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
        self.mod_db = ModelAnswerEmbeddingDB(embedder)
        self.result_db = GradingResultDB(provider_suffix=self.provider)
    def _call_ollama_for_grading(self, prompt: str) -> str:
        """
        Call Ollama API for DeepSeek grading with streaming support
        """
        payload = {
            "model": self.chat_model,
            "prompt": prompt,
            "stream": False,  # ✅ Try non-streaming first for debugging
            "options": {
                "temperature": 0.0,
                "num_ctx": 8192,
                "num_predict": 2000,
            }
        }

        log.info("Calling DeepSeek via Ollama for grading...")
        
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=self.request_timeout
            )
            response.raise_for_status()
            
            # Parse the response
            result = response.json()
            full_content = result.get("response", "")
            
            if not full_content:
                log.error(f"Empty response from Ollama. Full result: {result}")
                return ""
        
            log.info(f"✅ Received response of length: {len(full_content)}")
            
            # Remove thinking process if present (for DeepSeek-R1)
            if "<think>" in full_content and "</think>" in full_content:
                think_start = full_content.find("<think>")
                think_end = full_content.find("</think>") + 8
                full_content = full_content[:think_start] + full_content[think_end:]
                full_content = full_content.strip()
            
            return full_content
            
        except requests.exceptions.Timeout:
            log.error(f"Ollama grading request timed out after {self.request_timeout} seconds")
            raise Exception(f"Ollama grading timed out after {self.request_timeout} seconds")
        except requests.exceptions.RequestException as e:
            log.error(f"Ollama grading request failed: {e}")
            raise Exception(f"Ollama grading request failed: {e}")
        except json.JSONDecodeError as e:
            log.error(f"Failed to parse Ollama response as JSON: {e}")
            raise Exception(f"Failed to parse Ollama response: {e}")

    # def _call_ollama_for_grading(self, prompt: str) -> str:
    #     """
    #     Call Ollama API for DeepSeek grading with streaming support
    #     """
    #     messages = [
    #         {"role": "system", "content": "You are an expert exam grader. Always respond with valid JSON format."},
    #         {"role": "user", "content": prompt}
    #     ]
        
    #     payload = {
    #         "model": self.chat_model,
    #         "messages": messages,
    #         "stream": True,
    #         "options": {
    #             "temperature": 0.0,
    #             "num_ctx": 8192,
    #             "num_predict": 2000,
    #             "top_k": 40,
    #             "top_p": 0.9
    #         }
    #     }

    #     log.info("Calling DeepSeek via Ollama for grading...")
    #     full_content = ""
        
    #     try:
    #         with requests.post(
    #             # f"{self.ollama_base_url}/api/chat",
    #             f"{self.ollama_base_url}/api/generate",
    #             headers={"Content-Type": "application/json"},
    #             json=payload,
    #             stream=True,
        #         timeout=self.request_timeout
        #     ) as response:
        #         response.raise_for_status()
                
        #         for line in response.iter_lines():
        #             if line:
        #                 try:
        #                     chunk_data = json.loads(line.decode('utf-8'))
        #                     if 'message' in chunk_data and 'content' in chunk_data['message']:
        #                         content_chunk = chunk_data['message']['content']
        #                         full_content += content_chunk
                                    
        #                     if chunk_data.get('done', False):
        #                         break
                                
        #                 except json.JSONDecodeError:
        #                     continue
            
        #     # Remove thinking process if present
        #     if "<think>" in full_content and "</think>" in full_content:
        #         think_end = full_content.find("</think>")
        #         if think_end != -1:
        #             full_content = full_content[think_end + 8:].strip()
            
        #     return full_content
            
        # except requests.exceptions.Timeout:
        #     log.error(f"Ollama grading request timed out after {self.request_timeout} seconds")
        #     raise Exception(f"Ollama grading timed out after {self.request_timeout} seconds")
        # except requests.exceptions.RequestException as e:
        #     log.error(f"Ollama grading request failed: {e}")
        #     raise Exception(f"Ollama grading request failed: {e}")

    def grade_session(self, module: str, year: int, month: str, student: str | None = None):
        """Legacy method - kept for backward compatibility"""
        print(f"📖 Starting grading for: {module} {month} {year}")
        groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

        count = 0
        for (stu, mod, yr, mon), ans_list in groups.items():
            if (mod, yr, mon) != (module, year, month):
                continue
            if student and stu != student:
                continue

            print(f"📝 Grading student: {stu}")
            self._grade_paper(stu, mod, yr, mon, ans_list)
            count += 1

        if count == 0:
            print("⚠️ No matching student answers found for this session.")
        else:
            print(f"✅ Finished grading {count} student(s).")

    def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
        """Legacy method - kept for backward compatibility"""
        total = 0.0
        possible = 0.0
        graded_ok = 0
        skipped = 0

        # Retrieval cache to ensure consistent context across students
        retrieval_cache = {}

        for sa in answers:
            ma = self.mod_db.get_model_answer(sa.full_question_id, module)
            if not ma:
                skipped += 1
                log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
                continue

            # Use cached retrieval if already fetched for this question
            if sa.full_question_id not in retrieval_cache:
                retrieved_blocks = self._retrieve(ma["question_text"], module)
                retrieval_cache[sa.full_question_id] = retrieved_blocks
            else:
                retrieved_blocks = retrieval_cache[sa.full_question_id]

            # Grade even empty answers
            if not sa.answer_text or sa.answer_text.strip() == "":
                score = 0.0
                reason = "Student did not provide an answer."
                similarity = 0.0
                log.info("📝 Empty student answer for %s – assigning 0 score.", sa.full_question_id)
            else:
                stu_vec = self.stu_embed_db.get_embedding(
                    student_index=stu_idx,
                    full_question_id=sa.full_question_id,
                    module_code=module,
                    exam_year=year,
                    exam_month=month
                )

                mod_vec = self.mod_db.get_embedding(
                    full_question_id=sa.full_question_id,
                    module_code=module,
                    exam_year=year,
                    exam_month=month
                )

                similarity = self._cosine_similarity(stu_vec, mod_vec) if stu_vec is not None and mod_vec is not None else 0.0

                score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks, similarity)

            self.result_db.save_question_mark(
                GradingResult(
                    student_index=stu_idx,
                    module_code=module,
                    exam_year=year,
                    exam_month=month,
                    full_question_id=sa.full_question_id,
                    score=score,
                    max_marks=ma["max_marks"] or 0,
                    feedback=reason,
                    similarity_score=similarity,
                    grading_method=GradingMethod.RAG,
                    confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0
                )
            )
            graded_ok += 1
            total += score
            possible += ma["max_marks"] or 0

        self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
        self.result_db.commit()

        log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
                 stu_idx, total, possible, graded_ok, skipped)

    def _grade_paper_with_assessment(self, stu_idx: str, module: str, year: int, month: str, 
                                   answers: list, assessment_id: str, submission_id: str = None):
        """NEW: Grade paper with assessment-specific filtering"""
        total = 0.0
        possible = 0.0
        graded_ok = 0
        skipped = 0

        # Retrieval cache to ensure consistent context across students
        retrieval_cache = {}

        for sa in answers:
            # Get model answer for this specific assessment
            ma = self.mod_db.get_model_answer(sa.full_question_id, module, assessment_id)
            if not ma:
                skipped += 1
                log.warning("⚠️  Model answer missing for %s in assessment %s – skipping.", 
                           sa.full_question_id, assessment_id)
                continue

            # Use cached retrieval if already fetched for this question
            if sa.full_question_id not in retrieval_cache:
                # Retrieve lecture materials filtered by assessment
                retrieved_blocks = self._retrieve_by_assessment(ma["question_text"], module, assessment_id)
                retrieval_cache[sa.full_question_id] = retrieved_blocks
            else:
                retrieved_blocks = retrieval_cache[sa.full_question_id]

            # Grade even empty
            if not sa.answer_text or sa.answer_text.strip() == "":
                score = 0.0
                reason = "Student did not provide an answer."
                similarity = 0.0
                log.info("📝 Empty student answer for %s – assigning 0 score.", sa.full_question_id)
            else:
                # Get student embedding for this specific assessment
                stu_vec = self.stu_embed_db.get_embedding(
                    student_index=stu_idx,
                    full_question_id=sa.full_question_id,
                    module_code=module,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=assessment_id
                )

                # Get model embedding for this specific assessment
                mod_vec = self.mod_db.get_embedding(
                    full_question_id=sa.full_question_id,
                    module_code=module,
                    exam_year=year,
                    exam_month=month,
                    assessment_id=assessment_id
                )

                similarity = self._cosine_similarity(stu_vec, mod_vec) if stu_vec is not None and mod_vec is not None else 0.0

                score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks, similarity)

            # Save result with assessment context
            self.result_db.save_question_mark(
                GradingResult(
                    student_index=stu_idx,
                    module_code=module,
                    exam_year=year,
                    exam_month=month,
                    full_question_id=sa.full_question_id,
                    score=score,
                    max_marks=ma["max_marks"] or 0,
                    feedback=reason,
                    similarity_score=similarity,
                    grading_method=GradingMethod.RAG,
                    confidence_score=1.0 if sa.answer_text and sa.answer_text.strip() else 0.0,
                    assessment_id=assessment_id,
                    submission_id=submission_id
                )
            )
            graded_ok += 1
            total += score
            possible += ma["max_marks"] or 0

        # Save paper total with assessment context
        self.result_db.save_paper_total(stu_idx, module, year, month, total, possible, assessment_id)
        self.result_db.commit()

        log.info("✅ %s graded for assessment %s — %.2f / %.2f   (%d graded, %d skipped)",
                 stu_idx, assessment_id, total, possible, graded_ok, skipped)

    def _cosine_similarity(self, v1, v2):
        if v1 is None or v2 is None:
            return 0.0
        a = np.array(v1)
        b = np.array(v2)
        a_norm = a / np.linalg.norm(a)
        b_norm = b / np.linalg.norm(b)
        return float(np.dot(a_norm, b_norm))

    def _retrieve(self, question_text: str, module: str) -> str:
        """Legacy retrieval method"""
        docs = self.vstore.similarity_search(
            question_text, k=self.top_k, filter={"module_code": module}
        )
        return "\n---\n".join(d.page_content for d in docs)

    def _call_llm(self, student_answer_text: str, ma_dict, retrieved: str, similarity_score: float) -> Tuple[float, str]:
        prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
            question_text=ma_dict["question_text"] or "",
            model_answer=ma_dict["answer_text"],
            guideline=ma_dict["guideline_text"] or "",
            max_marks=ma_dict["max_marks"] or 0,
            retrieved_chunks=retrieved,
            student_answer=student_answer_text,
            similarity_score=similarity_score
        )

        # Call appropriate LLM based on provider
        if self.provider == "DeepSeek":
            response = self._call_ollama_for_grading(prompt)
        else:
            response = self.chat.invoke(prompt).content

        def extract_json_object(text: str):
            try:
                # Clean up code block formatting if present
                if text.startswith("```"):
                    text = text.strip("`").replace("json", "").strip()
                
                match = re.search(r'\{.*?\}', text, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
            except json.JSONDecodeError as e:
                log.error("❌ JSON decode error: %s", e)
            return None

        data = extract_json_object(response)

        if data:
            return float(data.get("score", 0)), data.get("reason", "No reason provided")
        else:
            log.error("❌ JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
            return 0.0, "Invalid LLM response"