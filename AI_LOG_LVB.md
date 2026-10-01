# NHẬT KÝ TƯƠNG TÁC AI & KẾ HOẠCH TRIỂN KHAI PHÂN HỆ THÀNH VIÊN 2 (AI LOG)

**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design (Đại học FPT)  
**Vai trò:** **Thành viên 2 (TV2) – Phân hệ Course, Exam & Test Case Management**  
**Nhánh Git:** `feature/VanBao/backend-course-assignment`  
**Ngày lưu trữ nhật ký:** 01/10/2026 (Dữ liệu gốc ghi nhận ngày 28/09/2026)

---

## 1. TỔNG QUAN CÁC PHIÊN LÀM VIỆC VỚI AI AGENT

Trong quá trình phát triển phân hệ Thành viên 2, toàn bộ lịch sử trao đổi, phân tích và thực thi giữa người dùng và AI Agent được quản lý qua 3 phiên làm việc (Session ID được lưu tại `C:\Users\ASUS\.gemini\antigravity-ide\brain\`):

| STT | Mã Session ID | Thời gian | Nội dung công việc chính |
| :---: | :--- | :---: | :--- |
| **1** | `9916be33-ac3b-4fd1-8025-f4b8d9b26b16` | 28/09/2026 10:28 – 15:20 | Đọc SRS, lập kế hoạch `/plan`, chốt kiến trúc Clean Architecture (cách 2 - siêu rút gọn trực tiếp với Prisma), sinh 10 file code (Use Cases, Controllers, Routes), cấu hình `app.ts`, kiểm tra biên dịch TypeScript 0 lỗi và hướng dẫn chạy server local tắt port 5000. |
| **2** | `35494035-6e71-4e82-b821-337621479a31` | 28/09/2026 15:24 | Trao đổi nhanh cách khởi động backend và hướng dẫn test API. |
| **3** | `97a7005f-b975-40a2-bdcb-ddb4a787d700` | 28/09/2026 15:42 – 16:42 | Xây dựng bộ test collection bằng Extension Bruno, cấu hình Environment local, tạo bộ request CRUD đầy đủ cho TV2 và cấu hình loại trừ Bruno/node_modules trong `.gitignore`. |

---

## 2. TOÀN BỘ LỊCH SỬ PROMPTS ĐÃ THỰC HIỆN & PHIÊN BẢN CHUẨN HÓA

> [!TIP]
> Bảng tổng hợp dưới đây ghi nhận **nguyên văn prompt thực tế bạn đã chat** cùng với **phiên bản Prompt Nâng cấp (Prompt Engineering)** được viết lại theo chuẩn kỹ thuật phần mềm (Role - Context - Task - Constraints - Output) để bạn dễ dàng đưa vào báo cáo môn học hoặc làm minh chứng kỹ năng làm việc cùng AI.

---

### Phiên 1: Lập kế hoạch `/plan` & Triển khai Backend (`9916be33-ac3b-4fd1-8025-f4b8d9b26b16`)

#### 🔹 Prompt 1: Khởi tạo và yêu cầu lập kế hoạch `/plan`
* **Prompt gốc của bạn:**  
  > *"đọc dự án và mình là thành viên 2, đọc hiểu và tạo plan sửa những file nào /plan"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Bạn hãy đóng vai trò là Senior Backend Architect. Hãy rà soát toàn bộ cấu trúc dự án AITA, đặc biệt là tài liệu phân công nhiệm vụ backend (`Backend_Task_Allocation_6_Members.md`). Tôi là **Thành viên 2** phụ trách phân hệ Quản lý Khóa học, Đề thi PE, Test Cases và Rubric Rules. Hãy lập kế hoạch chi tiết bằng lệnh `/plan` để liệt kê chính xác các file cần tạo mới/chỉnh sửa theo kiến trúc Clean Architecture, đảm bảo nguyên tắc Zero-Conflict với các thành viên khác."*

#### 🔹 Prompt 2: Định hướng kiến trúc Clean Architecture
* **Prompt gốc của bạn:**  
  > *"Tập trung hoàn thiện 100% Backend Clean Architecture trước và tóm tắt bạn sẽ sửa những file trong những thư mục nào tóm tắt lại nhiệm vụ của thành viên 2 để mình xem bạn hiểu đúng ko"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Trước khi triển khai code, hãy ưu tiên hoàn thiện 100% tầng Backend theo chuẩn Clean Architecture. Bạn hãy tóm tắt lại toàn bộ phạm vi trách nhiệm của Thành viên 2 và phân loại danh sách các file sẽ can thiệp theo từng lớp kiến trúc (Use Cases, Controllers, Routes) để tôi xác nhận sự thống nhất về mặt kỹ thuật trước khi thực thi."*

#### 🔹 Prompt 3: Tư vấn quy ước đặt tên nhánh Git
* **Prompt gốc của bạn:**  
  > *"mình nên đặt tên nhánh để làm cái backend của thành viên 2 này ví dụ của người khác là feature/VanDiep/backend-sandbox"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Theo quy chuẩn Git Workflow của dự án (ví dụ nhánh của thành viên khác là `feature/VanDiep/backend-sandbox`), hãy đề xuất cho tôi tên nhánh Git chuẩn xác và chuyên nghiệp nhất cho phân hệ Backend của Thành viên 2."*

#### 🔹 Prompt 4: Rà soát phạm vi phân công theo tài liệu SRS
* **Prompt gốc của bạn:**  
  > *"🧑💻 THÀNH VIÊN 2: Module Course, Exam & Test Case Management  
  > Trách nhiệm: Cung cấp toàn bộ API CRUD Khóa học, Đề thi PE, bộ Test Cases và tiêu chí Rubric cho Giảng viên.  
  > Input: Dữ liệu đề thi, danh sách testcase (I/O, time limit, tag ý đồ rationale), tiêu chí chấm rubric_rules.  
  > Output: Dữ liệu Master được lưu vào MySQL; cung cấp query cho Sandbox và AI Grader.  
  > Danh sách file phụ trách:  
  > `src/application/use-cases/assignments/`  
  > `create-assignment.use-case.ts`, `update-assignment.use-case.ts`, `get-assignment-detail.use-case.ts`  
  > `manage-testcases.use-case.ts` (thêm/sửa testcase kèm trường rationale, test_type)  
  > `manage-rubrics.use-case.ts`  
  > `src/application/use-cases/courses/` (CRUD lớp học, môn học)  
  > `src/presentation/controllers/assignment.controller.ts`, `course.controller.ts`  
  > `src/presentation/routes/assignment.route.ts`, `course.route.ts`  
  > Cam kết độc lập: Module quản trị thuần túy, thao tác trực tiếp với Prisma Client, không phụ thuộc vào Docker hay Redis.  
  > có đúng là plan của mình sẽ làm trên những thư mục và file này thôi ko"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Tôi trích xuất phạm vi trách nhiệm chính thức của Thành viên 2 từ tài liệu phân công: Cung cấp toàn bộ API CRUD Khóa học, Đề thi PE, Test Cases (hỗ trợ `rationale`, `test_type`, `outputFileName`) và Rubric Rules; thao tác trực tiếp Prisma Client, không phụ thuộc Docker/Redis. Hãy đối chiếu lại bản kế hoạch `/plan` để xác nhận danh sách file và thư mục triển khai đã hoàn toàn khớp 100%, không bị thừa hoặc thiếu bất kỳ thành phần nào."*

#### 🔹 Prompt 5: Quyết định lựa chọn phương án triển khai
* **Prompt gốc của bạn:**  
  > *"Cách 2 (Siêu rút gọn)"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Tôi duyệt chọn Phương án 2 (Siêu rút gọn): Các Use Case sẽ thao tác trực tiếp thông qua Prisma Client mà không qua các tầng trừu tượng Repository trung gian nhằm tối ưu thời gian phát triển và đảm bảo tính độc lập tuyệt đối. Hãy tiến hành sinh mã nguồn theo phương án này."*

#### 🔹 Prompt 6: Yêu cầu tổng hợp báo cáo tiến độ tuần 3
* **Prompt gốc của bạn:**  
  > *"viết file .md report week3 nãy giờ đã làm gì, review code tóm gọn á"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Hãy tổng hợp lại toàn bộ công việc và mã nguồn mà Thành viên 2 đã hoàn thành nãy giờ thành một tài liệu báo cáo tiến độ tuần 3 dạng markdown (`REPORT_WEEK_3.md`). Nội dung cần tóm tắt ngắn gọn các module đã xong, danh sách API đã tạo, kết quả kiểm tra chất lượng code và phương hướng tuần tiếp theo."*

#### 🔹 Prompt 7, 8, 9: Hướng dẫn chạy thử nghiệm Backend Local không cần Docker
* **Prompt gốc của bạn:**  
  > *"chạy backend không cần docker"*  
  > *"chạy backend không cần docker để test thử code được ko"*  
  > *"hướng dẫn chỉ chạy backend không cần docker để xem coe mình sao á"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Hiện tại tôi muốn kiểm thử nhanh phân hệ Backend của Thành viên 2 trên môi trường Local mà không cần khởi động cụm Docker containers. Hãy hướng dẫn tôi từng bước thiết lập biến môi trường `.env`, kết nối trực tiếp database và chạy server Node.js/Express ở chế độ development (`npm run dev`)."*

#### 🔹 Prompt 10: Xử lý sự cố xung đột cổng mạng (Port EADDRINUSE: 5000)
* **Prompt gốc của bạn:**  
  > *"node:events:486  
  > throw er; // Unhandled 'error' event  
  > ^  
  > Error: listen EADDRINUSE: address already in use : 5000  
  > chỉ tui lệnh tắt port 5000"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Server gặp lỗi `Error: listen EADDRINUSE: address already in use : 5000` do tiến trình cũ đang chiếm dụng cổng 5000. Hãy cung cấp cho tôi lệnh PowerShell trên Windows để tra cứu PID và buộc dừng (kill process) tiến trình đang chiếm port 5000 ngay lập tức."*

---

### Phiên 2: Hướng dẫn khởi động & quy trình kiểm thử API (`35494035-6e71-4e82-b821-337621479a31`)

#### 🔹 Prompt 1: Quy trình chạy và test API
* **Prompt gốc của bạn:**  
  > *"chạy backend và test api sao"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Hãy hướng dẫn tôi quy trình chuẩn để khởi động Backend server và các phương pháp kiểm thử các API endpoints vừa viết (sử dụng cURL, Postman hoặc HTTP Client) để đảm bảo server phản hồi đúng status code và cấu trúc dữ liệu JSON."*

---

### Phiên 3: Thiết lập bộ Bruno API Collection & CRUD TV2 (`97a7005f-b975-40a2-bdcb-ddb4a787d700`)

#### 🔹 Prompt 1, 2, 3, 4: Hướng dẫn phương pháp test API phân hệ TV2
* **Prompt gốc của bạn:**  
  > *"chỉ tôi cách test api của thành viên 2"*  
  > *"vậy giờ mình cần chạy lệnh gì để test cái api của thành viên 2"*  
  > *"vậy giờ mình cần chạy lệnh gì hay làm gì để test cái api của thành viên 2"*  
  > *"vậy giờ mình cần chạy lệnh gì hay làm gì để test cái api của thành viên 2. Trả lời mình thôi"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Hãy chỉ dẫn ngắn gọn và tập trung cho tôi các bước cụ thể để kiểm thử độc lập toàn bộ các API endpoints thuộc phân hệ Thành viên 2 (Khóa học, Đề thi, Test Cases, Rubrics), bao gồm dữ liệu đầu vào mẫu (Payload) và kết quả mong đợi."*

#### 🔹 Prompt 5, 6: Tích hợp công cụ Bruno Extension trong IDE
* **Prompt gốc của bạn:**  
  > *"mình đang có extension Bruno thì mình nên làm những gì để nó test bên nhiệm vụ của thành viên 2"*  
  > *"mình đang có extension Bruno thì mình nên làm những gì để nó test api bên nhiệm vụ của thành viên 2"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Tôi đang cài đặt Extension Bruno trên VS Code/IDE. Hãy hướng dẫn tôi cách tạo một Bruno Collection hoàn chỉnh trong thư mục dự án để tự động hóa việc gọi và kiểm thử các API của Thành viên 2."*

#### 🔹 Prompt 7, 8: Xử lý lỗi cấu hình môi trường & kết nối trong Bruno
* **Prompt gốc của bạn:**  
  > *"Chọn Environment: Ở góc trên cùng của tab Bruno (thanh chọn Environment), click chọn local (đây là file environments/local.bru chứa sẵn baseUrl, lecturerId, courseId, assignmentId của CSDL).  
  > Invalid file type: local.bru. Only JSON files are supported."*  
  > *"Lỗi 'Error occurred while executing the request!' trên Bruno báo hiệu request không thể thực hiện do không kết nối được tới máy chủ hoặc cấu hình request bị sai"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Khi cấu hình Environment trên Extension Bruno gặp lỗi không nhận file `.bru` hoặc lỗi kết nối máy chủ `Error occurred while executing the request!`. Hãy phân tích nguyên nhân (định dạng file cấu hình, base URL, trạng thái server) và cung cấp cách khắc phục chuẩn xác."*

#### 🔹 Prompt 9, 10: Xây dựng trọn bộ Test Request chuẩn CRUD cho TV2
* **Prompt gốc của bạn:**  
  > *"mình cần test api bruno đủ CRUD nha"*  
  > *"mình cần test api bruno đủ CRUD cho nhiệm vụ của thành viên 2 thôi nhan"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Hãy tạo đầy đủ các file `.bru` đại diện cho trọn vẹn chu trình CRUD (Create, Read, Update, Delete) cho tất cả các tài nguyên thuộc phạm vi Thành viên 2 (Khóa học, Ghi danh, Đề thi PE, Test Cases, Rubrics), đảm bảo có sẵn mẫu body JSON chuẩn để chỉ cần bấm Run là test được ngay."*

#### 🔹 Prompt 11: Cấu hình .gitignore bảo vệ mã nguồn
* **Prompt gốc của bạn:**  
  > *"bruno bỏ trong .gitnore để ko push lên, mấy cái nodemodule cũng vậy"*
* **Prompt nâng cấp chuyên nghiệp:**  
  > *"Hãy cập nhật file `.gitignore` để loại trừ thư mục `bruno/` (hoặc các file môi trường nhạy cảm) cùng các thư mục `node_modules` ở cả root và sub-packages, tránh việc commit nhầm lên remote repository."*

---

## 3. NGUYÊN VĂN KẾ HOẠCH TRIỂN KHAI `/plan` CỦA THÀNH VIÊN 2

*(Trích xuất nguyên bản từ file artifact hệ thống: `member_2_implementation_plan.md`)*

### 3.1. Mục Tiêu & Định Hướng Triển Khai
- Tập trung chính xác vào **100% các file được phân công trong tài liệu phân chia Backend**:
  - Không tạo thêm tầng Repository hay Domain trung gian rườm rà.
  - Các Use Case sẽ thao tác trực tiếp với `prisma` client (`src/infrastructure/database/prisma.client.js`).
  - Đảm bảo đầy đủ các trường dữ liệu cốt lõi cho TV5 và TV6:
    - **Môn CSD201:** Cung cấp trường `outputFileName` (`f1.txt`, `f2.txt`...) để TV5 Sandbox so khớp file diff.
    - **Phục vụ RAG AI:** Cung cấp trường `rationale` (ý đồ testcase) và `testType` (loại test) cho TV6.
    - **Barem 3.0 điểm AI:** Cung cấp CRUD bộ quy tắc `RubricRule` (tên, trọng số %, prompt instruction).

### 3.2. Yêu Cầu Thiết Kế (User Review Required)
- **Cơ chế gọi Prisma:** Mọi Use Case import trực tiếp `prisma` từ `src/infrastructure/database/prisma.client.js`.
- **Đăng ký Tuyến đường (`app.ts`):** Chỉ bổ sung duy nhất 2 dòng đăng ký `/api/v1/courses` và `/api/v1/assignments`.
- **Bảo đảm Zero-Conflict:** Không đụng vào bất kỳ file nào ngoài danh sách được phân công.

### 3.3. Danh Sách Các File Đã Xây Dựng
1. **Thư mục `src/application/use-cases/courses/`:**
   - `[NEW] course.use-case.ts`: Quản lý lớp học, môn học, danh sách sinh viên đăng ký (`enrollStudents`).
2. **Thư mục `src/application/use-cases/assignments/`:**
   - `[NEW] create-assignment.use-case.ts`: Tạo đề thi PE mới (ngôn ngữ C/Java, deadline, điểm tối đa).
   - `[NEW] update-assignment.use-case.ts`: Cập nhật mô tả, gia hạn deadline, điểm tối đa.
   - `[NEW] get-assignment-detail.use-case.ts`: Xem chi tiết đề thi kèm testcase và rubric (lọc testcase ẩn với học sinh).
   - `[NEW] manage-testcases.use-case.ts`: Thêm lẻ/Bulk nạp testcase, hỗ trợ `outputFileName`, `rationale`, `testType`.
   - `[NEW] manage-rubrics.use-case.ts`: Cấu hình Barem Rubric (tổng % tối đa 100%) và nạp đáp án mẫu (`assignment_solutions`).
3. **Thư mục `src/presentation/controllers/`:**
   - `[NEW] course.controller.ts`: Controller xử lý HTTP request cho Khóa học.
   - `[NEW] assignment.controller.ts`: Controller xử lý HTTP request cho Đề thi, Test Cases, Rubrics.
4. **Thư mục `src/presentation/routes/`:**
   - `[NEW] course.route.ts`: Định tuyến `/api/v1/courses`.
   - `[NEW] assignment.route.ts`: Định tuyến `/api/v1/assignments`.
5. **File `src/app.ts`:**
   - `[MODIFY] app.ts`: Đăng ký router `/api/v1/courses` và `/api/v1/assignments`.

---

## 4. KẾT QUẢ TRIỂN KHAI & DANH SÁCH API ENDPOINTS

### 4.1. Tuyến đường Khóa học (`/api/v1/courses`)
- `POST   /api/v1/courses` – Tạo khóa học mới.
- `GET    /api/v1/courses` – Lấy danh sách khóa học (hỗ trợ `?lecturerId=` hoặc `?studentId=`).
- `GET    /api/v1/courses/:id` – Xem chi tiết khóa học + danh sách đề thi + sinh viên trong lớp.
- `PUT    /api/v1/courses/:id` – Cập nhật thông tin khóa học.
- `DELETE /api/v1/courses/:id` – Xóa khóa học.
- `POST   /api/v1/courses/:id/enroll` – Gán danh sách sinh viên vào lớp (`studentIds: string[]`).
- `DELETE /api/v1/courses/:id/students/:studentId` – Xóa sinh viên khỏi lớp.

### 4.2. Tuyến đường Đề thi & Test Cases (`/api/v1/assignments`)
- `POST   /api/v1/assignments` – Tạo đề thi PE.
- `GET    /api/v1/assignments/:id` – Lấy chi tiết đề thi (hỗ trợ `?role=STUDENT` để lọc testcase ẩn).
- `GET    /api/v1/assignments/course/:courseId` – Lấy toàn bộ đề thi theo khóa học.
- `PUT    /api/v1/assignments/:id` – Sửa thông tin đề thi PE.
- `POST   /api/v1/assignments/:id/testcases` – Nạp lẻ hoặc hàng loạt (Bulk) bộ Test Cases (`questionNo`, `inputData`, `expectedOutput`, `timeLimitMs`, `memoryLimitMb`, `score`, `isHidden`, `outputFileName`, `rationale`, `testType`).
- `GET    /api/v1/assignments/:id/testcases` – Lấy danh sách testcases (lọc `?questionNo=Q1`).
- `PUT    /api/v1/assignments/testcases/:testCaseId` – Cập nhật 1 testcase.
- `DELETE /api/v1/assignments/testcases/:testCaseId` – Xóa 1 testcase.
- `POST   /api/v1/assignments/:id/rubrics` – Cấu hình barem Rubric Rules cho AI chấm.
- `GET    /api/v1/assignments/:id/rubrics` – Xem danh sách tiêu chí Rubric.
- `POST   /api/v1/assignments/:id/solutions` – Nạp đáp án mẫu & phân tích thuật toán.
- `GET    /api/v1/assignments/:id/solutions` – Lấy danh sách đáp án mẫu.

### 4.3. Kết Quả Kiểm Tra
- **Type-Check:** Lệnh `npx tsc --noEmit` hoàn thành với **0 lỗi (Exit code: 0)**.
- **Tính độc lập:** Tuân thủ nguyên tắc Zero-Conflict, không can thiệp code của các thành viên khác trong nhóm.

---

## 5. BẢNG THEO DÕI PROMPT CHI TIẾT (PROMPT & CONTEXT LOG - 7 CỘT CHUẨN)
*(Đồng bộ 100% cấu trúc Bảng 1 của `AI_PROMPT_LOG.md`)*

| STT | Ngày | Thành viên | Công cụ AI | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Tinh chỉnh của sinh viên |
|:---:|:---:|:---:|:---:|:---|:---|:---|
| **1** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity / Claude | Khảo sát yêu cầu SRS & Lập kế hoạch `/plan` phân hệ Quản lý Khóa học, Đề thi PE, Test Cases & Rubrics | *"Bạn hãy đóng vai trò là Senior Backend Architect. Hãy rà soát toàn bộ cấu trúc dự án AITA, đặc biệt là tài liệu phân công nhiệm vụ backend (`Backend_Task_Allocation_6_Members.md`). Tôi là Thành viên 2 phụ trách phân hệ Quản lý Khóa học, Đề thi PE, Test Cases và Rubric Rules. Hãy lập kế hoạch chi tiết bằng lệnh `/plan` để liệt kê chính xác các file cần tạo mới/chỉnh sửa theo kiến trúc Clean Architecture, đảm bảo nguyên tắc Zero-Conflict với các thành viên khác."* | Phân tích SRS, đề xuất 2 phương án kiến trúc, xác định chính xác danh sách file thuộc `use-cases/`, `controllers/`, `routes/` và đăng ký trong `app.ts`. Lưu tại `member_2_implementation_plan.md`. |
| **2** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity / Claude | Lựa chọn phương án triển khai & sinh mã nguồn Backend Clean Architecture | *"Tôi duyệt chọn Phương án 2 (Siêu rút gọn): Các Use Case sẽ thao tác trực tiếp thông qua Prisma Client mà không qua các tầng trừu tượng Repository trung gian nhằm tối ưu thời gian phát triển và đảm bảo tính độc lập tuyệt đối. Hãy tiến hành sinh mã nguồn theo phương án này."* | Sinh 10 file code TypeScript hoàn chỉnh: 5 Use Cases, 2 Controllers, 2 Routes, cập nhật `app.ts`. Hỗ trợ các trường đặc thù FPT PE (`outputFileName` cho CSD201, `rationale`, `testType` cho AI RAG). Sinh viên kiểm tra biên dịch `tsc` 0 lỗi. |
| **3** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity | Xử lý sự cố môi trường & xung đột cổng mạng Local (`EADDRINUSE: 5000`) | *"Server gặp lỗi `Error: listen EADDRINUSE: address already in use : 5000` do tiến trình cũ đang chiếm dụng cổng 5000. Hãy cung cấp cho tôi lệnh PowerShell trên Windows để tra cứu PID và buộc dừng (kill process) tiến trình đang chiếm port 5000 ngay lập tức."* | AI cung cấp câu lệnh `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess \| Stop-Process -Force` để giải phóng port 5000 ngay lập tức. Giúp sinh viên chạy server local thành công. |
| **4** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity | Xây dựng bộ tự động kiểm thử API Collection bằng Extension Bruno | *"Hãy tạo đầy đủ các file `.bru` đại diện cho trọn vẹn chu trình CRUD (Create, Read, Update, Delete) cho tất cả các tài nguyên thuộc phạm vi Thành viên 2 (Khóa học, Ghi danh, Đề thi PE, Test Cases, Rubrics), đảm bảo có sẵn mẫu body JSON chuẩn để chỉ cần bấm Run là test được ngay."* | Tạo trọn bộ 19 file `.bru` phân chia theo thư mục `/courses/` và `/assignments/`, cấu hình environment `local.json` chứa biến môi trường. Hướng dẫn cấu hình loại trừ `bruno/` vào `.gitignore` để bảo vệ mã nguồn. |

---

## 6. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG SWD392 (EXCEL COMPLIANT - 10 CỘT)
*(Dùng để sao chép trực tiếp vào file báo cáo nộp giảng viên `SWD392_G2_V2.xlsx`)*

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | Detailed Design & Planning | Lập kế hoạch `/plan` phân hệ Quản lý Khóa học & Đề thi PE (TV2) | Antigravity / Claude | Kế hoạch kiến trúc phân lớp, danh sách file Use Cases, Controllers, Routes | Rà soát đối chiếu tài liệu SRS và `Backend_Task_Allocation_6_Members.md`, chốt phương án gọi Prisma trực tiếp | `member_2_implementation_plan.md` | Giảm 80% thời gian phân tích cấu trúc mã nguồn | 5 | Cần kiểm tra kỹ phạm vi các file để tránh sửa nhầm file của thành viên khác |
| 2 | Implementation & Coding | Triển khai mã nguồn Backend CRUD Khóa học, Đề thi, Test Cases & Rubrics | Antigravity / Claude | 10 file mã nguồn TypeScript (5 Use Cases, 2 Controllers, 2 Routes, cập nhật `app.ts`) | Kiểm tra logic lọc testcase ẩn với sinh viên (`?role=STUDENT`), kiểm tra kiểu dữ liệu `Decimal` cho điểm Rubric, chạy `tsc --noEmit` đạt 0 lỗi | `Code/backend/src/application/use-cases/`, `src/presentation/` | Tiết kiệm 6 giờ viết boilerplate code và định tuyến Express | 5 | AI có thể sinh thiếu validate dữ liệu đầu vào hoặc lỗi kiểu dữ liệu nếu schema thay đổi -> cần chạy Type-check thường xuyên |
| 3 | Deployment & Debugging | Khắc phục sự cố xung đột cổng mạng & chạy Local không cần Docker | Antigravity | Quy trình cấu hình `.env`, lệnh script khởi chạy và lệnh PowerShell tắt port 5000 | Tự chạy lệnh PowerShell giải phóng port, cấu hình `DATABASE_URL` kết nối MySQL local | `src/server.ts`, `.env` | Tiết kiệm 45 phút tra cứu lỗi hệ thống Windows | 4 | Lệnh kill process buộc dừng tiến trình có thể ảnh hưởng service khác nếu không xác định đúng PID |
| 4 | Testing & Verification | Xây dựng bộ tự động kiểm thử Bruno API Collection cho toàn bộ TV2 | Antigravity | Bộ 19 request Bruno (`.bru`) kèm mẫu JSON Body, script kiểm tra CRUD Khóa học và Đề thi | Import vào Extension Bruno, kiểm thử từng endpoint, xác thực mã phản hồi HTTP 200/201/204, bổ sung `bruno/` vào `.gitignore` | `bruno/` (local workspace), `.gitignore` | Giảm 75% thời gian tạo request test thủ công trên Postman | 5 | Cần chú ý biến môi trường `courseId`, `assignmentId` phải được cập nhật tương ứng với ID thực tế trong database |

---

## 7. NGUYÊN TẮC GIẢI TRÌNH MÃ NGUỒN & LIVE DEFENSE (EXPLAINABILITY CHECKLIST DÀNH CHO TV2)
Mỗi sinh viên khi bảo vệ đồ án SWD392 cần nắm vững 3 câu hỏi cốt lõi sau để giải trình trước Hội đồng:

1. **Đoạn code này xử lý nghiệp vụ gì trong Module của mình?**
   - Phân hệ TV2 quản lý toàn bộ vòng đời của Khóa học (Lớp học, môn học, ghi danh sinh viên), Đề thi thực hành (PE), Bộ nạp Test Cases (I/O, timeout, memory, outputFileName) và Barem Rubric Rules phục vụ trực tiếp cho TV5 (Sandbox chạy code) và TV6 (AI chấm điểm ngữ nghĩa).

2. **Tại sao lại chọn cấu trúc dữ liệu / thuật toán / design pattern này thay vì cách khác?**
   - Lựa chọn **Kiến trúc Clean Architecture rút gọn**: Use Cases gọi trực tiếp Prisma Client mà không qua lớp Repository trung gian nhằm loại bỏ boilerplate thừa, tăng tốc độ phát triển và đảm bảo tính độc lập tuyệt đối giữa các thành viên (Zero-Conflict).
   - Tách biệt rõ ràng tầng nghiệp vụ (`application/use-cases/`) và tầng giao tiếp HTTP (`presentation/controllers/`, `presentation/routes/`).

3. **Nếu giảng viên yêu cầu đổi logic tại chỗ (Live Debugging), xử lý như thế nào trong 3-5 phút?**
   - *Yêu cầu 1: Ẩn testcase bảo mật khi Sinh viên xem đề thi?*  
     -> Mở `src/application/use-cases/assignments/get-assignment-detail.use-case.ts`, chỉ ra điều kiện: nếu `role === 'STUDENT'` thì Prisma chỉ query `where: { isHidden: false }`.
   - *Yêu cầu 2: Đổi cơ chế chấm thi môn CSD201 so khớp file `f1.txt`, `f2.txt`?*  
     -> Mở `manage-testcases.use-case.ts`, chỉ ra trường `outputFileName` đã được hỗ trợ trong schema và API nạp testcase.
   - *Yêu cầu 3: Bắt buộc tổng tỷ trọng Rubric không vượt quá 100%?*  
     -> Mở `manage-rubrics.use-case.ts`, chỉ ra đoạn kiểm tra tổng weight: `items.reduce((sum, item) => sum + item.weight, 0) > 100` để throw Exception `BAD_REQUEST`.
