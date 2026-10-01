# NHẬT KÝ SỬ DỤNG AI CÁ NHÂN - THÀNH VIÊN 5
**Dự án:** AITA (AI-powered Teaching Assistant System)  
**Môn học:** SWD392 – Software Architecture and Design (Lớp SE19C - Fall 2026)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Vinh  
**Nhóm:** GROUP 2  
**Thành viên:** Nguyễn Thế Dũng (QE190275) - Member 5  
**Phân hệ phụ trách:** TV4 – Redis Queue & Job Lifecycle Coordinator (BullMQ)  
**Branch:** `feat/backend-queue`  
**Thời gian thực hiện:** 28/09/2026 – 30/09/2026

---

## 1. BẢNG THEO DÕI PROMPT CÁ NHÂN (PROMPT & CONTEXT LOG)

Các prompt dưới đây được gom theo nhóm công việc. AI hỗ trợ phân tích, đề xuất triển khai và gỡ lỗi; sinh viên chịu trách nhiệm kiểm tra, điều chỉnh mã nguồn và xác minh kết quả trong môi trường dự án.

| STT | Ngày | Thành viên | Công cụ AI | Mục đích / Bài toán | Câu Prompt chi tiết (Context & Prompt) | Kết quả sinh ra & Tinh chỉnh của sinh viên |
|:---:|:---:|:---:|:---|:---|:---|:---|
| **1** | 28/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Phân tích nhiệm vụ TV4 và hợp đồng với các phân hệ | *"Phân tích nhiệm vụ điều phối grading job bằng BullMQ. Xác định input `submissionId`, `stagedFolderPath`, trạng thái lifecycle và điểm tích hợp TV3, TV5, TV6; đề xuất cách mock dependency để phát triển độc lập."* | Dùng đề xuất để rà soát ranh giới module và input. Sinh viên đối chiếu với cấu trúc backend, chốt kiểu dữ liệu job và cách inject Sandbox/AI; kiểm tra lại dữ liệu staging do TV3 cung cấp. |
| **2** | 28/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Thiết kế BullMQ Queue và enqueue | *"Hỗ trợ triển khai grading queue với Redis/BullMQ, priority, tối đa 3 attempts và exponential backoff; khi enqueue hãy đồng bộ `GradingJob`, `Submission` và `bullmqJobId` trong MySQL."* | Sinh viên triển khai và kiểm tra logic trong [`bullmq.queue.ts`](../../Code/backend/src/infrastructure/queue/bullmq.queue.ts). Chạy kiểm tra queue với Redis, đối chiếu payload, priority, attempts và backoff; điều chỉnh xử lý enqueue lỗi để cập nhật trạng thái thất bại trong DB. |
| **3** | 28–29/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Thiết kế Worker và lifecycle chấm bài | *"Hỗ trợ xây dựng Worker tuần tự điều phối Sandbox rồi AI, cập nhật lifecycle, điểm và lỗi vào MySQL; giữ TV5/TV6 dưới dạng dependency có thể mock, có timeout và retry."* | Sinh viên rà soát và hoàn thiện [`bullmq.worker.ts`](../../Code/backend/src/infrastructure/queue/bullmq.worker.ts): các trạng thái chạy, kết quả điểm và cập nhật submission. Kiểm tra giới hạn timeout 30 giây, thử dependency mock và sửa lỗi lifecycle phát hiện khi chạy test. |
| **4** | 29/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Kiểm thử Queue, Worker, priority và retry | *"Đề xuất kịch bản kiểm thử BullMQ cho enqueue, Worker thành công, priority và lỗi Sandbox; xác minh tối đa 3 lần thử, exponential backoff và trạng thái cuối."* | Sinh viên chạy/đối chiếu các script [`test-bullmq-queue.ts`](../../Code/backend/scripts/test-bullmq-queue.ts), [`test-bullmq-worker.ts`](../../Code/backend/scripts/test-bullmq-worker.ts), và [`test-bullmq-retry.ts`](../../Code/backend/scripts/test-bullmq-retry.ts). Kết quả được ghi nhận: Queue, Worker và retry 3 lần đạt; kiểm tra Redis lưu job và cấu hình retry thực tế. |
| **5** | 29/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Tích hợp lifecycle Redis + MySQL | *"Thiết kế kịch bản tích hợp queue với MySQL để xác minh enqueue, lưu `bullmqJobId`, trạng thái grading/submission, điểm và failure lifecycle; chỉ ra các assertion cần có."* | Sinh viên chạy/đối chiếu [`test-bullmq-db-integration.ts`](../../Code/backend/scripts/test-bullmq-db-integration.ts), [`test-bullmq-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-lifecycle.ts), và [`test-bullmq-failure-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-failure-lifecycle.ts). Kiểm tra Redis và MySQL riêng, xác minh trạng thái cùng dữ liệu kết quả; kết quả tích hợp và success/failure lifecycle được ghi nhận PASS. |
| **6** | 29/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Xây dựng Progress API | *"Hỗ trợ tạo endpoint đọc trạng thái grading job theo `submissionId`, trả metadata từ MySQL cùng BullMQ queue state/progress; xử lý job không tồn tại và lỗi HTTP."* | Sinh viên kiểm tra [`job.controller.ts`](../../Code/backend/src/presentation/controllers/job.controller.ts), [`job.route.ts`](../../Code/backend/src/presentation/routes/job.route.ts) và điểm mount route trong [`index.ts`](../../Code/backend/src/presentation/routes/index.ts). Đối chiếu endpoint `GET /api/v1/jobs/:submissionId` qua HTTP, kiểm tra phản hồi 404 và các trạng thái/progress được cung cấp. |
| **7** | 29–30/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Xác minh end-to-end success/failure lifecycle | *"Rà soát kịch bản end-to-end từ submission đã staging đến BullMQ, Sandbox mock, AI mock và trạng thái/điểm cuối trong MySQL; đề xuất assertion cho thành công và thất bại."* | Sinh viên kiểm tra luồng queue đến worker, đối chiếu Redis job state với `GradingJob` và `Submission` trong MySQL, đồng thời xác minh HTTP progress. Mẫu mock được ghi nhận: Sandbox 5.6/7, AI 2.5/3, tổng 8.1/10; trạng thái cuối `COMPLETED` / `GRADED`, progress 100%. |
| **8** | 30/09/2026 | Nguyễn Thế Dũng (Member 5) | ChatGPT | Rà soát code và Git trước commit | *"Rà soát thay đổi TV4 trước commit: kiểm tra xử lý lỗi, retry, trạng thái DB, API, kiểu TypeScript và danh sách file thuộc phạm vi; nêu điểm cần xác minh, không tự giả định kết quả."* | Sinh viên tự kiểm tra diff và phạm vi branch `feat/backend-queue`, sửa các lỗi tìm thấy, chạy lại test liên quan và xác minh Redis, MySQL, HTTP API. Kiểm tra TypeScript được ghi nhận 0 lỗi; việc commit không được xem là kết quả của AI. |

