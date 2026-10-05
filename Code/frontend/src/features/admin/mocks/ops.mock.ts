/**
 * Sample telemetry for screens whose backend endpoints do not exist yet
 * (dashboard, BullMQ queue, Docker cluster). Replace with real services
 * (e.g. admin-ops.service.ts) once the API is available.
 */

export interface LiveSession {
  code: string;
  subject: string;
  room: string;
  proctor: string;
  badge: string;
  badgeTone: 'warning' | 'student' | 'neutral';
  progressLabel: string;
  progressValue: string;
  percent: number;
  barColor: string;
}

export const LIVE_SESSIONS: LiveSession[] = [
  { code: 'PRF192_SE19C', subject: 'C Basics', room: 'LAB 302', proctor: 'Thầy Hoàng Nam', badge: 'Còn 24:15', badgeTone: 'warning', progressLabel: '38 thí sinh trực tuyến', progressValue: 'Nộp bài: 32/38 (84%)', percent: 84, barColor: 'bg-blue-600' },
  { code: 'CSD201_SE1802', subject: 'Data Structures', room: 'LAB 304', proctor: 'Cô Mai Lan', badge: 'Đang làm bài', badgeTone: 'student', progressLabel: '40/40 máy trạm kết nối Kiosk', progressValue: '100% Lock', percent: 100, barColor: 'bg-emerald-600' },
  { code: 'PRO192_IA1802', subject: 'Java OOP', room: 'LAB 305', proctor: 'Thầy Quốc Tuấn', badge: 'Mở đề: 15:45', badgeTone: 'neutral', progressLabel: 'Đã điểm danh: 35/36', progressValue: 'Chờ phát đề thi', percent: 15, barColor: 'bg-slate-300' },
];

export interface OpsEvent {
  time: string;
  level: 'Warning' | 'Info' | 'Success' | 'Proctor Alert';
  subsystem: string;
  message: string;
  status: string;
  action: string;
}

export const OPS_EVENTS: OpsEvent[] = [
  { time: '14:28:10', level: 'Warning', subsystem: 'AI Key Pool', message: 'AI Key #03 (Claude 3.5 Sonnet) chạm ngưỡng 68% Quota TPM. Đã tự động phân tải sang Gemini-Pro Fallback.', status: 'Đã xử lý', action: 'Xem Key Log' },
  { time: '14:25:02', level: 'Info', subsystem: 'Sandbox Worker', message: 'Worker Node-02 tự động hủy (Kill) tiến trình chạy quá 2000ms (TLE) cho bài nộp CSD201 của thí sinh HE180015.', status: 'Tự động khóa', action: 'Xem Terminal' },
  { time: '14:20:44', level: 'Success', subsystem: 'FAP Data Sync', message: 'Đồng bộ thành công danh bạ 120 sinh viên mới từ cổng FAP Portal vào danh sách dự thi ca chiều.', status: 'Hoàn tất', action: 'Danh sách SV' },
  { time: '14:15:30', level: 'Proctor Alert', subsystem: 'Kiosk Proctor', message: 'Phát hiện sinh viên LAB 304 máy WS-14 mất focus cửa sổ thi Kiosk (Alt+Tab 2 lần). Đã ghi log vi phạm.', status: 'Cần xem xét', action: 'Gửi Giám thị' },
];

export const THROUGHPUT_SUBMISSIONS = [10, 14, 60, 148, 90, 30, 18, 25, 80, 132, 100, 60, 40, 55];
export const THROUGHPUT_AI = [8, 12, 50, 120, 85, 40, 22, 30, 70, 110, 95, 52, 38, 48];
export const CPU_SERIES = [18, 20, 22, 26, 23, 19, 30, 52, 68, 40, 28, 45, 30, 22, 28];
export const RAM_SERIES = [90, 100, 110, 125, 140, 160, 190, 230, 298, 240, 180, 150, 184];
export const JOBS_PER_MIN = [20, 40, 80, 110, 70, 55, 75, 148, 90, 60, 40, 85, 88];
export const JOBS_AVG_MS = [30, 38, 45, 55, 48, 40, 42, 50, 46, 38, 30, 36, 38];

export type JobState = 'Processing' | 'Queued' | 'Failed' | 'Completed';

export interface QueueJob {
  id: string;
  name: string;
  detail: string;
  student: string;
  course: string;
  queue: 'docker-eval-queue' | 'ai-rubric-queue';
  progressLabel: string;
  percent: number;
  duration: string;
  state: JobState;
}

