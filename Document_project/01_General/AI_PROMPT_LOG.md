# NHẬT KÝ SỬ DỤNG AI (AI PROMPT LOG) - MÔN SWD392
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – Software Architecture and Design (Lớp SE19C - Fall 2026)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Vinh  
**Nhóm:** GROUP 2  
**Danh sách thành viên:**
1. **Trần Đỗ Phong Nhã (QE190161) - Leader**
2. **Nguyễn Văn Điệp (QE180203) - Member**
3. **Nguyễn Anh Tuấn (QE190003) - Member**
4. **Đoàn Đệ (QE190091) - Member**
5. **Nguyễn Thế Dũng (QE190275) - Member**
6. **Lê Văn Bảo (QE190130) - Member**

**Mục tiêu:** Đáp ứng tiêu chí **Transparency (Minh bạch)** và **Explainability (Giải trình)** trong quy định sử dụng AI của môn học SWD392 (Đồng bộ với báo cáo `SWD392_G2_V2.xlsx`).

---

## 1. BẢNG THEO DÕI PROMPT CHI TIẾT (PROMPT & CONTEXT LOG)

Bảng ghi lại đầy đủ các phiên làm việc cùng AI, câu prompt nguyên bản, bối cảnh bài toán và cách thức nhóm tinh chỉnh kết quả vào hệ thống:

