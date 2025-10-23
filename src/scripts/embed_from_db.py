

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
import sys
from src.controller.embed_from_db_controller import embed_student_answers

def main(provider=None, model=None, module_code=None, year=None, month=None, 
         student_indexes=None, assessment_id=None):
    """
    Main function that can be called from Flask API or command line.
    
    Args:
        provider: LLM provider ("OpenAI" or "GoogleGemini")
        model: Embedding model name
        module_code: Module code (e.g., "EG4001") - from database mapping
        year: Exam year (e.g., 2020) - from database mapping
        month: Exam month (e.g., "January") - from database mapping
        student_indexes: List of student registration numbers to filter - from page selection
        assessment_id: Assessment ID for filtering - from page context
    
    Returns:
        dict: Result status and message
    """
    try:
        embed_student_answers(
            provider=provider,
            model=model,
            module_code=module_code,
            year=year,
            month=month,
            student_indexes=student_indexes,
            assessment_id=assessment_id
        )
        
        return {
            "status": "success",
            "message": f"Successfully embedded student answers for assessment {assessment_id} using {provider} {model}"
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to embed student answers: {str(e)}"
        }

def main_cli():
    """Command line interface for the script."""
    parser = argparse.ArgumentParser(description="Embed student answers from DB using selected provider.")
    parser.add_argument("--provider", choices=["OpenAI", "GoogleGemini", "DeepSeek"], required=True, help="LLM provider")
    parser.add_argument("--model", required=False, help="Embedding model name (ignored if DeepSeek is selected)")
    parser.add_argument("--module_code", required=True, help="Module code (e.g., EG4001)")
    parser.add_argument("--year", required=True, type=int, help="Exam year (e.g., 2020)")
    parser.add_argument("--month", required=True, help="Exam month (e.g., January)")
    parser.add_argument("--student-indexes", nargs='+', help="List of student indexes to process")
    parser.add_argument("--assessment-id", help="Assessment ID for filtering")
    
    args = parser.parse_args()
    
    # Call the main function with parsed arguments
    result = main(
        provider=args.provider,
        model=args.model,
        module_code=args.module_code,
        year=args.year,
        month=args.month,
        student_indexes=args.student_indexes,
        assessment_id=args.assessment_id
    )
    
    print(f"\nResult: {result}")
    
    if result["status"] == "error":
        sys.exit(1)

if __name__ == "__main__":
    main_cli()