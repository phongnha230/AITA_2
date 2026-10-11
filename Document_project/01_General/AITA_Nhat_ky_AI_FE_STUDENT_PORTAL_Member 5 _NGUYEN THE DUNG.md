# NHẬT KÝ SỬ DỤNG AI CÁ NHÂN – THÀNH VIÊN 5 (FRONTEND)

**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – Software Architecture and Design (Lớp SE19C – Fall 2026)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Vinh  
**Nhóm:** GROUP 2  
**Thành viên:** Nguyễn Thế Dũng (QE190275) – Member 5  
**Phân hệ thực hiện trong nhật ký này:** Frontend Student Portal – Dashboard, Exams, Results, Profile và tích hợp API  
**Branch làm việc:** `DungNT463`  
**Giai đoạn ghi nhận:** Đầu tháng 10/2026 – 09/10/2026 (ngày từng prompt cần đối chiếu lịch sử gốc)

> **Phạm vi và độ tin cậy:** Báo cáo được tổng hợp từ lịch sử trao đổi, prompt hướng dẫn Antigravity, báo cáo công việc và các đoạn mã/merge conflict đã chia sẻ. Các câu prompt trong bảng là **bản diễn đạt lại nội dung yêu cầu đã thực hiện**, không khẳng định là bản sao nguyên văn của toàn bộ prompt đã gửi. Mốc ngày theo giai đoạn, không gán ngày chính xác khi thiếu log gốc. Kết quả kiểm thử được ghi theo báo cáo đã cung cấp; cần lưu terminal output/screenshot nếu giảng viên yêu cầu bằng chứng trực tiếp. AI hỗ trợ đề xuất và sinh mã; sinh viên chịu trách nhiệm kiểm tra và quyết định thay đổi.

---

## 1. BẢNG THEO DÕI PROMPT CÁ NHÂN (PROMPT & CONTEXT LOG)

