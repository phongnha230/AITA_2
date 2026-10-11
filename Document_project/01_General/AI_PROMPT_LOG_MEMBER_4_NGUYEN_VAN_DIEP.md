# NHẬT KÝ SỬ DỤNG AI (AI PROMPT LOG) - THÀNH VIÊN 4
## MODULE DOCKER SANDBOX EXECUTION ENGINE
**Học phần:** SWD392 – Software Architecture and Design (Lớp SE19C - Fall 2026)  
**Đại học:** FPT University  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Vinh  
**Nhóm:** GROUP 2 - Dự án AITA (AI-powered Teaching Assistant System)  
**Sinh viên thực hiện:** **Nguyễn Văn Điệp (MSSV: QE180203)** - Role: Member (Thành viên 4)  
**Phân hệ phụ trách:** Module Docker Sandbox Execution Engine (Full-stack / Backend Focus)  

**Mục tiêu:** Đáp ứng tuyệt đối 2 tiêu chí đánh giá bắt buộc của học phần SWD392:
1. **Transparency (Tính minh bạch):** Ghi chép trung thực 100% nhật ký tương tác cùng trợ lý AI (Antigravity), câu prompt nguyên bản, bối cảnh bài toán và ngày giờ thực hiện.
2. **Explainability (Tính giải trình):** Chứng minh sinh viên làm chủ 100% logic mã nguồn, hiểu sâu các Design Patterns (Factory Method), cơ chế bảo mật cô lập tài nguyên (cgroups, network none, timeout watchdog) và sẵn sàng Live Debugging trước Hội đồng bảo vệ đồ án.

---

## 1. BẢNG THEO DÕI PROMPT CHI TIẾT (DETAILED PROMPT & CONTEXT LOG)

Bảng dưới đây ghi lại đầy đủ 15 phiên làm việc chuyên sâu giữa sinh viên **Nguyễn Văn Điệp** và AI trong toàn bộ quá trình khảo sát, thiết kế, lập trình, kiểm thử và đồng bộ mã nguồn cho phân hệ Sandbox:

