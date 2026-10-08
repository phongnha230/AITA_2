import type { AdminUser, AiApiKey, AiProvider, QueueJob, UserRole, UserStatus } from '../types/admin.types';

/** Seed data mirroring the Stitch design: 1,420 users (48 lecturers / 1,365 students / 7 admins), 20 AI keys, 35 jobs. */

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
const DEM = ['Văn', 'Thị', 'Minh', 'Quốc', 'Hữu', 'Ngọc', 'Đức', 'Thanh'];
const TEN = ['An', 'Bình', 'Cường', 'Dũng', 'Giang', 'Hải', 'Hiếu', 'Khoa', 'Linh', 'Long', 'Nam', 'Phát', 'Phương', 'Quân', 'Sơn', 'Tâm', 'Thảo', 'Tuấn', 'Vy', 'Yến'];
const SUBJECTS = ['PRF192', 'CSD201', 'PRO192', 'PRN211', 'SWP391', 'JPD123', 'DBI202', 'MAD101'];
const MAJORS = ['CNTT', 'KTPM', 'AI', 'ATTT'];
const DEPARTMENTS = ['Kỹ thuật phần mềm', 'An toàn thông tin', 'Trí tuệ nhân tạo', 'Hệ thống thông tin'];

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const iso = (daysAgo: number, hour = 9) => {
  const d = new Date(Date.UTC(2025, 1, 20, hour, 0, 0));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
};

const user = (
  code: string,
  fullName: string,
  email: string,
  role: UserRole,
  status: UserStatus,
  subtitle: string,
  department: string,
  departmentNote: string | null,
  daysAgo: number,
): AdminUser => ({
  id: `u-${code.toLowerCase()}`,
  email,
  fullName,
  role,
  status,
  userCode: code,
  subtitle,
  department,
  departmentNote,
  avatarUrl: null,
  lastLoginAt: status === 'PENDING_ACTIVATION' ? null : iso(daysAgo % 14, 8 + (daysAgo % 9)),
  createdAt: iso(60 + daysAgo),
  updatedAt: iso(daysAgo % 14),
});

const fullNameAt = (i: number) => `${HO[i % HO.length]} ${DEM[(i * 7) % DEM.length]} ${TEN[(i * 13) % TEN.length]}`;
const emailName = (fullName: string) => {
  const parts = fullName.split(' ');
  const ten = slug(parts[parts.length - 1]);
  const initials = parts.slice(0, -1).map((p) => slug(p)[0]).join('');
  return `${ten}${initials}`;
};

const DESIGNED_USERS: AdminUser[] = [
  user('FE00824', 'Thầy Hoàng Nam', 'namh@fpt.edu.vn', 'LECTURER', 'ACTIVE', 'Senior Lecturer', 'Kỹ thuật phần mềm', '3 lớp (120 SV)', 1),
  user('HE172450', 'Nguyễn Văn An', 'annvhe172450@fpt.edu.vn', 'STUDENT', 'ACTIVE', 'Khóa K17 - CNTT', 'CSD201, PRF192', null, 2),
  user('FE00912', 'Cô Nguyễn Mai Lan', 'lannm@fpt.edu.vn', 'LECTURER', 'ACTIVE', 'Lecturer', 'An toàn thông tin', null, 3),
  user('SE174920', 'Trần Thị Mai', 'maittse174920@fpt.edu.vn', 'STUDENT', 'ACTIVE', 'Khóa K17 - KTPM', 'SWP391, PRN211', null, 4),
  user('HE180015', 'Lê Quang Minh', 'minhlqhe180015@fpt.edu.vn', 'STUDENT', 'SUSPENDED', 'Vi phạm quy chế thi', 'PRF192_SE19C', null, 5),
  user('ADM_ROOT', 'Trần Đình Khang', 'khangtd.admin@fpt.edu.vn', 'ADMIN', 'ACTIVE', 'Root Infrastructure', 'Phòng Khảo thí & Đảm bảo chất lượng', null, 0),
];

