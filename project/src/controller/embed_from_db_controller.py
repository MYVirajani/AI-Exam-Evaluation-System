# # src/controller/embed_from_db_controller.py

# from src.services.database_services.student_answer_db import StudentAnswerService
# from src.services.database_services.student_embedding_db import StudentEmbeddingService
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder

# def embed_answers_from_db(provider: str, student_index: str):
#     # Step 1: Load answers from relational DB
#     relational_db = StudentAnswerService()
#     answers_dict = relational_db.get_student_answers(student_index)


#     if not answers_dict:
#         raise ValueError(f"No answers found for student index: {student_index}")

#     # Step 2: Choose embedder
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder()
#     else:
#         raise ValueError("Unsupported provider")

#     # Step 3: Prepare data
#     question_ids = list(answers_dict.keys())
#     texts = [answers_dict[qid] for qid in question_ids if answers_dict[qid]]  # ✅ filter empty answers
#     filtered_question_ids = [qid for qid in question_ids if answers_dict[qid]]  # same filter to match

#     # Step 4: Embed
#     vectors = embedder.embed(texts)

#     # Step 5: Save embeddings
#     vector_db = StudentEmbeddingService()
#     vector_db.initialize_table()

#     for qid, vec in zip(filtered_question_ids, vectors):
#         vector_db.save_answer_embedding(student_index, qid, vec)


# from src.services.database_services.student_answer_db import StudentAnswerService
# from src.services.database_services.student_embedding_db import StudentEmbeddingService
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder

# def embed_answers_from_db(provider: str, student_index: str):
#     # Step 1: Get answers from relational DB
#     relational_db = StudentAnswerService()
#     answers_dict = relational_db.get_student_answers(student_index)

#     if not answers_dict:
#         raise ValueError(f"No answers found for {student_index}")

#     # Step 2: Choose embedder
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder()
#     else:
#         raise ValueError("Invalid provider")

#     # Step 3: Embed only answer columns
#     question_cols = [key for key in answers_dict if key != "student_index"]
#     texts_to_embed = [answers_dict[key] or "" for key in question_cols]
#     vectors = embedder.embed(texts_to_embed)

#     # Step 4: Save to vector DB
#     embedding_db = StudentEmbeddingService()
#     embedding_db.initialize_table()
#     embedding_db.save_student_embeddings(student_index, dict(zip(question_cols, vectors)))

# src/controller/embed_from_db_controller.py

# from src.services.database_services.student_answer_db import StudentAnswerService
# from src.services.database_services.student_embedding_db import StudentEmbeddingService
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder

# def embed_answers_from_db(provider: str, student_index: str):
#     # Step 1: Get answers from relational DB
#     relational_db = StudentAnswerService()
#     answers_dict = relational_db.get_student_answers(student_index)

#     if not answers_dict:
#         raise ValueError(f"No answers found for {student_index}")

#     # Step 2: Choose embedder based on provider
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder()
#     else:
#         raise ValueError("Invalid provider. Must be 'OpenAI' or 'GoogleGemini'")

#     # Step 3: Prepare clean question columns and texts
#     question_cols = [key for key in answers_dict if key != "student_index"]
#     clean_texts = []
#     clean_cols = []

#     for key in question_cols:
#         text = answers_dict[key]
#         if text and text.strip():
#             clean_texts.append(text.strip())
#             clean_cols.append(key)

#     if not clean_texts:
#         raise ValueError("All answers are empty or null. Nothing to embed.")

#     # Step 4: Get embeddings
#     vectors = embedder.embed(clean_texts)

#     # Step 5: Save to vector DB
#     vector_db = StudentEmbeddingService()
#     vector_db.initialize_table()

#     for col, vec in zip(clean_cols, vectors):
#         vector_db.save_answer_embedding(student_index, col, vec)

#     print(f"✅ Successfully embedded and saved {len(vectors)} answers for {student_index} to vector DB.")


# from src.services.database_services.student_answer_db import StudentAnswerService
# from src.services.database_services.student_embedding_db import StudentEmbeddingService
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder

# def embed_answers_from_db(provider: str, student_index: str):
#     # Step 1: Get answers from relational DB
#     relational_db = StudentAnswerService()
#     answers_dict = relational_db.get_student_answers(student_index)

#     if not answers_dict:
#         raise ValueError(f"No answers found for {student_index}")

#     # Step 2: Choose embedder
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder()
#     else:
#         raise ValueError("Invalid provider")

#     # Step 3: Embed only answer columns
#     question_cols = [key for key in answers_dict if key != "student_index"]
#     texts_to_embed = [answers_dict[key] or "" for key in question_cols]
#     vectors = embedder.embed(texts_to_embed)

#     # Step 4: Save to vector DB
#     embedding_db = StudentEmbeddingService()
#     embedding_db.initialize_table()
#     embedding_db.save_student_embeddings(student_index, dict(zip(question_cols, vectors)))


# from src.services.database_services.student_answer_db import StudentAnswerService
# from src.services.database_services.student_embedding_db import StudentEmbeddingService
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder

# def embed_answers_from_db(provider: str, student_index: str):
#     # Step 1: Get answers from relational DB
#     relational_db = StudentAnswerService()
#     answers_dict = relational_db.get_student_answers(student_index)

#     if not answers_dict:
#         raise ValueError(f"No answers found for {student_index}")

#     # Step 2: Choose embedder
#     if provider == "OpenAI":
#         embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     elif provider == "GoogleGemini":
#         embedder = GeminiEmbedder()
#     else:
#         raise ValueError("Invalid provider")

#     # Step 3: Prepare and clean input data (skip empty values)
#     question_cols = [key for key in answers_dict if key != "student_index"]
#     texts_to_embed = [answers_dict[key] or "" for key in question_cols]

#     # Filter out empty/whitespace-only answers to avoid API errors
#     filtered_data = [(qid, text.strip()) for qid, text in zip(question_cols, texts_to_embed) if text.strip()]
#     if not filtered_data:
#         raise ValueError("No valid (non-empty) answers to embed.")

#     filtered_question_cols, filtered_texts = zip(*filtered_data)
#     vectors = embedder.embed(list(filtered_texts))

#     # Step 4: Save to vector DB
#     embedding_db = StudentEmbeddingService()
#     embedding_db.initialize_table()
#     embedding_db.save_student_embeddings(student_index, dict(zip(filtered_question_cols, vectors)))

from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.student_embedding_db import StudentAnswerEmbeddingDB
from src.services.database_services.student_answer_db import StudentAnswerService

def embed_student_answers(provider: str, model: str):
    embedder = OpenAIEmbedder(model) if provider == "OpenAI" else GeminiEmbedder(model)
    db_service = StudentAnswerService()
    # answer_records = db_service.get_all_answers()


    grouped_answers = db_service.get_all_answers_grouped()
    # vector_db.save_embeddings(answer_records)
    vector_db = StudentAnswerEmbeddingDB(embedder)
    for key, answers in grouped_answers.items():
        vector_db.save_embeddings(answers)

# def embed_student_answers(provider: str, model: str, student_index: str, module_code: str, year: int, month: str):
#     embedder = OpenAIEmbedder(model) if provider == "OpenAI" else GeminiEmbedder(model)
#     db_service = StudentAnswerService()
#     # answer_records = db_service.get_all_answers()
#     answer_records = db_service.get_all_answers_for_embedding(student_index, module_code, year, month)


#     vector_db = StudentAnswerEmbeddingDB(embedder)
#     vector_db.save_embeddings(answer_records)
