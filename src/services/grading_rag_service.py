# # # # # src/services/grading_rag_service.py

# # # # from langchain_community.vectorstores.pgvector import PGVector
# # # # from langchain_openai import OpenAIEmbeddings
# # # # from langchain.schema import Document
# # # # from models.student_answer import StudentAnswer
# # # # from models.model_answer import ModelAnswer
# # # # from models.question import Question
# # # # from prompts.grading_prompts import GradingPrompts
# # # # from prompts.rag_prompts import RAGPrompts, RAGUtilities
# # # # from config.settings import config
# # # # from openai import OpenAI
# # # # import logging

# # # # logger = logging.getLogger(__name__)

# # # # class GradingRAGService:
# # # #     def __init__(self, provider: str):
# # # #         self.provider = provider
# # # #         self.embedding_function = OpenAIEmbeddings(
# # # #             api_key=config.openai.api_key,
# # # #             model=config.openai.embedding_model
# # # #         )

# # # #         self.vector_db = PGVector(
# # # #             collection_name=config.database.lecture_collection,
# # # #             connection_string=config.database.connection_string,
# # # #             embedding_function=self.embedding_function
# # # #         )

# # # #         self.client = OpenAI(api_key=config.openai.api_key)

# # # #     def retrieve_context(self, question: Question, student_answer: StudentAnswer) -> str:
# # # #         search_query = RAGUtilities.create_query(question.text, student_answer.answer_text)
# # # #         documents = self.vector_db.similarity_search(search_query, k=3)
# # # #         return RAGUtilities.format_context_chunks([doc.page_content for doc in documents])

# # # #     def grade_answer(self, question: Question, model_answer: ModelAnswer, student_answer: StudentAnswer) -> dict:
# # # #         context = self.retrieve_context(question, student_answer)

# # # #         prompt = GradingPrompts.RAG_ASSISTED_GRADING.format(
# # # #             question_text=question.text,
# # # #             model_answer=model_answer.answer_text,
# # # #             student_answer=student_answer.answer_text,
# # # #             context=context,
# # # #             max_marks=2
# # # #         )

# # # #         response = self.client.chat.completions.create(
# # # #             model=config.openai.model,
# # # #             messages=[{"role": "user", "content": prompt}],
# # # #             temperature=0.3,
# # # #             max_tokens=800
# # # #         )

# # # #         output = response.choices[0].message.content
# # # #         score, feedback = GradingPrompts.extract_score_from_response(output)
# # # #         confidence = GradingPrompts.extract_confidence_from_response(output)

# # # #         return {
# # # #             "score": score,
# # # #             "feedback": feedback,
# # # #             "confidence": confidence,
# # # #             "raw": output
# # # #         }


# # # # import json, logging
# # # # from typing import List


# # # # from langchain.chat_models import ChatOpenAI, ChatGoogleGenerativeAI
# # # # from langchain.prompts import PromptTemplate
# # # # from langchain_community.embeddings import OpenAIEmbeddings
# # # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# # # # from langchain_community.embeddings     import OpenAIEmbeddings
# # # # from langchain_google_genai.embeddings  import GoogleGenerativeAIEmbeddings
# # # # from .database_services.student_answer_db      import StudentAnswerService
# # # # from .database_services.model_answer_embedding_db import ModelAnswerService
# # # # from .database_services.grading_result_db      import GradingResultDB
# # # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
# # # # from .embedding.abstract_embedder              import AbstractEmbedder
# # # # from ..prompts.rag_prompts                     import GRADING_PROMPT
# # # # from ..models.grading_result                   import GradingResult

# # # # log = logging.getLogger(__name__)


# # # # class RAGGrader:
# # # #     """
# # # #     Grades using Retrieval-Augmented Generation with LangChain.
# # # #     """

# # # #     def __init__(self,
# # # #                  provider: str,
# # # #                  chat_model: str,
# # # #                  embedder: AbstractEmbedder,
# # # #                  top_k: int = 6):
# # # #         self.provider  = provider
# # # #         self.top_k     = top_k
# # # #         self.embedder  = embedder

# # # #         # Chat + embeddings via LangChain wrappers
# # # #         if provider == "OpenAI":
# # # #             self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
# # # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # # #         else:
# # # #             self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
# # # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

# # # #         # PGVector store hooked to lecture chunks
# # # #         from langchain.vectorstores.pgvector import PGVector
# # # #         import os
# # # #         self.vstore = PGVector(
# # # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # # #             collection_name="lecture_material_chunks",
# # # #             embedding_function=self.lc_embed
# # # #         )

# # # #         # DB helpers
# # # #         self.stu_db  = StudentAnswerService()
# # # #         self.mod_db  = ModelAnswerService()
# # # #         self.result_db = GradingResultDB()

# # # #     # ─────────────────────────────────────────────────────────
# # # #     def grade_session(self, module: str, year: int, month: str, student=None):
# # # #         """
# # # #         Grade one paper (if student provided) or all papers in session.
# # # #         """
# # # #         groups = self.stu_db.get_all_answers_grouped()
# # # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # # #             if (mod, yr, mon) != (module, year, month):
# # # #                 continue
# # # #             if student and stu != student:
# # # #                 continue
# # # #             self._grade_paper(stu, mod, yr, mon, ans_list)

# # # #     # ─────────────────────────────────────────────────────────
# # # #     def _grade_paper(self, stu_idx, module, year, month, answers):
# # # #         total, possible = 0, 0

# # # #         for sa in answers:
# # # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # # #             if not ma:
# # # #                 log.warning("Model answer missing for %s", sa.full_question_id)
# # # #                 continue

