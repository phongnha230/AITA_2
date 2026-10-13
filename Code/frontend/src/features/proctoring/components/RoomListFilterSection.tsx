'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ExamRoom, RoomStatus } from '../types/proctoring.types';

interface RoomListFilterSectionProps {
  filterStatus: 'ALL' | RoomStatus;
  setFilterStatus: (status: 'ALL' | RoomStatus) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  rooms: ExamRoom[];
}

export const RoomListFilterSection: React.FC<RoomListFilterSectionProps> = ({
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  rooms,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
      {/* Tab filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Tất cả phòng ({rooms.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('LIVE')}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filterStatus === 'LIVE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Đang diễn ra (LIVE) ({rooms.filter((r) => r.status === 'LIVE').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('UPCOMING')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filterStatus === 'UPCOMING'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Sắp diễn ra ({rooms.filter((r) => r.status === 'UPCOMING').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('COMPLETED')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
            filterStatus === 'COMPLETED'
              ? 'bg-slate-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Đã kết thúc ({rooms.filter((r) => r.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo phòng, môn, giám thị..."
          className="h-10 rounded-xl bg-white pl-9 text-xs focus-visible:ring-indigo-600"
        />
      </div>
    </div>
  );
};
