# TÀI LIỆU THIẾT KẾ GIAO DIỆN FRONTEND & BỘ PROMPT THEO PHÂN QUYỀN RBAC
**Hệ thống:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – FPT University  
**Công nghệ Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React Icons, Shadcn UI style  
**Quy tắc bảo mật:** Dựa trên [RBAC_Roles_and_Permissions.md](RBAC_Roles_and_Permissions.md)  

---

## 1. MA TRẬN ĐIỀU HƯỚNG & PHÂN QUYỀN TRANG (FRONTEND ROUTE MAP)

| URL Route | Tên màn hình | Phân quyền truy cập | Mục đích & Chức năng chính |
| :--- | :--- | :---: | :--- |
| `/login` | Đăng nhập hệ thống | **Public (Tất cả)** | Đăng nhập bằng Email/Password, nhận JWT và tự động chuyển hướng theo Role. |
| **DÀNH CHO SINH VIÊN (`STUDENT`)** | | | |
| `/student/dashboard` | Trang chủ sinh viên | `STUDENT` | Danh sách lớp học, bài thi PE sắp tới, đồng hồ đếm ngược deadline. |
| `/student/assignments/[id]` | Chi tiết đề thi & Nộp bài | `STUDENT` | Xem đề bài PE, kéo thả nộp file `.zip`, kiểm tra hợp lệ định dạng. |
| `/student/submissions/[id]/status` | Theo dõi tiến độ chấm | `STUDENT` | Thanh tiến trình thời gian thực (`Queued -> Sandbox -> AI -> Completed`). |
| `/student/submissions/[id]/report` | Báo cáo điểm chi tiết | `STUDENT` | Xem điểm tổng, điểm Sandbox 7.0 + AI 3.0, từng testcase Pass/Fail. |
| `/student/submissions/[id]/tutor` | Gia sư AI Socratic | `STUDENT` | Khung chat hỏi đáp với AI về bài nộp (AI gợi mở tư duy, không lộ code giải). |
| **DÀNH CHO GIẢNG VIÊN (`LECTURER`)** | | | |
| `/lecturer/dashboard` | Tổng quan giảng viên | `LECTURER` | Thống kê số lớp, số bài thi, biểu đồ phân phối điểm sinh viên. |
| `/lecturer/courses` | Quản lý khóa học/lớp | `LECTURER` | Danh sách lớp (PRF192, PRO192, CSD201), import sinh viên bằng CSV/Excel. |
| `/lecturer/assignments/new` | Tạo đề thi & Barem RAG | `LECTURER` | Nhập đề bài, nạp bộ testcases kèm `rationale`, nạp code mẫu cho RAG. |
| `/lecturer/assignments/[id]/submissions` | Danh sách bài nộp & Chấm lại | `LECTURER` | Bảng điểm lớp thi, xem log chạy Docker từng SV, nút Re-grade, sửa điểm. |
| **DÀNH CHO QUẢN TRỊ VIÊN (`ADMIN`)** | | | |
| `/admin/dashboard` | Giám sát hạ tầng | `ADMIN` | Dashboard giám sát Redis BullMQ, Docker Sandbox, tài nguyên CPU/RAM. |
| `/admin/users` | Quản trị tài khoản & RBAC | `ADMIN` | Bảng danh sách người dùng, gán quyền (Admin/Lecturer/Student), khóa tài khoản. |
| `/admin/ai-keys` | Kho khóa API AI | `ADMIN` | Thêm/sửa/xóa API key (Gemini/OpenAI), bật/tắt xoay vòng, xem hạn mức. |
| `/admin/queue` | Quản lý hàng đợi chấm | `ADMIN` | Danh sách job `QUEUED`, `RUNNING`, `FAILED`, nút Hủy job hoặc Re-try job. |

---

### 1.1. MA TRẬN PHÂN LẬP CHỨC NĂNG TUYỆT ĐỐI (ZERO-BLEEDING FEATURE MATRIX)
*(Đảm bảo trang của Role nào thì 100% CHỈ CÓ chức năng của Role đó, không được gộp chung hay rò rỉ sang Role khác)*

