'use client';

import { BookOpen, GraduationCap, RefreshCw, UserCheck } from 'lucide-react';
import type { ResourceState, StudentCourse } from '../../types/student.types';
import { StudentEmptyState } from '../shared/StudentEmptyState';

interface ProfileCoursesProps {
  state: ResourceState<StudentCourse[]>;
  onRetry: () => void;
  profileFailed: boolean;
}

export function ProfileCourses({ state, onRetry, profileFailed }: ProfileCoursesProps) {
  return (
    <section className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Lớp học trong học kỳ hiện tại
            </h2>
            {state.status === 'success' && state.data.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {state.data.length} lớp
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Danh sách lớp thực hành được ghi danh trực tiếp trên hệ thống khảo thí.
          </p>
        </div>

        {state.status === 'error' && !profileFailed && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Tải lại danh sách lớp học"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        )}
      </div>

      {state.status === 'loading' && (
        <div role="status" aria-label="Đang tải lớp học" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
      )}

      {state.status === 'error' && profileFailed && (
        <StudentEmptyState
          icon={BookOpen}
          title="Chưa thể tải danh sách lớp học."
          description="Hãy tải lại hồ sơ tài khoản để xem các lớp đã ghi danh."
        />
      )}

      {state.status === 'error' && !profileFailed && (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {state.error || 'Không thể tải danh sách lớp học.'}
        </p>
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <StudentEmptyState
          icon={BookOpen}
          title="Bạn chưa tham gia lớp học nào."
          description="Các lớp học được ghi danh sẽ xuất hiện tại đây khi bạn tham gia bằng mã Invite."
        />
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.map((course) => (
            <article
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                    {course.code}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      course.isActive
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {course.isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                  </span>
                </div>

                <h3 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900">
                  {course.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Học kỳ: <span className="font-medium text-slate-700">{course.semester}</span>
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-400">Giảng viên:</span>
                  <span className="truncate font-semibold text-slate-700">
                    {course.lecturer?.fullName || 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

