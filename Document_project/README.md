# MỤC LỤC TÀI LIỆU DỰ ÁN AITA (SWD392)
**Hệ thống:** AITA (AI-powered Teaching Assistant System)  
**Đại học:** FPT University  

Toàn bộ tài liệu phân tích, thiết kế và sơ đồ kỹ thuật của dự án đã được sắp xếp khoa học theo 4 nhóm mục tiêu tương ứng với các đợt đánh giá:

---

## 📂 01_General (Tổng Quan & Quy Định)
- [AITA_Project_Master_Document.md](01_General/AITA_Project_Master_Document.md): Tài liệu tổng quan dự án, mục tiêu, 5 Research Spikes và lộ trình 10 tuần.
- [AI_PROMPT_LOG.md](01_General/AI_PROMPT_LOG.md): Nhật ký lưu trữ prompt AI phục vụ tiêu chí **Transparency & Explainability** bắt buộc của SWD392.

---

## 📂 02_Requirements_SRS (Đặc Tả Yêu Cầu - Evaluation 1)
- [1_SRS_Requirements_and_UseCases.md](02_Requirements_SRS/1_SRS_Requirements_and_UseCases.md): Danh sách Actors, Functional & Non-Functional Requirements, đặc tả chi tiết các Use Case.
- [4_FPT_PE_Mechanisms_and_Task_Breakdown.md](02_Requirements_SRS/4_FPT_PE_Mechanisms_and_Task_Breakdown.md): Phân tích chuyên sâu 2 luồng chấm PE đặc thù FPT (môn C vs môn Java PRO/CSD).
- [Team_6_Fullstack_Task_Allocation.md](02_Requirements_SRS/Team_6_Fullstack_Task_Allocation.md): **[MỚI]** Kế hoạch phân chia chi tiết 6 phân hệ Full-stack cho nhóm 6 thành viên (FE + BE + DB).

---

## 📂 03_Architecture_Database (Thiết Kế Kiến Trúc & CSDL - Evaluation 2)
- [2_Database_Schema.sql](03_Architecture_Database/2_Database_Schema.sql): Kịch bản SQL tạo Database MySQL hoàn chỉnh (GradingJob có priority, RubricRule, AiApiKey rotation).
- [3_System_Architecture_and_Code_Plan.md](03_Architecture_Database/3_System_Architecture_and_Code_Plan.md): Kiến trúc Clean Architecture, 3 Design Patterns và kế hoạch 10 tuần.

---

## 📂 04_Diagrams (Toàn Bộ Sơ Đồ Kỹ Thuật)
- **plantuml/**: Chứa mã nguồn PlantUML để xem trực tiếp (`Alt + D`) và xuất ảnh:
  - [activity_diagram_pe_grading.puml](04_Diagrams/plantuml/activity_diagram_pe_grading.puml): Sơ đồ luồng hoạt động chính của hệ thống chấm PE.
  - [class_diagram_static_model.puml](04_Diagrams/plantuml/class_diagram_static_model.puml): Sơ đồ lớp miền nghiệp vụ (Static Model) theo chuẩn slide Ch07 FPT.
- **references/**: Chứa các sơ đồ ảnh tham chiếu đề bài:
  - `flow_diagram_PRO_CSD.jpg`: Sơ đồ luồng PE môn PRO & CSD.
  - `PRF_follow_diagram.jpg`: Sơ đồ luồng PE môn PRF192.
