@echo off
echo ===================================================
echo Starting Agentic AI Recruitment Manager
echo ===================================================

echo 1. Starting Interview Agent Backend (Port 5000)...
start "Interview Agent Backend" cmd /k "cd beckend && python interview_agent.py"

echo 2. Starting Resume Ranker Backend (Port 5001)...
start "Resume Ranker Backend" cmd /k "cd beckend && python resume_ranker.py"

echo 3. Starting Frontend (Vite)...
npm run dev
