

# # import json
# # import logging
# # import os
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

# #         # Vector store for lecture material
# #         self.vstore = PGVector(
# #             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
# #             collection_name=f"lecture_material_chunks_{self.suffix}",
# #             embedding_function=self.lc_embed,
# #         )

# #         # Relational DB and embedding DBs
# #         # self.stu_db = StudentAnswerService(provider_suffix=self.suffix)
# #         self.stu_db = StudentAnswerService(provider_suffix=self.provider)

# #         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
# #         self.mod_db = ModelAnswerEmbeddingDB(embedder)
# #         self.result_db = GradingResultDB()

# #     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
# #         print(f"📘 Starting grading for: {module} {month} {year}")
# #         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

# #         count = 0
# #         for (stu, mod, yr, mon), ans_list in groups.items():
# #             if (mod, yr, mon) != (module, year, month):
# #                 continue
# #             if student and stu != student:
# #                 continue

# #             print(f"📝 Grading student: {stu}")
# #             self._grade_paper(stu, mod, yr, mon, ans_list)
# #             count += 1

# #         if count == 0:
# #             print("⚠️ No matching student answers found for this session.")
# #         else:
# #             print(f"✅ Finished grading {count} student(s).")

# #     def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
# #         total = 0.0
# #         possible = 0.0
# #         graded_ok = 0
# #         skipped = 0

# #         for sa in answers:
# #             if not sa.answer_text or sa.answer_text.strip() == "":
# #                 skipped += 1
# #                 log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
# #                 continue

# #             ma = self.mod_db.get_model_answer(sa.full_question_id, module)
# #             if not ma:
# #                 skipped += 1
# #                 log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
# #                 continue

# #             # fetch context from lecture materials
# #             retrieved_blocks = self._retrieve(ma["question_text"], module)

# #             # fetch student answer embedding for RAG
# #             student_embedding = self.stu_embed_db.get_embedding(
# #                 student_index=stu_idx,
# #                 full_question_id=sa.full_question_id,
# #                 module_code=module,
# #                 exam_year=year,
# #                 exam_month=month
# #             )

# #             # send prompt to LLM
# #             score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

# #             self.result_db.save_question_mark(
# #                 GradingResult(
# #                     student_index=stu_idx,
# #                     module_code=module,
# #                     exam_year=year,
# #                     exam_month=month,
# #                     full_question_id=sa.full_question_id,
# #                     mark=score,
# #                     max_marks=ma["max_marks"] or 0,
# #                     reason=reason,
# #                     grading_method=GradingMethod.RAG,
# #                     model_name=self.chat.model_name if hasattr(self.chat, "model_name") else "unknown"
# #                 )
# #             )
# #             graded_ok += 1
# #             total += score
# #             possible += ma["max_marks"] or 0

# #         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible, model_name=self.embedder.get_model_name())
# #         self.result_db.commit()

# #         log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
# #                  stu_idx, total, possible, graded_ok, skipped)

# #     def _retrieve(self, question_text: str, module: str) -> str:
# #         docs = self.vstore.similarity_search(
# #             question_text, k=self.top_k, filter={"module_code": module}
# #         )
# #         return "\n---\n".join(d.page_content for d in docs)

# #     def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
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
# #             return float(data["score"]), data["reason"]
# #         except Exception as e:
# #             log.error("❌ JSON parse error: %s\nRaw LLM response: %s", e, response)
# #             return 0.0, "Invalid LLM response"


# import json
# import logging
# import os
# import re
# from typing import List

# from langchain_community.chat_models import ChatOpenAI
# from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
# from langchain_community.embeddings import OpenAIEmbeddings
# from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
# from langchain.prompts import PromptTemplate
# from langchain_community.vectorstores import PGVector

# from src.utils.prompt_utils import PromptTemplates
# from .database_services.student_answer_db import StudentAnswerService
# from .database_services.student_embedding_db import StudentAnswerEmbeddingDB
# from .database_services.model_answer_embedding_db import ModelAnswerEmbeddingDB
# from .database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
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
#         self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

#         if provider == "OpenAI":
#             self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
#             self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
#         else:
#             self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
#             self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

#         # Vector store for lecture material
#         self.vstore = PGVector(
#             connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
#             collection_name=f"lecture_material_chunks_{self.suffix}",
#             embedding_function=self.lc_embed,
#         )

#         self.stu_db = StudentAnswerService(provider_suffix=self.provider)
#         self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
#         self.mod_db = ModelAnswerEmbeddingDB(embedder)
#         self.result_db = GradingResultDB()

#     def grade_session(self, module: str, year: int, month: str, student: str | None = None):
#         print(f"📘 Starting grading for: {module} {month} {year}")
#         groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

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

#             student_embedding = self.stu_embed_db.get_embedding(
#                 student_index=stu_idx,
#                 full_question_id=sa.full_question_id,
#                 module_code=module,
#                 exam_year=year,
#                 exam_month=month
#             )

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
#                     grading_method=GradingMethod.RAG,
#                     model_name=self.chat.model_name if hasattr(self.chat, "model_name") else "unknown"
#                 )
#             )
#             graded_ok += 1
#             total += score
#             possible += ma["max_marks"] or 0

