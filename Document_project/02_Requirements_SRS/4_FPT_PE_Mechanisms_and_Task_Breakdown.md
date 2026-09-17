# PHÂN TÍCH CHUYÊN SÂU CƠ CHẾ CHẤM THI THỰC HÀNH (PE) TẠI ĐẠI HỌC FPT
**Áp dụng cho hệ thống:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – AI-Assisted System Design  
**Tài liệu tham chiếu:** `flow_diagram_PRO_CSD.jpg` & `PRF_follow_diagram.jpg` (Folder: `Document_project/diagram/`)

---

## 1. TỔNG QUAN VỀ HAI LUỒNG HOẠT ĐỘNG (TWO OPERATIONAL FLOWS)

Hệ thống chấm thi PE thực tế tại Đại học FPT được phân hóa thành 2 luồng xử lý riêng biệt dựa trên đặc thù ngôn ngữ và cấu trúc bài thi:

```
                      HỆ THỐNG CHẤM BÀI AITA
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   LUỒNG 1: MÔN C (PRF192)              LUỒNG 2: MÔN JAVA (PRO192 & CSD201)
   - Bài nộp: Single File (.c)         - Bài nộp: Multi-file / Multi-question (.zip)
   - Cơ chế: Stdio Piping              - Cơ chế: Package Build + File I/O + OOP Check
   - Biên dịch: gcc                    - Biên dịch: javac đa file
   - Kiểm thử: Input -> Output text    - Kiểm thử: So khớp output / files (f1.txt, f2.txt)
```

---

## 2. CHI TIẾT LUỒNG 1: MÔN LẬP TRÌNH C (PRF192)
*(Dựa trên sơ đồ: `PRF_follow_diagram.jpg`)*

### 2.1. Bản chất & Đặc thù
- **Hình thức nộp:** Thường là 1 file mã nguồn C đơn lẻ (`.c`) cho từng bài tập hoặc câu hỏi.
- **Tiến trình chấm:**
  1. **Lưu trữ & Chuẩn bị:** Lưu file vào DB (`Status: Pending`), nạp danh sách `TestCases` và barem điểm.
  2. **Biên dịch (`gcc`):**
     - Nếu **Compilation Error (CE):** Gán ngay `0 điểm`, dừng toàn bộ quá trình, lưu log biên dịch và hiển thị nguyên văn lỗi `gcc` về Web App cho sinh viên.
  3. **Vòng lặp kiểm thử từng Test Case:**
     - Khởi tạo `Tổng điểm = 0`.
     - Lần lượt bơm dữ liệu `Input` qua Standard Input (stdin) vào chương trình đang chạy trong Docker Sandbox.
     - Bắt `Output` thực tế từ Standard Output (stdout).
     - So khớp chuỗi với `Expected Output` (sau khi chuẩn hóa dấu cách, ký tự xuống dòng `\r\n` $\to$ `\n`).
     - Nếu khớp: Ghi nhận **PASS** và cộng điểm của test case đó vào tổng điểm.
     - Nếu sai: Ghi nhận **FAIL / WRONG ANSWER**.
     - Tiếp tục cho đến khi hết test case.
  4. **Hoàn tất:** Cập nhật DB (`Status: Completed`), trả về bảng điểm chi tiết từng test cho sinh viên.

---

## 3. CHI TIẾT LUỒNG 2: MÔN JAVA HƯỚNG ĐỐI TƯỢNG & CẤU TRÚC DỮ LIỆU (PRO192 & CSD201)
*(Dựa trên sơ đồ: `flow_diagram_PRO_CSD.jpg`)*

