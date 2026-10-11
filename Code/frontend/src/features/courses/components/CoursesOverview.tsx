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
import { Course, LecturerKpiMetrics, LecturerDashboardRecentSubmission } from '../types/course.types';
import { CourseCard } from './CourseCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

interface CoursesOverviewProps {
  courses: Course[];
  kpiMetrics: LecturerKpiMetrics;
  recentSubmissions?: LecturerDashboardRecentSubmission[];
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
  recentSubmissions,
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

      {/* Widget: Bài nộp gần đây trên toàn bộ các lớp (Dữ liệu thật từ Backend Dashboard) */}
      {recentSubmissions && recentSubmissions.length > 0 && (
        <section className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Hoạt Động Nộp Bài Gần Đây (Toàn bộ lớp học)
              </h3>
              <p className="text-[11px] text-slate-400">
                Theo dõi tiến trình sinh viên nộp bài thi thực hành và chấm điểm tự động.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {recentSubmissions.length} bài nộp mới nhất
            </span>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-2xs overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Sinh viên</th>
                    <th className="py-3 px-4">Đề thi / Môn</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Điểm cuối</th>
                    <th className="py-3 px-4 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSubmissions.map((sub) => {
                    const initials = (sub.studentName || 'SV')
                      .trim()
                      .split(' ')
                      .slice(-2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs shrink-0">
                              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">
                                {sub.studentName}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {sub.studentEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 truncate">
                            {sub.assignmentTitle}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-mono">
                            {sub.courseCode} • {sub.paperCode || 'Mã đề: Standard'}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                          {new Date(sub.submittedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {sub.status === 'GRADED' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                              Đã chấm điểm
                            </Badge>
                          ) : sub.status === 'RUNNING_SANDBOX' ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold animate-pulse">
                              Đang test Sandbox
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              {sub.status}
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-black text-sm">
                          {sub.finalScore > 0 ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {sub.finalScore}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          >
                            <Link href={`/exam-bank/${sub.assignmentId}/submissions`}>
                              <span>Xem bài</span>
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};
