'use client';

import { ChevronLeft, ChevronRight, Eye, Lock, LockOpen } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import { Card } from '../ui/Card';
import type { AdminUser, PageMeta, UserRole } from '../../types/admin.types';
import { initials, ROLE_SELECT_CLASS, ROLES, STATUS_LABEL, STATUS_TEXT_CLASS } from './user-style';

interface UsersTableProps {
  users: AdminUser[];
  meta: PageMeta | null;
  busyId: string | null;
  onOpen: (user: AdminUser) => void;
  onRoleChange: (user: AdminUser, role: UserRole) => void;
  onToggleLock: (user: AdminUser) => void;
  onPage: (page: number) => void;
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';

export const UsersTable: React.FC<UsersTableProps> = ({ users, meta, busyId, onOpen, onRoleChange, onToggleLock, onPage }) => (
  <Card className="overflow-hidden p-0">
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
      <h2 className="text-base font-semibold text-slate-900">
        Danh bạ Người dùng &amp; Ủy quyền
        <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">{meta?.total ?? 0} hồ sơ</span>
      </h2>
    </div>
    {users.length === 0 ? (
      <EmptyState message="Không có người dùng khớp bộ lọc." />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className={TH}>Họ &amp; tên</th>
              <th className={TH}>Email FPT</th>
              <th className={TH}>Vai trò (Role)</th>
              <th className={TH}>Trạng thái</th>
              <th className={TH}>Đăng nhập cuối</th>
              <th className={cn(TH, 'text-right')}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const locked = u.status === 'SUSPENDED';
              return (
                <tr key={u.id} className={cn('min-h-[52px] border-b border-slate-100 transition-colors hover:bg-slate-50', locked && 'bg-rose-50/50 hover:bg-rose-50')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{initials(u.fullName)}</span>
                      <span className="text-sm font-semibold text-slate-900">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3">
                    <span className="block min-w-0 truncate font-mono text-xs text-slate-600">{u.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => onRoleChange(u, e.target.value as UserRole)}
                      aria-label={`Vai trò của ${u.fullName}`}
                      className={cn('h-7 cursor-pointer rounded-full border px-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300', ROLE_SELECT_CLASS[u.role])}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', STATUS_TEXT_CLASS[u.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_LABEL[u.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => onOpen(u)} title="Xem hồ sơ" aria-label="Xem hồ sơ" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => onToggleLock(u)}
                        title={locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        aria-label={locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        className={cn('rounded-lg p-2 disabled:opacity-50', locked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600')}
                      >
                        {locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
    {meta && (
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row">
        <span>
          Trang {meta.page} / {Math.max(meta.totalPages, 1)} • {meta.total} bản ghi
        </span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Trang trước" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-semibold text-white">{meta.page}</span>
          <button type="button" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="Trang sau" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )}
  </Card>
);
