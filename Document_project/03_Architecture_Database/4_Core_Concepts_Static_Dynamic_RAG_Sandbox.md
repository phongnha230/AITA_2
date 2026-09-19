# GIẢI THÍCH CÁC KHÁI NIỆM CỐT LÕI HỆ THỐNG AITA (SWD392)
**Học phần:** SWD392 – Software Architecture and Design (FPT University)  
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Tài liệu:** Cẩm nang kiến trúc dành cho nhóm sinh viên bảo vệ Evaluation 2 (Architecture & System Modeling)

---

## 1. MÔ HÌNH HÓA TĨNH VS MÔ HÌNH HÓA ĐỘNG LÀ GÌ VÀ KHÁC NHAU NHƯ THẾ NÀO?

Trong thiết kế kiến trúc phần mềm chuẩn UML và giáo trình SWD392 (Chapter 7 & Chapter 8), một hệ thống phần mềm luôn được quan sát dưới hai lăng kính bổ trợ cho nhau:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG PHẦN MỀM TOÀN DIỆN (AITA)                   │
├───────────────────────────────────┬────────────────────────────────────┤
│   MÔ HÌNH HÓA TĨNH (STATIC MODEL) │   MÔ HÌNH HÓA ĐỘNG (DYNAMIC MODEL) │
│       "Hệ thống CÓ NHỮNG GÌ?"     │      "Hệ thống CHẠY NHƯ THẾ NÀO?"  │
│   (Cấu trúc, Thực thể, Khóa, Dữ liệu)│  (Thời gian, Thông điệp, Trạng thái)│
└───────────────────────────────────┴────────────────────────────────────┘
```

### 1.1. Mô hình hóa Tĩnh (Static Modeling)
* **Khái niệm:** Là mô hình mô tả **cấu trúc tĩnh bất biến** của hệ thống. Nó trả lời câu hỏi: *"Hệ thống gồm những đối tượng/thực thể nào, mỗi thực thể có những dữ liệu gì và chúng liên kết với nhau bằng quan hệ gì?"* mà **không phụ thuộc vào yếu tố thời gian**.
* **Sơ đồ đại diện:** **Domain Class Diagram (Sơ đồ lớp miền nghiệp vụ)**, Database Schema (ERD).
* **Trong dự án AITA:**
  * File sơ đồ: [`class_diagram_static_model.puml`](../04_Diagrams/plantuml/class_diagram_static_model.puml)
  * Mô tả 14 thực thể được phân thành 4 tầng:
    1. *IAM & Lớp học:* `User` (Giảng viên, Sinh viên), `Course`, `CourseEnrollment`.
    2. *Đề thi & Tri thức RAG:* `Assignment`, `TestCase` (Q1..Q4, File I/O), `AssignmentSolution` (code mẫu), `RubricRule`.
    3. *Nộp bài & Docker:* `Submission` (file ZIP), `GradingJob` (Redis Queue), `SubmissionTestResult`.
    4. *AI & Gia sư:* `AiApiKey`, `AiGradingResult`, `AiTutorConversation`, `AiTutorMessage`.
  * Xác định rõ **Khóa chính (`<<PK>>`)**, **Khóa ngoại (`<<FK>>`)**, và **Bội số quan hệ** (`1` -- `0..*`, `1` -- `1..*`).

---

### 1.2. Mô hình hóa Động (Dynamic Modeling)
* **Khái niệm:** Là mô hình mô tả **hành vi ứng xử (Behavior) và sự tương tác theo dòng thời gian** giữa các đối tượng để thực thi một chức năng cụ thể (Use Case). Nó trả lời câu hỏi: *"Khi có một sự kiện kích hoạt, đối tượng nào gọi đối tượng nào trước, thông điệp truyền đi là gì, dữ liệu thay đổi và trạng thái hệ thống biến đổi ra sao?"*
* **Sơ đồ đại diện:**
  1. **Sequence Diagram (Sơ đồ tuần tự):** Thể hiện thứ tự gửi/nhận thông điệp giữa các tầng kiến trúc (Controller $\to$ UseCase $\to$ Service $\to$ Queue $\to$ Docker $\to$ AI $\to$ DB).
  2. **State Machine Diagram (Sơ đồ máy trạng thái):** Thể hiện vòng đời và sự chuyển đổi trạng thái của một thực thể (ví dụ: `GradingJob` từ `QUEUED` $\to$ `RUNNING_SANDBOX` $\to$ `RUNNING_AI` $\to$ `COMPLETED`).
* **Trong dự án AITA:**
  * File Sequence Diagram: [`sequence_diagram_dynamic_model.puml`](../04_Diagrams/plantuml/sequence_diagram_dynamic_model.puml)
  * File State Machine: [`state_diagram_dynamic_model.puml`](../04_Diagrams/plantuml/state_diagram_dynamic_model.puml)

---

### 1.3. Bảng so sánh trực diện giữa Mô hình Tĩnh và Mô hình Động

| Tiêu chí | Mô hình hóa Tĩnh (Static Modeling) | Mô hình hóa Động (Dynamic Modeling) |
| :--- | :--- | :--- |
| **Bản chất** | Cấu trúc không gian, dữ liệu và quan hệ. | Hành vi thời gian, thông điệp và tiến trình xử lý. |
| **Câu hỏi trọng tâm** | Hệ thống **CÓ GÌ**? (Entities, Attributes, Relations) | Hệ thống **CHẠY THẾ NÀO**? (Events, Methods, State transitions) |
| **Yếu tố thời gian** | **Bất biến** (Không phụ thuộc thứ tự thời gian). | **Ràng buộc chặt chẽ** (Từ trên xuống dưới theo trục thời gian). |
| **Sơ đồ UML chính** | **Class Diagram**, Object Diagram, Package Diagram. | **Sequence Diagram**, **State Machine Diagram**, Activity Diagram. |
| **Ánh xạ vào Code** | Các class TypeScript, Interface, bảng CSDL Prisma (`schema.prisma`, `models`). | Các Use Cases, Service calls, Queue Worker, Message handlers (`execute()`, `popNextJob()`). |
| **Ví dụ trong AITA** | Thực thể `Submission` có khóa `id`, `stagedPath`, `totalScore`. | Sinh viên nhấn Nộp bài $\to$ Controller đẩy job $\to$ Sandbox chạy $\to$ AI chấm $\to$ Trả kết quả. |

---

## 2. CƠ CHẾ RAG (RETRIEVAL-AUGMENTED GENERATION) LÀ GÌ VÀ HOẠT ĐỘNG NHƯ THẾ NÀO?

### 2.1. RAG là gì? Tại sao phải dùng RAG trong AITA?
* **Định nghĩa:** **RAG (Retrieval-Augmented Generation)** là kỹ thuật kết hợp giữa **Hệ thống truy xuất dữ liệu chuyên biệt (Vector Search)** và **Mô hình ngôn ngữ lớn (LLM - Gemini/OpenAI)**.
* **Vấn đề của AI thông thường nếu không có RAG:**
  1. *Ảo giác (Hallucination):* AI tự "bịa" ra nguyên nhân lỗi khi không biết đề thi cụ thể yêu cầu gì.
  2. *Mù tịt về đề thi nội bộ:* LLM không được huấn luyện trên bộ đề thi PE mới nhất của FPT University kỳ Fall 2026.
  3. *Nguy cơ lộ đáp án (Cheating):* Nếu bảo AI "hãy giải bài cho sinh viên", AI sẽ nhả thẳng code giải, làm mất tính giáo dục.
* **Giải pháp RAG của AITA:** 
  AITA không dùng RAG cho tài liệu PDF slide bài giảng chung chung, mà xây dựng **Kho tri thức đề thi & giải thuật chuẩn mực (Ground-Truth Knowledge Base)** trong CSDL Vector (ChromaDB) từ 2 nguồn:
  * `test_cases.rationale`: Ý đồ kiểm tra của từng testcase (VD: *"Testcase 4 nạp 100,000 node để kiểm tra độ phức tạp thời gian. Yêu cầu giải thuật $O(n \log n)$"*).
  * `assignment_solutions`: Đáp án mẫu của Giảng viên, giải thích thuật toán tối ưu và các bẫy điều kiện biên (VD: *"Phải kiểm tra `head == null` trước khi gọi đệ quy"*).

---

### 2.2. Luồng hoạt động 3 bước của RAG trong AITA

```
[BƯỚC 1: DOCKER SANDBOX CHẠY THỰC TẾ]
Code sinh viên chạy ra kết quả:
- Test 1, 2, 3: PASS
- Test 4: FAIL (Time Limit Exceeded - Chạy quá 2000ms)
- Test 5: FAIL (Wrong Answer)
                 │
                 ▼