---

## 2. BẢNG BÁO CÁO SỬ DỤNG AI ĐỒNG BỘ ĐỊNH DẠNG SWD392 (EXCEL COMPLIANT)

| No. | Design Phase | Task / Activity | AI Tool Used | AI Output | Student's Validation / Modification | Evidence / Link | Quantitative Measure | Value Added (1-5) | Risks / Limitations Observed |
|:---:|:---|:---|:---|:---|:---|:---|:---|:---:|:---|
| 1 | Backend Architecture | Xác định ranh giới TV4, input job và tích hợp với các module phụ thuộc | ChatGPT | Gợi ý hợp đồng job và thiết kế dependency có thể mock | Đối chiếu source hiện có, chốt `submissionId`, `stagedFolderPath` và input tùy chọn; kiểm tra luồng staging từ TV3 | [`bullmq.queue.ts`](../../Code/backend/src/infrastructure/queue/bullmq.queue.ts); [`bullmq.worker.ts`](../../Code/backend/src/infrastructure/queue/bullmq.worker.ts) | 3 module tích hợp: TV3, TV5, TV6 | 4 | TV5/TV6 phải tuân thủ hợp đồng input/output để tích hợp; mock không thay thế kiểm thử Sandbox/AI thật |
| 2 | Queue Implementation | Cấu hình BullMQ, priority, enqueue và đồng bộ bản ghi MySQL | ChatGPT | Gợi ý queue options và luồng enqueue/cập nhật trạng thái | Kiểm tra job được ghi lên Redis; đối chiếu `GradingJob`, `Submission`, `bullmqJobId`; sửa xử lý enqueue failure | [`bullmq.queue.ts`](../../Code/backend/src/infrastructure/queue/bullmq.queue.ts); [`test-bullmq-queue.ts`](../../Code/backend/scripts/test-bullmq-queue.ts) | 3 attempts; backoff exponential khởi đầu 1.000 ms; mặc định priority 5 | 5 | Giá trị priority nhỏ hơn có mức ưu tiên cao hơn; queue state có vòng đời riêng với dữ liệu nghiệp vụ MySQL |
| 3 | Worker & Lifecycle | Điều phối Sandbox → AI; lưu progress, điểm và failure lifecycle | ChatGPT | Gợi ý cấu trúc Worker, các stage, timeout và cơ chế cập nhật DB | Dùng DI để mock TV5/TV6; kiểm tra thứ tự stage, retry count, error stage, logs và trạng thái Submission | [`bullmq.worker.ts`](../../Code/backend/src/infrastructure/queue/bullmq.worker.ts); [`test-bullmq-worker.ts`](../../Code/backend/scripts/test-bullmq-worker.ts); [`test-bullmq-failure-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-failure-lifecycle.ts) | Timeout toàn job 30 giây; tối đa 3 attempts; progress 25% → 70% → 100% | 5 | Timeout không đảm bảo dừng được tiến trình Sandbox bên ngoài nếu module thực thi không xử lý hủy tác vụ |
| 4 | Integration Testing | Kiểm tra Redis + MySQL, success/failure lifecycle | ChatGPT | Đề xuất assertion cho trạng thái queue và dữ liệu DB | Sinh viên chạy/đối chiếu integration scripts, xác minh Redis job state và bản ghi MySQL cuối | [`test-bullmq-db-integration.ts`](../../Code/backend/scripts/test-bullmq-db-integration.ts); [`test-bullmq-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-lifecycle.ts); [`test-bullmq-failure-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-failure-lifecycle.ts) | Mẫu điểm: 5.6/7 + 2.5/3 = 8.1/10; 3 lần thực thi trong kịch bản retry/failure | 5 | Integration phụ thuộc Redis/MySQL khả dụng; kết quả dùng Sandbox/AI mock nên chưa chứng minh hành vi Docker/LLM thật |
| 5 | API & Monitoring | Cung cấp trạng thái grading job và BullMQ progress qua HTTP | ChatGPT | Gợi ý response, trường lifecycle và xử lý 404/500 | Kiểm tra controller, route mount và gọi HTTP để đối chiếu response; xác minh progress cuối theo kết quả được cung cấp | [`job.controller.ts`](../../Code/backend/src/presentation/controllers/job.controller.ts); [`job.route.ts`](../../Code/backend/src/presentation/routes/job.route.ts); [`index.ts`](../../Code/backend/src/presentation/routes/index.ts) | Endpoint `GET /api/v1/jobs/:submissionId`; progress hoàn tất 100% | 4 | Không tìm thấy script HTTP API riêng trong repository; cần giữ bằng chứng kiểm tra thủ công nếu báo cáo yêu cầu artifact tự động |
| 6 | Validation & Cleanup | Rà soát thay đổi, chạy kiểm tra TypeScript và test liên quan trước commit | ChatGPT | Checklist rà soát lỗi và phạm vi thay đổi | Sinh viên kiểm tra code/diff, sửa lỗi, chạy test; xác minh Redis, MySQL và HTTP API theo kết quả thực tế được cung cấp | [`package.json`](../../Code/backend/package.json); các script [`test-bullmq-queue.ts`](../../Code/backend/scripts/test-bullmq-queue.ts), [`test-bullmq-worker.ts`](../../Code/backend/scripts/test-bullmq-worker.ts), [`test-bullmq-retry.ts`](../../Code/backend/scripts/test-bullmq-retry.ts) | TypeScript `tsc --noEmit`: 0 lỗi theo kết quả được cung cấp; retry tối đa 3 lần | 4 | Kết quả chạy phụ thuộc cấu hình môi trường; `package.json` không khai báo script npm riêng cho toàn bộ test BullMQ |

---

## 3. TỔNG KẾT CÔNG VIỆC TV5

- **Module phụ trách:** TV4 – Redis Queue & Job Lifecycle Coordinator bằng BullMQ.
- **Pipeline:** TV3 giải nén/staging và chuyển `submissionId`, `stagedFolderPath` vào queue; Worker lần lượt gọi TV5 Sandbox rồi TV6 AI Grader, đồng bộ lifecycle và kết quả vào MySQL.
- **Source chính:** [`bullmq.queue.ts`](../../Code/backend/src/infrastructure/queue/bullmq.queue.ts), [`bullmq.worker.ts`](../../Code/backend/src/infrastructure/queue/bullmq.worker.ts), [`job.controller.ts`](../../Code/backend/src/presentation/controllers/job.controller.ts), [`job.route.ts`](../../Code/backend/src/presentation/routes/job.route.ts), [`index.ts`](../../Code/backend/src/presentation/routes/index.ts).
- **Test chính:** [`test-bullmq-queue.ts`](../../Code/backend/scripts/test-bullmq-queue.ts), [`test-bullmq-worker.ts`](../../Code/backend/scripts/test-bullmq-worker.ts), [`test-bullmq-retry.ts`](../../Code/backend/scripts/test-bullmq-retry.ts), [`test-bullmq-db-integration.ts`](../../Code/backend/scripts/test-bullmq-db-integration.ts), [`test-bullmq-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-lifecycle.ts), [`test-bullmq-failure-lifecycle.ts`](../../Code/backend/scripts/test-bullmq-failure-lifecycle.ts).
- **Kết quả kiểm thử được ghi nhận:** Queue, Worker, retry, Redis + MySQL integration, success/failure lifecycle và Progress API đạt; TypeScript `tsc --noEmit` không có lỗi. Các kết quả này là kết quả thực tế do thành viên cung cấp; repository có test harness và assertion tương ứng nhưng không lưu log chạy.
- **Retry mechanism:** BullMQ cấu hình `attempts: 3`, exponential backoff bắt đầu ở 1 giây. Worker ghi `RETRYING`, `retryCount`, `errorStage` và `systemLogs`; khi hết lượt, `GradingJob` và `Submission` chuyển `FAILED`.
- **Progress API:** `GET /api/v1/jobs/:submissionId` lấy các trường lifecycle từ `GradingJob` trong MySQL, sau đó dùng `bullmqJobId` để lấy `queueState` và `progress` từ BullMQ nếu job còn tồn tại. Không có script test HTTP riêng trong repository.
- **Tích hợp:** TV3 cung cấp submission đã staging; TV5 được gọi qua `runSandbox`; kết quả Sandbox được chuyển cho TV6 qua `runAiGrading`; Worker lưu điểm và trạng thái vào MySQL. TV5/TV6 có thể được mock để kiểm thử phần điều phối mà không phụ thuộc triển khai thật.

