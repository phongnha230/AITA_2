'use client';

import React from 'react';
import { AlertCircle, CalendarClock, RefreshCw } from 'lucide-react';
import { useStudentExams } from '../../hooks/useStudentExams';
import { useStudentExamsFilter } from '../../hooks/useStudentExamsFilter';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { ExamFilterToolbar } from './ExamFilterToolbar';
import { StudentExamsStatsGrid } from './StudentExamsStatsGrid';
import { StudentExamsHistorySection } from './StudentExamsHistorySection';
import { StudentExamsSections } from './StudentExamsSections';

function getErrorMessage(exams: ReturnType<typeof useStudentExams>) {
  if (exams.profileStatus === 'error') {
    return exams.profileError || 'Không thể tải thông tin tài khoản.';
  }
  if (exams.courses.status === 'error') {
    return exams.courses.error || 'Không thể tải lớp học.';
  }
  if (exams.assignments.status === 'error') {
    return exams.assignments.error || 'Không thể tải danh sách bài thi.';
  }
  return null;
}

export function StudentExams() {
  const exams = useStudentExams();
  const filterData = useStudentExamsFilter({
    exams: exams.exams,
    filteredExams: exams.filteredExams,
    filter: exams.filter,
    search: exams.search,
    status: exams.assignments.status,
    openCount: exams.openCount,
    upcomingCount: exams.upcomingCount,
    endedCount: exams.endedCount,
    pausedCount: exams.pausedCount,
  });

  const refreshBusy = exams.courses.status === 'loading' || exams.assignments.status === 'loading';
  const errorMessage = getErrorMessage(exams);

  return (
    <div className="space-y-6">
      <StudentPageHeading
        eyebrow="Đánh giá học phần"
        title="Bài tập & bài thi"
        description="Theo dõi lịch, hạn nộp và trạng thái bài trong các lớp bạn đang tham gia."
        action={
          <button
            type="button"
            onClick={exams.refresh}
            disabled={refreshBusy}
            aria-label="Làm mới danh sách bài thi"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors duration-200 hover:bg-slate-50 hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${refreshBusy ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        }
      />

      {errorMessage && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={exams.refresh}
            className="min-h-9 shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Thử lại
          </button>
        </div>
      )}

      <StudentExamsStatsGrid
        openCount={exams.openCount}
        upcomingCount={exams.upcomingCount}
        endedCount={exams.endedCount}
        pausedCount={exams.pausedCount}
        isLoading={exams.assignments.status === 'loading'}
      />

      <div className="min-w-0 space-y-5">
        <ExamFilterToolbar
          filter={exams.filter}
          onFilterChange={exams.setFilter}
          search={exams.search}
          onSearchChange={exams.setSearch}
          sort={exams.sort}
          onSortChange={exams.setSort}
          counts={filterData.filterCounts}
        />

        {exams.assignments.status === 'loading' && (
          <section aria-label="Đang tải bài thi" role="status" className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </section>
        )}

        {filterData.noExamsAtAll && (
          <StudentEmptyState
            icon={CalendarClock}
            title="Chưa có bài tập hoặc bài thi nào."
            description="Các bài đã được công bố trong lớp sẽ xuất hiện tại đây."
          />
        )}

        <StudentExamsSections
          canShowLists={filterData.canShowLists}
          noExamsAtAll={filterData.noExamsAtAll}
          showNoMatches={filterData.showNoMatches}
          filter={exams.filter}
          search={exams.search}
          featuredExam={filterData.featuredExam}
          otherOpenExams={filterData.otherOpenExams}
          visibleUpcoming={filterData.visibleUpcoming}
          visibleEnded={filterData.visibleEnded}
          visiblePaused={filterData.visiblePaused}
          unknownExams={filterData.unknownExams}
        />

        {filterData.showNoMatches && (
          <StudentEmptyState
            icon={CalendarClock}
            title="Không tìm thấy bài thi phù hợp."
            description="Thử thay đổi từ khóa tìm kiếm hoặc chọn trạng thái khác."
          />
        )}

        <StudentExamsHistorySection />
      </div>
    </div>
  );
}
