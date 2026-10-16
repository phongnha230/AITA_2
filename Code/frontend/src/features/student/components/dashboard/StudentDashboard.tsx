'use client';

import { useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { JoinClassModal } from './JoinClassModal';
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
    ? dashboard.upcomingAssignments.length
    : null;
  const completedExamCount = dashboard.assignments.status === 'success'
    ? dashboard.completedAssignments.length
    : null;
  const portfolioData = dashboard.portfolio.status === 'success' ? dashboard.portfolio.data : null;
  const gradedSubmissionCount = portfolioData
    ? portfolioData.academicStats.passedCount + portfolioData.academicStats.failedCount
    : null;

  return (
    <div className="space-y-6">
      {/* Page Title & Greeting */}
      <section className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Không gian học tập &amp; Khảo thí</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {dashboard.profile?.fullName ? `Xin chào, ${dashboard.profile.fullName}! 👋` : 'Tổng quan &amp; Lớp học'}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Theo dõi lớp học, lịch bài tập và thi, cùng trạng thái bài nộp tự động.
          </p>
        </div>
      </section>

      {/* Error Banner */}
      {dashboard.profileStatus === 'error' && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">{dashboard.profileError || 'Không thể tải thông tin tài khoản.'}</p>
          <button
            type="button"
            onClick={dashboard.retryProfile}
            className="min-h-9 shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <DashboardStats
        courseCount={courseCount}
        upcomingExamCount={upcomingExamCount}
        completedExamCount={completedExamCount}
        averageScore={portfolioData?.academicStats.averageScore ?? null}
        gradedSubmissionCount={gradedSubmissionCount}
        coursesLoading={dashboard.courses.status === 'loading'}
        examsLoading={dashboard.assignments.status === 'loading'}
        portfolioLoading={dashboard.portfolio.status === 'loading'}
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
            upcomingAssignments={dashboard.upcomingAssignments}
            courses={dashboard.courses.data}
            onRetry={dashboard.retryAssignments}
          />
        </div>

        {/* Right Column (1 col) */}
        <aside aria-label="Thông tin học tập bổ sung" className="space-y-6">
          <PracticeSandbox state={dashboard.sandbox} onRetry={dashboard.retrySandbox} />
          <RecentActivity state={dashboard.portfolio} onRetry={dashboard.retryPortfolio} />
        </aside>
      </div>

      {/* Modal fallback */}
      <JoinClassModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onJoin={dashboard.joinCourse}
      />
    </div>
  );
}

