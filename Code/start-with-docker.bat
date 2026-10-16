@echo off
chcp 65001 > nul
echo ==============================================================================
echo [AITA] KHỞI ĐỘNG HỆ THỐNG VỚI DOCKER (DOCKER MODE)
echo ==============================================================================

:: 1. Kiểm tra Docker
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo [LỖI] Docker Desktop chưa được bật! Vui lòng bật Docker Desktop và thử lại.
    pause
    exit /b 1
)

:: 2. Khởi động hạ tầng local (database dùng TiDB Cloud)
echo [1/4] Kiểm tra cấu hình và khởi động Redis ^& ChromaDB qua Docker Compose...
if not exist backend\.env (
    echo [THÔNG BÁO] Chưa có file backend\.env, đang copy từ .env.example...
    copy backend\.env.example backend\.env > nul
)
docker compose -f backend/docker-compose.yml --env-file backend/.env up -d
docker compose -f backend/docker-compose.yml --env-file backend/.env --profile sandbox-build build playwright-sandbox-image playwright-control-image
if %errorlevel% neq 0 (
    echo [LOI] Khong the build image Chromium sandbox. Khong the cham bai React/Web an toan.
    pause
    exit /b 1
)

:: Đợi 3 giây để container sẵn sàng
timeout /t 3 /nobreak > nul

:: 3. Chuẩn bị Backend
echo [2/4] Kiểm tra Backend ^& Prisma Client...
cd backend

if not exist node_modules (
    echo [CÀI ĐẶT] Đang cài đặt thư viện Backend...
    call npm install
)

echo [PRISMA] Tạo Prisma Client ^(không thay đổi schema TiDB Cloud^)...
call npx prisma generate

cd ..

:: 4. Chuẩn bị Frontend
echo [3/4] Kiểm tra Frontend...
cd frontend
if not exist node_modules (
    echo [CÀI ĐẶT] Đang cài đặt thư viện Frontend...
    call npm install
)
cd ..

:: 5. Chạy Backend và Frontend trong 2 cửa sổ riêng biệt
echo [4/4] Đang khởi động server...
start "AITA Backend (Port 5003)" cmd /k "cd backend && npm run dev"
start "AITA Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo ==============================================================================
echo [THÀNH CÔNG] Hệ thống đã được khởi động!
echo  - Backend API: http://localhost:5003/api/v1/health
echo  - Frontend Web: http://localhost:3000
echo ==============================================================================
pause