| STT | Ngày | Thành viên | Công cụ AI | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Tinh chỉnh của sinh viên |
|:---:|:---:|:---|:---|:---|:---|:---|
| **1** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Phân tích phạm vi Student Portal | *"Phân tích cấu trúc AITA hiện có và lập kế hoạch xây dựng giao diện dành cho STUDENT bằng Next.js, TypeScript, Tailwind. Tách Dashboard, Exams, Results, Profile; tận dụng API hiện có, không sửa module RAG/LLM của thành viên khác."* | Xác định 4 route `/student/dashboard`, `/student/exams`, `/student/results`, `/student/profile`; thống nhất frontend tập trung vào dữ liệu thực, không can thiệp module AI/RAG của nhóm. |
| **2** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Thiết kế layout theo ảnh tham chiếu | *"Thiết kế Student Portal theo giao diện học vụ chuyên nghiệp: sidebar trắng cố định, header gọn, nền slate sáng, thẻ bo góc và màu cobalt; giữ trải nghiệm responsive. Ảnh tham chiếu chỉ dùng cho layout, không lấy dữ liệu mẫu làm dữ liệu thật."* | Xây dựng shell/sidebar và phong cách thống nhất giữa 4 trang; sinh viên xem ảnh giao diện thực tế và yêu cầu chỉnh sửa có chọn lọc. |
| **3** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Tích hợp xác thực và hồ sơ sinh viên | *"Kết nối thông tin sinh viên đang đăng nhập với endpoint profile hiện có; hiển thị tên, email, vai trò từ API thay vì hardcode. Bảo đảm trang Profile và header dùng dữ liệu nhất quán."* | Kiểm tra luồng `GET /api/v1/users/profile` và `PATCH /api/v1/users/profile`; thông tin tài khoản thử nghiệm hiển thị theo API, không nhúng tên cố định trong UI. |
| **4** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Dashboard và tham gia lớp học | *"Tạo Dashboard có lời chào, form nhập mã tham gia lớp, KPI, danh sách khóa học và ca thi; kết nối `POST /api/v1/courses/join`, `GET /api/v1/courses?studentId=...`; xử lý loading, empty và error."* | Dashboard hiển thị khóa học đã tham gia và thao tác Join Course qua backend; dùng khóa học CSD201 được seed để kiểm tra dữ liệu thực. |
| **5** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Trang danh sách bài thi PE | *"Xây dựng trang Exams lấy assignment từ API theo từng course, phân loại OPEN/UPCOMING/ENDED theo thời gian, có lọc, tìm kiếm và thẻ featured; không tạo kỳ thi giả."* | Trang `/student/exams` sử dụng `GET /api/v1/assignments/course/:courseId`; thẻ kỳ thi CSD201 PE – Binary Search Tree & AVL xuất hiện theo dữ liệu seed. |
| **6** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Trang kết quả chấm bài | *"Tạo trang Results tra cứu bằng submissionId thật; trình bày lifecycle chấm bài, điểm Sandbox/AI/tổng, testcase PASS/FAIL và phản hồi rubric. Không tự tạo điểm, thứ hạng hoặc kết quả mẫu."* | Xây dựng các thành phần `StudentResults`, `GradingLifecycleProgress`, `SubmissionScoreOverview`, `TestCaseResultsList`, `AiRubricFeedbackCard`; dữ liệu lấy theo submission/job API. |
| **7** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Profile và radar năng lực | *"Tạo Profile gồm thông tin cá nhân, thống kê, lịch sử và radar năng lực. Nếu backend chưa có API lịch sử/competency, phải hiển thị trạng thái chưa có dữ liệu, không vẽ đa giác hay điểm số giả."* | Profile hiển thị dữ liệu tài khoản có thật; radar giữ khung lưới và `--` khi thiếu dữ liệu; không tự suy diễn năng lực từ rubric. |
| **8** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Kiểm tra tích hợp API và dữ liệu mẫu phục vụ thử nghiệm | *"Rà soát endpoint frontend đang dùng; kiểm tra course, assignment, profile, submission, progress. Nếu cần seed dữ liệu để thử UI, phải phân biệt fixture development với dữ liệu sản phẩm."* | Dùng dữ liệu CSD201, mã tham gia lớp và assignment PE trong môi trường thử nghiệm; nhận diện thay đổi `prisma/seed.ts` là phần backend cần review riêng trước commit. |
| **9** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | E2E từ nộp bài đến hiển thị kết quả | *"Kiểm tra luồng nộp ZIP → staging → BullMQ → Docker Sandbox → AI adapter → database → Results; thử một bài đúng và một bài sai, đối chiếu lifecycle, điểm và testcase với API."* | Báo cáo E2E ghi nhận bài đúng 2/2 testcase, Sandbox 7/7, AI mock 2.5/3, tổng 9.5/10; bài sai 0/2, Sandbox 0/7, AI mock 2.5/3, tổng 2.5/10. **AI là MockLlmAdapter, chưa chứng minh Gemini/RAG thật.** |
| **10** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Khắc phục lỗi dữ liệu API | *"Điều tra lỗi serialization khi backend trả Prisma BigInt; xác định thay đổi tối thiểu giúp frontend đọc JSON và đánh giá rủi ro độ chính xác."* | Báo cáo ghi nhận sửa serializer BigInt trong `Code/backend/src/app.ts`; cần review nguy cơ mất chính xác nếu chuyển BigInt lớn sang Number, không gộp vô điều kiện với commit UI. |
| **11** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Polish giao diện Results | *"Tinh chỉnh phân cấp thông tin lifecycle, score, testcase, rubric; sửa metric bộ nhớ không được đo và bỏ badge xếp loại không có quy tắc nghiệp vụ từ backend."* | Bỏ nhãn xếp loại tự suy đoán; khi `memoryUsedKb` bằng 0/không đo, hiển thị `--` thay vì `0.0 MB`; cải thiện hiển thị diff log và tiêu chí rubric. |
| **12** | Đầu 10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Sửa danh sách OPEN exam | *"Rà soát hook Dashboard vì assignment OPEN không nằm trong Upcoming hoặc Ended; tách đúng danh sách ca thi đang diễn ra, không làm mất dữ liệu API."* | Báo cáo ghi nhận thêm `openAssignments` trong `useStudentDashboard.ts` và cập nhật `StudentDashboard.tsx`, `UpcomingExams.tsx`. |
| **13** | Trước 09/10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Final UI cleanup | *"Không redesign. Sửa sidebar bị truncate; kiểm tra trạng thái Online/Docker có API thật hay không; sửa nút kết quả khi thiếu submissionId; giữ radar empty state; kiểm tra 1440/1280/1024 và mobile."* | Sidebar tăng lên 280px, shell đồng bộ padding; trạng thái tĩnh ở sidebar được thay bằng mô tả trung lập; trạng thái Docker chỉ xanh khi API xác nhận; Exam CTA đổi thành tra cứu qua mã bài nộp. |
| **14** | Trước 09/10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT → Antigravity | Kiểm tra build và routes | *"Chạy TypeScript và production build, kiểm tra 4 route student, báo cáo file thay đổi và git status; không commit/push khi chưa review."* | Báo cáo Antigravity: `npx tsc --noEmit` thành công, `npm run build` thành công, 4 route trả HTTP 200. HTTP 200 không thay thế kiểm tra chức năng trên trình duyệt. |
| **15** | 09/10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Rà soát Git trước merge/commit | *"Phân loại file frontend, backend seed, BigInt serializer và script worker theo phạm vi; tránh `git add .`, không commit/push trước khi kiểm tra."* | Lập checklist review-only để phân biệt thay đổi Student Portal với fixture E2E/backend. Chưa có bằng chứng trong lịch sử rằng checklist này đã được chạy hoàn chỉnh. |
| **16** | 09/10/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Giải quyết merge conflict khi tích hợp `main` | *"Các file `seed.ts`, `ExamCard.tsx`, `AiRubricFeedbackCard.tsx`, `TestCaseResultsList.tsx` đang conflict giữa `DungNT463` và `main`; nên Accept Current, Incoming hay Both để không mất chức năng?"* | Đối chiếu từng conflict: `seed.ts` cần giữ cả enrollment và PE fixture; `ExamCard.tsx` phải giữ modal xem đề/nộp bài mới từ `main` nhưng tránh CTA kết quả gây hiểu nhầm; hai card Results ưu tiên UI đã polish. Các lựa chọn là hướng dẫn, chưa có bằng chứng build sau merge. |

