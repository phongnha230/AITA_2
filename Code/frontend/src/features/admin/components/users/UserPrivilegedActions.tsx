'use client';

import * as React from 'react';
import { ArrowLeftRight, ClipboardCheck, KeyRound, Lock, LockOpen, Medal } from 'lucide-react';
import { Button } from '../ui/Button';
import { inputClass } from '../ui/FormField';
import type { AdminUser, UpdateUserPayload, UserRole } from '../../types/admin.types';
import { ROLES } from './user-style';

interface UserPrivilegedActionsProps {
  user: AdminUser;
  busy: boolean;
  onOpenClassDialog: () => void;
  onOpenDeptDialog: () => void;
  onToggleHead: () => void;
  onChangeRole: (role: UserRole) => void;
  onToggleLock: () => void;
  onResetPassword: () => void;
}

export const UserPrivilegedActions: React.FC<UserPrivilegedActionsProps> = ({
  user,
  busy,
  onOpenClassDialog,
  onOpenDeptDialog,
  onToggleHead,
  onChangeRole,
  onToggleLock,
  onResetPassword,
}) => {
  const locked = user.status === 'SUSPENDED';
  const isHead = user.subtitle === 'Trưởng bộ môn';

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Hành động quản trị đặc quyền
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy || user.role !== 'LECTURER'} onClick={onOpenClassDialog}>
          <ClipboardCheck className="h-4 w-4 text-blue-600" /> Phân công thêm lớp
        </Button>
        <Button disabled={busy || user.role === 'ADMIN'} onClick={onOpenDeptDialog}>
          <ArrowLeftRight className="h-4 w-4" /> Đổi bộ môn
        </Button>
        <Button
          className="bg-blue-50 text-blue-700"
          disabled={busy || user.role !== 'LECTURER'}
          onClick={onToggleHead}
        >
          <Medal className="h-4 w-4" /> {isHead ? 'Gỡ Trưởng bộ môn' : 'Gán Trưởng bộ môn'}
        </Button>
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
