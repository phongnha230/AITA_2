'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  FileCode,
  Radio,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { CoursesOverviewKpis } from './CoursesOverviewKpis';
import { LecturerChartsSection } from './LecturerChartsSection';
import { CoursesRecentSubmissions } from './CoursesRecentSubmissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export const LecturerDashboardOverview: React.FC = () => {
  const {
    courses,
    dashboardData,
    kpiMetrics,
    recentSubmissions,
    error,
    loading,
  } = useCourses();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-full">
      {/* 1. Header Bàn làm việc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              <span className="size-1.5 rounded-full bg-indigo-600" /> Bàn làm việc
            </span>
            <span className="text-xs font-medium text-slate-500">Số liệu giảng dạy &amp; khảo thí thời gian thực</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Tổng quan Hoạt động Giảng dạy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ nộp bài, phân phổ điểm và quy mô sinh viên trên toàn bộ các lớp phụ trách.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={ROUTES.LECTURER.COURSES}>
            <Button
              variant="outline"
              className="h-9 px-3.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs flex items-center gap-1.5"
            >
              <BookOpen className="size-4 text-indigo-600" />
              <span>Quản lý Khóa học</span>
            </Button>
          </Link>
          <Link href={ROUTES.LECTURER.EXAM_BANK_CREATE}>
            <Button className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
              <Plus className="size-4" />
              <span>Tạo Đề Thi PE</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card role="alert" className="border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </Card>
      )}

      {/* 2. Thanh 4 chỉ số KPI với Sparkline sóng xu hướng */}
      <CoursesOverviewKpis kpiMetrics={kpiMetrics} />

      {/* 3. Khối Sơ đồ Trực quan Giảng viên (Biểu đồ Cột & Biểu đồ Tròn) */}
      <LecturerChartsSection
        courses={courses}
        kpiMetrics={kpiMetrics}
        recentSubmissions={recentSubmissions}
        coursesOverview={dashboardData?.coursesOverview}
      />

      {/* 4. Thẻ lối tắt tiện ích nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <Link
          href={ROUTES.LECTURER.COURSES}
          className="group p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Quản lý Khóa học ({courses.length})
              </p>
              <p className="text-[11px] text-slate-500">Danh sách lớp, sinh viên &amp; bài tập</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href={ROUTES.LECTURER.EXAM_BANK}
          className="group p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCode className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                Ngân hàng Đề &amp; Testcase
              </p>
              <p className="text-[11px] text-slate-500">Kho đề thi và bộ testcases tự động</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href={ROUTES.LECTURER.LIVE_PROCTORING}
          className="group p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-indigo-200 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Quản lý Ca thi Trực tiếp
              </p>
              <p className="text-[11px] text-slate-500">Giám sát làm bài &amp; kết nối máy thi</p>
            </div>
          </div>
          <ArrowRight className="size-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 5. Hoạt động nộp bài gần đây */}
      {recentSubmissions && recentSubmissions.length > 0 && (
        <CoursesRecentSubmissions recentSubmissions={recentSubmissions} />
      )}
    </div>
  );
};