[BƯỚC 2: RAG TRUY XUẤT NGỮ CẢNH ĐÁP ÁN & TESTCASE]
RAG Vector Search tự động tìm trong Kho tài liệu đề thi:
- "Testcase 4 có ý đồ kiểm tra điều gì?"
  ──► Trả về: "Testcase 4 nạp 100,000 node để kiểm tra độ phức tạp. Yêu cầu giải thuật O(n log n)".
- "Đáp án mẫu xử lý Testcase 5 như thế nào?"
  ──► Trả về: "Đáp án mẫu dùng kiểm tra điều kiện (head == null) trước khi gọi đệ quy".
                 │
                 ▼
[BƯỚC 3: AI ĐỐI CHIẾU NGẦM & PHẢN HỒI SƯ PHẠM]
AI so sánh đoạn code thực tế của sinh viên với Rationale từ RAG:
- Phát hiện: Sinh viên đang dùng 2 vòng lặp for lồng nhau O(n^2) ở câu Q2.
- Hành động AI:
  1. Chấm điểm Rubric: Tiêu chí Tối ưu thuật toán = 0.5 / 1.0 điểm.
  2. Phản hồi Socratic: "Ở câu Q2, hàm của em đang duyệt lặp 2 vòng lồng nhau khiến thời gian chạy tăng bậc 2 khi dữ liệu lớn. Em có thể áp dụng cấu trúc dữ liệu nào (như HashMap hoặc Binary Search) để giảm độ phức tạp xuống O(n log n) không?"
  ==> TUYỆT ĐỐI KHÔNG CHÉP NGUYÊN CODE GIẢI CỦA ĐÁP ÁN MẪU CHO SINH VIÊN!
