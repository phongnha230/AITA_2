'use client';

import { BadgeCheck, ChevronLeft, ChevronRight, Eye, ListChecks, Lock, LockOpen, ShieldCheck } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import { Card } from '../ui/Card';
import type { AdminUser, PageMeta, UserRole } from '../../types/admin.types';
import { initials, ROLE_SELECT_CLASS, ROLES, STATUS_LABEL, STATUS_TEXT_CLASS } from './user-style';

interface UsersTableProps {
  users: AdminUser[];
  meta: PageMeta | null;
  selectedId?: string | null;
  busyId: string | null;
  onSelect: (user: AdminUser) => void;
  onRoleChange: (user: AdminUser, role: UserRole) => void;
  onToggleLock: (user: AdminUser) => void;
  onPage: (page: number) => void;
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';

const codeColor = (u: AdminUser) =>
  u.status === 'SUSPENDED' || u.role === 'ADMIN' ? 'text-rose-600' : u.role === 'LECTURER' ? 'text-blue-600' : 'text-emerald-600';

const pageList = (page: number, total: number): (number | '…')[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const head = [1, 2, 3].filter((p) => p <= total);
  if (page > 3 && page < total) return [1, '…', page, '…', total];
  return [...head, '…', total];
};

export const UsersTable: React.FC<UsersTableProps> = ({ users, meta, selectedId, busyId, onSelect, onRoleChange, onToggleLock, onPage }) => (
  <Card className="overflow-hidden p-0">
    <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        Danh bạ Người dùng &amp; Ủy quyền
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">{(meta?.total ?? 0).toLocaleString('en-US')} hồ sơ</span>
      </h2>
      <p className="flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" /> Đồng bộ FAP lúc 10:45 AM</p>
    </div>
    {users.length === 0 ? (
      <EmptyState message="Không có người dùng khớp bộ lọc." />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className={TH}>STT</th>
              <th className={TH}>Mã số</th>
              <th className={TH}>Họ &amp; tên</th>
              <th className={TH}>Email FPT</th>
              <th className={TH}>Vai trò (Role)</th>
              <th className={TH}>Lớp / Bộ môn</th>
              <th className={TH}>Trạng thái</th>
              <th className={cn(TH, 'text-right')}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const locked = u.status === 'SUSPENDED';
              const isAdmin = u.role === 'ADMIN';
              return (
                <tr
                  key={u.id}
                  onClick={() => onSelect(u)}
                  className={cn(
                    'cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50',
                    locked && 'bg-rose-50/60 hover:bg-rose-50',
                    selectedId === u.id && !locked && 'bg-blue-50/50',
                  )}
                >
                  <td className="px-4 py-4 font-mono text-xs text-slate-400">{String(((meta?.page ?? 1) - 1) * (meta?.limit ?? users.length) + i + 1).padStart(2, '0')}</td>
                  <td className={cn('px-4 py-4 font-mono text-xs font-bold', codeColor(u))}>{u.userCode ?? '—'}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', u.role === 'STUDENT' && !locked ? 'bg-emerald-100 text-emerald-700' : locked ? 'bg-rose-100 text-rose-700' : u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700')}>
                        {initials(u.fullName)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{u.fullName}</p>
                        {u.subtitle && <p className={cn('text-[11px]', locked ? 'font-medium text-rose-600' : 'text-slate-500')}>{u.subtitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-4"><span className="block min-w-0 truncate font-mono text-xs text-slate-600">{u.email}</span></td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.role}
                      disabled={busyId === u.id}
                      onChange={(e) => onRoleChange(u, e.target.value as UserRole)}
                      aria-label={`Vai trò của ${u.fullName}`}
                      className={cn('h-7 cursor-pointer rounded-full border px-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300', ROLE_SELECT_CLASS[u.role])}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4"><p className="text-sm text-slate-800">{u.department ?? '—'}</p>{u.departmentNote && <p className="text-[11px] text-slate-500">{u.departmentNote}</p>}</td>
                  <td className="px-4 py-4">
                    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', STATUS_TEXT_CLASS[u.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {locked ? 'Locked' : u.status === 'ACTIVE' ? 'Active' : STATUS_LABEL[u.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => onSelect(u)} title="Xem hồ sơ" aria-label="Xem hồ sơ" className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button>
                      {isAdmin ? (
                        <span className="rounded-lg p-2 text-slate-400" title="Tài khoản quản trị được bảo vệ"><BadgeCheck className="h-4 w-4" /></span>
                      ) : (
                        <>
                          <button type="button" onClick={() => onSelect(u)} title="Phân quyền" aria-label="Phân quyền" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><ListChecks className="h-4 w-4" /></button>
                          <button
                            type="button"
                            disabled={busyId === u.id}
                            onClick={() => onToggleLock(u)}
                            title={locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            aria-label={locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            className={cn('rounded-lg p-2 disabled:opacity-50', locked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600')}
                          >
                            {locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>
                        </>
                      )}
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
          Hiển thị {users.length ? (meta.page - 1) * meta.limit + 1 : 0} - {(meta.page - 1) * meta.limit + users.length} trong số {meta.total.toLocaleString('en-US')} bản ghi
        </span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Trang trước" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          {pageList(meta.page, meta.totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1">…</span>
            ) : (
              <button key={p} type="button" onClick={() => onPage(p)} className={cn('h-8 min-w-8 rounded-lg px-2 font-semibold', p === meta.page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100')}>{p}</button>
            ),
          )}
          <button type="button" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="Trang sau" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    )}
  </Card>
);
