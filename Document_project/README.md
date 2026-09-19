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
- [RBAC_Roles_and_Permissions.md](02_Requirements_SRS/RBAC_Roles_and_Permissions.md): Ma trận phân quyền chi tiết (ADMIN, LECTURER, STUDENT) và bảng CRUD Database permissions.
- [4_FPT_PE_Mechanisms_and_Task_Breakdown.md](02_Requirements_SRS/4_FPT_PE_Mechanisms_and_Task_Breakdown.md): Phân tích chuyên sâu 2 luồng chấm PE đặc thù FPT (môn C vs môn Java PRO/CSD).
- [Backend_Task_Allocation_6_Members.md](02_Requirements_SRS/Backend_Task_Allocation_6_Members.md): **[CHÍNH THỨC]** Kế hoạch phân chia 100% Backend cho 6 người (Bỏ GitHub, tập trung chấm ZIP, không chồng chéo).
- [Team_6_Fullstack_Task_Allocation.md](02_Requirements_SRS/Team_6_Fullstack_Task_Allocation.md): Kế hoạch phân chia Full-stack tham chiếu (cả FE + BE).

---

## 📂 03_Architecture_Database (Thiết Kế Kiến Trúc & CSDL - Evaluation 2)
- [2_Database_Schema.sql](03_Architecture_Database/2_Database_Schema.sql): Kịch bản SQL tạo Database MySQL hoàn chỉnh (GradingJob có priority, RubricRule, AiApiKey rotation).
- [3_System_Architecture_and_Code_Plan.md](03_Architecture_Database/3_System_Architecture_and_Code_Plan.md): Kiến trúc Clean Architecture, 3 Design Patterns và kế hoạch 10 tuần.
- [4_Core_Concepts_Static_Dynamic_RAG_Sandbox.md](03_Architecture_Database/4_Core_Concepts_Static_Dynamic_RAG_Sandbox.md): **[BẮT BUỘC ĐỌC]** Cẩm nang giải thích chuyên sâu các khái niệm cốt lõi: Mô hình tĩnh vs Mô hình động, Cơ chế RAG, Docker Sandbox và Bộ câu hỏi phản biện bảo vệ đồ án (Defense Q&A).

---

## 📂 04_Diagrams (Toàn Bộ Sơ Đồ Thiết Kế Hệ Thống - Evaluation 2)
- **Tài liệu thuyết minh:** [System_Modeling_Static_and_Dynamic.md](04_Diagrams/System_Modeling_Static_and_Dynamic.md) - Thuyết minh chi tiết toàn bộ mô hình hóa tĩnh và mô hình hóa động theo chuẩn SWD392 FPT.
- **plantuml/** (Mở file trong VS Code và nhấn `Alt + D` để xem trực tiếp):
  - **Mô hình hóa Tĩnh (Static Modeling):**
    - [class_diagram_static_model.puml](04_Diagrams/plantuml/class_diagram_static_model.puml): Sơ đồ lớp miền nghiệp vụ (Domain Class Diagram) đầy đủ 16 thực thể, khóa chính PK, khóa ngoại FK và quan hệ theo chuẩn slide Ch07 FPT.
  - **Mô hình hóa Động (Dynamic Modeling):**
    - [sequence_diagram_dynamic_model.puml](04_Diagrams/plantuml/sequence_diagram_dynamic_model.puml): Sơ đồ tuần tự (Sequence Diagram) luồng nộp và chấm bài PE tự động kết hợp Docker Sandbox & RAG AI (UC06).
    - [state_diagram_dynamic_model.puml](04_Diagrams/plantuml/state_diagram_dynamic_model.puml): Sơ đồ máy trạng thái (State Machine Diagram) vòng đời của GradingJob và Submission (với cơ chế Retry 3 lần).
    - [activity_diagram_pe_grading.puml](04_Diagrams/plantuml/activity_diagram_pe_grading.puml): Sơ đồ hoạt động (Activity Diagram) toàn bộ quy trình chấm điểm PE.
- **references/**: Chứa các sơ đồ ảnh tham chiếu đề bài:
  - `flow_diagram_PRO_CSD.jpg`: Sơ đồ luồng PE môn PRO & CSD.
  - `PRF_follow_diagram.jpg`: Sơ đồ luồng PE môn PRF192.
