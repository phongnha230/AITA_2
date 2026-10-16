'use client';

import React from 'react';
import {
  BookOpen,
  Search,
  Plus,
} from 'lucide-react';
import { Course, LecturerKpiMetrics, LecturerDashboardRecentSubmission } from '../types/course.types';
import { CourseCard } from './CourseCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoursesOverviewKpis } from './CoursesOverviewKpis';
import { CoursesRecentSubmissions } from './CoursesRecentSubmissions';

interface CoursesOverviewProps {
  courses: Course[];
  kpiMetrics: LecturerKpiMetrics;
  dashboardError?: string | null;
  recentSubmissions?: LecturerDashboardRecentSubmission[];
  semesters: string[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedSemester: string;
  onSemesterChange: (val: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'ARCHIVED';
  onStatusFilterChange: (val: 'ALL' | 'ACTIVE' | 'ARCHIVED') => void;
  onSelectCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onOpenCreateModal: () => void;
}

export const CoursesOverview: React.FC<CoursesOverviewProps> = ({
  courses,
  kpiMetrics,
  dashboardError,
  recentSubmissions,
  semesters,
  searchQuery,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectCourse,
  onEditCourse,
  onDeleteCourse,
  onOpenCreateModal,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-full">
      {/* 1. Thanh KPI Metrics */}
      <CoursesOverviewKpis kpiMetrics={kpiMetrics} />
      {dashboardError && (
        <Card role="alert" className="border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {dashboardError}
        </Card>
      )}

      {/* Filter and Title Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Danh sách Khóa học phụ trách</h2>
          <p className="text-xs text-slate-500">
            Học kỳ {selectedSemester === 'All' ? 'Tất cả' : selectedSemester} • {courses.length} lớp hiển thị
          </p>
        </div>

        {/* Search & Select Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm tên môn hoặc mã môn..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 bg-white border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus-visible:ring-indigo-500 shadow-2xs"
            />
          </div>

          <select
            aria-label="Chọn học kỳ"
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="h-9 bg-white border border-slate-200 px-3 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
          >
            <option value="All">Tất cả học kỳ</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          <select
            aria-label="Lọc trạng thái khóa học"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="h-9 bg-white border border-slate-200 px-3 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang mở (Active)</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>

          <Button
            onClick={onOpenCreateModal}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tạo Khóa Học</span>
          </Button>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelectCourse={onSelectCourse}
              onEditCourse={onEditCourse}
              onDeleteCourse={onDeleteCourse}
            />
          ))}
        </section>
      ) : (
        <Card className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy khóa học phù hợp</h4>
          <p className="text-xs text-slate-400">
            Hãy thử tìm kiếm với từ khóa khác hoặc tạo mới khóa học.
          </p>
          <Button
            onClick={onOpenCreateModal}
            className="mt-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Khóa Học Ngay</span>
          </Button>
        </Card>
      )}

      {/* Widget: Bài nộp gần đây */}
      {recentSubmissions && recentSubmissions.length > 0 && (
        <CoursesRecentSubmissions recentSubmissions={recentSubmissions} />
      )}
    </div>
  );
};
