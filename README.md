# AI-Exam-Evaluation-System

# run backend
python -m uvicorn src.main:app --reload
# API testing commands

curl -X POST "http://localhost:8000/student-answer/process-extract-embed" -H "Content-Type: application/json" -d "{\"submission_ids\": [\"c8e553ae-6d44-4900-8dbb-d32b1392a72a\"], \"model_id\": \"eaa81306-f9e3-4c96-901d-3b7a80a3f4ac\"}"

curl -X POST http://localhost:8000/model-answer/process-extract-embed -H "Content-Type: application/json" -d "{ \"model_answer_paper_id\": \"e26f77d1-fe6d-4f62-8295-ad8ffba4227c\", \"assessment_id\": \"5b8a8592-487b-41f5-8af8-4f9c7853cd93\", \"model_id\": \"eaa81306-f9e3-4c96-901d-3b7a80a3f4ac\", \"extract_media\": true }"

curl -X POST http://localhost:8000/educator/lecture-material-embedding -H "Content-Type: application/json" -d "{ lesson_id\": \"14c345ec-6445-48da-a318-8643c6dad2ba\", \"model_id\": \"eaa81306-f9e3-4c96-901d-3b7a80a3f4ac\"}"


