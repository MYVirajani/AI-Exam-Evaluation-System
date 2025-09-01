# evaluation_pipeline.py
from typing import Dict
from .rag.evaluator import RAGEvaluator
from .rag.vector_store import LectureNotesVectorStore
from .llm_evaluator import LLMEvaluator  # Your existing LLM evaluator

class HybridEvaluator:
    def __init__(self, lecture_notes_path):
        self.vector_store = LectureNotesVectorStore()
        try:
            self.vector_store.load_existing()
        except:
            self.vector_store.create_from_notes(lecture_notes_path)
            
        self.rag_evaluator = RAGEvaluator(self.vector_store)
        self.llm_evaluator = LLMEvaluator()  # Your existing implementation
    
    def evaluate_answer(self, question: str, answer: str, max_marks: int) -> Dict:
        # First evaluate against lecture notes
        rag_result = self.rag_evaluator.evaluate(question, answer)
        
        # Only use LLM if RAG score is below threshold
        if rag_result["score"] < 70:  # Adjust threshold as needed
            llm_result = self.llm_evaluator.evaluate_answer(
                question, answer, max_marks
            )
            return {
                "source": "llm",
                "score": llm_result["awarded_marks"],
                "feedback": llm_result["feedback"],
                "missing_concepts": llm_result.get("key_points_missed", [])
            }
        
        # Convert RAG 0-100 score to the marking scheme
        awarded_marks = (rag_result["score"] / 100) * max_marks
        return {
            "source": "lecture_notes",
            "score": awarded_marks,
            "feedback": rag_result["feedback"],
            "missing_concepts": rag_result["missing_concepts"]
        }