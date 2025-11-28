from dataclasses import dataclass
from typing import Optional, Tuple, List

@dataclass
class StudentAnswer:
    question_id: str
    sub_question_id: Optional[str] = None
    sub_sub_question_id: Optional[str] = None
    sub_sub_sub_question_id: Optional[str] = None
    answer_text: str = ""
    assessment_id: Optional[str] = None
    submission_id: Optional[str] = None
    coordinates: Tuple[float, float, float, float] = (0, 0, 0, 0)
    media_urls: Optional[List[str]] = None      
    media_summaries: Optional[List[str]] = None 

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
            "assessment_id": self.assessment_id,
            "submission_id": self.submission_id,
            "coordinates": self.coordinates,
            "media_urls": self.media_urls or [],
            "media_summaries": self.media_summaries or []
        }
