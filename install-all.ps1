Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Installing NPM Dependencies" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Frontend
Write-Host "[1/7] Installing Frontend dependencies..." -ForegroundColor Yellow
Set-Location ".\front"
npm install
Set-Location ".."
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Gateway API
Write-Host "[2/7] Installing Gateway API dependencies..." -ForegroundColor Yellow
Set-Location ".\back\gateway-api"
npm install
Set-Location "..\..\"
Write-Host "✓ Gateway API dependencies installed" -ForegroundColor Green
Write-Host ""

# Auth Microservice
Write-Host "[3/7] Installing Auth Microservice dependencies..." -ForegroundColor Yellow
Set-Location ".\back\microservices\auth-microservice"
npm install
Set-Location "..\..\..\"
Write-Host "✓ Auth Microservice dependencies installed" -ForegroundColor Green
Write-Host ""

# Logging Microservice
Write-Host "[4/7] Installing Logging Microservice dependencies..." -ForegroundColor Yellow
Set-Location ".\back\microservices\logging-microservice"
npm install
Set-Location "..\..\..\"
Write-Host "✓ Logging Microservice dependencies installed" -ForegroundColor Green
Write-Host ""

# Plants Microservice
Write-Host "[5/7] Installing Plants Microservice dependencies..." -ForegroundColor Yellow
Set-Location ".\back\microservices\plants-microservice"
npm install
Set-Location "..\..\..\"
Write-Host "✓ Plants Microservice dependencies installed" -ForegroundColor Green
Write-Host ""

# Processing Microservice
Write-Host "[6/7] Installing Processing Microservice dependencies..." -ForegroundColor Yellow
Set-Location ".\back\microservices\processing-microservice"
npm install
Set-Location "..\..\..\"
Write-Host "✓ Processing Microservice dependencies installed" -ForegroundColor Green
Write-Host ""

# Warehouse Microservice
Write-Host "[7/7] Installing Warehouse Microservice dependencies..." -ForegroundColor Yellow
Set-Location ".\back\microservices\warehouse-microservice"
npm install
Set-Location "..\..\..\"
Write-Host "✓ Warehouse Microservice dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ All dependencies installed successfully!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
