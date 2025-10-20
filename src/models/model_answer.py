


from dataclasses import dataclass
from typing import Optional

@dataclass
class ModelAnswer:
  
    question_id: str
    sub_question_id: Optional[str] = None
    sub_sub_question_id: Optional[str] = None
    sub_sub_sub_question_id: Optional[str] = None

    question_text: Optional[str] = None

    answer_text: str = ""
    guideline_text: Optional[str] = None
    max_marks: Optional[float] = None


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

    def question_embedding_payload(self) -> str:
        """Vectorise only the question text."""
        return (self.question_text or "").strip()

    def answer_embedding_payload(self) -> str:
        """Vectorise only the answer text (guideline and marks are NOT embedded)."""
        return self.answer_text.strip()