| Phân hệ Role | Chức năng ĐƯỢC PHÉP hiển thị | Chức năng TUYỆT ĐỐI CẤM & ẨN HOÀN TOÀN |
| :---: | :---| :---|
| **`STUDENT`** <br>*(Sinh viên)* | • Xem danh sách lớp mình đang học.<br>• Xem đề thi PE & nộp file `.zip`.<br>• Xem thanh tiến trình chấm thời gian thực.<br>• Xem báo cáo điểm của **chính mình**.<br>• Chat với Gia sư AI Socratic hỏi về bài của mình. | ❌ **CẤM** xem bài nộp hoặc điểm của bạn học khác.<br>❌ **CẤM** xem đáp án mẫu RAG & testcase ẩn của đề thi.<br>❌ **CẤM** có nút "Chấm lại" (Re-grade) hay nút "Sửa điểm".<br>❌ **CẤM** xem log máy chủ Docker Sandbox hay hàng đợi Redis.<br>❌ **CẤM** thấy bất kỳ menu nào của Giảng viên / Quản trị. |
| **`LECTURER`** <br>*(Giảng viên)* | • Xem thống kê phổ điểm các lớp mình phụ trách.<br>• Quản lý danh sách sinh viên lớp mình (Import Excel).<br>• Tạo đề thi PE, nạp Testcases + Barem RAG + Code mẫu.<br>• Xem bảng điểm toàn bộ sinh viên trong lớp.<br>• Xem chi tiết log terminal Docker chạy từng bài nộp.<br>• Bấm nút **Chấm lại (Re-grade)** hoặc sửa điểm thủ công. | ❌ **CẤM** xem bài thi hay lớp học của giảng viên khác (trừ khi được chia sẻ).<br>❌ **CẤM** quản lý tài khoản người dùng toàn trường (thuộc Admin).<br>❌ **CẤM** cấu hình hạ tầng server (CPU/RAM Docker, Redis BullMQ).<br>❌ **CẤM** quản lý kho khóa AI API Keys toàn trường.<br>❌ **CẤM** tham gia nộp bài thi với tư cách sinh viên. |
| **`ADMIN`** <br>*(Quản trị viên)* | • Giám sát trạng thái hàng đợi chấm Redis BullMQ.<br>• Giám sát tài nguyên CPU/RAM máy chủ Docker Sandbox.<br>• Quản lý người dùng: Tạo tài khoản, Khóa nick, Đổi Role RBAC.<br>• Quản lý kho khóa API Key (Gemini/OpenAI), bật/tắt xoay vòng.<br>• Can thiệp kỹ thuật: Hủy job kẹt, Re-try job FAILED. | ❌ **CẤM** can thiệp sửa nội dung đề thi hay barem sư phạm của GV.<br>❌ **CẤM** sửa điểm học tập của sinh viên trái thẩm quyền.<br>❌ **CẤM** nộp bài thi PE vào hệ thống. |

---

### 1.2. KIẾN TRÚC ROUTE GROUPS BIỆT LẬP (NEXT.JS 14 APP ROUTER)

Để **không bao giờ bị chung chạ code, layout hay menu giữa các Role**, kiến trúc thư mục Frontend được tổ chức theo cơ chế **Route Groups `(tên_nhóm)`** độc lập của Next.js 14:

```text
src/app/
├── (auth)/                          # Nhóm trang xác thực công khai
│   └── login/page.tsx               # Trang đăng nhập duy nhất
├── (student)/                       # [PHÂN HỆ RIÊNG CHO SINH VIÊN]
│   ├── layout.tsx                   # Layout riêng của SV (CHỈ chứa Sidebar SV)
│   ├── dashboard/page.tsx           # Trang chủ SV
│   ├── assignments/[id]/page.tsx    # Nộp bài ZIP
│   └── submissions/[id]/
│       ├── status/page.tsx          # Tiến trình chấm
│       ├── report/page.tsx          # Điểm số cá nhân
│       └── tutor/page.tsx           # Chat AI Socratic
├── (lecturer)/                      # [PHÂN HỆ RIÊNG CHO GIẢNG VIÊN]
│   ├── layout.tsx                   # Layout riêng của GV (CHỈ chứa Sidebar GV)
│   ├── dashboard/page.tsx           # Tổng quan lớp học
│   ├── courses/page.tsx             # Quản lý lớp & SV
│   └── assignments/
│       ├── new/page.tsx             # Tạo đề & nạp RAG
│       └── [id]/submissions/page.tsx # Bảng điểm & Log Docker
├── (admin)/                         # [PHÂN HỆ RIÊNG CHO ADMIN]
│   ├── layout.tsx                   # Layout riêng của Admin (CHỈ chứa Sidebar Admin)
│   ├── dashboard/page.tsx           # Giám sát Docker & BullMQ
│   ├── users/page.tsx               # Quản lý người dùng & RBAC
│   ├── ai-keys/page.tsx             # Quản lý kho khóa AI
│   └── queue/page.tsx               # Quản lý hàng đợi job
└── middleware.ts                    # [TƯỜNG LỬA CHẶN CỨNG URL] Chặn đứng truy cập chéo Role
```
> **Lợi ích kiến trúc:**  
> 1. Mỗi Role có một file `layout.tsx` và một Sidebar hoàn toàn tách biệt $\to$ Không có chuyện code của Role này dính vào Role kia.  
> 2. File `middleware.ts` hoạt động ở tầng Edge Network: Sinh viên cố tình gõ URL `/lecturer/...` hay `/admin/...` sẽ bị chặn ngay lập tức và redirect về `/student/dashboard`.

---

## 2. HỆ THỐNG QUY TẮC THIẾT KẾ MÀU SẮC SÁNG & BỐ CỤC CHỐNG VỠ / CHỐNG RỐI / KHOẢNG THỞ RỘNG RÃI

Để đảm bảo giao diện nhìn **sáng sủa, hiện đại, thoáng mắt, không bị dính sát nhau và không bao giờ bị vỡ layout**, toàn bộ các trang frontend phải tuân thủ nghiêm ngặt 4 nguyên tắc sau:

