# NHẬT KÝ SỬ DỤNG AI CÁ NHÂN - THÀNH VIÊN 3
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – Software Architecture and Design (Lớp SE19C - Fall 2026)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Vinh  
**Nhóm:** GROUP 2  
**Thành viên:** Nguyễn Anh Tuấn (QE190003) - Member 3  
**Phân hệ phụ trách:** TV3 – Submission Ingestion & Workspace Staging (backend); Admin Dashboard Frontend và Mock Data Layer (frontend)  
**Branch:** `feature/AnhTuan/submission-staging`  
**Công cụ AI:** Claude Code (Sonnet 5.5)  
**Thời gian thực hiện (phần Frontend Admin):** 05/10/2026 – 12/10/2026

> Các prompt backend của TV3 (Submission Ingestion, Zip Slip, `IGradingDispatcher`, dọn workspace) nằm trong Master log `AI_PROMPT_LOG.md` (prompt 35–38). File này ghi các phiên làm việc về **giao diện Admin**.

---

## 1. BẢNG THEO DÕI PROMPT CÁ NHÂN (PROMPT & CONTEXT LOG)

AI sinh mã nguồn và tự chạy kiểm tra trong phiên làm việc (`tsc --noEmit`, kịch bản kiểm thử trên trình duyệt). Sinh viên chịu trách nhiệm rà soát mã, đối chiếu với thiết kế và quyết định hướng đi.

| STT | Ngày | Thành viên | Công cụ AI | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Tinh chỉnh |
|:---:|:---:|:---:|:---|:---|:---|:---|
| **1** | 05/10/2026 | Nguyễn Anh Tuấn (Member 3) | Claude Code | Sinh 5 trang Admin từ thiết kế Stitch + SRS | *"generate me admin dashboard FE pages based on this design and SRS requirements"* (kèm file zip thiết kế Stitch) | Sinh `/admin/dashboard`, `/users`, `/ai-keys`, `/queue`, `/docker` theo Feature-Driven Architecture (`Code/frontend/src/features/admin/`). Chọn bảng màu blue theo `DESIGN.md`; thêm trang `/admin/docker` có trong thiết kế dù SRS chỉ liệt kê 4 trang. Sửa `tailwind.config.ts` (thiếu đường dẫn `src/features/`). |
| **2** | 05/10/2026 | Nguyễn Anh Tuấn (Member 3) | Claude Code | Hướng dẫn kiểm tra trang đã sinh | *"how do I check the pages if they are correctly generated"* | Quy trình chạy `npm run dev`, giả lập phiên ADMIN bằng `localStorage`, đối chiếu từng route với `screen.png`, kiểm tra TypeScript bằng `npx tsc --noEmit`. |
| **3** | 05/10/2026 | Nguyễn Anh Tuấn (Member 3) | Claude Code | Mock Data Layer bằng localStorage, giao diện giống thiết kế | *"generate me a local storage as there are still no APIs for testing FE, add mock users/features that needs API based on the design and look exactly like it"* | Cờ `USE_MOCK`, mock DB (1.420 user, 20 AI key, 35 job) trong `localStorage`, service hai nhánh mock/API thật; làm lại trang Users và AI Keys sát `screen.png`. |
| **4** | 05/10/2026 | Nguyễn Anh Tuấn (Member 3) | Claude Code | Kích hoạt nút bấm cục bộ | *"Make as many buttons functionable locally as possible"* | Toast, xuất/nhập CSV, phân công lớp, cấu hình Router/Sandbox, retry/ưu tiên job, flush DLQ, xuất báo cáo, log Docker streaming; lưu bền trong `localStorage`. |
| **5** | 06/10/2026 | Nguyễn Anh Tuấn (Member 3) | Claude Code | Tự sinh mật khẩu tạm thời | *"make the 'Tạo tài khoản mới' and 'Reset mật khẩu' button on /admin/users to auto generate a random string of password for the user to make a new one later"* | `generatePassword()` dùng `crypto.getRandomValues`, `TempPasswordModal` hiển thị mật khẩu một lần kèm nút sao chép, huy hiệu "Chờ đổi mật khẩu" (mock). |
| **6** | 12/10/2026 | Nguyễn Anh Tuấn (Member 3) | Claude Code | Cập nhật nhật ký prompt AI | *"read the AI prompt log folder Document_project/01_General and update it based on my prompt chat with you"* | Cập nhật Master log (prompt 55–60), tạo file này và cập nhật mục lục `README.md`. |

