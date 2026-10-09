'use client';

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Course } from '../types/course.types';
import { useCourses } from '../hooks/useCourses';
import { CoursesOverview } from './CoursesOverview';
import { CourseDetailManagement } from './CourseDetailManagement';
import { CreateCourseModal } from './CreateCourseModal';

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
  } = useCourses();

  // Active view: 'OVERVIEW' | 'DETAIL'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DETAIL'>(
    initialCourseId ? 'DETAIL' : 'OVERVIEW'
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Create course modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
          <button
            aria-label="Đóng thông báo"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dynamic View rendering */}
      {activeTab === 'OVERVIEW' ? (
        <CoursesOverview
          courses={courses}
          kpiMetrics={kpiMetrics}
          recentSubmissions={recentSubmissions}
          semesters={semesters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectCourse={handleSelectCourse}
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
    </div>
  );
};
