@echo off
echo Starting Recruitment Platform...
echo.

echo Starting Backend Server (http://localhost:3000)...
start cmd /k "cd server && node app.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (http://localhost:5173)...
start cmd /k "cd client && node node_modules/vite/bin/vite.js --host 0.0.0.0"

echo.
echo Both servers are starting up...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
pause