const generateUsers = (): AdminUser[] => {
  const out: AdminUser[] = [];

  for (let i = 0; i < 46; i++) {
    const code = `FE${String(1000 + i).padStart(5, '0')}`;
    const name = `${i % 2 ? 'Cô' : 'Thầy'} ${fullNameAt(i + 3)}`;
    out.push(user(code, name, `${emailName(fullNameAt(i + 3))}${i}@fpt.edu.vn`, 'LECTURER', 'ACTIVE', 'Lecturer', DEPARTMENTS[i % 4], `${2 + (i % 3)} lớp (${70 + i} SV)`, i + 6));
  }

  for (let i = 0; i < 1362; i++) {
    const code = `${['HE', 'SE', 'QE', 'DE'][i % 4]}${String(170000 + i * 3).slice(0, 6)}`;
    const name = fullNameAt(i + 11);
    const status: UserStatus = i === 700 ? 'SUSPENDED' : i % 290 === 5 ? 'PENDING_ACTIVATION' : 'ACTIVE';
    const major = MAJORS[i % 4];
    out.push(
      user(
        code,
        name,
        `${emailName(name)}${code.toLowerCase()}@fpt.edu.vn`,
        'STUDENT',
        status,
        status === 'SUSPENDED' ? 'Vi phạm quy chế thi' : `Khóa K${17 + (i % 3)} - ${major}`,
        `${SUBJECTS[i % 8]}, ${SUBJECTS[(i + 3) % 8]}`,
        null,
        i % 30,
      ),
    );
  }

  for (let i = 0; i < 6; i++) {
    const name = fullNameAt(i + 40);
    out.push(user(`ADM_${String(i + 1).padStart(3, '0')}`, name, `${emailName(name)}.admin${i}@fpt.edu.vn`, 'ADMIN', 'ACTIVE', 'System Administrator', 'Phòng Khảo thí & Đảm bảo chất lượng', null, i + 1));
  }
  return out;
};

export const seedUsers = (): AdminUser[] => [...DESIGNED_USERS, ...generateUsers()];

const stamp = iso(10);

const key = (
  n: number,
  provider: AiProvider,
  alias: string,
  preview: string,
  purposeTitle: string,
  purposeNote: string,
  rpm: number,
  tpm: number,
  daily: number,
  used: number,
  latency: number,
  active: boolean,
): AiApiKey => ({
  id: `key-${String(n).padStart(2, '0')}`,
  provider,
  keyAlias: alias,
  keyHint: preview.slice(-4),
  keyPreview: preview,
  purposeTitle,
  purposeNote,
  rpmLimit: rpm,
  tpmLimit: tpm,
  dailyRequestLimit: daily,
  currentRequestsToday: used,
  latencyMs: latency,
  consecutiveFailures: 0,
  isActive: active,
  lastUsedAt: iso(0, 10),
  createdAt: stamp,
  updatedAt: stamp,
});

const PROVIDER_META: Record<AiProvider, { label: string; prefix: string }> = {
  OPENAI: { label: 'OpenAI GPT-4o', prefix: 'sk-proj-' },
  GEMINI: { label: 'Google Gemini 1.5', prefix: 'AIzaSy' },
  ANTHROPIC: { label: 'Claude 3.5 Sonnet', prefix: 'sk-ant-api03' },
  DEEPSEEK: { label: 'DeepSeek Coder V2', prefix: 'dsk-live-' },
};

export const seedAiKeys = (): AiApiKey[] => {
  const keys: AiApiKey[] = [
    key(1, 'OPENAI', 'Key-01: OpenAI GPT-4o Mini', 'sk-proj-9x4F...a8K1', 'Chấm Rubric & Code Syntax', 'Mã hóa kiểm thử AST', 250, 150000, 50000, 41000, 420, true),
    key(2, 'GEMINI', 'Key-02: Google Gemini 1.5 Pro', 'AIzaSy...7e1U', 'RAG Context & Đề thi', 'Đọc tài liệu PDF > 1M tokens', 360, 300000, 100000, 45000, 580, true),
    key(3, 'ANTHROPIC', 'Key-03: Claude 3.5 Sonnet', 'sk-ant-api03...ww9P', 'AI Socratic Mentor', 'Giải thích sư phạm phản hồi', 180, 80000, 50000, 34000, 710, true),
    key(4, 'DEEPSEEK', 'Key-04: DeepSeek Coder V2', 'dsk-live-09...d11A', 'Dự phòng Failover', 'Phân tích gian lận MOSS', 500, 600000, 100000, 15000, 310, false),
  ];
  const providers: AiProvider[] = ['OPENAI', 'GEMINI', 'ANTHROPIC', 'DEEPSEEK'];
  for (let n = 5; n <= 20; n++) {
    const p = providers[n % 4];
    const meta = PROVIDER_META[p];
    keys.push(
      key(n, p, `Key-${String(n).padStart(2, '0')}: ${meta.label}`, `${meta.prefix}${(n * 7919).toString(36).slice(0, 4)}...${(n * 104729).toString(36).slice(0, 4)}`, 'Chấm Rubric & Code Syntax', 'Cân bằng tải ca thi', 200 + n * 10, 100000, 50000, 5000 + n * 1500, 350 + n * 20, n !== 9),
    );
  }
  return keys;
};