export const QUEUE_JOBS: QueueJob[] = [
  { id: 'job-c8f921d7', name: 'sandbox-compile-q3', detail: 'GCC 13.2 / C++20 Sandbox', student: 'Nguyễn Hoàng Long', course: 'CSD201 • HE172450', queue: 'docker-eval-queue', progressLabel: '6/7 testcases', percent: 85, duration: '1.4s', state: 'Processing' },
  { id: 'job-a773bc81', name: 'pe-grade-csd201-he172450', detail: 'Claude-3-5-Sonnet Rubric Engine', student: 'Trần Mai Phương', course: 'PRN211 • SE160912', queue: 'ai-rubric-queue', progressLabel: 'Phân tích Clean Code', percent: 62, duration: '3.1s', state: 'Processing' },
  { id: 'job-90b1ec44', name: 'sandbox-compile-q1', detail: 'OpenJDK 21 / Maven Sandbox', student: 'Lê Tuấn Anh', course: 'JPD123 • HE180123', queue: 'docker-eval-queue', progressLabel: 'Trong hàng đợi', percent: 0, duration: '0.0s', state: 'Queued' },
  { id: 'job-fe88a102', name: 'sandbox-compile-q4', detail: 'Runtime Error: Segfault 139', student: 'Vũ Minh Đức', course: 'PRF192 • HE179088', queue: 'docker-eval-queue', progressLabel: 'Dừng tại Test 3 (Crash)', percent: 42, duration: '4.8s (Timeout)', state: 'Failed' },
  { id: 'job-11b069d2', name: 'pe-grade-csd201-he170021', detail: 'Đã đồng bộ Gradebook', student: 'Đỗ Bảo Ngọc', course: 'CSD201 • HE170021', queue: 'ai-rubric-queue', progressLabel: 'Hoàn tất 10/10 tiêu chí', percent: 100, duration: '1.9s', state: 'Completed' },
];

export interface DockerNode {
  index: string;
  name: string;
  location: string;
  role: string;
  ip: string;
  containers: number;
  cpu: number;
  ramGb: number;
  policies: string[];
}

export const DOCKER_NODES: DockerNode[] = [
  { index: '01', name: 'Node-01', location: 'Master LAB302', role: 'Orchestrator Node', ip: '192.168.14.10', containers: 6, cpu: 22, ramGb: 2.1, policies: ['No Internet', 'Seccomp: Block ptrace', 'Fork-bomb Shield'] },
  { index: '02', name: 'Node-02', location: 'Worker LAB304', role: 'Execution Runner', ip: '192.168.14.11', containers: 12, cpu: 45, ramGb: 4.3, policies: ['No Internet', 'Seccomp: Block ptrace', 'Rootless Mode'] },
  { index: '03', name: 'Node-03', location: 'Worker LAB305', role: 'Execution Runner', ip: '192.168.14.12', containers: 8, cpu: 30, ramGb: 2.8, policies: ['No Internet', 'Seccomp: Block ptrace', 'Fork-bomb Shield'] },
];

export interface DockerLogLine {
  time: string;
  tag: 'CREATE' | 'SIGKILL' | 'RECLAIM' | 'SUCCESS';
  text: string;
}

export const DOCKER_LOGS: DockerLogLine[] = [
  { time: '14:32:01.104', tag: 'CREATE', text: 'Node-02: Container sandbox-py-subm-89104 khởi tạo với seccomp profile student-strict.json (Cap CPU 1.0, RAM 512MB).' },
  { time: '14:32:03.118', tag: 'SIGKILL', text: 'Node-02: Đã ép dừng tiến trình PID 39012 trong container sandbox-py-subm-89104 do vượt giới hạn thời gian chạy (TLE > 2000ms).' },
  { time: '14:32:03.542', tag: 'RECLAIM', text: 'Node-02: Dọn dẹp cgroups, thu hồi 218MB RAM và xóa bỏ veth interface cách ly của sandbox-py-subm-89104 thành công.' },
  { time: '14:32:08.890', tag: 'CREATE', text: 'Node-03: Container sandbox-java-subm-89105 gắn thành công vào pool chấm kiểm thử phân tán. Outbound Network: DISABLED.' },
  { time: '14:32:10.114', tag: 'SUCCESS', text: 'Node-03: Hoàn thành chấm bài sandbox-java-subm-89105 (thời gian thực thi: 340ms, đỉnh RAM: 142MB). Trả kết quả về BullMQ.' },
];

export interface LecturerProfile {
  classes: { code: string; title: string; students: number }[];
  examsCreated: number;
  totalStudents: number;
}

export interface StudentProfile {
  studentCode: string;
  major: string;
  classes: { name: string; subject: string; lecturer: string }[];
  exams: { name: string; score: string; passed: boolean; submissions: number }[];
  securityFlags: { reason: string; ip: string }[];
}

export const SAMPLE_LECTURER: LecturerProfile = {
  examsCreated: 14,
  totalStudents: 120,
  classes: [
    { code: 'PRF192_SE19C', title: 'C Programming Fundamentals', students: 38 },
    { code: 'CSD201_SE1802', title: 'Data Structures & Algorithms', students: 40 },
    { code: 'PRO192_IA1802', title: 'Object-Oriented Programming (Java)', students: 42 },
  ],
};

export const SAMPLE_STUDENT: StudentProfile = {
  studentCode: 'QE190161',
  major: 'Software Engineering',
  classes: [
    { name: 'PRF192_SE19C', subject: 'PRF192', lecturer: 'Thầy Hoàng Nam' },
    { name: 'CSD201_SE1802', subject: 'CSD201', lecturer: 'Cô Mai Lan' },
  ],
  exams: [
    { name: 'PE PRF192 - Lần 1', score: '8.5 (Sandbox 6.0 + AI 2.5)', passed: true, submissions: 2 },
    { name: 'PE CSD201 - Lần 1', score: '4.0 (Sandbox 3.0 + AI 1.0)', passed: false, submissions: 3 },
  ],
  securityFlags: [{ reason: 'Sandbox chặn timeout / fork-bomb (CSD201)', ip: '10.14.22.31' }],
};
