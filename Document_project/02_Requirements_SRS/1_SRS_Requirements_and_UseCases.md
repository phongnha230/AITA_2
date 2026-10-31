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
   - **Docker Sandbox Service:** Tiến trình container cô lập thực thi và bắt stdout/stderr của code C/Java (`gcc:alpine`, `openjdk:17-alpine`).
   - **Playwright Headless Browser Sandbox:** Container Chromium chạy riêng biệt qua egress proxy cô lập, tự động hóa tương tác kiểm thử giao diện và API trên các ứng dụng Web triển khai trên Vercel.
   - **AI Providers (OpenAI / Gemini API):** Cung cấp dịch vụ mô hình ngôn ngữ chấm bài và giải thích lỗi logic.
   - **GitHub / GitLab API & Git Ingestion:** Cung cấp dữ liệu commit, branch, pull request và trích xuất chỉ số đóng góp cá nhân của sinh viên.
   - **Vercel Hosting Platform:** Nền tảng đích chứa ứng dụng Web của sinh viên được kiểm thử tự động.

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
  - Thu thập lịch sử commit từ Git Repository theo URL dự án nhóm.
  - Tính toán các chỉ số: Số lượng commit, dòng code thêm/xóa (LOC additions/deletions), timeline đóng góp của từng thành viên (`git_contributors`).
  - Hệ thống tự động phát hiện và cảnh báo "Free-Rider" (thành viên không có đóng góp hoặc đóng góp lệch chuẩn bất thường), hỗ trợ giảng viên điều chỉnh điểm cá nhân (`participant_score_adjustments`).
- **FR9: Tự động Kiểm thử Ứng dụng Web bằng Playwright Sandbox (Automated Web E2E Testing)**
  - Tiếp nhận URL triển khai thực tế trên Vercel từ sinh viên/nhóm.
  - Khởi tạo container Playwright Headless Chromium chạy qua egress proxy cô lập.
  - Thực thi các bài test tự động: kiểm tra giao diện render, kiểm tra tương tác DOM, response HTTP status code, và chụp screenshot bằng chứng lưu vào hệ thống.
- **FR10: Quản lý Ca thi & Giám thị Trực tiếp (Live Proctoring & Exam Access Control)**
  - Giảng viên cấu hình mã truy cập ca thi (`AssignmentExamAccess`: mật khẩu đề thi, khung giờ mở/đóng ca thi).
  - Sinh viên bắt buộc nhập đúng mã mở đề mới được phép xem đề và bắt đầu làm bài.
  - Màn hình giám thị thời gian thực (`/lecturer/live-proctoring` & `/proctoring/rooms`): Giảng viên theo dõi danh sách sinh viên đang online trong phòng thi, thời gian nộp bài, và trạng thái bài làm trực tiếp.
- **FR11: Hệ thống Lưu vết Đa chặng & Bằng chứng Minh bạch (Multi-Stage Audit Trail & Evidences)**
  - Tách bạch mỗi lượt chấm thành các chuỗi thực thi rõ ràng: `GradingRun` $\to$ `GradingRunStage` (`STAGING`, `SANDBOX_EXECUTION`, `AI_EVALUATION`).
  - Lưu trữ chi tiết `GradingEvidence`: stdout/stderr compiler, file diff, ảnh chụp màn hình Playwright, raw prompt và phản hồi từ LLM, phục vụ phúc khảo minh bạch 100%.

### 2.2. Yêu cầu Phi chức năng (Non-Functional Requirements - NFRs)

- **NFR1 - Bảo mật Đa Tầng (Multi-Tier Security & Anti-SSRF):**
  - **Lá chắn chống SSRF (`deployed-url.validator.ts`):** Phân giải DNS và thẩm định nghiêm ngặt URL Vercel trước khi kích hoạt Playwright. Chặn đứng 100% các dải IP nội bộ RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), địa chỉ Loopback (`127.0.0.1`, `localhost`), Link-local (`169.254.169.254` AWS IMDS metadata) và non-standard ports.
  - **Cô lập Sandbox:** Docker C/Java chạy `--network none`, cgroups giới hạn 256MB RAM và timeout 2s cứng (chống fork-bomb, socket scan, file leak). Playwright chạy trong container riêng biệt kết nối qua egress proxy kiểm soát.
  - **Bảo vệ Hệ thống & API:** Tích hợp `helmet`, `cors` với cơ chế kiểm tra `enforceTrustedOrigin`, rate-limiting đa tầng (`globalLimiter`, `authLimiter`, `submissionLimiter`). Khóa API LLM được mã hóa và lưu tại CSDL backend, không bao giờ lộ về client.
- **NFR2 - Hiệu năng & Khả năng mở rộng (Performance & Scalability):**
  - Sử dụng hàng đợi Redis Queue (BullMQ) để xử lý bất đồng bộ các `GradingJob`.
  - Hỗ trợ xử lý ít nhất 50 bài nộp đồng thời mà không làm sập API Server chính.
  - Thời gian phản hồi API chuẩn < 300ms (ngoại trừ thời gian đợi sandbox và LLM).
