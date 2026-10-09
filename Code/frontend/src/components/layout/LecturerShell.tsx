'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileCode,
  Radio,
  Bot,
  Bell,
  LogOut,
  Menu,
  X,
  Cpu,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { authService, type User } from '@/features/auth/services/auth.service';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface LecturerShellProps {
  children: React.ReactNode;
}

export const LecturerShell: React.FC<LecturerShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

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

  const userInitials =
    (currentUser?.fullName || 'Giảng Viên')
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'GV';

  const isOverviewActive =
    pathname === '/dashboard' || pathname === '/courses' || pathname === '/';
  const isExamBankActive = pathname.startsWith('/exam-bank');
  const isLiveProctoringActive = pathname.startsWith('/live-proctoring');

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{notificationToast}</span>
          <button
            aria-label="Đóng thông báo"
            onClick={() => setNotificationToast(null)}
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

      {/* UNIFIED SIDEBAR (Gemini Anti-Slop Dark Slate #0f172a) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col min-h-0">
          {/* Logo Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group"
              onClick={() => setIsMobileSidebarOpen(false)}
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
              onClick={() => setIsMobileSidebarOpen(false)}
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
              onClick={() => setIsMobileSidebarOpen(false)}
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
              onClick={() => setIsMobileSidebarOpen(false)}
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
              onClick={() => setIsMobileSidebarOpen(false)}
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </Link>

            <button
              onClick={() => showToast('Module Cấu hình AI Tutor đang hoàn thiện')}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition text-left"
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Cấu hình AI Tutor</span>
            </button>
          </nav>
        </div>

        {/* Bottom Docker Sandbox Widget & Lecturer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* Docker Sandbox Widget (From Bao's PR, integrated anti-slop) */}
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
              <div className="bg-emerald-400 h-1.5 rounded-full w-[99.9%]"></div>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-100">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-2xs">
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
              <span>AITA Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-800">
                {isOverviewActive
                  ? 'Tổng quan khóa học'
                  : isExamBankActive
                  ? 'Ngân hàng đề & Testcase PE'
                  : isLiveProctoringActive
                  ? 'Phòng thi trực tiếp'
                  : 'Bàn làm việc Giảng viên'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              <span>Học kỳ:</span>
              <strong className="text-slate-900">Fall 2026</strong>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => showToast('Bạn không có thông báo mới nào')}
              className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition relative"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </Button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
