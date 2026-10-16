# Chạy dự án AITA trên máy phát triển

Tài liệu này giúp thành viên mới chạy frontend, backend, Redis, ChromaDB và sandbox chấm bài. AITA dùng TiDB Cloud làm cơ sở dữ liệu quan hệ. Docker Compose không khởi động MySQL.

## Chọn chế độ chạy

Bạn có thể chạy dự án theo một trong hai chế độ:

- **Có Docker, khuyên dùng**: Docker chạy Redis, ChromaDB và các container sandbox
- **Không có Docker**: bạn tự cung cấp Redis, ChromaDB, GCC và Java Development Kit (JDK)

Chế độ không Docker chạy mã sinh viên trực tiếp trên máy. Chỉ dùng chế độ này để phát triển với mã nguồn tin cậy.

## Chuẩn bị công cụ

Cài các công cụ sau trước khi bắt đầu:

- Node.js `22.x`, cùng dòng phiên bản với CI và Dockerfile
- npm đi kèm Node.js
- Git
- Docker Desktop nếu dùng chế độ Docker
- Quyền truy cập TiDB Cloud development

Dự án dùng `npm`, không dùng pnpm. Hai thư mục ứng dụng là:

- `Code/backend`: Express, TypeScript và Prisma
- `Code/frontend`: Next.js 14 và Tailwind CSS

## Cấu hình môi trường lần đầu

Tạo file môi trường backend trước khi chạy Docker Compose hoặc backend.

```powershell
cd Code
Copy-Item backend/.env.example backend/.env
```

Trên Linux hoặc macOS, chạy lệnh tương đương:

```bash
cd Code
cp backend/.env.example backend/.env
```

Ba biến sau bắt buộc để backend khởi động:

```ini
DATABASE_URL="mysql://cluster_user:database_password@tidb_host:4000/aita_db?sslaccept=strict"
JWT_SECRET="replace_with_a_random_secret_of_at_least_32_characters"
JWT_REFRESH_SECRET="replace_with_another_random_secret_of_at_least_32_characters"
```

Thêm các biến sau khi dùng chế độ Docker local được hướng dẫn trong tài liệu này:

```ini
PORT=5003
NODE_ENV=development
REDIS_HOST="localhost"
REDIS_PORT=6380
REDIS_PASSWORD=""
CHROMA_DB_URL="http://localhost:8000"
USE_DOCKER_SANDBOX=true
FRONTEND_URL="http://localhost:3000"
COOKIE_SAME_SITE=lax
```

Backend có default cho các biến trên, ngoại trừ `DATABASE_URL` và hai JWT secret. `REDIS_PORT=6380` vẫn phải được đặt khi Redis chạy bằng Compose vì container được publish ra cổng host `6380`.

`AI_KEY_ENCRYPTION_KEY` không bắt buộc để backend development khởi động. Biến này bắt buộc khi admin thêm hoặc backend sử dụng Gemini key lưu trên Dashboard:

```ini
AI_KEY_ENCRYPTION_KEY="paste_the_generated_base64_key_here"
```

Tạo khóa bằng Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Nếu cả nhóm dùng chung TiDB, mọi backend phải dùng cùng `AI_KEY_ENCRYPTION_KEY`. Khóa khác nhau không thể giải mã Gemini key đã lưu trên Dashboard. Chia sẻ khóa qua trình quản lý secret, không commit `.env` vào Git.

Các biến AI còn lại có default trong backend. Bạn chỉ cần thêm chúng khi muốn đổi hành vi mặc định. Xem phần “Cấu hình Gemini, chatbot và RAG” để biết giá trị hiện tại.

Nếu `.env` đã tồn tại từ trước, không copy đè file vì sẽ mất secret. So sánh file đó với `.env.example`, rồi bổ sung tên biến còn thiếu. Các biến `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` và `MYSQL_PORT` không còn được Docker Compose sử dụng.

Frontend dùng URL local mặc định. Tạo `frontend/.env.local` khi cần cấu hình rõ ràng hoặc dùng reCAPTCHA:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5003/api/v1
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
```

## Cài dependency sau khi clone hoặc pull code

Dùng `npm ci` để cài đúng phiên bản trong `package-lock.json`.

```powershell
cd Code/backend
npm ci
npm run prisma:generate

