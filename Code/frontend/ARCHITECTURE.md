# KIẾN TRÚC THƯ MỤC FRONTEND (CLEAN ARCHITECTURE - NEXT.JS 14+)

Hệ thống Frontend của **AITA** được tổ chức theo mô hình **Feature-Driven & Clean Modular Architecture**, giúp 4 - 5 thành viên trong nhóm code độc lập từng phân hệ (Feature) mà không bị conflict mã nguồn.

---

## 1. SƠ ĐỒ CẤU TRÚC THƯ MỤC TỔNG THỂ

```
src/
├── app/                           # [Routing Layer] Chỉ chứa page, layout, loading/error states
│   ├── (auth)/                    # Nhóm route xác thực (không ảnh hưởng URL)
│   │   ├── login/                 # Trang /login
│   │   └── register/              # Trang /register
│   │
│   ├── (dashboard)/               # Nhóm route nghiệp vụ chính (có Sidebar/Header chung)
│   │   ├── dashboard/             # Trang /dashboard
│   │   ├── courses/               # Trang /courses
│   │   └── assignments/[id]/      # Trang /assignments/:id
│   │
│   ├── submissions/[id]/          # Trang theo dõi kết quả chấm thi /submissions/:id
│   │
│   ├── admin/                     # Nhóm route quản trị hệ thống
│   │   ├── ai-keys/               # Trang /admin/ai-keys (Quản lý kho key xoay vòng)
│   │   └── jobs/                  # Trang /admin/jobs (Giám sát hàng đợi GradingJob)
│   │
│   ├── layout.tsx                 # Root Layout toàn hệ thống
│   ├── page.tsx                   # Landing Page & System Health Dashboard
│   └── globals.css                # Tailwind base styles
│
├── components/                    # [Shared Presentation Layer] Các component giao diện dùng chung
│   ├── ui/                        # Nguyên tử UI cơ bản (Button, Input, Modal, Badge, Card, Table...)
│   ├── common/                    # Khung sườn trang (Header, Sidebar, Navbar, Footer, Breadcrumbs)
│   └── feedback/                  # Component thông báo (LoadingSpinner, EmptyState, AlertBox)
│
├── features/                      # [Domain Feature Modules] Chia theo từng phân hệ cho từng thành viên
│   ├── auth/                      # Module Xác thực & Tài khoản
│   │   ├── components/            # LoginForm, RegisterForm, UserAvatar
│   │   ├── hooks/                 # useAuth, useLogin, useLogout
│   │   ├── services/              # authApi.ts (login, register, refreshToken)
│   │   └── types/                 # User, AuthState, LoginCredentials
│   │
│   ├── courses/                   # Module Quản lý Khóa học & Lớp học
│   │   ├── components/            # CourseCard, CourseList, StudentRosterTable
│   │   ├── hooks/                 # useCourses, useCourseDetails
│   │   ├── services/              # courseApi.ts
│   │   └── types/                 # Course, Enrollment
│   │
│   ├── assignments/               # Module Quản lý Bài tập & Đề thi PE
│   │   ├── components/            # AssignmentDetail, RubricRuleEditor, TestCaseConfigForm
│   │   ├── hooks/                 # useAssignment, useRubrics
│   │   ├── services/              # assignmentApi.ts
│   │   └── types/                 # Assignment, RubricRule, TestCase
│   │
│   ├── submissions/               # Module Nộp bài & Theo dõi Chấm điểm
│   │   ├── components/            # ZipUploadDropzone, GitRepoSubmitForm, LiveJobProgressBar
│   │   ├── hooks/                 # useSubmission, useJobPolling
│   │   ├── services/              # submissionApi.ts
│   │   └── types/                 # Submission, GradingJob, JobStatus
│   │
│   ├── sandbox/                   # Module Hiển thị Kết quả Thực thi Docker
│   │   ├── components/            # TerminalOutputViewer, TestCaseResultTabs (Q1..Q4), DiffViewer
│   │   ├── hooks/                 # useSandboxResults
│   │   └── services/              # sandboxApi.ts
│   │
│   ├── ai-tutor/                  # Module Trợ giảng AI & Semantic Review
│   │   ├── components/            # ChatBoxWidget, MessageBubble, RubricFeedbackCard
│   │   ├── hooks/                 # useAiChat, useAiFeedback
│   │   └── services/              # aiTutorApi.ts
│   │
│   ├── git-analytics/             # Module Phân tích Đóng góp Git (Anti-Free-Riding)
│   │   ├── components/            # CommitFrequencyChart, MemberContributionCard
│   │   ├── hooks/                 # useGitMetrics
│   │   └── services/              # gitApi.ts
│   │
│   └── admin/                     # Module Dành cho Quản trị viên
│       ├── components/            # AiKeyTable, AddKeyModal, RedisQueueStats
│       ├── hooks/                 # useAiKeys, useQueueStats
│       └── services/              # adminApi.ts
│
├── services/                      # [Core Infrastructure Layer] Cấu hình HTTP Client cơ sở
│   └── http.client.ts             # Axios instance với interceptor tự động gắn Bearer Token
│
├── hooks/                         # [Global Hooks] Các React Hook tiện ích dùng chung
│   └── useDebounce.ts, useMediaQuery.ts, useLocalStorage.ts
│
├── stores/                        # [Global State Management] Quản lý state toàn cục (Zustand/Context)
│   └── useUserStore.ts, useThemeStore.ts
│
├── types/                         # [Global Types] Kiểu dữ liệu dùng chung toàn hệ thống
│   ├── api.response.ts            # Định dạng ApiResponse<T>, ApiError
│   └── common.types.ts            # Pagination, SortOrder, UUID
│
├── constants/                     # [Constants] Giá trị cố định
│   ├── routes.constant.ts         # Danh sách URL đường dẫn trang
│   └── roles.constant.ts          # Enum Quyền: ADMIN, LECTURER, STUDENT
│
├── config/                        # [Configuration] Cấu hình môi trường, metadata
│   └── env.config.ts
│
└── utils/                         # [Utility Functions] Hàm xử lý thuần túy
    └── format.util.ts             # formatBytes (MB/KB), formatDate, truncateText
```

---

## 2. NGUYÊN TẮC PHÂN CHIA CHO THÀNH VIÊN TRONG NHÓM
- **Không đụng chạm code lẫn nhau:** Mỗi thành viên khi làm module nào chỉ cần tạo component và logic bên trong folder `src/features/<feature_name>/` tương ứng của mình.
- **Trang trong `src/app/` chỉ làm nhiệm vụ lắp ráp:** File `page.tsx` trong `src/app/` chỉ import các component từ `src/features/` vào, không viết logic cồng kềnh trực tiếp trong page.
