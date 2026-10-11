'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, FileCode2 } from 'lucide-react';
import { Course } from '../types/course.types';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DynamicJoinCodeCard } from './DynamicJoinCodeCard';
import { CourseTelemetryStats } from './CourseTelemetryStats';
import { EnrolledStudentsTable } from './EnrolledStudentsTable';
import { QrCodeModal } from './QrCodeModal';

interface CourseDetailManagementProps {
  course: Course;
  onBackToOverview: () => void;
  onShowToast: (msg: string) => void;
}

export const CourseDetailManagement: React.FC<CourseDetailManagementProps> = ({
  course: initialCourse,
  onBackToOverview,
  onShowToast,
}) => {
  const router = useRouter();
  const {
    course,
    joinCode,
    formattedCountdown,
    isEnrollOpen,
    isQrModalOpen,
    setIsQrModalOpen,
    studentSearch,
    setStudentSearch,
    studentStatusFilter,
    setStudentStatusFilter,
    isShowingEmptyStateDemo,
    filteredEnrollments,
    regenerateCode,
    copyCodeToClipboard,
    toggleEnrollmentStatus,
    removeStudent,
    toggleEmptyStateDemo,
  } = useCourseDetail({
    courseId: initialCourse.id,
    initialCourse,
  });

  const activeCourse = course || initialCourse;

  // Real Handoff Handlers for Assignment & PE Exam (Connected to Bao's module)
  const handleTriggerHandoff = (type: 'ASSIGNMENT' | 'PE_EXAM') => {
    if (type === 'ASSIGNMENT') {
      onShowToast("Đang chuyển tiếp sang Module 'Tạo Assignment'...");
      router.push(`/exam-bank/create?courseId=${activeCourse.id}&type=ASSIGNMENT`);
    } else {
      onShowToast("Đang chuyển tiếp sang Module 'Tạo Đề Thi PE'...");
      router.push(`/exam-bank/create?courseId=${activeCourse.id}&courseCode=${activeCourse.code}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 w-full max-w-full">
      {/* CỤM 1: Header & Action Bar */}
      <Card className="bg-white p-5 rounded-2xl border-slate-200/90 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
        {/* Bên trái: Breadcrumb + Tiêu đề & Mã môn */}
        <div className="space-y-1.5 min-w-0">
          <Button
            variant="ghost"
            onClick={onBackToOverview}
            className="h-auto p-0 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-transparent transition"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Tổng quan khóa học</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight break-words">
              {activeCourse.name}
            </h1>
            <Badge
              variant="outline"
              className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold font-mono bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0"
            >
              {activeCourse.code} • SE19C
            </Badge>
            <Badge
              variant={activeCourse.isActive ? 'default' : 'secondary'}
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                activeCourse.isActive
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeCourse.isActive ? 'Active' : 'Archived'}
            </Badge>
          </div>

          <p className="text-xs text-slate-500 break-words leading-relaxed">
            Giảng viên: <strong>{activeCourse.lecturer?.fullName || 'TS. Nguyễn Văn Điệp'}</strong> • Học kỳ: <strong>{activeCourse.semester}</strong> • Phòng: <strong>{activeCourse.room || 'AL-L402'}</strong>
          </p>
        </div>

        {/* Bên phải: 2 Action Buttons (ĐỒNG BỘ TUYỆT ĐỐI KÍCH THƯỚC: h-10 px-4 font-bold text-xs) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 xl:pt-0">
          {/* Button Phụ: [+ Tạo Assignment] */}
          <Button
            variant="outline"
            onClick={() => handleTriggerHandoff('ASSIGNMENT')}
            className="h-10 px-4 rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs hover:border-slate-400 active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap"
            title="Kích hoạt placeholder mở module Assignment của đồng đội"
          >
            <Plus className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Tạo Assignment</span>
          </Button>

          {/* Button Chính: [+ Tạo đề thi PE] */}
          <Button
            onClick={() => handleTriggerHandoff('PE_EXAM')}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap"
            title="Kích hoạt placeholder mở module Đề thi PE của đồng đội"
          >
            <FileCode2 className="w-4 h-4 text-indigo-100 shrink-0" />
            <span>Tạo Đề Thi PE</span>
          </Button>
        </div>
      </Card>

      {/* CỤM 2: Khu vực Quản lý Mã tham gia động (Dynamic Join Code / OTP Card) */}
      <DynamicJoinCodeCard
        joinCode={joinCode}
        formattedCountdown={formattedCountdown}
        isEnrollOpen={isEnrollOpen}
        onCopyCode={copyCodeToClipboard}
        onRegenerateCode={regenerateCode}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onToggleEnroll={toggleEnrollmentStatus}
      />

      {/* CỤM 3: Thông số khóa học (Spacious Vertical Layout) */}
      <CourseTelemetryStats
        enrolledCount={activeCourse.enrolledStudentsCount || activeCourse._count?.enrollments || 38}
        capacity={activeCourse.capacity || 40}
        attendanceRate={94.5}
      />

      {/* CỤM 4: Danh sách sinh viên tham gia */}
      <EnrolledStudentsTable
        enrollments={filteredEnrollments}
        studentSearch={studentSearch}
        onSearchChange={setStudentSearch}
        statusFilter={studentStatusFilter}
        onStatusFilterChange={setStudentStatusFilter}
        isShowingEmptyStateDemo={isShowingEmptyStateDemo}
        onToggleEmptyStateDemo={toggleEmptyStateDemo}
        joinCode={joinCode}
        onRemoveStudent={removeStudent}
        onShowToast={onShowToast}
      />

      {/* QR Code Presentation Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        joinCode={joinCode}
        courseCode={activeCourse.code}
        courseName={activeCourse.name}
        formattedCountdown={formattedCountdown}
      />
    </div>
  );
};
