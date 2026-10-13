'use client';

import React from 'react';
import { Search, Download, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoomDetailToolbarProps {
  filter: 'all' | 'working' | 'submitted';
  setFilter: (f: 'all' | 'working' | 'submitted') => void;
  stationsCount: number;
  workingCount: number;
  submittedCount: number;
  hasStations: boolean;
  onClearStations: () => void;
  onLoadMockStations: () => void;
  onExportCsv: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  viewMode: 'seatmap' | 'grid';
  setViewMode: (v: 'seatmap' | 'grid') => void;
}

export const RoomDetailToolbar: React.FC<RoomDetailToolbarProps> = ({
  filter,
  setFilter,
  stationsCount,
  workingCount,
  submittedCount,
  hasStations,
  onClearStations,
  onLoadMockStations,
  onExportCsv,
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
      {/* Left: Filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Tất cả máy ({stationsCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('working')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filter === 'working'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Đang làm bài ({workingCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('submitted')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filter === 'submitted'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Đã nộp bài ({submittedCount})
        </button>
      </div>

      {/* Right: Search, Export & View switch */}
      <div className="flex flex-wrap items-center gap-2">
        {hasStations ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearStations}
            className="rounded-xl border-slate-300 text-xs text-rose-600 hover:bg-rose-50"
          >
            Xóa dữ liệu màn hình
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMockStations}
            className="rounded-xl border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
            Nạp thí sinh mẫu kiểm thử
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          className="rounded-xl border-slate-300 bg-white text-xs text-slate-700"
        >
          <Download className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
          Xuất biên bản ca thi (CSV)
        </Button>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, MSSV, số máy..."
            className="h-9 rounded-xl bg-white pl-8 text-xs focus-visible:ring-indigo-600"
          />
        </div>

        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('seatmap')}
            title="Chế độ sơ đồ phòng máy"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'seatmap' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Chế độ lưới phẳng"
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
