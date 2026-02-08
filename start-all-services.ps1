# Start all services in DEV mode
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "Starting ALL services in DEV" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Frontend
if (Test-Path "front\package.json") {
    Write-Host "Starting FRONTEND..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd front; npm run dev"
}

# Gateway API
if (Test-Path "back\gateway-api\package.json") {
    Write-Host "Starting GATEWAY API..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd back\gateway-api; npm run dev"
}

# Microservices
$microservices = Get-ChildItem -Path "back\microservices" -Directory
foreach ($service in $microservices) {
    if (Test-Path "$($service.FullName)\package.json") {
        Write-Host "Starting $($service.Name)..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $($service.FullName); npm run dev"
    }
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "All services started! 🚀" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running services:" -ForegroundColor White
Write-Host "- Frontend (port 5173/5174)" -ForegroundColor Gray
Write-Host "- Gateway API (port 5001)" -ForegroundColor Gray
Write-Host "- Auth Microservice (port 5000)" -ForegroundColor Gray
Write-Host "- Plants Microservice (port 5003)" -ForegroundColor Gray
Write-Host "- Processing Microservice (port 5004)" -ForegroundColor Gray
Write-Host "- Warehouse Microservice (port 5005)" -ForegroundColor Gray
Write-Host "- Logging Microservice (port 5002)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