# # # #             retrieved = self._retrieve(ma.question_text, module)
# # # #             score, reason = self._call_llm(sa, ma, retrieved)

# # # #             self.result_db.save_question_mark(
# # # #                 GradingResult(
# # # #                     student_index = stu_idx,
# # # #                     module_code   = module,
# # # #                     exam_year     = year,
# # # #                     exam_month    = month,
# # # #                     full_question_id = sa.full_question_id,
# # # #                     mark          = score,
# # # #                     max_marks     = ma.max_marks or 0,
# # # #                     reason        = reason
# # # #                 )
# # # #             )
# # # #             total    += score
# # # #             possible += ma.max_marks or 0

# # # #         self.result_db.save_paper_total(
# # # #             stu_idx, module, year, month, total, possible
# # # #         )
# # # #         self.result_db.commit()
# # # #         log.info("✅ %s graded — %d / %d", stu_idx, total, possible)

# # # #     # ─────────────────────────────────────────────────────────
# # # #     def _retrieve(self, question_text: str, module: str) -> str:
# # # #         docs = self.vstore.similarity_search(
# # # #             question_text, k=self.top_k,
# # # #             filter={"module_code": module}
# # # #         )
# # # #         return "\n---\n".join(d.page_content for d in docs)

# # # #     def _call_llm(self, sa, ma, retrieved):
# # # #         """Return (score:int, reason:str)."""
# # # #         prompt = PromptTemplate.from_template(GRADING_PROMPT).format(
# # # #             question_text   = ma.question_text or "",
# # # #             model_answer    = ma.answer_text,
# # # #             guideline       = ma.guideline_text or "",
# # # #             max_marks       = ma.max_marks or 0,
# # # #             retrieved_chunks= retrieved,
# # # #             student_answer  = sa.answer_text
# # # #         )
# # # #         response = self.chat.invoke(prompt).content
# # # #         if response.startswith("```"):
# # # #             response = response.strip("`").replace("json", "").strip()
# # # #         data = json.loads(response)
# # # #         return int(data["score"]), data["reason"]


# # # # import json
# # # # import logging
# # # # import os
# # # # from typing import List

# # # # from langchain_community.chat_models import ChatOpenAI
# # # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI

# # # # from langchain_community.embeddings import OpenAIEmbeddings
# # # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

# # # # from langchain.prompts import PromptTemplate
# # # # from langchain.vectorstores.pgvector import PGVector

# # # # from .database_services.student_answer_db import StudentAnswerService
# # # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB

# # # # from .database_services.grading_result_db import GradingResultDB
# # # # from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB

# # # # from .embedding.abstract_embedder import AbstractEmbedder
# # # # from ..prompts.rag_prompts import RAGPrompts
# # # # from ..models.grading_result import GradingResult

# # # # log = logging.getLogger(__name__)


# # # # class RAGGrader:
# # # #     """
# # # #     Grades using Retrieval-Augmented Generation with LangChain.
# # # #     """

# # # #     def __init__(self,
# # # #                  provider: str,
# # # #                  chat_model: str,
# # # #                  embedder: AbstractEmbedder,
# # # #                  top_k: int = 6):
# # # #         self.provider = provider
# # # #         self.top_k = top_k
# # # #         self.embedder = embedder

# # # #         # Select provider's chat and embedding models
# # # #         if provider == "OpenAI":
# # # #             self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
# # # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # # #         else:
# # # #             self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
# # # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

# # # #         # Vector store for lecture material
# # # #         self.vstore = PGVector(
# # # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # # #             collection_name="lecture_material_chunks",
# # # #             embedding_function=self.lc_embed
# # # #         )

# # # #         # Database services
# # # #         self.stu_db = StudentAnswerService()
# # # #         self.mod_db = ModelAnswerEmbeddingDB(self.embedder)
# # # #         self.result_db = GradingResultDB()

# # # #     # ─────────────────────────────────────────────────────────
# # # #     def grade_session(self, module: str, year: int, month: str, student=None):
# # # #         """
# # # #         Grade one paper (if student provided) or all papers in session.
# # # #         """
# # # #         groups = self.stu_db.get_all_answers_grouped()
# # # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # # #             if (mod, yr, mon) != (module, year, month):
# # # #                 continue
# # # #             if student and stu != student:
# # # #                 continue
# # # #             self._grade_paper(stu, mod, yr, mon, ans_list)

# # # #     # ─────────────────────────────────────────────────────────
# # # #     def _grade_paper(self, stu_idx, module, year, month, answers):
# # # #         total, possible = 0, 0

# # # #         for sa in answers:
# # # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # # #             if not ma:
# # # #                 log.warning("Model answer missing for %s", sa.full_question_id)
# # # #                 continue

# # # #             retrieved = self._retrieve(ma.question_text, module)
# # # #             score, reason = self._call_llm(sa, ma, retrieved)

# # # #             self.result_db.save_question_mark(
# # # #                 GradingResult(
# # # #                     student_index=stu_idx,
# # # #                     module_code=module,
# # # #                     exam_year=year,
# # # #                     exam_month=month,
# # # #                     full_question_id=sa.full_question_id,
# # # #                     mark=score,
# # # #                     max_marks=ma.max_marks or 0,
# # # #                     reason=reason
# # # #                 )
# # # #             )
# # # #             total += score
# # # #             possible += ma.max_marks or 0

# # # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# # # #         self.result_db.commit()
# # # #         log.info("✅ %s graded — %d / %d", stu_idx, total, possible)

