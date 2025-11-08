

# import argparse
# from src.controller.embed_from_db_controller import embed_student_answers

# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
#     parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini"], required=True, help="LLM provider")
#     parser.add_argument("--model", required=True, help="Embedding model name")
#     parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
#     parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
#     parser.add_argument("--month", required=True, help="Exam month (e.g., January)")

#     args = parser.parse_args()

#     embed_student_answers(
#         provider=args.provider,
#         model=args.model,
#         module_code=args.module_code,
#         year=args.year,
#         month=args.month
#     )

import argparse
from src.controller.embed_from_db_controller import embed_student_answers

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
    parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini", "DeepSeek", "LocalFinetunedDeepSeek"], required=True, help="LLM provider")
    parser.add_argument("--model", required=False, help="Embedding model name (ignored if DeepSeek is selected)")
    parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
    parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
    parser.add_argument("--month", required=True, help="Exam month (e.g., January)")

    args = parser.parse_args()

    embed_student_answers(
        provider=args.provider,
        model=args.model,
        module_code=args.module_code,
        year=args.year,
        month=args.month
    )
