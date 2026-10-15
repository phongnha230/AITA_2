'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { CLASS_CATALOG, DEPARTMENT_OPTIONS } from '../../mocks/ops.mock';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import type { AdminUser, UpdateUserPayload, UserRole } from '../../types/admin.types';
import { generatePassword } from '../../../../lib/password';
import { ProfileActionModal } from './ProfileActionModal';
import { TempPasswordModal, type TempCredentials } from './TempPasswordModal';
import { AdminView, LecturerView, StudentView } from './ProfileViews';
import { lecturerClasses } from './profileUtils';
import { UserProfileHeader } from './UserProfileHeader';
import { UserPrivilegedActions } from './UserPrivilegedActions';

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
  const [detailedUser, setDetailedUser] = useState<any>(null);

  useEffect(() => {
    let active = true;
    adminUserService.getById(user.id).then((data) => {
      if (active) setDetailedUser(data);
    }).catch(() => {});
    return () => { active = false; };
  }, [user.id]);

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
    adminUserService.getById(user.id).then(setDetailedUser).catch(() => {});
  };

  const assigned = lecturerClasses(user, detailedUser).map((c: any) => c.code);
  const assignedSet = new Set(assigned);
  const classOptions = CLASS_CATALOG.filter((c) => !assignedSet.has(c.code)).map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.title}`,
  }));

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
      <UserProfileHeader user={user} onPickRole={onPickRole} />

      {error && <AlertBox message={error} />}

      {user.role === 'LECTURER' && (
        <LecturerView
          user={user}
          detailedUser={detailedUser}
          onToggleSandbox={(next) =>
            void run(() =>
              patch(
                { sandboxAiEnabled: next },
                next ? 'Đã bật Sandbox chấm AI riêng.' : 'Đã tắt Sandbox chấm AI riêng.'
              )
            )
          }
        />
      )}
      {user.role === 'STUDENT' && <StudentView user={user} detailedUser={detailedUser} />}
      {user.role === 'ADMIN' && <AdminView />}

      <UserPrivilegedActions
        user={user}
        busy={busy}
        onOpenClassDialog={() => setDialog('class')}
        onOpenDeptDialog={() => setDialog('dept')}
        onToggleHead={() =>
          void run(() =>
            patch(
              { subtitle: isHead ? 'Lecturer' : 'Trưởng bộ môn' },
              isHead
                ? `Đã gỡ chức Trưởng bộ môn của ${user.fullName}.`
                : `Đã gán ${user.fullName} làm Trưởng bộ môn.`
            )
          )
        }
        onChangeRole={(role) =>
          void run(() => patch({ role }, `Đã đổi vai trò thành ${role}.`))
        }
        onToggleLock={() =>
          void run(() =>
            patch(
              { status: locked ? 'ACTIVE' : 'SUSPENDED' },
              locked ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.'
            )
          )
        }
        onResetPassword={resetPassword}
      />

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