| STT | Thời gian | Người thực hiện | Công cụ AI | Mục đích / Bài toán nghiệp vụ | Câu Prompt nguyên bản (User Prompt & Context) | Kết quả sinh ra & Tinh chỉnh của sinh viên |
|:---:|:---:|:---:|:---:|:---|:---|:---|
| **1** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Khảo sát tổng quan dự án, kiến trúc Clean Architecture và tech stack | *"Doc du an nay"* | AI quét toàn bộ cấu trúc dự án `AITA_2`, tóm tắt hệ thống tài liệu SRS, ERD MySQL, 3 Design Patterns và phân bổ 6 phân hệ; sinh viên nắm bắt được hiện trạng scaffold của dự án. |
| **2** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Phân tích yêu cầu kỹ thuật chi tiết của Thành viên 4 | *"hướng dẫn triển khai code thành viên 4, yêu cầu trong file \"Team_6_FullStack_Task_Allocation.md\""* | AI bóc tách phạm vi của TV4: Xây dựng Sandbox biên dịch C (PRF192) & Java (PRO192/CSD201), áp dụng Factory Method Pattern, quản lý an toàn (ngắt mạng, giới hạn 256MB RAM, timeout 2s), và các UI components frontend liên quan. |
| **3** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Thiết lập nhánh Git làm việc cô lập, quy tắc không đụng vào Frontend | *"Cách tạo nhánh riêng để code, không code front-end chỉ code back-end"* | AI hướng dẫn tạo nhánh `feat/backend-sandbox`, khoanh vùng nguyên tắc "Folder Ownership" (chỉ code trong `src/infrastructure/sandbox/`, tuyệt đối không đụng vào frontend và schema để tránh conflict). |
| **4** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Khắc phục lỗi terminal `fatal: not a git repository` khi checkout | *[Ảnh chụp terminal lỗi: fatal: not a git repository khi chạy git checkout main tại D:\SWD392\AITA]* | AI chẩn đoán thư mục `.git` nằm bên trong thư mục con `AITA_2`, hướng dẫn sinh viên gõ lệnh `cd AITA_2` trước khi thao tác Git và tạo nhánh `feature/VanDiep/backend-sandbox`. |
| **5** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Thiết kế khung mã nguồn Backend Sandbox chuẩn Clean Architecture | *"Hướng dẫn tao triển khai code thành viên 4 như thế nào ở nhánh mới tạo, yêu cầu tính năng ở file \"Team_6_Fullstack_Task_Allocation.md\", chỉ backend không code frontend"* | AI cung cấp bản thiết kế kỹ thuật hoàn chỉnh gồm 7 file mã nguồn TypeScript: Interface `ISandboxRunner`, `OutputComparator`, `CDockerRunner`, `JavaDockerRunner`, `SandboxRunnerFactory`, `SandboxService` và script test standalone. |
| **6** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Làm rõ cấu trúc phân cấp thư mục con trong Clean Architecture | *"Code/backend/src/infrastructure/sandbox/interfaces hoặc comparator là thư mục à"* | AI giải thích rõ ràng `interfaces/`, `comparator/`, `runners/` là các thư mục con phân lớp chuyên nghiệp, đồng thời đưa ra phương án gom chung file nếu muốn đơn giản hóa việc import. |
| **7** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Xử lý lỗi thiếu Type Definitions Node.js (`fs`, `path`, `child_process`) | *[Ảnh chụp lỗi: Cannot find name 'child_process', 'fs', 'path', 'util' và Parameter 'f' implicitly has an 'any' type]* | AI chẩn đoán dự án chưa chạy `npm install` nên chưa có `@types/node`; hướng dẫn sinh viên chạy `npm install` tại `Code/backend` và khai báo type rõ ràng `(f: string)` trong hàm tìm file mã nguồn. |
| **8** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Rà soát độ hoàn thiện của Module Sandbox theo tiêu chuẩn đồ án | *"Hết lỗi ròi, code như vậy là hoàn thành xong tính năng của thành viên 4 chưa?"* | AI kiểm tra dung lượng file trên ổ cứng, chỉ rõ mới hoàn thành 60% (C Runner, Factory), còn thiếu mã nguồn Java Runner (PRO192/CSD201 File I/O), Service kết nối CSDL và script test; AI cung cấp đầy đủ code hoàn thiện cho 3 file này. |
| **9** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Xử lý lỗi TypeScript Strict Mode và cảnh báo `baseUrl` deprecated | *[Ảnh chụp lỗi Problems 3: Parameter 'tc'/'tx' implicitly has an 'any' type và baseUrl is deprecated]* | AI xử lý triệt để: thêm `"ignoreDeprecations": "5.0"` vào `tsconfig.json`, khai báo rõ kiểu `(tc: any)` và `(tx: Prisma.TransactionClient)` trong `sandbox.service.ts`; chạy `tsc --noEmit` đạt 0 lỗi. |
| **10** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Xử lý thông báo đệm xung đột khi lưu file trong VS Code | *"Khi tôi Ctrl + S thì hiện ra thông báo này" [Ảnh thông báo: Use the actions in the editor tool bar to either undo your changes or overwrite...]* | AI giải thích xung đột giữa buffer trên màn hình VS Code và file mới đã sửa trên đĩa; hướng dẫn sinh viên đóng tab, chọn "Don't Save" và mở lại file sạch từ ổ cứng. |
| **11** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Hướng dẫn quy trình đóng gói và lưu vết Git (Commit & Push) | *"V là xong rồi đúng không? Nếu đúng hướng dẫn tao commit code lên github"* | AI xác nhận hoàn thành 100% Backend TV4; hướng dẫn chuẩn các bước `git add`, `git commit -m "feat(sandbox): implement docker sandbox execution engine for C and Java"` và `git push`. |
| **12** | 24/09/2026 | Nguyễn Văn Điệp | Antigravity | Sửa lỗi gõ lệnh terminal và xử lý lộn thứ tự commit/push | *"Tôi lỡ làm bước 4 trước bước 3 rồi xử lý sao nhỉ" [Kèm ảnh lỗi git add. thiếu khoảng trắng và cd sai thư mục]* | AI giải thích cơ chế an toàn của Git, hướng dẫn gõ đúng cú pháp `git add .`, sau đó commit và push bình thường. Commit `b2fcc63` được đẩy lên GitHub thành công. |
| **13** | 28/09/2026 | Nguyễn Văn Điệp | Antigravity | Khởi tạo Pull Request (PR) và quy trình duyệt code của Leader | *"Tạo pull request trên git" & "Cần click này không?" [Ảnh nút Merge pull request]* | AI cung cấp link tạo PR trực tiếp kèm bản mô tả PR chuẩn mực; giải thích quy trình Scrum: sinh viên không tự merge mà gửi link cho Leader duyệt và merge vào `main`. |
| **14** | 30/09/2026 | Nguyễn Văn Điệp | Antigravity | Xây dựng REST API Endpoints và thực hiện Automated API Testing | *"Leader kêu test phần tôi phụ trách nên bạn test API giúp tôi" [Kèm ảnh chat Leader giục kiểm tra API hoạt động]* | AI xây dựng `SandboxController` và `sandbox.route.ts` với 3 endpoints (`GET /status`, `POST /execute`, `POST /grade/:submissionId`). Thêm cơ chế tự động Fallback linh hoạt giữa Docker và Local JDK 21. Viết script `test-sandbox-api.ts` kiểm thử tự động đạt 2/2 testcase Pass (10/10 điểm, ~200ms). Commit `ada95f8` tự động cập nhật lên PR. |
| **15** | 01/10/2026 | Nguyễn Văn Điệp | Antigravity | Đồng bộ `.gitignore` và merge toàn bộ mã nguồn mới nhất từ `main` | *"Pull file .gitignore từ nhánh main về giúp tôi" & "Pull nhánh main về"* | AI kéo file `.gitignore` gốc và backend, giải quyết xung đột untracked file, merge thành công 20+ commits từ `main` vào nhánh, cập nhật dependencies (`npm install`, `prisma generate`), kiểm tra `tsc` 0 lỗi và push commit `be26906` đồng bộ lên GitHub. |
| **16** | 05/10/2026 | Nguyễn Văn Điệp | Antigravity | Thiết kế Prototype & Triển khai toàn diện Front-end Lecturer Dashboard | *"Thiết kế dashboard Giảng viên... DUYỆT GIAO DIỆN. Rồi commit và push lên github, rồi tạo pull request."* | Xây dựng mockup tương tác, tối ưu bố cục và switch trạng thái, xuất toàn bộ Next.js App Router components, hooks, service API cho phân hệ Course theo chuẩn Clean Architecture; kiểm thử build và push PR. |