---

## 2. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG SWD392 (EXCEL COMPLIANT)

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | UI Architecture | Thiết kế cấu trúc Student Portal và 4 trang | ChatGPT / Antigravity | Đề xuất shell, sidebar, routing, chia component | Đối chiếu ảnh tham chiếu và các route thực tế; không sao chép dữ liệu giả | `Code/frontend/src/features/student/components/StudentShell.tsx`; `StudentSidebar.tsx` | 4 route student | 5 | UI screenshot không chứng minh chức năng API |
| 2 | Dashboard & Courses | Profile, Join Course, KPI, danh sách khóa học | ChatGPT / Antigravity | Hook và component tích hợp dữ liệu backend | Thử tài khoản student và course CSD201; kiểm tra empty/loading/error | `Code/frontend/src/features/student/components/dashboard/StudentDashboard.tsx`; `Code/frontend/src/features/student/hooks/useStudentDashboard.ts` | `GET /users/profile`, `POST /courses/join`, `GET /courses` | 5 | Seed test có thể ảnh hưởng kiểm thử Join Course nếu sinh viên đã được enroll |
| 3 | Exams | OPEN/UPCOMING/ENDED, lọc và thẻ bài thi | ChatGPT / Antigravity | Trang Exams và ExamCard | Kiểm tra assignment PE thực, sửa logic `openAssignments`; xử lý CTA thiếu ID | `Code/frontend/src/features/student/components/exams/ExamCard.tsx`; `Code/frontend/src/features/student/components/dashboard/UpcomingExams.tsx` | 3 nhóm trạng thái thời gian | 5 | API chưa trả `my-submission`; không được tự suy ra submissionId |
| 4 | Results & Monitoring | Lifecycle, score, testcase, rubric | ChatGPT / Antigravity | Bộ component hiển thị grading result | Đối chiếu submission thật và job progress; bỏ rank tự tạo, memory không đo → `--` | `Code/frontend/src/features/student/components/results/StudentResults.tsx`; `GradingLifecycleProgress.tsx`; `SubmissionScoreOverview.tsx`; `TestCaseResultsList.tsx`; `AiRubricFeedbackCard.tsx` | 5 stage lifecycle được hiển thị trong báo cáo UI; testcase 2/2 và 0/2 ở E2E | 5 | Điểm AI ở bài test từ mock adapter, không phải đánh giá LLM thật |
| 5 | Profile & Visualization | Hồ sơ và radar năng lực | ChatGPT / Antigravity | Layout Profile và radar SVG | Giữ trạng thái không có dữ liệu; không dựng polygon giả | `Code/frontend/src/features/student/components/profile/ProgrammingCompetencyRadar.tsx` | SVG radar radius 125 theo báo cáo polish | 4 | Chưa có API tổng hợp competency và danh sách submission của sinh viên |
| 6 | E2E Integration | Luồng ZIP → Sandbox → Queue → AI mock → Results | ChatGPT / Antigravity | Kịch bản kiểm thử thành công/thất bại | Đối chiếu trạng thái và kết quả chấm hiển thị qua API | `GET /api/v1/submissions/:id`; `GET /api/v1/jobs/:submissionId`; báo cáo E2E | Bài đúng 9.5/10; bài sai 2.5/10 | 5 | Mock AI không xác nhận Gemini/RAG; cần tách bằng chứng terminal khỏi lời tóm tắt |
| 7 | UX & Truthfulness | Sidebar, online status, CTA, empty states | ChatGPT / Antigravity | Đề xuất chỉnh CSS và điều kiện dữ liệu | Kiểm tra các claim Online; chỉ xanh khi API trả trạng thái thực; sửa sidebar 280px | `StudentSidebar.tsx`; `StudentShell.tsx`; `dashboard/PracticeSandbox.tsx`; `exams/ExamCard.tsx` | 1440/1280/1024px và mobile theo báo cáo | 5 | Cần kiểm tra lại thực tế sau merge vì `main` thêm chức năng nộp bài |
| 8 | Validation & Git | TypeScript/build, review diff, giải quyết conflict | ChatGPT / Antigravity | Checklist build, Git và hướng dẫn resolve | Báo cáo build PASS trước merge; hướng dẫn chọn conflict theo ngữ nghĩa, không gộp máy móc | `npx tsc --noEmit`; `npm run build`; `git status --short` | 4 route HTTP 200; TS 0 lỗi trước merge | 4 | Chưa có kết quả build sau khi xử lý toàn bộ conflict; cần xác minh lại |