const STUDENT_NAMES = ['Nguyễn Hoàng Long', 'Trần Mai Phương', 'Lê Tuấn Anh', 'Vũ Minh Đức', 'Đỗ Bảo Ngọc', 'Phạm Gia Huy', 'Bùi Thu Hà', 'Đặng Quốc Việt'];
const COURSES = ['CSD201', 'PRN211', 'JPD123', 'PRF192', 'SWP391'];

const job = (n: number, state: QueueJob['state'], queue: QueueJob['queue'], over: Partial<QueueJob> = {}): QueueJob => {
  const code = `HE${170000 + n * 37}`;
  const course = COURSES[n % COURSES.length];
  const docker = queue === 'docker-eval-queue';
  const base: QueueJob = {
    id: `job-${(0xa1000 + n * 7919).toString(16)}`,
    name: docker ? `sandbox-compile-q${(n % 4) + 1}` : `pe-grade-${course.toLowerCase()}-${code.toLowerCase()}`,
    detail: docker ? 'GCC 13.2 / C++20 Sandbox' : 'GPT-4o Rubric Engine',
    student: STUDENT_NAMES[n % STUDENT_NAMES.length],
    course: `${course} • ${code}`,
    queue,
    progressLabel: state === 'Queued' ? 'Trong hàng đợi' : state === 'Completed' ? 'Hoàn tất 10/10 tiêu chí' : docker ? `${n % 7}/7 testcases` : 'Phân tích Clean Code',
    percent: state === 'Queued' ? 0 : state === 'Completed' ? 100 : 30 + ((n * 11) % 60),
    duration: state === 'Queued' ? '0.0s' : `${(1 + (n % 30) / 10).toFixed(1)}s`,
    state,
  };
  return { ...base, ...over };
};

export const seedJobs = (): QueueJob[] => {
  const jobs: QueueJob[] = [
    { id: 'job-c8f921d7', name: 'sandbox-compile-q3', detail: 'GCC 13.2 / C++20 Sandbox', student: 'Nguyễn Hoàng Long', course: 'CSD201 • HE172450', queue: 'docker-eval-queue', progressLabel: '6/7 testcases', percent: 85, duration: '1.4s', state: 'Processing' },
    { id: 'job-a773bc81', name: 'pe-grade-csd201-he172450', detail: 'Claude-3-5-Sonnet Rubric Engine', student: 'Trần Mai Phương', course: 'PRN211 • SE160912', queue: 'ai-rubric-queue', progressLabel: 'Phân tích Clean Code', percent: 62, duration: '3.1s', state: 'Processing' },
    { id: 'job-90b1ec44', name: 'sandbox-compile-q1', detail: 'OpenJDK 21 / Maven Sandbox', student: 'Lê Tuấn Anh', course: 'JPD123 • HE180123', queue: 'docker-eval-queue', progressLabel: 'Trong hàng đợi', percent: 0, duration: '0.0s', state: 'Queued' },
    { id: 'job-fe88a102', name: 'sandbox-compile-q4', detail: 'Runtime Error: Segfault 139', student: 'Vũ Minh Đức', course: 'PRF192 • HE179088', queue: 'docker-eval-queue', progressLabel: 'Dừng tại Test 3 (Crash)', percent: 42, duration: '4.8s (Timeout)', state: 'Failed' },
    { id: 'job-11b069d2', name: 'pe-grade-csd201-he170021', detail: 'Đã đồng bộ Gradebook', student: 'Đỗ Bảo Ngọc', course: 'CSD201 • HE170021', queue: 'ai-rubric-queue', progressLabel: 'Hoàn tất 10/10 tiêu chí', percent: 100, duration: '1.9s', state: 'Completed' },
  ];
  let n = 10;
  for (let i = 0; i < 13; i++) jobs.push(job(n++, 'Queued', i % 3 ? 'docker-eval-queue' : 'ai-rubric-queue'));
  for (let i = 0; i < 7; i++) jobs.push(job(n++, 'Processing', 'docker-eval-queue'));
  for (let i = 0; i < 4; i++) jobs.push(job(n++, 'Processing', 'ai-rubric-queue'));
  jobs.push(job(n++, 'Failed', 'docker-eval-queue', { detail: 'OOM Killed (exit 137)', progressLabel: 'Dừng tại Test 5 (OOM)', percent: 71, duration: '6.2s (Timeout)' }));
  for (let i = 0; i < 5; i++) jobs.push(job(n++, 'Completed', i % 2 ? 'docker-eval-queue' : 'ai-rubric-queue'));
  return jobs;
};