### 2.1. Bảng màu sáng chủ đạo (Light Theme Semantic Palette)
* **Nền tổng thể trang (Background):** `bg-slate-50` (`#F8FAFC`) - Sáng dịu, thanh lịch, tạo độ tương phản nhẹ với card trắng, không bị chói mắt.
* **Nền thẻ / Hộp chứa (Cards & Surfaces):** `bg-white` (`#FFFFFF`), kết hợp đường viền mảnh tinh tế `border border-slate-200/80` và đổ bóng nhẹ `shadow-sm hover:shadow-md transition-shadow`. Bo góc chuẩn `rounded-xl` (12px) hoặc `rounded-2xl` (16px).
* **Màu chữ tương phản cao (High Contrast Typography):**
  * Tiêu đề chính (Headings): `text-slate-900` (`font-bold` hoặc `font-semibold`), sắc nét, dễ đọc.
  * Nội dung thông thường: `text-slate-600` hoặc `text-slate-700`.
  * Ghi chú / Phụ đề: `text-slate-400` hoặc `text-slate-500` (`text-sm` hoặc `text-xs`).
* **Màu trạng thái Pastel sáng (Dịu mắt, không dùng màu dạ quang chói):**
  * 🟢 **Thành công / Pass:** `bg-emerald-50 text-emerald-700 border border-emerald-200`
  * 🔴 **Thất bại / Fail:** `bg-rose-50 text-rose-700 border border-rose-200`
  * 🟡 **Cảnh báo / TLE / Queued:** `bg-amber-50 text-amber-700 border border-amber-200`
  * 🟣 **AI RAG / Công nghệ:** `bg-violet-50 text-violet-700 border border-violet-200`
  * 🔵 **Hành động chính / Primary Button:** `bg-blue-600 hover:bg-blue-700 text-white shadow-sm`

---

### 2.2. Quy tắc Khoảng thở & Chống dính sát nhau (Spacing & Breathing Room)
* **Khoảng cách dọc giữa các Section lớn:** Luôn dùng `space-y-8` (cách nhau 32px) hoặc `space-y-6` (24px). Tuyệt đối không dùng `space-y-1` hay `space-y-2` làm các khối dính liền nhau.
* **Đệm bên trong Card (Internal Padding):** Bắt buộc tối thiểu `p-6` (24px), đối với các Card lớn hoặc Form nộp bài dùng `p-8` (32px). Cấm dùng `p-2` hay `p-3`.
* **Khoảng cách giữa các cột (Grid Gap):** Luôn dùng `gap-6` (24px) hoặc `gap-8` (32px) để các cột nội dung có rãnh phân tách rõ rệt.
* **Khoảng cách giữa các nút bấm & Tag:** Dùng `gap-3` hoặc `gap-4` kết hợp `flex-wrap`.
* **Khoảng cách giữa Icon và Text:** Luôn có `gap-2.5` hoặc `gap-3` (ví dụ: `<Button className="flex items-center gap-2.5">`).

---

### 2.3. Quy tắc Bố cục Chống vỡ Layout (Anti-Break Layout & Responsive)
* **Khung chứa trang chuẩn (Page Container):** Luôn bọc toàn bộ nội dung trong:
  ```html
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  ```
* **Grid phản hồi chống vỡ cột (Responsive Grid):**
  * Chia 3 cột: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (Điện thoại tự co 1 cột, máy tính bảng 2 cột, laptop 3 cột $\to$ Không bao giờ bị ép méo hộp).
  * Chia 2 cột tỷ lệ vàng: `grid grid-cols-1 lg:grid-cols-12 gap-8` (Cột chính `lg:col-span-7` hoặc `lg:col-span-8`, Cột phụ `lg:col-span-5` hoặc `lg:col-span-4`).
* **Chống tràn chữ làm lệch khung:** Luôn thêm `min-w-0 flex-1` và `truncate` cho các trường có thể dài (Email, tên file `.zip`, commit hash, thông báo lỗi).
* **Bảng dữ liệu chống tràn (Data Table Overflow):** Bắt buộc bọc thẻ `table` trong:
  ```html
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="w-full divide-y divide-slate-100 text-left">...</table>
  </div>
  ```
  *(Giúp bảng tự sinh thanh cuộn ngang mượt mà khi xem trên màn hình nhỏ mà không làm xô lệch các thành phần khác trên trang).*

---

## 3. BỘ PROMPT COPY-PASTE SẴN DÀNG ĐỂ SINH GIAO DIỆN (PHÂN LẬP 100% THEO ROLE)

---

### 🛡️ PROMPT M (MIDDLEWARE): TƯỜNG LỬA CHẶN CỨNG URL CHÉO ROLE (HARD BARRIER)

```markdown
Hãy đóng vai trò là Senior Next.js Security Engineer.
Hãy viết file Middleware bảo vệ phân quyền tại đường dẫn: `src/middleware.ts` cho Next.js 14 App Router.

MỤC TIÊU:
Ngăn chặn 100% việc người dùng cố tình gõ trực tiếp URL trên trình duyệt để truy cập trái phép vào trang của Role khác.

YÊU CẦU KỸ THUẬT:
1. Đọc JWT token từ HTTP Cookie (tên cookie: `aita_token` hoặc `accessToken`).
2. Giải mã payload để lấy `role` người dùng ('STUDENT' | 'LECTURER' | 'ADMIN').
3. Quy tắc kiểm soát truy cập nghiêm ngặt (Strict Access Control):
   - Nếu đường dẫn bắt đầu bằng `/student/`:
     * Bắt buộc có token và `role === 'STUDENT'`.
     * Nếu là LECTURER hoặc ADMIN hoặc chưa đăng nhập: Redirect ngay lập tức về trang tương ứng hoặc `/login`.
   - Nếu đường dẫn bắt đầu bằng `/lecturer/`:
     * Bắt buộc có token và `role === 'LECTURER'`.
     * Nếu là STUDENT hoặc chưa đăng nhập: Redirect ngay lập tức về `/student/dashboard` hoặc `/403`.
   - Nếu đường dẫn bắt đầu bằng `/admin/`:
     * Bắt buộc có token và `role === 'ADMIN'`.
     * Nếu không phải ADMIN: Chặn đứng truy cập, redirect về trang dashboard của đúng role đó hoặc `/403`.
   - Nếu đã đăng nhập thành công mà cố tình vào `/login`:
     * Tự động điều hướng về đúng Dashboard của role đó (STUDENT -> `/student/dashboard`, LECTURER -> `/lecturer/dashboard`, ADMIN -> `/admin/dashboard`).
4. Cấu hình matcher rõ ràng, bỏ qua các route tĩnh (`_next/static`, `_next/image`, `favicon.ico`, `api/auth`).
```

