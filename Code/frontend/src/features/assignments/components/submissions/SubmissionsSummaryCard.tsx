'use client';

import React from 'react';
import { Users, CheckCircle2, Clock, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/formatDate';
import type { Assignment } from '../../types/assignment.types';

interface SubmissionsSummaryCardProps {
  assignment: Assignment | null;
  stats: {
    total: number;
    graded: number;
    pending: number;
    avgScore: string;
  };
}

export const SubmissionsSummaryCard: React.FC<SubmissionsSummaryCardProps> = ({
  assignment,
  stats,
}) => {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-2xs p-6 md:p-8 bg-white">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs font-black bg-indigo-50 text-indigo-700 border-indigo-200">
          {assignment?.course?.code || 'SWD392'}
        </Badge>
        <Badge variant="secondary" className="text-xs font-semibold">
          {assignment?.environment === 'JAVA_JDK' ? 'Java JDK 21' : 'C GCC 11'}
        </Badge>
        <span className="text-xs text-slate-500">
          Hạn nộp: {assignment?.deadline ? formatDateTime(assignment.deadline) : 'Không giới hạn'}
        </span>
      </div>

      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
        Danh Sách Bài Nộp: {assignment?.title || 'Đề thi PE'}
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
        Quản lý toàn bộ bài nộp của sinh viên, theo dõi tiến độ thực thi Docker Sandbox và kết quả chấm điểm AI.
      </p>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-xs font-semibold text-slate-400">Tổng bài nộp</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Users className="size-4 text-indigo-600" />
            <span>{stats.total} bài</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-xs font-semibold text-slate-400">Đã hoàn thành chấm</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{stats.graded} bài</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-xs font-semibold text-slate-400">Chờ chấm / Đang chạy</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Clock className="size-4 text-amber-600" />
            <span>{stats.pending} bài</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-xs font-semibold text-slate-400">Điểm trung bình</div>
          <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-2">
            <Award className="size-4 text-indigo-600" />
            <span>{stats.avgScore}/10</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
