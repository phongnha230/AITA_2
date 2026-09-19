# KẾ HOẠCH PHÂN CHIA BACKEND CHO NHÓM 6 THÀNH VIÊN (CHẤM ZIP BÀI THI PE)
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design  
**Đặc tả:** Phân chia 100% Backend Express.js / TypeScript theo chuẩn Clean Architecture, **loại bỏ GitHub API**, tập trung chuyên sâu vào luồng nộp và chấm tự động file ZIP bài thi PE (C & Java).

---

## 1. NGUYÊN TẮC BẢO ĐẢM KHÔNG XUNG ĐỘT CODE (ZERO-CONFLICT PROTOCOL)

1. **Nguyên tắc "Mỗi người một phân hệ (Folder Ownership)":** Mỗi thành viên chỉ tạo, chỉnh sửa code trong các thư mục được phân công bên dưới.
2. **Giao tiếp qua Hợp đồng Interface (Domain Interfaces):** Các module không import trực tiếp class của nhau mà tương tác thông qua Interface trừu tượng. Từng thành viên có thể tự mock dữ liệu để viết Unit Test độc lập.
3. **Phân tách Tuyến đường Route (Decoupled Routing):** Mỗi thành viên sở hữu 1 file route riêng (ví dụ: `auth.route.ts`, `submission.route.ts`, `assignment.route.ts`). File `app.ts` chỉ cần đăng ký các route này một lần duy nhất.

---

## 2. MA TRẬN PHÂN CHIA 6 MẮT XÍCH BACKEND

```
[TV1: Auth & RBAC] ──► [TV2: Đề thi & Testcases] ──► [TV3: Upload ZIP & Giải nén, Lọc rác]
                                                                     │
                                                                     ▼
[TV6: RAG & AI Tutor] ◄── [TV5: Docker Sandbox C/Java] ◄── [TV4: Redis Queue Điều Phối]
```

---

### 🧑‍💻 THÀNH VIÊN 1: Module IAM, Authentication & Authorization
* **Trách nhiệm:** Quản lý tài khoản người dùng, phân quyền RBAC và bảo vệ các API endpoint.
* **Input:** `email`, `password`, JWT Token.
* **Output:** JWT Token (Access & Refresh), AuthMiddleware xác thực.
* **Danh sách file phụ trách:**
  - `src/application/use-cases/auth/`
    - `login.use-case.ts`
    - `register.use-case.ts`
    - `refresh-token.use-case.ts`
  - `src/presentation/middlewares/auth.middleware.ts` (hàm `verifyToken`, `requireRole('LECTURER')`, `requireRole('ADMIN')`)
  - `src/presentation/controllers/auth.controller.ts`
  - `src/presentation/routes/auth.route.ts`
* **Cam kết độc lập:** Không ai được sửa code trong thư mục `auth/` và file `auth.middleware.ts`. Các thành viên khác chỉ import `authMiddleware` vào router của mình.

---

### 🧑‍💻 THÀNH VIÊN 2: Module Course, Exam & Test Case Management
* **Trách nhiệm:** Cung cấp toàn bộ API CRUD Khóa học, Đề thi PE, bộ Test Cases và tiêu chí Rubric cho Giảng viên.
* **Input:** Dữ liệu đề thi, danh sách testcase (I/O, time limit, tag ý đồ `rationale`), tiêu chí chấm `rubric_rules`.
* **Output:** Dữ liệu Master được lưu vào MySQL; cung cấp query cho Sandbox và AI Grader.
* **Danh sách file phụ trách:**
  - `src/application/use-cases/assignments/`
    - `create-assignment.use-case.ts`, `update-assignment.use-case.ts`, `get-assignment-detail.use-case.ts`
    - `manage-testcases.use-case.ts` (thêm/sửa testcase kèm trường `rationale`, `test_type`)
    - `manage-rubrics.use-case.ts`
  - `src/application/use-cases/courses/` (CRUD lớp học, môn học)
  - `src/presentation/controllers/assignment.controller.ts`, `course.controller.ts`
  - `src/presentation/routes/assignment.route.ts`, `course.route.ts`
* **Cam kết độc lập:** Module quản trị thuần túy, thao tác trực tiếp với Prisma Client, không phụ thuộc vào Docker hay Redis.

---