---

### 🎓 PROMPT 0A (STUDENT): LAYOUT & SIDEBAR BIỆT LẬP CHO SINH VIÊN

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo file Layout và Sidebar CHỈ DÀNH RIÊNG CHO SINH VIÊN tại đường dẫn: `src/app/(student)/layout.tsx` sử dụng Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP:
- File này 100% PHỤC VỤ SINH VIÊN. TUYỆT ĐỐI KHÔNG chứa bất kỳ menu, nút bấm, link hay chức năng nào của Giảng viên hay Admin.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC THOÁNG ĐÃNG:
1. Palette màu sáng:
   - Nền toàn trang: `bg-slate-50`. Nền Sidebar & Header: `bg-white border-r border-slate-200/80`.
   - Menu item thông thường: `text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-all`.
   - Menu item đang chọn (Active): `bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-600`.
2. Quy tắc khoảng cách (Không sát nhau):
   - Sidebar padding: `p-6 space-y-8`. Khoảng cách giữa các mục menu: `space-y-2`.
   - Header: `h-16 px-6 sm:px-8 border-b border-slate-200/80 flex items-center justify-between`.
3. DANH SÁCH MENU DUY NHẤT CỦA SINH VIÊN:
   - 🏠 Dashboard sinh viên (`/student/dashboard`)
   - 📝 Bài thi PE của tôi (`/student/assignments`)
   - 📊 Lịch sử nộp bài & Điểm số (`/student/submissions`)
4. Header:
   - Breadcrumb trang, Tên sinh viên + Mã SV (VD: Nguyễn Văn A - SE190001).
   - Badge Role màu xanh lục dịu mát: `bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold`.
   - Nút Đăng xuất (`text-slate-500 hover:text-rose-600`).
```

---

### 👨‍🏫 PROMPT 0B (LECTURER): LAYOUT & SIDEBAR BIỆT LẬP CHO GIẢNG VIÊN

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo file Layout và Sidebar CHỈ DÀNH RIÊNG CHO GIẢNG VIÊN tại đường dẫn: `src/app/(lecturer)/layout.tsx` sử dụng Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP:
- File này 100% PHỤC VỤ GIẢNG VIÊN. TUYỆT ĐỐI KHÔNG chứa menu Sinh viên và KHÔNG chứa các trang giám sát hạ tầng / quản lý user của Admin.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC THOÁNG ĐÃNG:
1. Palette màu sáng:
   - Nền toàn trang: `bg-slate-50`. Nền Sidebar & Header: `bg-white border-r border-slate-200/80`.
   - Menu item: `text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-all`.
   - Menu item active: `bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-600`.
2. Quy tắc khoảng cách:
   - Sidebar padding: `p-6 space-y-8`. Khoảng cách giữa các menu: `space-y-2`.
   - Header: `h-16 px-6 sm:px-8 border-b border-slate-200/80 flex items-center justify-between`.
3. DANH SÁCH MENU DUY NHẤT CỦA GIẢNG VIÊN:
   - 📈 Tổng quan giảng dạy (`/lecturer/dashboard`)
   - 👥 Quản lý Lớp học & Sinh viên (`/lecturer/courses`)
   - 📑 Quản lý Đề thi PE (`/lecturer/assignments`)
   - 🧠 Ngân hàng Testcase & RAG (`/lecturer/knowledge`)
4. Header:
   - Breadcrumb trang, Tên giảng viên (VD: ThS. Nguyễn Văn Vinh).
   - Badge Role màu xanh dương thanh lịch: `bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold`.
   - Nút Đăng xuất.
```

---

### ⚙️ PROMPT 0C (ADMIN): LAYOUT & SIDEBAR BIỆT LẬP CHO QUẢN TRỊ VIÊN

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo file Layout và Sidebar CHỈ DÀNH RIÊNG CHO ADMIN tại đường dẫn: `src/app/(admin)/layout.tsx` sử dụng Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP:
- File này 100% PHỤC VỤ QUẢN TRỊ VIÊN HẠ TẦNG. TUYỆT ĐỐI KHÔNG chứa chức năng thi cử hay học vụ của Sinh viên/Giảng viên.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC THOÁNG ĐÃNG:
1. Palette màu sáng:
   - Nền toàn trang: `bg-slate-50`. Nền Sidebar & Header: `bg-white border-r border-slate-200/80`.
   - Menu item active: `bg-rose-50 text-rose-700 font-semibold border-r-2 border-rose-600`.