---

## 2. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG SWD392 (EXCEL COMPLIANT)

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | Frontend Design Implementation | Chuyển thiết kế Stitch + SRS thành 5 trang Admin | Claude Code | Layout/Sidebar/Topbar ADMIN, bộ UI dùng chung, trang Users/AI Keys gọi API thật | Đối chiếu `screen.png`, chọn bảng màu theo `DESIGN.md`, sửa cấu hình Tailwind, chạy `tsc --noEmit` | [`src/features/admin/`](../../Code/frontend/src/features/admin/); [`src/app/admin/`](../../Code/frontend/src/app/admin/) | 63 file TypeScript, 42 component `.tsx` | 5 | Một số file vượt 150 dòng của `RULE.md`; guard RBAC phía client không thay thế kiểm tra ở backend |
| 2 | Frontend Testing Support | Mock Data Layer bằng localStorage | Claude Code | Cờ `USE_MOCK`, mock DB, service hai nhánh | Kiểm tra số liệu khớp thiết kế, dữ liệu lưu bền sau reload | [`src/features/admin/mocks/`](../../Code/frontend/src/features/admin/mocks/); [`src/config/mock.ts`](../../Code/frontend/src/config/mock.ts) | 1.420 user, 20 AI key, 35 job mẫu | 5 | Trường mã số/bộ môn/lớp chưa có trong backend; mock có thể lệch hợp đồng API thật |
| 3 | Frontend Interaction | Kích hoạt nút bấm cục bộ | Claude Code | Toast, CSV, thao tác hàng đợi, cấu hình, log streaming | Chạy kịch bản kiểm thử trên trình duyệt cho từng nhóm thao tác | [`src/lib/download.ts`](../../Code/frontend/src/lib/download.ts); [`src/features/admin/components/`](../../Code/frontend/src/features/admin/components/) | Gần như toàn bộ nút trên 5 trang có hành vi cục bộ | 4 | Nhập Excel, bật/tắt key, lưu Router/Sandbox chỉ chạy ở mock vì backend chưa có API |
| 4 | Security UX | Sinh mật khẩu tạm thời an toàn | Claude Code | `generatePassword()` (CSPRNG), `TempPasswordModal` | Kiểm thử định dạng mật khẩu bằng regex, hai lần sinh cho kết quả khác nhau | [`src/lib/password.ts`](../../Code/frontend/src/lib/password.ts); [`TempPasswordModal.tsx`](../../Code/frontend/src/features/admin/components/users/TempPasswordModal.tsx) | Mật khẩu 12 ký tự, 4 nhóm ký tự | 4 | Backend chưa có cờ `mustChangePassword` nên chưa ép đổi mật khẩu; mật khẩu chỉ hiển thị phía client |

---

## 3. TỔNG KẾT CÔNG VIỆC TV3 (FRONTEND ADMIN)

- **Phạm vi:** 5 trang Admin (Dashboard, Users & RBAC, AI Keys, BullMQ Queue, Docker Sandbox) bám sát thiết kế Stitch.
- **Chế độ Mock:** bật mặc định; đặt `NEXT_PUBLIC_USE_MOCK=false` trong `.env.local` để gọi API thật (`/users`, `/ai/api-keys`).
- **Chưa có backend tương ứng:** hàng đợi/Docker/dashboard (dữ liệu mẫu), nhập Excel, bật/tắt key, cấu hình Router/Sandbox, cờ `mustChangePassword`.
- **Việc cần làm tiếp:** tách các file trên 150 dòng, bổ sung trang `/login` và `/403`, viết `middleware.ts` chặn URL chéo quyền theo SRS.
