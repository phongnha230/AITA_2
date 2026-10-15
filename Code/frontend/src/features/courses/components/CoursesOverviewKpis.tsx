'use client';

import React from 'react';
import { BookOpen, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14 SV so với kỳ trước</span>
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
            Tiến độ trung bình
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {kpiMetrics.avgCompletionRate}%
          </h3>
          <div className="w-28 sm:w-32 mt-2.5">
            <Progress value={kpiMetrics.avgCompletionRate} className="h-1.5 bg-slate-100 [&>div]:bg-emerald-500" />
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </Card>

      {/* KPI 4: Hoạt động trong 24h */}
      <Card className="bg-white p-5 rounded-2xl border-amber-100 shadow-2xs hover:shadow-xs transition flex items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
            Hoạt động trong 24h
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {kpiMetrics.active24hCount}{' '}
            <span className="text-xs font-bold text-slate-400">/ {kpiMetrics.totalStudents} online</span>
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>90% SV active</span>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-xs shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </Card>
    </section>
  );
};
