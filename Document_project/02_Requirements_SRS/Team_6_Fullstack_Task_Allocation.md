# KẾ HOẠCH PHÂN CHIA NHIỆM VỤ FULL-STACK CHO NHÓM 6 THÀNH VIÊN
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design (Đại học FPT)  
**Mô hình:** RBL (Research-Based Learning) – Mỗi thành viên đảm nhận vai trò Full-stack (Frontend + Backend + DB + Tests) cho 01 phân hệ độc lập.

---

## 1. TỔNG QUAN MA TRẬN PHÂN CHIA (FULL-STACK MATRIX)

Hệ thống được xẻ dọc thành 6 phân hệ độc lập (Vertical Slices). Mỗi thành viên phụ trách trọn vẹn từ Database $\rightarrow$ Backend Use Case $\rightarrow$ Frontend UI:

| Thành viên | Tên Phân Hệ (Module) | Phạm vi Backend (Express + Clean Arch) | Phạm vi Frontend (Next.js 14+) |
| :---: | :--- | :--- | :--- |
| **TV 1** | **IAM & System Core** | JWT Auth, RBAC Middleware, User Profile, Quản lý lớp học | Giao diện `/login`, `/register`, Session Store, Axios Token Interceptor |
| **TV 2** | **Course & Assignment** | CRUD Khóa học, Đề thi PE, Test Cases, Barem RubricRules | Giao diện `/courses`, Form Giảng viên tạo đề thi PE, cấu hình Test Cases |
| **TV 3** | **Submission & Queue** | Upload ZIP, Lọc rác macOS/Win, Điều phối Redis BullMQ | Giao diện Dropzone nộp bài, Thanh tiến độ thời gian thực (Progress Bar) |
| **TV 4** | **Docker Sandbox** | Runner GCC/JDK cô lập, Giới hạn RAM/CPU, Đo stdout/stderr | Màn hình Log lỗi biên dịch, Tab kết quả Q1..Q4, Diff Expected/Actual |
| **TV 5** | **RAG AI & Tutor** | ChromaDB, Vector Đáp án mẫu, Chấm Rubric, Socratic Chatbot | Khung chat AI Tutor 24/7, Báo cáo điểm số 3 khối thông tin, Form Đáp án |
| **TV 6** | **Git & Admin Panel** | GitHub API, Thuật toán Anti-Free-Riding, Xoay vòng AiApiKey | Dashboard biểu đồ đóng góp Git, Trang Quản trị `/admin/ai-keys` & `/admin/jobs` |

---

## 2. CHI TIẾT CÔNG VIỆC CỦA TỪNG THÀNH VIÊN

### 🧑‍💻 THÀNH VIÊN 1: Module Identity, Access Management & System Core (IAM)
* **Thư mục Backend phụ trách:**
  - `src/domain/entities/user.entity.ts`, `src/domain/repositories/user.repository.interface.ts`
  - `src/application/use-cases/auth/` (`login.use-case.ts`, `register.use-case.ts`, `refresh-token.use-case.ts`)
  - `src/presentation/controllers/auth.controller.ts`, `src/presentation/middlewares/auth.middleware.ts`
  - *Nghiệp vụ:* Cấp phát JWT Access/Refresh Token, băm mật khẩu Bcrypt, phân quyền RBAC (`ADMIN`, `LECTURER`, `STUDENT`).
