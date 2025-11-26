from enum import Enum
from dataclasses import dataclass
from typing import Optional

class GradingMethod(Enum):
    RAG = "rag"
    BASIC = "basic"
    HUMAN = "human"

@dataclass
class GradingResultRecord:
    
    submission_id: str
    question_number: str
    score: float          
    max_marks: float
    feedback: str      
    grading_method: GradingMethod
    answer_source: str
    similarity_score: float = 0.0
    confidence_score: Optional[float] = None
    context_used: Optional[str] = None
    error_details: Optional[str] = None