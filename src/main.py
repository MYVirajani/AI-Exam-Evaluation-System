from fastapi import FastAPI
from src.routers import lecture_material, student_answer, model_answer   

app = FastAPI(title="Exam Evaluation System with RAG")

# Include routers
app.include_router(lecture_material.router)
app.include_router(student_answer.router) 
app.include_router(model_answer.router)

@app.get("/")
def home():
    return {"message": "RAG Exam Evaluation API Running"}
