'use client';

import { useState } from 'react';
import { Upload, UserPlus } from 'lucide-react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { adminUserService } from '../../services/admin-user.service';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import type { AdminUser, UserRole } from '../../types/admin.types';
import { UserDetailDrawer } from './UserDetailDrawer';
import { UserFilters } from './UserFilters';
import { UserFormModal } from './UserFormModal';
import { UsersTable } from './UsersTable';

export const UsersPage: React.FC = () => {
  const { query, users, meta, loading, error, reload, updateFilter, replaceUser } = useAdminUsers();
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const mutate = async (user: AdminUser, patch: Partial<Pick<AdminUser, 'role' | 'status'>>) => {
    setBusyId(user.id);
    setActionError(null);
    try {
      replaceUser(await adminUserService.update(user.id, patch));
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Quản lý Người dùng & Phân quyền RBAC"
        description="Kiểm soát danh tính số, vai trò truy cập thực tế theo bộ môn và cấu hình Sandbox cho toàn cơ sở FPT Education."
        actions={
          <>
            <Button disabled title="Chưa có API import Excel">
              <Upload className="h-4 w-4" /> Import Excel
            </Button>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <UserPlus className="h-4 w-4" /> Tạo tài khoản mới
            </Button>
          </>
        }
      />
      <UserFilters query={query} onChange={updateFilter} />
      {actionError && <AlertBox message={actionError} />}
      {error ? (
        <AlertBox message={error} onRetry={reload} />
      ) : loading && users.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <UsersTable
          users={users}
          meta={meta}
          busyId={busyId}
          onOpen={setSelected}
          onRoleChange={(u, role: UserRole) => void mutate(u, { role })}
          onToggleLock={(u) => void mutate(u, { status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' })}
          onPage={(page) => updateFilter({ page })}
        />
      )}
      <UserFormModal open={creating} onClose={() => setCreating(false)} onCreated={reload} />
      <UserDetailDrawer
        user={selected}
        onClose={() => setSelected(null)}
        onUpdated={(u) => {
          replaceUser(u);
          setSelected(u);
        }}
      />
    </>
  );
};
