# TÀI LIỆU ĐẶC TẢ PHÂN QUYỀN HỆ THỐNG (RBAC ROLES & PERMISSIONS SPECIFICATION)
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design (Đại học FPT)  
**Mô hình bảo mật:** Role-Based Access Control (RBAC) trên nền tảng JWT & Express Middleware

---

## 1. MỤC TIÊU PHÂN QUYỀN
Hệ thống AITA quản lý quá trình thi cử và chấm điểm tự động. Việc phân định quyền hạn đảm bảo 3 tiêu chí:
1. **Tính bảo mật học vụ:** Sinh viên không thể xem trước testcase ẩn, không thể thấy đáp án mẫu của giảng viên.
2. **Tính độc lập dữ liệu:** Giảng viên chỉ quản lý các lớp học và bài thi của chính mình.
3. **Tính an toàn hạ tầng:** Chỉ có Quản trị viên (Admin) mới có quyền cấu hình Docker Sandbox và kho khóa AI API Keys.

---

## 2. CHI TIẾT 3 VAI TRÒ CHÍNH (ACTORS & ROLES)

### 2.1. VAI TRÒ `ADMIN` (Quản trị viên Hệ thống)
* **Đối tượng:** Cán bộ quản trị kỹ thuật hệ thống / Phòng Khảo thí.
* **Quyền hạn được phép:**
  - **Quản lý User & Cấp quyền:** Tạo mới, khóa/mở khóa tài khoản; gán Role (`ADMIN`, `LECTURER`, `STUDENT`); reset mật khẩu người dùng.
  - **Quản lý Kho Khóa API AI (`ai_api_keys`):** Thêm/sửa/xóa khóa API (Gemini, OpenAI); kích hoạt hoặc tạm dừng khóa (`is_active`); theo dõi hạn mức (`rate_limit_per_min`) và chi phí gọi API.
  - **Giám sát Hàng đợi & Hạ tầng (`grading_jobs`):** Theo dõi Dashboard trạng thái Redis BullMQ (số job `QUEUED`, `RUNNING_SANDBOX`, `RUNNING_AI`, `FAILED`); hủy các job bị treo; khởi động lại worker.
  - **Cấu hình Sandbox Toàn cục:** Giới hạn RAM tối đa (mặc định 256MB), giới hạn CPU timeout (mặc định 2 giây).
* **Ràng buộc giới hạn:** Không tự ý can thiệp sửa nội dung đề thi hay sửa điểm số bài làm của sinh viên để đảm bảo tính khách quan.

---

### 2.2. VAI TRÒ `LECTURER` (Giảng viên Bộ môn)
* **Đối tượng:** Thầy cô giảng dạy các môn lập trình (PRF192, PRO192, CSD201).
* **Quyền hạn được phép:**
  - **Quản lý Khóa học & Lớp học (`courses`):** Tạo lớp học; import danh sách sinh viên qua Excel/CSV; tạo các nhóm sinh viên (`teams`).
  - **Quản lý Đề thi PE (`assignments`):** Tạo đề thi; cài đặt thời hạn nộp bài (`deadline`); chọn ngôn ngữ cho phép (C, Java).
  - **Quản lý Bộ Test Cases (`test_cases`):** Tạo/sửa testcase (Input, Expected Output, Time limit); phân loại `test_type` (Cơ bản, Dữ liệu biên, Kiểm tra hiệu năng Big-O); gán nhãn ý đồ kiểm thử (`rationale`); đánh dấu test ẩn (`is_hidden = true`).
  - **Quản lý Barem Chấm Ngữ Nghĩa (`rubric_rules`):** Thiết lập tiêu chí chấm Clean Code, trọng số điểm %, prompt hướng dẫn cho AI.
  - **Quản lý Kho Đáp Án Mẫu RAG (`assignment_solutions`):** Nạp mã nguồn giải chuẩn của từng câu (Q1..Q4), tài liệu giải thích thuật toán (`explanation_notes`) để nạp vào Vector DB (ChromaDB).
  - **Xem Điểm, Phúc Khảo & Chấm Lại (Re-grade):** Xem bảng điểm toàn bộ lớp học; xem log chạy Docker từng sinh viên; kích hoạt chấm lại bài thi với độ ưu tiên cao nhất (`priority = 1`); ghi đè điểm số nếu sinh viên khiếu nại đúng.
