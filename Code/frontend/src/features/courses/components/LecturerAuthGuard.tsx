'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoaderCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { authService, type User } from '@/features/auth/services/auth.service';

interface LecturerAuthGuardProps {
  children: ReactNode;
}

export function LecturerAuthGuard({ children }: LecturerAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      // Check stored user first for fast hydration
      let currentUser = authService.getStoredUser();

      // If no stored user or need verification with API
      if (!currentUser) {
        currentUser = await authService.getCurrentUser();
      }

      if (!active) return;

      if (!currentUser) {
        localStorage.removeItem('user');
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check Role: Only LECTURER and ADMIN are permitted
      if (currentUser.role !== 'LECTURER' && currentUser.role !== 'ADMIN') {
        setUnauthorizedMessage('Tài khoản của bạn là Sinh viên. Trang này chỉ dành riêng cho Giảng viên và Quản trị viên.');
        setIsChecking(false);
        redirectTimer = setTimeout(() => {
          if (active) {
            router.replace('/student/dashboard');
          }
        }, 2000);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();

    return () => {
      active = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <ShieldCheck size={26} />
          </div>
          <p className="text-sm font-semibold text-slate-800">Đang xác thực quyền Giảng viên...</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <LoaderCircle size={14} className="animate-spin text-indigo-600" />
            <span>Hệ thống AITA đang kiểm tra phiên làm việc...</span>
          </div>
        </div>
      </div>
    );
  }

  if (unauthorizedMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-lg space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900">Không có quyền truy cập</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{unauthorizedMessage}</p>
          <p className="text-[11px] text-slate-400">Đang tự động chuyển hướng về Cổng Sinh viên...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