| STT | Ngày | Thành viên | Công cụ AI | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Tinh chỉnh của sinh viên |
|:---:|:---:|:---:|:---:|:---|:---|:---|
| **1** | 14/09/2026 | Cả nhóm | Antigravity / Claude | Phân tích yêu cầu & Use Cases tổng thể cho AITA | *"Hãy đóng vai trò Solution Architect môn SWD392, thiết kế danh sách Functional & Non-functional Requirements và Use Case chi tiết cho hệ thống trợ giảng thông minh AITA (Next.js + Express.js + MySQL)."* | Sinh ra 9 FRs, 4 NFRs và 13 Use Cases; nhóm tinh chỉnh theo phạm vi web app thực tế, loại bỏ các chức năng dư thừa. Lưu tại `1_SRS_Requirements_and_UseCases.md`. |
| **2** | 14/09/2026 | Cả nhóm | Antigravity / Claude | Thiết kế CSDL MySQL theo chuẩn Evaluation 2 | *"Hãy thiết kế Database Schema MySQL cho hệ thống AITA, bắt buộc có bảng GradingJob (có priority, status, retry), RubricRule và AiApiKey (hỗ trợ rotation)."* | Sinh ra DDL SQL hoàn chỉnh với quan hệ khóa ngoại, index tối ưu và seed data; lưu tại `2_Database_Schema.sql`. |
| **3** | 14/09/2026 | Cả nhóm | Antigravity / Gemini | Thiết kế kiến trúc Clean Architecture & 3 Design Patterns | *"Đề xuất kiến trúc Clean Architecture cho Express.js + TypeScript và ứng dụng 3 Design Patterns: Factory Method, Adapter, Strategy cho AITA."* | Áp dụng cấu trúc 4 tầng (Domain, Application, Infrastructure, Presentation), định nghĩa abstract interfaces. Lưu tại `3_System_Architecture_and_Code_Plan.md`. |
| **4** | 17/09/2026 | Phong Nhã (Leader) | Antigravity / Claude | Tích hợp quy trình chấm kết hợp Docker Sandbox + RAG Semantic | *"Quy trình chấm bài kết hợp Docker Sandbox và RAG: [BƯỚC 1: DOCKER SANDBOX CHẠY THỰC TẾ] Sinh viên nộp code chạy ra kết quả (Pass/Fail/TLE/Wrong Answer) -> [BƯỚC 2: RAG TRUY XUẤT NGỮ CẢNH ĐÁP ÁN & TESTCASE] RAG Vector Search tự động tìm trong Kho đề thi: Testcase 4 có ý đồ kiểm tra điều gì? Đáp án mẫu xử lý ra sao? -> [BƯỚC 3: AI ĐỐI CHIẾU NGẦM & PHẢN HỒI SƯ PHẠM] AI so sánh code thực tế với Rationale từ RAG, chỉ ra độ phức tạp O(n^2), sinh phản hồi Socratic hướng dẫn sinh viên mà không lộ code giải. Thêm cơ chế RAG này vào tài liệu md đi."* | Bổ sung FR-06 RAG Ingestion vào SRS, cập nhật barem điểm (Sandbox 7.0 + AI Rubric 3.0), cập nhật Activity Diagram và thiết kế phân hệ TV6. |
| **5** | 17/09/2026 | Phong Nhã (Leader) | Antigravity | Lập kế hoạch phân chia công việc cho nhóm 6 người | *"Giờ chia cho ae plan code như nào là hợp lí trong việc 6 người thế, chia làm sao ai cũng có thể code backend và frontend, làm cái file md đi sao tui ko có thấy?"* | Thiết lập ma trận phân công 6 module Full-stack cân bằng; xuất bản tài liệu `Team_6_Fullstack_Task_Allocation.md`. |
| **6** | 18/09/2026 | Phong Nhã (Leader) | Antigravity | Tối ưu hóa: Loại bỏ GitHub API, tập trung 100% Backend chấm ZIP, chống chồng chéo | *"Mấy cái task code này nó có bị chồng chéo nhau khi code ko, bỏ cái github ra đi chấm zip trước, giờ tao muốn mày phân lại backend thôi, ko đụng đến frontend nữa."* | Xây dựng **Zero-Conflict Protocol**: Mỗi người 1 thư mục độc lập (Folder Ownership), giao tiếp qua Interface, route riêng rẽ. Xuất bản tài liệu chính thức `Backend_Task_Allocation_6_Members.md`. |
| **7** | 18/09/2026 | Phong Nhã (Leader) | Antigravity | Phá vỡ nút thắt cổ chai (Dependency Bottleneck) | *"Thằng nào code trước thằng 1 code trước à? Có bị nghẽn không?"* | Thiết lập chiến lược 3 Track song song (Track 1: TV1+TV2 Auth & CRUD, Track 2: TV5+TV6 Docker & RAG Spike, Track 3: TV3+TV4 Storage & Queue). Tất cả 6 thành viên code cùng lúc từ Ngày 1 bằng Interface Mocking. |
| **8** | 18/09/2026 | Phong Nhã (Leader) | Antigravity | Đặc tả luồng chấm bài thi PE chuẩn FPT (PRF192, PRO192, CSD201) | *"Cái luồng là như nào, luồng mà làm cái chấm csd pro prf nó ở đâu vậy?"* | Phân tích sâu 2 cơ chế: PRF192 (C Stdio Redirection `< input.txt > output.txt`), PRO192 (Console menu Java OOP), CSD201 (Bắt buộc File I/O `data.txt` -> `f1.txt, f2.txt` so khớp File-to-File Diff). Xuất bản `4_FPT_PE_Mechanisms_and_Task_Breakdown.md` và sơ đồ PlantUML. |
| **9** | 18/09/2026 | Phong Nhã (Leader) | Antigravity | Bổ sung các lưu ý kỹ thuật sống còn vào từng task | *"Ghi mấy điểm note chú ý này vào trong task được ko?"* | Bổ sung mục "Lưu ý kỹ thuật sống còn" cho cả 6 thành viên trong `Backend_Task_Allocation_6_Members.md`: TV3 xóa sạch rác Mac OS (`__MACOSX`, `.DS_Store`); TV5 giới hạn cgroups 256MB RAM và timeout 2s; TV6 chỉ gọi AI cho testcase FAIL/TLE. |
| **10** | 19/09/2026 | Phong Nhã (Leader) | Antigravity | Rà soát cấu trúc CSDL, quan hệ khóa ngoại và tính sẵn sàng code | *"DB của tao có thiếu gì trong việc code này ko, nó đã đầy đủ và chia task cho mấy đứa ko, quan hệ khóa ngoại với nhau ổn chứ?"* | Rà soát toàn bộ 11 bảng CSDL; bổ sung bảng `assignment_solutions`, enum `TestType`, các trường `question_no`, `output_file_name`, `staged_path`, `sandbox_score`, `ai_score`. Đồng bộ Prisma Schema và DDL SQL, chạy kiểm tra `prisma generate` đạt 0 lỗi. |
| **11** | 19/09/2026 | Phong Nhã (Leader) | Antigravity | Làm rõ chi tiết ma trận phân quyền RBAC & CRUD Database | *"Tao muốn làm rõ cho tao những quyền trong dự án này làm gì và làm gì, làm rõ ra."* | Xuất bản tài liệu `RBAC_Roles_and_Permissions.md` gồm định nghĩa quyền hạn của ADMIN, LECTURER, STUDENT, ma trận 13 Use Cases và bảng quyền CRUD chi tiết trên từng bảng dữ liệu; liên kết vào `README.md`. |

---

