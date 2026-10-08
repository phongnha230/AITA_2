'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  FileCode,
  Bell,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { assignmentService } from '../../features/assignments/services/assignment.service';

interface LecturerLayoutProps {
  children: React.ReactNode;
}

export const LecturerLayout: React.FC<LecturerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    assignmentService.ensureLecturerAuth().then(() => {
      setIsReady(true);
    });
  }, []);

  const navItems = [
    {
      label: 'Tổng quan giảng dạy',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard' || pathname === '/',
    },
    {
      label: 'Phòng thi trực tiếp',
      href: '/live-proctoring',
      icon: Radio,
      active: pathname === '/live-proctoring',
      badge: 'Live',
    },
    {
      label: 'Ngân hàng đề & Testcase PE',
      href: '/exam-bank',
      icon: FileCode,
      active: pathname.startsWith('/exam-bank'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        {/* Main top bar */}
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="hover:text-slate-800 transition cursor-pointer">Cổng Giảng viên</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-900 font-semibold">Bàn làm việc giảng huấn</span>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Bell notification */}
            <button
              title="Thông báo"
              className="relative p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                HN
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <div className="font-semibold text-slate-900">Thầy Hoàng Nam</div>
                <div className="text-slate-500 text-[11px]">Khoa CNTT</div>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 tracking-wide">
                GIẢNG VIÊN / LECTURER
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/dashboard';
                }
              }}
              title="Đăng xuất"
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>

        {/* Proctoring Subnet & Realtime Status Bar (Matching Image 1 & 2) */}
        <div className="bg-[#F0FDF4] border-t border-emerald-100 px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider">
              HỆ THỐNG PROCTORING TRỰC TIẾP
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium text-[11px]">
              Subnet LAB304: 192.168.14.0/24 (Kiosk Mode Khóa Toàn Phần)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Tần suất làm mới:</span>
            <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              Realtime (WebSocket 50ms)
            </span>
          </div>
        </div>
      </header>

      {/* 2. BODY WITH SIDEBAR & CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR (Desktop) */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Title */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                    AITA EXAM
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    LECTURER WORKSPACE
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Group */}
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Quản lý Giảng viên
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        item.active
                          ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            item.active ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Docker Sandbox Widget (Matching Image 1 & 2) */}
          <div className="p-3 border-t border-slate-100 m-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Docker Sandbox</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                ● 99.9%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[99.9%]"></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Hạ tầng: Sẵn sàng</span>
              <a
                href="#help"
                className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
              >
                Hỗ trợ <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
