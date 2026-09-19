# HƯỚNG DẪN TRIỂN KHAI VÀ CHẠY DỰ ÁN AITA (DEPLOYMENT & EXECUTION GUIDE)
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – FPT University (Lớp SE19C - Fall 2026)  
**Nhóm:** GROUP 2  

Tài liệu này cung cấp hướng dẫn thực thi đầy đủ cho giảng viên chấm bài hoặc thành viên trong nhóm thiết lập môi trường chạy thực tế:

---

## 1. HAI PHƯƠNG THỨC KHỞI ĐỘNG DỰ ÁN

| Tiêu chí so sánh | Phương thức 1: Dùng Docker (Khuyên dùng) | Phương thức 2: KHÔNG dùng Docker (Local Native) |
| :--- | :--- | :--- |
| **Đối tượng phù hợp** | Máy có RAM $\ge$ 16GB, đã cài đặt Docker Desktop. | Máy RAM 8GB / Máy yếu / Không cài được Docker. |
| **CSDL MySQL & Redis** | Chạy cô lập trong container qua `docker-compose.yml`. | Dùng MySQL Server/XAMPP và Memurai/Redis cục bộ. |
| **Sandbox chấm code** | Container cô lập (`gcc:alpine` và `openjdk:17-alpine`). | Chạy trực tiếp bằng `gcc` và `javac` cài trên máy chủ. |
| **Ưu điểm** | Đồng nhất 100% môi trường, bảo mật tuyệt đối, 1-click là chạy. | Rất nhẹ máy, không tốn RAM chạy Docker Engine. |
| **File kích hoạt 1-click** | `Code/start-with-docker.bat` (hoặc `.ps1`) | `Code/start-without-docker.bat` (hoặc `.ps1`) |

---

## 2. HƯỚNG DẪN CHI TIẾT THEO TỪNG BƯỚC

### 2.1. Cách 1: Chạy có Docker (Khuyên dùng)

1. **Khởi động hạ tầng:**
   ```bash
   cd Code
   docker compose up -d
   ```
2. **Cấu hình Backend (`Code/backend/.env`):**
   ```ini
   PORT=5000
   DATABASE_URL="mysql://aita_user:aita_password@localhost:3306/aita_db"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   USE_DOCKER_SANDBOX=true
   ```
3. **Đồng bộ CSDL & Bật Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
4. **Bật Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   * Truy cập giao diện: `http://localhost:3000`
   * API Health Check: `http://localhost:5000/api/v1/health`

---

### 2.2. Cách 2: Chạy KHÔNG dùng Docker (Local Native)

1. **Chuẩn bị CSDL cục bộ:**
   * Mở MySQL Workbench / XAMPP, tạo database:
     ```sql
     CREATE DATABASE aita_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   * Bật dịch vụ Redis cục bộ (Memurai hoặc WSL2 Redis).
2. **Kiểm tra trình biên dịch trên máy:**
   * Kiểm tra C: `gcc --version` (Nếu chưa có $\to$ cài MinGW-w64).
   * Kiểm tra Java: `javac -version` (Cần JDK 17 hoặc 21).
3. **Cấu hình Backend (`Code/backend/.env`):**
   ```ini
   PORT=5000
   DATABASE_URL="mysql://root:mat_khau_cua_ban@127.0.0.1:3306/aita_db"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   USE_DOCKER_SANDBOX=false
   ```
4. **Đồng bộ CSDL & Chạy:**
   ```bash
   cd Code/backend
   npm install
   npx prisma db push
   npm run dev
   ```
5. **Chạy Frontend:**
   ```bash
   cd Code/frontend
   npm install
   npm run dev
   ```

---

## 3. CÁC TÀI LIỆU VÀ SCRIPT LIÊN QUAN TRONG DỰ ÁN
* File hướng dẫn kỹ thuật chi tiết: [`Code/RUN_GUIDE.md`](../../Code/RUN_GUIDE.md)
* File cấu hình mẫu biến môi trường: [`Code/backend/.env.example`](../../Code/backend/.env.example)
* Script 1-click Windows Docker: `Code/start-with-docker.bat`
* Script 1-click Windows Local: `Code/start-without-docker.bat`
