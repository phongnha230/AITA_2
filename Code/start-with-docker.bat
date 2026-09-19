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

:: 2. Khởi động MySQL & Redis
echo [1/4] Đang khởi động MySQL & Redis qua Docker Compose...
docker compose up -d

:: Đợi 3 giây để container sẵn sàng
timeout /t 3 /nobreak > nul

:: 3. Chuẩn bị Backend
echo [2/4] Kiểm tra Backend & CSDL Prisma...
cd backend
if not exist .env (
    echo [THÔNG BÁO] Chưa có file .env, đang copy từ .env.example...
    copy .env.example .env > nul
)

if not exist node_modules (
    echo [CÀI ĐẶT] Đang cài đặt thư viện Backend...
    call npm install
)

echo [PRISMA] Đồng bộ cấu trúc bảng CSDL...
call npx prisma generate
call npx prisma db push

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
start "AITA Backend (Port 5000)" cmd /k "cd backend && npm run dev"
start "AITA Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo ==============================================================================
echo [THÀNH CÔNG] Hệ thống đã được khởi động!
echo  - Backend API: http://localhost:5000/api/v1/health
echo  - Frontend Web: http://localhost:3000
echo ==============================================================================
pause
