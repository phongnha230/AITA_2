'use client';

import { Search } from 'lucide-react';
import type { ExamFilter, ExamSort } from '../../hooks/useStudentExams';

interface ExamFilterToolbarProps {
  filter: ExamFilter;
  onFilterChange: (filter: ExamFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  sort: ExamSort;
  onSortChange: (sort: ExamSort) => void;
  counts: { all: number | null; open: number | null; upcoming: number | null; ended: number | null };
}

const filterOptions: { key: ExamFilter; label: string; countKey: keyof ExamFilterToolbarProps['counts'] }[] = [
  { key: 'ALL', label: 'Tất cả', countKey: 'all' },
  { key: 'OPEN', label: 'Đang mở', countKey: 'open' },
  { key: 'UPCOMING', label: 'Sắp tới', countKey: 'upcoming' },
  { key: 'ENDED', label: 'Đã kết thúc', countKey: 'ended' },
];

export function ExamFilterToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  counts,
}: ExamFilterToolbarProps) {
  return (
    <section aria-label="Lọc và tìm kiếm bài thi" className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated">
      <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
        {filterOptions.map(({ key, label, countKey }) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => onFilterChange(key)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              filter === key
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {label}
            <span
              className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {counts[countKey] ?? '--'}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 shadow-inner transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="sr-only">Tìm kiếm bài thi</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm kiếm theo tiêu đề bài thi..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 shadow-inner transition-all focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
          <span className="shrink-0 text-xs font-medium text-slate-500">Sắp xếp:</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as ExamSort)}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="NEAREST">Thời gian gần nhất</option>
            <option value="NEWEST">Mới nhất</option>
          </select>
        </label>
      </div>
    </section>
  );
}