* **Thư mục Frontend phụ trách (`src/features/auth/`):**
  - `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
  - `src/features/auth/components/LoginForm.tsx`, `RegisterForm.tsx`
  - `src/stores/useUserStore.ts` (quản lý state đăng nhập), `src/services/http.client.ts` (Interceptor tự động gắn Bearer Token).

---

### 🧑‍💻 THÀNH VIÊN 2: Module Course, Assignment & Test Case Management
* **Thư mục Backend phụ trách:**
  - `src/application/use-cases/courses/`, `src/application/use-cases/assignments/`
  - `src/presentation/controllers/course.controller.ts`, `assignment.controller.ts`
  - *Nghiệp vụ:* 
    - CRUD Khóa học (`courses`), gán sinh viên vào lớp học.
    - CRUD Đề thi PE (`assignments`): hạn nộp, ngôn ngữ cho phép (C, Java).
    - CRUD Test Cases (`test_cases`): Input, Expected Output, giới hạn thời gian (ms), bộ nhớ (MB), gán nhãn `test_type` (Cơ bản, Biên, Hiệu năng) và `rationale` (ý đồ test).
    - CRUD Tiêu chí Rubric (`rubric_rules`): tên, trọng số %, prompt định hướng.
* **Thư mục Frontend phụ trách (`src/features/courses/` & `src/features/assignments/`):**
  - `src/app/(dashboard)/courses/page.tsx`, `src/app/(dashboard)/assignments/[id]/page.tsx`
  - `src/features/courses/components/CourseList.tsx`, `CourseCard.tsx`
  - `src/features/assignments/components/AssignmentForm.tsx`, `TestCaseTableEditor.tsx`, `RubricRuleConfig.tsx`.

---

### 🧑‍💻 THÀNH VIÊN 3: Module Submission Processing & Redis Queue Worker
* **Thư mục Backend phụ trách:**
  - `src/application/use-cases/submissions/` (`submit-assignment.use-case.ts`, `get-submission-status.use-case.ts`)
  - `src/infrastructure/queue/` (`grading.queue.ts`, `grading.worker.ts`)
  - `src/presentation/controllers/submission.controller.ts`
  - *Nghiệp vụ:*
    - Xử lý tải lên file `.zip` bằng Multer (giới hạn 50MB) hoặc nhận link Git commit hash.
    - **Artifact Preprocessor:** Giải nén file zip, tự động khử file rác macOS/Windows (`__MACOSX`, `.DS_Store`), validate cấu trúc file `.c` hoặc thư mục `Q1..Q4` Java.
    - Tạo bản ghi `submissions` và đẩy `grading_jobs` vào hàng đợi **Redis BullMQ** theo độ ưu tiên `priority`.
    - Điều phối Worker lấy job ra xử lý, quản lý retry tối đa 3 lần.
* **Thư mục Frontend phụ trách (`src/features/submissions/`):**
  - `src/app/submissions/[id]/page.tsx`
  - `src/features/submissions/components/ZipUploadDropzone.tsx`, `GitRepoSubmitForm.tsx`
  - `src/features/submissions/components/LiveJobProgressBar.tsx` (hiển thị trạng thái thời gian thực: Queued $\rightarrow$ Sandbox $\rightarrow$ AI $\rightarrow$ Completed qua Polling/SSE).

---

### 🧑‍💻 THÀNH VIÊN 4: Module Docker Sandbox Execution Engine
* **Thư mục Backend phụ trách:**
  - `src/infrastructure/sandbox/` (`sandbox-runner.factory.ts`, `c-docker.runner.ts`, `java-docker.runner.ts`)
  - *Nghiệp vụ (Áp dụng Factory Method Pattern):*
    - Khởi tạo Docker Container cô lập (`gcc:alpine` cho C, `openjdk:17-alpine` cho Java).
    - Cấu hình an toàn: ngắt mạng ngoài (`--network none`), giới hạn RAM (256MB), giới hạn thời gian (2s).
    - Hỗ trợ cơ chế đọc file `data.txt` và so khớp file output `f1.txt, f2.txt` (cho PRO192 & CSD201).
    - Thu thập stdout/stderr, đo thời gian chạy (ms), bộ nhớ (KB) và lưu vào `submission_test_results`.
* **Thư mục Frontend phụ trách (`src/features/sandbox/`):**
  - `src/features/sandbox/components/TestCaseResultTable.tsx` (hiển thị danh sách testcase Pass/Fail/TLE).
  - `src/features/sandbox/components/CompileErrorViewer.tsx` (hiển thị lỗi biên dịch có syntax highlight).
  - `src/features/sandbox/components/OutputDiffModal.tsx` (so sánh đối chiếu giữa Expected Output và Actual Output theo từng câu Q1..Q4).

---

### 🧑‍💻 THÀNH VIÊN 5: Module RAG Engine, AI Semantic Grader & Socratic Tutor
* **Thư mục Backend phụ trách:**
  - `src/infrastructure/ai/` (`rag-knowledge.facade.ts`, `chroma.client.ts`, `prompt-template.builder.ts`, `api-key-rotator.facade.ts`)
  - `src/application/use-cases/ai/` (`grade-rubric-semantic.use-case.ts`, `ask-ai-tutor.use-case.ts`)
  - *Nghiệp vụ:*
    - Quản lý kho Đáp án mẫu (`assignment_solutions`): Code giải chuẩn của giảng viên, ghi chú thuật toán, độ phức tạp $O(n \log n)$.
    - Tích hợp Vector DB (ChromaDB) để lưu trữ embedding vector của Đáp án và Ý đồ Testcase.
    - Áp dụng **Facade Pattern** lấy ngữ cảnh đáp án khi có testcase fail $\rightarrow$ Ghép vào Prompt gửi LLM.
    - Xoay vòng `AiApiKey` (Round-Robin) chống rate-limit khi gọi Gemini/OpenAI API.
    - Xây dựng API AI Socratic Tutor: Hướng dẫn tư duy, bắt bệnh logic, không đưa code giải hộ.
    - Tính toán tổng điểm: $\text{Final Score} = \text{Sandbox Score} + \text{AI Rubric Score}$.
* **Thư mục Frontend phụ trách (`src/features/ai-tutor/`):**
  - `src/features/ai-tutor/components/AiTutorChatBox.tsx` (widget chat trực tiếp cạnh bài làm).
  - `src/features/ai-tutor/components/ScoreReportOverview.tsx` (Thẻ tổng quan điểm số & xếp loại).
  - `src/features/ai-tutor/components/RagInsightsCard.tsx` (bóc tách nguyên nhân bị trừ điểm, so sánh thuật toán).
  - `src/features/ai-tutor/components/TeacherSolutionUploadModal.tsx` (form giảng viên nạp đáp án mẫu).

---

### 🧑‍💻 THÀNH VIÊN 6: Module Git Analytics, Anti-Free-Riding & Admin Dashboard
* **Thư mục Backend phụ trách:**
  - `src/infrastructure/git/` (`github-octokit.client.ts`, `git-analytics.adapter.ts`)
  - `src/application/use-cases/admin/` (`manage-ai-keys.use-case.ts`, `get-system-queue-stats.use-case.ts`, `analyze-team-contributions.use-case.ts`)
  - `src/presentation/controllers/admin.controller.ts`, `git-analytics.controller.ts`
  - *Nghiệp vụ:*
    - Kết nối GitHub REST API tự động kéo commit history, số dòng code thêm/xóa (`additions`/`deletions`) của từng sinh viên trong nhóm (`git_contributions`).
    - Thuật toán phân tích độ lệch đóng góp để phát hiện và cảnh báo thành viên "ngồi mát ăn bát vàng" (Free-riding).
    - CRUD kho khóa AI (`ai_api_keys`), mã hóa AES-256, reset quota, theo dõi số lượt request.
    - Giám sát hàng đợi `GradingJob` và xuất báo cáo trạng thái hệ thống.
* **Thư mục Frontend phụ trách (`src/features/git-analytics/` & `src/features/admin/`):**
  - `src/app/admin/ai-keys/page.tsx`, `src/app/admin/jobs/page.tsx`
  - `src/features/git-analytics/components/GitContributionChart.tsx` (biểu đồ commit timeline & số dòng code).
  - `src/features/git-analytics/components/TeamWorkloadMatrix.tsx` (bảng phân tích mức độ đồng đều trong nhóm).
  - `src/features/admin/components/AiKeyManagerTable.tsx`, `RedisQueueMonitor.tsx`.

---

## 3. LỘ TRÌNH TRIỂN KHAI 10 TUẦN (SPRINT PHASES)

```
[GIAI ĐOẠN 1: TUẦN 3 - 5 (Foundation & Auth)]
- TV1: Hoàn thiện Auth JWT, RBAC & Giao diện Login/Register.
- TV2: Hoàn thiện CRUD Course, Assignment & Form Giảng viên tạo đề thi.
- TV6: Dựng khung Admin UI & Kết nối GitHub API cơ bản.
                    │
                    ▼
