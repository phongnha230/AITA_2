'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarClock, History } from 'lucide-react';
import type { StudentAssignment, StudentCourse } from '../../types/student.types';

interface RecentActivityProps {
  courses?: StudentCourse[];
  upcomingAssignments?: StudentAssignment[];
}

export function RecentActivity({ courses = [], upcomingAssignments = [] }: RecentActivityProps) {
  const hasCourses = courses.length > 0;
  const hasExams = upcomingAssignments.length > 0;
  const hasAnyActivity = hasCourses || hasExams;

  return (
    <section
      aria-label="Hoạt động học tập"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200/80">
          <History aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">Hoạt động học tập</h2>
          <p className="mt-0.5 text-xs text-slate-500">Cập nhật gần nhất từ hệ thống đào tạo</p>
        </div>
      </div>

      <div className="mt-4">
        {!hasAnyActivity ? (
          <div className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/60 px-4 py-6 text-center">
            <p className="text-xs font-bold text-slate-700">Chưa có hoạt động bài nộp gần đây.</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Lịch sử nộp bài và kết quả đánh giá sẽ xuất hiện tại đây khi bạn hoàn thành bài thi.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {courses.slice(0, 2).map((course) => (
              <li
                key={course.id}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs transition-colors hover:bg-slate-50"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{course.name}</p>
                  <p className="text-[11px] text-slate-500">Mã lớp: {course.code} · {course.semester}</p>
                </div>
              </li>
            ))}
            {upcomingAssignments.slice(0, 1).map((exam) => (
              <li
                key={exam.id}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs transition-colors hover:bg-slate-50"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <CalendarClock className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{exam.title}</p>
                  <p className="text-[11px] text-slate-500">Kỳ thi PE sắp diễn ra</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <Link
          href="/student/results"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span>Xem chi tiết kết quả &amp; bài nộp</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
