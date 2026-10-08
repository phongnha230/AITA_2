import type { BadgeTone } from '../ui/Badge';
import type { UserRole, UserStatus } from '../../types/admin.types';

export const ROLE_TONE: Record<UserRole, BadgeTone> = { ADMIN: 'admin', LECTURER: 'lecturer', STUDENT: 'student' };

export const ROLE_SELECT_CLASS: Record<UserRole, string> = {
  ADMIN: 'bg-rose-50 text-rose-600 border-rose-100',
  LECTURER: 'bg-blue-50 text-blue-600 border-blue-100',
  STUDENT: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export const ROLES: UserRole[] = ['STUDENT', 'LECTURER', 'ADMIN'];

export const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  SUSPENDED: 'Bị khóa',
  PENDING_ACTIVATION: 'Chờ kích hoạt',
};

export const STATUS_TEXT_CLASS: Record<UserStatus, string> = {
  ACTIVE: 'text-emerald-600',
  SUSPENDED: 'text-rose-600',
  PENDING_ACTIVATION: 'text-amber-600',
};

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
