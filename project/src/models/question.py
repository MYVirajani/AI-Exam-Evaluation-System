from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class SubQuestion:
    id: str
    text: str
    marks: int
    model_answer: str

@dataclass
class Question:
    id: str
    text: str
    total_marks: int
    model_answer: str
    sub_questions: List[SubQuestion] = field(default_factory=list)

    def get_sub_question(self, sub_id: str) -> Optional[SubQuestion]:
        for sub_q in self.sub_questions:
            if sub_q.id == sub_id:
                return sub_q
        return None

    def has_sub_questions(self) -> bool:
        return len(self.sub_questions) > 0