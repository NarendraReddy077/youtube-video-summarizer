@echo off
echo Starting YouTube Summarizer End-to-End Environment...

:: Start the Python FastAPI Backend
echo [1/2] Starting Backend Server...
start "Backend API Server" cmd /c "cd backend && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

:: Start the React Frontend
echo [2/2] Starting Frontend App...
start "Frontend UI Server" cmd /c "cd frontend && npm install && npm run dev"

echo.
echo Both servers are spinning up.
echo - Backend available at: http://localhost:8000/docs
echo - Frontend available at: http://localhost:5173 
echo.
pause