'use client';

import { useState } from 'react';
import { KeyRound, Lock, LockOpen } from 'lucide-react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { inputClass } from '../ui/FormField';
import { Modal } from '../ui/Modal';
import type { AdminUser, UserRole } from '../../types/admin.types';
import { LecturerSection, StudentSection } from './UserRoleSections';
import { initials, ROLE_TONE, ROLES, STATUS_LABEL } from './user-style';

interface UserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: (user: AdminUser) => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, onClose, onUpdated }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await task();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (!user) return <Modal open={false} title="" onClose={onClose}>{null}</Modal>;

  const locked = user.status === 'SUSPENDED';

  const changeRole = (role: UserRole) => run(async () => onUpdated(await adminUserService.update(user.id, { role })));
  const toggleLock = () =>
    run(async () => onUpdated(await adminUserService.update(user.id, { status: locked ? 'ACTIVE' : 'SUSPENDED' })));
  const resetPassword = () => {
    const next = window.prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):');
    if (!next) return;
    void run(async () => {
      await adminUserService.resetPassword(user.id, next);
      setNotice('Đã đặt lại mật khẩu thành công.');
    });
  };

  return (
    <Modal open title="Hồ sơ người dùng" onClose={onClose} side>
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">{initials(user.fullName)}</span>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-xl font-bold text-slate-900">{user.fullName}</h3>
            <p className="truncate font-mono text-sm text-slate-500">{user.email}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
              <Badge tone={locked ? 'admin' : user.status === 'ACTIVE' ? 'student' : 'warning'} dot>
                {locked ? 'BANNED' : STATUS_LABEL[user.status]}
              </Badge>
            </div>
          </div>
        </div>

        {error && <AlertBox message={error} />}
        {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <select value={user.role} disabled={busy} onChange={(e) => void changeRole(e.target.value as UserRole)} aria-label="Đổi vai trò" className={`${inputClass} !w-auto !h-10`}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <Button variant={locked ? 'outline' : 'danger'} disabled={busy} onClick={() => void toggleLock()}>
            {locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {locked ? 'Mở khóa' : 'Khóa tài khoản'}
          </Button>
          <Button disabled={busy} onClick={resetPassword}>
            <KeyRound className="h-4 w-4" /> Reset mật khẩu
          </Button>
        </div>

        {user.role === 'LECTURER' && <LecturerSection />}
        {user.role === 'STUDENT' && <StudentSection />}
      </div>
    </Modal>
  );
};
