

# from enum import Enum
# from dataclasses import dataclass


# class GradingMethod(Enum):
#     """How the mark was produced for this question."""
#     RAG    = "rag"     # Retrieval-Augmented (with lecture context)
#     DIRECT = "direct"  # Direct LLM grading (no extra context)


# @dataclass
# class GradingResult:
#     """
#     One record per student–question pair.

#     NOTE: Attribute names must match the keyword arguments used in
#     GradingResultDB.save_question_mark().
#     """
#     student_index:    str
#     module_code:      str
#     exam_year:        int
#     exam_month:       str

#     full_question_id: str   # e.g. Q1_i_a

#     mark:             float   # score awarded
#     max_marks:        float   # maximum available for that question

#     reason:           str   # brief justification from the LLM
#     grading_method:   GradingMethod
#     model_name:       str 
#     confidence: float = None


from enum import Enum
from dataclasses import dataclass
from typing import Optional


class GradingMethod(Enum):
    """How the mark was produced for this question."""
    RAG = "rag"       # Retrieval-Augmented (with lecture context)
    DIRECT = "direct" # Direct LLM grading (no extra context)
    SIMILARITY_BASED = "similarity_based"
    EMPTY = "empty"
    IRRELEVANT = "irrelevant"


@dataclass
class GradingResult:
    """
    One record per student–question pair.

    NOTE: Attribute names must match the keyword arguments used in
    GradingResultDB.save_question_mark().
    """
    student_index: str
    module_code: str
    exam_year: int
    exam_month: str

    full_question_id: str   # e.g. Q1_i_a

    score: float            # ✅ updated from mark
    max_marks: float

    feedback: str           # ✅ updated from reason
    grading_method: GradingMethod

    similarity_score: float = 0.0
    confidence_score: Optional[float] = None
    context_used: Optional[str] = None
    error_details: Optional[str] = None
