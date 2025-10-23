from dataclasses import dataclass, field
from typing import Optional, List

@dataclass
class ModelAnswer:
    """
    Represents one extracted model answer item for a specific question or sub-question.
    Matches the structure of the 'model_answer' table in the database.
    """

    # Question hierarchy (e.g., Q1 → i → a)
    question_id: str
    sub_question_id: Optional[str] = None
    sub_sub_question_id: Optional[str] = None
    sub_sub_sub_question_id: Optional[str] = None

    # Question and answer details
    question_text: Optional[str] = None
    answer_text: str = ""
    guideline_text: Optional[str] = None
    max_marks: Optional[float] = None

    # Media (e.g., extracted diagrams or tables)
    media_urls: List[str] = field(default_factory=list)   # Stored in DB as TEXT[]
    media_summary: Optional[dict] = None                  # Stored in DB as JSON

    # Metadata
    module_code: Optional[str] = None
    exam_year: Optional[int] = None
    exam_month: Optional[str] = None

    @property
    def full_question_id(self) -> str:
        """Combine all parts of the question hierarchy (e.g., Q1_i_a)."""
        parts = [self.question_id]
        if self.sub_question_id:
            parts.append(self.sub_question_id)
        if self.sub_sub_question_id:
            parts.append(self.sub_sub_question_id)
        if self.sub_sub_sub_question_id:
            parts.append(self.sub_sub_sub_question_id)
        return "_".join(parts)

    def question_embedding_payload(self) -> str:
        """Return only the question text for vector embeddings."""
        return (self.question_text or "").strip()

    def answer_embedding_payload(self) -> str:
        """Return only the answer text (guideline/marks excluded) for embeddings."""
        return self.answer_text.strip()
