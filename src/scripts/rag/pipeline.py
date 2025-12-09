# src/scripts/rag/pipeline.py
import logging
from src.services.grading_services.rag_grader import RAGGrader
from src.services.validators.model_answer_embedding_validator import ModelAnswerEmbeddingValidator
from src.services.validators.student_answer_embedding_validator import StudentAnswerEmbeddingValidator
from src.scripts.model_answer.pipeline import ModelAnswerProcessor
from src.scripts.student_answer.pipeline import run_pipeline   # student answer pipeline runner


def start_grading_pipeline(request):

    model_id = request.model_id
    assessment_id = request.assessment_id
    model_paper_id = request.model_paper_id
    submission_ids = request.submission_ids

    # -------------------------------------------------------
    # STEP 1 - Ensure MODEL ANSWER EMBEDDINGS exist
    # -------------------------------------------------------
    model_validator = ModelAnswerEmbeddingValidator(model_id=model_id)

    if not model_validator.embeddings_exist(assessment_id, model_paper_id):
        logging.info("⚠️ No MODEL ANSWER embeddings → Running Model Answer Processor...")

        processor = ModelAnswerProcessor(model_id=model_id)
        processor.process_model_answer(
            model_answer_paper_id=model_paper_id,
            assessment_id=assessment_id,
            model_id=model_id,
            extract_media=True
        )

        logging.info("✅ Model answer embeddings created.")

    else:
        logging.info("✅ Model answer embeddings exist.")


    # -------------------------------------------------------
    # STEP 2 - Validate STUDENT ANSWER embeddings
    # -------------------------------------------------------
    student_validator = StudentAnswerEmbeddingValidator(model_id=model_id)

    submissions_needing_pipeline = []

    for sid in submission_ids:
        if not student_validator.has_embeddings(sid):
            logging.info(f"⚠️ No embeddings found for submission {sid} → Needs pipeline.")
            submissions_needing_pipeline.append(sid)
        else:
            logging.info(f"✅ Embeddings exist for submission {sid}.")

    # -------------------------------------------------------
    # STEP 3 - Run student pipeline only for missing submissions
    # -------------------------------------------------------
    if submissions_needing_pipeline:
        logging.info(f"🚀 Running student pipeline for {len(submissions_needing_pipeline)} submissions...")

        run_pipeline(
            submission_ids=submissions_needing_pipeline,
            assignment_id=None,
            model_id=model_id,
            preprocess=True,
            extract=True,
            summarize_media=True,
            embed=True
        )

        logging.info("✅ Student pipeline completed successfully.")

    else:
        logging.info("✅ All submissions already have embeddings → No pipeline needed.")


    # -------------------------------------------------------
    # STEP 4 — Start grading
    # -------------------------------------------------------
    logging.info("🎯 Starting RAG-Based grading now...")

    grader = RAGGrader(model_id=model_id)

    results = grader.grade_submissions_answers(
        submission_ids=submission_ids,
        model_paper_id=model_paper_id,
        assessment_id=assessment_id,
        lecturer_id=request.lecturer_id,
        module_id=request.module_id,
        top_k=request.top_k,
        question_numbers=request.question_numbers,
    )

    logging.info("🏁 Grading completed.")
    return results
