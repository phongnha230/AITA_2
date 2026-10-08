'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Terminal,
  Bot,
  Plus,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Course } from '../types/course.types';
import { useCourses } from '../hooks/useCourses';
import { CoursesOverview } from './CoursesOverview';
import { CourseDetailManagement } from './CourseDetailManagement';
import { CreateCourseModal } from './CreateCourseModal';
import { authService, type User } from '@/features/auth/services/auth.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LecturerDashboardProps {
  initialCourseId?: string;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ initialCourseId }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getStoredUser();
    if (user) {
      setCurrentUser(user);
    } else {
      authService.getCurrentUser().then((u) => {
        if (u) setCurrentUser(u);
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      router.replace('/login');
    }
  };

  const userInitials = (currentUser?.fullName || 'Giảng Viên')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'GV';

  const {
    courses,
    kpiMetrics,
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

  // Mobile sidebar open
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    setIsMobileSidebarOpen(false);
  };

  const handleBackToOverview = () => {
    setActiveTab('OVERVIEW');
    setIsMobileSidebarOpen(false);
  };

  // Currently managed course
  const currentCourse = selectedCourse || courses[0] || null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
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

      {/* MOBILE BACKDROP */}
      {isMobileSidebarOpen && (
        <button
          aria-label="Đóng menu điều hướng"
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer w-full h-full border-none p-0"
        />
      )}

      {/* SIDEBAR: DARK SLATE (#0f172a) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5">
          {/* Logo Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
                AI
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  AITA System
                </span>
                <span className="text-[11px] text-slate-400 font-medium">SWD392 FPT • SE19C</span>
              </div>
            </div>
            <button
              aria-label="Đóng sidebar"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Pill */}
          <div className="my-4 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Lecturer Portal
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs">
            <button
              onClick={() => {
                setActiveTab('OVERVIEW');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition text-left ${
                activeTab === 'OVERVIEW'
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tổng quan khóa học</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('DETAIL');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition text-left ${
                activeTab === 'DETAIL'
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Quản lý lớp ({currentCourse?.code || 'SWD392'})</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/30 text-indigo-200">
                ACTIVE
              </span>
            </button>

            <button
              onClick={() => showToast('Mở Module Ngân hàng bài tập')}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition text-left"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Ngân hàng bài tập</span>
            </button>

            <button
              onClick={() => showToast('Mở Module Đề thi PE & Kỳ thi')}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition text-left"
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>Đề thi PE & Kỳ thi</span>
            </button>

            <button
              onClick={() => showToast('Mở Module Cấu hình AI Tutor')}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition text-left"
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Cấu hình AI Tutor</span>
            </button>
          </nav>
        </div>

        {/* Lecturer Profile Box at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-xs shrink-0 shadow">
                <AvatarFallback className="bg-indigo-600 text-white font-black text-xs rounded-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.fullName || 'Giảng viên AITA'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  {currentUser?.email || 'lecturer@fpt.edu.vn'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-100">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              aria-label="Mở menu điều hướng"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>AITA LMS</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-800">
                {activeTab === 'OVERVIEW'
                  ? 'Tổng quan khóa học'
                  : `Quản lý lớp (${currentCourse?.code || 'SWD392'})`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              <span>Học kỳ:</span>
              <strong className="text-slate-900">Fall 2026</strong>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => showToast('Bạn không có thông báo mới nào')}
              className="h-9 w-9 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition relative"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </Button>

            {/* CTA Tạo Khóa Học */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tạo Khóa Học</span>
            </Button>
          </div>
        </header>

        {/* Dynamic View rendering */}
        <div className="flex-1">
          {activeTab === 'OVERVIEW' ? (
            <CoursesOverview
              courses={courses}
              kpiMetrics={kpiMetrics}
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
            <CourseDetailManagement
              course={currentCourse}
              onBackToOverview={handleBackToOverview}
              onShowToast={showToast}
            />
          ) : null}
        </div>
      </main>

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
