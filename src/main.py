from fastapi import FastAPI
from src.routers import lecture_material
app = FastAPI(title="Exam Evaluation System with RAG")
app.include_router(lecture_material.router)

@app.get("/")
def home():
    return {"message": "RAG Exam Evaluation API Running"}