### 3.1. Bản chất & Đặc thù
- **Hình thức nộp:** File nén `.zip` chứa toàn bộ Solution dự án (thường chia thành các câu `Q1`, `Q2`, `Q3`, `Q4`).
- **Cơ chế đề thi FPT:**
  - Sinh viên được cung cấp **Starter Code (Skeleton)** với các Interface/Abstract Class có sẵn (ví dụ: `ICar` chứa `f1()`, `f2()`, `f3()`).
  - Sinh viên hoàn thiện code vào các class được yêu cầu (ví dụ: `MyCar.java`, `BSTree.java`).
- **Tiến trình chấm:**
  1. **Trích xuất Artifact (Unzip & Inspect):**
     - Hệ thống giải nén, quét thư mục, lọc rác (`__MACOSX`, `.DS_Store`).
     - Tự động nhận diện cấu trúc các Question (Q1 đến Q4).
  2. **Biên dịch Solution (`javac`):**
     - Biên dịch toàn bộ gói mã nguồn (`javac -d bin src/*.java`).
     - Nếu **Lỗi biên dịch:** Ghi nhận `COMPILE_ERROR`, không chấm testcase, tính điểm dựa trên kết quả biên dịch.
  3. **Thực thi và Kiểm soát Môi trường chạy (Sandbox Execution):**
     - Chạy chương trình với từng Test Case.
     - Nếu tiến trình sập hoặc chạy quá lâu: Ghi nhận `RUNTIME ERROR` hoặc `TIMEOUT` (Time Limit Exceeded - TLE).
     - Nếu chạy thành công: Bắt kết quả đầu ra (stdout hoặc các file đầu ra như `f1.txt`, `f2.txt` đặc thù của môn CSD201).
  4. **So khớp kết quả & Áp dụng Barem (Scoring Rules):**
     - So sánh kết quả thực tế với đáp án mẫu.
     - Tính điểm theo từng Question, áp dụng quy tắc chấm tổng hợp (Scoring Rules) để ra điểm số cuối cùng (`Final Score`).
     - Lưu chi tiết `Grading Log`.

---

## 4. BẢNG SO SÁNH KỸ THUẬT GIỮA HAI LUỒNG

| Tiêu chí | Luồng C (PRF192) | Luồng Java (PRO192 & CSD201) |
| :--- | :--- | :--- |
| **Cấu trúc bài nộp** | Đơn giản: File đơn lẻ (`.c`) | Phức tạp: Multi-file, Package, chia nhiều Questions (Q1..Q4) |
| **Xử lý rác hệ thống** | Không đáng kể | Bắt buộc phải lọc `__MACOSX`, `.DS_Store`, thư mục build cũ |
| **Trình biên dịch** | `gcc -O2 main.c -o main` | `javac -encoding UTF-8 -d ./bin ...` |
| **Cơ chế Test Input/Output** | Standard I/O (stdin $\to$ stdout) | Standard I/O + File I/O (`data.txt` $\to$ `f1.txt`) + Test Harness |
| **Lỗi phổ biến của sinh viên** | Segmentation fault, Memory leak, Infinite Loop | NullPointerException, ClassNotFound, Recursion StackOverflow |
| **Đánh giá AI (Semantic)** | Đánh giá tư duy thuật toán cơ bản, Clean Code, giải phóng con trỏ | Đánh giá tính đóng gói (OOP), Kế thừa, Đa hình, độ phức tạp Big-O ($O(n \log n)$) |

---

## 5. TÁC ĐỘNG TỚI THIẾT KẾ PHẦN MỀM (ARCHITECTURAL IMPACT & DESIGN PATTERNS)

Để đáp ứng cả 2 luồng này mà không bị "hard-code", hệ thống Backend (Express.js) cần áp dụng 3 Design Patterns:

1. **Factory Method Pattern (`SandboxRunnerFactory`):**
   - Dựa vào mã môn học và ngôn ngữ:
     - Trả về `CSandboxRunner` (chạy container gcc, xử lý stdio).
     - Trả về `JavaProSandboxRunner` (chạy container JDK, chấm OOP).
     - Trả về `JavaCsdSandboxRunner` (chạy container JDK, kiểm tra File I/O và cấu trúc cây/đồ thị).
