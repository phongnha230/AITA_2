# HƯỚNG DẪN CHẠY DỰ ÁN AITA (CHO NHÓM PHÁT TRIỂN)
**Hệ thống:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – FPT University  

Tài liệu này hướng dẫn chi tiết cách chạy dự án AITA cho 2 trường hợp. Cả hai
đều dùng **TiDB Cloud** làm cơ sở dữ liệu quan hệ; Docker chỉ phục vụ Redis,
ChromaDB và môi trường sandbox chấm bài.

* **TRƯỜNG HỢP 1: Có dùng Docker** *(Khuyên dùng - cô lập an toàn).*
* **TRƯỜNG HỢP 2: KHÔNG dùng Docker** *(Dành cho máy yếu hoặc không có Docker Desktop).*

---

## 🛠️ YÊU CẦU TIÊN QUYẾT CHUNG (BẮT BUỘC CHO CẢ 2 TRƯỜNG HỢP)

1. **Node.js:** Phiên bản **v18.x** trở lên (Khuyên dùng v20.x hoặc v22.x). Kiểm tra: `node -v`.
2. **Git:** Đã clone mã nguồn dự án về máy.
3. **TiDB Cloud:** Có cluster, database và chuỗi kết nối TLS hợp lệ.
4. **Mã nguồn:** Thư mục gốc dự án gồm 2 phân hệ chính:
   * `Code/backend`: Express.js + TypeScript + Prisma ORM.
   * `Code/frontend`: Next.js 14 App Router + Tailwind CSS.

---

## 🐳 TRƯỜNG HỢP 1: CHẠY DỰ ÁN CÓ DÙNG DOCKER (KHUYÊN DÙNG)

Phù hợp cho máy có cài đặt **Docker Desktop** (đang bật).

### Bước 1: Khởi động Redis và ChromaDB qua Docker
Mở Terminal tại thư mục `Code/` và chạy:
```bash
cd Code
docker compose -f backend/docker-compose.yml --env-file backend/.env up -d
```
* Kiểm tra container đang chạy: `docker ps`
  * Container `aita-redis` mặc định chạy tại cổng host `6380`.
  * Container `aita-chromadb` mặc định chạy tại cổng `8000`.

Compose không khởi động MySQL. Dữ liệu quan hệ được lưu trên TiDB Cloud.

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
3. Điền chuỗi kết nối TiDB Cloud và cấu hình dịch vụ local trong `backend/.env`:
   ```ini
   PORT=5000
   DATABASE_URL="mysql://<user>:<password>@<tidb-host>:4000/aita_db?sslaccept=strict"
   REDIS_HOST="localhost"
   REDIS_PORT=6380
   CHROMA_DB_URL="http://localhost:8000"
   USE_DOCKER_SANDBOX=true
   ```
4. Cài đặt thư viện và tạo Prisma Client:
   ```bash
   npm install
   npx prisma generate
   ```

   Không tự động chạy `prisma db push` khi khởi động. Chỉ chạy
   `npm run prisma:push` khi chủ động muốn cập nhật schema TiDB Cloud.
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

### Bước 1: Chuẩn bị TiDB Cloud và Redis
1. **TiDB Cloud:** đảm bảo máy có Internet và `DATABASE_URL` trong
   `backend/.env` trỏ tới cluster TiDB Cloud.
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

# Chuỗi kết nối TiDB Cloud có TLS:
DATABASE_URL="mysql://<user>:<password>@<tidb-host>:4000/aita_db?sslaccept=strict"

# Redis cục bộ:
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# TẮT DOCKER SANDBOX (Hệ thống sẽ dùng trực tiếp gcc/javac trên máy):
USE_DOCKER_SANDBOX=false
```

### Bước 4: Tạo Prisma Client và chạy Backend
```bash
cd Code/backend
npm install
npx prisma generate
npm run dev
```

Chỉ chạy `npm run prisma:push` khi chủ động muốn cập nhật schema TiDB Cloud.

### Bước 5: Chạy Frontend
```bash
cd Code/frontend
npm install
npm run dev
```

---

## ⚡ FILE CHẠY NHANH 1-CLICK (CHO WINDOWS)

Để tiện lợi cho ae, thư mục `Code/` đã chuẩn bị sẵn các file script tự động:
* **`start-with-docker.bat`**: Bật Redis + ChromaDB, tạo Prisma Client và khởi chạy Backend + Frontend.
* **`start-without-docker.bat`**: Dùng TiDB Cloud + Redis local, tạo Prisma Client và chạy hệ thống.

Các script khởi động không tự thay đổi schema TiDB Cloud.

---

## ❗ XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

### 1. Lỗi: `PrismaClientInitializationError: Can't reach database server`
* **Nguyên nhân:** Không có Internet, cluster TiDB đang tạm dừng, hoặc `DATABASE_URL` sai.
* **Cách khắc phục:** Kiểm tra host, cổng `4000`, tài khoản, mật khẩu và tham số
  `sslaccept=strict`. Ký tự đặc biệt trong mật khẩu phải được URL-encode.

### 2. Lỗi: `ECONNREFUSED` (Redis)
* **Nguyên nhân:** Redis server chưa được bật.
* **Cách khắc phục:** Nếu dùng Docker, chạy lại Compose và kiểm tra `REDIS_PORT=6380`.
  Nếu không dùng Docker, bật Memurai/Redis và dùng đúng cổng local.

### 3. Lỗi: `gcc is not recognized as an internal or external command` (Khi không dùng Docker)
* **Nguyên nhân:** Chưa cài MinGW hoặc chưa thêm thư mục `bin` của GCC vào biến môi trường PATH của Windows.
* **Cách khắc phục:** Thêm đường dẫn `C:\mingw64\bin` vào `System Environment Variables > PATH`.
