'use client';

import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, UserCog, UserPlus } from 'lucide-react';
import { downloadFile, toCsv } from '../../../../lib/download';
import { getErrorMessage } from '../../../../lib/errors';
import { useToast } from '../ui/Toast';
import { ImportUsersModal } from './ImportUsersModal';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { adminUserService } from '../../services/admin-user.service';
import { Button } from '../ui/Button';
import type { AdminUser, UserRole } from '../../types/admin.types';
import { UserFilters } from './UserFilters';
import { UserFormModal } from './UserFormModal';
import { UserProfilePanel } from './UserProfilePanel';
import { UsersKpiRow } from './UsersKpiRow';
import { UsersTable } from './UsersTable';

export const UsersPage: React.FC = () => {
  const { query, users, meta, stats, loading, error, reload, updateFilter, replaceUser } = useAdminUsers();
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const toast = useToast();

  const exportCsv = async () => {
    try {
      const all = await adminUserService.listAll({ role: query.role, status: query.status, search: query.search });
      downloadFile(
        'aita-users.csv',
        toCsv(all.map((u) => ({ code: u.userCode, fullName: u.fullName, email: u.email, role: u.role, status: u.status, department: u.department }))),
        'text/csv;charset=utf-8',
      );
      toast.success(`Đã xuất ${all.length.toLocaleString('en-US')} hồ sơ ra CSV.`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không xuất được báo cáo.'));
    }
  };

  // Mirror the design: first row is pre-selected so the profile panel is populated.
  useEffect(() => {
    if (!selected && users.length > 0) setSelected(users[0]);
  }, [users, selected]);

  const apply = (updated: AdminUser) => {
    replaceUser(updated);
    setSelected((cur) => (cur?.id === updated.id ? updated : cur));
  };

  const mutate = async (user: AdminUser, patch: Partial<Pick<AdminUser, 'role' | 'status'>>) => {
    setBusyId(user.id);
    setActionError(null);
    try {
      apply(await adminUserService.update(user.id, patch));
      toast.success(patch.role ? `Đã đổi vai trò ${user.fullName} thành ${patch.role}.` : patch.status === 'SUSPENDED' ? `Đã khóa tài khoản ${user.fullName}.` : `Đã mở khóa tài khoản ${user.fullName}.`);
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const pickRole = (role: UserRole) => {
    const match = users.find((u) => u.role === role);
    if (match) setSelected(match);
    else {
      setSelected(null);
      updateFilter({ role });
    }
  };

  return (
    <>
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0 space-y-1.5">
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UserCog className="h-5 w-5" /></span>
            Quản lý Người dùng &amp; Phân quyền RBAC
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">Kiểm soát danh tính số, vai trò truy cập thực tế theo bộ môn và cấu hình Sandbox cho toàn cơ sở FPT Education.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => void exportCsv()}><Download className="h-4 w-4" /> Xuất báo cáo</Button>
          <Button className="text-blue-700" onClick={() => setImporting(true)}><FileSpreadsheet className="h-4 w-4" /> Nạp danh sách từ FAP Excel</Button>
          <Button variant="primary" onClick={() => setCreating(true)}><UserPlus className="h-4 w-4" /> + Tạo tài khoản mới</Button>
        </div>
      </header>

      <UsersKpiRow stats={stats} />
      <UserFilters query={query} stats={stats} onChange={updateFilter} />
      {actionError && <AlertBox message={actionError} />}
      {error ? (
        <AlertBox message={error} onRetry={reload} />
      ) : loading && users.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <UsersTable
          users={users}
          meta={meta}
          selectedId={selected?.id}
          busyId={busyId}
          onSelect={setSelected}
          onRoleChange={(u, role) => void mutate(u, { role })}
          onToggleLock={(u) => void mutate(u, { status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' })}
          onPage={(page) => updateFilter({ page })}
        />
      )}
      {selected && <UserProfilePanel user={selected} onUpdated={apply} onPickRole={pickRole} />}
      <UserFormModal open={creating} onClose={() => setCreating(false)} onCreated={() => { toast.success('Đã tạo tài khoản mới.'); void reload(); }} />
      <ImportUsersModal
        open={importing}
        onClose={() => setImporting(false)}
        onImported={({ created, skipped }) => {
          toast.success(`Đã nạp ${created} tài khoản${skipped ? `, bỏ qua ${skipped} dòng (trùng email/không hợp lệ)` : ''}.`);
          void reload();
        }}
      />
    </>
  );
};
