'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  FileCode,
  Radio,
  Bot,
  LogOut,
  X,
  Check,
  GraduationCap,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { type User } from '@/features/auth/services/auth.service';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROUTES } from '@/config/routes';

interface LecturerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  currentUser: User | null;
  onOpenAiConfig: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const LecturerSidebar: React.FC<LecturerSidebarProps> = ({
  isOpen,
  onClose,
  pathname,
  currentUser,
  onOpenAiConfig,
  onOpenChangePassword,
  onLogout,
}) => {
  const isDashboardActive =
    pathname === ROUTES.LECTURER.DASHBOARD ||
    pathname === '/dashboard' ||
    pathname === ROUTES.PUBLIC.HOME;

  const isCoursesActive =
    pathname === ROUTES.LECTURER.COURSES ||
    pathname.startsWith('/lecturer/courses/') ||
    pathname === '/courses' ||
    pathname.startsWith('/courses/');

  const isExamBankActive =
    pathname.startsWith(ROUTES.LECTURER.EXAM_BANK) || pathname.startsWith('/exam-bank');

  const isLiveProctoringActive =
    pathname.startsWith(ROUTES.LECTURER.LIVE_PROCTORING) || pathname.startsWith('/live-proctoring');

  const userInitials =
    (currentUser?.fullName || 'Giảng Viên')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'GV';

  // 5 thanh điều hướng trên Taskbar
  const NAV_ITEMS = [
    {
      href: ROUTES.LECTURER.DASHBOARD,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      isActive: isDashboardActive,
      badge: null,
    },
    {
      href: ROUTES.LECTURER.COURSES,
      label: 'Quản lý khóa học',
      icon: BookOpen,
      isActive: isCoursesActive,
      badge: null,
    },
    {
      href: ROUTES.LECTURER.EXAM_BANK,
      label: 'Ngân hàng đề & Testcase PE',
      icon: FileCode,
      isActive: isExamBankActive,
      badge: 'PE',
    },
    {
      href: ROUTES.LECTURER.LIVE_PROCTORING,
      label: 'Quản lý ca thi',
      icon: Radio,
      isActive: isLiveProctoringActive,
      badge: 'LIVE',
    },
    {
      href: ROUTES.LECTURER.AI_TUTOR,
      label: 'Cấu hình AI Tutor',
      icon: Bot,
      isActive: pathname.startsWith('/lecturer/ai-tutor'),
      badge: 'AI',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          aria-label="Đóng menu điều hướng"
          type="button"
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer w-full h-full border-none p-0"
        />
      )}

      {/* Main Sidebar - Clean White Theme synchronous with Student Portal */}
      <aside
        id="lecturer-navigation"
        aria-label="Điều hướng Lecturer Portal"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[264px] bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 sm:p-5 flex flex-col min-h-0">
          {/* Logo Brand Header */}
          <div className="flex h-14 items-center justify-between border-b border-slate-100 pb-4">
            <Link
              href={ROUTES.LECTURER.DASHBOARD}
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20 group-hover:bg-indigo-700 transition">
                <GraduationCap className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                  AITA PORTAL
                </p>
                <p className="text-xs font-semibold text-indigo-600">Lecturer Workspace</p>
              </div>
            </Link>
            <button
              aria-label="Đóng sidebar"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Role Status Tag */}
          <div className="my-4 px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">Giảng viên phân công</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200/60 shadow-2xs">
              Giảng dạy
            </span>
          </div>

          {/* 5 Navigation Links on Taskbar */}
          <div className="mt-1">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu Quản trị Giảng dạy
            </p>
            <nav aria-label="Điều hướng giảng viên" className="mt-2.5 space-y-1.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon, isActive, badge }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                    isActive
                      ? 'bg-indigo-600 font-bold text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`size-[18px] shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {badge && !isActive && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        badge === 'LIVE'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                      <Check aria-hidden="true" className="size-3" />
                      <span className="sr-only">Trang hiện tại</span>
                    </span>
                  )}
                </Link>
              ))}

              
            </nav>
          </div>
        </div>

        {/* Bottom Profile & System Status Widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
          {/* AI Assistance Badge */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkles className="size-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800">Socratic AI Grading</p>
                <p className="text-[10px] text-slate-400">Gemini &amp; Sandbox Active</p>
              </div>
            </div>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-9 rounded-xl bg-indigo-600 text-white font-black text-xs shrink-0 shadow-2xs ring-2 ring-indigo-600/10">
                <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs rounded-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.fullName || 'Giảng viên'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {currentUser?.email || 'lecturer@aita.edu.vn'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onOpenChangePassword}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-2xs border border-transparent hover:border-slate-200 transition"
                title="Đổi mật khẩu"
                aria-label="Đổi mật khẩu"
              >
                <KeyRound className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 transition"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
