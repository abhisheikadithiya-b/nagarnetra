Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   Starting NagarNetra Urban Telemetry Platform" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ScriptDir) { $ScriptDir = (Get-Location).Path }

# Start Backend
Start-Process powershell -WorkingDirectory $ScriptDir -ArgumentList "-NoExit", "-Command", "python -m backend.app.main"

Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -WorkingDirectory (Join-Path $ScriptDir "frontend") -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "`nNagarNetra Dashboard: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Dashcam PWA: http://localhost:3000/pwa" -ForegroundColor Yellow
Write-Host "Backend API: http://localhost:8000/docs" -ForegroundColor Yellow
