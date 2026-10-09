'use client';

import Link from 'next/link';
import {
  CalendarClock,
  Clock3,
  Code2,
  FileCheck2,
  PlayCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { ResourceState, StudentAssignment, StudentCourse } from '../../types/student.types';

interface UpcomingExamsProps {
  state: ResourceState<StudentAssignment[]>;
  openAssignments?: StudentAssignment[];
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

export function UpcomingExams({
  state,
  openAssignments = [],
  upcomingAssignments,
  courses,
  onRetry,
}: UpcomingExamsProps) {
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const totalActiveExams = openAssignments.length + upcomingAssignments.length;

  return (
    <section
      aria-label="Kỳ thi thực hành PE"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated transition-all"
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100/80">
            <CalendarClock aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Kỳ thi thực hành (PE)
              </h2>
              {state.status === 'success' && totalActiveExams > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                  {totalActiveExams}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Bài thi thực hành đang diễn ra hoặc đã công bố lịch sắp tới.
            </p>
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
          {state.error || 'Không thể tải danh sách bài thi.'}
        </div>
      )}

      {state.status === 'success' && totalActiveExams === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 px-5 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-elevated-sm ring-1 ring-slate-200/80">
            <CalendarClock aria-hidden="true" className="h-5 w-5 text-slate-500" />
          </span>
          <p className="mt-3.5 text-sm font-bold text-slate-800">Không có kỳ thi PE cần thực hiện lúc này.</p>
          <p className="mt-1 text-xs text-slate-500">Các bài thi sẽ xuất hiện tại đây khi giảng viên mở hoặc công bố lịch thi.</p>
        </div>
      )}

      {state.status === 'success' && totalActiveExams > 0 && (
        <div className="space-y-4">
          {/* 1. OPEN ASSIGNMENTS - HIGHEST VISUAL PRIORITY */}
          {openAssignments.length > 0 && (
            <div className="space-y-3">
              {openAssignments.map((assignment) => {
                const course = courseById.get(assignment.courseId);
                return (
                  <article
                    key={assignment.id}
                    className="relative overflow-hidden rounded-xl border-2 border-blue-500/80 bg-white p-4.5 shadow-elevated ring-2 ring-blue-500/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                          <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse motion-reduce:animate-none" />
                          ĐANG MỞ THI
                        </span>
                        {course && (
                          <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                            {course.code}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-600">
                        Hạn nộp: <span className="font-bold text-slate-900">{formatDateTime(assignment.deadline)}</span>
                      </span>
                    </div>

                    <div className="mt-3 flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                        <Code2 aria-hidden="true" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                          {assignment.title}
                        </h3>
                        {course && (
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {course.name} · {course.semester}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <div className="text-xs text-slate-500">
                        Môi trường: <span className="font-semibold text-slate-700">{assignment.environment}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/student/exams"
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 transition-colors"
                        >
                          <span>Xem chi tiết ca thi</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* 2. UPCOMING ASSIGNMENTS - SECONDARY PRIORITY */}
          {upcomingAssignments.length > 0 && (
            <div className="space-y-3">
              {openAssignments.length > 0 && (
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
                  Kỳ thi sắp tới
                </p>
              )}
              {upcomingAssignments.slice(0, 3).map((assignment) => {
                const course = courseById.get(assignment.courseId);
                return (
                  <article
                    key={assignment.id}
                    className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-elevated"
                  >
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100/80">
                        <CalendarClock aria-hidden="true" className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm">{assignment.title}</h3>
                        {course && (
                          <p className="mt-0.5 text-xs text-slate-600 font-medium">
                            {course.code} · {course.name}
                          </p>
                        )}
                        <div className="mt-2.5 flex flex-col gap-1.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4">
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
            </div>
          )}

          {totalActiveExams > 4 && (
            <p className="text-center text-xs text-slate-500 pt-1">
              <Link
                href="/student/exams"
                className="font-bold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Xem tất cả các bài thi PE trong kỳ
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
