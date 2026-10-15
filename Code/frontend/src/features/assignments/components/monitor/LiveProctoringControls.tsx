'use client';

import React from 'react';
import { Search, Download, LayoutGrid, List, Hourglass, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LiveProctoringControlsProps {
  filter: 'all' | 'working' | 'submitted';
  onFilterChange: (filter: 'all' | 'working' | 'submitted') => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalCount: number;
  workingCount: number;
  submittedCount: number;
  onExportCsv: () => void;
}

export const LiveProctoringControls: React.FC<LiveProctoringControlsProps> = ({
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalCount,
  workingCount,
  submittedCount,
  onExportCsv,
}) => {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-2xs p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className={`h-8 px-3.5 rounded-lg text-xs font-bold transition ${
            filter === 'all'
              ? 'bg-white hover:bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tất cả ({totalCount})
        </Button>

        <Button
          variant={filter === 'working' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('working')}
          className={`h-8 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            filter === 'working'
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hourglass className="w-3.5 h-3.5" />
          <span>Đang làm bài ({workingCount})</span>
        </Button>

        <Button
          variant={filter === 'submitted' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('submitted')}
          className={`h-8 px-3.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            filter === 'submitted'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Đã nộp bài ({submittedCount})</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          title="Xuất biên bản danh sách phòng thi ra CSV"
          className="h-9 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xuất biên bản ca thi (CSV)</span>
        </Button>

        <div className="relative flex-1 sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, MSSV, số máy (PC-01)..."
            className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-0.5">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Chế độ sơ đồ lưới máy thi (2 dãy bàn)"
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            title="Chế độ bảng danh sách"
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};
