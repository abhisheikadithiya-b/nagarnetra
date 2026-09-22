cd /d "%~dp0"
echo =======================================================
echo   Starting NagarNetra Urban Telemetry Platform (Offline)
echo =======================================================
echo.

echo 1. Starting FastAPI Backend Server on port 8000...
start "NagarNetra Backend" /d "%~dp0" cmd /k "python -m backend.app.main"

timeout /t 2 /nobreak >nul

echo 2. Starting Next.js Web Dashboard on port 3000...
start "NagarNetra Web Dashboard" /d "%~dp0frontend" cmd /k "npm run dev"

echo.
echo =======================================================
echo   NagarNetra is launching!
echo   Command Center: http://localhost:3000
echo   Dashcam Mobile PWA: http://localhost:3000/pwa
echo   FastAPI Swagger API: http://localhost:8000/docs
echo =======================================================
pause