# # # #     # ─────────────────────────────────────────────────────────
# # # #     def _retrieve(self, question_text: str, module: str) -> str:
# # # #         docs = self.vstore.similarity_search(
# # # #             question_text, k=self.top_k,
# # # #             filter={"module_code": module}
# # # #         )
# # # #         return "\n---\n".join(d.page_content for d in docs)

# # # #     def _call_llm(self, sa, ma, retrieved):
# # # #         """Return (score:int, reason:str)."""
# # # #         prompt = PromptTemplate.from_template(RAGPrompts.RAG_QUERY_PROMPT).format(
# # # #             question_text=ma.question_text or "",
# # # #             model_answer=ma.answer_text,
# # # #             guideline=ma.guideline_text or "",
# # # #             max_marks=ma.max_marks or 0,
# # # #             retrieved_chunks=retrieved,
# # # #             student_answer=sa.answer_text
# # # #         )

# # # #         response = self.chat.invoke(prompt).content

# # # #         if response.startswith("```"):
# # # #             response = response.strip("`").replace("json", "").strip()

# # # #         try:
# # # #             data = json.loads(response)
# # # #             return int(data["score"]), data["reason"]
# # # #         except Exception as e:
# # # #             log.error("❌ Failed to parse LLM response: %s\nRaw response: %s", e, response)
# # # #             return 0, "Invalid LLM response"


# # # import json
# # # import logging
# # # import os
# # # from typing import List

# # # # ── LangChain community / Google-GenAI split imports ───────────────────
# # # from langchain_community.chat_models import ChatOpenAI
# # # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI

# # # from langchain_community.embeddings import OpenAIEmbeddings
# # # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

# # # from langchain.prompts import PromptTemplate
# # # from langchain_community.vectorstores import PGVector        # <─ NEW path

# # # # ── Local services & models ────────────────────────────────────────────
# # # from .database_services.student_answer_db import StudentAnswerService
# # # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # # from .database_services.grading_result_db import GradingResultDB

# # # from .embedding.abstract_embedder import AbstractEmbedder
# # # from ..prompts.rag_prompts import RAGPrompts
# # # from ..models.grading_result import GradingResult

# # # log = logging.getLogger(__name__)

# # # # ======================================================================
# # # class RAGGrader:
# # #     """Grade student answers using Retrieval-Augmented Generation (RAG)."""

# # #     def __init__(
# # #         self,
# # #         provider: str,
# # #         chat_model: str,
# # #         embedder: AbstractEmbedder,
# # #         top_k: int = 6,
# # #     ):
# # #         self.provider = provider
# # #         self.top_k = top_k
# # #         self.embedder = embedder

# # #         # Choose chat model + embedding wrapper
# # #         if provider == "OpenAI":
# # #             self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
# # #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# # #         else:
# # #             self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
# # #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

# # #         # PGVector store holding lecture-material chunks
# # #         self.vstore = PGVector(
# # #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# # #             collection_name="lecture_material_chunks",
# # #             embedding_function=self.lc_embed,
# # #         )

# # #         # DB helpers
# # #         self.stu_db = StudentAnswerService()
# # #         self.mod_db = ModelAnswerEmbeddingDB(self.embedder)
# # #         self.result_db = GradingResultDB()

# # #     # ─────────────────────────────────────────────────────────
# # #     def grade_session(
# # #         self, module: str, year: int, month: str, student: str | None = None
# # #     ):
# # #         """Grade one paper (if *student* given) or all papers of a session."""
# # #         groups = self.stu_db.get_all_answers_grouped()
# # #         for (stu, mod, yr, mon), ans_list in groups.items():
# # #             if (mod, yr, mon) != (module, year, month):
# # #                 continue
# # #             if student and stu != student:
# # #                 continue
# # #             self._grade_paper(stu, mod, yr, mon, ans_list)

# # #     # ─────────────────────────────────────────────────────────
# # #     def _grade_paper(self, stu_idx, module, year, month, answers):
# # #         total, possible = 0, 0

# # #         for sa in answers:
# # #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# # #             if not ma:
# # #                 log.warning("⚠️  Model answer missing for %s", sa.full_question_id)
# # #                 continue  # skip if no model answer

# # #             retrieved_blocks = self._retrieve(ma["question_text"], module)
# # #             score, reason = self._call_llm(sa, ma, retrieved_blocks)

# # #             self.result_db.save_question_mark(
# # #                 GradingResult(
# # #                     student_index=stu_idx,
# # #                     module_code=module,
# # #                     exam_year=year,
# # #                     exam_month=month,
# # #                     full_question_id=sa.full_question_id,
# # #                     mark=score,
# # #                     max_marks=ma["max_marks"] or 0,
# # #                     reason=reason,
# # #                 )
# # #             )
# # #             total += score
# # #             possible += ma["max_marks"] or 0

# # #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
# # #         self.result_db.commit()
# # #         log.info("✅ %s graded — %d / %d", stu_idx, total, possible)

# # #     # ─────────────────────────────────────────────────────────
# # #     def _retrieve(self, question_text: str, module: str) -> str:
# # #         docs = self.vstore.similarity_search(
# # #             question_text, k=self.top_k, filter={"module_code": module}
# # #         )
# # #         return "\n---\n".join(d.page_content for d in docs)

# # #     # ─────────────────────────────────────────────────────────
# # #     def _call_llm(self, sa, ma_dict, retrieved) -> tuple[int, str]:
# # #         """Return (score, reason)."""

# # #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# # #             question_text=ma_dict["question_text"] or "",
# # #             model_answer=ma_dict["answer_text"],
# # #             guideline=ma_dict["guideline_text"] or "",
# # #             max_marks=ma_dict["max_marks"] or 0,
# # #             retrieved_chunks=retrieved,
# # #             student_answer=sa.answer_text,
# # #         )

