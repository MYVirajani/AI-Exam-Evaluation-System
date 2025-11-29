from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class ModelAnswer:
    """
    Represents one extracted model answer item for the `Question` table.
    """

    # Question hierarchy (Q → sub → sub-sub → sub-sub-sub)
    question_id: str
    sub_question_id: Optional[str] = None
    sub_sub_question_id: Optional[str] = None
    sub_sub_sub_question_id: Optional[str] = None

    # Question and answer content
    question_text: Optional[str] = None
    answer_text: Optional[str] = None
    guideline_text: Optional[str] = None
    max_marks: Optional[int] = None

    # Question type (MCQ, ESSAY, TABLE, GRAPH, etc.)
    question_type: Optional[str] = None
    mcq_options: Optional[List[str]] = None    # for MCQ type questions

    # Media extracted from question
    media_urls: List[str] = field(default_factory=list)     # stored in Question_Media.media_url
    media_summary: Optional[dict] = None                    # JSON for media summary (if any)

    @property
    def question_number(self) -> str:
        """
        Generate the question_number string stored in DB.

        Examples:
        Q1
        Q1_a
        Q1_a_i
        Q1_a_i_1
        """
        parts = [self.question_id]

        if self.sub_question_id:
            parts.append(self.sub_question_id)
        if self.sub_sub_question_id:
            parts.append(self.sub_sub_question_id)
        if self.sub_sub_sub_question_id:
            parts.append(self.sub_sub_sub_question_id)

        return "_".join(parts)

    @property
    def is_empty_answer(self) -> bool:
        """Return True if the answer is empty (useful for grading)."""
        return not self.answer_text or not self.answer_text.strip()

    def question_embedding_payload(self) -> str:
        """Text used for question embeddings."""
        return (self.question_text or "").strip()

    def answer_embedding_payload(self) -> str:
        """Text used for answer embeddings."""
        return (self.answer_text or "").strip()


@dataclass
class ModelAnswerMedia:
    """
    Represents one media item linked to a Question (Question_Media).
    Matches postgres + Prisma model.
    """

    media_url: str
    media_summary: Optional[str] = None     # maps → Question_Media.media_summary
    model_id: Optional[str] = None          # FK → Evaluation_Model.id
    question_id: Optional[str] = None       # FK → Question.id
    media_type: Optional[str] = None        # custom field (not stored, but useful)
