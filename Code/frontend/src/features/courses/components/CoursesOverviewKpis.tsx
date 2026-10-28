'use client';

import React from 'react';
import { BookOpen, Users, CheckCircle2, Clock3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Sparkline } from '@/features/admin/components/ui/Sparkline';
import type { LecturerKpiMetrics } from '../types/course.types';

interface CoursesOverviewKpisProps {
  kpiMetrics: LecturerKpiMetrics;
}

export const CoursesOverviewKpis: React.FC<CoursesOverviewKpisProps> = ({ kpiMetrics }) => {
  const activePercent =
    kpiMetrics.totalCourses > 0
      ? Math.round((kpiMetrics.activeCourses / kpiMetrics.totalCourses) * 100)
      : 100;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Khóa học đang dạy */}
      <Card className="bg-white p-5 rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Khóa học phụ trách
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {kpiMetrics.activeCourses}{' '}
              <span className="text-xs font-bold text-slate-400">/ {kpiMetrics.totalCourses} lớp</span>
            </h3>
          </div>
          <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="size-5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="w-24 h-7">
            <Sparkline
              values={[1, 2, 2, 3, kpiMetrics.activeCourses || 3]}
              color="#4f46e5"
              height={28}
              width={96}
            />
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            {activePercent}% Đang giảng dạy
          </span>
        </div>
      </Card>

      {/* KPI 2: Tổng sinh viên theo học */}
      <Card className="bg-white p-5 rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Tổng sinh viên ghi danh
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {kpiMetrics.totalStudents} <span className="text-xs font-bold text-slate-400">thí sinh</span>
            </h3>
          </div>
          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Users className="size-5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="w-24 h-7">
            <Sparkline
              values={[3, 5, 8, 10, kpiMetrics.totalStudents || 12]}
              color="#2563eb"
              height={28}
              width={96}
            />
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            Đồng bộ từ FAP
          </span>
        </div>
      </Card>

      {/* KPI 3: Điểm trung bình */}
      <Card className="bg-white p-5 rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Điểm trung bình toàn khóa
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {kpiMetrics.averageScore === null ? '—' : `${kpiMetrics.averageScore}/10`}
            </h3>
          </div>
          <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="w-24 h-7">
            <Sparkline
              values={[6.2, 6.8, 7.1, 7.5, kpiMetrics.averageScore || 7.8]}
              color="#10b981"
              height={28}
              width={96}
            />
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {kpiMetrics.averageScore && kpiMetrics.averageScore >= 7.0 ? 'Học lực Khá-Giỏi' : 'Đạt chuẩn'}
          </span>
        </div>
      </Card>

      {/* KPI 4: Bài nộp chờ chấm */}
      <Card className="bg-white p-5 rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
              Bài nộp chờ duyệt
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {kpiMetrics.pendingGradingCount ?? 0} <span className="text-xs font-bold text-slate-400">bài</span>
            </h3>
          </div>
          <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Clock3 className="size-5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="w-24 h-7">
            <Sparkline
              values={[1, 3, 2, 4, kpiMetrics.pendingGradingCount || 0]}
              color="#f59e0b"
              height={28}
              width={96}
            />
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              kpiMetrics.pendingGradingCount && kpiMetrics.pendingGradingCount > 0
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-100'
            }`}
          >
            {kpiMetrics.pendingGradingCount && kpiMetrics.pendingGradingCount > 0
              ? 'Cần xử lý'
              : 'Đã chấm hết'}
          </span>
        </div>
      </Card>
    </section>
  );
};
