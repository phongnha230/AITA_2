# 🌐 HƯỚNG DẪN CẤU HÌNH & CHẠY TIDB CLOUD SERVERLESS CHO HỆ THỐNG AITA

> **Dự án**: AITA (AI-Powered Teaching Assistant System - Khảo thí & Chấm thi Lập trình Tự động)  
> **Cơ sở dữ liệu**: TiDB Cloud Serverless (MySQL 8.0 Protocol Compatible, NewSQL Distributed Database)  
> **ORM kết nối**: Prisma ORM v5 (`@prisma/client`)  
> **Region máy chủ**: AWS ap-southeast-1 (Singapore)  

---

## 📑 MỤC LỤC
1. [Tại sao AITA sử dụng TiDB Cloud Serverless?](#1-tại-sao-aita-sử-dụng-tidb-cloud-serverless)
2. [Kiến trúc kết nối Database](#2-kiến-trúc-kết-nối-database)
3. [Hướng dẫn tạo cụm TiDB Cloud Serverless (A - Z)](#3-hướng-dẫn-tạo-cụm-tidb-cloud-serverless-a---z)
4. [Cấu trúc chuỗi kết nối DATABASE_URL & Lưu ý sống còn](#4-cấu-trúc-chuỗi-kết-nối-database_url--lưu-ý-sống-còn)
5. [Quy trình chạy hệ thống với TiDB Cloud (Chi tiết từng lệnh)](#5-quy-trình-chạy-hệ-thống-với-tidb-cloud-chi-tiết-từng-lệnh)
6. [Quản trị dữ liệu với Prisma Studio & TiDB Console](#6-quản-trị-dữ-liệu-với-prisma-studio--tidb-console)
7. [Xử lý các sự cố thường gặp (Troubleshooting)](#7-xử-lý-các-sự-cố-thường-gặp-troubleshooting)
8. [Kịch bản trả lời Hội đồng Bảo vệ Đồ án (Defense Q&A)](#8-kịch-bản-trả-lời-hội-đồng-bảo-vệ-đồ-án-defense-qa)

---

## 1. TẠI SAO AITA SỬ DỤNG TIDB CLOUD SERVERLESS?

| Tiêu chí | MySQL Cục bộ (Localhost / XAMPP / Docker) | TiDB Cloud Serverless (AITA Lựa chọn) |
| :--- | :--- | :--- |
| **Tính sẵn sàng (Availability)** | Chỉ chạy trên máy cá nhân, tắt máy là mất kết nối. | Hoạt động 24/7 trên Cloud (AWS Singapore). |
| **Làm việc nhóm (Team Collaboration)** | Mỗi thành viên một DB riêng, dữ liệu lệch pha nhau. | Cả nhóm FE, BE và Tester dùng chung 1 database duy nhất. |
| **Tải cao khi thi PE (Concurrency)** | Dễ nghẽn kết nối khi nhiều sinh viên nộp bài cùng lúc. | Tự động co giãn (Auto-scaling) theo số lượng truy vấn. |
| **Chi phí** | Tốn RAM/CPU máy tính khi chạy container. | **Miễn phí 100% (Free Tier vĩnh viễn)**: 5 GiB Storage, 50M Request Units/tháng. |
| **Tính tương thích** | Chuẩn MySQL. | **Tương thích 100% giao thức MySQL 8.0 & Prisma ORM**. |

---

## 2. KIẾN TRÚC KẾT NỐI DATABASE

```
[ Frontend: Next.js 14 ]
           │ (REST API / JWT)
           ▼
[ Backend: Express.js (Clean Architecture) ]
           │
           ▼
[ Prisma ORM Client (MySQL Dialect) ]
           │
           │ (TLS 1.3 Encrypted / Port 4000 / ?sslaccept=strict)
           ▼
[ TiDB Cloud Serverless Gateway ] ── (AWS ap-southeast-1 Singapore)
           │
     ┌─────┴──────────┐
     ▼                ▼
[ TiDB Compute Node ]  [ TiKV Distributed Storage ]
```

---

## 3. HƯỚNG DẪN TẠO CỤM TIDB CLOUD SERVERLESS (A - Z)

Nếu bạn cần tạo một cụm Database TiDB mới từ đầu, hãy làm theo các bước sau:

### Bước 1: Đăng ký tài khoản
- Truy cập trang chủ: **[https://tidbcloud.com](https://tidbcloud.com)**
- Nhấn **Sign Up** và đăng nhập nhanh bằng tài khoản **GitHub** hoặc **Google**.

### Bước 2: Tạo Cluster Serverless (Miễn phí)
1. Tại trang Dashboard, nhấn nút **Create Cluster**.
2. Chọn gói: **Serverless** (Free forever).
3. Cấu hình Cluster:
   - **Cluster Name**: Đặt tên (ví dụ: `aita-db-cluster` hoặc `AITA-Production`).
   - **Cloud Provider**: Chọn **AWS**.
   - **Region**: Chọn **Singapore (ap-southeast-1)** *(Bắt buộc chọn Singapore để độ trễ từ Việt Nam thấp nhất: ~35ms)*.
4. Nhấn **Create**. Quá trình khởi tạo mất khoảng 15-30 giây.

### Bước 3: Lấy thông tin tài khoản kết nối
1. Khi cluster sẵn sàng, nhấn nút **Connect** ở góc trên bên phải màn hình.
2. Tại mục **Connect With**, chọn **Prisma** (hoặc **General**).
3. Nhấn **Generate Password** để tạo mật khẩu cho user `root`.
4. Sao chép và lưu mật khẩu này vào nơi an toàn.

### Bước 4: Tạo Database `aita_db`
1. Trên giao diện TiDB Cloud, chuyển sang tab **SQL Editor**.
2. Nhập lệnh SQL sau và nhấn **Run**:
   ```sql
   CREATE DATABASE IF NOT EXISTS aita_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;
   ```
3. Bạn sẽ thấy database `aita_db` xuất hiện trong danh sách.

---

## 4. CẤU TRÚC CHUỖI KẾT NỐI `DATABASE_URL` & LƯU Ý SỐNG CÒN

### 📌 Cú pháp chuẩn
Chuỗi kết nối trong file `Code/backend/.env` có định dạng:
```env
DATABASE_URL="mysql://<ClusterPrefix>.root:<Password>@<GatewayHost>:4000/aita_db?sslaccept=strict"
```

### 📌 Ví dụ thực tế trong dự án AITA:
```env
DATABASE_URL="mysql://68upbP5kcdYCYzY.root:uUGrfXHjZoW9qdtN@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/aita_db?sslaccept=strict"
```

### ⚠️ 3 LƯU Ý KỸ THUẬT QUAN TRỌNG NHẤT:
1. **Tham số `?sslaccept=strict` (BẮT BUỘC)**:
   - TiDB Cloud bắt buộc mã hóa SSL/TLS cho mọi kết nối qua Internet.
   - Prisma ORM yêu cầu thêm `?sslaccept=strict` vào cuối URL để xác thực chứng chỉ an toàn.
   - *Nếu thiếu tham số này, Prisma sẽ báo lỗi `SSL connection error` hoặc ngắt kết nối.*
2. **Cổng kết nối là `4000` (Không phải 3306)**:
   - TiDB Serverless mặc định lắng nghe ở cổng `4000`. Hãy đảm bảo không gõ nhầm thành 3306.
3. **Tên người dùng có tiền tố Cluster**:
   - TiDB định danh tài khoản bằng format: `<Prefix_Cluster>.root` (ví dụ: `68upbP5kcdYCYzY.root`). Không được bỏ phần prefix này.

---

## 5. QUY TRÌNH CHẠY HỆ THỐNG VỚI TIDB CLOUD (CHI TIẾT TỪNG LỆNH)

Mở PowerShell / Terminal tại thư mục `Code/backend`:

```powershell
cd Code/backend
```

### Bước 1: Khởi tạo biến môi trường `.env`
Đảm bảo file `Code/backend/.env` đã có chuỗi `DATABASE_URL` của TiDB Cloud:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://68upbP5kcdYCYzY.root:uUGrfXHjZoW9qdtN@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/aita_db?sslaccept=strict"
JWT_SECRET=aita_super_secret_jwt_key_development_392_fpt_university
JWT_REFRESH_SECRET=aita_super_refresh_jwt_key_development_392_fpt_university
```

---

### Bước 2: Kiểm tra kết nối độc lập tới TiDB Cloud
Dự án đã tích hợp sẵn script kiểm tra sức khỏe kết nối chuyên biệt:

```powershell
npm run test:tidb
```

**Kết quả thành công mong đợi:**
```text
==============================================================================
         [AITA] KIỂM TRA KẾT NỐI TIDB CLOUD SERVERLESS DATABASE             
==============================================================================

   Target URL: mysql://68upbP5kcdYCYzY.root:****@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/aita_db?sslaccept=strict

   Đang gửi truy vấn ping tới TiDB Cloud...

   ✔ KẾT NỐI THÀNH CÔNG TỚI TIDB CLOUD!
   ------------------------------------------------------------
   Độ trễ phản hồi (Latency): 591 ms
   Phiên bản TiDB:             8.0.11-TiDB-v8.5.3-serverless
   Database hiện tại:         aita_db
   Tổng số bảng schema:       17 bảng
   Dữ liệu thực tế:            4 Users | 2 Đề thi (Assignments)

🎉 Hệ thống AITA sẵn sàng làm việc với TiDB Cloud!
```

---

### Bước 3: Sinh mã Prisma Client
Mỗi khi có thay đổi trong `prisma/schema.prisma` hoặc lần đầu clone code:
```powershell
npm run prisma:generate
```

---

### Bước 4: Đồng bộ Schema lên TiDB Cloud
> 💡 **TẠI SAO DÙNG `prisma:push` THAY VÌ `prisma:migrate`?**  
> TiDB Cloud Serverless là hệ quản trị phân tán NewSQL không sử dụng shadow database như MySQL cục bộ. Lệnh `npx prisma db push` đồng bộ trực tiếp toàn bộ 17 bảng vào TiDB Cloud ngay lập tức, cực kỳ an toàn và không gây xung đột migration history.

```powershell
npm run prisma:push
```

Sau khi chạy, TiDB Cloud sẽ sở hữu đầy đủ 17 bảng của hệ thống:
1. `users` (Tài khoản sinh viên, giảng viên, admin)
2. `courses` (Khóa học PRF192, PRO192...)
3. `course_enrollments` (Ghi danh sinh viên vào lớp)
4. `assignments` (Đề thi PE, Lab)
5. `test_cases` (Testcase kiểm thử tự động)
6. `assignment_solutions` (Lời giải mẫu tham chiếu)
7. `rubric_rules` (Tiêu chí chấm AI Clean Code)
8. `submissions` (Bài nộp của sinh viên)
9. `submission_test_results` (Kết quả từng testcase sandbox)
10. `ai_grading_results` (Điểm ngữ nghĩa & phân tích Big-O)
11. `grading_jobs` (Trạng thái hàng đợi chấm BullMQ)
12. `teams` & `team_members` (Quản lý nhóm đồ án)
13. `git_contributors` (Đo lường commit Git)
14. `ai_tutor_conversations` & `ai_tutor_messages` (Trợ giảng Socratic AI)
15. `ai_api_keys` (Quản lý xoay vòng API key Gemini)

---

### Bước 5: Nạp dữ liệu mẫu ban đầu (Seeding)
Nạp dữ liệu tài khoản và đề thi mẫu có sẵn:
```powershell
npm run prisma:seed
```

**Tài khoản mẫu được tạo sẵn:**
- **Admin**: `admin@fpt.edu.vn` / `Password123@`
- **Giảng viên**: `lecturer@fpt.edu.vn` / `Password123@`
- **Sinh viên 1**: `student1@fpt.edu.vn` / `Password123@`
- **Sinh viên 2**: `student2@fpt.edu.vn` / `Password123@`

---

### Bước 6: Khởi động Backend Server
```powershell
npm run dev
```
Backend sẽ khởi chạy tại: **`http://localhost:5000`** và kết nối trực tiếp với TiDB Cloud.

---

### Bước 7: Khởi động Frontend
Mở một cửa sổ terminal khác tại thư mục `Code/frontend`:
```powershell
cd Code/frontend
npm run dev
```
Frontend sẵn sàng tại: **`http://localhost:3000`**.

---

## 6. QUẢN TRỊ DỮ LIỆU VỚI PRISMA STUDIO & TIDB CONSOLE

### Cách 1: Sử dụng Prisma Studio (Giao diện web trực quan cục bộ)
Tại thư mục `Code/backend`, chạy:
```powershell
npm run prisma:studio
```
Trình duyệt sẽ tự động mở `http://localhost:5555`. Tại đây bạn có thể:
- Xem danh sách sinh viên, điểm số, bài nộp.
- Thêm, sửa, xóa bản ghi trực quan dạng bảng Excel.

### Cách 2: Sử dụng SQL Editor trên TiDB Cloud Console
1. Đăng nhập [https://tidbcloud.com](https://tidbcloud.com).
2. Vào cụm cluster của bạn $\rightarrow$ tab **SQL Editor**.
3. Bạn có thể chạy các câu truy vấn phân tích:
   ```sql
   -- Xem danh sách bài nộp và điểm tổng
   SELECT s.id, u.full_name, a.title, s.sandbox_score, s.ai_score, s.final_score, s.status
   FROM submissions s
   JOIN users u ON s.user_id = u.id
   JOIN assignments a ON s.assignment_id = a.id
   ORDER BY s.submitted_at DESC;
   ```

---

## 7. XỬ LÝ CÁC SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### 🔴 Lỗi 1: `PrismaClientInitializationError: Can't reach database server... Handshake failed`
- **Nguyên nhân**: Thiếu tham số SSL trong chuỗi kết nối.
- **Cách khắc phục**: Thêm `?sslaccept=strict` vào cuối `DATABASE_URL`:
  ```env
  DATABASE_URL="mysql://...:4000/aita_db?sslaccept=strict"
  ```

---

### 🔴 Lỗi 2: `Access denied for user 'xxx'`
- **Nguyên nhân**: Mật khẩu có chứa ký tự đặc biệt (`@`, `#`, `?`, `/`) chưa được mã hóa URL (URL Encoding), hoặc gõ thiếu tiền tố `<Prefix>.root`.
- **Cách khắc phục**:
  - Mã hóa ký tự đặc biệt: `@` $\rightarrow$ `%40`, `#` $\rightarrow$ `%23`.
  - Hoặc vào TiDB Cloud Console $\rightarrow$ **Security** $\rightarrow$ **Reset Password** để đặt mật khẩu chỉ chứa chữ cái và số (ví dụ: `AitaSecret2026Pass`).

---

### 🔴 Lỗi 3: `Unknown database 'aita_db'`
- **Nguyên nhân**: Database `aita_db` chưa được tạo trên TiDB Cloud.
- **Cách khắc phục**: Mở SQL Editor trên TiDB Cloud console và chạy:
  ```sql
  CREATE DATABASE aita_db;
  ```

---

### 🔴 Lỗi 4: `P3014: Prisma shadow database error` khi chạy `prisma migrate dev`
- **Nguyên nhân**: TiDB Serverless không cho phép tài khoản tự tạo shadow database tạm thời.
- **Cách khắc phục**: Sử dụng `npm run prisma:push` (hoặc `npx prisma db push`) thay cho `migrate dev`.

---

### 🔴 Lỗi 5: TiDB Cluster bị Pause (Trạng thái `Paused`)
- **Nguyên nhân**: Cụm Serverless miễn phí sẽ tự động ngủ đông nếu không có truy vấn nào trong nhiều ngày để tiết kiệm tài nguyên.
- **Cách khắc phục**: Truy cập TiDB Cloud Console $\rightarrow$ Nhấn nút **Resume** (mất khoảng 10 giây để cụm hoạt động lại).

---

## 8. KỊCH BẢN TRẢ LỜI HỘI ĐỒNG BẢO VỆ ĐỒ ÁN (DEFENSE Q&A)

### ❓ Câu hỏi 1: "Tại sao nhóm chọn TiDB Cloud Serverless thay vì PostgreSQL hay MySQL truyền thống?"
> **Trả lời mẫu**:  
> *"Kính thưa Thầy Cô, hệ thống AITA phục vụ khảo thí trực tiếp cho hàng trăm sinh viên cùng nộp bài trong vài phút cuối giờ thi PE. Mô hình NewSQL phân tán của TiDB Cloud tách biệt giữa tầng Tính toán (TiDB Compute) và tầng Lưu trữ phân tán (TiKV Storage) theo kiến trúc Raft Consensus. Điều này giúp hệ thống chịu tải đồng thời (High Concurrency) mà không bị nghẽn deadlock, đồng thời đảm bảo 100% tính tương thích ACID và giao thức MySQL 8.0 với Prisma ORM."*

### ❓ Câu hỏi 2: "TiDB Cloud có an toàn về bảo mật dữ liệu thi cử không?"
> **Trả lời mẫu**:  
> *"Dạ thưa Thầy Cô, TiDB Cloud Serverless bắt buộc 100% kết nối đi qua đường truyền mã hóa TLS 1.3 với tham số cấu hình `sslaccept=strict` trên Prisma. Dữ liệu được lưu trữ mã hóa chuẩn AES-256 (Encryption at Rest) trên trung tâm dữ liệu AWS Singapore, đáp ứng đầy đủ tiêu chuẩn bảo mật SOC 2 Type II và ISO 27001."*

---

*Tài liệu được biên soạn và chuẩn hóa cho Dự án AITA - Chúc nhóm bảo vệ đồ án thành công xuất sắc!*