# # #         response = self.chat.invoke(prompt).content
# # #         if response.startswith("```"):
# # #             response = response.strip("`").replace("json", "").strip()

# # #         try:
# # #             data = json.loads(response)
# # #             return int(data["score"]), data["reason"]
# # #         except Exception as e:
# # #             log.error("❌ JSON parse error: %s\nRaw LLM response: %s", e, response)
# # #             return 0, "Invalid LLM response"


# # # project/src/services/grading_rag_service.py
# # import json
# # import logging
# # import os
# # from typing import List

# # # ── LangChain community / Google-GenAI split imports ───────────────────
# # from langchain_community.chat_models import ChatOpenAI
# # from langchain_google_genai.chat_models import ChatGoogleGenerativeAI

# # from langchain_community.embeddings import OpenAIEmbeddings
# # from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings

# # from langchain.prompts import PromptTemplate
# # from langchain_community.vectorstores import PGVector

# # # ── Local services & models ────────────────────────────────────────────
# # from .database_services.student_answer_db import StudentAnswerService
# # from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# # from .database_services.grading_result_db import GradingResultDB

# # from .embedding.abstract_embedder import AbstractEmbedder
# # from ..prompts.rag_prompts import RAGPrompts
# # from ..models.grading_result import GradingResult, GradingMethod   # ← added enum

# # log = logging.getLogger(__name__)


# # # ======================================================================
# # class RAGGrader:
# #     """Grade student answers using Retrieval-Augmented Generation (RAG)."""

# #     def __init__(
# #         self,
# #         provider: str,
# #         chat_model: str,
# #         embedder: AbstractEmbedder,
# #         top_k: int = 6,
# #     ):
# #         self.provider = provider
# #         self.top_k = top_k
# #         self.embedder = embedder

# #         # Choose chat model + embedding wrapper
# #         if provider == "OpenAI":
# #             self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
# #             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
# #         else:
# #             self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
# #             self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

# #         # PGVector store holding lecture-material chunks
# #         self.vstore = PGVector(
# #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# #             collection_name="lecture_material_chunks",
# #             embedding_function=self.lc_embed,
# #         )

# #         # DB helpers
# #         self.stu_db   = StudentAnswerService()
# #         self.mod_db   = ModelAnswerEmbeddingDB(self.embedder)
# #         self.result_db = GradingResultDB()

# #     # ─────────────────────────────────────────────────────────
# #     def grade_session(
# #         self, module: str, year: int, month: str, student: str | None = None
# #     ):
# #         """Grade one paper (if *student* given) or all papers of a session."""
# #         groups = self.stu_db.get_all_answers_grouped()
# #         for (stu, mod, yr, mon), ans_list in groups.items():
# #             if (mod, yr, mon) != (module, year, month):
# #                 continue
# #             if student and stu != student:
# #                 continue
# #             self._grade_paper(stu, mod, yr, mon, ans_list)

# #     def _grade_paper(self,
# #                     stu_idx: str,
# #                     module:  str,
# #                     year:    int,
# #                     month:   str,
# #                     answers: list):
# #         """
# #         Grade every non-empty StudentAnswer in *answers*.
# #         A StudentAnswer is considered empty if .answer_text is None or only whitespace.
# #         """
# #         total     = 0
# #         possible  = 0
# #         graded_ok = 0
# #         skipped   = 0

# #         for sa in answers:
# #             # ── 1. make sure we actually have an answer ────────────────────
# #             if not sa.answer_text or sa.answer_text.strip() == "":
# #                 skipped += 1
# #                 log.warning("⚠️  Empty student answer for %s – skipping.",
# #                             sa.full_question_id)
# #                 continue

# #             # ── 2. look up model answer ────────────────────────────────────
# #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# #             if not ma:
# #                 skipped += 1
# #                 log.warning("⚠️  Model answer missing for %s – skipping.",
# #                             sa.full_question_id)
# #                 continue

# #             # ── 3. retrieve context + call LLM ─────────────────────────────
# #             retrieved_blocks = self._retrieve(ma["question_text"], module)
# #             score, reason    = self._call_llm(sa, ma, retrieved_blocks)

# #             # ── 4. persist result ──────────────────────────────────────────
# #             self.result_db.save_question_mark(
# #                 GradingResult(
# #                     student_index    = stu_idx,
# #                     module_code      = module,
# #                     exam_year        = year,
# #                     exam_month       = month,
# #                     full_question_id = sa.full_question_id,
# #                     mark             = score,
# #                     max_marks        = ma["max_marks"] or 0,
# #                     reason           = reason,
# #                     grading_method   = GradingMethod.RAG
# #                 )
# #             )
# #             graded_ok += 1
# #             total     += score
# #             possible  += ma["max_marks"] or 0

# #     # ── 5. save paper total & log summary ──────────────────────────────
# #         self.result_db.save_paper_total(stu_idx, module, year, month,
# #                                         total, possible)
# #         self.result_db.commit()

# #         log.info("✅ %s graded — %d / %d   (%d graded, %d skipped)",
# #                 stu_idx, total, possible, graded_ok, skipped)

# #     # ─────────────────────────────────────────────────────────
# #     def _retrieve(self, question_text: str, module: str) -> str:
# #         docs = self.vstore.similarity_search(
# #             question_text, k=self.top_k, filter={"module_code": module}
# #         )
# #         return "\n---\n".join(d.page_content for d in docs)

   
# #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[int, str]:
# #         """Return (score, reason) from LLM based on student answer, model, and lecture chunks."""

