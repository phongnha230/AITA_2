'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { Card } from '../ui/Card';
import type { UserQuery, UserRole, UserStats, UserStatus } from '../../types/admin.types';

interface UserFiltersProps {
  query: UserQuery;
  stats: UserStats | null;
  onChange: (patch: Partial<UserQuery>) => void;
}

interface Option<T> {
  value?: T;
  label: string;
}

const Segment = <T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: Option<T>[];
  value?: T;
  onSelect: (v?: T) => void;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          onClick={() => onSelect(o.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-semibold transition-colors',
            o.value === value ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

export const UserFilters: React.FC<UserFiltersProps> = ({ query, stats, onChange }) => {
  const [text, setText] = useState(query.search ?? '');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => text !== (query.search ?? '') && onChange({ search: text || undefined }), 350);
    return () => clearTimeout(t);
  }, [text, query.search, onChange]);

  const roles: Option<UserRole>[] = [
    { label: 'Tất cả' },
    { value: 'LECTURER', label: `Giảng viên${stats ? ` (${stats.lecturers})` : ''}` },
    { value: 'STUDENT', label: 'Sinh viên' },
    { value: 'ADMIN', label: 'Admin' },
  ];
  const statuses: Option<UserStatus>[] = [
    { label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'SUSPENDED', label: `Bị khóa${stats ? ` (${stats.suspended})` : ''}` },
    { value: 'PENDING_ACTIVATION', label: 'Chờ xác thực' },
  ];

  return (
    <Card className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={searchRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tìm theo tên, email hoặc mã số..."
          className="h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-20 text-sm focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-blue-600/15"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">Nhấn ⌘K</kbd>
      </div>
      <Segment label="Vai trò:" options={roles} value={query.role} onSelect={(role) => onChange({ role })} />
      <Segment label="Trạng thái:" options={statuses} value={query.status} onSelect={(status) => onChange({ status })} />
    </Card>
  );
};
