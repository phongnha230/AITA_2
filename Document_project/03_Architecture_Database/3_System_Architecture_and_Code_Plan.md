# KIẾN TRÚC HỆ THỐNG & KẾ HOẠCH PHÁT TRIỂN MÃ NGUỒN (CODE PLAN)
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design  
**Công nghệ:** Next.js (Web Frontend) + Express.js / TypeScript (Backend) + MySQL + Redis (Queue) + Docker (Sandbox)

---

## 1. MÔ HÌNH KIẾN TRÚC TỔNG THỂ (SYSTEM ARCHITECTURE)

Hệ thống được thiết kế theo tiêu chuẩn **Clean Architecture** (Kiến trúc đa tầng phân tách rõ ràng trách nhiệm):

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND: NEXT.JS 14+ APP ROUTER            │
│  (TailwindCSS, Shadcn UI, React Query, Zustand, SSE/Polling) │
└──────────────────────────────┬──────────────────────────────┘
                               │ RESTful API / JSON
┌──────────────────────────────▼──────────────────────────────┐
│             BACKEND API SERVER: EXPRESS.JS + TYPESCRIPT      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Presentation Layer: Routes, Controllers, DTO Valid │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ calls                        │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ 2. Application Layer: Use Cases, Orchestrators        │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ interacts                    │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ 3. Domain Layer: Core Entities, Rules, Interfaces     │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ implemented by               │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │ 4. Infrastructure Layer:                              │  │
│  │    - Database: MySQL (Prisma ORM)                     │  │
│  │    - Vector DB: ChromaDB (RAG Indexing cho Đáp án)    │  │
│  │    - Message Queue: Redis + BullMQ (Priority Queue)   │  │
│  │    - Docker Sandbox Runner (Process Isolation)        │  │
│  │    - LLM Adapters (Gemini / OpenAI API Key Rotation)  │  │
│  │    - Git Provider Client (GitHub REST API)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ỨNG DỤNG 3 DESIGN PATTERNS BẮT BUỘC (SWD392)

Theo tiêu chuẩn đánh giá của Evaluation 2, dự án áp dụng 3 mẫu thiết kế cụ thể:

### 2.1. Creational Pattern: Factory Method & Builder Pattern
- **`SandboxRunnerFactory`**: 
  - *Mục đích:* Dựa vào ngôn ngữ của bài nộp (`JAVA`, `PYTHON`, `CSHARP`, `CPP`), Factory sẽ trả về đối tượng `ISandboxRunner` tương ứng (`JavaDockerRunner`, `PythonDockerRunner`...). Mỗi runner biết cấu hình Dockerfile, lệnh compile và timeout đặc thù.
- **`PromptTemplateBuilder` (Kết hợp RAG Context):**
  - *Mục đích:* Lắp ráp chuỗi prompt gửi cho LLM bằng cách kết hợp: System Persona + Assignment Description + Danh sách `RubricRule` + **Ngữ cảnh RAG (Đáp án mẫu & Ý đồ Testcase bị lỗi)** + Source code của sinh viên + Barem tính điểm JSON mong muốn.

### 2.2. Structural Pattern: Adapter & Facade Pattern
- **`LlmProviderAdapter`**:
  - *Mục đích:* Chuẩn hóa giao diện gọi AI (`generateReview(prompt)`). Hệ thống có thể cắm `GeminiAdapter`, `OpenAiAdapter` hay `ClaudeAdapter` mà không ảnh hưởng tới nghiệp vụ chấm điểm ở tầng Application.
- **`RagKnowledgeFacade`**:
  - *Mục đích:* Cung cấp giao diện đơn giản (`getSolutionContext(assignmentId, failedTestcases)`) ẩn đi toàn bộ chu trình phức tạp: Vector Embedding query $\to$ Tìm kiếm tương đồng trong ChromaDB $\to$ Trích xuất giải thích ý đồ testcase và snippet code đáp án của Giảng viên.
- **`ApiKeyRotatorFacade`**:
  - *Mục đích:* Tự động chọn key chưa quá tải từ bảng `ai_api_keys`, mã hóa/giải mã, xoay vòng round-robin khi gặp lỗi rate-limit.
- **`GitProviderAdapter`**:
  - *Mục đích:* Chuẩn hóa API lấy commit history từ GitHub API hoặc GitLab API.

