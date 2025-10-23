@echo off
REM Simple Flask API startup script for AI Exam Evaluation

echo 🚀 Starting AI Exam Evaluation Flask API Server...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install/upgrade dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Please create one with your database credentials.
    echo Required variables:
    echo   POSTGRES_HOST=localhost
    echo   POSTGRES_PORT=5432
    echo   POSTGRES_DB=your_db_name
    echo   POSTGRES_USER=your_username
    echo   POSTGRES_PASSWORD=your_password
    echo   OPENAI_API_KEY=your_openai_key
    echo   GEMINI_API_KEY=your_gemini_key
    pause
    exit /b 1
)

REM Start Flask API server
echo 🌐 Starting Flask server on http://localhost:7000
echo Available endpoints:
echo   GET  /api/health
echo   POST /api/embed-lecture-materials
echo   POST /api/extract-and-save
echo   POST /api/embed-from-db
echo   POST /api/embed-model-answers
echo   POST /api/mark-papers
echo   POST /api/run-full-evaluation
echo.
echo Press Ctrl+C to stop the server
echo.

python flask_api.py