# #         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
# #             question_text=ma_dict["question_text"] or "",
# #             model_answer=ma_dict["answer_text"],
# #             guideline=ma_dict["guideline_text"] or "",
# #             max_marks=ma_dict["max_marks"] or 0,
# #             retrieved_chunks=retrieved,
# #             student_answer=student_answer_text,
# #         )

# #         response = self.chat.invoke(prompt).content
# #         if response.startswith("```"):
# #             response = response.strip("`").replace("json", "").strip()

# #         try:
# #             data = json.loads(response)
# #             return int(data["score"]), data["reason"]
# #         except Exception as e:
# #             log.error("❌ JSON parse error: %s\nRaw LLM response: %s", e, response)
# #             return 0, "Invalid LLM response"


# import json
# import logging
# import os
# from typing import List

# from langchain_community.chat_models import ChatOpenAI
# from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# from langchain.prompts import PromptTemplate
# from langchain_community.vectorstores import PGVector

# from .database_services.student_answer_db import StudentAnswerService
# from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# from .database_services.grading_result_db import GradingResultDB

# from .embedding.abstract_embedder import AbstractEmbedder
# from ..prompts.rag_prompts import RAGPrompts
# from ..models.grading_result import GradingResult, GradingMethod

# log = logging.getLogger(__name__)


# class RAGGrader:
#     """Grade student answers using Retrieval-Augmented Generation (RAG)."""

#     def __init__(
#         self,
#         provider: str,
#         chat_model: str,
#         embedder: AbstractEmbedder,
#         top_k: int = 6,
#     ):
#         self.provider = provider
#         self.top_k = top_k
#         self.embedder = embedder

#         # Choose chat model + embedding wrapper
#         if provider == "OpenAI":
#             self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
#             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
#         else:
#             self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
#             self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

#         # PGVector store holding lecture-material chunks
#         self.vstore = PGVector(
#             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
#             collection_name="lecture_material_chunks",
#             embedding_function=self.lc_embed,
#         )

#         # DB services
#         self.stu_db = StudentAnswerService()
#         self.mod_db = ModelAnswerEmbeddingDB(self.embedder)
#         self.result_db = GradingResultDB()

#     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
#         """Grade one paper (if *student* given) or all papers of a session."""
#         print(f"📘 Starting grading for: {module} {month} {year}")
#         groups = self.stu_db.get_all_answers_grouped()

#         count = 0
#         for (stu, mod, yr, mon), ans_list in groups.items():
#             if (mod, yr, mon) != (module, year, month):
#                 continue
#             if student and stu != student:
#                 continue

#             print(f"📝 Grading student: {stu}")
#             self._grade_paper(stu, mod, yr, mon, ans_list)
#             count += 1

#         if count == 0:
#             print("⚠️ No matching student answers found for this session.")
#         else:
#             print(f"✅ Finished grading {count} student(s).")

#     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
#         """Grade every non-empty StudentAnswer in *answers*."""
#         total = 0
#         possible = 0
#         graded_ok = 0
#         skipped = 0

#         for sa in answers:
#             if not sa.answer_text or sa.answer_text.strip() == "":
#                 skipped += 1
#                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
#                 continue

#             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
#             if not ma:
#                 skipped += 1
#                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
#                 continue

#             retrieved_blocks = self._retrieve(ma["question_text"], module)
#             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

#             self.result_db.save_question_mark(
#                 GradingResult(
#                     student_index=stu_idx,
#                     module_code=module,
#                     exam_year=year,
#                     exam_month=month,
#                     full_question_id=sa.full_question_id,
#                     mark=score,
#                     max_marks=ma["max_marks"] or 0,
#                     reason=reason,
#                     grading_method=GradingMethod.RAG
#                 )
#             )
#             graded_ok += 1
#             total += score
#             possible += ma["max_marks"] or 0

#         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
#         self.result_db.commit()

#         log.info("✅ %s graded — %d / %d   (%d graded, %d skipped)",
#                  stu_idx, total, possible, graded_ok, skipped)

#     def _retrieve(self, question_text: str, module: str) -> str:
#         docs = self.vstore.similarity_search(
#             question_text, k=self.top_k, filter={"module_code": module}
#         )
#         return "\n---\n".join(d.page_content for d in docs)

#     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[int, str]:
#         """Return (score, reason) from LLM based on student answer, model, and lecture chunks."""
#         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
#             question_text=ma_dict["question_text"] or "",
#             model_answer=ma_dict["answer_text"],
#             guideline=ma_dict["guideline_text"] or "",
#             max_marks=ma_dict["max_marks"] or 0,
#             retrieved_chunks=retrieved,
#             student_answer=student_answer_text,
#         )

#         response = self.chat.invoke(prompt).content
#         if response.startswith("```"):
#             response = response.strip("`").replace("json", "").strip()

#         try:
#             data = json.loads(response)
#             return int(data["score"]), data["reason"]
#         except Exception as e:
#             log.error("❌ JSON parse error: %s\nRaw LLM response: %s", e, response)
#             return 0, "Invalid LLM response"


# import json
# import logging
# import os
# from typing import List

# from langchain_community.chat_models import ChatOpenAI
# from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# from langchain.prompts import PromptTemplate
# from langchain_community.vectorstores import PGVector
# from src.utils.prompt_utils import PromptTemplates

# from .database_services.student_answer_db import StudentAnswerService
# from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# from .database_services.grading_result_db import GradingResultDB

# from .embedding.abstract_embedder import AbstractEmbedder
# from ..prompts.rag_prompts import RAGPrompts
# from ..models.grading_result import GradingResult, GradingMethod

