import json
from evaluator.client import client
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from rag.rag_prompt2 import build_evaluation_prompt  # ⬅️ import the prompt builder

def evaluate_answer_with_rag(question, student_answer, total_marks, db_path="faiss_index"):
    """Evaluate a student answer using RAG context and return marks and feedback"""

    # Step 1: Load vector store and retrieve relevant context
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    try:
        vectordb = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
        results = vectordb.similarity_search(question, k=3)
        context = "\n\n".join([doc.page_content for doc in results]) if results else ""
    except Exception as e:
        context = ""

    # Step 2: Use prompt from external file
    prompt = build_evaluation_prompt(question, student_answer, context, total_marks)

    try:
        completion = client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
            messages=[{"role": "user", "content": prompt}],
        )

        response_text = completion.choices[0].message.content
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        json_str = response_text[json_start:json_end]
        result = json.loads(json_str)

        required_fields = ["awarded_marks", "feedback", "key_points_missed"]
        if not all(field in result for field in required_fields):
            raise ValueError("Incomplete JSON structure")

        return result

    except (json.JSONDecodeError, Exception):
        return {
            "awarded_marks": 0,
            "feedback": "Evaluation failed - API or parsing error",
            "key_points_missed": []
        }
