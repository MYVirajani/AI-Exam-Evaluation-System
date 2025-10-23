from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

def test_vectorstore(db_path="faiss_index"):
    print("🔄 Loading vector store for verification...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    try:
        vectordb = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
        print("✅ Vector store loaded successfully.")
    except Exception as e:
        print(f"❌ Failed to load vector store: {e}")
        return

    # Prompt user for query
    query = input("💬 Enter a query to test the vector store: ").strip()
    if not query:
        print("⚠️ No query entered. Exiting test.")
        return

    print(f"🔍 Performing similarity search for: '{query}'")
    results = vectordb.similarity_search(query, k=3)

    if results:
        print(f"✅ Retrieved {len(results)} documents:")
        for i, doc in enumerate(results, start=1):
            print(f"\n📄 Document {i}:")
            print(doc.page_content[:500], "...")
    else:
        print("⚠️ No matching documents found. Vector store may be empty or improperly embedded.")

if __name__ == "__main__":
    test_vectorstore()
