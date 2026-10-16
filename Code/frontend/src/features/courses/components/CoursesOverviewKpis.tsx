'use client';

import React from 'react';
import { BookOpen, Users, CheckCircle2, Clock3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { LecturerKpiMetrics } from '../types/course.types';

interface CoursesOverviewKpisProps {
  kpiMetrics: LecturerKpiMetrics;
}

export const CoursesOverviewKpis: React.FC<CoursesOverviewKpisProps> = ({ kpiMetrics }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Khóa học đang dạy */}
      <Card className="bg-white p-5 rounded-2xl border-indigo-100 shadow-2xs hover:shadow-xs transition flex items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            Khóa học đang dạy
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {kpiMetrics.activeCourses}{' '}
            <span className="text-xs font-bold text-slate-400">/ {kpiMetrics.totalCourses} lớp phân công</span>
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-2 truncate">
            <span>● Đang trong kỳ giảng dạy</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
      </Card>

      {/* KPI 2: Tổng sinh viên theo học */}
      <Card className="bg-white p-5 rounded-2xl border-indigo-100 shadow-2xs hover:shadow-xs transition flex items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            Tổng sinh viên theo học
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {kpiMetrics.totalStudents} <span className="text-xs font-bold text-slate-400">sinh viên</span>
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-2 truncate">
            <span>Số sinh viên đã ghi danh</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </Card>

      {/* KPI 3: Tiến độ trung bình */}
      <Card className="bg-white p-5 rounded-2xl border-emerald-100 shadow-2xs hover:shadow-xs transition flex items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            Điểm trung bình
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {kpiMetrics.averageScore === null ? '—' : `${kpiMetrics.averageScore}/10`}
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-2 truncate">
            Điểm từ bài đã chấm
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </Card>

      {/* KPI 4: Bài chờ chấm */}
      <Card className="bg-white p-5 rounded-2xl border-amber-100 shadow-2xs hover:shadow-xs transition flex items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            Bài nộp chờ chấm
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {kpiMetrics.pendingGradingCount ?? '—'}
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-2 truncate">
            <span>Đang chờ xử lý trên hệ thống</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs shrink-0">
          <Clock3 className="w-5 h-5" />
        </div>
      </Card>
    </section>
  );
};