### 🧑‍💻 THÀNH VIÊN 3: Module ZIP Ingestion, Artifact Extraction & Workspace Staging
* **Trách nhiệm:** Nhận file nén bài nộp `.zip`, giải nén, khử sạch file rác hệ điều hành và chuẩn bị thư mục mã nguồn sạch trên ổ cứng.
* **Input:** File `.zip` từ request `multipart/form-data` của sinh viên.
* **Output:** Tạo bản ghi `submissions` (Status: `PENDING`), trả về đường dẫn thư mục mã nguồn sạch (`stagedFolderPath`) trên server.
* **Danh sách file phụ trách:**
  - `src/infrastructure/storage/multer.config.ts` (cấu hình nhận file zip, chặn file rác hoặc vượt quá 50MB)
  - `src/infrastructure/storage/zip-extractor.service.ts`:
    - Giải nén file `.zip`.
    - **Lọc sạch file rác hệ điều hành:** Xóa sạch thư mục `__MACOSX`, file ẩn `.DS_Store`, file tạm `Thumbs.db`.
    - **Nhận diện cấu trúc bài thi:** Tự động phát hiện xem bài nộp là mã nguồn C (file `.c` đơn lẻ) hay bài Java (có các thư mục con `Q1`, `Q2`, `Q3`, `Q4`).
  - `src/infrastructure/storage/workspace.service.ts` (tạo thư mục tạm thời gian thực theo mã bài nộp, dọn dẹp xóa thư mục sau khi chấm xong).
  - `src/presentation/controllers/submission.controller.ts` (API nộp bài)
  - `src/presentation/routes/submission.route.ts`
* **Cam kết độc lập:** Bạn này chỉ làm việc với File I/O và ổ cứng, không cần quan tâm container Docker bên trong chạy thế nào.
* **⚠️ Lưu ý kỹ thuật sống còn (TV 3):**
  - *Lọc sạch rác:* Bắt buộc đệ quy xóa toàn bộ thư mục `__MACOSX`, file `.DS_Store`, file `Thumbs.db`. Nếu không lọc sạch, lệnh `javac` của TV5 sẽ bị lỗi tìm file rác.
  - *Nhận diện cây thư mục:* Phải tự phát hiện 2 cấu trúc:
    - Nếu là **PRF192**: Thường chỉ có 1 file `.c` đơn lẻ $\rightarrow$ copy vào thư mục gốc của staging.
    - Nếu là **PRO192 & CSD201**: Bài nộp có các thư mục con `Q1`, `Q2`, `Q3`, `Q4` $\rightarrow$ giữ nguyên cấu trúc này để TV5 mount vào container.

---

### 🧑‍💻 THÀNH VIÊN 4: Module Redis Queue & Job Lifecycle Coordinator (BullMQ)
* **Trách nhiệm:** "Nhạc trưởng" điều phối hàng đợi chấm bài bất đồng bộ, quản lý vòng đời của `GradingJob`, gọi lần lượt Sandbox $\rightarrow$ AI $\rightarrow$ Lưu điểm.
* **Input:** `submissionId` và `stagedFolderPath` từ Thành viên 3.
* **Output:** Cập nhật trạng thái `grading_jobs` (`QUEUED` $\rightarrow$ `RUNNING_SANDBOX` $\rightarrow$ `RUNNING_AI` $\rightarrow$ `COMPLETED`), cung cấp API xem tiến độ.
* **Danh sách file phụ trách:**
  - `src/infrastructure/queue/bullmq.queue.ts` (cấu hình queue với cơ chế ưu tiên `priority`)
  - `src/infrastructure/queue/bullmq.worker.ts`:
    - Worker lấy job từ Redis $\rightarrow$ Gọi Sandbox Runner (TV5) $\rightarrow$ Lấy kết quả gọi RAG AI (TV6) $\rightarrow$ Tính tổng điểm lưu MySQL.
    - Xử lý cơ chế retry tự động khi gặp sự cố (tối đa 3 lần với exponential backoff).
  - `src/presentation/controllers/job.controller.ts` (API kiểm tra tiến độ: `GET /api/v1/jobs/:id/status`)
  - `src/presentation/routes/job.route.ts`
* **Cam kết độc lập:** Đóng vai trò nhạc trưởng điều phối, kết nối các module của TV3, TV5, TV6 qua các hàm Interface.
* **⚠️ Lưu ý kỹ thuật sống còn (TV 4):**
  - *Thứ tự điều phối tuần tự:* Nhận `stagedFolderPath` từ TV3 $\rightarrow$ Chuyển cho TV5 (Sandbox) $\rightarrow$ Nhận danh sách testcase bị FAIL/TLE/MLE $\rightarrow$ Chuyển cho TV6 (RAG AI) $\rightarrow$ Nhận điểm Rubric $\rightarrow$ Tính tổng điểm $\rightarrow$ Cập nhật `submissions.status = GRADED`.
  - *Cơ chế Timeout toàn Job:* Giới hạn thời gian xử lý toàn bộ 1 job tối đa 30 giây để tránh làm nghẽn các bài nộp phía sau trong hàng đợi Redis.

