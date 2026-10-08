'use client';

import { useState } from 'react';
import { ArrowLeftRight, ClipboardCheck, KeyRound, Lock, LockOpen, Medal } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { CLASS_CATALOG, DEPARTMENT_OPTIONS } from '../../mocks/ops.mock';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { inputClass } from '../ui/FormField';
import { useToast } from '../ui/Toast';
import type { AdminUser, UpdateUserPayload, UserRole } from '../../types/admin.types';
import { generatePassword } from '../../../../lib/password';
import { ProfileActionModal } from './ProfileActionModal';
import { TempPasswordModal, type TempCredentials } from './TempPasswordModal';
import { AdminView, LecturerView, lecturerClasses, StudentView } from './ProfileViews';
import { initials, ROLE_TONE, ROLES } from './user-style';

interface UserProfilePanelProps {
  user: AdminUser;
  onUpdated: (user: AdminUser) => void;
  onPickRole: (role: UserRole) => void;
}

type Dialog = 'class' | 'dept' | null;

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ user, onUpdated, onPickRole }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [credentials, setCredentials] = useState<TempCredentials | null>(null);

  const locked = user.status === 'SUSPENDED';
  const isHead = user.subtitle === 'Trưởng bộ môn';

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const patch = async (payload: UpdateUserPayload, successMessage: string) => {
    onUpdated(await adminUserService.update(user.id, payload));
    toast.success(successMessage);
  };

  const assigned = lecturerClasses(user).map((c) => c.code);
  const classOptions = CLASS_CATALOG.filter((c) => !assigned.includes(c.code)).map((c) => ({ value: c.code, label: `${c.code} — ${c.title}` }));

  const resetPassword = () => {
    if (!window.confirm(`Đặt lại mật khẩu của ${user.fullName}? Mật khẩu cũ sẽ không còn dùng được.`)) return;
    const password = generatePassword();
    void run(async () => {
      await adminUserService.resetPassword(user.id, password);
      onUpdated({ ...user, mustChangePassword: true });
      setCredentials({ title: 'Mật khẩu đã được đặt lại', fullName: user.fullName, email: user.email, password });
    });
  };

  return (
    <Card className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Chi tiết Hồ sơ &amp; Phân quyền RBAC</h2>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['LECTURER', 'STUDENT'] as const).map((r) => (
            <button key={r} type="button" onClick={() => onPickRole(r)} className={cn('rounded-md px-3 py-1 text-xs font-semibold', user.role === r ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900')}>
              {r === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-blue-50/60 p-5 sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">{initials(user.fullName)}</span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">{user.fullName}</h3>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-600">
            <span className="font-mono">{user.role === 'LECTURER' ? 'MSGV' : 'MSSV'}: {user.userCode ?? '—'}</span><span>•</span>
            <span>{user.department ?? '—'}</span><span>•</span><span className="font-mono text-emerald-700">{user.email}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{isHead && <Badge tone="warning">Trưởng bộ môn</Badge>}{user.mustChangePassword && <Badge tone="warning">Chờ đổi mật khẩu</Badge>}<Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>{locked && <Badge tone="admin" dot>BANNED</Badge>}</div>
      </div>

      {error && <AlertBox message={error} />}

      {user.role === 'LECTURER' && (
        <LecturerView user={user} onToggleSandbox={(next) => void run(() => patch({ sandboxAiEnabled: next }, next ? 'Đã bật Sandbox chấm AI riêng.' : 'Đã tắt Sandbox chấm AI riêng.'))} />
      )}
      {user.role === 'STUDENT' && <StudentView />}
      {user.role === 'ADMIN' && <AdminView />}

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Hành động quản trị đặc quyền</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={busy || user.role !== 'LECTURER'} onClick={() => setDialog('class')}><ClipboardCheck className="h-4 w-4 text-blue-600" /> Phân công thêm lớp</Button>
          <Button disabled={busy || user.role === 'ADMIN'} onClick={() => setDialog('dept')}><ArrowLeftRight className="h-4 w-4" /> Đổi bộ môn</Button>
          <Button
            className="bg-blue-50 text-blue-700"
            disabled={busy || user.role !== 'LECTURER'}
            onClick={() => void run(() => patch({ subtitle: isHead ? 'Lecturer' : 'Trưởng bộ môn' }, isHead ? `Đã gỡ chức Trưởng bộ môn của ${user.fullName}.` : `Đã gán ${user.fullName} làm Trưởng bộ môn.`))}
          >
            <Medal className="h-4 w-4" /> {isHead ? 'Gỡ Trưởng bộ môn' : 'Gán Trưởng bộ môn'}
          </Button>
          <select
            value={user.role}
            disabled={busy || user.role === 'ADMIN'}
            onChange={(e) => void run(() => patch({ role: e.target.value as UserRole }, `Đã đổi vai trò thành ${e.target.value}.`))}
            aria-label="Đổi vai trò"
            className={`${inputClass} !h-10 !w-auto`}
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <Button variant={locked ? 'outline' : 'danger'} disabled={busy || user.role === 'ADMIN'} onClick={() => void run(() => patch({ status: locked ? 'ACTIVE' : 'SUSPENDED' }, locked ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.'))}>
            {locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />} {locked ? 'Mở khóa' : 'Khóa tài khoản'}
          </Button>
          <Button disabled={busy} onClick={resetPassword}><KeyRound className="h-4 w-4" /> Reset mật khẩu</Button>
        </div>
      </div>

      <TempPasswordModal credentials={credentials} onClose={() => setCredentials(null)} />
      <ProfileActionModal
        open={dialog === 'class'}
        title="Phân công thêm lớp"
        label="Chọn lớp học"
        options={classOptions}
        confirmLabel="Phân công"
        onClose={() => setDialog(null)}
        onConfirm={(code) => patch({ assignedClasses: [...assigned, code] }, `Đã phân công lớp ${code}.`)}
      />
      <ProfileActionModal
        open={dialog === 'dept'}
        title="Đổi bộ môn"
        label="Bộ môn mới"
        options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))}
        confirmLabel="Lưu thay đổi"
        onClose={() => setDialog(null)}
        onConfirm={(department) => patch({ department }, `Đã chuyển sang bộ môn ${department}.`)}
      />
    </Card>
  );
};
