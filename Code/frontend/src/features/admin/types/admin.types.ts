export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';
export type AiProvider = 'GEMINI' | 'OPENAI' | 'ANTHROPIC' | 'DEEPSEEK';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  /** Student code when present in the backend response. */
  userCode?: string | null;
  /** Small line under the name, e.g. "Senior Lecturer" or "Khóa K17 - CNTT". */
  subtitle?: string | null;
  /** Class / department summary shown in the table. */
  department?: string | null;
  departmentNote?: string | null;
  assignedClasses?: string[];
  sandboxAiEnabled?: boolean;
  /** Password reset state, when tracked by the backend. */
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserQuery {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface UserStats {
  total: number;
  lecturers: number;
  students: number;
  admins: number;
  suspended: number;
  pending: number;
  newThisWeek?: number;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
}

export type UpdateUserPayload = Partial<
  Pick<AdminUser, 'fullName' | 'role' | 'status' | 'avatarUrl'>
>;

export interface AiApiKey {
  id: string;
  provider: AiProvider;
  source: 'DASHBOARD';
  keyAlias: string;
  keyHint: string;
  /** Masked key preview such as "sk-proj-9x4F...a8K1" (UI only). */
  keyPreview?: string;
  purposeTitle?: string;
  purposeNote?: string;
  dailyRequestLimit: number;
  currentRequestsToday: number;
  usageDate?: string | null;
  rpmLimit: number;
  tpmLimit?: number;
  latencyMs?: number | null;
  consecutiveFailures: number;
  isActive: boolean;
  cooldownUntil?: string | null;
  lastErrorCode?: string | null;
  availabilityStatus: 'AVAILABLE' | 'COOLDOWN' | 'QUOTA_EXHAUSTED' | 'DISABLED';
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAiKeyPayload {
  provider: AiProvider;
  keyAlias: string;
  rawApiKey: string;
  dailyRequestLimit: number;
  rpmLimit: number;
}

export type JobState = 'Processing' | 'Queued' | 'Failed' | 'Completed';
export type JobQueueName = 'grading' | 'docker-eval-queue' | 'ai-rubric-queue';

export interface QueueJob {
  id: string;
  name: string;
  detail: string;
  student: string;
  course: string;
  queue: JobQueueName;
  progressLabel: string;
  percent: number;
  duration: string;
  state: JobState;
}
