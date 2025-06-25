# import os
# from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.database_services.lecture_material_db import LectureMaterialEmbeddingService
# from src.utils.file_utils import read_docx_text, clean_text

# def embed_lecture_materials(directory: str):
#     embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
#     db = LectureMaterialEmbeddingService()
#     db.initialize_table()

#     for filename in os.listdir(directory):
#         if filename.endswith(".docx"):
#             file_path = os.path.join(directory, filename)
#             raw_text = read_docx_text(file_path)
#             cleaned_text = clean_text(raw_text)
#             chunks = chunk_text(cleaned_text, chunk_size=1000)
#             vectors = embedder.embed(chunks)
#             db.save_lecture_embeddings(filename, dict(zip(chunks, vectors)))


import os
from src.services.embedding.openai_embedder import OpenAIEmbedder
from src.services.database_services.lecture_material_db import LectureMaterialEmbeddingService
from src.utils.lecture_file_reader import read_file
from src.utils.text_processing import clean_text

def chunk_text(text, chunk_size=1000):
    words = text.split()
    return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

def embed_lecture_materials(directory: str):
    embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
    db = LectureMaterialEmbeddingService()
    db.initialize_table()

    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        try:
            content = read_file(file_path)
            cleaned = clean_text(content)
            chunks = chunk_text(cleaned)
            vectors = embedder.embed(chunks)
            db.save_lecture_embeddings(filename, dict(zip(chunks, vectors)))
            print(f"Processed {filename}")
        except Exception as e:
            print(f"Skipping {filename}: {e}")