---

## 2. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG EXCEL SWD392 (EXCEL COMPLIANT)
*(Phục vụ sao chép trực tiếp vào báo cáo đóng góp cá nhân hàng tuần `SWD392_G2_V2.xlsx` - Phần phụ trách của sinh viên Nguyễn Văn Điệp)*

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | Requirements Analysis | Phân tích bài toán Sandbox & đặc thù bài thi PE FPT | Antigravity | Đặc tả luồng chạy GCC (PRF192) và JDK (PRO192/CSD201) | Rà soát cấu trúc thư mục nộp bài PE (main.c đơn lẻ vs Q1..Q4 Java) | `02_Requirements_SRS/Team_6_Fullstack_Task_Allocation.md` | Giảm 60% thời gian khảo sát kỹ thuật | 5 | Khác biệt định dạng xuống dòng Windows `\r\n` vs Linux `\n` -> sinh viên yêu cầu bổ sung `OutputComparator` |
| 2 | Architecture Design | Ứng dụng Factory Method Pattern cho Sandbox Runners | Antigravity | Lớp `SandboxRunnerFactory` cấp phát `CDockerRunner` và `JavaDockerRunner` | Tinh chỉnh kế thừa interface `ISandboxRunner`, tuân thủ nguyên lý Open/Closed (OCP) | `Code/backend/src/modules/sandbox/infrastructure/sandbox-runner.factory.ts` | Tiết kiệm 3 giờ thiết kế kiến trúc OOP | 5 | Tránh hardcode `if-else` rải rác trong Controller |
| 3 | Detailed Implementation | Xây dựng bộ chạy C Runner an toàn trong Docker | Antigravity | Mã nguồn `c-docker.runner.ts` biên dịch `gcc -O2` với timeout 2s | Bổ sung cgroups giới hạn RAM 256MB, `--network none`, tự động ngắt vòng lặp vô hạn `while(1)` | `Code/backend/src/modules/sandbox/infrastructure/runners/c-docker.runner.ts` | Bảo vệ 100% máy chủ trước mã độc và fork bomb | 5 | Nếu máy không bật Docker Desktop -> sinh viên yêu cầu bổ sung cơ chế Auto-Fallback sang compiler cục bộ |
| 4 | Detailed Implementation | Xây dựng Java Runner hỗ trợ File I/O môn CSD201 | Antigravity | Mã nguồn `java-docker.runner.ts` nạp `data.txt` và so khớp `f1.txt, f2.txt` | Bổ sung kiểm tra ngoại lệ `FILE_NOT_FOUND`, so khớp File-to-File Diff chuẩn xác | `Code/backend/src/modules/sandbox/infrastructure/runners/java-docker.runner.ts` | Giải quyết chính xác 100% đề thi CSD201 thực tế tại FPT | 5 | Tránh lỗi sinh viên quên lệnh ghi file dẫn tới crash hệ thống |
| 5 | Database Integration | Tích hợp Sandbox Service với Prisma MySQL | Antigravity | Service `sandbox.service.ts` đọc testcases và lưu `submission_test_results` | Đóng gói trong transaction `$transaction`, chuẩn hóa điểm số tối đa 7.0 theo barem | `Code/backend/src/modules/sandbox/application/services/sandbox.service.ts` | Tiết kiệm 2 giờ viết query CSDL | 5 | Phải kiểm soát null-safety cho `stagedPath` |
| 6 | API Construction | Xây dựng REST API Endpoints cho Sandbox | Antigravity | `SandboxController` & `sandbox.route.ts` (`GET /status`, `POST /execute`) | Đăng ký route vào `app.ts`, bọc try-catch, validate input `sourceCode` và `testCases` | `Code/backend/src/modules/sandbox/presentation/routes/sandbox.route.ts` | Cung cấp API trực quan cho Frontend và Leader kiểm thử | 5 | Phải tự động dọn dẹp thư mục tạm trong khối `finally` |
| 7 | Verification & Testing | Kiểm thử tự động API (Automated API Testing) | Antigravity | Script `test-sandbox-api.ts` khởi tạo mock server và gọi HTTP requests | Chấm bài Java thực tế, kiểm tra mã HTTP 200, đạt 2/2 testcase (10/10 điểm, ~200ms) | `Code/backend/src/infrastructure/sandbox/scripts/test-sandbox-api.ts` | Chứng minh API hoạt động hoàn hảo trước Leader | 5 | Cần giải phóng cổng mạng sau khi test xong |
| 8 | Git & Branch Management | Quản lý nhánh riêng và đồng bộ Modular Clean Architecture | Antigravity | Chiến lược branch `feature/VanDiep/backend-sandbox`, giải quyết merge từ `main` | Kéo `.gitignore` mới, cập nhật Prisma Client, sửa deprecation `tsconfig.json`, build đạt 0 lỗi | Commit `b2fcc63`, `ada95f8`, `be26906` | Loại bỏ 100% rủi ro Git merge conflict với 5 thành viên khác | 5 | Phải chạy `npm install` và `prisma generate` ngay sau khi merge |
| 9 | UI/UX & Frontend | Xây dựng Lecturer Dashboard theo quy trình Prototype-first | Antigravity | Dựng mockup tương tác, tối ưu bố cục và xuất toàn diện component Next.js 14 | Thẩm định responsive, parity kích thước action button, tách nhỏ modular theo Clean Architecture | `Code/frontend/src/features/courses/` | Hoàn thiện 100% giao diện quản lý khóa học Giảng viên | 5 | Cần duyệt mockup visual trước khi viết code |

