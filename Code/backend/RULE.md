# QUY CHUẨN PHÁT TRIỂN MÃ NGUỒN BACKEND (BACKEND CODING RULES)
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design  
**Framework:** Node.js (v22+) + Express.js + TypeScript + Prisma ORM + MySQL + Redis (BullMQ)  
**Tiêu chuẩn:** Clean Architecture & Production Type-Safety

---

## 1. NGUYÊN TẮC KIẾN TRÚC ĐA TẦNG (CLEAN ARCHITECTURE LAYERS)

Dự án tuyệt đối tuân thủ nguyên tắc phụ thuộc một chiều (Dependency Rule): **Tầng bên trong KHÔNG ĐƯỢC BIẾT gì về tầng bên ngoài.**

```
[Presentation] ──► [Application] ──► [Domain] ◄── [Infrastructure]
 (Controllers)       (Use Cases)     (Entities)      (Prisma, Redis, Docker)
```

1. **Tầng Domain (`src/domain/`):**
   - Chứa thực thể cốt lõi (`entities/`) và interface trừu tượng (`repositories/`).
   - **CẤM:** Không được import bất kỳ thư viện ngoài nào (không Express, không Prisma, không Redis).
   - Mọi repository phải có interface bắt đầu bằng chữ `I`: `IUserRepository`, `ISubmissionRepository`, `IGradingJobRepository`.
2. **Tầng Application (`src/application/`):**
   - Chứa logic nghiệp vụ ứng dụng (`use-cases/`), DTOs (`dtos/`), và interface của các dịch vụ bên ngoài (`services/`).
   - Nhận dependency qua **Constructor Injection** (không `new` repository trực tiếp trong Use Case).
   - Sử dụng **Zod** để định nghĩa Schema và validate dữ liệu đầu vào.
3. **Tầng Infrastructure (`src/infrastructure/`):**
   - Chứa code cụ thể kết nối kỹ thuật: MySQL (Prisma), Redis (BullMQ), Docker Sandbox API, LLM API Adapters (Gemini, OpenAI), Git API.
   - Implement các interface từ Domain/Application.
4. **Tầng Presentation (`src/presentation/`):**
   - Chứa `routes/`, `controllers/`, `middlewares/`.
   - Controller chỉ làm 3 việc: Nhận request $\to$ Gọi Use Case $\to$ Trả response. **Tuyệt đối không viết logic nghiệp vụ (SQL query, tính toán điểm) trong Controller.**

---

## 2. QUY TẮC ĐẶT TÊN & ĐỊNH DẠNG CODE (NAMING CONVENTIONS)

- **Bật Strict Mode:** File `tsconfig.json` bắt buộc `strict: true`. **Nghiêm cấm dùng kiểu `any`**; nếu dữ liệu chưa rõ ràng phải dùng `unknown` và type guard.
- **Quy tắc đặt tên:**
  - **Interface:** Bắt đầu bằng chữ `I` viết hoa theo `PascalCase` (ví dụ: `IUserRepository`, `ILlmAdapter`, `ISandboxRunner`).
  - **Type Alias:** Viết hoa `PascalCase` (ví dụ: `UserId`, `SubmissionStatusType`).
  - **Class / Enum:** `PascalCase` (ví dụ: `SubmitAssignmentUseCase`, `JobPriority`).
  - **Function / Variable / Method:** `camelCase` (ví dụ: `executeGradingJob`, `calculateFinalScore`).
  - **Hằng số toàn cục (Constants):** `UPPER_SNAKE_CASE` (ví dụ: `MAX_FILE_SIZE_MB`, `DEFAULT_TIMEOUT_MS`).
  - **Tên file:** Sử dụng `kebab-case.ts` kèm hậu tố loại file:
    - Controller: `submission.controller.ts`
    - Use Case: `submit-assignment.use-case.ts`
    - Repository: `submission.repository.ts`
    - Interface: `submission.repository.interface.ts`
    - Route: `submission.route.ts`
- **Export:** Ưu tiên **Named Export** (`export class ...`), hạn chế `export default` để tăng khả năng autocomplete và refactor an toàn.

---

## 3. XỬ LÝ LỖI & CHUẨN HÓA API RESPONSE (ERROR HANDLING)

### 3.1. Định dạng Phản hồi Chuẩn (`ApiResponse<T>`)
Mọi API trả về cho Frontend phải tuân theo cấu trúc thống nhất:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### 3.2. Quản lý Lỗi qua `AppError`
Không dùng `throw new Error(...)` chung chung. Phải dùng `AppError` kèm mã lỗi và HTTP Status Code cụ thể:

```typescript
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly errorCode: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Các lớp lỗi mở rộng:
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} không tồn tại`, 404, 'RESOURCE_NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_FAILED');
  }
}
```

---

## 4. VALIDATION VỚI ZOD
Mọi request gửi lên từ client (body, query, params) phải được validate thông qua Zod Schema tại tầng Presentation/Application:

```typescript
import { z } from 'zod';

export const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().uuid({ message: 'assignmentId phải là UUID hợp lệ' }),
  submissionType: z.enum(['ZIP_FILE', 'GIT_REPO']),
  gitCommitHash: z.string().optional(),
});

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;
```

---

## 5. QUY TẮC SỬ DỤNG AI & KIỂM THỬ (AI GOVERNANCE & TESTING)

1. **Nguyên tắc Transparency (Minh bạch Prompt):**
   - Mọi đoạn code logic quan trọng (ví dụ: thuật toán xoay vòng API Key, cơ chế Docker isolate) nếu có dùng AI (Copilot, ChatGPT...) đều phải lưu lại câu prompt vào file `Document_project/AI_PROMPT_LOG.md`.
2. **Nguyên tắc Customization (Không copy nguyên xi code AI):**
   - Code do AI sinh ra phải được refactor đúng theo cấu trúc Clean Architecture của Backend (Domain $\to$ Use Case $\to$ Infra).
   - Đảm bảo kiểm tra null-safety, async/await và bọc try-catch / ném `AppError`.
3. **Chiến lược Unit Test:**
   - Tầng Application Use Cases bắt buộc phải có Unit Test (dùng `jest` / `ts-jest`).
   - Áp dụng mô hình **AAA (Arrange - Act - Assert)**.
   - Mock tất cả các repository và external services bằng `jest.fn()`.

---

## 6. GIT CONVENTIONS
- **Format Commit Message:** `<type>(<scope>): <subject>`
  - `feat(submission)`: Thêm API nộp bài tập zip
  - `fix(sandbox)`: Sửa lỗi timeout khi chạy gcc
  - `refactor(auth)`: Tách nhỏ logic JWT middleware
  - `docs(readme)`: Cập nhật hướng dẫn cài đặt
- **Branching:** `feature/<tên-chức-năng>`, `fix/<tên-lỗi>`. Không push code trực tiếp lên branch `main`.
