# import logging
# from src.services.pdf_processor import PDFProcessor
# from src.prompts.grading_prompts import GradingPrompts
# from src.services.answer_extractor import AnswerExtractor
# from src.services.grading_service import GradingService
# from src.models.question import Question, SubQuestion
# from src.models.student_answer import StudentAnswer

# def main():
#     logging.basicConfig(level=logging.INFO)
#     pdf_path = "./data/sample_paper.pdf"

#     # Initialize services
#     processor = PDFProcessor()
#     extractor = AnswerExtractor()
#     grader = GradingService()

#     # Extract text and structure from PDF
#     page_texts = processor.extract_text_from_pdf(pdf_path)
#     structure = processor.detect_paper_structure(page_texts)

#     # Extract answers
#     student_answers = extractor.extract_answers(page_texts, structure)

#     # Example: Static question loading
#     questions = [
#         Question(
#             id="Q1",
#             text="Define photosynthesis",
#             total_marks=5,
#             model_answer="Photosynthesis is the process by which green plants...",
#             sub_questions=[]
#         )
#     ]

#     # Grade answers
#     results = grader.batch_grade_answers(questions, student_answers)

#     # Print result summary
#     for res in results:
#         print(f"{res.full_question_id}: {res.score}/{res.max_marks} ({res.percentage:.1f}%)\nFeedback: {res.feedback}\n")

# if __name__ == "__main__":
#     main()


import argparse
import logging
from src.services.pdf_processor import PDFProcessor
from src.prompts.grading_prompts import GradingPrompts
from src.services.answer_extractor import AnswerExtractor
from src.services.grading_service import GradingService
from src.models.question import Question, SubQuestion
from src.models.student_answer import StudentAnswer

def main():
    # Setup CLI argument parser
    parser = argparse.ArgumentParser(description="Run exam evaluation pipeline with selected LLM provider and model.")
    parser.add_argument('--provider', type=str, required=True, help="LLM provider: OpenAI or GoogleGemini")
    parser.add_argument('--model', type=str, required=True, help="Model name: gpt-4o, gemini-1.5-flash, etc.")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    pdf_path = "./data/sample_paper.pdf"

    # Initialize services
    processor = PDFProcessor()
    extractor = AnswerExtractor(
        selected_provider=args.provider,
        selected_model=args.model
    )
    grader = GradingService(
        selected_provider=args.provider,
        selected_model=args.model
    )

    # Extract text and structure from PDF
    page_texts = processor.extract_text_from_pdf(pdf_path)
    structure = processor.detect_paper_structure(page_texts)

    # Extract student answers
    student_answers = extractor.extract_answers(page_texts, structure, use_llm=True)

    # Example: Static question loading
    questions = [
        Question(
            id="Q1",
            text="Define photosynthesis",
            total_marks=5,
            model_answer="Photosynthesis is the process by which green plants...",
            sub_questions=[]
        )
    ]

    # Grade answers
    results = grader.batch_grade_answers(questions, student_answers)

    # Print result summary
    for res in results:
        print(f"{res.full_question_id}: {res.score}/{res.max_marks} ({res.percentage:.1f}%)\nFeedback: {res.feedback}\n")

if __name__ == "__main__":
    main()