[GIAI ĐOẠN 2: TUẦN 6 - 8 (Core Execution Pipeline)]
- TV3: Nhận file zip, giải nén, lọc rác & đẩy job vào Redis BullMQ.
- TV4: Dựng Docker Sandbox (GCC cho C, JDK cho Java), chạy testcase I/O.
- TV5: Dựng ChromaDB, lập chỉ mục Đáp án mẫu & gọi Gemini API chấm Rubric.
                    │
                    ▼
[GIAI ĐOẠN 3: TUẦN 9 - 10 (Integration & Final Defense)]
- Tích hợp trọn vẹn luồng E2E: Nộp bài -> Sandbox -> RAG AI Review -> Ra Bảng điểm -> AI Chatbot.
- TV6: Bật dashboard cảnh báo Free-riding trên Git.
- Cả 6 bạn rà soát commit cá nhân, chuẩn bị kịch bản Live Debugging trước Hội đồng!
```

---

## 4. QUY TẮC LÀM VIỆC NHÓM (TEAM CONVENTIONS)
1. **Quy tắc Full-Stack:** Không ai làm thuần Frontend hay thuần Backend. Từng thành viên phải nắm rõ luồng dữ liệu từ database lên giao diện của phân hệ mình.
2. **Quy tắc Thư mục:** Mỗi thành viên chỉ làm việc trong `src/features/<tên-feature>/` (Frontend) và các Use Cases tương ứng (Backend). Tuyệt đối không sửa code của phân hệ khác mà không thông báo.
3. **Quy tắc Git:** Mỗi tính năng tạo branch riêng `feature/<tên-feature>`, commit rõ ràng bằng tài khoản GitHub cá nhân để phục vụ chấm điểm **Anti-Free-Riding** cuối kỳ.
