@echo off
chcp 65001 > nul
echo [AITA] Đang kiểm tra kết nối CSDL và Redis...
cd backend
call npm run test:db
pause