- **NFR3 - Độ tin cậy & Khả năng phục hồi (Reliability & Fault Tolerance):**
  - Cơ chế tự động retry đối với các job AI thất bại do rate-limit (tối đa 3 lần với exponential backoff).
  - Thuật toán xoay vòng khóa API (Round-Robin Key Rotator) bảo đảm tính sẵn sàng cao khi một key chạm hạn mức quota.
  - Hệ thống ghi log chi tiết lỗi cho từng `GradingJob` và từng `GradingRunStage`.
- **NFR4 - Trải nghiệm người dùng (Usability):**
  - Giao diện Web Next.js hiện đại, cập nhật trạng thái chấm bài thời gian thực (Real-time polling hoặc SSE).
  - Hiển thị cú pháp code (Syntax highlighting), diff code trực quan, hiển thị bằng chứng ảnh chụp Playwright và chat trợ giảng Socratic trực quan.

---

## 3. ĐẶC TẢ CÁC USE CASE QUAN TRỌNG NHẤT (USE CASE SPECIFICATIONS)

### 3.1. Danh sách Use Cases Tổng quát
- **Nhóm 1 - Xác thực & Quản trị:**
  - UC01: Đăng nhập / Đăng ký / Đổi mật khẩu
  - UC02: Quản lý người dùng & phân quyền RBAC (Admin)
  - UC03: Quản lý kho AI API Keys, giám sát Quota & xoay vòng key (Admin)
- **Nhóm 2 - Quản lý Đào tạo & Ca thi:**
  - UC04: Tạo và quản lý Khóa học / Lớp học (Lecturer)
  - UC05: Tạo và quản lý Bài tập / Đề thi PE (Lecturer)
  - UC06: Cấu hình Test Cases & Rubric Rules (Lecturer)
  - UC07: Cấu hình Ca thi, mã mở khóa & Giám thị trực tiếp (Live Proctoring - Lecturer)
- **Nhóm 3 - Nộp bài & Đánh giá (Dual-Engine):**
  - UC08: Nộp bài thi lập trình PE cá nhân qua file ZIP (Student)
  - UC09: Nộp đồ án nhóm Web qua GitHub Repo & Vercel Deployment URL (Student)
  - UC10: Xử lý hàng đợi chấm bài `GradingJob` & Lưu vết Audit Trail đa chặng (System - Background Worker)
  - UC11: Chạy kiểm thử code C/Java trong Docker Sandbox (System)
  - UC12: Tự động kiểm thử giao diện & API Web qua Playwright Browser Sandbox (System)
  - UC13: Đánh giá mã nguồn ngữ nghĩa bằng AI RAG (System)
  - UC14: Xem kết quả & Báo cáo chấm bài đa chiều (Student, Lecturer)
- **Nhóm 4 - Tương tác & Phân tích Nâng cao:**
  - UC15: Hỏi đáp trợ giảng AI Tutor Socratic với ngữ cảnh RAG (Student)
  - UC16: Dashboard phân tích đóng góp Git & Cảnh báo Free-Rider (Lecturer, Student)

---

### 3.2. Đặc tả Chi tiết 5 Use Case Trọng Tâm

#### USE CASE UC07: Cấu hình Ca thi, Mã mở khóa & Giám thị trực tiếp (Live Proctoring)
- **Actor chính:** Lecturer, Student
- **Tiền điều kiện:** Giảng viên đã tạo đề thi PE và thiết lập ca thi (`AssignmentExamAccess`).
- **Luồng sự kiện chính (Main Flow):**
  1. Giảng viên mở giao diện `/lecturer/live-proctoring`, bật trạng thái kích hoạt ca thi (`status = ACTIVE`), đặt mã truy cập (ví dụ: `PE2026-PRO192`) và thời lượng làm bài.
  2. Sinh viên đăng nhập vào hệ thống, truy cập màn hình `/student/exams`. Đề thi hiển thị trạng thái `LOCKED`.
  3. Sinh viên nhập mã mở khóa do Giám thị cung cấp tại phòng thi.
  4. Backend xác thực mã đối chiếu với `AssignmentExamAccess`: nếu chính xác, sinh viên được cấp quyền truy cập đề thi và WebSocket/SSE kết nối vào phòng thi trực tiếp (`/proctoring/rooms`).
  5. Màn hình Giám thị hiển thị danh sách thí sinh đã kết nối, trạng thái đang làm bài, thời gian còn lại và phát hiện thí sinh nộp bài thời gian thực.

---