2. Quy tắc khoảng cách:
   - Sidebar padding: `p-6 space-y-8`. Khoảng cách menu: `space-y-2`.
   - Header: `h-16 px-6 sm:px-8 border-b border-slate-200/80 flex items-center justify-between`.
3. DANH SÁCH MENU DUY NHẤT CỦA QUẢN TRỊ VIÊN:
   - 🖥️ Giám sát Hạ tầng & Docker (`/admin/dashboard`)
   - 👤 Quản lý Người dùng & RBAC (`/admin/users`)
   - 🔑 Kho Khóa AI Key Rotation (`/admin/ai-keys`)
   - ⚡ Hàng đợi Redis BullMQ (`/admin/queue`)
4. Header:
   - Breadcrumb trang, Tên Quản trị viên (VD: System Administrator).
   - Badge Role màu đỏ hồng quyền lực nhã nhặn: `bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-xs font-semibold`.
   - Nút Đăng xuất.
```

---

### 📋 PROMPT 1 (STUDENT): CHI TIẾT ĐỀ THI & NỘP BÀI ZIP (THOÁNG ĐÃNG, RÕ RÀNG)

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo trang Nộp bài thi PE cho Sinh viên tại đường dẫn: `src/app/(student)/assignments/[id]/page.tsx` sử dụng Next.js 14, TypeScript, Tailwind CSS và Lucide Icons.

NGUYÊN TẮC PHÂN LẬP CHỨC NĂNG (STUDENT ONLY):
- Trang này 100% DÀNH RIÊNG CHO SINH VIÊN.
- TUYỆT ĐỐI CẤM hiển thị: Code đáp án mẫu, bộ testcase ẩn của đề thi, nút sửa đề thi, hay danh sách bài nộp của các bạn học khác.
- Sinh viên chỉ xem được mô tả đề bài, giới hạn tài nguyên và nộp bài file .zip của chính mình.

YÊU CẦU THIẾT KẾ MÀU SẮC SÁNG & BỐ CỤC CHỐNG VỠ/RỐI:
1. Bố cục tổng thể (Container chống vỡ):
   - `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen`.
   - Lưới chia 2 cột thoáng đãng: `grid grid-cols-1 lg:grid-cols-12 gap-8 items-start`.
2. Header trang:
   - Thẻ Card trắng: `bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6`.
   - Tên bài thi: `text-2xl sm:text-3xl font-bold text-slate-900`.
   - Badges: Môn học (`bg-blue-50 text-blue-700 border-blue-200`), Trạng thái (`bg-emerald-50 text-emerald-700 border-emerald-200`).
   - Đồng hồ đếm ngược Deadline (Countdown Timer Card): `bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex items-center gap-4 text-amber-900 font-medium`.
3. Cột bên trái - Thông tin Đề thi (lg:col-span-7):
   - Card trắng `bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6`.
   - Trình đọc mô tả đề bài Markdown: Chia các câu hỏi Q1, Q2, Q3, Q4 bằng các khối có viền nhẹ `border border-slate-100 bg-slate-50/60 p-5 rounded-xl space-y-3`.
   - Hộp Ràng buộc (Constraints Box): `bg-blue-50/50 border border-blue-100 p-5 rounded-xl space-y-2 text-sm text-slate-700`.
     * Giới hạn: Timeout 2000ms, RAM 256MB, File .zip < 50MB.
     * Lưu ý môn học: PRF192 (.c đơn lẻ), PRO192 & CSD201 (Thư mục Q1..Q4).
4. Cột bên phải - Vùng Kéo thả Nộp bài (lg:col-span-5):
   - Card trắng `bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6`.
   - Drag and Drop Zone rộng rãi: `border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/80 hover:bg-blue-50/30 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all`.
   - Khi chọn file: Card hiển thị thông tin file `bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4`. Tên file có `truncate` chống tràn.
   - Nút nộp bài: `w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors text-base flex items-center justify-center gap-2.5`.
   - Modal xác nhận nộp bài hiển thị đè màn hình với nền mờ `bg-slate-900/40 backdrop-blur-sm`.
```

---

### 📋 PROMPT 2 (STUDENT): BÁO CÁO ĐIỂM SỐ & CHAT GIA SƯ AI (CHIA ĐÔI RÕ RÀNG)

