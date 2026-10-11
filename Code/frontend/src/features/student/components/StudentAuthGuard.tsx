'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GraduationCap, LoaderCircle, ShieldAlert } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.service';

interface StudentAuthGuardProps {
  children: ReactNode;
}

export function StudentAuthGuard({ children }: StudentAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const checkAuth = async () => {
      if (typeof window !== 'undefined' && !localStorage.getItem('token') && !localStorage.getItem('user')) {
        // Unauthenticated -> redirect to login
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check stored user first for fast hydration
      let currentUser = authService.getStoredUser();

      if (!currentUser) {
        currentUser = await authService.getCurrentUser();
      }

      if (!active) return;

      if (!currentUser) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check Role: STUDENT and ADMIN are permitted
      if (currentUser.role !== 'STUDENT' && currentUser.role !== 'ADMIN') {
        setUnauthorizedMessage(
          'Tài khoản của bạn là Giảng viên. Trang này dành cho Sinh viên và Quản trị viên.'
        );
        setIsChecking(false);
        redirectTimer = setTimeout(() => {
          if (active) {
            router.replace('/dashboard');
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <GraduationCap size={26} />
          </div>
          <p className="text-sm font-semibold text-slate-800">Đang xác thực quyền Sinh viên...</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <LoaderCircle size={14} className="animate-spin text-blue-600" />
            <span>Hệ thống AITA đang kiểm tra phiên đăng nhập...</span>
          </div>
        </div>
      </div>
    );
  }

  if (unauthorizedMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-lg space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900">Không có quyền truy cập</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{unauthorizedMessage}</p>
          <p className="text-[11px] text-slate-400">Đang tự động chuyển hướng về Cổng Giảng viên...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
