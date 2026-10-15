'use client';

import * as React from 'react';
import { cn } from '../../../../lib/cn';
import { Badge } from '../ui/Badge';
import type { AdminUser, UserRole } from '../../types/admin.types';
import { initials, ROLE_TONE } from './user-style';

interface UserProfileHeaderProps {
  user: AdminUser;
  onPickRole: (role: UserRole) => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, onPickRole }) => {
  const locked = user.status === 'SUSPENDED';
  const isHead = user.subtitle === 'Trưởng bộ môn';

  return (
    <>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Chi tiết Hồ sơ &amp; Phân quyền RBAC
        </h2>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['LECTURER', 'STUDENT'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onPickRole(r)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-semibold',
                user.role === r ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {r === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-blue-50/60 p-5 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
          {initials(user.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">{user.fullName}</h3>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
            <span className="font-mono">
              {user.role === 'LECTURER' ? 'MSGV' : 'MSSV'}: {user.userCode ?? '—'}
            </span>
            <span>•</span>
            <span>{user.department ?? '—'}</span>
            <span>•</span>
            <span className="font-mono text-emerald-700">{user.email}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isHead && <Badge tone="warning">Trưởng bộ môn</Badge>}
          {user.mustChangePassword && <Badge tone="warning">Chờ đổi mật khẩu</Badge>}
          <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
          {locked && <Badge tone="admin" dot>BANNED</Badge>}
        </div>
      </div>
    </>
  );
};
