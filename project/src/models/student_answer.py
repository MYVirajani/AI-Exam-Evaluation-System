# from dataclasses import dataclass
# from typing import Tuple, Optional

# @dataclass
# class StudentAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     answer_text: str
#     page_number: int = 0
#     coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)

#     @property
#     def full_question_id(self) -> str:
#         return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id

#     def is_empty(self) -> bool:
#         return not self.answer_text.strip()


# from dataclasses import dataclass
# from typing import Tuple, Optional

# @dataclass
# class StudentAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     answer_text: str
#     page_number: int = 0
#     coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)
#     student_index: Optional[str] = None  # ✅ NEW FIELD

#     @property
#     def full_question_id(self) -> str:
#         return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id

#     def is_empty(self) -> bool:
#         return not self.answer_text.strip()


# from dataclasses import dataclass
# from typing import Optional, Tuple

# @dataclass
# class StudentAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     answer_text: str
#     # page_number: int = 0
#     coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)
#     student_index: Optional[str] = None
#     module_code: Optional[str] = None
#     exam_year: Optional[int] = None
#     exam_month: Optional[int] = None

#     @property
#     def full_question_id(self) -> str:
#         return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id


# from dataclasses import dataclass
# from typing import Optional, Tuple

# @dataclass
# class StudentAnswer:
#     question_id: str
#     sub_question_id: Optional[str]
#     sub_sub_question_id: Optional[str]
#     answer_text: str

#     student_index: Optional[str] = None
#     module_code: Optional[str] = None
#     exam_year: Optional[int] = None
#     exam_month: Optional[int] = None
#     coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)

#     @property
#     def full_question_id(self) -> str:
#         parts = [self.question_id]
#         if self.sub_question_id:
#             parts.append(self.sub_question_id)
#         if self.sub_sub_question_id:
#             parts.append(self.sub_sub_question_id)
#         return "_".join(parts)


from dataclasses import dataclass
from typing import Optional, Tuple

@dataclass
class StudentAnswer:
    question_id: str
    sub_question_id: Optional[str] = None
    sub_sub_question_id: Optional[str] = None
    sub_sub_sub_question_id: Optional[str] = None
    answer_text: str = ""

    student_index: Optional[str] = None
    module_code: Optional[str] = None
    exam_year: Optional[int] = None
    exam_month: Optional[str] = None
    coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)

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

    def to_dict(self):
        return {
            "question": self.question_id,
            "sub_question": self.sub_question_id,
            "sub_sub_question": self.sub_sub_question_id,
            "sub_sub_sub_question": self.sub_sub_sub_question_id,
            "answer": self.answer_text,
            "student_index": self.student_index,
            "module_code": self.module_code,
            "exam_year": self.exam_year,
            "exam_month": self.exam_month,
            "coordinates": self.coordinates
    }