```markdown
Hãy đóng vai trò là Senior UI/UX Frontend Engineer.
Hãy tạo trang Báo cáo Điểm thi và Khung Chat Gia sư AI cho Sinh viên tại đường dẫn: `src/app/(student)/submissions/[id]/report/page.tsx` sử dụng Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP CHỨC NĂNG (STUDENT ONLY):
- Trang này 100% DÀNH RIÊNG CHO SINH VIÊN XEM BÀI CỦA CHÍNH MÌNH.
- TUYỆT ĐỐI CẤM hiển thị:
  * Nút "Chấm lại" (Re-grade) (chức năng này chỉ Giảng viên mới có).
  * Nút "Sửa điểm" hay nhập điểm thủ công.
  * Log thô của máy chủ Docker Sandbox.
  * Đáp án mẫu ẩn hay giải thuật chi tiết của Giảng viên.
- Khung Chat AI Socratic chỉ gợi ý sư phạm gợi mở tư duy, không bao giờ cung cấp full code giải bài.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC CHỐNG SÁT NHAU / CHỐNG VỠ:
1. Bố cục tổng thể:
   - `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen`.
   - Chia 2 phân khu độc lập: `grid grid-cols-1 lg:grid-cols-12 gap-8 items-start`.
2. Phân khu 1: Báo cáo Điểm số Chi tiết (lg:col-span-7 space-y-6):
   - Card Tổng điểm: `bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm`.
     * Điểm số hiển thị cực lớn: `text-4xl font-extrabold text-blue-600`.
     * Phân rã điểm số dạng 2 thẻ con cách nhau `gap-4`:
       - Điểm Sandbox: `bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl` (VD: 6.0 / 7.0 điểm).
       - Điểm AI Rubric: `bg-violet-50/70 border border-violet-200 p-4 rounded-xl` (VD: 2.5 / 3.0 điểm).
   - Bảng danh sách Testcase (Test Cases Table):
     * Bọc ngoài bằng `overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm`.
     * Hàng bảng có padding rộng rãi: `px-5 py-4`, viền ngăn cách mảnh `border-b border-slate-100`.
     * Trạng thái testcase dùng Badge pastel: PASS (`bg-emerald-50 text-emerald-700`), FAIL (`bg-rose-50 text-rose-700`), TLE (`bg-amber-50 text-amber-700`).
     * Dòng mở rộng (Expandable Row) khi testcase bị FAIL: hiển thị Output thực tế vs Expected Output trong khối code nền xám nhạt `bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono`.
   - Card Nhận xét Sư phạm của AI: `bg-violet-50/50 border border-violet-200/80 p-6 rounded-2xl space-y-3`.
3. Phân khu 2: Chatbot Gia sư AI Socratic (lg:col-span-5):
   - Khung chat dính cố định khi cuộn trang: `bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] sticky top-8 overflow-hidden`.
   - Header chat: `p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between`.
   - Vùng tin nhắn: `flex-1 p-5 overflow-y-auto space-y-4`.
     * Tin nhắn sinh viên: `bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 text-sm max-w-[85%] ml-auto shadow-sm`.
     * Tin nhắn AI: `bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm max-w-[85%] mr-auto`.
   - Gợi ý câu hỏi nhanh (Quick Pills): Các nút bấm bo tròn `px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs transition-colors flex-wrap gap-2`.
   - Ô nhập tin nhắn: `p-4 border-t border-slate-100 bg-white flex items-center gap-3`.
```

---

### 🔵 PROMPT 3 (LECTURER): TẠO ĐỀ THI PE, NẠP TESTCASE & BAREM RAG (STEPPER SÁNG)

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo trang Tạo Đề thi PE dành cho Giảng viên tại: `src/app/(lecturer)/assignments/new/page.tsx` sử dụng Next.js 14, React Hook Form, Zod, Tailwind CSS, Shadcn UI.

NGUYÊN TẮC PHÂN LẬP CHỨC NĂNG (LECTURER ONLY):
- Trang này 100% DÀNH RIÊNG CHO GIẢNG VIÊN THIẾT KẾ ĐỀ THI.
- Giảng viên toàn quyền: Soạn thảo đề bài, nạp bộ testcases kèm `rationale` (ý đồ kiểm thử cho RAG), và nạp Code đáp án mẫu.
- TUYỆT ĐỐI CẤM hiển thị: Khung nộp bài ZIP của sinh viên, hay bất kỳ cấu hình hệ thống máy chủ / API keys nào của Admin.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC CHỐNG VỠ/RỐI:
1. Khung trang: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-slate-50 min-h-screen`.
2. Thanh tiến trình Stepper (4 bước):
   - `bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4`.
   - Bước hoàn thành: Vòng tròn xanh `bg-blue-600 text-white`, đường nối xanh `bg-blue-600`.
   - Bước chưa đến: Vòng tròn xám `bg-slate-100 text-slate-400 border border-slate-200`.
3. Khối nội dung Form (Step Card):
   - `bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-8`.
   - Các trường Input / Select: `p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 text-sm transition-all`.
   - Khoảng cách giữa các ô nhập liệu: `space-y-6` (không để các ô dính sát nhau).
4. Bước 2 (Quản lý Bộ Testcases):
   - Danh sách testcases dạng thẻ con riêng biệt cách nhau `space-y-4`. Mỗi testcase nằm trong Card xám nhạt `bg-slate-50/80 border border-slate-200/80 p-6 rounded-xl space-y-4`.
   - Trường Ý đồ kiểm thử (`rationale` - RAG Knowledge): Đánh dấu nhãn màu tím nổi bật (`text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md text-xs font-semibold`).
   - Ô nhập File I/O (`outputFileName`): Chú thích rõ `f1.txt, f2.txt` cho môn CSD201.
5. Bước 3 (Nạp Kho Đáp án Mẫu RAG):
   - Trình soạn code có chiều cao cố định `min-h-[300px] rounded-xl border border-slate-200 overflow-hidden`.
   - Form nhập độ phức tạp kỳ vọng (VD: `O(n log n)`) và ghi chú thuật toán.
6. Thanh điều hướng chân trang: `flex items-center justify-between pt-6 border-t border-slate-100 gap-4`.
```

---

