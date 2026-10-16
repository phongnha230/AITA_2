'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, FileCode2, UserPlus, Users, Users2, Radio } from 'lucide-react';

import { Course } from '../types/course.types';
import { useCourseDetail } from '../hooks/useCourseDetail';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DynamicJoinCodeCard } from './DynamicJoinCodeCard';
import { CourseTelemetryStats } from './CourseTelemetryStats';
import { EnrolledStudentsTable } from './EnrolledStudentsTable';
import { QrCodeModal } from './QrCodeModal';
import { BatchEnrollModal } from './BatchEnrollModal';
import { CourseTeamsTab } from '@/features/teams/components/CourseTeamsTab';


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
    loading: courseLoading,
    error: courseError,
    joinCode,
    formattedCountdown,
    isEnrollOpen,
    isQrModalOpen,
    setIsQrModalOpen,
    studentSearch,
    setStudentSearch,
    studentStatusFilter,
    setStudentStatusFilter,
    filteredEnrollments,
    regenerateCode,
    copyCodeToClipboard,
    toggleEnrollmentStatus,
    removeStudent,
  } = useCourseDetail({
    courseId: initialCourse.id,
    initialCourse,
  });

  const [activeTab, setActiveTab] = useState<'ROSTER' | 'TEAMS'>('ROSTER');
  const [isBatchEnrollOpen, setIsBatchEnrollOpen] = useState(false);

  const activeCourse = course || initialCourse;


  // Real Handoff Handlers for Assignment & PE Exam (Connected to Bao's module)
  const handleTriggerHandoff = (type: 'ASSIGNMENT' | 'PE_EXAM') => {
    if (type === 'ASSIGNMENT') {
      onShowToast("Đang chuyển tiếp sang Module 'Tạo Assignment'...");
      router.push(`/exam-bank/create?courseId=${encodeURIComponent(activeCourse.id)}&type=ASSIGNMENT`);
    } else {
      onShowToast("Đang chuyển tiếp sang Module 'Tạo Đề Thi PE'...");
      router.push(`/exam-bank/create?courseId=${encodeURIComponent(activeCourse.id)}&type=PE_EXAM`);
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
              {activeCourse.code}
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
            Giảng viên: <strong>{activeCourse.lecturer?.fullName || 'Chưa phân công'}</strong> • Học kỳ: <strong>{activeCourse.semester}</strong> • Phòng: <strong>{activeCourse.room || 'Chưa cập nhật'}</strong>
          </p>
        </div>

        {/* Bên phải: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 xl:pt-0">
          {/* Button: [+ Ghi danh học viên] */}
          <Button
            variant="outline"
            onClick={() => setIsBatchEnrollOpen(true)}
            className="h-10 px-3.5 rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs hover:border-slate-400 active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            title="Ghi danh học viên theo danh sách ID"
          >
            <UserPlus className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Ghi danh học viên</span>
          </Button>

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

          {/* Button Giám sát ca thi trực tiếp */}
          <Button
            asChild
            className="h-10 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs active:scale-95 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            title="Vào màn hình giám sát ca thi trực tiếp"
          >
            <Link href="/live-proctoring">
              <Radio className="w-4 h-4 text-white shrink-0 animate-pulse" />
              <span>🔴 Giám Sát Ca Thi</span>
            </Link>
          </Button>
        </div>
      </Card>

      {courseLoading && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Đang tải thông tin và danh sách sinh viên…</p>
      )}
      {courseError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Không thể tải dữ liệu mới nhất của khóa học: {courseError}</p>
      )}


      {/* CỤM TAB: Phân đoạn Roster và Teams */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('ROSTER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ROSTER'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách sinh viên (Roster)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEAMS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'TEAMS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Nhóm đồ án &amp; Bài tập lớn (Teams)</span>
        </button>
      </div>

      {activeTab === 'ROSTER' ? (
        <>
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
            enrolledCount={course?.enrollments?.length ?? activeCourse.enrollmentCount ?? activeCourse._count?.enrollments ?? 0}
            capacity={activeCourse.capacity}
          />

          {/* CỤM 4: Danh sách sinh viên tham gia */}
          <EnrolledStudentsTable
            enrollments={filteredEnrollments}
            courseCode={activeCourse.code}
            studentSearch={studentSearch}
            onSearchChange={setStudentSearch}
            statusFilter={studentStatusFilter}
            onStatusFilterChange={setStudentStatusFilter}
            joinCode={joinCode}
            onRemoveStudent={removeStudent}
            onShowToast={onShowToast}
          />
        </>
      ) : (
        <CourseTeamsTab
          courseId={activeCourse.id}
          courseName={activeCourse.name}
          onShowToast={onShowToast}
        />
      )}

      {/* QR Code Presentation Modal */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        joinCode={joinCode}
        courseCode={activeCourse.code}
        courseName={activeCourse.name}
        formattedCountdown={formattedCountdown}
      />

      {/* Batch Enroll Modal */}
      <BatchEnrollModal
        courseId={activeCourse.id}
        courseName={activeCourse.name}
        isOpen={isBatchEnrollOpen}
        onClose={() => setIsBatchEnrollOpen(false)}
        onSuccess={(count) => onShowToast(`Đã ghi danh ${count} học viên vào lớp thành công!`)}
      />
    </div>
  );

};
