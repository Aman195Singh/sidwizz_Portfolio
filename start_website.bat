@echo off
title SIDD WHIZZ Portfolio Dev Server
cd /d "%~dp0"
set PATH=C:\Node_file\nodejs;%PATH%
echo ===================================================
echo Starting SIDD WHIZZ Portfolio (TanStack Start + Vite)
echo Local URL: http://localhost:8080/
echo ===================================================
timeout /t 3 >nul
start "" http://localhost:8080/
call npm run dev
pause