### 🔵 PROMPT 4 (LECTURER): BẢNG ĐIỂM LỚP THI & LOG DOCKER (DATA TABLE CHỐNG TRÀN)

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo trang Bảng điểm Lớp thi và Quản lý Bài nộp cho Giảng viên tại: `src/app/(lecturer)/assignments/[id]/submissions/page.tsx` sử dụng Next.js 14, TanStack Table, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP CHỨC NĂNG (LECTURER ONLY):
- Trang này 100% DÀNH RIÊNG CHO GIẢNG VIÊN THEO DÕI LỚP THI CỦA MÌNH.
- Giảng viên được phép: Xem bảng điểm toàn bộ sinh viên trong lớp, mở Modal xem log chạy Docker Sandbox của từng bài, sửa điểm và bấm nút Chấm lại (Re-grade).
- TUYỆT ĐỐI CẤM: Can thiệp phân quyền tài khoản người dùng (RBAC), sửa đổi cấu hình Docker/Redis server (thuộc Admin), hoặc xem lớp của giảng viên khác ngoài phân công.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC CHỐNG VỠ/RỐI:
1. Bố cục tổng thể: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen`.
2. Hàng Thống kê (Summary KPI Cards):
   - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`.
   - Mỗi thẻ card: `bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2`.
     * Tiêu đề nhỏ: `text-sm font-medium text-slate-500`.
     * Số liệu lớn: `text-3xl font-bold text-slate-900`.
3. Thanh Tìm kiếm và Lọc (Filter Toolbar):
   - `bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4`.
   - Ô tìm kiếm có icon kính lúp, dropdown chọn khoảng điểm, nút xuất Excel màu xanh lá nhã nhặn (`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2`).
4. Bảng Dữ liệu Sinh viên (Data Table):
   - Bắt buộc bọc trong `overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm`.
   - Tiêu đề cột (th): `bg-slate-50/80 px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80`.
   - Ô dữ liệu (td): `px-6 py-4 text-sm text-slate-700 border-b border-slate-100 hover:bg-slate-50/60 transition-colors`.
   - Điểm số: Hiển thị nổi bật bằng Badge mềm mại.
5. Modal Xem Log Docker & Chấm lại (Re-grade Modal):
   - Nền mờ phủ toàn màn hình `bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4`.
   - Hộp thoại: `bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto`.
   - Khung log terminal đen tuyền sắc nét: `bg-slate-950 text-emerald-400 p-5 rounded-xl font-mono text-xs overflow-x-auto max-h-80`.
   - Nút Chấm lại (Re-grade): `bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2`.
```

---

### 🔴 PROMPT 5 (ADMIN): DASHBOARD GIÁM SÁT HẠ TẦNG REDIS & KHO KHÓA AI

```markdown
Hãy đóng vai trò là Senior DevOps / Frontend Dashboard Engineer.
Hãy tạo trang Dashboard Giám sát Hạ tầng cho Quản trị viên (Admin) tại: `src/app/(admin)/dashboard/page.tsx` sử dụng Next.js 14, Recharts, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP CHỨC NĂNG (ADMIN ONLY):
- Trang này 100% DÀNH CHO QUẢN TRỊ VIÊN HẠ TẦNG KỸ THUẬT.
- Admin toàn quyền giám sát: Hàng đợi Redis BullMQ, CPU/RAM Docker Sandbox, Kho khóa AI API Key (Gemini/OpenAI) và kích hoạt xoay vòng key.
- TUYỆT ĐỐI CẤM: Can thiệp vào làm bài thi, nộp bài, hay can thiệp vào chuyên môn chấm bài sư phạm của Giảng viên.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC CHỐNG VỠ/RỐI:
1. Bố cục tổng thể: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen`.
2. Khu vực 1: Trạng thái Hàng đợi Redis BullMQ (Queue Monitor)
   - Lưới 4 thẻ trạng thái cách nhau `gap-6`: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`.
     * QUEUED: `bg-white p-6 rounded-2xl border-l-4 border-l-amber-400 border border-slate-200/80 shadow-sm`.
     * RUNNING_SANDBOX: `bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 border border-slate-200/80 shadow-sm`.
     * RUNNING_AI: `bg-white p-6 rounded-2xl border-l-4 border-l-violet-500 border border-slate-200/80 shadow-sm`.
     * FAILED: `bg-white p-6 rounded-2xl border-l-4 border-l-rose-500 border border-slate-200/80 shadow-sm`.
   - Bảng Job đang chạy: Bọc trong `overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm`. Cột chứa Job ID dùng `truncate max-w-[120px] font-mono text-xs`.
3. Khu vực 2: Giám sát Tài nguyên Docker Sandbox
   - `grid grid-cols-1 lg:grid-cols-2 gap-8`.
   - Card biểu đồ RAM & CPU: `bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4`.
   - Sử dụng Recharts với tông màu sáng (Line/Area màu xanh dương `#2563eb` và tím `#7c3aed`), nền lưới mờ nhạt `stroke="#f1f5f9"`.
4. Khu vực 3: Kho Khóa API AI (AI Key Pool & Rotation)
   - `bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6`.
   - Header có nút "Thêm Khóa mới" (`bg-blue-600 text-white rounded-xl px-4 py-2.5`) và "Kiểm tra sức khỏe toàn bộ Key".
   - Bảng danh sách Key hiển thị trạng thái bằng Switch Toggle (Bật/Tắt) và Badge Rate Limit.
```

---

### 🔴 PROMPT 6 (ADMIN): QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN RBAC

```markdown
Hãy đóng vai trò là Senior Frontend Engineer.
Hãy tạo trang Quản lý Người dùng và Cấp quyền RBAC dành cho Admin tại: `src/app/(admin)/users/page.tsx` sử dụng Next.js 14, TypeScript, Tailwind CSS, Lucide Icons.

