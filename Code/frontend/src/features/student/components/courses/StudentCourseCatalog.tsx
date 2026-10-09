'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCode2,
  GraduationCap,
  KeyRound,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentCourseCatalog } from '../../hooks/useStudentCourseCatalog';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { StudentStatCard } from '../shared/StudentStatCard';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { CourseJoinModal } from './CourseJoinModal';
import type { StudentCourse } from '../../types/student.types';

export function StudentCourseCatalog() {
  const {
    coursesState,
    filteredCourses,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    selectedCourseForJoin,
    joinModalOpen,
    openJoinModal,
    closeJoinModal,
    joinCourse,
    refetch,
    stats,
  } = useStudentCourseCatalog();

  const handleCardClick = (course: StudentCourse) => {
    if (!course.isEnrolled) {
      openJoinModal(course);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <StudentPageHeading
        eyebrow="Đào tạo &amp; Lớp học"
        title="Khám phá &amp; Tham gia Lớp học"
        description="Tổng quan danh sách tất cả các lớp học do các giảng viên tạo trên hệ thống AITA. Chọn lớp học và nhập mã tham gia do giảng viên cung cấp để ghi danh vào lớp."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              disabled={coursesState.status === 'loading'}
              aria-label="Tải lại danh sách lớp học"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${coursesState.status === 'loading' ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              type="button"
              onClick={() => openJoinModal(null)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <KeyRound className="h-4 w-4" />
              <span>Nhập mã tham gia lớp</span>
            </button>
          </div>
        }
      />

      {/* 2. Thống kê nhanh */}
      <section
        aria-label="Thống kê tổng quan lớp học"
        className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4"
      >
        <StudentStatCard
          label="Tổng lớp học"
          value={coursesState.status === 'success' ? `${stats.total}` : '--'}
          detail="Lớp học của các giảng viên"
          icon={BookOpen}
          tone="blue"
          loading={coursesState.status === 'loading'}
        />
        <StudentStatCard
          label="Đã tham gia"
          value={coursesState.status === 'success' ? `${stats.enrolled}` : '--'}
          detail="Lớp bạn đang là thành viên"
          icon={CheckCircle2}
          tone="emerald"
          loading={coursesState.status === 'loading'}
        />
        <StudentStatCard
          label="Chưa tham gia"
          value={coursesState.status === 'success' ? `${stats.available}` : '--'}
          detail="Lớp có thể ghi danh"
          icon={GraduationCap}
          tone="amber"
          loading={coursesState.status === 'loading'}
        />
        <StudentStatCard
          label="Giảng viên"
          value={coursesState.status === 'success' ? `${stats.lecturerCount}` : '--'}
          detail="Giảng viên phụ trách môn"
          icon={Users}
          tone="indigo"
          loading={coursesState.status === 'loading'}
        />
      </section>

      {/* 3. Toolbar: Tìm kiếm & Lọc */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-elevated sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã môn (CSD201), tên môn, hoặc tên giảng viên..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
            />
          </div>

          {/* Tab filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-slate-100 p-1 text-xs">
            {(
              [
                { id: 'ALL', label: 'Tất cả lớp học', count: stats.total },
                { id: 'ENROLLED', label: 'Đã tham gia', count: stats.enrolled },
                { id: 'AVAILABLE', label: 'Chưa tham gia', count: stats.available },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {coursesState.status === 'success' && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Nội dung danh sách lớp học */}
      {coursesState.status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated-sm"
            />
          ))}
        </div>
      )}

      {coursesState.status === 'error' && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-xs sm:text-sm text-rose-900">
            <p className="font-bold">Đã xảy ra sự cố khi tải danh sách lớp học</p>
            <p className="mt-0.5 text-rose-700">{coursesState.error}</p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 text-xs font-semibold text-rose-900 shadow-sm transition-all hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {coursesState.status === 'success' && filteredCourses.length === 0 && (
        <StudentEmptyState
          icon={BookOpen}
          title="Không tìm thấy lớp học nào"
          description={
            search.trim()
              ? `Không có kết quả nào phù hợp với từ khóa "${search}". Hãy thử tìm kiếm với tên môn hoặc mã môn khác.`
              : activeTab === 'ENROLLED'
                ? 'Bạn chưa tham gia lớp học nào. Hãy chuyển sang tab "Tất cả lớp học" và nhập mã để tham gia.'
                : 'Hiện chưa có lớp học nào khả dụng trên hệ thống.'
          }
          action={
            search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
              >
                Xóa tìm kiếm
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openJoinModal(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
              >
                <KeyRound className="h-4 w-4" />
                <span>Nhập mã lớp để tham gia</span>
              </button>
            )
          }
        />
      )}

      {coursesState.status === 'success' && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = Boolean(course.isEnrolled);

            return (
              <article
                key={course.id}
                onClick={() => handleCardClick(course)}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-elevated ${
                  isEnrolled
                    ? 'border-emerald-200/90 hover:border-emerald-300'
                    : 'border-slate-200/80 hover:border-blue-300 cursor-pointer'
                }`}
              >
                <div>
                  {/* Top Bar: Mã môn + Trạng thái */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-blue-200/80 bg-blue-50/90 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                      {course.code}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isEnrolled ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Đã tham gia</span>
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            course.isActive
                              ? 'border border-slate-200 bg-slate-50 text-slate-600'
                              : 'border border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          {course.isActive ? 'Đang mở' : 'Tạm đóng'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Name */}
                  <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {course.name}
                  </h3>

                  {/* Giảng viên phụ trách */}
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                        <User className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">
                          {course.lecturer?.fullName || 'Giảng viên khoa CNTT'}
                        </p>
                        {course.lecturer?.email && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {course.lecturer.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta Chips */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      Học kỳ: {course.semester}
                    </span>
                    {typeof course.enrollmentCount === 'number' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                        <Users className="h-3 w-3" />
                        <span>{course.enrollmentCount} SV</span>
                      </span>
                    )}
                    {typeof course.assignmentCount === 'number' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                        <FileCode2 className="h-3 w-3" />
                        <span>{course.assignmentCount} bài thi</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 border-t border-slate-100 pt-3.5">
                  {isEnrolled ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-emerald-700 inline-flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        Đã sẵn sàng thi
                      </span>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                      >
                        <Link href="/student/exams">
                          <span>Xem bài thi</span>
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openJoinModal(course);
                      }}
                      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 hover:shadow-sm active:translate-y-0"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Tham gia lớp học này</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 5. Modal Tham gia lớp học */}
      <CourseJoinModal
        open={joinModalOpen}
        onClose={closeJoinModal}
        targetCourse={selectedCourseForJoin}
        onJoin={joinCourse}
      />
    </div>
  );
}
