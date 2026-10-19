'use client';

import React, { useState } from 'react';
import { Pencil, Sparkles, X } from 'lucide-react';
import { Course, UpdateCoursePayload } from '../types/course.types';
import { useCourses } from '../hooks/useCourses';
import { CoursesOverview } from './CoursesOverview';
import { CourseDetailManagement } from './CourseDetailManagement';
import { CreateCourseModal } from './CreateCourseModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LecturerDashboardProps {
  initialCourseId?: string;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ initialCourseId }) => {
  const {
    courses,
    kpiMetrics,
    recentSubmissions,
    semesters,
    searchQuery,
    setSearchQuery,
    selectedSemester,
    setSelectedSemester,
    statusFilter,
    setStatusFilter,
    createCourse,
    updateCourse,
    deleteCourse,
    error,
  } = useCourses();

  // Active view: 'OVERVIEW' | 'DETAIL'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DETAIL'>(
    initialCourseId ? 'DETAIL' : 'OVERVIEW'
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Create course modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseBeingEdited, setCourseBeingEdited] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editSemester, setEditSemester] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('DETAIL');
  };

  const handleBackToOverview = () => {
    setActiveTab('OVERVIEW');
  };

  const handleOpenEdit = (course: Course) => {
    setCourseBeingEdited(course);
    setEditName(course.name);
    setEditSemester(course.semester);
    setEditIsActive(course.isActive);
    setEditError(null);
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseBeingEdited || !editName.trim() || !editSemester.trim()) {
      setEditError('Vui lòng nhập tên khóa học và học kỳ.');
      return;
    }
    setIsSavingEdit(true);
    setEditError(null);
    try {
      const payload: UpdateCoursePayload = {
        name: editName.trim(),
        semester: editSemester.trim(),
        isActive: editIsActive,
      };
      await updateCourse(courseBeingEdited.id, payload);
      showToast('Đã cập nhật khóa học.');
      setCourseBeingEdited(null);
    } catch (error: unknown) {
      setEditError(error instanceof Error ? error.message : 'Không thể cập nhật khóa học.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`Xóa khóa học ${course.code} – ${course.name}? Thao tác này không thể hoàn tác.`)) return;
    try {
      await deleteCourse(course.id);
      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
        setActiveTab('OVERVIEW');
      }
      showToast(`Đã xóa khóa học ${course.code}.`);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Không thể xóa khóa học.');
    }
  };

  // Currently managed course
  const currentCourse =
    selectedCourse ||
    (initialCourseId ? courses.find((c) => c.id === initialCourseId) : null) ||
    courses[0] ||
    null;

  return (
    <div className="w-full min-h-full font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <Sparkles className="size-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
          <button
            aria-label="Đóng thông báo"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Dynamic View rendering */}
      {activeTab === 'OVERVIEW' ? (
        <CoursesOverview
          courses={courses}
          kpiMetrics={kpiMetrics}
          dashboardError={error}
          recentSubmissions={recentSubmissions}
          semesters={semesters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectCourse={handleSelectCourse}
          onEditCourse={handleOpenEdit}
          onDeleteCourse={handleDeleteCourse}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      ) : currentCourse ? (
        <div className="w-full">
          <CourseDetailManagement
            course={currentCourse}
            onBackToOverview={handleBackToOverview}
            onShowToast={showToast}
          />
        </div>
      ) : null}

      {/* Modal Tạo Khóa Học */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (payload) => {
          await createCourse(payload);
          showToast(`Đã tạo khóa học ${payload.code} thành công!`);
        }}
      />

      <Dialog open={Boolean(courseBeingEdited)} onOpenChange={(open) => !open && setCourseBeingEdited(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Pencil className="size-4 text-indigo-600" /> Sửa khóa học</DialogTitle>
            <DialogDescription>Mã môn {courseBeingEdited?.code} không thể thay đổi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {editError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{editError}</p>}
            <label className="block space-y-1.5 text-sm font-medium">Tên khóa học
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} required maxLength={200} />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">Học kỳ
              <Input value={editSemester} onChange={(event) => setEditSemester(event.target.value)} required maxLength={50} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={editIsActive} onChange={(event) => setEditIsActive(event.target.checked)} />
              Khóa học đang mở
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCourseBeingEdited(null)} disabled={isSavingEdit}>Hủy</Button>
              <Button type="submit" disabled={isSavingEdit || !editName.trim() || !editSemester.trim()}>{isSavingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
