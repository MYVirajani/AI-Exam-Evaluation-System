import argparse
from src.controller.embed_from_db_controller import embed_student_answers

def standardize_index(student: str) -> str:
    """Convert EG/2020/4034 → EG20204034 for internal matching"""
    return student.replace("/", "").replace("-", "").replace("_", "").upper()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
    parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini", "DeepSeek", "LocalFinetunedDeepSeek"], required=True, help="LLM provider")
    parser.add_argument("--model", required=False, help="Embedding model name (ignored if DeepSeek is selected)")
    parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
    parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
    parser.add_argument("--month", required=True, help="Exam month (e.g., January)")
    parser.add_argument("--student", help="One or multiple student indexes separated by commas (ex: EG/2020/4034,EG/2020/4055)")

    args = parser.parse_args()

    # Prepare student list if given
    students = None
    if args.student:
        students_raw = [s.strip() for s in args.student.split(",")]
        students = [standardize_index(s) for s in students_raw]
        print(f"🎯 Embedding only for students: {students_raw}")

    embed_student_answers(
        provider=args.provider,
        model=args.model,
        module_code=args.module_code,
        year=args.year,
        month=args.month,
        student_list=students  # Pass the list of students to your function
    )
