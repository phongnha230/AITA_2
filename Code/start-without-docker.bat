@echo off
chcp 65001 > nul
echo ==============================================================================
echo [AITA] KHỞI ĐỘNG HỆ THỐNG KHÔNG DÙNG DOCKER (LOCAL NATIVE MODE)
echo ==============================================================================
echo [LƯU Ý] Chế độ này yêu cầu máy bạn đã bật sẵn:
echo   1. MySQL cục bộ (XAMPP / MySQL Server / Laragon) tại cổng 3306.
echo   2. Redis cục bộ (Memurai / Redis Windows / WSL2) tại cổng 6379.
echo   3. Đã tạo database: aita_db
echo ==============================================================================

:: 1. Chuẩn bị Backend
echo [1/3] Kiểm tra cấu hình Backend...
cd backend
if not exist .env (
    echo [THÔNG BÁO] Chưa có file .env, đang copy từ .env.example...
    copy .env.example .env > nul
    echo [HÃY KIỂM TRA] Vui lòng mở file backend/.env để kiểm tra mật khẩu MySQL của bạn!
)

if not exist node_modules (
    echo [CÀI ĐẶT] Đang cài đặt thư viện Backend...
    call npm install
)

echo [PRISMA] Đồng bộ cấu trúc bảng CSDL cục bộ...
call npx prisma generate
call npx prisma db push

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
start "AITA Backend - Local Native (Port 5000)" cmd /k "cd backend && npm run dev"
start "AITA Frontend - Local Native (Port 3000)" cmd /k "cd frontend && npm run dev"

echo ==============================================================================
echo [THÀNH CÔNG] Đã khởi chạy các tiến trình cục bộ!
echo  - Backend API: http://localhost:5000/api/v1/health
echo  - Frontend Web: http://localhost:3000
echo ==============================================================================
pause
