# HƯỚNG DẪN ĐIỀU PHỐI & QUY CHUẨN PHÁT TRIỂN FRONTEND TOÀN DIỆN (AITA FRONTEND MASTER GUIDE)
> **Tài liệu hợp nhất:** Frontend Master Orchestration Rules + Coding Rules (`RULE.md`) + Kiến trúc hệ thống (`ARCHITECTURE.md`)  
> **Dự án:** AITA (AI-powered Teaching Assistant System) – SWD392  
> **Tech Stack:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + Axios  
> **Tệp cấu hình:** `gemini.md` (Được thiết kế để Agent và lập trình viên đọc và thực thi code trực tiếp)

---

## MỤC LỤC
1. [Quy trình 5 Bước Master Orchestration (Anti-Slop UI & Motion)](#1-quy-trình-5-bước-master-orchestration-anti-slop-ui--motion)
2. [Kiến trúc Thư mục Clean Modular & Feature-Driven](#2-kiến-trúc-thư-mục-clean-modular--feature-driven)
3. [Quy chuẩn Code Next.js App Router & TypeScript](#3-quy-chuẩn-code-nextjs-app-router--typescript)
4. [Tích hợp & Quy chuẩn Shadcn/UI (Design System)](#4-tích-hợp--quy-chuẩn-shadcnui-design-system)
5. [Khám & Chẩn đoán Sức khỏe Mã nguồn (React Doctor & Type Check)](#5-khám--chẩn-đoán-sức-khỏe-mã-nguồn-react-doctor--type-check)
6. [Quy chuẩn Nhật ký AI Prompt & Git Commit](#6-quy-chuẩn-nhật-ký-ai-prompt--git-commit)

---

## 1. QUY TRÌNH 5 BƯỚC MASTER ORCHESTRATION (ANTI-SLOP UI & MOTION)

Mỗi khi thực hiện bất kỳ tác vụ code Frontend, giao diện (UI), hiệu ứng (Animation) hoặc Canvas/3D trong dự án này, Agent **BẮT BUỘC** phải tuân thủ quy trình 5 bước nghiêm ngặt sau:

### Bước 1: Xác định Concept & Thẩm mỹ (Anti-Slop)
- **Kích hoạt Skills:** `ui-ux-pro-max`, `design-taste-frontend`.
- **Hành động bắt buộc:**
  - Chọn rõ **1 phong cách UI cụ thể** phù hợp ngữ cảnh giáo dục đại học / kỹ thuật:
    - *Modern Clean SaaS* (ưu tiên cho Dashboard, quản lý bài tập, quản trị hệ thống).
    - *Minimalism / Swiss Editorial* (cho Landing Page, tài liệu hướng dẫn, danh sách đề thi).
    - *Technical / Bento Grid* (cho trang Sandbox, xem log Docker console, chấm điểm PE).
  - Tuyệt đối **không dùng gradient tím/xanh AI generic** (Purple-cyan AI slop). Chọn bảng màu chuyên nghiệp, có chiều sâu và độ tương phản cao.
  - **Cấu hình thông số thẩm mỹ chuẩn:**
    - `DESIGN_VARIANCE`: **7** (đảm bảo tính sáng tạo, không trùng lặp khuôn mẫu).
    - `VISUAL_DENSITY`: **6** (bố cục cân đối giữa thông tin kỹ thuật và khoảng thở).
    - `MOTION_INTENSITY`: **5** (chuyển động tinh tế, hỗ trợ trải nghiệm người dùng, không gây rối mắt).

### Bước 2: Dựng Bố cục & Component Hi-Fi
- **Kích hoạt Skill:** `huashu-design`.
- **Hành động bắt buộc:**
  - Thiết kế **visual rhythm** (nhịp điệu thị giác), phân cấp thị giác (**hierarchy**) rành mạch từ Heading 1 -> Body Text -> Caption.
  - Tạo khoảng thở (**whitespace**) hợp lý, không nhồi nhét thông tin.
  - Ưu tiên Tailwind CSS, component hóa theo tư tưởng **Atomic Design** (Atoms: `Button`, `Badge` -> Molecules: `SearchInput` -> Organisms: `SubmissionTable` -> Templates: `DashboardLayout`).
  - Khả năng tái sử dụng cao, phân tách rạch ròi giữa Presentational Components và Container Components.

### Bước 3: Hiệu ứng Chuyển động (Motion & Animation)
- **Micro-interactions & Gestures UI:**
  - Kích hoạt **`motion-framer`** / **`framer-motion-animator`**.
  - Áp dụng cho: Modal mở/đóng, Accordion, Tab indicator nhảy mượt mà, Toast thông báo, Dropdown.
  - Sử dụng `AnimatePresence` cho unmount animation, chuẩn hóa `spring physics` (stiffness, damping tự nhiên), tận dụng `layoutId` để tạo animation chuyển tab mượt mà.
- **Scroll Effects & Timelines phức tạp:**
  - Kích hoạt **`gsap-scrolltrigger`** + **`gsap-react`**.
  - Bắt buộc dùng hook **`useGSAP`** và scoped refs để dọn dẹp listener, ngăn ngừa triệt để memory leak và giật khung hình (frame drop).

### Bước 4: Trải nghiệm 3D & Canvas (Nếu có yêu cầu 3D)
- **Kích hoạt Skills:** `threejs-fundamentals`, `react-three-fiber`, `threejs-shaders`.
- **Hành động bắt buộc:**
  - Chỉ kích hoạt khi có yêu cầu minh họa đồ họa không gian 3D, mạng lưới tri thức RAG hoặc interactive hero section.
  - Luôn **dọn dẹp tài nguyên (dispose geometry/material/textures)** khi component unmount để tránh tràn RAM/VRAM.
  - Kiểm soát FPS, giới hạn số lượng render call và tắt shadow không cần thiết trên mobile.

### Bước 5: Kiểm định Chất lượng Thiết kế (Design Audit)
- **Kích hoạt Skill:** `impeccable`.
- **Hành động bắt buộc trước khi hoàn thành:**
  - Soi và sửa triệt để **24 lỗi "AI Slop"**:
    1. Spacing lệch chuẩn (ví dụ mix lẫn lộn `p-3`, `p-5`, `p-7` không nhất quán).
    2. Cỡ chữ thiếu độ tương phản cấp bậc.
    3. Viền bo tròn quá đà vô cớ (`rounded-3xl` trên bảng dữ liệu kỹ thuật).
    4. Màu sắc thiếu chiều sâu, viền không rõ ràng trên nền xám/trắng.
    5. Drop-shadow quá đậm làm mờ nội dung.
  - Đảm bảo độ tương phản màu chuẩn **WCAG AA** cho mọi text và interactive element.
  - Kiểm tra Responsive mượt mà trên cả Mobile (>= 375px), Tablet (>= 768px), Laptop/Desktop (>= 1280px).

---

## 2. KIẾN TRÚC THƯ MỤC CLEAN MODULAR & FEATURE-DRIVEN

Hệ thống Frontend được cấu trúc theo mô hình **Feature-Driven Modular Architecture**, tách biệt trách nhiệm giữa tầng Định tuyến (`src/app/`), Component dùng chung (`src/components/`), và từng Phân hệ nghiệp vụ (`src/features/`).

```
src/
├── app/                           # [Routing Layer] CHỈ CHỨA page, layout, loading/error states
│   ├── (auth)/                    # Nhóm route xác thực (login, register)
│   ├── (dashboard)/               # Nhóm route dashboard nghiệp vụ chính (courses, assignments)
│   ├── submissions/[id]/          # Trang theo dõi tiến độ & kết quả nộp bài
│   ├── admin/                     # Nhóm route quản trị (ai-keys, jobs)
│   ├── layout.tsx                 # Root Layout
│   ├── page.tsx                   # Landing Page
│   └── globals.css                # Tailwind & Shadcn Base CSS
│
├── components/                    # [Shared Presentation Layer] Component UI dùng chung toàn app
│   ├── ui/                        # Shadcn & Nguyên tử cơ bản (Button, Input, Card, Badge, Dialog...)
│   ├── common/                    # Khung sườn trang (Header, Sidebar, Navbar, Footer, Breadcrumbs)
│   └── feedback/                  # Phản hồi hệ thống (LoadingSpinner, EmptyState, AlertBox)
│
├── features/                      # [Domain Feature Modules] Chia theo từng phân hệ cho thành viên
│   ├── auth/                      # Xác thực, Quản lý tài khoản
│   ├── courses/                   # Khóa học, Danh sách lớp
│   ├── assignments/               # Quản lý Bài tập, Cấu hình Rubric & Test Case
│   ├── submissions/               # Nộp bài, Tiến độ chấm GradingJob thời gian thực
│   ├── sandbox/                   # Xem log console Docker, Terminal output, Testcase Pass/Fail
│   ├── ai-tutor/                  # Trợ giảng AI Chatbox, Giải thích Semantic Code Review
│   ├── git-analytics/             # Phân tích Đóng góp Git Commit (Anti-Free-Riding)
│   └── admin/                     # Quản trị viên (Kho AI Key, Giám sát Redis Queue)
│
├── services/                      # [Core Infrastructure Layer] Axios instance tập trung
│   └── http.client.ts             # Axios client gắn sẵn baseURL & Bearer Token Interceptors
│
├── hooks/                         # [Global Utilities Hooks] Hooks dùng chung toàn hệ thống
├── stores/                        # [Global State Management] Zustand stores (useUserStore, useThemeStore)
├── types/                         # [Global Types] Kiểu dữ liệu ApiResponse<T>, Pagination...
├── constants/                     # [Constants] Routes, Roles (ADMIN, LECTURER, STUDENT)...
├── config/                        # [Config] env.config.ts...
├── lib/                           # [Library Helpers] utils.ts (cn function), api.ts
└── utils/                         # [Utility Functions] format.util.ts (formatBytes, formatDate)
```

### Quy tắc phân chia trong từng Feature (`src/features/<feature-name>/`)
Mỗi feature bao gồm 4 thư mục con khép kín:
1. `components/`: Các React Component giao diện đặc thù của feature.
2. `hooks/`: Custom Hook xử lý state và logic nghiệp vụ (vd: `useJobPolling.ts`, `useAiChat.ts`).
3. `services/`: File gọi API qua Axios riêng (vd: `submission.api.ts`, `course.api.ts`).
4. `types/`: Kiểu dữ liệu TypeScript đặc thù (vd: `submission.types.ts`).

> **NGUYÊN TẮC BẤT DI BẤT DỊCH TẦNG APP (`src/app/`):**  
> Thư mục `src/app/` **CHỈ LÀM NHIỆM VỤ LẮP RÁP VÀ ĐIỀU HƯỚNG**. File `page.tsx` chỉ import các component hoàn thiện từ `src/features/` vào. **Tuyệt đối không viết logic fetch API phức tạp, state nặng nề hay JSX dài dòng trong `page.tsx`**.

---

## 3. QUY CHUẨN CODE NEXT.JS APP ROUTER & TYPESCRIPT

### 1. Server Components vs Client Components
- Mặc định mọi component trong App Router là **Server Component**.
- Chỉ thêm directive `'use client';` ở dòng đầu tiên khi:
  - Sử dụng React Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`...
  - Bắt sự kiện người dùng: `onClick`, `onChange`, `onSubmit`...
  - Sử dụng Browser API: `window`, `document`, `localStorage`, `navigator`...

### 2. Quản lý Data Fetching & Axios
- Mọi request HTTP phải gọi qua instance Axios tập trung tại `@/services/http.client` hoặc `@/lib/api`.
- Đã cấu hình sẵn `baseURL` từ biến môi trường và tự động đính kèm `Bearer Token`.
- **Tuyệt đối không hardcode URL** dạng `http://localhost:5000/...` rải rác trong component.

### 3. Loading, Empty & Error States
- Mọi component tải dữ liệu bất đồng bộ bắt buộc xử lý đủ 3 trạng thái:
  - **Loading:** Skeleton loader hoặc `LoadingSpinner`.
  - **Empty:** `EmptyState` thân thiện khi không có dữ liệu.
  - **Error:** `AlertBox` với thông báo lỗi rõ ràng và nút thử lại (Retry).

### 4. Quy ước Đặt tên (Naming Conventions)
- **Component:** `PascalCase` cho cả tên file và tên component:
  ```tsx
  // SubmissionProgressCard.tsx
  export const SubmissionProgressCard: React.FC<SubmissionCardProps> = ({ ... }) => { ... };
  ```
- **Custom Hooks:** Bắt đầu bằng tiền tố `use` với `camelCase`:
  ```ts
  // useJobPolling.ts
  export const useJobPolling = (jobId: string) => { ... };
  ```
- **Services & Utils:** Viết theo định dạng `kebab-case.ts`:
  ```ts
  // submission.service.ts, date-formatter.util.ts
  ```
- **Types & Interfaces:** `PascalCase`:
  ```ts
  export interface TestCaseResult { ... }
  ```
- **Tuyệt đối không dùng kiểu `any`:** Bật chế độ Type-safe chặt chẽ. Định nghĩa rõ props, state, error payload.

---

## 4. TÍCH HỢP & QUY CHUẨN SHADCN/UI (DESIGN SYSTEM)

Dự án đã tích hợp hoàn chỉnh **shadcn/ui** với Tailwind CSS.

### Cấu hình cốt lõi:
1. `components.json`: Cấu hình path alias `@/components`, `@/components/ui`, `@/lib/utils`.
2. `@/lib/utils`: Chứa hàm `cn(...)` kết hợp `clsx` và `tailwind-merge`.
3. `@/components/ui/`: Thư viện 22 component Atomic đã cài đặt sẵn sàng sử dụng:
   - **Feedback & Overlays:** `dialog`, `alert-dialog`, `sheet` (side drawer), `popover`, `tooltip`, `alert`
   - **Navigation & Menus:** `dropdown-menu`, `tabs`
   - **Data Display:** `table`, `card`, `badge`, `avatar`, `progress`, `skeleton`, `separator`, `scroll-area`
   - **Form Controls & Inputs:** `button`, `input`, `textarea`, `select`, `checkbox`, `switch`

### Danh mục & Cú pháp Import mẫu:
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
```

### Ví dụ sử dụng Component Shadcn (Dashboard / PE Exam):
```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function SubmissionStatusCard() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Bài tập PE: Java Spring Boot</CardTitle>
        <Badge variant="default" className="bg-emerald-600">Passed</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Điểm số: 10.0 / 10.0 (4/4 Testcases Passed)</p>
        <Progress value={100} className="h-2" />
        <Button variant="default">Xem chi tiết bài nộp</Button>
      </CardContent>
    </Card>
  );
}
```

### Bảng màu Hệ thống Chuẩn mực (Design System Palette):
- **Primary:** `indigo-600` (`#4f46e5`, HSL `243.4 75.4% 58.6%`) - Nút bấm chính, tiêu điểm, active state.
- **Success / Pass:** `emerald-600` (bg `emerald-50`, text `emerald-700`) - Test case Pass, hoàn thành bài tập.
- **Warning / Running:** `amber-500` (bg `amber-50`, text `amber-700`) - Đang chấm trong Docker sandbox, cảnh báo style.
- **Danger / Fail:** `rose-600` (bg `rose-50`, text `rose-700`) - Test case Fail, vi phạm quy chế thi.
- **Neutral / Slate:** `slate-900` (tiêu đề, text chính), `slate-500` (text phụ), `slate-50` (nền canvas tổng).

---

## 5. KHÁM & CHẨN ĐOÁN SỨC KHỎE MÃ NGUỒN (REACT DOCTOR & TYPE CHECK)

Trước khi commit mã nguồn hoặc kết thúc lượt tác vụ, Agent và lập trình viên **BẮT BUỘC** chạy các công cụ kiểm tra sức khỏe code:

### 1. Skill `react-doctor` - Khám bệnh Codebase React
Sử dụng công cụ `react-doctor` để chẩn đoán toàn diện sức khỏe ứng dụng React:
```bash
# 1. Khám sức khỏe toàn diện codebase (hiệu năng, re-render, memory leak, supply-chain)
npx react-doctor

# 2. Khám chuyên sâu giao diện người dùng (phát hiện lỗi UI/UX, contrast, layout vỡ)
npx react-doctor design

# 3. Quét kiểm tra các lỗ hổng bảo mật Frontend (XSS, insecure input)
npx react-doctor --category Security

# 4. Khi gặp cảnh báo cần giải thích lý do cụ thể tại dòng code vi phạm:
npx react-doctor why src/features/submissions/components/LiveJobProgressBar.tsx:42
```

### 2. Kiểm tra Type-Safety (TypeScript)
Trước khi push code, bắt buộc chạy kiểm tra type không lỗi:
```bash
npx tsc --noEmit
```
- Phải đạt `Exit code: 0`, không còn bất kỳ lỗi Type Error nào.

### 3. Kiểm tra Lint
```bash
npm run lint
```
- Đảm bảo tuân thủ quy chuẩn cú pháp và tiêu chuẩn Next.js Core Web Vitals.

---

## 6. QUY CHUẨN NHẬT KÝ AI PROMPT & GIT COMMIT

### 1. Nhật ký Prompt (`Document_project/AI_PROMPT_LOG.md`)
- Khi yêu cầu AI sinh mã nguồn hoặc tạo component lớn (ví dụ: giao diện chấm bài PE chia tab Q1..Q4, thanh tiến độ chấm thi Docker), thành viên phải lưu lại:
  - **Mục đích:** Tên màn hình / feature.
  - **Prompt gửi AI:** Prompt chi tiết kèm context.
  - **Kết quả & Tinh chỉnh:** Những điểm đã refactor lại sau khi AI sinh code.

### 2. Refactor Code sau khi AI sinh
- Tách nhỏ các component lớn thành các file nhỏ (< 150 dòng/file).
- Loại bỏ triệt để re-render thừa trong các form hoặc vòng lặp realtime polling.

### 3. Quy chuẩn Thông điệp Git Commit (Conventional Commits)
- `feat(ui-submission)`: Thêm giao diện nộp bài thi PE & tiến độ chấm
- `feat(ui-tutor)`: Thêm widget chat AI Tutor giải đáp lỗi bài tập
- `fix(ui-auth)`: Sửa lỗi hiển thị form đăng nhập và thông báo validate
- `style(layout)`: Tinh chỉnh header, sidebar và khoảng cách dashboard
- `refactor(sandbox)`: Tối ưu terminal output viewer và giải phóng bộ nhớ
