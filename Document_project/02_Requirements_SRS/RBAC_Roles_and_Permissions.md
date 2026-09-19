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