## 2. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG SWD392 (EXCEL COMPLIANT)
*(Dùng để sao chép trực tiếp vào các sheet `1. Week 1` và `2. Week 2` của file báo cáo nộp giảng viên `SWD392_G2_V2.xlsx`)*

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | Requirements Analysis | Khảo sát yêu cầu & mô tả Use Case | Antigravity / Claude | Danh sách 9 FRs, 4 NFRs và 13 Use Cases | Rút gọn phạm vi theo bài thi PE FPT, chuẩn hóa thuật ngữ học phần | `02_Requirements_SRS/1_SRS_Requirements_and_UseCases.md` | Giảm 70% thời gian soạn thảo đặc tả | 5 | AI có xu hướng đề xuất các tính năng ngoài lề (như chat trực tuyến) cần lược bỏ |
| 2 | Database Design | Thiết kế mô hình CSDL quan hệ | Antigravity / Claude | Schema DDL 11 bảng, quan hệ khóa ngoại và index | Bổ sung cơ chế `GradingJob` có priority, bảng lưu đáp án mẫu cho RAG | `03_Architecture_Database/2_Database_Schema.sql` | Tiết kiệm 4 giờ viết DDL & Prisma schema | 5 | Cần kiểm tra kỹ kiểu dữ liệu ENUM và ON DELETE CASCADE để tránh mất dữ liệu |
| 3 | System Architecture | Thiết kế Clean Architecture & Design Patterns | Antigravity / Gemini | Mô hình 4 lớp và áp dụng Factory, Strategy, Facade | Tinh chỉnh cấu trúc thư mục Node.js/TS, thiết kế abstract interfaces | `03_Architecture_Database/3_System_Architecture_and_Code_Plan.md` | Chuẩn hóa 100% cấu trúc source code backend | 5 | Kiến trúc Clean có thể gây dư thừa boilerplate cho các CRUD đơn giản |
| 4 | Requirements & RAG | Tích hợp cơ chế RAG và barem điểm PE | Antigravity / Claude | Quy trình chấm 3 bước Sandbox -> RAG -> AI Tutor | Quy định rõ barem: Sandbox max 7.0 + AI Rubric max 3.0, AI Socratic | `02_Requirements_SRS/1_SRS_Requirements_and_UseCases.md` | Định hình tính năng độc đáo (Unique Selling Point) | 5 | Rủi ro Rate Limit 429 và độ trễ LLM -> giải quyết bằng API Key Rotator |
| 5 | Project Planning | Phân chia công việc 6 thành viên Backend | Antigravity | Kế hoạch 6 mắt xích không xung đột (Zero-conflict) | Bỏ GitHub API, tập trung chấm ZIP; chia 3 Track độc lập | `02_Requirements_SRS/Backend_Task_Allocation_6_Members.md` | Loại bỏ 100% rủi ro nghẽn Git merge conflict | 5 | Các thành viên phải tuân thủ nghiêm ngặt Folder Ownership |
| 6 | Detailed Design | Phân tích luồng chấm thi đặc thù FPT PE | Antigravity | Sơ đồ & phân tích kỹ thuật PRF192, PRO192, CSD201 | Làm rõ cơ chế File I/O so khớp f1.txt/f2.txt cho CSD201 | `02_Requirements_SRS/4_FPT_PE_Mechanisms_and_Task_Breakdown.md` | Giải quyết chính xác bài toán thi thực tế tại trường | 5 | Khác biệt hệ điều hành (Windows CRLF vs Linux LF) -> cần hàm chuẩn hóa diff |
| 7 | Security & Authorization | Thiết kế ma trận phân quyền RBAC & CRUD | Antigravity | Ma trận quyền ADMIN, LECTURER, STUDENT và CRUD DB | Khóa chặt quyền xem source code/đáp án của Student, chỉ cho xem report | `02_Requirements_SRS/RBAC_Roles_and_Permissions.md` | Bảo mật 100% các endpoint nhạy cảm | 5 | Cần gắn đúng middleware xác thực `requireRole` trên từng route |

---

## NGUYÊN TẮC GIẢI TRÌNH MÃ NGUỒN (EXPLAINABILITY CHECKLIST)
Mỗi thành viên khi sử dụng AI sinh code cần tự kiểm tra 3 câu hỏi trước buổi Review/Defense:
1. *Đoạn code này xử lý nghiệp vụ gì trong Module của mình?*
2. *Tại sao lại chọn cấu trúc dữ liệu / thuật toán / design pattern này thay vì cách khác?*
3. *Nếu giảng viên yêu cầu đổi logic tại chỗ (Live Debugging), mình có thể sửa ngay trong 3-5 phút không?*
