export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';
export type AiProvider = 'GEMINI' | 'OPENAI';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
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

export interface CreateUserPayload {
  email: string;
  fullName: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
}

export type UpdateUserPayload = Partial<Pick<AdminUser, 'fullName' | 'role' | 'status'>>;

export interface AiApiKey {
  id: string;
  provider: AiProvider;
  keyAlias: string;
  keyHint: string;
  dailyRequestLimit: number;
  currentRequestsToday: number;
  rpmLimit: number;
  consecutiveFailures: number;
  isActive: boolean;
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