```text
TV3 ZIP / Staging
        |
        v
BullMQ Queue (Redis) -- QUEUED
        |
        v
TV5 Sandbox -- RUNNING_SANDBOX
        |
        v
TV6 RAG / AI Grader -- RUNNING_AI
        |
        v
MySQL: GradingJob + Submission + scores
        |
        v
COMPLETED / GRADED
```

---

## 4. EXPLAINABILITY CHECKLIST

1. **BullMQ dùng để làm gì?**  
   BullMQ quản lý hàng đợi chấm bài bất đồng bộ: nhận job, phân phối cho Worker, áp dụng priority/retry và giữ trạng thái xử lý của job.

2. **Redis dùng để làm gì?**  
   Redis là backend lưu trữ và điều phối queue/job state mà BullMQ sử dụng; MySQL không thay Redis để Worker nhận job.

3. **Tại sao đã có BullMQ status vẫn cần `GradingJob` trong MySQL?**  
   BullMQ phục vụ điều phối công việc; `GradingJob` lưu hồ sơ nghiệp vụ gắn với submission, lifecycle, thời gian, lỗi và retry để ứng dụng truy vấn lâu dài. Queue có thể dọn các job cũ theo cấu hình giữ lại có giới hạn.

4. **Priority hoạt động thế nào?**  
   Queue gửi priority vào BullMQ; theo cấu hình/API dùng ở đây, số nhỏ hơn có ưu tiên cao hơn. Job mặc định dùng priority 5 nếu không truyền giá trị.

