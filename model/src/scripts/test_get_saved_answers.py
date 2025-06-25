from src.services.database_services.student_answer_db import StudentAnswerService
from pprint import pprint

if __name__ == "__main__":
    service = StudentAnswerService()
    result = service.get_answers(
        student_index="EG/2020/4247",
        module_code="EE6250",
        year=2025,
        month="June"
    )
    pprint(result)