---

### 🧑‍💻 THÀNH VIÊN 5: Module Docker Sandbox Engine (Thực Thi C & Java Cô Lập)
* **Trách nhiệm:** Nhận thư mục code sạch từ TV3 + testcases từ TV2, khởi tạo container Docker, biên dịch và chạy kiểm thử an toàn, bắt output và so khớp.
* **Input:** `stagedFolderPath` + Mảng Testcases (Input, Expected Output, Timeout).
* **Output:** Kết quả thực thi JSON: `{ passedTests: 3, failedTests: 2, compileError: null, details: [...] }`.
* **Danh sách file phụ trách:**
  - `src/infrastructure/sandbox/sandbox-runner.factory.ts` (Factory Pattern: chọn C runner hay Java runner)
  - `src/infrastructure/sandbox/runners/c-docker.runner.ts`:
    - Khởi tạo container Docker `gcc:alpine`, mount mã nguồn, biên dịch `gcc`.
    - Bơm input qua stdin, hứng stdout, kiểm tra timeout 2s (chống vòng lặp vô tận `while(1)`).
  - `src/infrastructure/sandbox/runners/java-docker.runner.ts`:
    - Khởi tạo container Docker `openjdk:17-alpine`, biên dịch `javac`.
    - Hỗ trợ cơ chế File I/O chuẩn FPT: đọc file `data.txt` và so khớp kết quả file `f1.txt, f2.txt` (cho PRO192 & CSD201).
  - `src/infrastructure/sandbox/comparator/output-comparator.ts` (chuẩn hóa khoảng trắng, xóa bỏ `\r\n` vs `\n`, tính toán diff).
  - Thư mục Dockerfile: `docker/gcc/Dockerfile`, `docker/java/Dockerfile`.
* **Cam kết độc lập:** Có thể tự code và test bằng các đoạn code C/Java mẫu độc lập trên máy tính mà không cần chạy server web!
* **⚠️ Lưu ý kỹ thuật sống còn cho 3 môn học (TV 5):**
  - **Môn PRF192 (C):**
    - Lệnh compile: `gcc -O2 main.c -o main.out`. Nếu lỗi $\rightarrow$ Báo `COMPILE_ERROR` (0 điểm ngay).
    - Lệnh run: `./main.out < input.txt > actual_output.txt`. Bắt buộc dùng cgroups giới hạn 256MB RAM và timeout 2s (chống `while(1)`).
    - So sánh: Chuẩn hóa trim dấu cách cuối dòng, đổi `\r\n` thành `\n`.
  - **Môn PRO192 (Java OOP):**
    - Lệnh compile: `javac -encoding UTF-8 -d ./bin $(find ./src -name "*.java")`.
    - Chạy file `Main.java` có sẵn menu bằng cách bơm số lựa chọn vào stdin (ví dụ: gửi `1\n` để test hàm `f1()`, gửi `2\n` để test hàm `f2()`).
    - Bắt các ngoại lệ runtime: `NullPointerException`, `ClassCastException`.
  - **Môn CSD201 (Java DSA - ĐẶC THÙ FILE I/O):**
    - Sandbox nạp file `data.txt` vào thư mục chạy của container.
    - Code sinh viên bắt buộc phải **tạo và ghi kết quả ra các file `f1.txt`, `f2.txt`, `f3.txt`**.
    - Sandbox thực hiện so khớp **File-to-File Diff**: So sánh nội dung file `f1.txt` sinh viên tạo ra với file `f1_expected.txt` của đề thi. Báo lỗi `FILE_NOT_FOUND` nếu sinh viên quên code lệnh ghi file.
    - Bắt lỗi `StackOverflowError` khi sinh viên bị đệ quy vô tận trên cây AVL/BST.

---

### 🧑‍💻 THÀNH VIÊN 6: Module RAG Engine, AI Semantic Grader & Socratic Tutor
* **Trách nhiệm:** Quản lý kho Đáp án mẫu trên Vector DB, truy xuất ý đồ testcase bị lỗi, gọi LLM chấm điểm Rubric và cung cấp API Chatbot gia sư.
* **Input:** Mã nguồn sinh viên + Danh sách testcase bị Fail từ TV5.
* **Output:** Điểm Rubric chi tiết + Phân tích lỗi logic + API Chatbot giải đáp.
* **Danh sách file phụ trách:**
  - `src/infrastructure/ai/chroma.client.ts` (kết nối ChromaDB)
  - `src/infrastructure/ai/rag-knowledge.facade.ts`:
    - Lập chỉ mục Đáp án mẫu (`assignment_solutions`) và Ý đồ Testcase vào Vector DB.
    - Hàm truy xuất ngữ cảnh đáp án của các testcase bị lỗi (`getSolutionContext`).
  - `src/infrastructure/ai/api-key-rotator.facade.ts` (thuật toán Round-robin xoay vòng API key chống rate-limit 429).
  - `src/infrastructure/ai/prompt-template.builder.ts` (lắp ráp prompt gửi LLM).
  - `src/application/use-cases/ai/` (`grade-semantic-rag.use-case.ts`, `ask-ai-tutor.use-case.ts`)
  - `src/presentation/controllers/ai-tutor.controller.ts`
  - `src/presentation/routes/ai-tutor.route.ts`