5. **Retry và exponential backoff hoạt động thế nào?**  
   BullMQ thử lại tối đa 3 lần. Backoff exponential với delay ban đầu 1 giây làm khoảng chờ tăng theo lần thử; Worker ném lại lỗi để BullMQ áp dụng retry/backoff.

6. **Tại sao retry tối đa 3 lần?**  
   Đây là giới hạn được cấu hình để xử lý lỗi tạm thời mà không lặp vô hạn, tránh chiếm Worker và tài nguyên Redis/Sandbox. Khi hết lượt, job được đánh dấu thất bại để có thể điều tra.

7. **`RUNNING_SANDBOX` và `RUNNING_AI` khác nhau thế nào?**  
   `RUNNING_SANDBOX` là lúc TV5 biên dịch/chạy bài và tạo kết quả kiểm thử; `RUNNING_AI` là bước TV6 đánh giá/phản hồi dựa trên thông tin đầu vào, gồm kết quả Sandbox.

8. **TV4 giao tiếp với TV3, TV5 và TV6 như thế nào?**  
   TV3 gọi luồng enqueue với `submissionId` và `stagedFolderPath`; Worker gọi dependency `runSandbox`, rồi truyền kết quả đó vào `runAiGrading`. Hai dependency được inject để giữ ranh giới module rõ ràng.

