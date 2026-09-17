# DỰ ÁN AITA (AI-POWERED TEACHING ASSISTANT SYSTEM)
**Môn học:** SWD392 – AI-Assisted System Design (Đại học FPT)  
**Mô hình:** RBL (Research-Based Learning) – 10 Tuần  
**Quy mô nhóm:** 4 – 5 thành viên (Mỗi thành viên phụ trách Full-stack 01 phân hệ)

---

## 1. TỔNG QUAN & MỤC TIÊU CỐT LÕI

**AITA** là nền tảng trợ giảng thông minh hỗ trợ tự động hóa toàn bộ chu trình đánh giá lập trình, chấm điểm đa chiều và phản hồi học tập tại môi trường đại học.

### 3 Bài toán cốt lõi hệ thống giải quyết:
1. **Tự động hóa đánh giá toàn diện:**
   - Thực thi và kiểm thử mã nguồn sinh viên an toàn trong môi trường cô lập (**Docker Sandbox**).
   - Đánh giá chất lượng mã nguồn sâu (**Semantic Code Assessment & RAG**): Kết hợp mô hình RAG đối chiếu mã nguồn sinh viên với **Đáp án mẫu (Reference Solution)** và **Ý đồ Testcase (Testcase Rationale)** để chấm điểm chuẩn xác, phân tích độ phức tạp thuật toán và chuẩn Clean Code.
2. **Trợ giảng AI thời gian thực (Real-time LLM Tutor với RAG Sư phạm):**
   - Tích hợp mô hình ngôn ngữ lớn (LLM) phản hồi 24/7. Nhờ cơ chế RAG truy xuất tài liệu giải và bẫy testcase của đề thi, AI phân tích chính xác nguyên nhân lỗi logic và đưa ra gợi ý định hướng tư duy (Socratic method) thay vì làm hộ code.
3. **Minh bạch hóa đóng góp dự án (Anti-Free-Riding):**
   - Tích hợp **Git API** để phân tích lịch sử commit, pull request, mã code thay đổi theo từng thành viên trong suốt kỳ học, đo lường sự đóng góp thực tế.

---

## 2. NĂM MŨI NHỌN NGHIÊN CỨU KỸ THUẬT (RESEARCH SPIKES - TUẦN 1 & 2)

Nhóm cần thực hiện nghiên cứu chuyên sâu và xây dựng Proof-of-Concept (POC) cho 5 trụ cột:

| Spike | Chủ đề nghiên cứu | Mục tiêu & Giải pháp kỹ thuật |
| :--- | :--- | :--- |
| **Spike 1** | **Docker Sandbox** | Chạy code sinh viên an toàn, cô lập mạng (network isolation), giới hạn tài nguyên (CPU, RAM, Execution Timeout), bảo vệ hệ thống khỏi mã độc (fork bombs, system calls nguy hại). |
| **Spike 2** | **Semantic Assessment & RAG** | Tích hợp **RAG (Retrieval-Augmented Generation)**: Vector hóa Đáp án mẫu (Reference Solution), Hướng dẫn giải (Solution Notes) và Ý đồ từng Testcase vào Vector DB (ChromaDB) để AI đối chiếu lỗi logic, đo độ phức tạp Big-O và xuất bảng điểm chi tiết. |
| **Spike 3** | **Redis Queue (Asynchronous Grading)** | Xử lý hàng đợi chấm bài bất đồng bộ, hỗ trợ cơ chế độ ưu tiên (`priority`), retry failed jobs, tránh nghẽn hệ thống khi số lượng nộp bài tăng vọt. |
| **Spike 4** | **Git API Integration** | Kết nối GitHub/GitLab API phân tích timeline, tần suất commit, diff lines, code churn nhằm chấm điểm minh bạch từng cá nhân. |
| **Spike 5** | **Vision AI** | Phân tích ảnh chụp sơ đồ thiết kế (UML), UI mockup hoặc tài liệu bài nộp dạng hình ảnh. |

---