```

### 2.3. Ba nguyên tắc sống còn của cơ chế RAG trong AITA
1. **Chỉ kích hoạt có điều kiện (Conditional Trigger):** Nếu sinh viên làm bài đúng 100% testcases, hệ thống **bỏ qua bước gọi RAG AI**, tự động cho điểm tối đa để **tiết kiệm 80% chi phí API và tài nguyên server**.
2. **Đối chiếu ngầm (Hidden Ground-Truth Comparison):** AI dùng code mẫu để làm "thước đo ngầm" chấm điểm logic chứ không bao giờ gửi code mẫu về cho client.
3. **Socratic Guidance (Phương pháp sư phạm Socratic):** Định hướng tư duy bằng câu hỏi gợi mở, giúp sinh viên tự nhận ra lỗi sai của mình.

---

## 3. DOCKER SANDBOX LÀ GÌ VÀ NÓ HOẠT ĐỘNG NHƯ THẾ NÀO?

### 3.1. Docker Sandbox là gì? Tại sao bắt buộc phải có Sandbox?
* **Định nghĩa:** **Sandbox (Hộp cát)** là một môi trường ảo hóa cô lập an toàn, nơi mã nguồn chưa được kiểm chứng của sinh viên được biên dịch và thực thi mà **hoàn toàn không có khả năng gây hại cho máy chủ thật (Host OS)**.
* **Các nguy cơ chết người nếu chạy code sinh viên trực tiếp trên server:**
  1. *Lệnh phá hoại hệ thống:* Sinh viên vô tình hoặc cố ý gọi `system("rm -rf /")` (trong C) hoặc `Runtime.getRuntime().exec("shutdown")` (trong Java) làm xóa sạch dữ liệu server.
  2. *Tấn công chiếm tài nguyên (Fork Bomb / Infinite Loop):* Vòng lặp vô tận `while(1)` hoặc đệ quy vô hạn làm CPU server đạt 100%, đơ toàn bộ hệ thống trường.
  3. *Đọc trộm đề thi và testcase ẩn:* Sinh viên viết lệnh File I/O đọc ngược thư mục cha `../../testcases/secret_test.txt` để lấy kết quả mong đợi.
  4. *Mã độc socket:* Sinh viên mở kết nối mạng ngầm gửi đề thi ra ngoài Internet.

---

### 3.2. Cơ chế cách ly và hoạt động của Docker Sandbox trong AITA

Docker Sandbox trong AITA sử dụng 4 cơ chế bảo mật cấp nhân Linux (Linux Kernel Isolation):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MÁY CHỦ THẬT (HOST SERVER)                      │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              DOCKER SANDBOX (CONTAINER CÔ LẬP)                 │   │
│   │                                                                │   │
│   │   [cgroups Memory]   ──► Giới hạn tối đa 256MB RAM             │   │
│   │   [Timeout Watchdog] ──► Giết tiến trình sau 2000ms (2s)       │   │
│   │   [Network Disabled] ──► --network none (Ngắt 100% mạng)       │   │
│   │   [Read-Only Mount]  ──► Chỉ ghi trong thư mục tạm staging     │   │
│   │   [Compiler Engine]  ──► gcc:alpine (C) / openjdk:17 (Java)     │   │
│   │                                                                │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Giới hạn bộ nhớ (`--memory=256m`):** Ngăn chặn tràn RAM. Nếu code sinh viên cấp phát mảng quá lớn $\to$ Linux kill container ngay lập tức và Sandbox báo lỗi `Memory Limit Exceeded (MLE)`.
2. **Bộ đếm thời gian Timeout (Watchdog 2000ms):** Ngăn chặn vòng lặp vô tận `while(1)`. Sau 2 giây nếu chương trình chưa thoát, Sandbox tự động bắn tín hiệu `SIGKILL` và báo lỗi `Time Limit Exceeded (TLE)`.
3. **Cách ly mạng hoàn toàn (`--network none`):** Container không có cổng mạng ra bên ngoài, chống rò rỉ mã nguồn hoặc kết nối độc hại.
4. **Hộp cát tự hủy (`--rm`):** Ngay sau khi chạy xong testcase, container tự động biến mất, xóa sạch toàn bộ rác bộ nhớ.

---

### 3.3. Cơ chế chạy thực tế theo 3 môn học PE đặc thù FPT

| Môn học | Công nghệ Sandbox | Phương thức nạp dữ liệu | Phương thức kiểm tra kết quả | Bẫy lỗi thường gặp |
| :--- | :--- | :--- | :--- | :--- |
| **PRF192 (C)** | Image `gcc:alpine` | **Stdio Redirection:** Bơm dữ liệu qua file input: `./main.out < input.txt > output.txt` | So khớp chuỗi `output.txt` với `expected_output` (đã chuẩn hóa trim khoảng trắng). | Lỗi compile (0 điểm ngay), vòng lặp vô tận `while(1)`, lỗi tràn số int. |
| **PRO192 (Java OOP)** | Image `openjdk:17-alpine` | **Console Menu Selection:** Bơm số lựa chọn vào `Main.java` (gửi `1\n` gọi `f1()`, `2\n` gọi `f2()`). | Bắt kết quả in ra màn hình console và so khớp. | Ngoại lệ `NullPointerException`, `ClassCastException`, quên `toString()`. |
| **CSD201 (Java DSA)** | Image `openjdk:17-alpine` | **File I/O đặc thù FPT:** Sandbox nạp file `data.txt` vào thư mục chạy. | **File-to-File Diff:** Sinh viên bắt buộc xuất file `f1.txt, f2.txt`. Sandbox so khớp trực tiếp file `f1.txt` với `f1_expected.txt`. | Báo lỗi `FILE_NOT_FOUND` nếu quên lệnh ghi file; lỗi `StackOverflowError` do đệ quy vô hạn trên cây BST/AVL. |

---

## 4. MỐI QUAN HỆ TỔNG THỂ GIỮA 3 THÀNH PHẦN TRONG AITA

Ba thành phần trên kết hợp chặt chẽ tạo nên hệ thống chấm thi PE tự động hoàn chỉnh:

```
                      [SINH VIÊN NỘP FILE ZIP BÀI THI PE]
                                       │
                                       ▼
                     [MÔ HÌNH TĨNH - CSDL PRISMA/MYSQL]
              Tạo bản ghi Submission & Đẩy Job vào Redis Queue
                                       │
                                       ▼
                     [MÔ HÌNH ĐỘNG - TIẾN TRÌNH SEQUENCE]
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        [1. DOCKER SANDBOX ENGINE]             [2. RAG AI KNOWLEDGE BASE]
     - Chạy thực tế trong container         - Kích hoạt khi có testcase hỏng
     - Bắt Timeout (2s) & File I/O          - Lấy Rationale & Code mẫu
     - Chấm tính đúng đắn kỹ thuật          - AI đối chiếu & tìm nguyên nhân
     ==> Điểm Sandbox: Tối đa 7.0 điểm      ==> Điểm AI Rubric: Tối đa 3.0 điểm
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                           [TỔNG HỢP KẾT QUẢ ĐIỂM]
               Final Score = Sandbox Score (7.0) + AI Score (3.0)
                     ==> Xuất báo cáo Score Report chi tiết
