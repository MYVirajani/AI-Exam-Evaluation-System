# # from dataclasses import dataclass
# # from typing import Optional, List
# # from enum import Enum

# # class GradingMethod(Enum):
# #     RAG_ASSISTED = "rag_assisted"
# #     DIRECT_LLM = "direct_llm"
# #     SIMILARITY_BASED = "similarity_based"
# #     ERROR_FALLBACK = "error_fallback"

# # @dataclass
# # class GradingResult:
# #     question_id: str
# #     sub_question_id: Optional[str]
# #     student_answer: str
# #     model_answer: str
# #     score: float
# #     max_marks: int
# #     feedback: str
# #     similarity_score: float
# #     grading_method: GradingMethod
# #     confidence_score: float = 0.0
# #     context_used: Optional[str] = None
# #     error_details: Optional[str] = None

# #     @property
# #     def full_question_id(self) -> str:
# #         return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id

# #     @property
# #     def percentage(self) -> float:
# #         return (self.score / self.max_marks) * 100 if self.max_marks else 0.0

# #     def is_passing(self, passing_threshold: float = 50.0) -> bool:
# #         return self.percentage >= passing_threshold

# # @dataclass
# # class PaperGradingResult:
# #     student_name: str
# #     paper_path: str
# #     question_results: List[GradingResult]
# #     total_score: float = 0.0
# #     total_marks: int = 0
# #     processing_time: float = 0.0
# #     errors: List[str] = None

# #     def __post_init__(self):
# #         if self.errors is None:
# #             self.errors = []
# #         self.total_score = sum(result.score for result in self.question_results)
# #         self.total_marks = sum(result.max_marks for result in self.question_results)

# #     @property
# #     def percentage(self) -> float:
# #         return (self.total_score / self.total_marks) * 100 if self.total_marks else 0.0

# #     @property
# #     def grade_letter(self) -> str:
# #         pct = self.percentage
# #         if pct >= 90: return "A+"
# #         elif pct >= 85: return "A"
# #         elif pct >= 80: return "A-"
# #         elif pct >= 75: return "B+"
# #         elif pct >= 70: return "B"
# #         elif pct >= 65: return "B-"
# #         elif pct >= 60: return "C+"
# #         elif pct >= 55: return "C"
# #         elif pct >= 50: return "C-"
# #         elif pct >= 45: return "D"
# #         else: return "F"

# #     def get_result_by_question(self, question_id: str, sub_question_id: Optional[str] = None) -> Optional[GradingResult]:
# #         target_id = f"{question_id}_{sub_question_id}" if sub_question_id else question_id
# #         return next((r for r in self.question_results if r.full_question_id == target_id), None)

# #     def has_errors(self) -> bool:
# #         return bool(self.errors)


# from dataclasses import dataclass
# from datetime import datetime
# from typing import Optional
# from enum import Enum

# @dataclass
# class GradingResult:
#     """
#     One row per *question* graded for a student.
#     """
#     student_index: str
#     module_code: str
#     exam_year: int
#     exam_month: str
#     full_question_id: str          # e.g. Q1_i_a
#     mark: int
#     max_marks: int
#     reason: str
#     graded_at: datetime = datetime.utcnow()


# from enum import Enum
# from dataclasses import dataclass
# from typing import Dict

# class GradingMethod(Enum):
#     RAG = "rag"
#     DIRECT = "direct"

# @dataclass
# class GradingResult:
#     student_index: str
#     module_code: str
#     exam_year: int
#     exam_month: str
#     question_id: str
#     score: int
#     reason: str
#     grading_method: GradingMethod

from enum import Enum
from dataclasses import dataclass


class GradingMethod(Enum):
    """How the mark was produced for this question."""
    RAG    = "rag"     # Retrieval-Augmented (with lecture context)
    DIRECT = "direct"  # Direct LLM grading (no extra context)


@dataclass
class GradingResult:
    """
    One record per student–question pair.

    NOTE: Attribute names must match the keyword arguments used in
    GradingResultDB.save_question_mark().
    """
    student_index:    str
    module_code:      str
    exam_year:        int
    exam_month:       str

    full_question_id: str   # e.g. Q1_i_a

    mark:             int   # score awarded
    max_marks:        int   # maximum available for that question

    reason:           str   # brief justification from the LLM
    grading_method:   GradingMethod
