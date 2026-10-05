'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { Card } from '../ui/Card';
import type { UserQuery, UserRole, UserStatus } from '../../types/admin.types';

interface UserFiltersProps {
  query: UserQuery;
  onChange: (patch: Partial<UserQuery>) => void;
}

const ROLE_OPTIONS: { value?: UserRole; label: string }[] = [
  { label: 'Tất cả' },
  { value: 'LECTURER', label: 'Giảng viên' },
  { value: 'STUDENT', label: 'Sinh viên' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS: { value?: UserStatus; label: string }[] = [
  { label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'SUSPENDED', label: 'Bị khóa' },
  { value: 'PENDING_ACTIVATION', label: 'Chờ xác thực' },
];

const Segment = <T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { value?: T; label: string }[];
  value?: T;
  onSelect: (v?: T) => void;
}) => (
  <div className="flex items-center gap-2">
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

export const UserFilters: React.FC<UserFiltersProps> = ({ query, onChange }) => {
  const [text, setText] = useState(query.search ?? '');

  useEffect(() => {
    const t = setTimeout(() => text !== (query.search ?? '') && onChange({ search: text || undefined }), 350);
    return () => clearTimeout(t);
  }, [text, query.search, onChange]);

  return (
    <Card className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tìm theo tên hoặc email FPT..."
          className="h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-blue-600/15"
        />
      </div>
      <Segment label="Vai trò:" options={ROLE_OPTIONS} value={query.role} onSelect={(role) => onChange({ role })} />
      <Segment label="Trạng thái:" options={STATUS_OPTIONS} value={query.status} onSelect={(status) => onChange({ status })} />
    </Card>
  );
};