# log = logging.getLogger(__name__)

# class RAGGrader:
#     def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
#         self.provider = provider
#         self.top_k = top_k
#         self.embedder = embedder

#         if provider == "OpenAI":
#             self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
#             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
#         else:
#             self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
#             self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

#         self.vstore = PGVector(
#             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
#             collection_name="lecture_material_chunks",
#             embedding_function=self.lc_embed,
#         )

#         self.stu_db = StudentAnswerService()
#         self.mod_db = ModelAnswerEmbeddingDB(self.embedder)
#         self.result_db = GradingResultDB()

#     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
#         print(f"📘 Starting grading for: {module} {month} {year}")
#         groups = self.stu_db.get_all_answers_grouped()

#         count = 0
#         for (stu, mod, yr, mon), ans_list in groups.items():
#             if (mod, yr, mon) != (module, year, month):
#                 continue
#             if student and stu != student:
#                 continue

#             print(f"📝 Grading student: {stu}")
#             self._grade_paper(stu, mod, yr, mon, ans_list)
#             count += 1

#         if count == 0:
#             print("⚠️ No matching student answers found for this session.")
#         else:
#             print(f"✅ Finished grading {count} student(s).")

#     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
#         total = 0.0
#         possible = 0.0
#         graded_ok = 0
#         skipped = 0

#         for sa in answers:
#             if not sa.answer_text or sa.answer_text.strip() == "":
#                 skipped += 1
#                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
#                 continue

#             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
#             if not ma:
#                 skipped += 1
#                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
#                 continue

#             retrieved_blocks = self._retrieve(ma["question_text"], module)
#             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

#             self.result_db.save_question_mark(
#                 GradingResult(
#                     student_index=stu_idx,
#                     module_code=module,
#                     exam_year=year,
#                     exam_month=month,
#                     full_question_id=sa.full_question_id,
#                     mark=score,
#                     max_marks=ma["max_marks"] or 0,
#                     reason=reason,
#                     grading_method=GradingMethod.RAG
#                 )
#             )
#             graded_ok += 1
#             total += score
#             possible += ma["max_marks"] or 0

#         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
#         self.result_db.commit()

#         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
#                  stu_idx, total, possible, graded_ok, skipped)

#     def _retrieve(self, question_text: str, module: str) -> str:
#         docs = self.vstore.similarity_search(
#             question_text, k=self.top_k, filter={"module_code": module}
#         )
#         return "\n---\n".join(d.page_content for d in docs)

#     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
#         prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
#             question_text=ma_dict["question_text"] or "",
#             model_answer=ma_dict["answer_text"],
#             guideline=ma_dict["guideline_text"] or "",
#             max_marks=ma_dict["max_marks"] or 0,
#             retrieved_chunks=retrieved,
#             student_answer=student_answer_text,
#         )

#         response = self.chat.invoke(prompt).content
#         if response.startswith("```"):
#             response = response.strip("`").replace("json", "").strip()

#         try:
#             data = json.loads(response)
#             return float(data["score"]), data["reason"]  # Allow decimal score
#         except Exception as e:
#             log.error("❌ JSON parse error: %s\nRaw LLM response: %s", e, response)
#             return 0.0, "Invalid LLM response"  # Return float zero

# src/services/grading_rag_service.py
# ENHANCED version of your RAGGrader with three-way comparison and few-shot prompting

import json
import logging
import os
from typing import List, Tuple, Dict, Any

from langchain_community.chat_models import ChatOpenAI
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import PGVector

from src.utils.prompt_utils import PromptTemplates
from src.services.database_services.student_answer_db import StudentAnswerService
from src.services.database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
from src.services.database_services.grading_result_db import GradingResultDB
from src.services.embedding.abstract_embedder import AbstractEmbedder
from src.services.llm_answer_service import LLMAnswerService

# UPDATED IMPORTS
from src.prompts.rag_prompts import RAGPrompts, RAGUtilities
from src.prompts.grading_prompts import GradingPrompts, PromptTemplates as GradingTemplates
from src.models.grading_result import GradingResult, GradingMethod

log = logging.getLogger(__name__)

