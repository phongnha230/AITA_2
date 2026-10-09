'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  FileText,
  Headphones,
  ShieldCheck,
  UserRoundPlus,
  Zap,
} from 'lucide-react';
import { DashboardStats } from './DashboardStats';
import { JoinClassModal } from './JoinClassModal';
import { JoinCourseCard } from './JoinCourseCard';
import { MyClasses } from './MyClasses';
import { PracticeSandbox } from './PracticeSandbox';
import { RecentActivity } from './RecentActivity';
import { UpcomingExams } from './UpcomingExams';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';

export function StudentDashboard() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const dashboard = useStudentDashboard();

  const courseCount = dashboard.courses.status === 'success'
    ? dashboard.courses.data.length
    : null;
  const upcomingExamCount = dashboard.assignments.status === 'success'
    ? dashboard.openAssignments.length + dashboard.upcomingAssignments.length
    : null;
  const completedExamCount = dashboard.assignments.status === 'success'
    ? dashboard.completedAssignments.length
    : null;

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Action */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Không gian học tập &amp; Khảo thí</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Tổng quan &amp; Lớp học
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Theo dõi lớp học, kỳ thi thực hành PE và trạng thái hạ tầng phòng thi Docker Sandbox.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setJoinModalOpen(true)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <UserRoundPlus aria-hidden="true" className="h-[18px] w-[18px]" />
          <span>Tham gia lớp học</span>
        </button>
      </section>

      {/* Error Banner */}
      {dashboard.profileStatus === 'error' && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{dashboard.profileError || 'Không thể tải thông tin tài khoản.'}</p>
          <button
            type="button"
            onClick={dashboard.retryProfile}
            className="min-h-9 shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 text-xs font-semibold text-amber-900 shadow-sm transition-all hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <section
        aria-label="Chào mừng sinh viên"
        className="relative overflow-hidden rounded-2xl border border-blue-100/90 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 p-6 shadow-elevated sm:p-7"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-white px-3 py-1 text-[11px] font-bold tracking-wide uppercase text-blue-700 shadow-xs">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            <span>Khởi đầu hành trình học tập</span>
          </div>

          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
            {dashboard.profile?.fullName
              ? `Chào mừng bạn, ${dashboard.profile.fullName}!`
              : 'Chào mừng bạn đến với AITA Exam Platform!'}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            Nền tảng thi thực hành lập trình thông minh. Quản lý lớp học, tham gia làm bài thi PE trên môi trường Docker Sandbox cô lập và nhận đánh giá tự động tức thì.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 pt-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Đồng bộ theo kỳ học</span>
            </div>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Sandbox cô lập an toàn</span>
            </div>
            <span className="hidden text-slate-300 sm:inline">•</span>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              <span>Chấm điểm Unit-test tức thì</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Join Course Form Card */}
      <JoinCourseCard onJoin={dashboard.joinCourse} />

      {/* 4 Stat Cards */}
      <DashboardStats
        courseCount={courseCount}
        upcomingExamCount={upcomingExamCount}
        completedExamCount={completedExamCount}
        coursesLoading={dashboard.courses.status === 'loading'}
        examsLoading={dashboard.assignments.status === 'loading'}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <MyClasses
            state={dashboard.courses}
            onRetry={dashboard.retryCourses}
            onJoin={() => setJoinModalOpen(true)}
          />
          <UpcomingExams
            state={dashboard.assignments}
            openAssignments={dashboard.openAssignments}
            upcomingAssignments={dashboard.upcomingAssignments}
            courses={dashboard.courses.data}
            onRetry={dashboard.retryAssignments}
          />
        </div>

        {/* Right Column (1 col) */}
        <aside aria-label="Thông tin học tập bổ sung" className="space-y-6">
          <PracticeSandbox state={dashboard.sandbox} onRetry={dashboard.retrySandbox} />
          <RecentActivity
            courses={dashboard.courses.data}
            upcomingAssignments={dashboard.upcomingAssignments}
          />
        </aside>
      </div>

      {/* Bottom Academic Support Banner (Visual Reference: Screenshot 3) */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated transition-all sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Headphones aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cần trợ giúp kích hoạt tài khoản hoặc phòng máy thi?</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Kỹ thuật viên phòng máy LAB &amp; Khảo thí AITA luôn sẵn sàng túc trực hỗ trợ trong suốt kỳ thi.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/student/exams"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <FileText className="h-4 w-4 text-slate-400" />
            <span>Quy chế thi PE</span>
          </Link>
        </div>
      </section>

      {/* Modal fallback */}
      <JoinClassModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoin={dashboard.joinCourse}
      />
    </div>
  );
}
