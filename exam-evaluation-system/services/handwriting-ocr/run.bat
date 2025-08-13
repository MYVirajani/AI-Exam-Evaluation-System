@REM #!/bin/bash

@REM # Navigate to the OCR service directory
@REM cd "$(dirname "$0")"

@REM # Check if virtual environment exists, if not create it
@REM if [ ! -d "venv" ]; then
@REM     echo "Creating virtual environment..."
@REM     python3 -m venv venv
@REM fi

@REM # Activate virtual environment
@REM source venv/bin/activate

@REM # Install dependencies
@REM echo "Installing dependencies..."
@REM pip install -r requirements.txt

@REM # Start the Flask service
@REM echo "Starting Handwriting OCR Service on port 5001..."
@REM python app.py


@echo off
cd /d "%~dp0"

REM Check if virtual environment exists, if not create it
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment. Make sure Python is installed.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

REM Start the Flask service
echo Starting Handwriting OCR Service on port 5001...
python app.py

pause