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

from dataclasses import dataclass
from typing import Tuple, Optional

@dataclass
class ModelAnswer:
    question_id: str
    sub_question_id: Optional[str]
    question_text: str
    answer_text: str
    guideline: Optional[str] = None
    page_number: int = 0
    coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)

    @property
    def full_question_id(self) -> str:
        return f"{self.question_id}_{self.sub_question_id}" if self.sub_question_id else self.question_id

    def is_empty(self) -> bool:
        return not self.answer_text.strip()
