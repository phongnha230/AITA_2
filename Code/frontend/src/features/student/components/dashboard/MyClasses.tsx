'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, RefreshCw } from 'lucide-react';
import type { ResourceState, StudentCourse } from '../../types/student.types';

interface MyClassesProps {
  state: ResourceState<StudentCourse[]>;
  onRetry: () => void;
  onJoin: () => void;
}

export function MyClasses({ state, onRetry, onJoin }: MyClassesProps) {
  return (
    <section
      aria-label="Danh sách lớp học"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100/80">
            <BookOpen aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Lớp học của tôi</h2>
              {state.status === 'success' && state.data.length > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  {state.data.length}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Các lớp được ghi danh bằng tài khoản của bạn.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/courses"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Khám phá tất cả lớp</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          {state.status === 'error' && (
            <button
              type="button"
              onClick={onRetry}
              aria-label="Thử tải lại lớp học"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-elevated-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Thử lại</span>
            </button>
          )}
        </div>
      </div>

      {state.status === 'loading' && (
        <div role="status" aria-label="Đang tải lớp học" className="grid gap-3.5 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 shadow-elevated-sm">
          {state.error || 'Không thể tải dữ liệu lớp học.'}
        </div>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 px-5 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-elevated-sm ring-1 ring-slate-200/80">
            <BookOpen aria-hidden="true" className="h-5 w-5 text-slate-500" />
          </span>
          <p className="mt-3.5 text-sm font-bold text-slate-800">Bạn chưa tham gia lớp học nào.</p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">Dùng mã do giảng viên cung cấp để tham gia lớp học.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={onJoin}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Nhập mã tham gia
            </button>
            <Link
              href="/student/courses"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span>Xem danh sách lớp của các GV</span>
            </Link>
          </div>
        </div>
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {state.data.map((course) => (
            <article
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-elevated"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <span className="rounded-md border border-blue-200/80 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                    {course.code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      course.isActive
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {course.isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                  </span>
                </div>
                <h3 className="mt-2.5 line-clamp-2 text-sm font-bold text-slate-900">{course.name}</h3>
                <p className="mt-1 text-xs text-slate-500">Học kỳ: {course.semester}</p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-600">
                  <span className="text-slate-400">Giảng viên: </span>
                  <span className="font-semibold text-slate-700">
                    {course.lecturer?.fullName || 'Chưa cập nhật'}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
