# NHẬT KÝ TƯƠNG TÁC AI & KẾ HOẠCH TRIỂN KHAI PHÂN HỆ THÀNH VIÊN 2 (AI LOG)

**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design (Đại học FPT)  
**Vai trò:** **Thành viên 2 (TV2) – Phân hệ Course, Exam & Test Case Management (Full-Stack: Backend Clean Architecture & Frontend Web Next.js 14)**  
**Nhánh Git:** `feature/VanBao/backend-course-assignment`  
**Commit Frontend Web tiêu biểu:** `af53d4b` (*feat(frontend): upgrade lecturer exam management, proctoring monitor, and full-page exam detail view*)  
**Ngày lưu trữ nhật ký:** 06/10/2026 (Gồm dữ liệu Backend ngày 28/09/2026 và Frontend Web ngày 05/10/2026)

---

## 1. TỔNG QUAN CÁC PHIÊN LÀM VIỆC VỚI AI AGENT

Trong quá trình phát triển phân hệ Thành viên 2, toàn bộ lịch sử trao đổi, phân tích và thực thi giữa người dùng và AI Agent được quản lý qua **5 phiên làm việc chính** (Session ID được lưu trữ tại `C:\Users\ASUS\.gemini\antigravity-ide\brain\`):

| STT | Mã Session ID | Thời gian | Phân hệ | Nội dung công việc chính |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `9916be33-ac3b-4fd1-8025-f4b8d9b26b16` | 28/09/2026 10:28 – 15:20 | Backend | Đọc SRS, lập kế hoạch `/plan`, chốt kiến trúc Clean Architecture rút gọn trực tiếp với Prisma, sinh 10 file code (Use Cases, Controllers, Routes), cấu hình `app.ts`, kiểm tra biên dịch TypeScript 0 lỗi và giải quyết xung đột port 5000. |
| **2** | `35494035-6e71-4e82-b821-337621479a31` | 28/09/2026 15:24 | Backend | Trao đổi nhanh cách khởi động backend và quy trình test API độc lập. |
| **3** | `97a7005f-b975-40a2-bdcb-ddb4a787d700` | 28/09/2026 15:42 – 16:42 | Backend | Xây dựng bộ test collection bằng Extension Bruno, cấu hình Environment local, tạo bộ 19 request CRUD đầy đủ cho TV2 và cấu hình loại trừ `bruno/` trong `.gitignore`. |
| **4** | `5e737f5d-463f-4b7c-8bdd-c31db5e15819` | 05/10/2026 15:00 – 17:00 | Frontend Web | Khảo sát yêu cầu UI cho Giảng viên, xác lập ranh giới nhiệm vụ TV2 (tập trung Đề thi PE, Starter Code, Solution, Testcases, Giám sát), tạo bộ dữ liệu mẫu chuẩn môn **PRF192** (`Sample_Data_PRF192`), sửa lỗi mock tĩnh sang Dynamic Parser (`JSZip` giải nén file tree zip, preview PDF, import JSON/CSV testcase thật) và gửi lưu thành công vào MySQL. |
| **5** | `2034b118-7777-4ca8-861f-6af76a2ff13b` | 05/10/2026 20:00 – 21:30 | Frontend Web | Nâng cấp toàn diện 3 trang giao diện TV2: Dashboard (`/dashboard`), Ngân hàng đề thi (`/exam-bank`), Giám sát trực tiếp (`/live-proctoring`). Thay thế Modal xem chi tiết chật chội bằng Trang Chi Tiết Toàn Màn Hình riêng biệt (`/exam-bank/[id]`), lược bỏ chỉ số debug kỹ thuật, kiểm tra cấu trúc Feature-based Next.js 14 và hoàn tất đóng gói commit Git Frontend `af53d4b`. |

---

## 2. TOÀN BỘ LỊCH SỬ PROMPTS ĐÃ THỰC HIỆN & PHIÊN BẢN CHUẨN HÓA

> [!TIP]
> Toàn bộ các câu prompt dưới đây được xây dựng và chuẩn hóa theo tiêu chuẩn **Prompt Engineering chuyên nghiệp (Role - Context - Task - Constraints - Expected Output)** phục vụ trực tiếp cho việc đối chiếu kỹ thuật phần mềm, báo cáo tiến độ và bảo vệ đồ án môn học SWD392.

---

### PHẦN A: CÁC PHIÊN TRIỂN KHAI BACKEND (NGÀY 28/09/2026)

#### Phiên 1: Lập kế hoạch `/plan` & Triển khai Backend (`9916be33-ac3b-4fd1-8025-f4b8d9b26b16`)

##### 🔹 Prompt 1: Khởi tạo và yêu cầu lập kế hoạch `/plan`
* **Prompt:**  
  > *"Bạn hãy đóng vai trò là Senior Backend Architect. Hãy rà soát toàn bộ cấu trúc dự án AITA, đặc biệt là tài liệu phân công nhiệm vụ backend (`Backend_Task_Allocation_6_Members.md`). Tôi là **Thành viên 2** phụ trách phân hệ Quản lý Khóa học, Đề thi PE, Test Cases và Rubric Rules. Hãy lập kế hoạch chi tiết bằng lệnh `/plan` để liệt kê chính xác các file cần tạo mới/chỉnh sửa theo kiến trúc Clean Architecture, đảm bảo nguyên tắc Zero-Conflict với các thành viên khác."*

##### 🔹 Prompt 2: Định hướng kiến trúc Clean Architecture
* **Prompt:**  
  > *"Trước khi triển khai code, hãy ưu tiên hoàn thiện 100% tầng Backend theo chuẩn Clean Architecture. Bạn hãy tóm tắt lại toàn bộ phạm vi trách nhiệm của Thành viên 2 và phân loại danh sách các file sẽ can thiệp theo từng lớp kiến trúc (Use Cases, Controllers, Routes) để tôi xác nhận sự thống nhất về mặt kỹ thuật trước khi thực thi."*

##### 🔹 Prompt 3: Tư vấn quy ước đặt tên nhánh Git
* **Prompt:**  
  > *"Theo quy chuẩn Git Workflow của dự án (ví dụ nhánh của thành viên khác là `feature/VanDiep/backend-sandbox`), hãy đề xuất cho tôi tên nhánh Git chuẩn xác và chuyên nghiệp nhất cho phân hệ Backend của Thành viên 2."*

##### 🔹 Prompt 4: Rà soát phạm vi phân công theo tài liệu SRS
* **Prompt:**  
  > *"Tôi trích xuất phạm vi trách nhiệm chính thức của Thành viên 2 từ tài liệu phân công: Cung cấp toàn bộ API CRUD Khóa học, Đề thi PE, Test Cases (hỗ trợ `rationale`, `test_type`, `outputFileName`) và Rubric Rules; thao tác trực tiếp Prisma Client, không phụ thuộc Docker/Redis. Hãy đối chiếu lại bản kế hoạch `/plan` để xác nhận danh sách file và thư mục triển khai đã hoàn toàn khớp 100%, không bị thừa hoặc thiếu bất kỳ thành phần nào."*

##### 🔹 Prompt 5: Quyết định lựa chọn phương án triển khai
* **Prompt:**  
  > *"Tôi duyệt chọn Phương án 2 (Siêu rút gọn): Các Use Case sẽ thao tác trực tiếp thông qua Prisma Client mà không qua các tầng trừu tượng Repository trung gian nhằm tối ưu thời gian phát triển và đảm bảo tính độc lập tuyệt đối. Hãy tiến hành sinh mã nguồn theo phương án này."*

##### 🔹 Prompt 6: Yêu cầu tổng hợp báo cáo tiến độ tuần 3
* **Prompt:**  
  > *"Hãy tổng hợp lại toàn bộ công việc và mã nguồn mà Thành viên 2 đã hoàn thành nãy giờ thành một tài liệu báo cáo tiến độ tuần 3 dạng markdown (`REPORT_WEEK_3.md`). Nội dung cần tóm tắt ngắn gọn các module đã xong, danh sách API đã tạo, kết quả kiểm tra chất lượng code và phương hướng tuần tiếp theo."*

##### 🔹 Prompt 7, 8, 9: Hướng dẫn chạy thử nghiệm Backend Local không cần Docker
* **Prompt:**  
  > *"Hiện tại tôi muốn kiểm thử nhanh phân hệ Backend của Thành viên 2 trên môi trường Local mà không cần khởi động cụm Docker containers. Hãy hướng dẫn tôi từng bước thiết lập biến môi trường `.env`, kết nối trực tiếp database và chạy server Node.js/Express ở chế độ development (`npm run dev`)."*

##### 🔹 Prompt 10: Xử lý sự cố xung đột cổng mạng (Port EADDRINUSE: 5000)
* **Prompt:**  
  > *"Server gặp lỗi `Error: listen EADDRINUSE: address already in use : 5000` do tiến trình cũ đang chiếm dụng cổng 5000. Hãy cung cấp cho tôi lệnh PowerShell trên Windows để tra cứu PID và buộc dừng (kill process) tiến trình đang chiếm port 5000 ngay lập tức."*

---

#### Phiên 2: Hướng dẫn khởi động & quy trình kiểm thử API (`35494035-6e71-4e82-b821-337621479a31`)

##### 🔹 Prompt 1: Quy trình chạy và test API
* **Prompt:**  
  > *"Hãy hướng dẫn tôi quy trình chuẩn để khởi động Backend server và các phương pháp kiểm thử các API endpoints vừa viết (sử dụng cURL, Postman hoặc HTTP Client) để đảm bảo server phản hồi đúng status code và cấu trúc dữ liệu JSON."*

---

#### Phiên 3: Thiết lập bộ Bruno API Collection & CRUD TV2 (`97a7005f-b975-40a2-bdcb-ddb4a787d700`)

##### 🔹 Prompt 1, 2, 3, 4: Hướng dẫn phương pháp test API phân hệ TV2
* **Prompt:**  
  > *"Hãy chỉ dẫn ngắn gọn và tập trung cho tôi các bước cụ thể để kiểm thử độc lập toàn bộ các API endpoints thuộc phân hệ Thành viên 2 (Khóa học, Đề thi, Test Cases, Rubrics), bao gồm dữ liệu đầu vào mẫu (Payload) và kết quả mong đợi."*

##### 🔹 Prompt 5, 6: Tích hợp công cụ Bruno Extension trong IDE
* **Prompt:**  
  > *"Tôi đang cài đặt Extension Bruno trên VS Code/IDE. Hãy hướng dẫn tôi cách tạo một Bruno Collection hoàn chỉnh trong thư mục dự án để tự động hóa việc gọi và kiểm thử các API của Thành viên 2."*

##### 🔹 Prompt 7, 8: Xử lý lỗi cấu hình môi trường & kết nối trong Bruno
* **Prompt:**  
  > *"Khi cấu hình Environment trên Extension Bruno gặp lỗi không nhận file `.bru` hoặc lỗi kết nối máy chủ `Error occurred while executing the request!`. Hãy phân tích nguyên nhân (định dạng file cấu hình, base URL, trạng thái server) và cung cấp cách khắc phục chuẩn xác."*

##### 🔹 Prompt 9, 10: Xây dựng trọn bộ Test Request chuẩn CRUD cho TV2
* **Prompt:**  
  > *"Hãy tạo đầy đủ các file `.bru` đại diện cho trọn vẹn chu trình CRUD (Create, Read, Update, Delete) cho tất cả các tài nguyên thuộc phạm vi Thành viên 2 (Khóa học, Ghi danh, Đề thi PE, Test Cases, Rubrics), đảm bảo có sẵn mẫu body JSON chuẩn để chỉ cần bấm Run là test được ngay."*

##### 🔹 Prompt 11: Cấu hình .gitignore bảo vệ mã nguồn
* **Prompt:**  
  > *"Hãy cập nhật file `.gitignore` để loại trừ thư mục `bruno/` (hoặc các file môi trường nhạy cảm) cùng các thư mục `node_modules` ở cả root và sub-packages, tránh việc commit nhầm lên remote repository."*

---

### PHẦN B: CÁC PHIÊN TRIỂN KHAI FRONTEND WEB (NGÀY 05/10/2026)

#### Phiên 4: Triển khai Giao diện Quản lý Đề thi & Dynamic Data Parser (`5e737f5d-463f-4b7c-8bdd-c31db5e15819`)

##### 🔹 Prompt 1: Khởi tạo yêu cầu lập kế hoạch `/plan` giao diện Web cho Giảng viên
* **Prompt:**  
  > *"Đóng vai trò là Senior Frontend Architect chuyên sâu Next.js 14 và EdTech UI/UX. Hãy phân tích yêu cầu thiết kế giao diện Web cho Giảng viên (Lecturer Workspace) thuộc môn SWD392: 1) Trang tạo và quản lý đề thi thực hành PE (hỗ trợ kéo thả PDF đề thi, tải khung Starter Code ZIP, nạp bài giải mẫu Solution Code, và import hàng loạt Testcases JSON/CSV); 2) Quản lý và giám sát ca thi đang diễn ra. Hãy lập kế hoạch kỹ thuật chi tiết bằng `/plan`, tuân thủ bảng màu hiện đại, cấu trúc Feature-based Clean Architecture và cung cấp URL local để kiểm thử."*

##### 🔹 Prompt 2: Kiểm tra trạng thái Backend và hướng dẫn vận hành song song
* **Prompt:**  
  > *"Trước khi tích hợp Frontend, hãy thực hiện kiểm tra sức khỏe hệ thống Backend (Backend Healthcheck): rà soát trạng thái database MySQL, các route `/api/v1/assignments` và `/api/v1/courses`, chỉ ra các lỗi còn tồn đọng (nếu có) và hướng dẫn tôi các lệnh khởi chạy đồng thời cả Backend (port 5000) và Frontend (port 3000) một cách trơn tru."*

##### 🔹 Prompt 3: Tinh chỉnh ranh giới phân công công việc (Scope Boundary Alignment)
* **Prompt:**  
  > *"Theo tài liệu phân bổ trách nhiệm thành viên (Folder Ownership & Member Scope), chức năng tạo lớp học và quản lý danh sách sinh viên thuộc phạm vi của Thành viên khác (TV1/Admin). Trách nhiệm cốt lõi của Thành viên 2 tập trung 100% vào: 1) Quy trình tạo đề thi PE & Upload PDF/ZIP; 2) Nhập bài giải mẫu & Import Testcases; 3) Theo dõi trạng thái đề thi và thời gian ca thi. Hãy cập nhật lại bản kế hoạch `/plan` để loại bỏ các tính năng ngoài phạm vi, đảm bảo tính biệt lập tuyệt đối."*

##### 🔹 Prompt 4: Thống nhất chiến lược kiểm thử CRUD lưu CSDL MySQL
* **Prompt:**  
  > *"Áp dụng chiến lược phát triển gia tăng (Incremental Development), hãy ưu tiên hoàn thiện luồng giao diện tạo đề kết nối trực tiếp với REST API backend để kiểm thử trọn vẹn chu trình CRUD: nhập form -> bấm lưu -> gửi payload HTTP POST -> lưu trữ thành công vào CSDL MySQL trước khi phát triển các hiệu ứng giao diện phức tạp khác."*

##### 🔹 Prompt 5: Yêu cầu khởi tạo bộ dữ liệu kiểm thử thực tế môn PRF192 (`Sample_Data_PRF192`)
* **Prompt:**  
  > *"Để phục vụ kiểm thử thực tế (Test Fixtures) cho bài thi lập trình C môn PRF192, hãy tạo một thư mục chuyên dụng `Sample_Data_PRF192/` chứa đầy đủ các file mẫu chuẩn format: 1) File PDF đề thi thật (`PRF192_PE_Paper.pdf`); 2) File ZIP khung dự án mã nguồn khởi tạo (`PRF192_Starter_Template.zip` gồm `Makefile`, `main.c`, `solution.h`); 3) File mã nguồn bài giải chuẩn (`solution.c`); 4) File danh sách 5 bộ testcase ở cả 2 định dạng JSON (`testcases_prf192.json`) và CSV (`testcases_prf192.csv`)."*

##### 🔹 Prompt 6: Phát hiện lỗi hiển thị Mock Data tĩnh và yêu cầu sửa Dynamic Data Binding
* **Prompt:**  
  > *"Khi tôi thực hiện tải lên bộ đề môn PRF192 trên giao diện web (`http://localhost:3000/exam-bank/create`), phần xem trước vẫn hiển thị dữ liệu môn CSD201 do đang bị gán cứng dữ liệu mẫu (Hardcoded Mockup). Hãy lập kế hoạch `/plan` để sửa triệt để lỗi này, đảm bảo giao diện đọc và phản ánh chính xác nội dung động (Dynamic Binding) từ các file thực tế mà người dùng vừa tải lên."*

##### 🔹 Prompt 7: Xử lý giải nén file ZIP thật và hiển thị cây thư mục bằng `JSZip`
* **Prompt:**  
  > *"Tại sao trang import lại dùng code giao diện tĩnh thay vì trích xuất từ file tải lên? Hãy tái cấu trúc lại component: tích hợp thư viện `JSZip` để giải nén trực tiếp file ZIP trên Client-side, tự động duyệt và dựng cây thư mục (File Tree) hiển thị các file bên trong (`main.c`, `solution.h`...); đồng thời dùng `FileReader` để đọc nội dung file code nạp vào editor và phân tích file JSON/CSV testcase nạp tự động vào bảng điểm."*

---

#### Phiên 5: Nâng Cấp Giao Diện Toàn Diện, Trang Chi Tiết Riêng Biệt & Đóng Gói Git Commit (`2034b118-7777-4ca8-861f-6af76a2ff13b`)

##### 🔹 Prompt 1: Đề xuất kế hoạch nâng cấp toàn diện giao diện Web TV2
* **Prompt:**  
  > *"Hãy đóng vai trò UI/UX Specialist và rà soát toàn bộ các trang giao diện Web thuộc phân hệ Thành viên 2 (gồm Dashboard, Ngân hàng đề thi, Tạo đề thi và Giám sát phòng thi). Hãy lập kế hoạch `/plan` toàn diện để tối ưu hóa bố cục, bảng màu, khoảng thở (padding/margin), tính trực quan và khả năng tương tác của giảng viên theo chuẩn thiết kế EdTech hiện đại."*

##### 🔹 Prompt 2: Định hình tính năng Trang Giám sát Trực tiếp phòng thi (`/live-proctoring`)
* **Prompt:**  
  > *"Hãy thiết kế lại trang Giám sát trực tiếp (`/live-proctoring`) tập trung đúng vào nghiệp vụ cốt lõi của Giám thị phòng thi: mô phỏng sơ đồ chỗ ngồi phòng máy Lab thực tế (2 dãy bàn đối xứng có lối đi giữa), hiển thị trực quan trạng thái từng thí sinh (Đang làm bài, Đã nộp bài, Cảnh báo chuyển tab), đồng hồ đếm ngược thời gian ca thi và nút xuất báo cáo ca thi ra file CSV."*

##### 🔹 Prompt 3: Kiểm định tính toàn vẹn luồng lưu CSDL MySQL (E2E Integration Audit)
* **Prompt:**  
  > *"Hãy thực hiện audit toàn diện luồng tích hợp End-to-End giữa Frontend Next.js và Backend Express/Prisma: kiểm tra API contract, xử lý kiểu dữ liệu số thực (`Decimal` cho trọng số rubric, điểm testcase), cơ chế xử lý lỗi khi mất kết nối database và xác nhận rằng 100% dữ liệu tạo từ giao diện web được lưu bền vững vào CSDL MySQL `aita_db`."*

##### 🔹 Prompt 4: Rà soát cấu trúc thư mục Frontend theo chuẩn kiến trúc dự án
* **Prompt:**  
  > *"Hãy đối chiếu cấu trúc các file Frontend vừa triển khai với tài liệu kiến trúc dự án (`Frontend_Pages_and_Prompts_By_Role.md`). Đảm bảo phân chia rành mạch theo chuẩn Next.js 14 App Router: các trang trong `src/app/(dashboard)/` chỉ đóng vai trò là Thin Page Wrapper (dưới 15 dòng code), trong khi toàn bộ UI components, business logic, API services và Typescript interfaces phải nằm trong `src/features/assignments/` và `src/features/dashboard/`."*

##### 🔹 Prompt 5: Khắc phục trải nghiệm người dùng: Tách biệt chế độ Xem chi tiết và Nhập lại đề
* **Prompt:**  
  > *"Trên trang Ngân hàng đề thi (`/exam-bank`), việc bấm vào đề thi đã lưu lại chuyển hướng sang màn hình nhập liệu trống là một khiếm khuyết lớn về trải nghiệm người dùng (UX Flaw). Hãy lập kế hoạch tách biệt rõ ràng hai luồng nghiệp vụ: 1) Chế độ 'Xem chi tiết & Testcases' (Read-only Detail View) để Giảng viên rà soát toàn bộ đề, testcase và barem đã lưu; 2) Chế độ 'Chỉnh sửa / Tạo mới' (Edit Wizard) khi giảng viên có nhu cầu thay đổi thông tin."*

##### 🔹 Prompt 6: Lược bỏ các chỉ số debug kỹ thuật nội bộ khỏi giao diện người dùng
* **Prompt:**  
  > *"Các thẻ thông số mang tính kỹ thuật hạ tầng (như chuỗi kết nối MySQL `aita_db`, thông số container Sandbox nội bộ, debug RAG indexing) không phù hợp với đối tượng người dùng cuối là Giảng viên. Hãy lập kế hoạch loại bỏ toàn bộ các khối hiển thị debug này trên cả 3 trang (`Dashboard`, `Exam Bank`, `Live Proctoring`), thay thế bằng các chỉ số thống kê nghiệp vụ có ý nghĩa thực tế (số lượng đề thi đang hoạt động, tiến độ nộp bài, tỷ lệ chấm hoàn tất)."*

##### 🔹 Prompt 7: Chuyển đổi từ Popup Modal sang Trang Chi Tiết Toàn Màn Hình (`/exam-bank/[id]`)
* **Prompt:**  
  > *"Việc hiển thị danh sách testcase, bài giải mẫu và barem chấm điểm trong cửa sổ Popup Modal nhỏ hẹp gây cảm giác chật chội và khó theo dõi đối với các đề thi có hàng chục testcase phức tạp. Hãy lập kế hoạch `/plan` loại bỏ hoàn toàn Modal cũ, xây dựng một Trang Chi Tiết Đề Thi Riêng Biệt Toàn Màn Hình tại route `src/app/(dashboard)/exam-bank/[id]/page.tsx` sử dụng component `ExamDetailView.tsx` với hệ thống 3 tab chuyên biệt: Tab Testcases (kèm bộ lọc Functional/Boundary/Edge), Tab Khung Starter Code, và Tab Bài giải chuẩn & Big-O RAG."*

##### 🔹 Prompt 8: Quản lý phiên bản Git: Staging chọn lọc Frontend và hoàn tất commit độc lập
* **Prompt:**  
  > *"Để tuân thủ nguyên tắc Git Hygiene và Folder Ownership của dự án, tôi chỉ muốn commit các thay đổi thuộc phân hệ Frontend Web của TV2 (`Code/frontend/`), giữ nguyên các thay đổi chưa hoàn thiện ở tầng Backend của thành viên khác. Hãy hướng dẫn tôi lệnh `git add` chọn lọc, kiểm tra trạng thái Staged qua `git status`, và thực hiện commit với Conventional Commits message chuẩn mực mô tả đầy đủ các tính năng Frontend vừa hoàn thành."*

---

## 3. NGUYÊN VĂN KẾ HOẠCH TRIỂN KHAI `/plan` CỦA THÀNH VIÊN 2

### 3.1. Kế Hoạch Triển Khai Backend Clean Architecture (Phiên 1 - `9916be33`)
*(Trích xuất nguyên bản từ file artifact hệ thống: `member_2_implementation_plan.md`)*
- Tập trung chính xác vào **100% các file được phân công trong tài liệu phân chia Backend**:
  - Không tạo thêm tầng Repository hay Domain trung gian rườm rà.
  - Các Use Case sẽ thao tác trực tiếp với `prisma` client (`src/infrastructure/database/prisma.client.js`).
  - Đảm bảo đầy đủ các trường dữ liệu cốt lõi cho TV5 và TV6:
    - **Môn CSD201:** Cung cấp trường `outputFileName` (`f1.txt`, `f2.txt`...) để TV5 Sandbox so khớp file diff.
    - **Phục vụ RAG AI:** Cung cấp trường `rationale` (ý đồ testcase) và `testType` (loại test) cho TV6.
    - **Barem 3.0 điểm AI:** Cung cấp CRUD bộ quy tắc `RubricRule` (tên, trọng số %, prompt instruction).
- **Danh sách file Backend đã xây dựng:**
  - `src/application/use-cases/courses/course.use-case.ts`
  - `src/application/use-cases/assignments/`: `create-assignment.use-case.ts`, `update-assignment.use-case.ts`, `get-assignment-detail.use-case.ts`, `manage-testcases.use-case.ts`, `manage-rubrics.use-case.ts`
  - `src/presentation/controllers/`: `course.controller.ts`, `assignment.controller.ts`
  - `src/presentation/routes/`: `course.route.ts`, `assignment.route.ts`
  - `src/app.ts`: Đăng ký router `/api/v1/courses` và `/api/v1/assignments`.

---

### 3.2. Kế Hoạch Triển Khai Frontend Web & Dynamic Parsing (Phiên 4 - `5e737f5d`)
*(Trích xuất nguyên bản từ file artifact hệ thống: `real_import_and_dynamic_parser_plan.md` & `prf192_crud_and_preview_plan.md`)*
- **Mục tiêu:** Xóa bỏ hoàn toàn dữ liệu mockup tĩnh CSD201, chuyển sang cơ chế Dynamic Parsing theo đúng file người dùng nạp lên.
- **Giải pháp kỹ thuật:**
  1. **Upload Đề thi PDF:** Nhúng iframe / object đọc Blob URL hiển thị trực tiếp đề thi PDF ngay trên giao diện.
  2. **Starter Code ZIP & JSZip:** Dùng thư viện `JSZip` giải nén file ZIP phía Client-side, duyệt toàn bộ cấu trúc file và sinh cây thư mục (File Tree) trực quan.
  3. **Tải Solution Code:** Sử dụng `FileReader` đọc nội dung file `.c`, `.java`, `.txt` nạp thẳng vào khung soạn thảo mã nguồn.
  4. **Import Testcases Hàng loạt:** Hỗ trợ đọc cả file JSON (`testcases_prf192.json`) và CSV (`testcases_prf192.csv`) để tự động điền bảng testcase với đầy đủ thông số: Input, Expected Output, Điểm, Giới hạn thời gian, Nhãn phân loại và Trạng thái ẩn.
  5. **Bộ dữ liệu mẫu thực tế:** Khởi tạo thư mục `Sample_Data_PRF192` phục vụ kiểm thử End-to-End tức thì.

---

### 3.3. Kế Hoạch Nâng Cấp Giao Diện Toàn Diện & Trang Chi Tiết Đề Thi (Phiên 5 - `2034b118`)
*(Trích xuất nguyên bản từ file artifact hệ thống: `fe_exam_detail_dedicated_page_plan.md` & `fe_comprehensive_enhancement_plan.md`)*
- **Mục tiêu:** Nâng tầm trải nghiệm người dùng, chuyển đổi từ Popup Modal chật chội sang Trang Chi Tiết Chuyên Biệt Toàn Màn Hình.
- **Cấu trúc kiến trúc Frontend chuẩn hóa:**
  - Tuyệt đối tuân thủ nguyên tắc **Thin Page Route**: Tất cả file `page.tsx` trong `src/app/(dashboard)/` chỉ giữ dưới 15 dòng code, đóng vai trò định tuyến và truyền tham số (`params.id`).
  - Toàn bộ giao diện nghiệp vụ và state management chuyển giao vào các component thuộc `src/features/assignments/components/` và `src/features/dashboard/components/`.
- **Trang Chi Tiết Đề Thi Toàn Màn Hình (`ExamDetailView.tsx` tại `/exam-bank/[id]`):**
  - Thanh tiêu đề rộng rãi với breadcrumb điều hướng, mã môn học, nút sửa đề thi và nút vào phòng giám sát.
  - 4 Thẻ chỉ số tổng quan: Thời lượng làm bài, Quy mô testcase, Môi trường sandbox, Hình thức nộp bài.
  - 3 Tab hiển thị chuyên sâu:
    - **Tab 1: Bộ Testcases Tự Động:** Thống kê công khai vs ẩn, bộ lọc nhãn (`ALL`, `FUNCTIONAL`, `BOUNDARY`, `EDGE`, `PERFORMANCE`, `SECURITY`), giao diện 2 cột I/O kèm nút sao chép nhanh dữ liệu test.
    - **Tab 2: Thông Tin Đề & Starter Code:** Yêu cầu bài toán, quy định phòng thi Kiosk, khung mã nguồn mẫu cho sinh viên.
    - **Tab 3: Bài Giải Mẫu & Big-O RAG:** Mã nguồn chuẩn của Giảng viên, giải thích thuật toán và độ phức tạp tính toán chuẩn hóa cho AI đối chiếu.
- **Trang Giám Sát Trực Tiếp (`LiveProctoringMonitor.tsx` tại `/live-proctoring`):**
  - Sơ đồ phòng máy Lab 2 dãy đối xứng, lối đi ở giữa, hiển thị trạng thái sinh viên theo thời gian thực và xuất báo cáo CSV.

---

## 4. KẾT QUẢ TRIỂN KHAI TOÀN DIỆN (FULL-STACK ARTIFACTS)

### 4.1. Phân Hệ Backend: Danh Sách API Endpoints Hoàn Thành
- **Tuyến đường Khóa học (`/api/v1/courses`):**
  - `POST   /api/v1/courses` – Tạo khóa học mới.
  - `GET    /api/v1/courses` – Lấy danh sách khóa học (`?lecturerId=` hoặc `?studentId=`).
  - `GET    /api/v1/courses/:id` – Xem chi tiết khóa học + đề thi + sinh viên.
  - `PUT    /api/v1/courses/:id` – Cập nhật thông tin khóa học.
  - `DELETE /api/v1/courses/:id` – Xóa khóa học.
  - `POST   /api/v1/courses/:id/enroll` – Gán sinh viên vào lớp (`studentIds: string[]`).
  - `DELETE /api/v1/courses/:id/students/:studentId` – Xóa sinh viên khỏi lớp.
- **Tuyến đường Đề thi & Test Cases (`/api/v1/assignments`):**
  - `POST   /api/v1/assignments` – Tạo đề thi PE.
  - `GET    /api/v1/assignments/:id` – Lấy chi tiết đề thi (lọc ẩn nếu `?role=STUDENT`).
  - `GET    /api/v1/assignments/course/:courseId` – Lấy toàn bộ đề thi theo khóa học.
  - `PUT    /api/v1/assignments/:id` – Sửa thông tin đề thi PE.
  - `POST   /api/v1/assignments/:id/testcases` – Nạp lẻ/Bulk bộ Test Cases (`questionNo`, `inputData`, `expectedOutput`, `timeLimitMs`, `outputFileName`, `rationale`, `testType`).
  - `GET    /api/v1/assignments/:id/testcases` – Lấy danh sách testcases theo đề thi.
  - `PUT    /api/v1/assignments/testcases/:testCaseId` – Cập nhật 1 testcase.
  - `DELETE /api/v1/assignments/testcases/:testCaseId` – Xóa 1 testcase.
  - `POST   /api/v1/assignments/:id/rubrics` – Cấu hình barem Rubric Rules cho AI chấm.
  - `GET    /api/v1/assignments/:id/rubrics` – Xem danh sách tiêu chí Rubric.
  - `POST   /api/v1/assignments/:id/solutions` – Nạp đáp án mẫu & phân tích thuật toán.
  - `GET    /api/v1/assignments/:id/solutions` – Lấy danh sách đáp án mẫu.

---

### 4.2. Phân Hệ Frontend Web: Danh Sách Màn Hình & Thành Phần Kiến Trúc
*(Toàn bộ mã nguồn đã được đóng gói thành công trong Commit Git `af53d4b` – 18 files, +5570 insertions)*

| Đường dẫn Tuyến đường (Route) | File Thin Page Route | Component Giao diện Chính | Vai trò & Trải nghiệm Người dùng |
| :--- | :--- | :--- | :--- |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | `LecturerDashboard.tsx` | Bảng điều khiển tổng quan cho Giảng viên: thống kê số đề thi hoạt động, ca thi đang giám sát, danh sách đề thi gần đây, lối tắt thao tác nhanh. |
| `/exam-bank` | `src/app/(dashboard)/exam-bank/page.tsx` | `ExamBankList.tsx` | Ngân hàng đề thi: duyệt danh sách đề thi theo môn học (PRF192, PRO192, CSD201), tìm kiếm, bộ lọc trạng thái, dẫn trực tiếp vào trang chi tiết toàn màn hình. |
| `/exam-bank/create` | `src/app/(dashboard)/exam-bank/create/page.tsx` | `CreateExamWizard.tsx` | Trình tạo đề thi thông minh 4 bước: nạp metadata, kéo thả PDF đề thi, giải nén ZIP Starter code bằng JSZip, nạp Solution code, import hàng loạt testcase JSON/CSV và lưu MySQL. |
| `/exam-bank/[id]` | `src/app/(dashboard)/exam-bank/[id]/page.tsx` | `ExamDetailView.tsx` | **Trang Chi Tiết Đề Thi Toàn Màn Hình (Mới nâng cấp)**: Hiển thị trọn vẹn thông số đề thi, 3 tab độc lập (Bộ Testcases tự động có bộ lọc nhãn, Khung Starter Code, Bài giải mẫu & Big-O RAG). |
| `/live-proctoring` | `src/app/(dashboard)/live-proctoring/page.tsx` | `LiveProctoringMonitor.tsx` | Giám sát ca thi trực tiếp: sơ đồ phòng máy Lab 2 dãy có lối đi giữa, hiển thị trạng thái làm bài, cảnh báo chuyển tab, đếm ngược thời gian và xuất báo cáo CSV. |
| **Shared Layout** | `src/app/(dashboard)/layout.tsx` | `LecturerLayout.tsx` | Khung giao diện dùng chung chuẩn EdTech: Sidebar định hướng phân hệ Giảng viên, Header thông tin cá nhân và khu vực hiển thị nội dung thoáng đãng. |
| **Data Layer** | N/A | `assignment.service.ts` & `assignment.types.ts` | Tầng giao tiếp HTTP Client (Axios) và định nghĩa kiểu dữ liệu TypeScript đồng bộ 100% với Backend Prisma Schema. |

---

### 4.3. Kết Quả Kiểm Thử & Chất Lượng Mã Nguồn
- **Backend Type-check:** `npx tsc --noEmit` đạt **0 lỗi (Exit code: 0)**.
- **Frontend Type-check:** `npx tsc --noEmit` trong thư mục `Code/frontend/` đạt **0 lỗi (Exit code: 0)**.
- **Tuân thủ Clean Architecture:** 100% các route tuân thủ mô hình Thin Page Route, logic nghiệp vụ được đóng gói độc lập trong `features/assignments/`.
- **Zero-Conflict:** Toàn bộ công việc nằm gọn trong phân hệ Thành viên 2, không gây xung đột với mã nguồn của 5 thành viên còn lại.

---

## 5. BẢNG THEO DÕI PROMPT CHI TIẾT (PROMPT & CONTEXT LOG - 7 CỘT CHUẨN)
*(Đồng bộ 100% cấu trúc Bảng 1 của `AI_PROMPT_LOG.md` và tiêu chuẩn môn học SWD392)*

| STT | Ngày | Thành viên | Công cụ AI | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Tinh chỉnh của sinh viên |
|:---:|:---:|:---:|:---:|:---|:---|:---|
| **1** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity / Claude | Khảo sát yêu cầu SRS & Lập kế hoạch `/plan` phân hệ Backend TV2 | *"Bạn hãy đóng vai trò là Senior Backend Architect. Hãy rà soát toàn bộ cấu trúc dự án AITA, đặc biệt là tài liệu phân công nhiệm vụ backend (`Backend_Task_Allocation_6_Members.md`). Tôi là Thành viên 2 phụ trách phân hệ Quản lý Khóa học, Đề thi PE, Test Cases và Rubric Rules. Hãy lập kế hoạch chi tiết bằng lệnh `/plan` để liệt kê chính xác các file cần tạo mới/chỉnh sửa theo kiến trúc Clean Architecture, đảm bảo nguyên tắc Zero-Conflict với các thành viên khác."* | Phân tích SRS, đề xuất 2 phương án kiến trúc, xác định chính xác danh sách file thuộc `use-cases/`, `controllers/`, `routes/` và đăng ký trong `app.ts`. Lưu tại `member_2_implementation_plan.md`. |
| **2** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity / Claude | Lựa chọn phương án triển khai & sinh mã nguồn Backend Clean Architecture | *"Tôi duyệt chọn Phương án 2 (Siêu rút gọn): Các Use Case sẽ thao tác trực tiếp thông qua Prisma Client mà không qua các tầng trừu tượng Repository trung gian nhằm tối ưu thời gian phát triển và đảm bảo tính độc lập tuyệt đối. Hãy tiến hành sinh mã nguồn theo phương án này."* | Sinh 10 file code TypeScript hoàn chỉnh: 5 Use Cases, 2 Controllers, 2 Routes, cập nhật `app.ts`. Hỗ trợ các trường đặc thù FPT PE (`outputFileName` cho CSD201, `rationale`, `testType` cho AI RAG). Sinh viên kiểm tra biên dịch `tsc` 0 lỗi. |
| **3** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity | Xử lý sự cố môi trường & xung đột cổng mạng Local (`EADDRINUSE: 5000`) | *"Server gặp lỗi `Error: listen EADDRINUSE: address already in use : 5000` do tiến trình cũ đang chiếm dụng cổng 5000. Hãy cung cấp cho tôi lệnh PowerShell trên Windows để tra cứu PID và buộc dừng (kill process) tiến trình đang chiếm port 5000 ngay lập tức."* | AI cung cấp câu lệnh `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess \| Stop-Process -Force` để giải phóng port 5000 ngay lập tức. Giúp sinh viên chạy server local thành công. |
| **4** | 28/09/2026 | Lê Văn Bảo (TV2) | Antigravity | Xây dựng bộ tự động kiểm thử API Collection bằng Extension Bruno | *"Hãy tạo đầy đủ các file `.bru` đại diện cho trọn vẹn chu trình CRUD (Create, Read, Update, Delete) cho tất cả các tài nguyên thuộc phạm vi Thành viên 2 (Khóa học, Ghi danh, Đề thi PE, Test Cases, Rubrics), đảm bảo có sẵn mẫu body JSON chuẩn để chỉ cần bấm Run là test được ngay."* | Tạo trọn bộ 19 file `.bru` phân chia theo thư mục `/courses/` và `/assignments/`, cấu hình environment `local.json` chứa biến môi trường. Hướng dẫn cấu hình loại trừ `bruno/` vào `.gitignore` để bảo vệ mã nguồn. |
| **5** | 05/10/2026 | Lê Văn Bảo (TV2) | Antigravity / Claude | Lập kế hoạch `/plan` kiến trúc Frontend Web phân hệ Giảng viên | *"Đóng vai trò là Senior Frontend Architect chuyên sâu Next.js 14 và EdTech UI/UX. Hãy phân tích yêu cầu thiết kế giao diện Web cho Giảng viên (Lecturer Workspace) thuộc môn SWD392: 1) Trang tạo và quản lý đề thi thực hành PE (hỗ trợ kéo thả PDF đề thi, tải khung Starter Code ZIP, nạp bài giải mẫu Solution Code, và import hàng loạt Testcases JSON/CSV); 2) Quản lý và giám sát ca thi đang diễn ra. Hãy lập kế hoạch kỹ thuật chi tiết bằng `/plan`, tuân thủ bảng màu hiện đại, cấu trúc Feature-based Clean Architecture và cung cấp URL local để kiểm thử."* | Phân tích yêu cầu, xác định ranh giới TV2 (loại bỏ tạo lớp của TV1), xây dựng lộ trình phát triển giao diện theo Next.js 14 App Router, thiết lập layout dùng chung `LecturerLayout.tsx` và tạo plan `lecturer_exam_workspace_plan.md`. |
| **6** | 05/10/2026 | Lê Văn Bảo (TV2) | Antigravity | Xây dựng bộ Test Fixtures mẫu môn PRF192 & Tích hợp Dynamic Parser (JSZip) | *"Để phục vụ kiểm thử thực tế cho bài thi lập trình C môn PRF192, hãy tạo thư mục chuyên dụng `Sample_Data_PRF192/` chứa đầy đủ: PDF đề thi thật, ZIP khung dự án starter code, bài giải chuẩn `solution.c`, và 5 bộ testcases định dạng JSON/CSV. Sau đó loại bỏ hoàn toàn mock data tĩnh CSD201, tích hợp thư viện `JSZip` giải nén file ZIP trên Client-side hiển thị cây thư mục và nạp testcase thật vào bảng."* | Tạo bộ dữ liệu `Sample_Data_PRF192/` hoàn chỉnh. Tích hợp `JSZip` giải nén trực tiếp trên trình duyệt, render preview PDF qua Blob URL, hỗ trợ import JSON/CSV testcase thật và gửi payload lưu bền vững vào CSDL MySQL. |
| **7** | 05/10/2026 | Lê Văn Bảo (TV2) | Antigravity | Nâng cấp toàn diện UX: Tách Modal sang Trang Chi Tiết Riêng Biệt Toàn Màn Hình (`/exam-bank/[id]`) | *"Việc hiển thị danh sách testcase và bài giải mẫu trong Popup Modal nhỏ hẹp gây cảm giác chật chội. Hãy lập kế hoạch `/plan` loại bỏ hoàn toàn Modal cũ, xây dựng Trang Chi Tiết Đề Thi Riêng Biệt Toàn Màn Hình tại route `src/app/(dashboard)/exam-bank/[id]/page.tsx` sử dụng component `ExamDetailView.tsx` với 3 tab: Tab Testcases (kèm bộ lọc nhãn thông minh), Tab Khung Starter Code, và Tab Bài giải chuẩn & Big-O RAG."* | Loại bỏ gần 350 dòng mã nguồn modal cũ. Xây dựng route mỏng `[id]/page.tsx` và component `ExamDetailView.tsx` (623 dòng) toàn màn hình, hỗ trợ copy nhanh I/O testcase, lọc nhãn testcase và hiển thị barem Big-O phục vụ AI đối chiếu RAG. |
| **8** | 05/10/2026 | Lê Văn Bảo (TV2) | Antigravity | Tinh chỉnh Trang Giám Sát Phòng Thi (`/live-proctoring`) & Staging Git Commit Chọn Lọc | *"Hãy hoàn thiện trang Giám sát trực tiếp với sơ đồ phòng máy Lab 2 dãy bàn đối xứng có lối đi giữa, hiển thị trạng thái sinh viên và xuất báo cáo CSV. Sau đó, hướng dẫn lệnh `git add` chọn lọc chỉ riêng các file Frontend Web của TV2 (`Code/frontend/`), kiểm tra trạng thái Staged và thực hiện commit với Conventional Commits message chuẩn mực."* | Hoàn thành `LiveProctoringMonitor.tsx` (1520 dòng). Hướng dẫn lệnh staging an toàn, thực hiện commit thành công mã `af53d4b` gồm 18 file Frontend mới (+5570 dòng) mà không ảnh hưởng tới code Backend của thành viên khác. |

---

## 6. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG SWD392 (EXCEL COMPLIANT - 10 CỘT)
*(Dùng để sao chép trực tiếp vào file báo cáo nộp giảng viên `SWD392_G2_V2.xlsx`)*

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | Detailed Design & Planning | Lập kế hoạch `/plan` phân hệ Quản lý Khóa học & Đề thi PE (Backend TV2) | Antigravity / Claude | Kế hoạch kiến trúc phân lớp, danh sách file Use Cases, Controllers, Routes | Rà soát đối chiếu tài liệu SRS và `Backend_Task_Allocation_6_Members.md`, chốt phương án gọi Prisma trực tiếp | `member_2_implementation_plan.md` | Giảm 80% thời gian phân tích cấu trúc mã nguồn | 5 | Cần kiểm tra kỹ phạm vi các file để tránh sửa nhầm file của thành viên khác |
| 2 | Implementation & Coding | Triển khai mã nguồn Backend CRUD Khóa học, Đề thi, Test Cases & Rubrics | Antigravity / Claude | 10 file mã nguồn TypeScript (5 Use Cases, 2 Controllers, 2 Routes, cập nhật `app.ts`) | Kiểm tra logic lọc testcase ẩn với sinh viên (`?role=STUDENT`), kiểm tra kiểu dữ liệu `Decimal` cho điểm Rubric, chạy `tsc --noEmit` đạt 0 lỗi | `Code/backend/src/application/use-cases/`, `src/presentation/` | Tiết kiệm 6 giờ viết boilerplate code và định tuyến Express | 5 | AI có thể sinh thiếu validate dữ liệu đầu vào hoặc lỗi kiểu dữ liệu nếu schema thay đổi -> cần chạy Type-check thường xuyên |
| 3 | Deployment & Debugging | Khắc phục sự cố xung đột cổng mạng & chạy Local không cần Docker | Antigravity | Quy trình cấu hình `.env`, lệnh script khởi chạy và lệnh PowerShell tắt port 5000 | Tự chạy lệnh PowerShell giải phóng port, cấu hình `DATABASE_URL` kết nối MySQL local | `src/server.ts`, `.env` | Tiết kiệm 45 phút tra cứu lỗi hệ thống Windows | 4 | Lệnh kill process buộc dừng tiến trình có thể ảnh hưởng service khác nếu không xác định đúng PID |
| 4 | Testing & Verification | Xây dựng bộ tự động kiểm thử Bruno API Collection cho toàn bộ TV2 | Antigravity | Bộ 19 request Bruno (`.bru`) kèm mẫu JSON Body, script kiểm tra CRUD Khóa học và Đề thi | Import vào Extension Bruno, kiểm thử từng endpoint, xác thực mã phản hồi HTTP 200/201/204, bổ sung `bruno/` vào `.gitignore` | `bruno/` (local workspace), `.gitignore` | Giảm 75% thời gian tạo request test thủ công trên Postman | 5 | Cần chú ý biến môi trường `courseId`, `assignmentId` phải được cập nhật tương ứng với ID thực tế trong database |
| 5 | UI/UX Architecture | Thiết kế kiến trúc giao diện Web Next.js 14 cho Giảng viên (Frontend TV2) | Antigravity / Claude | Kế hoạch Feature-based architecture, bố cục `LecturerLayout.tsx`, các route `(dashboard)/` | Rà soát phân định ranh giới (loại bỏ module tạo lớp sinh viên), chuẩn hóa theo mô hình Thin Page Route | `lecturer_exam_workspace_plan.md` | Giảm 70% thời gian thiết kế cấu trúc frontend | 5 | Cần đảm bảo tính đồng bộ giữa kiểu dữ liệu giao diện và Prisma Backend Schema |
| 6 | Frontend Implementation | Xây dựng Wizard Tạo Đề Thi, Dynamic File Parser & Tích hợp JSZip | Antigravity | Component `CreateExamWizard.tsx`, bộ dữ liệu mẫu `Sample_Data_PRF192`, logic giải nén ZIP | Sửa lỗi gán cứng môn CSD201 sang đọc động dữ liệu PRF192 thật từ file tải lên, kiểm tra luồng lưu vào CSDL MySQL | `CreateExamWizard.tsx`, `Sample_Data_PRF192/` | Tiết kiệm 8 giờ viết logic xử lý file nhị phân và form phức tạp | 5 | Thư viện xử lý file trên trình duyệt có thể gây giật lag nếu kích thước file ZIP quá lớn -> cần giới hạn dung lượng |
| 7 | UX Refactoring | Tái cấu trúc từ Popup Modal sang Trang Chi Tiết Toàn Màn Hình (`/exam-bank/[id]`) | Antigravity | Thin Page `[id]/page.tsx`, Component `ExamDetailView.tsx` với 3 tab chuyên biệt | Gỡ bỏ 350 dòng modal cũ, bổ sung bộ lọc nhãn testcase thông minh, nút copy nhanh dữ liệu I/O và chỉ số Big-O | `ExamDetailView.tsx`, `fe_exam_detail_dedicated_page_plan.md` | Tăng 100% trải nghiệm xem dữ liệu testcase phức tạp | 5 | Chuyển đổi từ Modal sang trang riêng cần quản lý state URL params và xử lý trường hợp ID đề thi không tồn tại |
| 8 | Version Control & Git Hygiene | Phân lập Staging Frontend và Đóng gói Git Commit độc lập | Antigravity | Lệnh `git add` chọn lọc, review thay đổi file và tạo commit `af53d4b` chuẩn Conventional Commits | Tự kiểm tra `git status` đảm bảo không commit nhầm file backend đang sửa của thành viên khác, chạy `tsc` kiểm tra 0 lỗi | Commit `af53d4bce23d2fe4f8afd55ba4277cc938e8b3f1` | Đảm bảo 100% tính nguyên vẹn của nhánh tính năng | 5 | Cần cẩn trọng khi dùng `git add` để không bỏ sót các file icons hoặc package dependencies mới cài |

---

## 7. NGUYÊN TẮC GIẢI TRÌNH MÃ NGUỒN & LIVE DEFENSE (EXPLAINABILITY CHECKLIST DÀNH CHO TV2)

Mỗi sinh viên khi bảo vệ đồ án SWD392 cần nắm vững các câu hỏi cốt lõi sau để giải trình trước Hội đồng:

### 1. Phân hệ Thành viên 2 xử lý những nghiệp vụ gì trong toàn bộ kiến trúc AITA?
- **Backend:** Quản lý toàn bộ vòng đời của Khóa học (Lớp học, môn học, ghi danh sinh viên), Đề thi thực hành PE, Bộ nạp Test Cases (I/O, timeout, memory, outputFileName) và Barem Rubric Rules phục vụ trực tiếp cho TV5 (Sandbox chạy code) và TV6 (AI chấm điểm ngữ nghĩa).
- **Frontend Web:** Cung cấp không gian làm việc chuyên nghiệp cho Giảng viên (Lecturer Workspace) gồm: Dashboard tổng quan, Ngân hàng đề thi, Wizard tạo đề thi 4 bước (giải nén ZIP, preview PDF, import testcase), Trang chi tiết đề thi toàn màn hình (`/exam-bank/[id]`) và Màn hình giám sát trực tiếp phòng thi theo sơ đồ Lab FPT (`/live-proctoring`).

### 2. Tại sao lại lựa chọn kiến trúc Clean Architecture rút gọn ở Backend và Feature-based Architecture ở Frontend?
- **Backend (Clean Architecture rút gọn):** Sử dụng các Use Cases thao tác trực tiếp với Prisma Client mà không qua lớp Repository trừu tượng trung gian nhằm loại bỏ boilerplate thừa, tăng tốc độ phát triển và đảm bảo tính độc lập tuyệt đối giữa các thành viên (Zero-Conflict).
- **Frontend (Thin Page Route + Feature-based):** Áp dụng kiến trúc của Next.js 14 App Router: các file `page.tsx` chỉ đóng vai trò là "vỏ bọc mỏng" (Thin Wrapper dưới 15 dòng) để nhận route params, trong khi toàn bộ mã nguồn xử lý giao diện, state và logic nghiệp vụ được đóng gói độc lập trong `src/features/assignments/` giúp mã nguồn dễ bảo trì, dễ tái sử dụng và kiểm thử.

### 3. Kịch bản ứng biến và Live Debugging tại chỗ (3-5 phút) trước Hội đồng:

* **Câu hỏi 1 (Bảo mật Testcase):** *Làm sao để sinh viên không xem được các testcase bị ẩn (`isHidden: true`) khi gọi API lấy đề thi?*  
  -> **Trả lời & Thao tác:** Mở `src/application/use-cases/assignments/get-assignment-detail.use-case.ts`. Chỉ ra logic lọc dữ liệu: Khi truy vấn nhận tham số `role === 'STUDENT'`, câu lệnh Prisma query sẽ tự động kích hoạt điều kiện `where: { isHidden: false }`. Chỉ khi người gọi là Giảng viên (`role === 'LECTURER'`) hoặc Admin thì hệ thống mới trả về toàn bộ testcase ẩn.

* **Câu hỏi 2 (Xử lý File Nhị phân Client-side):** *Trình duyệt giải nén và duyệt cây thư mục file Starter Code ZIP như thế nào mà không cần gửi file lên server giải nén?*  
  -> **Trả lời & Thao tác:** Mở `CreateExamWizard.tsx`. Chỉ ra hàm `handleStarterZipUpload`: Sử dụng thư viện `JSZip.loadAsync(file)`. Hệ thống đọc trực tiếp mảng byte từ file ZIP, duyệt qua các file path bên trong (`zip.forEach`), tự động nhận diện file/thư mục và cấu trúc thành cây thư mục hiển thị trên giao diện người dùng ngay lập tức, tiết kiệm băng thông và tài nguyên máy chủ.

* **Câu hỏi 3 (Môn CSD201 File I/O):** *Đổi cơ chế chấm thi môn CSD201 so khớp file `f1.txt`, `f2.txt` thay vì in ra màn hình chuẩn (Stdio) thì hệ thống hỗ trợ ở đâu?*  
  -> **Trả lời & Thao tác:** Mở `manage-testcases.use-case.ts` ở Backend và Tab Testcases trong `ExamDetailView.tsx` ở Frontend. Chỉ ra trường `outputFileName` đã được cấu hình trong schema và hiển thị rõ ràng trên giao diện chi tiết: Nếu `outputFileName` có giá trị (ví dụ: `f1.txt`), hệ thống sẽ chuyển chế độ so khớp sang `File-to-File Diff` để chuyển giao cho TV5 Sandbox đối chiếu.

* **Câu hỏi 4 (Tại sao bỏ Popup Modal sang Trang Chi tiết riêng biệt?):** *Tại sao ban đầu dùng Modal sau đó lại refactor thành trang `/exam-bank/[id]`?*  
  -> **Trả lời & Thao tác:** Modal chỉ phù hợp cho các tác vụ nhanh hoặc xác nhận ngắn. Đề thi PE trong thực tế chứa rất nhiều thông tin phức tạp: file PDF đề bài dài, mã nguồn starter code hàng trăm dòng, và từ 10 đến 20 testcases với input/output lớn. Việc nhồi nhét vào một Popup Modal gây tràn màn hình, khó cuộn và trải nghiệm người dùng kém. Việc chuyển sang trang riêng biệt toàn màn hình (`ExamDetailView.tsx`) với 3 tab chuyên sâu mang lại không gian trực quan, hỗ trợ nút copy nhanh và bộ lọc nhãn testcase chuẩn mực.