* **Cam kết độc lập:** Toàn bộ công nghệ AI (ChromaDB, Gemini/OpenAI API, Prompt, Chatbot) nằm trọn trong module này.
* **⚠️ Lưu ý kỹ thuật sống còn (TV 6):**
  - *Không gọi AI toàn bài:* **CHỈ KÍCH HOẠT RAG AI CHO CÁC TESTCASE BỊ FAIL/TLE/MLE** từ TV5 để tiết kiệm token và tăng tốc độ chấm bài.
  - *Bóc tách đúng nguyên nhân nhờ RAG:* Khi testcase 4 bị TLE $\rightarrow$ RAG kéo barem yêu cầu $O(n \log n)$ $\rightarrow$ AI soi code sinh viên thấy 2 vòng for lồng nhau $O(n^2)$ $\rightarrow$ Chỉ rõ vị trí nghẽn thuật toán.
  - *Công thức tính điểm:* $\text{Final Score} = \text{Điểm Sandbox (max 7.0)} + \text{Điểm AI Rubric (max 3.0)}$.
  - *Nguyên tắc Socratic:* AI Chatbot giải thích nguyên nhân và định hướng tư duy, **tuyệt đối không nhả code giải bài hộ sinh viên**.

---

## 3. BẢNG TỔNG HỢP LUỒNG DỮ LIỆU LIÊN THÔNG GIỮA 6 NGƯỜI

| Thành viên | Nhận dữ liệu từ đâu? | Xử lý nghiệp vụ gì? | Trả kết quả cho ai? |
| :---: | :--- | :--- | :--- |
| **TV 1** | Request đăng nhập/đăng ký | Cấp JWT Token, mã hóa mật khẩu | Trả Token cho Client; Cung cấp AuthMiddleware cho TV 2,3,4,6 |
| **TV 2** | Giảng viên tạo đề thi | Lưu trữ Course, Assignment, Testcase (kèm rationale) | Lưu MySQL; Cung cấp dữ liệu đề thi cho TV 4, 5, 6 |
| **TV 3** | File `.zip` sinh viên nộp | Giải nén, lọc sạch rác `__MACOSX`, chia thư mục sạch | Bàn giao đường dẫn `stagedFolderPath` cho TV 4 điều phối |
| **TV 4** | TV 3 báo có bài mới | Đẩy job vào Redis BullMQ, làm nhạc trưởng gọi TV 5 & 6 | Cập nhật tiến độ `GradingJob` lên MySQL để client theo dõi |
| **TV 5** | Nhận `stagedFolderPath` & Testcases | Bật Docker Sandbox (GCC/JDK), chạy cô lập, đo RAM/Time | Trả kết quả JSON Pass/Fail testcase cho TV 4 |
| **TV 6** | Nhận code sinh viên & Testcase fail | Tìm đáp án mẫu trong ChromaDB, gọi LLM chấm Rubric | Trả bảng điểm Rubric & phục vụ API Chatbot AI Tutor |

---

## 4. QUY ĐỊNH PHỐI HỢP TRÊN GIT ĐỂ KHÔNG BAO GIỜ BỊ CONFLICT
1. **Mỗi người 1 nhánh riêng:** Đặt tên nhánh theo cấu trúc: `feat/backend-<tên_module>` (ví dụ: `feat/backend-sandbox`, `feat/backend-rag`).
2. **Quy định về Database Migration:** Chỉ 1 bạn (TV2) đại diện cập nhật file `prisma/schema.prisma` khi có yêu cầu thay đổi bảng. Sau khi TV2 migrate xong và push lên branch `develop`, các bạn khác chỉ việc `git pull` và chạy `npx prisma generate` để nhận kiểu dữ liệu mới.
3. **Quy định về `package.json`:** Nếu cần cài thêm thư viện npm mới, thông báo ngay cho nhóm trưởng để tránh việc nhiều người cùng sửa file `package.json` cùng lúc.
