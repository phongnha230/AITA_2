# HƯỚNG DẪN CHẠY DỰ ÁN AITA (CHO NHÓM PHÁT TRIỂN)
**Hệ thống:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – FPT University  

Tài liệu này hướng dẫn chi tiết cách chạy dự án AITA cho 2 trường hợp:
* **TRƯỜNG HỢP 1: Có dùng Docker** *(Khuyên dùng - Chuẩn kiến trúc, cô lập an toàn).*
* **TRƯỜNG HỢP 2: KHÔNG dùng Docker** *(Dành cho thành viên máy RAM 8GB / Máy yếu / Không cài được Docker Desktop).*

---

## 🛠️ YÊU CẦU TIÊN QUYẾT CHUNG (BẮT BUỘC CHO CẢ 2 TRƯỜNG HỢP)

1. **Node.js:** Phiên bản **v18.x** trở lên (Khuyên dùng v20.x hoặc v22.x). Kiểm tra: `node -v`.
2. **Git:** Đã clone mã nguồn dự án về máy.
3. **Mã nguồn:** Thư mục gốc dự án gồm 2 phân hệ chính:
   * `Code/backend`: Express.js + TypeScript + Prisma ORM.
   * `Code/frontend`: Next.js 14 App Router + Tailwind CSS.

---

## 🐳 TRƯỜNG HỢP 1: CHẠY DỰ ÁN CÓ DÙNG DOCKER (KHUYÊN DÙNG)

Phù hợp cho máy có cài đặt **Docker Desktop** (đang bật).

### Bước 1: Khởi động CSDL MySQL & Redis qua Docker
Mở Terminal tại thư mục `Code/` và chạy:
```bash
cd Code
docker compose up -d
```
* Kiểm tra container đang chạy: `docker ps`
  * Container `aita-mysql` chạy tại cổng `3306`.
  * Container `aita-redis` chạy tại cổng `6379`.

### Bước 2: Cấu hình và Chạy Backend
1. Chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Tạo file `.env` từ mẫu:
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # Linux/macOS:
   cp .env.example .env
   ```
3. Đảm bảo cấu hình trong `backend/.env` khớp với Docker:
   ```ini
   PORT=5000
   DATABASE_URL="mysql://aita_user:aita_password@localhost:3306/aita_db"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   USE_DOCKER_SANDBOX=true
   ```
4. Cài đặt thư viện & Đồng bộ cấu trúc bảng CSDL:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```
5. Khởi động Backend server (chế độ Hot-reload):
   ```bash
   npm run dev
   ```
   * Backend sẽ chạy tại: `http://localhost:5000`
   * Kiểm tra sức khỏe hệ thống: `http://localhost:5000/api/v1/health`

### Bước 3: Khởi động Frontend (Next.js)
Mở một cửa sổ Terminal mới:
```bash
cd Code/frontend
npm install
npm run dev
```
* Giao diện Web chạy tại: `http://localhost:3000`

---

## 💻 TRƯỜNG HỢP 2: CHẠY DỰ ÁN KHÔNG DÙNG DOCKER (LOCAL NATIVE)

Dành cho các bạn máy yếu, không bật được Docker Desktop hoặc RAM 8GB.

### Bước 1: Chuẩn bị MySQL & Redis trên máy cục bộ
1. **MySQL cục bộ:**
   * Dùng **XAMPP**, **MySQL Server** hoặc **Laragon** có sẵn trên máy.
   * Mở MySQL Workbench hoặc phpMyAdmin (hoặc lệnh SQL):
     ```sql
     CREATE DATABASE aita_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
2. **Redis cục bộ (Windows):**
   * *Cách A (Khuyên dùng):* Tải và cài đặt **Memurai** (Redis for Windows): https://www.memurai.com
   * *Cách B (Dùng Redis Cloud miễn phí không cần cài):* Đăng ký tài khoản Upstash Redis (miễn phí), lấy chuỗi kết nối và điền vào `.env`.
   * *Cách C (WSL2):* Mở Ubuntu trên WSL2 và gõ: `sudo service redis-server start`.

### Bước 2: Chuẩn bị Trình biên dịch C và Java (Để chấm bài)
Vì không có Docker cô lập, máy tính bạn cần có sẵn compiler để chấm bài PE:
* **Môn PRF192 (C):** Cần trình biên dịch `gcc`.
  * Kiểm tra: `gcc --version`. Nếu chưa có, tải **MinGW-w64** hoặc **w64devkit**.
* **Môn PRO192 & CSD201 (Java):** Cần JDK 17 hoặc 21.
  * Kiểm tra: `javac -version` và `java -version`.

### Bước 3: Cấu hình file `backend/.env` cho máy cục bộ
Mở file `Code/backend/.env` và sửa lại:
```ini
PORT=5000

