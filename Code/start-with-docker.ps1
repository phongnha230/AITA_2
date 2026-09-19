# ==============================================================================
# [AITA] Start With Docker (PowerShell)
# ==============================================================================
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "[AITA] KHOI DONG HE THONG VOI DOCKER (DOCKER MODE)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

# 1. Kiểm tra Docker
try {
    docker info | Out-Null
} catch {
    Write-Host "[LOI] Docker Desktop chua bat! Vui long bat Docker Desktop va thu lai." -ForegroundColor Red
    pause
    exit 1
}

# 2. Khởi động MySQL & Redis
Write-Host "[1/4] Dang bat MySQL & Redis qua Docker Compose..." -ForegroundColor Yellow
docker compose up -d

Start-Sleep -Seconds 3

# 3. Chuẩn bị Backend
Write-Host "[2/4] Kiem tra Backend & CSDL Prisma..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[THONG BAO] Da tao file .env tu .env.example" -ForegroundColor Green
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[CAI DAT] Dang cai dat thu vien Backend..." -ForegroundColor Yellow
    npm install
}

Write-Host "[PRISMA] Dong bo cau truc bang CSDL..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push

Set-Location ..

# 4. Chuẩn bị Frontend
Write-Host "[3/4] Kiem tra Frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "[CAI DAT] Dang cai dat thu vien Frontend..." -ForegroundColor Yellow
    npm install
}

Set-Location ..

# 5. Mở 2 cửa sổ chạy song song
Write-Host "[4/4] Dang khoi dong Backend & Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "[THANH CONG] He thong da khoi dong!" -ForegroundColor Green
Write-Host "  - Backend API:  http://localhost:5000/api/v1/health" -ForegroundColor Yellow
Write-Host "  - Frontend Web: http://localhost:3000" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
