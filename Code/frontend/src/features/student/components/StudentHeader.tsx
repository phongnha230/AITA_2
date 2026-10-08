'use client';

import { ChevronRight, LogOut, Menu, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { RefObject } from 'react';
import { STUDENT_NAV_ITEMS } from './student-navigation';
import { StudentAvatar } from './shared/StudentAvatar';
import type { StudentProfile } from '../types/student.types';
import { authService } from '@/features/auth/services/auth.service';

interface StudentHeaderProps {
  user: StudentProfile | null;
  isLoading: boolean;
  menuOpen: boolean;
  onMenuClick: () => void;
  menuButtonRef: RefObject<HTMLButtonElement>;
}

export function StudentHeader({ user, isLoading, menuOpen, onMenuClick, menuButtonRef }: StudentHeaderProps) {
  const pathname = usePathname();
  const currentPage = STUDENT_NAV_ITEMS.find(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
  );
  const pageTitle = currentPage?.label ?? 'Sinh viên Portal';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-4 sm:px-6 xl:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          ref={menuButtonRef}
          onClick={onMenuClick}
          aria-label={menuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
          aria-expanded={menuOpen}
          aria-controls="student-mobile-navigation"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 sm:block">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
            <li className="shrink-0 text-slate-400">Cổng Sinh viên</li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5 text-slate-300" /></li>
            <li className="shrink-0 text-slate-500">AITA Portal</li>
            <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5 text-slate-300" /></li>
            <li aria-current="page" className="truncate rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-800">
              {pageTitle}
            </li>
          </ol>
        </nav>
        <p className="truncate text-sm font-semibold text-slate-900 sm:hidden">{pageTitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div role="status" aria-label="Đang tải hồ sơ" className="hidden space-y-1.5 sm:block text-right">
              <span className="ml-auto block h-3.5 w-28 animate-pulse rounded bg-slate-100" />
              <span className="ml-auto block h-3 w-36 animate-pulse rounded bg-slate-100" />
            </div>
          ) : user ? (
            <div className="hidden text-right sm:block">
              <p className="max-w-44 truncate text-sm font-bold text-slate-900">{user.fullName || 'Tài khoản sinh viên'}</p>
              <p className="max-w-48 truncate text-xs text-slate-500">{user.email}</p>
            </div>
          ) : (
            <p className="hidden text-sm font-medium text-slate-600 sm:block">Tài khoản sinh viên</p>
          )}
          {user?.role === 'STUDENT' && (
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 sm:inline-flex">
              SINH VIÊN
            </span>
          )}
          {isLoading ? (
            <span role="status" aria-label="Đang tải ảnh đại diện" className="h-9 w-9 animate-pulse rounded-full bg-slate-100 ring-2 ring-slate-100" />
          ) : user ? (
            <StudentAvatar fullName={user.fullName} avatarUrl={user.avatarUrl} />
          ) : (
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200">
              <UserRound className="h-4 w-4" />
            </span>
          )}
          {user && (
            <button
              type="button"
              onClick={() => authService.logout()}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
