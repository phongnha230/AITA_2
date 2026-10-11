'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type User } from '../../../auth/services/auth.service';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { ToastProvider } from '../ui/Toast';
import { Button } from '../ui/Button';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

/** Client-side RBAC guard + chrome. Real enforcement still happens on the API (authorizeRoles('ADMIN')). */
export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      if (typeof window === 'undefined') return;

      const stored = authService.getStoredUser();

      let currentUser: User | null = stored;
      if (!currentUser) {
        currentUser = await authService.getCurrentUser();
      }

      if (!active) return;

      if (currentUser) {
        if (currentUser.role === 'ADMIN') {
          setUser(currentUser);
          return;
        } else {
          setAuthError(
            `Tài khoản của bạn có vai trò là "${currentUser.role}". Cổng này chỉ dành riêng cho Quản trị viên (ADMIN).`
          );
          return;
        }
      }

      // Unauthenticated -> redirect to real login
      router.replace('/login?redirectTo=/admin/dashboard&error=unauthenticated');
    };

    verifyAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <span className="text-2xl font-black">!</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">403 - Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{authError}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => router.replace('/login')}
              className="w-full h-10 rounded-xl"
            >
              Đăng nhập tài khoản khác
            </Button>
            <Button
              variant="outline"
              onClick={() => router.replace('/dashboard')}
              className="w-full h-10 rounded-xl"
            >
              Quay lại Bảng điều khiển
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Đang xác thực quyền quản trị AITA..." />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <AdminSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <div className="lg:pl-72">
          <AdminTopbar user={user} onMenuClick={() => setMenuOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 pb-10 pt-24 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
};
