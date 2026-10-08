'use client';

import React from 'react';
import {
  BookOpen,
  Users,
  CheckCircle2,
  TrendingUp,
  Search,
  Plus,
} from 'lucide-react';
import { Course, LecturerKpiMetrics } from '../types/course.types';
import { CourseCard } from './CourseCard';

interface CoursesOverviewProps {
  courses: Course[];
  kpiMetrics: LecturerKpiMetrics;
  semesters: string[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedSemester: string;
  onSemesterChange: (val: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'ARCHIVED';
  onStatusFilterChange: (val: 'ALL' | 'ACTIVE' | 'ARCHIVED') => void;
  onSelectCourse: (course: Course) => void;
  onOpenCreateModal: () => void;
}

export const CoursesOverview: React.FC<CoursesOverviewProps> = ({
  courses,
  kpiMetrics,
  semesters,
  searchQuery,
  onSearchChange,
  selectedSemester,
  onSemesterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectCourse,
  onOpenCreateModal,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-full">
      {/* 1. Thanh KPI Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Khóa học đang dạy */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Khóa học đang dạy
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {kpiMetrics.activeCourses}{' '}
              <span className="text-xs font-bold text-slate-400">/ {kpiMetrics.totalCourses} lớp phân công</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-2 truncate">
              <span>● Đang trong kỳ giảng dạy</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Tổng sinh viên theo học */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
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
        </div>

        {/* KPI 3: Tiến độ trung bình */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Tiến độ trung bình
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {kpiMetrics.avgCompletionRate}%
            </h3>
            <div className="w-28 sm:w-32 bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${kpiMetrics.avgCompletionRate}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Hoạt động trong 24h */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
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
        </div>
      </section>

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
            <input
              type="text"
              placeholder="Tìm tên môn hoặc mã môn..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
            />
          </div>

          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
          >
            <option value="All">Tất cả học kỳ</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 shadow-2xs"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang mở (Active)</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
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
            />
          ))}
        </section>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-700">Không tìm thấy khóa học phù hợp</h4>
          <p className="text-xs text-slate-400">
            Hãy thử tìm kiếm với từ khóa khác hoặc tạo mới khóa học.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Khóa Học Ngay</span>
          </button>
        </div>
      )}
    </div>
  );
};
