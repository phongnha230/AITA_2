'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, GraduationCap, Headphones, X } from 'lucide-react';
import { STUDENT_NAV_ITEMS } from './student-navigation';

interface StudentSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function StudentSidebar({
  mobile = false,
  onNavigate,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const sidebarId = mobile ? 'student-mobile-navigation' : 'student-desktop-navigation';

  return (
    <aside
      id={sidebarId}
      aria-label="Điều hướng Student Portal"
      aria-modal={mobile || undefined}
      role={mobile ? 'dialog' : undefined}
      className={
        mobile
          ? 'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-slate-200 bg-white px-4 py-5 shadow-xl lg:hidden'
          : 'fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex'
      }
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20">
            <GraduationCap aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-slate-900">AITA EXAM</p>
            <p className="text-[10px] font-semibold tracking-wider uppercase text-blue-600">Assessment Portal</p>
          </div>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Đóng menu điều hướng"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mt-6">
        <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">
          Menu Đào tạo &amp; Khảo thí
        </p>
        <nav aria-label="Điều hướng sinh viên" className="mt-2.5 space-y-1.5">
          {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-blue-600 font-bold text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {isActive && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                    <Check aria-hidden="true" className="h-3 w-3" />
                    <span className="sr-only">Trang hiện tại</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/70 to-blue-50/30 p-3.5 text-xs shadow-elevated-sm">
          <p className="font-bold text-blue-950">Hạ tầng Khảo thí AITA</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            Môi trường Sandbox cô lập &amp; Đánh giá Rubric tự động kết nối máy chủ khảo thí.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống PE trực tuyến
          </div>
        </div>
        <Link
          href="/student/exams"
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Headphones aria-hidden="true" className="h-4 w-4 text-slate-400" />
          <span>Quy chế thi PE &amp; Hỗ trợ</span>
        </Link>
      </div>
    </aside>
  );
}
