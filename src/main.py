from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import lecture_material, student_answer, model_answer, rag_grader

app = FastAPI(title="Exam Evaluation System with RAG")

# -----------------------------
# ADD CORS MIDDLEWARE
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(lecture_material.router)
app.include_router(student_answer.router)
app.include_router(model_answer.router)
app.include_router(rag_grader.router)

@app.get("/")
def home():
    return {"message": "RAG Exam Evaluation API Running"}