#         self.result_db.save_paper_total(stu_idx, module, year, month, total, possible, model_name=self.embedder.get_model_name())
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

#         def extract_json_object(text: str):
#             try:
#                 match = re.search(r'\{.*?\}', text, re.DOTALL)
#                 if match:
#                     return json.loads(match.group(0))
#             except json.JSONDecodeError as e:
#                 log.error("❌ JSON decode error: %s", e)
#             return None

#         data = extract_json_object(response)

#         if data:
#             return float(data.get("score", 0)), data.get("reason", "No reason provided")
#         else:
#             log.error("❌ JSON parse error: Could not extract valid JSON\nRaw LLM response: %s", response)
#             return 0.0, "Invalid LLM response"


import json
import logging
import os
import re
from typing import List

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
    def __init__(self, provider: str, chat_model: str, embedder: AbstractEmbedder, top_k: int = 6):
        self.provider = provider
        self.top_k = top_k
        self.embedder = embedder
        self.suffix = embedder.get_table_suffix()  # "openai" or "gemini"

        if provider == "OpenAI":
            self.chat = ChatOpenAI(model=chat_model, temperature=0.0)
            self.lc_embed = OpenAIEmbeddings(model=embedder.get_model_name())
        else:
            self.chat = ChatGoogleGenerativeAI(model=chat_model, temperature=0.0)
            self.lc_embed = GoogleGenerativeAIEmbeddings(model=f"models/{embedder.get_model_name()}")

        # Vector store for lecture material
        self.vstore = PGVector(
            connection_string=os.getenv("PGVECTOR_CONNECTION_STRING"),
            collection_name=f"lecture_material_chunks_{self.suffix}",
            embedding_function=self.lc_embed,
        )

        self.stu_db = StudentAnswerService(provider_suffix=self.provider.lower())
        self.stu_embed_db = StudentAnswerEmbeddingDB(embedder)
        self.mod_db = ModelAnswerEmbeddingDB(embedder)
        self.result_db = GradingResultDB(provider_suffix=self.provider.lower())

    def grade_session(self, module: str, year: int, month: str, student: str | None = None):
        print(f"\U0001F4D8 Starting grading for: {module} {month} {year}")
        groups = self.stu_db.get_all_answers_grouped(module_code=module, year=year, month=month)

        count = 0
        for (stu, mod, yr, mon), ans_list in groups.items():
            if (mod, yr, mon) != (module, year, month):
                continue
            if student and stu != student:
                continue

            print(f"\U0001F4DD Grading student: {stu}")
            self._grade_paper(stu, mod, yr, mon, ans_list)
            count += 1

        if count == 0:
            print("⚠️ No matching student answers found for this session.")
        else:
            print(f"✅ Finished grading {count} student(s).")

    def _grade_paper(self, stu_idx: str, module: str, year: int, month: str, answers: list):
        total = 0.0
        possible = 0.0
        graded_ok = 0
        skipped = 0

        for sa in answers:
            if not sa.answer_text or sa.answer_text.strip() == "":
                skipped += 1
                log.warning("⚠️  Empty student answer for %s – skipping.", sa.full_question_id)
                continue

            ma = self.mod_db.get_model_answer(sa.full_question_id, module)
            if not ma:
                skipped += 1
                log.warning("⚠️  Model answer missing for %s – skipping.", sa.full_question_id)
                continue

            retrieved_blocks = self._retrieve(ma["question_text"], module)

            student_embedding = self.stu_embed_db.get_embedding(
                student_index=stu_idx,
                full_question_id=sa.full_question_id,
                module_code=module,
                exam_year=year,
                exam_month=month
            )

            score, reason = self._call_llm(sa.answer_text, ma, retrieved_blocks)

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
                    similarity_score=0.0,
                    grading_method=GradingMethod.RAG,
                    confidence_score=1.0
                )
            )
            graded_ok += 1
            total += score
            possible += ma["max_marks"] or 0

        self.result_db.save_paper_total(stu_idx, module, year, month, total, possible)
        self.result_db.commit()

        log.info("✅ %s graded — %.2f / %.2f   (%d graded, %d skipped)",
                 stu_idx, total, possible, graded_ok, skipped)

    def _retrieve(self, question_text: str, module: str) -> str:
        docs = self.vstore.similarity_search(
            question_text, k=self.top_k, filter={"module_code": module}
        )
        return "\n---\n".join(d.page_content for d in docs)

    def _call_llm(self, student_answer_text: str, ma_dict, retrieved) -> tuple[float, str]:
        prompt = PromptTemplate.from_template(RAGPrompts.GRADING_PROMPT).format(
            question_text=ma_dict["question_text"] or "",
            model_answer=ma_dict["answer_text"],
            guideline=ma_dict["guideline_text"] or "",
            max_marks=ma_dict["max_marks"] or 0,
            retrieved_chunks=retrieved,
            student_answer=student_answer_text,
        )

        response = self.chat.invoke(prompt).content

        def extract_json_object(text: str):
            try:
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