```

---

## 5. BỘ CÂU HỎI VÀ ĐÁP ÁN BẢO VỆ ĐỒ ÁN MÔN SWD392 (DEFENSE Q&A)

Khi giảng viên phản biện trong buổi đánh giá (Evaluation 2 / Final Review):

1. **Giảng viên hỏi:** *"Tại sao đồ án của em cần cả Mô hình tĩnh và Mô hình động? Có thể bỏ bớt một cái không?"*
   - **Trả lời:** Không thể bỏ được ạ. Vì Mô hình tĩnh cho thấy **kiến trúc khung xương (Skeleton)** của hệ thống gồm các bảng dữ liệu, khóa chính, khóa ngoại để lưu trữ bền vững. Còn Mô hình động cho thấy **dòng chảy sinh mệnh (Lifecycle & Behavior)** của một bài nộp thi chạy qua từng tầng kiến trúc theo thời gian như thế nào. Thiếu một trong hai thì hệ thống hoặc không biết lưu dữ liệu vào đâu, hoặc không biết xử lý quy trình ra sao.
2. **Giảng viên hỏi:** *"Tại sao không gửi toàn bộ code cho ChatGPT chấm luôn từ đầu cho tiện, cần gì phải chạy Docker Sandbox?"*
   - **Trả lời:** Có 3 lý do cốt lõi:
     - *Thứ nhất (Tính chính xác kỹ thuật):* LLM chỉ dự đoán xác suất chữ tiếp theo chứ không phải là trình biên dịch thực thụ; AI không thể đo chính xác thời gian thực thi (ví dụ: chạy quá 2000ms là TLE) hay bắt lỗi bộ nhớ `StackOverflowError`.
     - *Thứ hai (Bảo mật & Ảo giác):* Nếu chỉ dùng AI, sinh viên có thể dùng kỹ thuật *Prompt Injection* (ghi chú thích lừa AI cho điểm tối đa). Sandbox chạy thực tế trên testcase ẩn là thước đo khách quan không thể bị đánh lừa.
     - *Thứ ba (Chi phí & Tốc độ):* Sandbox chạy 10 testcase chỉ mất chưa tới 1 giây. Nếu bài sinh viên đã làm đúng 100%, hệ thống không cần gọi AI, tiết kiệm hàng triệu token mỗi kỳ thi.
3. **Giảng viên hỏi:** *"Cơ chế RAG trong AITA có làm lộ đáp án bài thi cho sinh viên không?"*
   - **Trả lời:** Tuyệt đối không ạ. Trong AITA, RAG đóng vai trò là "tri thức nền tảng của Giám khảo". AI sử dụng Rationale và code mẫu từ ChromaDB để hiểu sâu nguyên nhân sinh viên bị lỗi (ví dụ: $O(n^2)$ thay vì $O(n \log n)$), sau đó sinh phản hồi theo **phương pháp sư phạm Socratic**: gợi mở định hướng để sinh viên tự sửa code chứ Prompt Template đã bị khóa cứng quy tắc cấm trả về code giải.