### 2.3. Behavioral Pattern: Strategy Pattern & Observer Pattern
- **`GradingStrategy`**:
  - *Mục đích:* Cho phép linh hoạt lựa chọn chiến lược chấm điểm:
    - `AutomatedTestCaseStrategy`: Chấm điểm bằng cách chạy test I/O trong Docker.
    - `AiSemanticReviewStrategy`: Đánh giá Clean Code, tư duy thuật toán bằng LLM.
    - `HybridGradingStrategy`: Kết hợp cả hai theo trọng số quy định tại Assignment.
- **`JobStatusObserver` (Event-driven):**
  - *Mục đích:* Khi Worker xử lý xong từng giai đoạn (`RUNNING_SANDBOX` $\to$ `RUNNING_AI` $\to$ `COMPLETED`), Observer sẽ bắn sự kiện ghi nhận DB và cập nhật tiến độ cho Client qua Server-Sent Events (SSE).

---

## 3. CẤU TRÚC THƯ MỤC CODE DỰ ÁN (PROJECT REPO STRUCTURE)

Dự án được tổ chức theo dạng Monorepo hoặc chia 2 thư mục rõ ràng trong thư mục `Code/`:

```
AITA/
├── Document_project/            # Tài liệu SRS, SDD, ERD, AI Prompt Log
│   ├── 1_SRS_Requirements_and_UseCases.md
│   ├── 2_Database_Schema.sql
│   ├── 3_System_Architecture_and_Code_Plan.md
│   └── AI_PROMPT_LOG.md         # Bắt buộc cho Evaluation 1
│
└── Code/
    ├── backend/                 # Express.js + TypeScript
    │   ├── src/
    │   │   ├── domain/          # Entities & Interfaces
    │   │   │   ├── entities/    # User, Assignment, Submission, GradingJob
    │   │   │   └── repositories/# IUserRepository, ISubmissionRepository...
    │   │   │
    │   │   ├── application/     # Use Cases & Business Logic
    │   │   │   ├── use-cases/   # SubmitAssignmentUseCase, GradeSubmissionUseCase
    │   │   │   ├── dtos/        # Request/Response Validation DTOs
    │   │   │   └── services/    # SandboxService, AiGradingService, GitAnalyticsService
    │   │   │
    │   │   ├── infrastructure/  # External Services, DB, Sandbox
    │   │   │   ├── database/    # Prisma/TypeORM Schema & Connection to MySQL
    │   │   │   ├── queue/       # BullMQ + Redis Queue Setup & Workers
    │   │   │   ├── sandbox/     # Docker API Wrapper, Language Runners (Factory)
    │   │   │   ├── ai/          # LlmAdapters (Gemini, OpenAI), ApiKeyRotator
    │   │   │   └── git/         # GitHubOctokitClient, GitAnalyticsAdapter
    │   │   │
    │   │   ├── presentation/    # Controllers, Middlewares, Routes
    │   │   │   ├── controllers/ # AuthController, AssignmentController, SubmissionController
    │   │   │   ├── middlewares/ # authMiddleware (JWT + RBAC), errorHandler, rateLimiter
    │   │   │   └── routes/      # api.ts (v1/auth, v1/assignments, v1/submissions...)
    │   │   │
    │   │   ├── app.ts           # Express App configuration
    │   │   └── server.ts        # Server entry point
    │   ├── docker/              # Dockerfiles cho Sandbox Runner (Java, Python, C#)
    │   ├── package.json
    │   └── tsconfig.json
    │
    └── frontend/                # Next.js 14+ (App Router)
        ├── src/
        │   ├── app/             # App Router Pages
        │   │   ├── (auth)/      # /login, /register
        │   │   ├── (dashboard)/ # /dashboard, /courses, /assignments/[id]
        │   │   ├── submissions/ # /submissions/[id] (Chi tiết chấm & Live Progress)
        │   │   ├── admin/       # /admin/ai-keys, /admin/system-jobs
        │   │   ├── layout.tsx
        │   │   └── page.tsx
        │   ├── components/      # UI Reusable Components
        │   │   ├── ui/          # Button, Dialog, Card, Input (Shadcn UI)
        │   │   ├── ai-tutor/    # ChatBoxWidget, MessageBubble
        │   │   ├── sandbox/     # TerminalOutputViewer, TestCaseResultCard
        │   │   └── git/         # GitContributionChart, TeamWorkloadMatrix
        │   ├── lib/             # API Client (Axios), Auth helper, utils
        │   └── stores/          # Zustand State Management (User, CurrentJob)
        ├── package.json
        └── tailwind.config.js
```