> **Chú thích cột Value Added:** Mức 1–5 là **đánh giá chủ quan để hoàn thiện form**, không phải điểm đo độc lập. Có thể điều chỉnh theo rubric chính thức của giảng viên.

---

## 3. TỔNG KẾT CÔNG VIỆC FRONTEND – THÀNH VIÊN 5

- **Phạm vi:** Student Portal của AITA, triển khai với Next.js 14, React, TypeScript và Tailwind CSS. Đây là phần việc frontend, **không phải triển khai module RAG/Gemini/LLM** của các thành viên khác.
- **Các trang chính:** `/student/dashboard`, `/student/exams`, `/student/results`, `/student/profile`.
- **Thành phần giao diện:** `StudentShell`, `StudentSidebar`, `StudentDashboard`, `UpcomingExams`, `ExamCard`, `StudentResults`, `GradingLifecycleProgress`, `SubmissionScoreOverview`, `TestCaseResultsList`, `AiRubricFeedbackCard`, `ProgrammingCompetencyRadar`.
- **API tích hợp/đối chiếu:** `GET/PATCH /api/v1/users/profile`; `POST /api/v1/courses/join`; `GET /api/v1/courses?studentId=...`; `GET /api/v1/assignments/course/:courseId`; `POST /api/v1/submissions`; `GET /api/v1/submissions/:id`; `GET /api/v1/jobs/:submissionId`; `GET /api/v1/sandbox/status`.
- **Quy tắc dữ liệu:** Thông tin sinh viên, lớp học, đề thi, điểm, testcase và rubric phải lấy từ backend; không hardcode dữ liệu từ screenshot tham chiếu. Không có API competency/history thì dùng trạng thái rỗng và `--`.
- **Kết quả E2E được báo cáo:** Bài Java đúng đạt 2/2 testcase, 9.5/10; bài sai đạt 0/2, 2.5/10. Điểm AI 2.5/3 do **MockLlmAdapter** trả về, không đại diện cho LLM thực tế.
- **UI polish:** Khắc phục nhãn sidebar bị cắt; phân biệt trạng thái Docker thật và text mô tả; bỏ rank tự tạo; không hiển thị `0.0 MB` khi bộ nhớ chưa được đo; CTA Results cần mã bài nộp thực.
- **Validation được báo cáo trước merge:** TypeScript `npx tsc --noEmit` không lỗi; `npm run build` thành công; bốn route trả HTTP 200. Chưa có kết quả kiểm thử lại sau khi xử lý toàn bộ merge conflict ngày 09/10.
- **Git và phối hợp nhóm:** Nhánh `DungNT463` có thay đổi frontend, đồng thời working tree từng chứa `prisma/seed.ts`, `src/app.ts` và script worker phục vụ kiểm thử. Cần review/tách phạm vi trước commit. Nhánh `main` bổ sung modal xem đề và nộp bài PE; việc resolve conflict cần bảo toàn tính năng này và kiểm tra điều kiện chỉ nộp khi ca thi hợp lệ.

