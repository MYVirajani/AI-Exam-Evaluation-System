# src/scripts/grade_all.py

from services.grading_rag_service import GradingRAGService
from db.postgres import fetch_all_student_answers, fetch_model_answers, fetch_questions

def grade_all_answers(provider: str = "OpenAI"):
    service = GradingRAGService(provider)

    questions = fetch_questions()
    model_answers = fetch_model_answers()
    student_answers = fetch_all_student_answers()

    for student in student_answers:
        print(f"📘 Grading for Student: {student.index_number}")
        for q_key, student_ans in student.answers.items():
            question = questions.get(q_key)
            model_ans = model_answers.get(q_key)

            if question and model_ans:
                result = service.grade_answer(question, model_ans, student_ans)
                print(f"\n🔹 Q: {question.text}")
                print(f"✅ Score: {result['score']}/2")
                print(f"💬 Feedback: {result['feedback']}\n")

if __name__ == "__main__":
    grade_all_answers()
