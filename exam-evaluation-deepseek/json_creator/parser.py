import os
from langchain_community.document_loaders import PyPDFLoader

def load_text_from_pdf(file_path):
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        return "\n".join([doc.page_content for doc in docs])
    except Exception as e:
        print(f"Failed to load {file_path}: {e}")
        return ""
