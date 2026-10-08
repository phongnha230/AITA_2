'use client';

import Link from 'next/link';
import { CalendarClock, Clock3, RefreshCw } from 'lucide-react';
import type { ResourceState, StudentAssignment, StudentCourse } from '../../types/student.types';

interface UpcomingExamsProps {
  state: ResourceState<StudentAssignment[]>;
  upcomingAssignments: StudentAssignment[];
  courses: StudentCourse[];
  onRetry: () => void;
}

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Thời gian chưa được cập nhật';
  return dateTimeFormatter.format(date);
}

export function UpcomingExams({ state, upcomingAssignments, courses, onRetry }: UpcomingExamsProps) {
  const courseById = new Map(courses.map((course) => [course.id, course]));

  return (
    <section
      aria-label="Kỳ thi sắp tới"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated"
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100/80">
            <CalendarClock aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Kỳ thi PE sắp tới</h2>
              {state.status === 'success' && upcomingAssignments.length > 0 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  {upcomingAssignments.length}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Các bài thi đã xuất bản và chưa đến thời gian bắt đầu.</p>
          </div>
        </div>

        {state.status === 'error' && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Thử tải lại kỳ thi"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-elevated-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        )}
      </div>

      {state.status === 'loading' && (
        <div role="status" aria-label="Đang tải kỳ thi" className="space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 shadow-elevated-sm">
          {state.error || 'Không thể tải kỳ thi.'}
        </div>
      )}

      {state.status === 'success' && upcomingAssignments.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 px-5 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-elevated-sm ring-1 ring-slate-200/80">
            <CalendarClock aria-hidden="true" className="h-5 w-5 text-slate-500" />
          </span>
          <p className="mt-3.5 text-sm font-bold text-slate-800">Không có kỳ thi PE sắp tới.</p>
          <p className="mt-1 text-xs text-slate-500">Các bài thi sắp diễn ra sẽ được hiển thị khi giảng viên công bố.</p>
        </div>
      )}

      {state.status === 'success' && upcomingAssignments.length > 0 && (
        <div className="space-y-3">
          {upcomingAssignments.slice(0, 4).map((assignment) => {
            const course = courseById.get(assignment.courseId);
            return (
              <article
                key={assignment.id}
                className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-elevated"
              >
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100/80">
                    <CalendarClock aria-hidden="true" className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                    {course && (
                      <p className="mt-0.5 text-xs text-slate-600 font-medium">
                        {course.code} · {course.name}
                      </p>
                    )}
                    <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                        Bắt đầu: {formatDateTime(assignment.startTime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                        Hạn nộp: {formatDateTime(assignment.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {upcomingAssignments.length > 4 && (
            <p className="text-center text-xs text-slate-500 pt-1">
              Còn {upcomingAssignments.length - 4} kỳ thi khác.{' '}
              <Link
                href="/student/exams"
                className="font-bold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Xem tất cả bài thi
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
