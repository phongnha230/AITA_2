'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useStudentCourseCatalog } from '../../hooks/useStudentCourseCatalog';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { CourseJoinModal } from './CourseJoinModal';
import { StudentCourseCard } from './StudentCourseCard';

const PAGE_SIZE = 8;

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

  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 on search or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const totalItems = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <StudentPageHeading
        eyebrow="Đào tạo & Lớp học"
        title="Khám phá lớp học"
        description="Tổng quan danh sách các lớp học. Chọn lớp học hoặc nhập mã tham gia để ghi danh vào lớp."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              disabled={coursesState.status === 'loading'}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${coursesState.status === 'loading' ? 'animate-spin' : ''}`}
              />
              <span>Làm mới</span>
            </button>
            <button
              type="button"
              onClick={() => openJoinModal(null)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <KeyRound className="size-3.5" />
              <span>Ghi danh bằng mã</span>
            </button>
          </div>
        }
      />

      {/* 2. Toolbar: Tab Navigation & Tìm kiếm */}
      <section aria-label="Bộ lọc và tìm kiếm lớp học" className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 gap-2 overflow-x-auto">
          {(
            [
              { id: 'ALL', label: 'Tất cả lớp học', count: stats.total },
              { id: 'ENROLLED', label: 'Đã tham gia', count: stats.enrolled },
              { id: 'AVAILABLE', label: 'Chưa tham gia', count: stats.available },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 pt-1 px-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {coursesState.status === 'success' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums transition-colors ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Ô tìm kiếm */}
        <div className="pt-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã môn (CSD201), tên môn hoặc giảng viên..."
              aria-label="Tìm kiếm theo mã môn, tên môn, hoặc tên giảng viên..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* 3. Skeleton Loading */}
      {coursesState.status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            />
          ))}
        </div>
      )}

      {/* 4. Error State */}
      {coursesState.status === 'error' && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-xs text-rose-900">
            <p className="font-bold">Đã xảy ra sự cố khi tải danh sách lớp học</p>
            <p className="mt-0.5 text-rose-700">{coursesState.error}</p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 text-xs font-semibold text-rose-900 shadow-sm transition-colors hover:bg-rose-100"
          >
            <RefreshCw className="size-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* 5. Empty State */}
      {coursesState.status === 'success' && totalItems === 0 && (
        <StudentEmptyState
          icon={BookOpen}
          title="Không tìm thấy lớp học nào"
          description={
            search.trim()
              ? `Không có kết quả nào phù hợp với từ khóa "${search}". Hãy thử tìm kiếm với tên môn hoặc mã môn khác.`
              : activeTab === 'ENROLLED'
              ? 'Bạn chưa tham gia lớp học nào. Hãy chuyển sang tab "Tất cả lớp học" và bấm tham gia lớp.'
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
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <KeyRound className="size-4" />
                <span>Nhập mã lớp để tham gia</span>
              </button>
            )
          }
        />
      )}

      {/* 6. Danh sách lớp học dạng lưới nhỏ gọn & Phân trang */}
      {coursesState.status === 'success' && totalItems > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedCourses.map((course) => (
              <StudentCourseCard
                key={course.id}
                course={course}
                onOpenJoinModal={openJoinModal}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
            <p className="text-xs text-slate-500">
              Hiển thị <strong className="font-semibold text-slate-800">{startIndex + 1}</strong> -{' '}
              <strong className="font-semibold text-slate-800">{Math.min(startIndex + PAGE_SIZE, totalItems)}</strong>{' '}
              trên tổng số <strong className="font-semibold text-slate-800">{totalItems}</strong> lớp học
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

      {/* 7. Modal Tham gia lớp học */}
      <CourseJoinModal
        open={joinModalOpen}
        onClose={closeJoinModal}
        targetCourse={selectedCourseForJoin}
        onJoin={joinCourse}
      />
    </div>
  );
}