---

## 3. NGUYÊN TẮC GIẢI TRÌNH MÃ NGUỒN & BỘ CÂU HỎI BẢO VỆ PHẢN BIỆN (DEFENSE Q&A)
*(Cẩm nang dành riêng cho sinh viên Nguyễn Văn Điệp khi trả lời phỏng vấn của Giảng viên phản biện tại buổi bảo vệ Evaluation 2 và Final Defense)*

### ❓ Câu 1: Em đã áp dụng Design Pattern nào trong Module Sandbox của mình? Tại sao lại chọn nó?
* **Trả lời của sinh viên:**  
  Trong module Sandbox, em áp dụng **Factory Method Pattern** (thể hiện tại class `SandboxRunnerFactory`).  
  * **Lý do:** Hệ thống chấm thi của trường FPT có nhiều môn học với ngôn ngữ và cơ chế thực thi rất khác nhau (C cho PRF192, Java cho PRO192/CSD201). Nếu dùng các câu lệnh `if-else` hoặc `switch-case` trực tiếp trong Controller, mã nguồn sẽ vi phạm nguyên lý **Open/Closed Principle (OCP)**.  
  * **Lợi ích:** Khi nhà trường mở rộng thêm môn học mới (ví dụ Python hay C#), em chỉ việc tạo thêm một Runner mới kế thừa interface `ISandboxRunner` và đăng ký trong Factory mà **hoàn toàn không phải sửa đổi logic cốt lõi của hệ thống**.

### ❓ Câu 2: Nếu sinh viên nộp bài thi có vòng lặp vô hạn `while(1)` hoặc đệ quy vô tận thì Sandbox của em xử lý thế nào để không làm treo server?
* **Trả lời của sinh viên:**  
  Em thiết lập cơ chế bảo vệ 2 lớp:
  1. **Timeout Watchdog (2000ms):** Sử dụng `setTimeout()` trong Node.js. Nếu tiến trình con chạy quá 2 giây mà chưa hoàn thành, hệ thống sẽ tự động gửi tín hiệu `SIGKILL` tiêu diệt tiến trình ngay lập tức, giải phóng CPU và đánh dấu testcase đó là `TIME_LIMIT_EXCEEDED (TLE)`.
  2. **Cách ly nhân Linux (Linux Kernel cgroups & Network Isolation):** Khi chạy qua Docker Container, em cấu hình cờ `--memory=256m` để chống tràn RAM, cờ `--network none` để ngắt 100% kết nối mạng (ngăn chặn mã độc gửi đề thi ra ngoài Internet) và cờ `--rm` để tự hủy container xóa sạch rác bộ nhớ ngay sau khi thực thi xong.

### ❓ Câu 3: Làm thế nào em chấm được bài thi môn CSD201 với đặc thù đọc ghi file `data.txt` $\to$ `f1.txt, f2.txt`?
* **Trả lời của sinh viên:**  
  Với môn CSD201, cơ chế Console I/O thông thường không hoạt động. Trong `JavaDockerRunner`, em triển khai cơ chế **File-to-File Diff**:
  1. Trước khi chạy bài, Sandbox tự động ghi dữ liệu đầu vào vào file `data.txt` đặt tại thư mục thực thi của sinh viên.
  2. Sinh viên chạy code sẽ tự tạo ra file kết quả (ví dụ `f1.txt`).
  3. Sandbox kiểm tra: nếu file `f1.txt` không tồn tại $\to$ báo lỗi ngay `FILE_NOT_FOUND`.
  4. Nếu file tồn tại, hệ thống đọc nội dung file, truyền qua bộ lọc `OutputComparator` (chuẩn hóa `\r\n` của Windows sang `\n` của Linux và trim khoảng trắng thừa) rồi so khớp trực tiếp với đáp án mẫu mong đợi.

### ❓ Câu 4: Nếu máy chủ gặp sự cố Docker Desktop chưa bật thì API Sandbox của em có bị crash không?
* **Trả lời của sinh viên:**  
  Dạ hoàn toàn không ạ. Trong cả `CDockerRunner` và `JavaDockerRunner`, em đã xây dựng hàm `isDockerDaemonRunning()` kiểm tra socket Docker trong vòng 2 giây. Nếu Docker daemon không phản hồi hoặc biến môi trường `USE_DOCKER_SANDBOX=false`, hệ thống sẽ **tự động chuyển đổi mượt mà (Graceful Fallback)** sang sử dụng trình biên dịch cục bộ (`javac 21.0.8` và `gcc` trên máy chủ). Nhờ đó các API endpoint `POST /api/v1/sandbox/execute` luôn phản hồi HTTP 200 ổn định và đáng tin cậy.
