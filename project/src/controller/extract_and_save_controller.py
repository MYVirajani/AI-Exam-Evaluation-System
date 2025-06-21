# src/controller/extract_and_save_controller.py

from src.services.answer_extractor import AnswerExtractor
from src.services.database_services.student_answer_db import StudentAnswerService

def extract_and_save_answers(raw_text: str, provider: str, model: str, student_index: str, module_code: str, exam_year: int, exam_month: int):
    extractor = AnswerExtractor(selected_provider=provider, selected_model=model)
    answers = extractor.extract_answers_with_llm(raw_text, student_index=student_index)

    db = StudentAnswerService()
    db.initialize_table()
    db.save_answers(student_index, module_code, exam_year, exam_month, answers)

    return answers
