'use client';

import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { adminUserService } from '../../services/admin-user.service';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import type { AdminUser, AdminUserDetails, UpdateUserPayload, UserRole } from '../../types/admin.types';
import { generatePassword } from '../../../../lib/password';
import { TempPasswordModal, type TempCredentials } from './TempPasswordModal';
import { AdminView, LecturerView, StudentView } from './ProfileViews';
import { UserProfileHeader } from './UserProfileHeader';
import { UserPrivilegedActions } from './UserPrivilegedActions';

interface UserProfilePanelProps {
  user: AdminUser;
  onUpdated: (user: AdminUser) => void;
  onPickRole: (role: UserRole) => void;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({ user, onUpdated, onPickRole }) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<TempCredentials | null>(null);
  const [detailedUser, setDetailedUser] = useState<AdminUserDetails | null>(null);

  useEffect(() => {
    let active = true;
    adminUserService.getById(user.id).then((data) => {
      if (active) setDetailedUser(data);
    }).catch((loadError: unknown) => {
      console.error('Không tải được chi tiết người dùng Admin:', loadError);
      if (active) setError(getErrorMessage(loadError));
    });
    return () => { active = false; };
  }, [user.id]);

  const locked = user.status === 'SUSPENDED';

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
    adminUserService.getById(user.id).then(setDetailedUser).catch((loadError: unknown) => {
      console.error('Không tải lại được chi tiết người dùng Admin:', loadError);
      setError(getErrorMessage(loadError));
    });
  };

  const resetPassword = () => {
    if (!window.confirm(`Đặt lại mật khẩu của ${user.fullName}? Mật khẩu cũ sẽ không còn dùng được.`)) return;
    const password = generatePassword();
    void run(async () => {
      await adminUserService.resetPassword(user.id, password);
      setCredentials({ title: 'Mật khẩu đã được đặt lại', fullName: user.fullName, email: user.email, password });
    });
  };

  return (
    <Card className="space-y-6">
      <UserProfileHeader user={user} onPickRole={onPickRole} />

      {error && <AlertBox message={error} />}

      {user.role === 'LECTURER' && (
        <LecturerView user={user} detailedUser={detailedUser ?? undefined} />
      )}
      {user.role === 'STUDENT' && <StudentView user={user} detailedUser={detailedUser ?? undefined} />}
      {user.role === 'ADMIN' && <AdminView />}

      <UserPrivilegedActions
        user={user}
        busy={busy}
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
    </Card>
  );
};
