'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileCode,
  Radio,
  Bot,
  LogOut,
  X,
  Cpu,
  KeyRound,
} from 'lucide-react';
import { type User } from '@/features/auth/services/auth.service';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
  const isOverviewActive =
    pathname === ROUTES.LECTURER.DASHBOARD ||
    pathname === ROUTES.LECTURER.COURSES ||
    pathname === '/dashboard' ||
    pathname === '/courses' ||
    pathname === ROUTES.PUBLIC.HOME;
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

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col min-h-0">
          {/* Logo Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <Link
              href={ROUTES.LECTURER.DASHBOARD}
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition">
                AI
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block group-hover:text-indigo-200 transition">
                  AITA System
                </span>
                <span className="text-xs text-slate-400 font-medium">Cổng giảng viên</span>
              </div>
            </Link>
            <button
              aria-label="Đóng sidebar"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Role Pill */}
          <div className="my-4 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Lecturer Portal
            </span>
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs overflow-y-auto pr-1">
            <Link
              href={ROUTES.LECTURER.DASHBOARD}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition text-left ${
                isOverviewActive
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="size-4 shrink-0" />
              <span>Tổng quan khóa học</span>
            </Link>

            <Link
              href={ROUTES.LECTURER.EXAM_BANK}
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition text-left ${
                isExamBankActive
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode className="size-4 shrink-0" />
                <span>Ngân hàng đề & Testcase PE</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-indigo-500/20 text-indigo-300">
                DB
              </span>
            </Link>

            <Link
              href={ROUTES.LECTURER.LIVE_PROCTORING}
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition text-left group ${
                isLiveProctoringActive
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio
                  className={`size-4 shrink-0 ${
                  isLiveProctoringActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>Quản lý ca thi</span>
              </div>
            </Link>

            <button
              onClick={onOpenAiConfig}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition text-left group"
            >
              <Bot className="size-4 shrink-0 text-indigo-400 group-hover:scale-110 transition" />
              <span>Cấu hình AI Tutor</span>
            </button>
          </nav>
        </div>

        {/* Bottom Docker Sandbox Widget & Lecturer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* Docker Sandbox Widget */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Cpu className="size-3.5 text-emerald-400" />
                <span>Docker Sandbox</span>
              </div>
              <span className="text-xs font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                Chưa kiểm tra
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Chưa có trạng thái Docker trực tiếp</span>
            </div>
          </div>

          {/* User Profile Box */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="size-9 rounded-xl bg-indigo-600 text-white font-black text-xs shrink-0 shadow">
                <AvatarFallback className="bg-indigo-600 text-white font-black text-xs rounded-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.fullName || 'Giảng viên AITA'}
                </p>
                <p className="text-xs text-slate-400 font-mono truncate">
                  {currentUser?.email || 'Chưa cập nhật email'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenChangePassword}
                className="size-8 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition"
                title="Đổi mật khẩu"
              >
                <KeyRound className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="size-8 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
                title="Đăng xuất"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
