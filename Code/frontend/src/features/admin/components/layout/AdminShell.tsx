'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, type User } from '../../../auth/services/auth.service';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { USE_MOCK } from '../../../../config/mock';
import { ensureMockSession } from '../../mocks/mock-session';
import { ToastProvider } from '../ui/Toast';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

/** Client-side RBAC guard + chrome. Real enforcement still happens on the API (authorizeRoles('ADMIN')). */
export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setUser(ensureMockSession());
      return;
    }
    const stored = authService.getStoredUser();
    if (!stored || !localStorage.getItem('token')) {
      router.replace('/login?error=unauthenticated');
    } else if (stored.role !== 'ADMIN') {
      router.replace('/403');
    } else {
      setUser(stored);
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Đang xác thực quyền quản trị..." />
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
