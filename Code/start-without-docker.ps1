# ==============================================================================
# [AITA] Start Without Docker (PowerShell)
# ==============================================================================
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "[AITA] KHOI DONG HE THONG KHONG DUNG DOCKER (LOCAL NATIVE MODE)" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "[LUU Y] Vui long dam bao da bat MySQL (port 3306) va Redis (port 6379) cuc bo!" -ForegroundColor Yellow

# 1. Chuẩn bị Backend
Write-Host "[1/3] Kiem tra cau hinh Backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[THONG BAO] Da tao file .env tu .env.example" -ForegroundColor Green
    Write-Host "[HAY KIEM TRA] Vui long kiem tra lai chuoi DATABASE_URL trong backend/.env!" -ForegroundColor Magenta
}

if (-not (Test-Path "node_modules")) {
    Write-Host "[CAI DAT] Dang cai dat thu vien Backend..." -ForegroundColor Yellow
    npm install
}

Write-Host "[PRISMA] Dong bo cau truc bang CSDL cuc bo..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push

Set-Location ..

# 2. Chuẩn bị Frontend
Write-Host "[2/3] Kiem tra Frontend..." -ForegroundColor Yellow
Set-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "[CAI DAT] Dang cai dat thu vien Frontend..." -ForegroundColor Yellow
    npm install
}

Set-Location ..

# 3. Mở 2 cửa sổ chạy song song
Write-Host "[3/3] Dang khoi dong Backend & Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "[THANH CONG] Da bat cac tien trinh cuc bo!" -ForegroundColor Green
Write-Host "  - Backend API:  http://localhost:5000/api/v1/health" -ForegroundColor Yellow
Write-Host "  - Frontend Web: http://localhost:3000" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
