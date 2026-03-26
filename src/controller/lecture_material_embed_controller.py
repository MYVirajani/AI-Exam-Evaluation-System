

import os
from src.services.embedding.openai_embedder import OpenAIEmbedder
# from src.services.embedding.gemini_embedder import GeminiEmbedder
from src.services.database_services.lecture_material_embedding_db import LectureMaterialEmbeddingDB
from src.utils.token_chunker import read_file
from src.utils.text_processing import clean_text
from src.models.lecture_chunk import LectureChunk

def chunk_text(text, chunk_size=1000):
    words = text.split()
    return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

def embed_lecture_materials(directory: str, module_code: str):
   
    embedder = OpenAIEmbedder(model_name="text-embedding-3-small")
    # embedder = GeminiEmbedder(model_name="models/embedding-001")

    db = LectureMaterialEmbeddingDB(embedder)

    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        try:
            content = read_file(file_path)
            cleaned = clean_text(content)
            chunks = chunk_text(cleaned)

            lecture_chunks = [
                LectureChunk(
                    module_code=module_code,
                    source_file=filename,
                    chunk_id=i,
                    text=chunk
                ) for i, chunk in enumerate(chunks)
            ]

            db.save_chunks(lecture_chunks)
            print(f"Processed: {filename}")
        except Exception as e:
            print(f"Skipping {filename}: {e}")
