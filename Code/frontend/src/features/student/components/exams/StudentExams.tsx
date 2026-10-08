'use client';

import { AlertCircle, CalendarClock, CheckCheck, Code2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useStudentExams } from '../../hooks/useStudentExams';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { StudentStatCard } from '../shared/StudentStatCard';
import { ExamCard } from './ExamCard';
import { ExamEnvironmentSummary } from './ExamEnvironmentSummary';
import { ExamFilterToolbar } from './ExamFilterToolbar';
import { ExamListSection } from './ExamListSection';
import { ExamRegulationsCard } from './ExamRegulationsCard';

export function StudentExams() {
  const exams = useStudentExams();
  const openExams = exams.exams.filter((exam) => exam.temporalStatus === 'OPEN');
  const upcomingExams = exams.exams.filter((exam) => exam.temporalStatus === 'UPCOMING');
  const endedExams = exams.exams.filter((exam) => exam.temporalStatus === 'ENDED');
  const unknownExams = exams.filteredExams.filter((exam) => exam.temporalStatus === 'UNKNOWN');
  const filterCounts = {
    all: exams.assignments.status === 'success' ? exams.exams.length : null,
    open: exams.openCount,
    upcoming: exams.upcomingCount,
    ended: exams.endedCount,
  };
  const canShowLists = exams.assignments.status === 'success';
  const refreshBusy = exams.courses.status === 'loading' || exams.assignments.status === 'loading';
  const visibleActive = exams.filter === 'ALL' || exams.filter === 'OPEN'
    ? exams.filteredExams.filter((exam) => exam.temporalStatus === 'OPEN')
    : [];
  const otherOpenExams = visibleActive.slice(1);
  const featuredExam = visibleActive[0];
  const visibleUpcoming = exams.filter === 'ALL' || exams.filter === 'UPCOMING'
    ? exams.filteredExams.filter((exam) => exam.temporalStatus === 'UPCOMING')
    : [];
  const visibleEnded = exams.filter === 'ALL' || exams.filter === 'ENDED'
    ? exams.filteredExams.filter((exam) => exam.temporalStatus === 'ENDED')
    : [];
  const noExamsAtAll = canShowLists && exams.exams.length === 0 && exams.filter === 'ALL' && !exams.search;
  const showNoMatches = canShowLists && exams.filteredExams.length === 0 && !noExamsAtAll;

  return (
    <div className="space-y-6">
      <StudentPageHeading
        eyebrow="Đánh giá học phần"
        title="Danh sách Bài thi Thực hành (PE)"
        description="Theo dõi lịch thi, thời hạn và môi trường thực thi của các lớp bạn đang tham gia."
        action={(
          <button
            type="button"
            onClick={exams.refresh}
            disabled={refreshBusy}
            aria-label="Làm mới danh sách bài thi"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${refreshBusy ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        )}
      />

      {(exams.profileStatus === 'error' || exams.courses.status === 'error' || exams.assignments.status === 'error') && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-amber-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {exams.profileStatus === 'error'
                ? exams.profileError || 'Không thể tải thông tin tài khoản.'
                : exams.courses.status === 'error'
                  ? exams.courses.error || 'Không thể tải lớp học.'
                  : exams.assignments.error || 'Không thể tải danh sách bài thi.'}
            </p>
          </div>
          <button
            type="button"
            onClick={exams.refresh}
            className="min-h-9 shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 text-xs font-semibold text-amber-900 shadow-sm transition-all hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Thử lại
          </button>
        </div>
      )}

      <section aria-label="Tổng quan bài thi" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard
          label="Đang mở"
          value={exams.openCount === null ? '--' : String(exams.openCount)}
          detail={exams.openCount === null ? 'Chưa có dữ liệu' : 'Theo thời gian bắt đầu và hạn nộp'}
          icon={Code2}
          tone="emerald"
          loading={exams.assignments.status === 'loading'}
        />
        <StudentStatCard
          label="Sắp tới"
          value={exams.upcomingCount === null ? '--' : String(exams.upcomingCount)}
          detail={exams.upcomingCount === null ? 'Chưa có dữ liệu' : 'Bài thi đã được xuất bản'}
          icon={CalendarClock}
          tone="blue"
          loading={exams.assignments.status === 'loading'}
        />
        <StudentStatCard
          label="Đã hoàn thành"
          value={exams.endedCount === null ? '--' : String(exams.endedCount)}
          detail={exams.endedCount === null ? 'Chưa có dữ liệu' : 'Đã qua thời hạn hoặc đã đóng'}
          icon={CheckCheck}
          tone="slate"
          loading={exams.assignments.status === 'loading'}
        />
        <StudentStatCard
          label="Môi trường có bài thi"
          value={exams.environmentCount === null ? '--' : String(exams.environmentCount)}
          detail={exams.environmentCount === null ? 'Chưa có dữ liệu' : 'Số môi trường trong danh sách'}
          icon={Code2}
          tone="amber"
          loading={exams.assignments.status === 'loading'}
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3 xl:gap-6">
        <div className="min-w-0 space-y-5 xl:col-span-2">
          <ExamFilterToolbar
            filter={exams.filter}
            onFilterChange={exams.setFilter}
            search={exams.search}
            onSearchChange={exams.setSearch}
            sort={exams.sort}
            onSortChange={exams.setSort}
            counts={filterCounts}
          />

          {exams.assignments.status === 'loading' && (
            <section aria-label="Đang tải bài thi" role="status" className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />
              ))}
            </section>
          )}

          {noExamsAtAll && (
            <StudentEmptyState
              icon={CalendarClock}
              title="Chưa có bài thi PE nào."
              description="Các bài thi đã được xuất bản trong lớp của bạn sẽ xuất hiện tại đây."
            />
          )}

          {canShowLists && !noExamsAtAll && featuredExam && <ExamCard exam={featuredExam} featured />}

          {canShowLists && !noExamsAtAll && otherOpenExams.length > 0 && (
            <ExamListSection
              title="Các bài thi đang mở"
              description="Bài thi nằm trong khung thời gian thực hiện."
              exams={otherOpenExams}
              emptyTitle="Không có bài thi đang mở."
              emptyDescription=""
            />
          )}

          {canShowLists && !noExamsAtAll && !showNoMatches && (exams.filter === 'ALL' || exams.filter === 'UPCOMING') && (
            <ExamListSection
              title="Bài thi sắp tới"
              description="Các bài thi đã xuất bản và chưa đến thời gian bắt đầu."
              exams={visibleUpcoming}
              emptyTitle={exams.search ? 'Không tìm thấy bài thi phù hợp.' : 'Không có kỳ thi PE sắp tới.'}
              emptyDescription={exams.search ? 'Thử từ khóa khác hoặc đổi bộ lọc trạng thái.' : 'Các bài thi sắp tới sẽ xuất hiện tại đây khi được giảng viên công bố.'}
            />
          )}

          {canShowLists && !noExamsAtAll && !showNoMatches && (exams.filter === 'ALL' || exams.filter === 'ENDED') && (
            <ExamListSection
              title="Đã kết thúc theo thời gian"
              description="Các bài thi có trạng thái đóng hoặc đã qua hạn nộp."
              exams={visibleEnded}
              emptyTitle="Không có bài thi đã kết thúc."
              emptyDescription=""
            />
          )}

          {canShowLists && !noExamsAtAll && !showNoMatches && exams.filter === 'ALL' && unknownExams.length > 0 && (
            <ExamListSection
              title="Chưa xác định thời gian"
              description="Các bài thi chưa thiết lập khung thời gian cụ thể."
              exams={unknownExams}
              emptyTitle="Không có bài thi thiếu thời gian."
              emptyDescription=""
            />
          )}

          {showNoMatches && (
            <StudentEmptyState
              icon={CalendarClock}
              title="Không tìm thấy bài thi phù hợp."
              description="Thử thay đổi từ khóa tìm kiếm hoặc chọn trạng thái khác."
            />
          )}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Lịch sử bài thi &amp; Bảng điểm</h2>
            <p className="mt-0.5 text-xs text-slate-500">Kết quả được ghi nhận từ các lần nộp bài thực tế.</p>
            <div className="mt-4">
              <StudentEmptyState
                icon={CalendarClock}
                title="Chưa có dữ liệu kỳ thi để hiển thị."
                description="Bạn có thể tra cứu chi tiết kết quả và đánh giá AI bằng mã bài nộp (Submission ID)."
                action={(
                  <Link
                    href="/student/results"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    Tra cứu kết quả bài nộp
                  </Link>
                )}
              />
            </div>
          </section>
        </div>

        <aside aria-label="Tổng hợp bài thi" className="min-w-0 space-y-5">
          <ExamRegulationsCard />
          <ExamEnvironmentSummary exams={exams.exams} available={exams.assignments.status === 'success'} />
        </aside>
      </div>
    </div>
  );
}

