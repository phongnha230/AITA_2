# NHẬT KÝ SỬ DỤNG AI (AI PROMPT LOG) - MÔN SWD392
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Nhóm sinh viên:** [Tên Nhóm / MSSV các thành viên]  
**Mục tiêu:** Đáp ứng tiêu chí **Transparency (Minh bạch)** và **Explainability (Giải trình)** trong quy định sử dụng AI của môn học SWD392.

---

## BẢNG THEO DÕI PROMPT THEO CÁC GIAI ĐOẠN

| STT | Ngày | Thành viên thực hiện | Công cụ AI sử dụng | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Cách tinh chỉnh vào hệ thống |
|:---:|:---:|:---:|:---:|:---|:---|:---|
| 1 | 14/09/2026 | Cả nhóm | ChatGPT / Antigravity | Phân tích yêu cầu và Use Case cho hệ thống AITA | "Hãy đóng vai trò Solution Architect môn SWD392, thiết kế danh sách Functional & Non-functional Requirements và Use Case chi tiết cho hệ thống trợ giảng thông minh AITA (Next.js + Express.js + MySQL)." | Sinh ra 9 FRs, 4 NFRs và 13 Use Cases; nhóm đã rút gọn theo phạm vi web thuần túy và chuẩn hóa thuật ngữ. |
| 2 | 14/09/2026 | Cả nhóm | Claude / Antigravity | Thiết kế cơ sở dữ liệu MySQL thỏa mãn tiêu chí Evaluation 2 | "Hãy thiết kế Database Schema MySQL cho hệ thống AITA, bắt buộc có bảng GradingJob (có priority, status, retry), RubricRule và AiApiKey (hỗ trợ rotation)." | Sinh ra script DDL hoàn chỉnh với quan hệ khóa ngoại, index tối ưu và seed data mẫu; lưu tại `2_Database_Schema.sql`. |
| 3 | 14/09/2026 | Cả nhóm | Copilot / Antigravity | Thiết kế kiến trúc Clean Architecture & 3 Design Patterns | "Đề xuất kiến trúc Clean Architecture cho Express.js + TypeScript và ứng dụng 3 Design Patterns: Factory Method, Adapter, Strategy cho AITA." | Áp dụng cấu trúc thư mục 4 tầng (Domain, Application, Infrastructure, Presentation) và định nghĩa các interface trừu tượng. |
| ... | ... | ... | ... | ... | *(Nhóm tiếp tục cập nhật các câu prompt trong quá trình code tại đây)* |

---

## NGUYÊN TẮC GIẢI TRÌNH MÃ NGUỒN (EXPLAINABILITY CHECKLIST)
Mỗi thành viên khi sử dụng AI sinh code cần tự kiểm tra 3 câu hỏi trước buổi Review/Defense:
1. *Đoạn code này xử lý nghiệp vụ gì trong Module của mình?*
2. *Tại sao lại chọn cấu trúc dữ liệu / thuật toán / design pattern này thay vì cách khác?*
3. *Nếu giảng viên yêu cầu đổi logic tại chỗ (Live Debugging), mình có thể sửa ngay trong 3-5 phút không?*
