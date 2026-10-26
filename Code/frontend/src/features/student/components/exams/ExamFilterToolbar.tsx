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
  counts: { all: number | null; open: number | null; upcoming: number | null; paused: number | null; ended: number | null };
}

const filterTabs: { key: ExamFilter; label: string; countKey: 'all' | 'open' | 'upcoming' | 'ended' }[] = [
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
    <section aria-label="Bộ lọc và tìm kiếm bài thi" className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      {/* 4-Tab Navigation */}
      <div className="flex border-b border-slate-100 gap-2 overflow-x-auto">
        {filterTabs.map(({ key, label, countKey }) => {
          const isActive = filter === key;
          const count = counts[countKey] ?? 0;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onFilterChange(key)}
              className={`flex items-center gap-2 pb-3 pt-1 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:max-w-md">
          <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên bài thi, mã môn học..."
            aria-label="Tìm kiếm theo tiêu đề bài thi"
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-xs text-slate-500 font-medium shrink-0">Sắp xếp:</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as ExamSort)}
            aria-label="Sắp xếp danh sách bài thi"
            className="h-10 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer transition-all"
          >
            <option value="NEAREST">Thời gian thi gần nhất</option>
            <option value="NEWEST">Mới tạo gần nhất</option>
          </select>
        </div>
      </div>
    </section>
  );
}
