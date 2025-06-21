# src/scripts/embed_lecture_materials.py

import os
import glob
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.pgvector import PGVector
from langchain_openai import OpenAIEmbeddings
from config.settings import config

def embed_lecture_materials():
    pdf_dir = "src/data/lecture_materials"
    embedding_model = OpenAIEmbeddings(
        api_key=config.openai.api_key,
        model=config.openai.embedding_model
    )

    vector_db = PGVector(
        collection_name=config.database.lecture_collection,
        connection_string=config.database.connection_string,
        embedding_function=embedding_model,
    )

    pdf_files = glob.glob(os.path.join(pdf_dir, "*.pdf"))
    if not pdf_files:
        print("No PDFs found in", pdf_dir)
        return

    all_docs = []
    for file in pdf_files:
        loader = PyPDFLoader(file)
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        split_docs = splitter.split_documents(docs)
        all_docs.extend(split_docs)

    vector_db.add_documents(all_docs)
    print(f"Embedded {len(all_docs)} chunks from {len(pdf_files)} PDFs into vector DB.")

if __name__ == "__main__":
    embed_lecture_materials()