# Trỏ về tài khoản MySQL trên máy bạn (thay root và mật khẩu của bạn):
DATABASE_URL="mysql://root:mat_khau_cua_ban@127.0.0.1:3306/aita_db"

# Redis cục bộ:
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# TẮT DOCKER SANDBOX (Hệ thống sẽ dùng trực tiếp gcc/javac trên máy):
USE_DOCKER_SANDBOX=false
```

### Bước 4: Đồng bộ CSDL & Chạy Backend
```bash
cd Code/backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Bước 5: Chạy Frontend
```bash
cd Code/frontend
npm install
npm run dev
```

---

## ⚡ FILE CHẠY NHANH 1-CLICK (CHO WINDOWS)

Để tiện lợi cho ae, thư mục `Code/` đã chuẩn bị sẵn các file script tự động:
* **`start-with-docker.bat`**: Tự động bật Docker container, migrate DB và khởi chạy Backend + Frontend trong 2 cửa sổ riêng biệt.
* **`start-without-docker.bat`**: Kiểm tra kết nối MySQL/Redis cục bộ, migrate DB và chạy hệ thống.

---

## ❗ XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

### 1. Lỗi: `Port 3306 is already in use` khi chạy `docker compose up`
* **Nguyên nhân:** Máy bạn đang bật sẵn dịch vụ MySQL cục bộ (hoặc XAMPP) chiếm cổng 3306.
* **Cách khắc phục:**
  * *Cách 1:* Tắt dịch vụ MySQL cục bộ: Mở `services.msc`, tìm `MySQL` hoặc `MySQL80` $\to$ Chuột phải chọn **Stop**.
  * *Cách 2:* Đổi cổng trong file `Code/docker-compose.yml`:
    ```yaml
    ports:
      - "3307:3306" # Đổi cổng ngoài thành 3307
    ```
    Và đổi trong `backend/.env`: `mysql://aita_user:aita_password@localhost:3307/aita_db`.

### 2. Lỗi: `PrismaClientInitializationError: Can't reach database server`
* **Nguyên nhân:** CSDL chưa bật hoặc mật khẩu tài khoản trong `DATABASE_URL` bị sai.
* **Cách khắc phục:** Kiểm tra lại MySQL (`docker ps` hoặc kiểm tra XAMPP) và mật khẩu tài khoản. Lưu ý nếu mật khẩu có ký tự đặc biệt (như `@`, `#`), cần mã hóa URL (ví dụ `@` thành `%40`).

### 3. Lỗi: `ECONNREFUSED 127.0.0.1:6379` (Lỗi Redis)
* **Nguyên nhân:** Redis server chưa được bật.
* **Cách khắc phục:** Nếu dùng Docker, chạy `docker start aita-redis`. Nếu không dùng Docker, bật dịch vụ Memurai hoặc Redis trên máy.

### 4. Lỗi: `gcc is not recognized as an internal or external command` (Khi không dùng Docker)
* **Nguyên nhân:** Chưa cài MinGW hoặc chưa thêm thư mục `bin` của GCC vào biến môi trường PATH của Windows.
* **Cách khắc phục:** Thêm đường dẫn `C:\mingw64\bin` vào `System Environment Variables > PATH`.