### Luồng nghiệp vụ frontend đã kiểm tra

```text
Student đăng nhập
       |
       v
GET /users/profile  ---> Dashboard / Profile
       |
       v
GET /courses  ---> Join Course (nếu cần)
       |
       v
GET /assignments/course/:courseId
       |
       v
Exams: OPEN / UPCOMING / ENDED
       |
       v
Nộp ZIP qua luồng submission (nếu UI và API đã tích hợp)
       |
       v
Submission ID thật
       |
       v
GET /submissions/:id + GET /jobs/:submissionId
       |
       v
Results: Lifecycle + Scores + Testcases + AI Rubric
```

**Giới hạn cần công bố:** Tại thời điểm ghi nhận, chưa có endpoint liệt kê đầy đủ lịch sử bài nộp theo sinh viên/bài thi và API competency tổng hợp; frontend không được tự tạo các dữ liệu này. Chức năng modal nộp ZIP mới xuất hiện trong nhánh `main` lúc merge, cần kiểm tra lại sau resolve.

---

## 4. EXPLAINABILITY CHECKLIST

1. **Vì sao chọn Next.js + TypeScript?**  
   Frontend đã sử dụng Next.js và TypeScript trong monorepo AITA; việc mở rộng Student Portal theo cấu trúc có sẵn giúp tái sử dụng routing, component và kiểm tra kiểu dữ liệu.

2. **Vì sao cần `StudentShell` và `StudentSidebar`?**  
   Hai thành phần cung cấp layout và điều hướng dùng chung giữa bốn trang; chỉnh một chỗ có thể đồng bộ toàn bộ Student Portal.

3. **Dashboard lấy dữ liệu từ đâu?**  
   Từ API profile, courses và assignments; form Join Course gọi endpoint tham gia lớp. Các KPI chỉ nên tính từ tập dữ liệu backend thực sự trả về.

