# QUY CHUẨN PHÁT TRIỂN MÃ NGUỒN FRONTEND (FRONTEND CODING RULES)
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design  
**Framework:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Axios  
**Tiêu chuẩn:** Feature-Driven Modular Architecture & React Best Practices

---

## 1. NGUYÊN TẮC KIẾN TRÚC THEO TÍNH NĂNG (FEATURE-DRIVEN ARCHITECTURE)

1. **Phân chia Feature độc lập (`src/features/<feature-name>/`):**
   - Mỗi thành viên phụ trách một phân hệ chỉ được viết code bên trong thư mục feature của mình:
     - `src/features/auth/` (Đăng nhập, đăng ký)
     - `src/features/courses/` (Khóa học, danh sách lớp)
     - `src/features/assignments/` (Bài tập, cấu hình Rubric/Testcase)
     - `src/features/submissions/` (Nộp bài, thanh tiến độ chấm `GradingJob`)
     - `src/features/sandbox/` (Xem log console Docker, testcase pass/fail)
     - `src/features/ai-tutor/` (Khung chat AI, giải thích lỗi)
     - `src/features/git-analytics/` (Biểu đồ đóng góp commit)
     - `src/features/admin/` (Quản trị viên, kho key AI)
2. **Cấu trúc 4 thư mục con trong mỗi Feature:**
   - `components/`: Các React component thuộc riêng feature đó.
   - `hooks/`: Custom hook xử lý trạng thái và nghiệp vụ riêng (ví dụ: `useJobPolling.ts`).
   - `services/`: File gọi API Axios riêng của feature (ví dụ: `submission.api.ts`).
   - `types/`: Kiểu dữ liệu TypeScript của feature (ví dụ: `submission.types.ts`).
3. **Quy tắc tầng định tuyến (`src/app/`):**
   - Thư mục `src/app/` **CHỈ LÀM NHIỆM VỤ ĐIỀU HƯỚNG VÀ LẮP RÁP**.
   - Các file `page.tsx` chỉ import các component từ `src/features/` vào, **tuyệt đối không viết logic fetch API phức tạp hay state nặng nề ngay trong `page.tsx`**.

---

## 2. QUY TẮC REACT & NEXT.JS APP ROUTER

1. **Server Components vs Client Components:**
   - Mặc định toàn bộ component trong App Router là **Server Component**.
   - Chỉ thêm chỉ thị `'use client';` ở đầu file khi:
     - Dùng các React Hook: `useState`, `useEffect`, `useCallback`, `useMemo`...
     - Lắng nghe sự kiện người dùng: `onClick`, `onChange`, `onSubmit`...
     - Dùng Browser APIs: `localStorage`, `window`, `document`...
2. **Quản lý Bất đồng bộ & Data Fetching:**
   - Mọi request HTTP phải gọi qua instance Axios tập trung tại `src/services/http.client.ts` hoặc `src/lib/api.ts` (đã cấu hình sẵn `baseURL` và tự động đính kèm Bearer Token).
   - Tuyệt đối không hardcode URL (`http://localhost:5000/...`) rải rác trong component.
3. **Trải nghiệm tải trang (Loading & Error States):**
   - Mọi thao tác tải dữ liệu phải có trạng thái `loading` (Spinner hoặc Skeleton) và xử lý lỗi `error` thân thiện.
   - Sử dụng các component trong `src/components/feedback/` (`LoadingSpinner`, `AlertBox`, `EmptyState`).

---

## 3. QUY TẮC ĐẶT TÊN & ĐỊNH DẠNG (NAMING CONVENTIONS)

- **Components:** Đặt tên theo `PascalCase` cho cả tên file và tên hàm component:
  - File: `SubmissionProgressCard.tsx`, `AiTutorChatBox.tsx`
  - Component: `export const SubmissionProgressCard: React.FC<Props> = (...) => { ... }`
- **Custom Hooks:** Bắt đầu bằng tiền tố `use` theo `camelCase`:
  - File: `useJobStatus.ts`, `useAuthSession.ts`
- **Services & Utils:** Viết theo `kebab-case.ts`:
  - File: `submission.service.ts`, `date-formatter.util.ts`
- **Types & Interfaces:** Đặt tên theo `PascalCase`:
  - Interface Props: `interface SubmissionCardProps { ... }`
  - Domain Data: `interface TestCaseResult { ... }`
- **Không dùng kiểu `any`:** Định nghĩa rõ ràng kiểu dữ liệu cho props, state và API payload.

---

## 4. QUY TẮC GIAO DIỆN (TAILWIND CSS & UI STYLING)

1. **Tuân thủ Hệ màu & Thiết kế chung:**
   - Sử dụng bảng màu chuẩn mực của dự án:
     - Primary: `indigo-600` (hover `indigo-700`, light `indigo-50`)
     - Success / Pass: `emerald-600` (bg `emerald-50`)
     - Warning / Running: `amber-500` (bg `amber-50`)
     - Danger / Fail: `rose-600` (bg `rose-50`)
     - Neutral: `slate-900` (chữ chính), `slate-500` (chữ phụ), `slate-50` (nền)
2. **Thiết kế Đáp ứng (Responsive Design):**
   - Đảm bảo giao diện hiển thị tốt trên cả Laptop và Tablet: sử dụng các tiền tố `sm:`, `md:`, `lg:`.
3. **Icons:**
   - Sử dụng thống nhất thư viện **`lucide-react`** (đã cài sẵn). Không cài thêm thư viện icon khác để tránh phình dung lượng bundle.

---

## 5. QUY TẮC SỬ DỤNG AI & KIỂM THỬ GIAO DIỆN

1. **Lưu Nhật ký Prompt:**
   - Khi nhờ AI sinh component giao diện (ví dụ: màn hình chấm bài PE chia tab Q1..Q4, thanh tiến độ), phải ghi nhận prompt vào `Document_project/AI_PROMPT_LOG.md`.
2. **Refactor Code AI:**
   - Tách nhỏ các component lớn thành các sub-component nhỏ dễ bảo trì (< 150 dòng/file).
   - Kiểm tra kỹ các sự kiện form, tránh render thừa (re-render loop).
3. **Kiểm tra biên dịch trước khi commit:**
   - Trước khi push code lên Git, bắt buộc chạy lệnh:
     ```bash
     npx tsc --noEmit
     ```
   - Đảm bảo không còn bất kỳ lỗi type error nào xuất hiện.

---

## 6. GIT COMMIT CONVENTIONS
- `feat(ui-submission)`: Thêm giao diện nộp bài thi PE
- `feat(ui-tutor)`: Thêm widget chat AI Tutor giải đáp lỗi
- `fix(ui-auth)`: Sửa lỗi hiển thị form đăng nhập
- `style(layout)`: Tinh chỉnh header và thanh điều hướng
