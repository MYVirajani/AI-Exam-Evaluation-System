# from dataclasses import dataclass
# from typing import Optional

# @dataclass
# class ModelAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     answer_text: str
#     guideline: Optional[str] = None

#     @property
#     def full_question_id(self) -> str:
#         return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id

#     def has_guideline(self) -> bool:
#         return self.guideline is not None and self.guideline.strip() != ""

# from dataclasses import dataclass
# from typing import Tuple, Optional

# @dataclass
# class ModelAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     question_text: str
#     answer_text: str
#     guideline: Optional[str] = None
#     page_number: int = 0
#     coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)

#     @property
#     def full_question_id(self) -> str:
#         return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id

#     def is_empty(self) -> bool:
#         return not self.answer_text.strip()

# from dataclasses import dataclass
# from typing import Optional

# @dataclass
# class ModelAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     sub_sub_question_id: Optional[str]
#     full_question_id: str
#     question_text: str
#     key_points: str
#     marks: float
#     instructions: Optional[str]

# from dataclasses import dataclass
# from typing import Optional, Tuple

# @dataclass
# class ModelAnswer:
#     # Question hierarchy
#     question_id: str
#     sub_question_id: Optional[str] = None
#     sub_sub_question_id: Optional[str] = None
#     sub_sub_sub_question_id: Optional[str] = None

#     # Marking content
#     answer_text: str = ""
#     guideline_text: Optional[str] = None      # marking rubric / key points
#     max_marks: Optional[int] = None           # e.g. 10

#     # Paper-level metadata
#     module_code: Optional[str] = None
#     exam_year: Optional[int] = None
#     exam_month: Optional[str] = None

#     @property
#     def full_question_id(self) -> str:
#         parts = [self.question_id]
#         if self.sub_question_id:
#             parts.append(self.sub_question_id)
#         if self.sub_sub_question_id:
#             parts.append(self.sub_sub_question_id)
#         if self.sub_sub_sub_question_id:
#             parts.append(self.sub_sub_sub_question_id)
#         return "_".join(parts)

#     def embedding_payload(self) -> str:
#         """
#         Everything that should influence semantic similarity → embed it.
#         """
#         joined = self.answer_text
#         if self.guideline_text:
#             joined += f"\nGUIDELINE: {self.guideline_text}"
#         return joined


from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelAnswer:
    # Hierarchy
    question_id: str
    sub_question_id: Optional[str] = None
    sub_sub_question_id: Optional[str] = None
    sub_sub_sub_question_id: Optional[str] = None

    # NEW → raw question prompt
    question_text: Optional[str] = None

    # Marking content
    answer_text: str = ""
    guideline_text: Optional[str] = None
    max_marks: Optional[int] = None

    # Paper metadata
    module_code: Optional[str] = None
    exam_year: Optional[int] = None
    exam_month: Optional[str] = None

    @property
    def full_question_id(self) -> str:
        parts = [self.question_id]
        if self.sub_question_id:
            parts.append(self.sub_question_id)
        if self.sub_sub_question_id:
            parts.append(self.sub_sub_question_id)
        if self.sub_sub_sub_question_id:
            parts.append(self.sub_sub_sub_question_id)
        return "_".join(parts)

    # def embedding_payload(self) -> str:
    #     """
    #     Concatenate everything that should influence semantic similarity.
    #     """
    #     bits = []
    #     if self.question_text:
    #         bits.append(f"QUESTION: {self.question_text}")
    #     bits.append(f"ANSWER: {self.answer_text}")
    #     if self.guideline_text:
    #         bits.append(f"GUIDELINE: {self.guideline_text}")
    #     if self.max_marks is not None:
    #         bits.append(f"MAX_MARKS: {self.max_marks}")
    #     return "\n".join(bits)
    def question_embedding_payload(self) -> str:
        """Vectorise only the question text."""
        return (self.question_text or "").strip()

    def answer_embedding_payload(self) -> str:
        """Vectorise only the answer text (guideline and marks are NOT embedded)."""
        return self.answer_text.strip()
