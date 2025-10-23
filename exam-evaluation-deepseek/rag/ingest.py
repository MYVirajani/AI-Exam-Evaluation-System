import os
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import (
    TextLoader,
    PyPDFLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredPowerPointLoader,
)
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain.chains import RetrievalQA
from langchain_community.llms import HuggingFaceHub 
from huggingface_hub import InferenceClient



# Load env vars
load_dotenv()

client = InferenceClient(
    provider="auto",
    api_key=os.getenv("HF_TOKEN"),
)

# Step 1: Load lecture notes
def load_documents(folder_path):
    docs = []
    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        ext = filename.lower().split(".")[-1]

        try:
            if ext == "txt":
                loader = TextLoader(filepath, encoding="utf-8")
            elif ext == "pdf":
                loader = PyPDFLoader(filepath)
            elif ext == "docx":
                loader = UnstructuredWordDocumentLoader(filepath)
            elif ext == "pptx":
                loader = UnstructuredPowerPointLoader(filepath)
            else:
                print(f"⏭️ Skipping unsupported file: {filename}")
                continue

            docs.extend(loader.load())
        except Exception as e:
            print(f"⚠️ Error loading {filename}: {e}")
    return docs


# Step 2: Chunk text
def split_documents(documents, chunk_size=500, chunk_overlap=50):
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_documents(documents)

# Step 3: Embed and Store in Vector DB
# def create_vectorstore(chunks, db_path="faiss_index"):
#     if not chunks:
#         print("❌ No document chunks found. Check if lecture notes folder is empty or unreadable.")
#         return

#     embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
#     vectordb = FAISS.from_documents(chunks, embedding=embeddings)
#     vectordb.save_local(db_path)
#     print(f"✅ Vector DB saved to: {db_path}/")

def create_vectorstore(chunks, db_path="faiss_index"):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    if os.path.exists(db_path):
        print(f"📂 Loading existing vector store from '{db_path}/' to append new documents.")
        vectordb = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
        vectordb.add_documents(chunks)
    else:
        print("📁 Creating new vector store.")
        vectordb = FAISS.from_documents(chunks, embedding=embeddings)

    vectordb.save_local(db_path)
    print(f"✅ Vector DB updated and saved to: {db_path}/")


# def test_vectorstore(db_path="faiss_index"):
#     print("🔄 Loading vector store for verification...")
#     embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
#     try:
#         vectordb = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
#         print("✅ Vector store loaded successfully.")
#     except Exception as e:
#         print(f"❌ Failed to load vector store: {e}")
#         return

#     # Prompt user for query
#     query = input("💬 Enter a query to test the vector store: ").strip()
#     if not query:
#         print("⚠️ No query entered. Exiting test.")
#         return

#     print(f"🔍 Performing similarity search for: '{query}'")
#     results = vectordb.similarity_search(query, k=3)

#     if results:
#         print(f"✅ Retrieved {len(results)} documents:")
#         for i, doc in enumerate(results, start=1):
#             print(f"\n📄 Document {i}:")
#             print(doc.page_content[:500], "...")
#     else:
#         print("⚠️ No matching documents found. Vector store may be empty or improperly embedded.")
        


# def ask_question(query, db_path="faiss_index", model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"):
#     # Load vector store
#     print("🔄 Loading vector store...")
#     embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
#     try:
#         vectordb = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
#         print("✅ Vector store loaded.")
#     except Exception as e:
#         print(f"❌ Error loading vector store: {e}")
#         return

#     # Step 1: Vector DB Retrieval
#     print(f"🔍 Searching vector DB for: '{query}'")
#     results = vectordb.similarity_search(query, k=3)

#     if results and any(doc.page_content.strip() for doc in results):
#         # Build context
#         context = "\n\n".join([doc.page_content for doc in results])
#         prompt = f"Answer the following question using only the context below:\n\nContext:\n{context}\n\nQuestion: {query}\n\nAnswer:"

#         print("💬 Generating answer from document context...")
#         response = client.text_generation(prompt=prompt, model=model, max_new_tokens=300)
#         print("📘 Answer (based on stored documents):")
#         print(response)
#     else:
#         # Fallback to general LLM knowledge
#         print("⚠️ No relevant documents found in vector DB. Using general knowledge LLM.")
#         prompt = f"The question could not be answered using stored documents. Please answer using your general knowledge.\n\nQuestion: {query}\n\nAnswer:"
#         response = client.text_generation(prompt=prompt, model=model, max_new_tokens=300)
#         print("🌐 Answer (based on general knowledge):")
#         print(response)


if __name__ == "__main__":
    notes_folder = r"..\data\Lecture_Notes"
    
    print("📥 Loading documents...")
    documents = load_documents(notes_folder)

    print("✂️ Splitting into chunks...")
    chunks = split_documents(documents)

    print("🔍 Embedding and saving to vector database...")
    create_vectorstore(chunks)
    
    # print("🧪 Testing vector database with a sample query...")
    # test_vectorstore()
    # while True:
    #     user_query = input("\n💬 Ask a question (or type 'exit' to quit): ").strip()
    #     if user_query.lower() == "exit":
    #         break
    #     ask_question(user_query)

