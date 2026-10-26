'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useStudentExams } from '../../hooks/useStudentExams';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { ExamFilterToolbar } from './ExamFilterToolbar';
import { ExamCard } from './ExamCard';

const PAGE_SIZE = 8;

function getErrorMessage(exams: ReturnType<typeof useStudentExams>) {
  if (exams.profileStatus === 'error') {
    return exams.profileError || 'Không thể tải thông tin tài khoản.';
  }
  if (exams.courses.status === 'error') {
    return exams.courses.error || 'Không thể tải danh sách lớp học.';
  }
  if (exams.assignments.status === 'error') {
    return exams.assignments.error || 'Không thể tải danh sách bài thi.';
  }
  return null;
}

export function StudentExams() {
  const exams = useStudentExams();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 on filter or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [exams.filter, exams.search]);

  const refreshBusy = exams.courses.status === 'loading' || exams.assignments.status === 'loading';
  const errorMessage = getErrorMessage(exams);

  const filterCounts = useMemo(
    () => ({
      all: exams.assignments.status === 'success' ? exams.exams.length : null,
      open: exams.openCount,
      upcoming: exams.upcomingCount,
      ended: exams.endedCount,
      paused: exams.pausedCount,
    }),
    [exams.assignments.status, exams.exams.length, exams.openCount, exams.upcomingCount, exams.endedCount, exams.pausedCount]
  );

  const totalItems = exams.filteredExams.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Slice for 8 items per page
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return exams.filteredExams.slice(start, start + PAGE_SIZE);
  }, [exams.filteredExams, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  return (
    <div className="space-y-5">
      <StudentPageHeading
        eyebrow="Cổng thi & Đánh giá PE"
        title="Bài tập & bài thi"
        description="Theo dõi lịch thi, tham gia ca thi và nộp bài trực tuyến."
        action={
          <button
            type="button"
            onClick={exams.refresh}
            disabled={refreshBusy}
            aria-label="Làm mới danh sách bài thi"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw aria-hidden="true" className={`size-3.5 ${refreshBusy ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        }
      />

      {errorMessage && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={exams.refresh}
            className="shrink-0 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-100 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4-Tab Navigation & Filter/Search */}
      <ExamFilterToolbar
        filter={exams.filter}
        onFilterChange={exams.setFilter}
        search={exams.search}
        onSearchChange={exams.setSearch}
        sort={exams.sort}
        onSortChange={exams.setSort}
        counts={filterCounts}
      />

      {/* Loading Skeleton */}
      {exams.assignments.status === 'loading' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {exams.assignments.status === 'success' && totalItems === 0 && (
        <StudentEmptyState
          icon={CalendarClock}
          title={exams.search ? 'Không tìm thấy kỳ thi phù hợp' : 'Không có kỳ thi nào trong danh mục này.'}
          description={
            exams.search
              ? `Không có kết quả nào khớp với "${exams.search}". Thử thay đổi từ khóa hoặc bộ lọc.`
              : 'Các kỳ thi sẽ xuất hiện tại đây khi được giảng viên công bố.'
          }
        />
      )}

      {/* Compact Exam Cards Grid */}
      {exams.assignments.status === 'success' && totalItems > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedExams.map((exam) => (
              <ExamCard key={exam.assignment.id} exam={exam} />
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
            <p className="text-xs text-slate-500">
              Hiển thị <strong className="font-semibold text-slate-800">{startIndex + 1}</strong> -{' '}
              <strong className="font-semibold text-slate-800">{Math.min(startIndex + PAGE_SIZE, totalItems)}</strong>{' '}
              trên tổng số <strong className="font-semibold text-slate-800">{totalItems}</strong> kỳ thi
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-8 items-center gap-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="size-3.5" />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-8 items-center gap-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
