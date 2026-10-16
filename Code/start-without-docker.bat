@echo off
chcp 65001 > nul
echo ==============================================================================
echo [AITA] KHỞI ĐỘNG HỆ THỐNG KHÔNG DÙNG DOCKER (LOCAL NATIVE MODE)
echo ==============================================================================
echo [LƯU Ý] Chế độ này yêu cầu máy bạn đã bật sẵn:
echo   1. Kết nối Internet để truy cập TiDB Cloud.
echo   2. Redis cục bộ (Memurai / Redis Windows / WSL2) tại cổng đã cấu hình.
echo   3. GCC và JDK nếu cần chạy Docker Sandbox ở chế độ local.
echo ==============================================================================

:: 1. Chuẩn bị Backend
echo [1/3] Kiểm tra cấu hình Backend...
cd backend
if not exist .env (
    echo [THÔNG BÁO] Chưa có file .env, đang copy từ .env.example...
    copy .env.example .env > nul
    echo [HÃY KIỂM TRA] Vui lòng mở file backend/.env để cấu hình DATABASE_URL của TiDB Cloud!
)

if not exist node_modules (
    echo [CÀI ĐẶT] Đang cài đặt thư viện Backend...
    call npm install
)

echo [PRISMA] Tạo Prisma Client ^(không thay đổi schema TiDB Cloud^)...
call npx prisma generate

cd ..

:: 2. Chuẩn bị Frontend
echo [2/3] Kiểm tra Frontend...
cd frontend
if not exist node_modules (
    echo [CÀI ĐẶT] Đang cài đặt thư viện Frontend...
    call npm install
)
cd ..

:: 3. Khởi chạy 2 tiến trình
echo [3/3] Đang khởi động Backend & Frontend...
start "AITA Backend - Local Native (Port 5003)" cmd /k "cd backend && npm run dev"
start "AITA Frontend - Local Native (Port 3000)" cmd /k "cd frontend && npm run dev"

echo ==============================================================================
echo [THÀNH CÔNG] Đã khởi chạy các tiến trình cục bộ!
echo  - Backend API: http://localhost:5003/api/v1/health
echo  - Frontend Web: http://localhost:3000
echo ==============================================================================
pause
