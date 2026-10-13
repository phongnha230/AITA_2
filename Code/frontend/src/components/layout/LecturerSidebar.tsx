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
    pathname === '/dashboard' || pathname === '/courses' || pathname === '/';
  const isExamBankActive = pathname.startsWith('/exam-bank');
  const isLiveProctoringActive = pathname.startsWith('/live-proctoring');

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
              href="/dashboard"
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition">
                AI
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block group-hover:text-indigo-200 transition">
                  AITA System
                </span>
                <span className="text-[11px] text-slate-400 font-medium">SWD392 FPT • SE19C</span>
              </div>
            </Link>
            <button
              aria-label="Đóng sidebar"
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
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
          <nav className="space-y-1.5 text-xs overflow-y-auto pr-1">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition text-left ${
                isOverviewActive
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Tổng quan khóa học</span>
            </Link>

            <Link
              href="/exam-bank"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition text-left ${
                isExamBankActive
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 shrink-0" />
                <span>Ngân hàng đề & Testcase PE</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                DB
              </span>
            </Link>

            <Link
              href="/live-proctoring"
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold transition text-left group ${
                isLiveProctoringActive
                  ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio
                  className={`w-4 h-4 shrink-0 ${
                    isLiveProctoringActive ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-300'
                  }`}
                />
                <span>Phòng thi trực tiếp</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            </Link>

            <button
              onClick={onOpenAiConfig}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition text-left group"
            >
              <Bot className="w-4 h-4 shrink-0 text-indigo-400 group-hover:scale-110 transition" />
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
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Docker Sandbox</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                99.9% Ready
              </span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-1.5 mb-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full w-[99.9%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Hạ tầng: Sẵn sàng</span>
              <span className="text-indigo-400 flex items-center gap-0.5 font-medium">
                Kiosk On
              </span>
            </div>
          </div>

          {/* User Profile Box */}
          <div className="flex items-center justify-between pt-1">
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
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenChangePassword}
                className="h-8 w-8 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition"
                title="Đổi mật khẩu"
              >
                <KeyRound className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