4. **Phân biệt OPEN, UPCOMING và ENDED như thế nào?**  
   Dựa trên thời gian bắt đầu/hạn nộp và trạng thái assignment. Phải kiểm tra điều kiện thời gian và không để bài OPEN bị loại khỏi mọi danh sách.

5. **Vì sao không tự hiển thị nút “Xem kết quả” như thể đã có bài nộp?**  
   Trang Results cần `submissionId`; khi danh sách assignment không chứa submission của sinh viên, không thể tạo link kết quả cụ thể một cách trung thực.

6. **Trang Results nhận dữ liệu từ đâu?**  
   `GET /api/v1/submissions/:id` và `GET /api/v1/jobs/:submissionId` cung cấp dữ liệu submission và tiến độ xử lý để render các thẻ lifecycle, score, testcase, rubric.

7. **Vì sao hiển thị `--` thay vì `0.0 MB`?**  
   Giá trị bộ nhớ bằng 0 có thể biểu thị chưa đo, không nhất thiết là chương trình dùng đúng 0 MB; `--` tránh diễn giải sai.

8. **Vì sao bỏ badge xếp loại “Xuất sắc”?**  
   Backend chưa cung cấp quy tắc xếp loại tương ứng; frontend không nên tự gán danh hiệu dựa trên điểm.

9. **Radar năng lực xử lý thế nào khi không có API?**  
   Chỉ render khung/nhãn mô tả và giá trị rỗng; không vẽ polygon hoặc dựng số liệu giả.

10. **Làm sao biết Docker thật sự đang chạy?**  
    Dùng dữ liệu từ endpoint sandbox status và trường `dockerDaemonRunning`; text ở sidebar không có API thì chỉ nên là mô tả hệ thống, không phải đèn trạng thái trực tuyến.

11. **Kết quả AI trong E2E có phải Gemini thật không?**  
    Không. Kịch bản đã báo cáo dùng `MockLlmAdapter`, phù hợp kiểm thử luồng tích hợp nhưng chưa chứng minh chất lượng đánh giá của LLM/RAG thật.

12. **Vì sao cần test bài đúng và bài sai?**  
    Hai trường hợp kiểm tra được việc điểm testcase và điểm tổng phản ánh kết quả sandbox, đồng thời giúp phát hiện UI chỉ hoạt động với dữ liệu thành công.

13. **TypeScript/build PASS có nghĩa mọi tính năng đã đúng chưa?**  
    Chưa. Nó chứng minh code biên dịch/kiểm tra kiểu thành công tại thời điểm chạy; cần thêm thao tác thực tế, kiểm tra API, modal, điều hướng và trạng thái lỗi.

14. **Vì sao không dùng `Accept Both Changes` cho mọi Git conflict?**  
    Với JSX, hai nhánh có thể cùng mở wrapper hoặc cùng dựng nhóm nút, ghép nguyên xi sẽ làm hỏng cú pháp/bố cục. Cần giữ chức năng của cả nhóm nhưng kết hợp code theo cấu trúc hợp lệ.

15. **Sinh viên kiểm soát mã AI sinh ra như thế nào?**  
    Đọc và so sánh source, xem UI tại độ zoom thực, đối chiếu API/response, yêu cầu sửa các trạng thái gây hiểu nhầm, kiểm tra TypeScript/build và review Git diff trước khi commit.

16. **Những gì cần xác minh trước khi nộp báo cáo?**  
    Đối chiếu ngày và prompt nguyên văn từ lịch sử ChatGPT/Antigravity nếu có; bổ sung screenshot hoặc terminal log; chạy lại frontend build sau merge; kiểm tra `SubmitExamModal` thực sự gửi API và không cho nộp khi kỳ thi chưa mở/đã đóng; xác nhận commit/PR thực tế.

---

**Ghi chú cuối:** Tài liệu này mô tả **nhật ký sử dụng AI hỗ trợ phát triển Frontend**, không phải báo cáo rằng AI tự hoàn thành hoặc tự xác nhận mọi tính năng. Các mục chưa có bằng chứng trực tiếp được ghi rõ là cần xác minh.
