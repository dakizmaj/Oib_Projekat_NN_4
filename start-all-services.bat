@echo off
echo ==============================
echo Starting ALL services in DEV
echo ==============================

REM ---- FRONTEND ----
if exist "front\package.json" (
    echo Starting FRONTEND
    start "FRONTEND" cmd /k "cd /d front && npm run dev"
)

REM ---- GATEWAY API ----
if exist "back\gateway-api\package.json" (
    echo Starting GATEWAY API
    start "GATEWAY API" cmd /k "cd /d back\gateway-api && npm run dev"
)

REM ---- MICROSERVICES ----
for /d %%D in (back\microservices\*) do (
    if exist "%%D\package.json" (
        echo Starting %%~nxD
        start "%%~nxD" cmd /k "cd /d %%D && npm run dev"
    )
)

echo.
echo ==============================
echo All services started! 🚀
echo ==============================
echo.
echo Running services:
echo - Frontend (port 5173/5174)
echo - Gateway API (port 5001)
echo - Auth Microservice (port 5000)
echo - Plants Microservice (port 5003)
echo - Processing Microservice (port 5004)
echo - Warehouse Microservice (port 5005)
echo - Logging Microservice (port 5002)
echo.
echo You can close this window.
pause