#### USE CASE UC08: Nộp bài thi lập trình PE cá nhân qua file ZIP (Engine 1)
- **Actor chính:** Student
- **Tiền điều kiện:** Sinh viên đã mở khóa ca thi và đang trong thời hạn cho phép nộp bài (`now <= deadline`).
- **Luồng sự kiện chính (Main Flow):**
  1. Sinh viên truy cập trang chi tiết bài thi trên Web Next.js.
  2. Sinh viên kéo thả file nén `.zip` chứa source code bài làm (C hoặc Java) vào khung Dropzone.
  3. Sinh viên nhấn nút "Submit Assignment".
  4. Backend Express.js tiếp nhận request qua `multer`:
     - Kiểm tra định dạng zip, kích thước tối đa 50MB.
     - Trích xuất file, lọc sạch rác hệ điều hành (`__MACOSX`, `.DS_Store`, `Thumbs.db`).
     - Tự động nhận diện cấu trúc C (file đơn lẻ) hoặc Java (`Q1..Q4`).
     - Tạo bản ghi mới trong bảng `submissions` (Status: `PENDING`), `grading_jobs` (Priority: 2 - Medium).
     - Đẩy job vào hàng đợi Redis Queue (BullMQ).
  5. Hệ thống trả về `submissionId` và chuyển sang màn hình theo dõi tiến độ thời gian thực.
- **Hậu điều kiện (Post-conditions):** Bài nộp được ghi nhận, một job chấm bài mới được đưa vào queue chờ xử lý.

---

#### USE CASE UC09: Nộp đồ án nhóm Web qua GitHub & Vercel URL (Engine 2)
- **Actor chính:** Student (Đại diện nhóm)
- **Tiền điều kiện:** Nhóm sinh viên đã tạo `Team`, có kho Git Repository chứa code Web và link ứng dụng đã triển khai trên Vercel.
- **Luồng sự kiện chính (Main Flow):**
  1. Sinh viên truy cập màn hình nộp đồ án nhóm trên Next.js.
  2. Sinh viên nhập: Link GitHub Repository (kèm nhánh/commit hash) và Link Vercel Deployment URL.
  3. Sinh viên nhấn nút "Submit Group Project".
  4. Backend Express.js kích hoạt **Lá chắn Bảo mật SSRF (`deployed-url.validator.ts`)**:
     - Phân giải DNS của URL Vercel.
     - Kiểm tra và chặn đứng nếu IP đích nằm trong dải IP nội bộ RFC 1918, localhost, link-local metadata (169.254.169.254).
     - Nếu không an toàn: Từ chối ngay với mã lỗi `400 Bad Request: Disallowed Target Address`.
  5. Nếu URL hợp lệ:
     - Kích hoạt `GitIngestionService`: Clone repo, bóc tách toàn bộ git log commits, thống kê số dòng thêm/xóa của từng bạn, lưu vào `git_contributors`.
     - Tạo bản ghi `submissions` (Loại: `GROUP_PROJECT`), đẩy job vào Redis Queue cho Playwright Runner.
  6. Trả về mã bài nộp và hiển thị sơ bộ bảng đóng góp Git của các thành viên.

---

#### USE CASE UC10: Xử lý Hàng đợi & Chấm bài tự động (Dual-Engine E2E Core Flow)
- **Actor chính:** System (Background Worker / Redis Queue)
- **Tiền điều kiện:** Có ít nhất một `GradingJob` ở trạng thái `QUEUED` trong hàng đợi.
- **Luồng sự kiện chính (Main Flow):**
  1. Worker lấy `GradingJob` ra khỏi hàng đợi Redis BullMQ, khởi tạo chuỗi lưu vết `GradingRun`.
  2. **Stage 1 - STAGING (`GradingRunStage`):** Chuẩn bị không gian làm việc hoặc lấy target metadata.
  3. **Stage 2 - EXECUTION:** Dựa vào loại bài nộp, kích hoạt Runner tương ứng:
     - **Nếu là PE Exam (C/Java):** Gọi Docker Sandbox cô lập (`--network none`, 256MB RAM, timeout 2s cứng). Chạy các testcase, đo thời gian/RAM, bắt stdout/file-diff.
     - **Nếu là Web Project (Vercel):** Gọi Container Playwright Chromium qua egress proxy. Tự động tương tác Web, kiểm tra UI/API, chụp screenshots làm bằng chứng `GradingEvidence`.
  4. **Stage 3 - AI EVALUATION (RAG Semantic Assessment):**
     - Truy xuất Ý đồ Testcase/Rubrics bị Fail từ ChromaDB Vector Store.
     - Lắp ráp Prompt chuẩn qua `PromptBuilder` kết hợp với Barem đáp án mẫu.
     - Lấy API Key qua xoay vòng Round-Robin, gọi LLM (Gemini/OpenAI).
     - Parse JSON kết quả nhận xét và điểm Rubric.
  5. **Tính toán Tổng Điểm & Kết thúc:**
     - Lưu đầy đủ bằng chứng `GradingEvidence` (compiler logs, screenshots, AI rationale).
     - $\text{Final Score} = \text{Điểm Thực thi Sandbox} + \text{Điểm AI Rubric}$.
     - Cập nhật `submissions.status = GRADED`, `grading_jobs.status = COMPLETED`, `GradingRun.status = SUCCESS`.
     - Bắn tín hiệu WebSocket/SSE thông báo cập nhật kết quả lên Frontend.

---

#### USE CASE UC15: Hỏi đáp Trợ giảng AI Tutor với Ngữ cảnh RAG Socratic
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