NGUYÊN TẮC PHÂN LẬP CHỨC NĂNG (ADMIN ONLY):
- Trang này 100% DÀNH CHO ADMIN QUẢN TRỊ TÀI KHOẢN TOÀN TRƯỜNG.
- Admin toàn quyền: Tạo tài khoản, Import danh sách Excel, Khóa/Mở tài khoản, Cấp và đổi Role trực tiếp ('ADMIN' | 'LECTURER' | 'STUDENT').
- TUYỆT ĐỐI CẤM: Chứa giao diện nộp bài của sinh viên hoặc giao diện tạo bài thi của Giảng viên.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC CHỐNG VỠ/RỐI:
1. Bố cục: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 min-h-screen`.
2. Thanh công cụ phía trên:
   - `bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4`.
   - Nhóm nút bên phải: Nút "Tạo tài khoản" (`bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium`) và Nút "Import Excel" (`bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2`).
3. Bảng Dữ liệu Người dùng:
   - Bọc trong `overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm`.
   - Cột Role hiển thị Dropdown nhanh cho phép Admin đổi quyền tại chỗ:
     * ADMIN: `bg-rose-50 text-rose-700 border border-rose-200`
     * LECTURER: `bg-blue-50 text-blue-700 border border-blue-200`
     * STUDENT: `bg-emerald-50 text-emerald-700 border border-emerald-200`
   - Cột Email có `min-w-0 truncate` để không làm vỡ độ rộng cột.
4. Modal Tạo / Chỉnh sửa Người dùng:
   - Hộp thoại `bg-white rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-xl border border-slate-200`.
   - Các ô input: `p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 space-y-2`.
```

---

### 🔴 PROMPT 6B (ADMIN): MODAL / DRAWER HỒ SƠ CHI TIẾT NGƯỜI DÙNG (USER 360° DRAWER)

```markdown
Hãy đóng vai trò là Senior Frontend Developer.
Hãy tạo component Drawer / Modal xem và quản trị chi tiết hồ sơ người dùng dành cho Admin tại: `src/components/admin/UserDetailDrawer.tsx` sử dụng Next.js 14, Tailwind CSS, Lucide Icons, Radix UI / Shadcn Sheet.

MỤC TIÊU:
Khi Admin click vào bất kỳ hàng người dùng nào trong bảng `/admin/users`, một Drawer sẽ trượt ra từ bên phải màn hình hiển thị toàn bộ thông tin chi tiết và lịch sử học vụ theo đúng Role của người đó.

YÊU CẦU THIẾT KẾ MÀU SÁNG & BỐ CỤC CHỐNG VỠ:
1. Khung Drawer:
   - Chiều rộng `max-w-2xl w-full bg-white h-full shadow-2xl p-6 sm:p-8 space-y-8 overflow-y-auto border-l border-slate-200`.
2. Phần Đầu (Header chung cho mọi User):
   - Avatar lớn, Họ tên (`text-xl font-bold text-slate-900`), Email FPT (`text-sm text-slate-500 font-mono`).
   - Badge trạng thái: `ACTIVE` (`bg-emerald-50 text-emerald-700 border-emerald-200`) hoặc `BANNED` (`bg-rose-50 text-rose-700 border-rose-200`).
   - Nhóm nút điều khiển nhanh: Dropdown đổi Role (`STUDENT` / `LECTURER` / `ADMIN`), nút "Khóa tài khoản", nút "Reset mật khẩu".
3. TRƯỜNG HỢP 1: NGƯỜI DÙNG LÀ GIẢNG VIÊN (`role === 'LECTURER'`):
   - Thẻ thống kê 3 cột: Số lớp phụ trách | Số đề PE đã tạo | Tổng sinh viên đang dạy (`grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200`).
   - Danh sách Lớp học đang dạy: Bảng gồm Mã lớp, Môn học (PRF192, PRO192, CSD201), Sĩ số, Học kỳ. Kèm nút "Phân công thêm lớp".
   - Danh sách Đề thi đã biên soạn: Bảng tên đề, môn thi, trạng thái (Active/Closed).
   - Lịch sử Chấm thi & Re-grade: Ghi nhận các lần thầy sửa điểm hoặc chấm lại bài cho sinh viên.
4. TRƯỜNG HỢP 2: NGƯỜI DÙNG LÀ SINH VIÊN (`role === 'STUDENT'`):
   - Mã số sinh viên (MSSV: `QE190161`), Chuyên ngành Software Engineering.
   - Bảng Lớp học đang theo học: Tên lớp, Môn học, Tên Giảng viên phụ trách.
   - Bảng Lịch sử Thi PE & Điểm số: Tên bài thi, Điểm tổng kết (Sandbox 7.0 + AI Rubric 3.0), Trạng thái Pass/Fail, Số lần nộp file ZIP.
   - Hộp Cảnh báo An toàn Kỹ thuật (Security Audit Flags): Thẻ cảnh báo nền đỏ nhạt (`bg-rose-50/70 border border-rose-200 p-4 rounded-xl space-y-2`) hiển thị nếu sinh viên từng nộp code bị Sandbox chặn (lệnh độc hại, fork-bomb, timeout) kèm địa chỉ IP nộp bài.
```