2. **Strategy Pattern (`ScoringStrategy`):**
   - `SingleFileLinearScoringStrategy`: Duyệt tuần tự qua các test cases và cộng dồn điểm (cho môn C).
   - `MultiQuestionCompositeScoringStrategy`: Tổng hợp điểm từ từng folder Q1..Q4, tính điểm phạt nếu có (cho môn Java).
3. **Template Method Pattern (`BaseSandboxRunner`):**
   - Định nghĩa bộ khung chuẩn: `Unpack() -> ValidateStructure() -> Compile() -> RunTestcases() -> Cleanup()`.
   - Các ngôn ngữ chỉ cần override phương thức biên dịch và phương thức nạp test case.

---

## 6. PHÂN CHIA NHIỆM VỤ THỰC HIỆN CODE (TASK BREAKDOWN CHO NHÓM)

Dựa trên 2 luồng hoạt động trên, các thành viên trong nhóm sẽ phụ trách các mảng công việc cụ thể như sau:

- **Task 1: Pre-processing & Artifact Extractor (Thành viên 1)**
  - Viết module giải nén file `.zip`, khử các file rác (`__MACOSX`, `.DS_Store`).
  - Phân tích cấu trúc: Nhận diện tự động xem bài nộp là mã nguồn C hay bài tập Java chia theo Question (Q1..Q4).
  - Chuẩn bị workspace sạch trên ổ cứng trước khi mount vào Docker.
- **Task 2: C Sandbox Runner - Luồng PRF192 (Thành viên 2)**
  - Xây dựng Docker Image nhẹ (`gcc:alpine`).
  - Viết module thực thi lệnh `gcc`, bắt mã lỗi Compile Error (CE).
  - Cơ chế piping stdin $\to$ stdout và so sánh output chuỗi chuẩn hóa (trimming whitespace, line-endings).
  - Bắt timeout khi gặp vòng lặp vô tận.
- **Task 3: Java Sandbox Runner - Luồng PRO192 & CSD201 (Thành viên 3)**
  - Xây dựng Docker Image Java (`openjdk:17-alpine`).
  - Biên dịch toàn bộ package mã nguồn bằng `javac`.
  - Hỗ trợ cơ chế đọc file input (`data.txt`) và so khớp file output (`f1.txt`, `f2.txt`).
  - Bắt các lỗi runtime Java điển hình (`NullPointerException`, `IndexOutOfBounds`).
- **Task 4: PromptTemplate Engine & AI Semantic Assessment theo môn (Thành viên 4)**
  - Xây dựng các mẫu prompt chuyên biệt:
    - *Prompt cho PRF192:* Tập trung vào tối ưu cú pháp C, giải phóng bộ nhớ con trỏ, quy tắc đặt tên.
    - *Prompt cho PRO192:* Đánh giá 4 tính chất OOP, tính đúng đắn của Interface implementation.
    - *Prompt cho CSD201:* Đánh giá cấu trúc dữ liệu tự cài đặt, phát hiện bottleneck làm tăng độ phức tạp Big-O.
  - Tích hợp xoay vòng `AiApiKey` và kết hợp điểm Sandbox + Điểm AI.
- **Task 5: Frontend Dashboard & Giao diện xem kết quả đa luồng (Thành viên 5)**
  - Giao diện nộp bài cho phép chọn môn học (PRF192, PRO192, CSD201).
  - Màn hình kết quả linh hoạt:
    - Nếu là bài C: Hiển thị danh sách test case dạng bảng tuyến tính.
    - Nếu là bài PRO/CSD: Hiển thị tab chia theo từng câu (Q1, Q2, Q3, Q4) kèm diff trực quan giữa Expected và Actual output.
  - Tích hợp widget hỏi đáp với **AI Tutor** để giải thích lỗi chi tiết cho từng câu.