## 3. ĐỀ XUẤT PHÂN CHIA PHÂN HỆ (MODULE DIVISION - FULL-STACK)

Mỗi thành viên đảm nhận vai trò Full-stack (Database, Backend API, Frontend UI, Unit/Integration Test):

- **Thành viên 1 - Module IAM & System Core:**
  - Xác thực & ủy quyền (Authentication/Authorization) dùng JWT & RBAC.
  - Quản lý người dùng: Admin, Giảng viên (Lecturer), Sinh viên (Student).
  - Quản trị lớp học, khóa học và phân quyền.
- **Thành viên 2 - Module Assignment & Submission Management:**
  - Quản lý bài tập, deadline, tiêu chí chấm điểm chi tiết (Rubrics).
  - Tiếp nhận nộp bài (upload zip, clone repo Git), trích xuất artifacts, lưu trữ artifacts.
  - Theo dõi trạng thái bài nộp.
- **Thành viên 3 - Module Docker Sandbox & Test Engine:**
  - Xây dựng Docker container runner cho các ngôn ngữ (Java/C#/Python/NodeJS).
  - Bộ thực thi Test-case (I/O Matching, Unit Tests).
  - Thu thập kết quả stdout, stderr, execution time, memory usage.
- **Thành viên 4 - Module AI Grading & PromptTemplate Engine:**
  - Thiết kế PromptTemplate engine tùy biến theo RubricRule.
  - Tích hợp LLM (OpenAI/Gemini/Claude) để đánh giá chất lượng semantic code.
  - Quản lý cơ chế xoay vòng khóa API (`AiApiKey` Rotation) chống rate-limit.
  - Module AI Chatbot Tutor giải đáp sinh viên.
- **Thành viên 5 (nếu nhóm 5 người) - Module Git Analytics & Collaboration Metric:**
  - Tích hợp Git Webhook & Git REST API.
  - Dashboard trực quan hóa đóng góp (commit frequency, LOC added/deleted, PR reviews).
  - Cảnh báo thành viên "free-riding" hoặc lệch khối lượng công việc.

---

## 4. YÊU CẦU THIẾT KẾ KỸ THUẬT & KIẾN TRÚC (SWD392 CRITERIA)

### A. Kiến trúc tổng thể
- **Clean Architecture / Layered Architecture**:
  - Tách biệt rõ ràng: Presentation Layer, Application Layer (Use Cases), Domain Layer (Entities), Infrastructure Layer (Database, External APIs, Docker).
  - Code do AI sinh ra bắt buộc phải refactor để fit đúng vào cấu trúc này.

### B. Cơ sở dữ liệu (ERD Yêu cầu đặc thù)
- **`GradingJob`**: Quản lý job chấm bài (thuộc tính `priority`, `status`: PENDING/PROCESSING/COMPLETED/FAILED, `retry_count`, `duration_ms`).
- **`RubricRule`**: Bộ quy tắc chấm điểm theo tiêu chí, trọng số, cấu hình prompt ngữ cảnh tương ứng.
- **`AiApiKey`**: Bảng quản lý nhiều key, trạng thái hoạt động, hạn mức (rate-limit tracking), thuật toán Round-robin rotation.

### C. Áp dụng Design Patterns (Tối thiểu 3 mẫu)
- **1 Creational Pattern**:
  - *Factory Method* hoặc *Builder Pattern*: Khởi tạo môi trường Sandbox Container tùy thuộc vào ngôn ngữ lập trình của bài nộp, hoặc Builder để xây dựng prompt hoàn chỉnh từ Rubric.
- **1 Structural Pattern**:
  - *Adapter Pattern* / *Facade Pattern*: Chuẩn hóa giao tiếp giữa hệ thống với các Git Provider khác nhau (GitHub, GitLab) hoặc các LLM Provider (OpenAI, Gemini).
- **1 Behavioral Pattern**:
  - *Strategy Pattern*: Chiến lược chấm điểm (Auto-test Strategy vs AI Semantic Strategy vs Manual Grading).
  - *Observer Pattern*: Bắn thông báo thời gian thực (Websocket) khi background job chấm xong.

---

## 5. QUY TẮC SỬ DỤNG AI (AI GOVERNANCE - 4 TIÊU CHÍ)

| Tiêu chí | Nội dung chi tiết | Hành động bắt buộc |
| :--- | :--- | :--- |
| **1. Transparency (Minh bạch)** | Mọi prompt đưa vào AI đều phải được ghi nhận. | Lập và duy trì file `AI_PROMPT_LOG.md` lưu lại câu prompt, context và mục đích sử dụng. |
| **2. Explainability (Giải trình)** | Sinh viên phải hiểu cặn kẽ 100% code nộp. | Chuẩn bị kiến thức để trả lời phỏng vấn logic code và Live Debugging tại buổi bảo vệ. |
| **3. Customization (Tùy biến)** | Không copy-paste nguyên mẫu từ AI. | Tinh chỉnh mã nguồn AI theo Clean Architecture, quy tắc đặt tên, xử lý exception và bảo mật. |
| **4. Ethical & Safety (An toàn)** | AI code có thể chứa mã độc hoặc lỗ hổng. | Phải kiểm thử qua Sandbox, không để lộ secrets/API keys vào code repository. |

---

## 6. LỘ TRÌNH 10 TUẦN & CẤU TRÚC ĐIỂM

| Đợt đánh giá | Trọng số | Tuần | Nội dung kiểm tra cốt lõi |
| :--- | :---: | :---: | :--- |
| **Evaluation 1** | **20%** | Tuần 4 | SRS, Use Case Diagram, Activity/Sequence Diagram, Screen Flow (Web & Mobile), Danh sách AI Prompts đã dùng. |
| **Evaluation 2** | **20%** | Tuần 6 | SDD, Lựa chọn & Giải trình Kiến trúc, ERD (`GradingJob`, `RubricRule`, `AiApiKey`), 3 Design Patterns, Class Diagram cho 3 Subsystems, Component & Deployment Diagram. |
| **Final Defense** | **60%** | Tuần 10 | - **Demo hoàn chỉnh (30%):** Nộp bài $\to$ Artifacts $\to$ Docker Sandbox $\to$ AI Review $\to$ Hiển thị kết quả.<br>- **Làm chủ code & Live Debugging (20%):** Sửa lỗi trực tiếp khi giảng viên yêu cầu.<br>- **Kỹ năng & Tiến độ (10%):** Commit history trên Git, task tracking trên Plane. |

> **Điều kiện tiên quyết để được bảo vệ cuối kỳ:**
> - Điểm trung bình: $\frac{\text{Evaluation 1} + \text{Evaluation 2}}{2} \ge 5.0 / 10$.
> - Mọi dòng code phải được chứng minh bằng lịch sử commit trên GitHub cá nhân (không commit hộ).
> - Không gian lận, không sao chép code trái phép.

---

## 7. KẾ HOẠCH HÀNH ĐỘNG CẦN TRIỂN KHAI NGAY (TUẦN 1 - 2)
1. **Thiết lập Nhóm & Công cụ:**
   - Tạo GitHub Organization/Repository chung. Quy định Git Flow (`main`, `develop`, `feature/*`).
   - Thiết lập workspace trên **Plane** để quản lý tiến độ và phân chia công việc.
   - Tạo file `AI_PROMPT_LOG.md` theo dõi prompt ngay từ ngày đầu.
2. **Triển khai 5 Research Spikes:**
   - Phân công mỗi thành viên phụ trách 1 spike kỹ thuật tương ứng với module dự kiến đảm nhận.
   - Xây dựng các script POC nhỏ chạy thử nghiệm độc lập.
3. **Chuẩn bị Tài liệu SRS sơ bộ:**
   - Xác định 3 Actors: **Admin**, **Lecturer**, **Student** cùng tập chức năng cốt lõi để chuẩn bị cho cột mốc Evaluation 1 (Tuần 4).