---

## 4. KẾ HOẠCH TRIỂN KHAI CODE CHI TIẾT (10-WEEK SPRINT PLAN)

### Tuần 1 - 2: Setup & 5 Research Spikes (Nền tảng kỹ thuật)
- **Cả nhóm:** Khởi tạo GitHub repo, cấu hình Docker Compose (MySQL 8.0, Redis), quy định Git Flow.
- **Thành viên 1:** Viết script kết nối Express.js với MySQL (Prisma), tạo cấu trúc Clean Architecture.
- **Thành viên 2:** Nghiên cứu trích xuất file ZIP và validate file upload trong Express.js.
- **Thành viên 3 (Spike 1 & 3):** Viết POC Docker Sandbox: Chạy thử file Python/Java trong container, đo thời gian chạy và bắt stdout. Thiết lập hàng đợi BullMQ với Redis.
- **Thành viên 4 (Spike 2):** Viết POC gọi Google Gemini API / OpenAI API với prompt thử nghiệm chấm Clean Code.
- **Thành viên 5 (Spike 4):** Viết POC gọi GitHub REST API lấy danh sách commit của một repository.

### Tuần 3 - 4: Hoàn thiện Phân tích, UI Mockup & EVALUATION 1 (20%)
- **Mục tiêu:** Nộp tài liệu SRS, Screen Flow, Use Cases và Danh sách Prompt đã dùng.
- **Frontend:** Thiết kế Layout Next.js, trang Đăng nhập, Dashboard khóa học, Trang xem bài tập và Form nộp bài.
- **Backend:** Xây dựng Module IAM (Đăng ký, Đăng nhập, cấp JWT Token, phân quyền Admin/Lecturer/Student).
- **Ghi nhật ký:** Cập nhật file `AI_PROMPT_LOG.md`.

### Tuần 5 - 6: Thiết kế Chi tiết & EVALUATION 2 (20%)
- **Mục tiêu:** Nộp tài liệu SDD, Database Schema (đã có `GradingJob`, `RubricRule`, `AiApiKey`), Class Diagram, 3 Design Patterns.
- **Backend:** 
  - Hoàn thiện Database Migration theo file `2_Database_Schema.sql`.
  - Cài đặt Factory Method cho Sandbox Runner (`ISandboxRunner`).
  - Cài đặt Adapter cho LLM Provider và thuật toán xoay vòng API Key (`AiApiKey`).
- **Frontend:** Xây dựng UI quản lý khóa học, tạo bài tập kèm giao diện cấu hình TestCases & Rubrics.

### Tuần 7 - 8: Thực thi Giai đoạn 1 (Core Phase 1)
- Hoàn thiện trọn vẹn luồng: Giảng viên tạo bài tập $\to$ Sinh viên upload file ZIP $\to$ Lưu DB $\to$ Tạo bản ghi `GradingJob` với trạng thái `QUEUED`.
- Tích hợp Redis Queue: Đẩy job vào queue, worker lấy job ra xử lý.
- Màn hình Next.js hiển thị trạng thái hàng đợi chấm bài.

### Tuần 9: Thực thi Giai đoạn 2 (AI Grading & Sandbox Integration)
- Nối Docker Sandbox vào Worker: Biên dịch và chạy test cases thực tế.
- Nối AI Prompt Engine: Gửi code + rubric sang LLM, phân tích kết quả, lưu điểm ngữ nghĩa.
- Xây dựng widget **AI Tutor Chatbot** trên Next.js cho sinh viên hỏi đáp.
- Tích hợp **Git Analytics Dashboard** hiển thị biểu đồ đóng góp của sinh viên.

### Tuần 10: Tích hợp, Kiểm thử Toàn diện & BẢO VỆ CUỐI KỲ (60%)
- Chạy thử nghiệm End-to-End: Nộp bài $\to$ Chạy Sandbox $\to$ AI Review $\to$ Xem điểm & hỏi AI Tutor.
- Từng thành viên rà soát code của mình, chuẩn bị kịch bản **Live Debugging** trước giảng viên.
- Hoàn thiện slide thuyết trình và video demo dự phòng.