9. **Khi Worker lỗi thì database được cập nhật thế nào?**  
   Trong các lần còn retry, `GradingJob` chuyển `RETRYING` và lưu `retryCount`, `errorStage`, `systemLogs`. Khi hết lượt, transaction cập nhật `GradingJob` và `Submission` thành `FAILED`.

10. **Progress API lấy dữ liệu từ đâu?**  
    Controller gọi hàm truy vấn `GradingJob` trong MySQL. Nếu có `bullmqJobId` và job còn trong queue, hàm bổ sung BullMQ `queueState` và `progress`; không tìm thấy bản ghi trả HTTP 404.

11. **Tại sao dùng Dependency Injection/mock TV5 và TV6 khi test?**  
    Có thể kiểm tra điều phối, lifecycle, retry và lưu DB độc lập với Docker/LLM thật; đồng thời mock giúp mô phỏng thành công/lỗi có kiểm soát. Cần kiểm thử tích hợp riêng khi nối triển khai thật.

12. **Sinh viên đã xác minh code AI sinh ra bằng cách nào?**  
    Nguyễn Thế Dũng đọc và chỉnh code, chạy các script Queue/Worker/retry/lifecycle, kiểm tra Redis và MySQL, gọi HTTP API, sửa lỗi phát hiện được và đối chiếu kết quả cuối. Các kết quả chạy được ghi nhận trong log công việc; source repository có script/assertion, nhưng không lưu console output của lần chạy.