class EnhancedRAGGrader:
    """
    Enhanced version of RAGGrader with:
    1. Few-shot prompting capabilities
    2. Three-way comparison grading (Model + LLM + Context)
    3. Backward compatibility with original RAG grading
    """
    
    def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, 
                 top_k: int = 6, enable_three_way: bool = True):
        """
        Initialize Enhanced RAG Grader
        
        Args:
            provider: "OpenAI" or "Google"
            chat_model: Model name for chat completion
            embedder: Embedder for vector operations
            top_k: Number of chunks to retrieve
            enable_three_way: Enable three-way comparison (default: True)
        """
        self.provider = provider
        self.top_k = top_k
        self.embedder = embedder
        self.enable_three_way = enable_three_way

        # Initialize chat model and embeddings
        if provider == "OpenAI":
            self.chat = ChatOpenAI(model_name=chat_model, temperature=0.0)
            self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
        else:
            self.chat = ChatGoogleGenerativeAI(model_name=chat_model, temperature=0.0)
            self.lc_embed = GoogleGenerativeAIEmbeddings(model=embedder.get_model_name())

        # Initialize vector store
        self.vstore = PGVector(
            connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
            collection_name="lecture_material_chunks",
            embedding_function=self.lc_embed,
        )

        # Initialize database services
        self.stu_db = StudentAnswerService()
        self.mod_db = ModelAnswerEmbeddingDB(self.embedder)
        self.result_db = GradingResultDB()
        
        # Initialize LLM Answer Service for three-way grading
        if self.enable_three_way:
            self.llm_answer_service = LLMAnswerService(self.chat, self.vstore, top_k)
            log.info("✅ Enhanced RAG Grader initialized with THREE-WAY comparison")
        else:
            log.info("✅ Enhanced RAG Grader initialized with TRADITIONAL RAG grading")

    def grade_session(self, module: str, year: int, month: str, student: str | None = None,
                     use_three_way: bool = None):
        """
        Grade entire session with option to use three-way comparison
        
        Args:
            module: Module code
            year: Exam year  
            month: Exam month
            student: Specific student (optional)
            use_three_way: Override three-way setting for this session
        """
        # Determine grading method
        use_three_way = use_three_way if use_three_way is not None else self.enable_three_way
        method_name = "THREE-WAY" if use_three_way else "TRADITIONAL RAG"
        
        print(f"📘 Starting {method_name} grading for: {module} {month} {year}")
        groups = self.stu_db.get_all_answers_grouped()

        count = 0
        for (stu, mod, yr, mon), ans_list in groups.items():
            if (mod, yr, mon) != (module, year, month):
                continue
            if student and stu != student:
                continue

            print(f"📝 Grading student: {stu} using {method_name}")
            
            if use_three_way:
                self._grade_paper_three_way(stu, mod, yr, mon, ans_list)
            else:
                self._grade_paper_traditional(stu, mod, yr, mon, ans_list)
                
            count += 1

        if count == 0:
            print("⚠️ No matching student answers found for this session.")
        else:
            print(f"✅ Finished {method_name} grading for {count} student(s).")

    def _grade_paper_three_way(self, stu_idx: str, module: str, year: int, month: str, answers: list):
        """
        Grade paper using three-way comparison method
        """
        total = 0.0
        possible = 0.0
        graded_ok = 0 
        skipped = 0

        for sa in answers:
            if not sa.answer_text or sa.answer_text.strip() == "":
                skipped += 1
                log.warning("⚠️ Empty student answer for %s – skipping.", sa.full_question_id)
                continue

            ma = self.mod_db.get_model_answer(sa.full_question_id, module)
            if not ma:
                skipped += 1
                log.warning("⚠️ Model answer missing for %s – skipping.", sa.full_question_id)
                continue

            try:
                # Use three-way comparison grading
                grading_result = self.llm_answer_service.grade_with_three_way_comparison(
                    question_text=ma.get("question_text", ""),
                    model_answer=ma.get("answer_text", ""),
                    student_answer=sa.answer_text,
                    max_marks=ma.get("max_marks", 0) or 0,
                    guideline=ma.get("guideline_text", ""),
                    module_code=module
                )

                # Create enhanced grading result
                result = GradingResult(
                    student_index=stu_idx,
                    module_code=module,
                    exam_year=year,
                    exam_month=month,
                    full_question_id=sa.full_question_id,
                    mark=grading_result['score'],
                    max_marks=ma.get("max_marks", 0) or 0,
                    reason=grading_result['reason'],
                    grading_method=GradingMethod.THREE_WAY_RAG  # New method
                )
                
                self.result_db.save_question_mark(result)
                graded_ok += 1
                total += grading_result['score']
                possible += ma.get("max_marks", 0) or 0

                log.info("✅ THREE-WAY: %s scored %.2f/%.2f - %s", 
                        sa.full_question_id, grading_result['score'], 
                        ma.get("max_marks", 0), grading_result['reason'][:50])

            except Exception as e:
                log.error("❌ Three-way grading error for %s: %s", sa.full_question_id, e)
                skipped += 1

        self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
        self.result_db.commit()

        log.info("✅ THREE-WAY COMPLETE: %s scored %.2f / %.2f (%d graded, %d skipped)",
                 stu_idx, total, possible, graded_ok, skipped)

    def _grade_paper_traditional(self, stu_idx: str, module: str, year: int, month: str, answers: list):
        """
        Grade paper using traditional RAG method (with few-shot enhancement)
        """
        total = 0.0
        possible = 0.0
        graded_ok = 0
        skipped = 0

        for sa in answers:
            if not sa.answer_text or sa.answer_text.strip() == "":
                skipped += 1
                log.warning("⚠️ Empty student answer for %s – skipping.", sa.full_question_id)
                continue

            ma = self.mod_db.get_model_answer(sa.full_question_id, module)
            if not ma:
                skipped += 1
                log.warning("⚠️ Model answer missing for %s – skipping.", sa.full_question_id)
                continue

            # Get RAG context
            retrieved_blocks = self._retrieve(ma.get("question_text", ""), module)
            
            # Use enhanced traditional grading with few-shot examples
            score, reason = self._call_llm_enhanced(sa.answer_text, ma, retrieved_blocks, module)

            self.result_db.save_question_mark(
                GradingResult(
                    student_index=stu_idx,
                    module_code=module,
                    exam_year=year,
                    exam_month=month,
                    full_question_id=sa.full_question_id,
                    mark=score,
                    max_marks=ma.get("max_marks", 0) or 0,
                    reason=reason,
                    grading_method=GradingMethod.RAG_WITH_FEW_SHOT  # Enhanced traditional
                )
            )
            graded_ok += 1
            total += score
            possible += ma.get("max_marks", 0) or 0

        self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
        self.result_db.commit()

        log.info("✅ ENHANCED RAG: %s scored %.2f / %.2f (%d graded, %d skipped)",
                 stu_idx, total, possible, graded_ok, skipped)

    def _retrieve(self, question_text: str, module: str) -> str:
        """
        Retrieve relevant context (unchanged from original)
        """
        docs = self.vstore.similarity_search(
            question_text, k=self.top_k, filter={"module_code": module}
        )
        return "\n---\n".join(d.page_content for d in docs)

    def _call_llm_enhanced(self, student_answer_text: str, ma_dict: dict, 
                          retrieved: str, module_code: str) -> Tuple[float, str]:
        """
        Enhanced LLM call with few-shot prompting (improved traditional method)
        """
        # Detect domain for appropriate few-shot examples
        domain = RAGUtilities.detect_domain_from_module(module_code)
        
        # Use enhanced prompt with few-shot examples
        prompt = RAGUtilities.format_grading_prompt_with_examples(
            question_text=ma_dict.get("question_text", ""),
            model_answer=ma_dict.get("answer_text", ""),
            guideline=ma_dict.get("guideline_text", ""),
            retrieved_chunks=retrieved,
            student_answer=student_answer_text,
            max_marks=ma_dict.get("max_marks", 0) or 0,
            domain=domain
        )

        response = self.chat.invoke(prompt).content
        
        # Parse response using enhanced utilities
        try:
            data = RAGUtilities.parse_json_response(response)
            validated_data = RAGUtilities.validate_grading_response(data, ma_dict.get("max_marks", 0) or 0)
            return float(validated_data["score"]), validated_data["reason"]
        except Exception as e:
            log.error("❌ Enhanced parsing error: %s\nRaw response: %s", e, response)
            return 0.0, "Enhanced parsing failed"

    def _call_llm(self, student_answer_text: str, ma_dict: dict, retrieved: str) -> Tuple[float, str]:
        """
        Original LLM call method (kept for backward compatibility)
        """
        prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT_ORIGINAL).format(
            question_text=ma_dict.get("question_text", ""),
            model_answer=ma_dict.get("answer_text", ""),
            guideline=ma_dict.get("guideline_text", ""),
            max_marks=ma_dict.get("max_marks", 0) or 0,
            retrieved_chunks=retrieved,
            student_answer=student_answer_text,
        )

        response = self.chat.invoke(prompt).content
        if response.startswith("```"):
            response = response.strip("`").replace("json", "").strip()

        try:
            data = json.loads(response)
            return float(data["score"]), data["reason"]
        except Exception as e:
            log.error("❌ Original JSON parse error: %s\nRaw response: %s", e, response)
            return 0.0, "Invalid LLM response"

    def compare_grading_methods(self, module: str, year: int, month: str, 
                              student: str, limit: int = 3) -> Dict[str, Any]:
        """
        Compare traditional vs three-way grading for analysis
        """
        if not self.enable_three_way:
            return {"error": "Three-way comparison not enabled"}

        print(f"🔍 Comparing grading methods for {student}")
        
        # Get student answers
        groups = self.stu_db.get_all_answers_grouped()
        student_answers = None
        
        for (stu, mod, yr, mon), ans_list in groups.items():
            if (stu, mod, yr, mon) == (student, module, year, month):
                student_answers = ans_list[:limit]  # Limit for comparison
                break
        
        if not student_answers:
            return {'error': 'Student answers not found'}

        comparisons = []
        for sa in student_answers:
            if not sa.answer_text or sa.answer_text.strip() == "":
                continue
                
            ma = self.mod_db.get_model_answer(sa.full_question_id, module)
            if not ma:
                continue

            # Traditional enhanced grading
            retrieved = self._retrieve(ma.get("question_text", ""), module)
            traditional_score, traditional_reason = self._call_llm_enhanced(
                sa.answer_text, ma, retrieved, module
            )

            # Three-way grading
            three_way_result = self.llm_answer_service.grade_with_three_way_comparison(
                question_text=ma.get("question_text", ""),
                model_answer=ma.get("answer_text", ""),
                student_answer=sa.answer_text,
                max_marks=ma.get("max_marks", 0) or 0,
                guideline=ma.get("guideline_text", ""),
                module_code=module
            )

            comparisons.append({
                'question_id': sa.full_question_id,
                'max_marks': ma.get("max_marks", 0),
                'student_answer_preview': sa.answer_text[:100] + "...",
                'traditional_enhanced': {
                    'score': traditional_score,
                    'reason': traditional_reason
                },
                'three_way': {
                    'score': three_way_result['score'],
                    'reason': three_way_result['reason'],
                    'model_coverage': three_way_result.get('model_coverage', ''),
                    'llm_coverage': three_way_result.get('llm_coverage', '')
                },
                'score_difference': three_way_result['score'] - traditional_score
            })

        return {
            'student': student,
            'module': module,
            'comparisons': comparisons,
            'summary': {
                'questions_compared': len(comparisons),
                'avg_traditional_score': sum(c['traditional_enhanced']['score'] for c in comparisons) / len(comparisons) if comparisons else 0,
                'avg_three_way_score': sum(c['three_way']['score'] for c in comparisons) / len(comparisons) if comparisons else 0,
                'avg_difference': sum(c['score_difference'] for c in comparisons) / len(comparisons) if comparisons else 0
            }
        }

    def get_grading_statistics(self) -> Dict[str, Any]:
        """
        Get comprehensive statistics about the grading system
        """
        stats = {
            'provider': self.provider,
            'top_k_retrieval': self.top_k,
            'three_way_enabled': self.enable_three_way,
            'grading_methods_available': [
                'traditional_rag',
                'enhanced_rag_with_few_shot',
            ]
        }
        
        if self.enable_three_way:
            stats['grading_methods_available'].append('three_way_comparison')
            stats['llm_service_stats'] = self.llm_answer_service.get_generation_statistics()
        
        return stats