cd ../frontend
npm ci
```

Chạy lại `npm ci` khi `package-lock.json` thay đổi. Không dựa vào thư mục `node_modules` cũ sau khi pull code.

## Chạy với Docker

Chế độ này chạy Redis và ChromaDB bằng Docker. Backend và frontend vẫn chạy trực tiếp bằng Node.js.

### 1. Khởi động Redis, ChromaDB và build image browser sandbox

Chạy lệnh sau từ thư mục `Code/` sau khi đã tạo `backend/.env`:

```bash
docker compose -f backend/docker-compose.yml --env-file backend/.env up -d
docker compose -f backend/docker-compose.yml --env-file backend/.env --profile sandbox-build build playwright-sandbox-image
```

Kiểm tra trạng thái container:

```bash
docker compose -f backend/docker-compose.yml --env-file backend/.env ps
```

Các dịch vụ mặc định gồm:

- Redis: `localhost:6380`
- ChromaDB: `http://localhost:8000`

Compose không chạy MySQL. `DATABASE_URL` vẫn kết nối tới TiDB Cloud.

### 2. Khởi động backend

```bash
cd Code/backend
npm run dev
```

Backend chạy tại `http://localhost:5003`. Kiểm tra `http://localhost:5003/api/v1/health`.

Backend tự khởi động grading worker và RAG indexing worker. Lần chấm C hoặc Java đầu tiên có thể tải image `gcc:alpine` hoặc `openjdk:17-alpine`.
Chấm React/Web tạo Chromium container riêng cho mỗi lượt chấm, chạy bằng user không phải root, giới hạn CPU/RAM/process và không mount file backend. Container nằm trong mạng Docker `internal`; proxy egress riêng chỉ cho HTTPS tới hostname phân giải thành IP công khai và ghim IP đã kiểm tra. Container bị xóa sau khi chấm. Compose khởi động proxy, còn lệnh build ở bước 1 tạo image Chromium và cổng điều khiển. Nếu Docker/image/proxy không sẵn sàng, lượt chấm báo lỗi thay vì chạy Chromium trực tiếp trong backend.

### 3. Khởi động frontend

Mở terminal khác và chạy:

```bash
cd Code/frontend
npm run dev
```

Frontend chạy tại `http://localhost:3000`.

## Chạy không có Docker

Chế độ này yêu cầu dịch vụ và compiler đã tồn tại trên máy hoặc trên cloud.

### 1. Chuẩn bị dịch vụ

Cấu hình các thành phần sau:

- TiDB Cloud cho `DATABASE_URL`
- Redis local, Memurai, WSL2 hoặc Redis Cloud
- ChromaDB từ một server dùng chung nếu cần RAG và AI grading
- GCC cho bài C
- JDK 17 hoặc 21 cho bài Java

Nếu không có ChromaDB, frontend và API thông thường vẫn có thể chạy. RAG indexing và AI grading sẽ không hoạt động hoàn chỉnh.

### 2. Chuyển backend sang native sandbox

Cập nhật các biến liên quan trong `backend/.env`:

```ini
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
CHROMA_DB_URL="http://shared_chroma_host:8000"
USE_DOCKER_SANDBOX=false
```

Kiểm tra compiler trước khi chạy backend:

```bash
gcc --version
javac -version
java -version
```

### 3. Khởi động ứng dụng

Chạy backend và frontend trong hai terminal:

```bash
cd Code/backend
npm run dev
```

```bash
cd Code/frontend
npm run dev
```

## Quản lý schema TiDB an toàn

TiDB development là tài nguyên dùng chung. Chỉ một người được phân công chạy migration cho mỗi thay đổi schema.

Người phụ trách deployment chạy:

```bash
cd Code/backend
npx prisma migrate deploy
npm run prisma:generate
```

Các thành viên còn lại chỉ chạy `npm run prisma:generate`. Không chạy `prisma db push`, `prisma migrate dev` hoặc integration test với `DATABASE_URL` của TiDB dùng chung.

Integration test trong CI dùng MySQL và Redis disposable riêng. Dữ liệu test không được ghi vào TiDB development hoặc production.

## Cấu hình Gemini, chatbot và RAG

Chatbot, AI grading và embedding dùng chung Gemini credential pool.

Thứ tự chọn key là:

1. Gemini key đang active trên Dashboard admin
2. `GEMINI_API_KEY`
3. Danh sách trong `GEMINI_API_KEYS`

Các biến liên quan trong `backend/.env`:

```ini
GEMINI_API_KEY=""
GEMINI_API_KEYS=""
GEMINI_KEY_SOURCE="dashboard-first"
GEMINI_ENV_KEY_FALLBACK=true
GEMINI_GENERATION_MODEL="gemini-3.8-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
AI_GRADING_REQUIRE_READY_RAG=false
```

Bạn có thể để trống env Gemini khi Dashboard đã có key active và backend dùng đúng `AI_KEY_ENCRYPTION_KEY`. Khi pool hết key, chatbot trả HTTP 503; indexing và grading chuyển sang retry.

Tutor chatbot không đọc teacher solution. AI grading truy vấn ChromaDB trước khi gọi Gemini.

### Dùng RAG trong môi trường nhóm

TiDB lưu trạng thái indexing, còn ChromaDB lưu vector. Nếu nhóm dùng chung TiDB nhưng mỗi người dùng Chroma local, trạng thái `READY` có thể không khớp với vector trên từng máy.

Khi nhiều người cùng kiểm thử RAG, dùng một ChromaDB development chung. Sau khi deploy migration hoặc tạo collection mới, người phụ trách chạy:

```bash
cd Code/backend
npm run rag:backfill
```

Giữ backend worker chạy cho tới khi queue indexing hoàn tất. Chỉ đặt `AI_GRADING_REQUIRE_READY_RAG=true` sau khi kiểm tra active solution đã được index vào ChromaDB dùng chung.

## Cấu hình tính năng tùy chọn

Các tính năng sau không chặn backend khởi động trong development, nhưng cần cấu hình để hoạt động đầy đủ:

- **OTP email**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- **Google OAuth**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- **reCAPTCHA**: `RECAPTCHA_SECRET_KEY` và `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Avatar Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Cloudinary không lưu ZIP submission qua generic upload endpoint. Submission service giải nén và xử lý ZIP trong workspace giới hạn của backend.

Nếu chưa cấu hình SMTP trong development, OTP được ghi vào console backend. Không bật `DEV_FIXED_OTP` hoặc fallback auth trong production.

## Dùng script Windows

Thư mục `Code/` có các script sau:

- `start-with-docker.bat`: khởi động Redis, ChromaDB, backend và frontend
- `start-with-docker.ps1`: phiên bản PowerShell của luồng Docker
- `start-without-docker.bat`: chạy backend và frontend với dependency native

Script tạo `backend/.env` nếu file chưa tồn tại, nhưng không điền credential thật. Mở `.env`, kiểm tra cấu hình rồi chạy lại script. Sau khi pull thay đổi dependency, chạy `npm ci` thủ công trước khi dùng script.

Các script không thay đổi schema TiDB.

## Kiểm tra trước khi gửi code

Chạy các gate backend:

```bash
cd Code/backend
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Chạy các gate frontend:

```bash
cd Code/frontend
npm run typecheck
npm test
npm run build
```

Không chạy integration test bằng database dùng chung. CI tự tạo database disposable cho suite này.

## Xử lý lỗi thường gặp

### Backend không kết nối được TiDB

Kiểm tra Internet, trạng thái cluster, host, cổng `4000` và `DATABASE_URL`. URL phải có `sslaccept=strict`. URL-encode ký tự đặc biệt trong username hoặc password.

### Backend báo `ECONNREFUSED` với Redis

Nếu dùng Docker, kiểm tra container và `REDIS_PORT=6380`. Nếu chạy native, bật Redis hoặc Memurai và dùng đúng cổng.

### Dashboard Gemini key không giải mã được

Kiểm tra `AI_KEY_ENCRYPTION_KEY`. Mọi backend đọc cùng dữ liệu key phải dùng cùng khóa mã hóa 32 byte dạng base64.

### RAG không tìm thấy context dù solution báo `READY`

Kiểm tra `CHROMA_DB_URL` có trỏ tới ChromaDB dùng chung hay không. Chạy lại `npm run rag:backfill` bằng người phụ trách và theo dõi worker indexing.

### Máy báo không tìm thấy GCC hoặc Java

Với native sandbox, thêm GCC và JDK vào `PATH`. Với Docker sandbox, kiểm tra Docker Desktop và thử `docker run --rm gcc:alpine gcc --version`.

### Cookie đăng nhập không hoạt động

Giữ frontend ở `http://localhost:3000`, backend ở `http://localhost:5003`, `FRONTEND_URL` đúng origin và `COOKIE_SAME_SITE=lax`. Nếu đổi host hoặc port, cập nhật cả `FRONTEND_URL` và `NEXT_PUBLIC_API_URL`.
