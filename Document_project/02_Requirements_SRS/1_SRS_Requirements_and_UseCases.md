# TÀI LIỆU ĐẶC TẢ YÊU CẦU & USE CASE HỆ THỐNG AITA
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design (Đại học FPT)  
**Phạm vi hệ thống:** Nền tảng Web (Next.js Frontend + Express.js Backend + MySQL Database)

---

## 1. XÁC ĐỊNH ACTORS (TÁC NHÂN HỆ THỐNG)

Hệ thống có 3 Actors chính và 2 System Actors (Ngoại vi):

1. **Student (Sinh viên):**
   - Đăng nhập, xem danh sách khóa học và bài tập được giao.
   - Nộp bài tập lập trình (upload file ZIP mã nguồn hoặc liên kết Git Repository).
   - Theo dõi trạng thái hàng đợi chấm bài thời gian thực.
   - Xem kết quả đánh giá kép: Test case output (Sandbox) + Nhận xét chất lượng mã nguồn (AI Semantic Review).
   - Tương tác với **AI Tutor Chatbot** để hỏi đáp về lỗi logic và nhận gợi ý cải thiện code.
   - Xem thống kê đóng góp cá nhân (Git Commit & Lines of Code) trong bài tập nhóm.

2. **Lecturer (Giảng viên):**
   - Tạo và quản lý Lớp học / Khóa học (`Course`), gán sinh viên vào danh sách lớp/nhóm.
   - Tạo bài tập (`Assignment`), cấu hình hạn nộp, ngôn ngữ cho phép (Java, Python, C#, C++...).
   - Thiết lập bộ tiêu chí chấm điểm chi tiết (**RubricRules**) và mẫu Prompt ngữ cảnh tương ứng.
   - Thiết lập bộ kiểm thử (**TestCases**): test case công khai (Public) và test case ẩn (Hidden) kèm giới hạn thời gian/bộ nhớ.
   - Xem bảng điểm tổng hợp, dashboard phân tích đóng góp Git của các nhóm để phát hiện "free-riding".
   - Chấm điểm thủ công hoặc ghi đè kết quả tự động của AI nếu cần.

3. **Admin (Quản trị viên):**
   - Quản lý tài khoản người dùng, phân quyền RBAC.
   - Quản lý kho khóa API AI (**AiApiKey**): Thêm key, cấu hình hạn mức (quota/rate-limit), kích hoạt/vô hiệu hóa key.
   - Giám sát hàng đợi chấm bài (**GradingJob**), xem log lỗi hệ thống, cấu hình tham số Sandbox.

4. **External System Actors:**
   - **Docker Sandbox Service:** Tiến trình container cô lập thực thi và bắt stdout/stderr của code.
   - **AI Providers (OpenAI / Gemini API):** Cung cấp dịch vụ mô hình ngôn ngữ chấm bài và giải thích lỗi.
   - **GitHub / GitLab API:** Cung cấp dữ liệu commit, branch, pull request của sinh viên.

---

## 2. ĐẶC TẢ YÊU CẦU HỆ THỐNG

### 2.1. Yêu cầu Chức năng (Functional Requirements - FRs)

- **FR1: Quản lý Định danh & Xác thực (IAM)**
  - Đăng ký, đăng nhập bằng Email/Password hoặc Google OAuth FPT.
  - Cấp phát JWT (Access Token + Refresh Token).
  - Phân quyền theo Role-Based Access Control (RBAC: Admin, Lecturer, Student).
- **FR2: Quản lý Khóa học & Nhóm (Course & Team Management)**
  - Giảng viên tạo lớp học, nhập danh sách sinh viên qua Excel/CSV.
  - Tạo nhóm bài tập (Team) và liên kết với URL kho mã nguồn Git của nhóm.
- **FR3: Quản lý Bài tập, Test Cases, Rubrics & Kho Tri thức RAG**
  - Tạo bài tập với deadline, điểm tối đa, phân loại bài tập cá nhân / nhóm.
  - Cấu hình danh sách `TestCase` gồm: Input, Expected Output, Time Limit, Memory Limit, Điểm từng test, **Ý đồ kiểm thử (`rationale`: test biên, test rỗng, test hiệu năng)** và **Phân loại test (`test_type`)**.
  - Cấu hình bộ `RubricRule` (Tên tiêu chí, trọng số %, hướng dẫn prompt cho AI).
  - **Kho tri thức RAG (`assignment_solutions`):** Giảng viên tải lên Đáp án mẫu chuẩn (Model Solution), Giải thích thuật toán (Solution Notes), độ phức tạp mong đợi ($O(n \log n)$, $O(1)$) để lập chỉ mục vào Vector DB (ChromaDB).
- **FR4: Tiếp nhận & Quản lý Bài nộp (Submission Processing)**
  - Sinh viên nộp qua tải lên file ZIP mã nguồn hoặc gửi Git Commit Hash.
  - Trích xuất file, giải nén và validate định dạng file, cấu trúc thư mục bài nộp.
  - Đẩy bài nộp vào hàng đợi chấm bài `GradingJob` với độ ưu tiên (`priority`).
- **FR5: Thực thi Mã nguồn trong Docker Sandbox**
  - Khởi tạo container Docker tương ứng với ngôn ngữ lập trình của bài nộp.
  - Cô lập hoàn toàn network (`--network none`), áp đặt giới hạn bộ nhớ (RAM limit) và thời gian thực thi (timeout limit).
  - Chạy từng test case, ghi nhận kết quả: Pass / Fail / Time Limit Exceeded (TLE) / Memory Limit Exceeded (MLE) / Runtime Error.
- **FR6: Chấm điểm Ngữ nghĩa & Đánh giá Thuật toán bằng RAG AI (AI Semantic Assessment)**
  - Trích xuất mã nguồn bài nộp và kết quả thực thi Sandbox (các testcases bị Fail/TLE/MLE).
  - **RAG Vector Search:** Tự động truy xuất Đáp án mẫu và Ý đồ của các testcase bị lỗi từ Vector DB.
  - Áp dụng `PromptBuilder` kết hợp với `RubricRule` + Ngữ cảnh RAG đã truy xuất.
  - Lấy API Key từ bảng `AiApiKey` qua cơ chế xoay vòng (Round-Robin/Least-Used).
  - Gửi yêu cầu đến LLM, nhận về JSON chứa: Điểm từng tiêu chí Rubric, phân tích sai lệch thuật toán so với barem đáp án, trừ điểm có căn cứ rõ ràng.
- **FR7: Trợ giảng AI Sư phạm với RAG (AI Socratic Tutor)**
  - Giao diện trò chuyện trực tiếp bên cạnh màn hình chi tiết bài nộp và bảng kết quả testcase.
  - Khi sinh viên hỏi về testcase bị sai, RAG nạp ngữ cảnh giải thích ý đồ testcase và phương pháp giải chuẩn của đề bài.
  - Giới hạn quy tắc sư phạm (Socratic method): **AI dùng đáp án mẫu làm căn cứ để bắt bệnh logic, chỉ ra điểm nghẽn (bottleneck) và gợi ý hướng tư duy sửa lỗi, tuyệt đối không đưa code giải hộ.**
- **FR8: Đo lường Đóng góp qua Git API (Git Analytics & Anti-Free-Riding)**
  - Thu thập lịch sử commit từ Git API theo repository URL của nhóm.
  - Tính toán các chỉ số: Số lượng commit, dòng code thêm/xóa (LOC additions/deletions), timeline đóng góp của từng sinh viên.
  - Cảnh báo thành viên có mức độ đóng góp lệch chuẩn bất thường.

### 2.2. Yêu cầu Phi chức năng (Non-Functional Requirements - NFRs)

- **NFR1 - Bảo mật (Security):**
  - Tuyệt đối không cho phép code của sinh viên truy cập file hệ thống của máy chủ hoặc gọi API ra ngoài internet (ngăn chặn fork-bomb, socket scan, file leak).
  - Khóa API LLM được mã hóa và ẩn hoàn toàn phía backend, không để lộ ra client.
- **NFR2 - Hiệu năng & Khả năng mở rộng (Performance & Scalability):**
  - Sử dụng hàng đợi Redis Queue (BullMQ) để xử lý bất đồng bộ các `GradingJob`.
  - Hỗ trợ xử lý ít nhất 50 bài nộp đồng thời mà không làm sập API Server chính.
  - Thời gian phản hồi API chuẩn < 300ms (ngoại trừ thời gian đợi sandbox và LLM).
- **NFR3 - Độ tin cậy (Reliability):**
  - Cơ chế tự động retry đối với các job AI thất bại do rate-limit (tối đa 3 lần với exponential backoff).
  - Hệ thống ghi log chi tiết lỗi cho từng `GradingJob`.
- **NFR4 - Trải nghiệm người dùng (Usability):**
  - Giao diện Web Next.js hiện đại, cập nhật trạng thái chấm bài thời gian thực (Real-time polling hoặc SSE).
  - Hiển thị cú pháp code (Syntax highlighting), diff code trực quan.

---

## 3. ĐẶC TẢ CÁC USE CASE QUAN TRỌNG NHẤT (USE CASE SPECIFICATIONS)

### 3.1. Danh sách Use Cases Tổng quát
- **Nhóm 1 - Xác thực & Quản trị:**
  - UC01: Đăng nhập / Đăng ký / Đổi mật khẩu
  - UC02: Quản lý người dùng & phân quyền (Admin)
  - UC03: Quản lý kho AI API Keys & giám sát Quota (Admin)
- **Nhóm 2 - Quản lý Đào tạo:**
  - UC04: Tạo và quản lý Khóa học / Lớp học (Lecturer)
  - UC05: Tạo và quản lý Bài tập (Lecturer)
  - UC06: Cấu hình Test Cases & Rubric Rules (Lecturer)
- **Nhóm 3 - Nộp bài & Đánh giá:**
  - UC07: Nộp bài tập lập trình (Student)
  - UC08: Xử lý hàng đợi chấm bài `GradingJob` (System - Background Worker)
  - UC09: Chạy kiểm thử trong Docker Sandbox (System)
  - UC10: Đánh giá mã nguồn ngữ nghĩa bằng AI (System)
  - UC11: Xem kết quả & Báo cáo chấm bài (Student, Lecturer)
- **Nhóm 4 - Tương tác & Phân tích:**
  - UC12: Hỏi đáp trợ giảng AI Tutor về bài nộp (Student)
  - UC13: Xem Dashboard phân tích đóng góp Git nhóm (Lecturer, Student)

---

### 3.2. Đặc tả Chi tiết 3 Use Case Trọng Tâm

#### USE CASE UC07: Nộp bài tập lập trình
- **Actor chính:** Student
- **Tiền điều kiện (Pre-conditions):** Sinh viên đã đăng nhập và đang trong thời hạn cho phép nộp bài (`now <= deadline`).
- **Luồng sự kiện chính (Main Flow):**
  1. Sinh viên truy cập trang chi tiết bài tập trên Web Next.js.
  2. Hệ thống hiển thị thông tin bài tập, danh sách test case mẫu và bảng tiêu chí Rubric.
  3. Sinh viên chọn phương thức nộp:
     - Cách A: Tải lên file ZIP chứa source code.
     - Cách B: Nhập link Git Repository và Commit Hash.
  4. Sinh viên nhấn nút "Submit Assignment".
  5. Backend Express.js tiếp nhận request:
     - Kiểm tra tính hợp lệ của file / git repo.
     - Tạo bản ghi mới trong bảng `submissions` với trạng thái `PENDING`.
     - Tạo bản ghi `grading_jobs` với mức ưu tiên `priority = 2` (Medium).
     - Đẩy job vào hàng đợi Redis Queue (BullMQ).
  6. Hệ thống trả về `submissionId` và điều hướng sinh viên sang trang theo dõi tiến độ chấm bài trực tiếp.
- **Hậu điều kiện (Post-conditions):** Bài nộp được ghi nhận, một job chấm bài mới được đưa vào queue chờ xử lý.

---

#### USE CASE UC08: Xử lý Hàng đợi & Chấm bài tự động (E2E Core Flow)
- **Actor chính:** System (Background Worker / Redis Queue)
- **Tiền điều kiện:** Có ít nhất một `GradingJob` ở trạng thái `QUEUED` trong hàng đợi.
- **Luồng sự kiện chính (Main Flow):**
  1. Worker lấy `GradingJob` có độ ưu tiên cao nhất ra khỏi hàng đợi.
  2. Cập nhật trạng thái `grading_jobs.status = RUNNING_SANDBOX`.
  3. Worker gọi **Docker Sandbox Engine**:
     - Gắn thư mục mã nguồn bài nộp vào Docker Container tương ứng (chạy ở chế độ isolated).
     - Biên dịch code (nếu là Java, C#, C++).
     - Duyệt qua từng `TestCase`: nạp input, bắt output, đo thời gian chạy và dung lượng RAM.
     - Lưu kết quả từng test vào bảng `submission_test_results`.
  4. Nếu code vượt qua bước biên dịch:
     - Cập nhật trạng thái `grading_jobs.status = RUNNING_AI`.
     - **RAG Retrieval:** Tìm kiếm các testcases bị FAILED/TLE/MLE $\to$ Lấy ý đồ testcase (`rationale`) và đoạn code đáp án chuẩn tương ứng từ Vector DB.
     - Gọi **AI PromptTemplate Engine**: Lắp ráp mã nguồn + tiêu chí `RubricRule` + Ngữ cảnh RAG thành prompt chuẩn.
     - Lấy một API key khả dụng từ bảng `AiApiKey` (qua thuật toán Round-Robin).
     - Gửi prompt đến LLM API (OpenAI / Gemini).
     - Parse JSON kết quả trả về từ LLM (gồm điểm thành phần, lỗi logic, gợi ý sửa), lưu vào bảng `ai_grading_results`.
  5. **Tính toán Tổng Điểm (Composite Final Score):**
     - $\text{Final Score} = \text{Điểm Testcase Sandbox} + \text{Điểm AI Rubric (đối chiếu RAG)}$.
  6. Cập nhật trạng thái `submissions.total_score`, `submissions.status = GRADED` và `grading_jobs.status = COMPLETED`.
  7. Bắn thông báo thời gian thực về Frontend Next.js để cập nhật giao diện người dùng.
- **Luồng ngoại lệ (Alternative / Error Flow):**
  - *Nếu Sandbox lỗi / Runtime Exception:* Lưu chi tiết log lỗi vào `grading_jobs.error_log`, đánh dấu test case thất bại.
  - *Nếu LLM API bị quá tải / Rate-limit:* Tự động tăng `retry_count`, chuyển sang `AiApiKey` kế tiếp và đẩy job lại vào queue với độ ưu tiên cao.

---

#### USE CASE UC12: Hỏi đáp Trợ giảng AI Tutor với Ngữ cảnh RAG
- **Actor chính:** Student
- **Tiền điều kiện:** Bài tập đã được chấm xong ít nhất 1 lần và sinh viên có thắc mắc về lỗi hoặc nhận xét của AI.
- **Luồng sự kiện chính:**
  1. Sinh viên mở tab "AI Tutor" tại trang kết quả bài nộp trên Next.js.
  2. Sinh viên nhập câu hỏi (ví dụ: *"Tại sao bài của em bị lỗi Time Limit Exceeded ở test case số 4?"*).
  3. Frontend gửi request đến Express.js: kèm `submissionId` và nội dung câu hỏi.
  4. Backend kích hoạt **RAG Pipeline**:
     - Truy xuất Ý đồ Testcase số 4: *"Kiểm tra 100,000 phần tử, yêu cầu độ phức tạp O(n log n)"*.
     - Truy xuất Solution Notes của giảng viên về cách tối ưu cho hàm bị lỗi.
     - Nạp System Prompt AI Tutor với nguyên tắc Socratic:
       - Giải thích nguyên nhân (ví dụ: 2 vòng for lồng nhau làm thời gian chạy > 2000ms).
       - Định hướng phương pháp tối ưu; **tuyệt đối không đưa ra code giải hoàn chỉnh**.
  5. Backend gọi LLM API và stream câu trả lời về cho sinh viên.
  6. Bản ghi hội thoại được lưu vào bảng `ai_tutor_messages` để xem lại lịch sử.

---

## 4. CƠ CHẾ TÍNH ĐIỂM & BÁO CÁO KẾT QUẢ (SCORING & REPORTING)

Màn hình chi tiết bài nộp của sinh viên (`/submissions/:id`) xuất ra báo cáo 3 khối thông tin:

1. **Khối 1 - Score Overview:**
   - Điểm tổng kết: Thang 10 (gồm Điểm Sandbox Thực thi + Điểm AI Rubric Ngữ nghĩa).
   - Xếp loại: Xuất sắc / Giỏi / Khá / Đạt / Chưa đạt.
2. **Khối 2 - Sandbox Execution Table:**
   - Danh sách từng testcase kèm: Loại test (Cơ bản / Biên / Hiệu năng), Ý đồ kiểm thử từ RAG, Thời gian chạy (ms), Bộ nhớ (KB), Trạng thái (PASS / FAIL / TLE) và Điểm đạt được.
3. **Khối 3 - RAG Insights & AI Tutor Feedback:**
   - Phân tích bóc tách các điểm trừ: Chỉ rõ dòng code gây lỗi, nguyên nhân so với barem đáp án mẫu, và gợi ý thuật toán cải thiện.
