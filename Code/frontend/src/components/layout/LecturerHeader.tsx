'use client';

import React from 'react';
import { Menu, ChevronRight, Bell, LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROUTES } from '@/config/routes';
import type { User } from '@/features/auth/services/auth.service';

interface LecturerHeaderProps {
  onOpenMobileSidebar: () => void;
  pathname: string;
  onShowToast: (msg: string) => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const LecturerHeader: React.FC<LecturerHeaderProps> = ({
  onOpenMobileSidebar,
  pathname,
  onShowToast,
  currentUser,
  onLogout,
}) => {
  const isDashboardActive =
    pathname === ROUTES.LECTURER.DASHBOARD ||
    pathname === '/dashboard' ||
    pathname === '/';

  const isCoursesActive =
    pathname === ROUTES.LECTURER.COURSES ||
    pathname === '/courses' ||
    pathname.startsWith('/courses/') ||
    pathname.startsWith('/lecturer/courses');

  const isExamBankActive =
    pathname.startsWith(ROUTES.LECTURER.EXAM_BANK) || pathname.startsWith('/exam-bank');

  const isLiveProctoringActive =
    pathname.startsWith(ROUTES.LECTURER.LIVE_PROCTORING) || pathname.startsWith('/live-proctoring');

  const getBreadcrumbTitle = () => {
    if (isDashboardActive) return 'Tổng quan';
    if (isCoursesActive) return 'Quản lý khóa học';
    if (isExamBankActive) return 'Ngân hàng đề & Testcase PE';
    if (isLiveProctoringActive) return 'Quản lý ca thi';
    return 'Bàn làm việc Giảng viên';
  };

  const pageTitle = getBreadcrumbTitle();

  const userInitials =
    (currentUser?.fullName || 'Giảng Viên')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'GV';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-sm sm:px-6 xl:px-8">
      {/* Left section: Mobile menu + Breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Mở menu điều hướng"
          onClick={onOpenMobileSidebar}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
            <li className="shrink-0 text-slate-400">Cổng Giảng viên</li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5 text-slate-300" />
            </li>
            <li className="shrink-0 text-slate-500">AITA Portal</li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5 text-slate-300" />
            </li>
            <li
              aria-current="page"
              className="truncate rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-800"
            >
              {pageTitle}
            </li>
          </ol>
        </nav>
        <p className="truncate text-sm font-semibold text-slate-900 sm:hidden">{pageTitle}</p>
      </div>

      {/* Right section: Semester info + Notifications + Profile */}
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {/* Semester badge */}
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Học kỳ:</span>
          <strong className="text-slate-900">Fall 2026</strong>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onShowToast('Bạn không có thông báo mới nào')}
          className="relative size-9 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title="Thông báo"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
        </Button>

        {/* User Profile Bar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          {currentUser ? (
            <div className="hidden text-right sm:block">
              <p className="max-w-44 truncate text-xs font-bold text-slate-900">
                {currentUser.fullName || 'Giảng viên AITA'}
              </p>
              <p className="max-w-48 truncate text-[11px] text-slate-500 font-mono">
                {currentUser.email}
              </p>
            </div>
          ) : (
            <span className="hidden text-xs font-medium text-slate-500 sm:block">
              Tài khoản Giảng viên
            </span>
          )}

          <span className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 sm:inline-flex">
            GIẢNG VIÊN
          </span>

          <Avatar className="size-9 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-2xs ring-2 ring-indigo-600/10">
            <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs rounded-xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
