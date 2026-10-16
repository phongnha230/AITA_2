'use client';

import * as React from 'react';
import { KeyRound, Lock, LockOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { inputClass } from '../ui/FormField';
import type { AdminUser, UpdateUserPayload, UserRole } from '../../types/admin.types';
import { ROLES } from './user-style';

interface UserPrivilegedActionsProps {
  user: AdminUser;
  busy: boolean;
  onChangeRole: (role: UserRole) => void;
  onToggleLock: () => void;
  onResetPassword: () => void;
}

export const UserPrivilegedActions: React.FC<UserPrivilegedActionsProps> = ({
  user,
  busy,
  onChangeRole,
  onToggleLock,
  onResetPassword,
}) => {
  const locked = user.status === 'SUSPENDED';

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Hành động quản trị đặc quyền
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={user.role}
          disabled={busy || user.role === 'ADMIN'}
          onChange={(e) => onChangeRole(e.target.value as UserRole)}
          aria-label="Đổi vai trò"
          className={`${inputClass} !h-10 !w-auto`}
        >
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <Button
          variant={locked ? 'outline' : 'danger'}
          disabled={busy || user.role === 'ADMIN'}
          onClick={onToggleLock}
        >
          {locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />} {locked ? 'Mở khóa' : 'Khóa tài khoản'}
        </Button>
        <Button disabled={busy} onClick={onResetPassword}>
          <KeyRound className="h-4 w-4" /> Reset mật khẩu
        </Button>
      </div>
    </div>
  );
};
