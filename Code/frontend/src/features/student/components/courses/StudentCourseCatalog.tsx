'use client';

import {
  BookOpen,
  GraduationCap,
  KeyRound,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { useStudentCourseCatalog } from '../../hooks/useStudentCourseCatalog';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { StudentStatCard } from '../shared/StudentStatCard';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { CourseJoinModal } from './CourseJoinModal';
import { StudentCourseCard } from './StudentCourseCard';

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
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${coursesState.status === 'loading' ? 'animate-spin' : ''}`}
              />
              <span>Làm mới</span>
            </button>
            <button
              type="button"
              onClick={() => openJoinModal(null)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <KeyRound className="h-4 w-4" />
              <span>Ghi danh bằng mã</span>
            </button>
          </div>
        }
      />

      {/* 2. KPI Metrics Bar */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <StudentStatCard
          label="Tổng lớp học"
          value={coursesState.status === 'success' ? `${stats.total}` : '--'}
          detail="Tất cả môn trên hệ thống"
          icon={BookOpen}
          tone="blue"
          loading={coursesState.status === 'loading'}
        />
        <StudentStatCard
          label="Đã tham gia"
          value={coursesState.status === 'success' ? `${stats.enrolled}` : '--'}
          detail="Lớp học của bạn"
          icon={GraduationCap}
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
              aria-label="Tìm kiếm theo mã môn, tên môn, hoặc tên giảng viên..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs text-slate-900 shadow-inner outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
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
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 font-semibold transition-colors ${
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
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 text-xs font-semibold text-rose-900 shadow-sm transition-colors hover:bg-rose-100"
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
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Xóa tìm kiếm
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openJoinModal(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
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
          {filteredCourses.map((course) => (
            <StudentCourseCard
              key={course.id}
              course={course}
              onOpenJoinModal={openJoinModal}
            />
          ))}
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
