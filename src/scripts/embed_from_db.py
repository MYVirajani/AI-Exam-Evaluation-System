# # import os
# # import sys
# # from docx import Document

# # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

# # from src.services.answer_extractor import AnswerExtractor
# # from src.models.student_answer import StudentAnswer
# # from src.services.database_services.student_answer_db import StudentAnswerService
# # from src.services.database_services.student_embedding_db import StudentEmbeddingService
# # from src.services.embedding.openai_embedder import OpenAIEmbedder
# # from src.services.embedding.gemini_embedder import GeminiEmbedder

# # def load_docx_text(docx_path: str) -> str:
# #     doc = Document(docx_path)
# #     return "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])

# # if __name__ == "__main__":
# #     import argparse

# #     parser = argparse.ArgumentParser(description="Extract, embed, and save student answers.")
# #     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
# #     parser.add_argument("--model", required=True)
# #     parser.add_argument("--file", required=True, help="Path to DOCX answer script")
# #     parser.add_argument("--index", required=True, help="Student index number")
# #     args = parser.parse_args()

# #     # Step 1: Load text
# #     raw_text = load_docx_text(args.file)

# #     # Step 2: Extract answers
# #     extractor = AnswerExtractor(selected_provider=args.provider, selected_model=args.model)
# #     extracted_answers = extractor.extract_answers_with_llm(raw_text)
# #     for a in extracted_answers:
# #         a.student_index = args.index  # Set student index

# #     # Step 3: Save raw answers to relational DB
# #     answer_db = StudentAnswerService()
# #     answer_db.initialize_table()
# #     answer_db.save_student_answers(args.index, extracted_answers)

# #     # Step 4: Embed answers
# #     if args.provider == "OpenAI":
# #         embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
# #     elif args.provider == "GoogleGemini":
# #         embedder = GeminiEmbedder()
# #     else:
# #         raise ValueError("Unsupported provider.")

# #     answer_texts = [a.answer_text for a in extracted_answers]
# #     vectors = embedder.embed(answer_texts)

# #     # Step 5: Save embeddings to vector DB
# #     vector_db = StudentEmbeddingService()
# #     vector_db.initialize_table()
# #     for ans, vec in zip(extracted_answers, vectors):
# #         vector_db.save_answer_embedding(ans.student_index, ans.full_question_id, vec)

# #     print(f"Answers and embeddings saved for {args.index}")



# # src/scripts/embed_from_db.py

# import argparse
# import sys
# import os

# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
# from src.controller.embed_from_db_controller import embed_answers_from_db

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser()
#     parser.add_argument("--index", required=True, help="Student Index")
#     parser.add_argument("--provider", required=True, choices=["OpenAI", "GoogleGemini"])
#     args = parser.parse_args()

#     try:
#         embed_answers_from_db(provider=args.provider, student_index=args.index)
#         print(f"Successfully embedded answers for {args.index} using {args.provider}")
#     except Exception as e:
#         print(f"Failed: {e}")
import argparse
from src.controller.embed_from_db_controller import embed_student_answers

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini"], required=True)
    parser.add_argument("--model", type=str, required=True)
    args = parser.parse_args()

    embed_student_answers(provider=args.provider, model=args.model)