* **Ràng buộc giới hạn:**
  - Không được truy cập vào kho khóa API của Admin.
  - Không được can thiệp vào lớp học và đề thi của Giảng viên khác.

---

### 2.3. VAI TRÒ `STUDENT` (Sinh viên / Thí sinh)
* **Đối tượng:** Sinh viên làm bài thi PE hoặc bài tập lập trình.
* **Quyền hạn được phép:**
  - **Xem Khóa học & Đề thi:** Xem các lớp mình đang tham gia (`course_enrollments`); đọc đề bài và theo dõi deadline.
  - **Nộp bài thi PE (`submissions`):** Tải lên file nén `.zip` chứa mã nguồn bài làm trước khi hết hạn deadline.
  - **Theo dõi Tiến độ Chấm bài:** Xem thanh trạng thái thời gian thực (`Queued -> Sandbox -> AI -> Completed`).
  - **Xem Báo cáo Điểm số Chi tiết:** Xem tổng điểm (Thang 10); xem kết quả chi tiết từng testcase công khai (Pass/Fail, thời gian chạy, lỗi compile); xem nhận xét bóc tách của AI.
  - **Tương tác với AI Tutor Chatbot:** Nhắn tin trực tiếp với AI để hỏi đáp về nguyên nhân testcase bị lỗi trên chính bài làm của mình.
* **Ràng buộc giới hạn (Chống gian lận thi cử):**
  - **CẤM HOÀN TOÀN:** Không được xem Đáp án mẫu (`assignment_solutions`) của Giảng viên.
  - **CẤM HOÀN TOÀN:** Không được xem các Testcase ẩn (`is_hidden = true`) trước khi thi.
  - Không được nộp bài khi đã quá deadline (Backend chặn HTTP 403 Forbidden).
  - Không được xem bài làm hay điểm số chi tiết của sinh viên khác.

---

## 3. MA TRẬN PHÂN QUYỀN CRUD TRÊN DATABASE (RBAC MATRIX)

| Thực thể / Bảng Dữ Liệu | `ADMIN` | `LECTURER` | `STUDENT` | Ghi chú bảo mật |
| :--- | :---: | :---: | :---: | :--- |
| **1. `users` (Tài khoản)** | **C, R, U, D** | R (chỉ xem SV lớp mình) | R-Own (chỉ xem hồ sơ cá nhân) | Mật khẩu luôn băm Bcrypt |
| **2. `courses` (Lớp học)** | **C, R, U, D** | **C, R, U, D** (lớp của mình) | R (chỉ lớp mình ghi danh) | Giảng viên chỉ sửa lớp mình tạo |
| **3. `assignments` (Đề thi)** | R | **C, R, U, D** | R (chỉ xem khi chưa hết hạn) | Khóa nộp bài khi qua deadline |
| **4. `test_cases` (Kiểm thử)** | R | **C, R, U, D** | R-Pub (chỉ xem test công khai) | Test ẩn lọc bỏ ở tầng Backend |
| **5. `assignment_solutions` (Đáp án)** | R | **C, R, U, D** | 🚫 **CẤM HOÀN TOÀN** | Ẩn API 100% với Student |
| **6. `submissions` (Bài nộp)** | R | R, U (chấm lại / sửa điểm) | **C, R-Own** (chỉ nộp & xem bài mình) | Không xem bài của sinh viên khác |
| **7. `grading_jobs` (Hàng đợi)** | **R, U, D** (Kill/Purge) | R, C (yêu cầu re-grade) | R-Own (chỉ xem tiến độ bài mình) | Admin có quyền can thiệp hàng đợi |
| **8. `ai_api_keys` (Khóa AI)** | **C, R, U, D** | 🚫 **CẤM** | 🚫 **CẤM** | Khóa được mã hóa AES-256 |
| **9. `ai_tutor_messages` (Chat AI)** | R | R (xem lịch sử hỏi đáp) | **C, R-Own** (chat về bài của mình) | AI không bao giờ nhả code giải |

---

## 4. CÀI ĐẶT KỸ THUẬT PHÍA BACKEND (EXPRESS MIDDLEWARE)

Backend cài đặt kiểm tra quyền thông qua middleware tập trung tại `src/presentation/middlewares/auth.middleware.ts`:

```typescript
// 1. Xác thực JWT hợp lệ
export const verifyToken = (req: Request, res: Response, next: NextFunction) => { ... };

// 2. Chặn quyền theo Role
export const requireRole = (...allowedRoles: ('ADMIN' | 'LECTURER' | 'STUDENT')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Bạn không có quyền truy cập tài nguyên này'
      });
    }
    next();
  };
};
```

*Ví dụ áp dụng trong Route:*
- Tạo đề thi: `router.post('/assignments', verifyToken, requireRole('LECTURER'), AssignmentController.create);`
- Thêm API Key: `router.post('/admin/ai-keys', verifyToken, requireRole('ADMIN'), AdminController.addKey);`
- Nộp bài thi: `router.post('/submissions', verifyToken, requireRole('STUDENT'), SubmissionController.submit);`

---

## 5. QUY CHẾ THI THEO LỚP & HỒ SƠ QUẢN TRỊ NGƯỜI DÙNG (COURSE ENROLLMENT & USER 360°)

### 5.1. Cơ chế Thi theo Lớp học (Course-Based Enrollment)
Hệ thống AITA quản lý kỳ thi PE theo mô hình **Lớp học (Course-based)**, không mở thi tự do trôi nổi:
1. **Liên kết bắt buộc:** Mỗi đề thi `assignments` bắt buộc phải có `course_id` trỏ về một lớp học cụ thể của một Giảng viên tạo ra.
2. **Điều kiện làm bài:** Sinh viên bắt buộc phải có bản ghi trong bảng `course_enrollments` (được Giảng viên import qua Excel/CSV hoặc tham gia lớp) thì mới xem được đề và nộp bài.
3. **Bảo mật đề thi:** Sinh viên lớp khác hoặc người ngoài khi truy cập link đề thi sẽ bị hệ thống chặn với mã lỗi `403 Forbidden`.

### 5.2. Đặc tả Hồ sơ Quản trị Người dùng 360° (Admin User Detail Drawer)
Khi Admin truy cập `/admin/users` và **click vào một tài khoản cụ thể**, hệ thống hiển thị Drawer thông tin chuyên biệt theo Role:

#### A. Thao tác Chung cho mọi Tài khoản:
- **Thông tin định danh:** Họ tên, Email FPT, Ngày tạo, Lần đăng nhập cuối, Trạng thái (`ACTIVE` / `BANNED`).
- **Nút hành động Admin:**
  * Dropdown chuyển đổi Role trực tiếp (`STUDENT` $\leftrightarrow$ `LECTURER` $\leftrightarrow$ `ADMIN`).
  * Khóa / Mở khóa tài khoản (Ban/Unban) khi có dấu hiệu gian lận hoặc vi phạm an ninh mạng.
  * Reset mật khẩu về mặc định khi người dùng báo mất quyền truy cập.

#### B. Khi Click vào GIẢNG VIÊN (`LECTURER`):
- **Thẻ thống kê KPI:** Số lớp đang phụ trách, Tổng số sinh viên đang dạy, Số lượng đề thi PE đã tạo.
- **Danh sách Lớp học phụ trách:** Bảng các lớp (Mã lớp, Môn học PRF192/PRO192/CSD201, Sĩ số, Học kỳ).
- **Phân công lớp mới:** Cho phép Admin gán thêm lớp cho giảng viên hoặc chuyển quyền phụ trách lớp khi giảng viên nghỉ phép.
- **Kho Đề thi đã tạo:** Danh sách các bài thi PE do thầy/cô này thiết lập.
- **Nhật ký Chấm thi:** Lịch sử giảng viên sửa điểm hoặc bấm Re-grade bài làm cho sinh viên.

#### C. Khi Click vào SINH VIÊN (`STUDENT`):
- **Thông tin Sinh viên:** Mã số sinh viên (MSSV), Chuyên ngành đào tạo.
- **Lớp học đang tham gia:** Danh sách lớp học kèm tên Giảng viên giảng dạy.
- **Lịch sử Thi & Điểm số:** Toàn bộ các bài thi PE đã nộp, điểm tổng kết (Sandbox 7.0 + AI Rubric 3.0), số lần submit file ZIP.
- **Nhật ký An toàn & Kỹ thuật (Security Audit Log):**
  * Ghi nhận các trường hợp bài nộp bị Docker Sandbox chặn do vi phạm an toàn (lệnh `rm -rf`, `fork()` bomb, gọi socket ra ngoài internet).
  * Địa chỉ IP và thời gian nộp bài (phục vụ đối soát khi giám thị nghi vấn thi hộ).
