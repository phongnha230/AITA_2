'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { authService, type User } from '@/features/auth/services/auth.service';
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal';
import { AiTutorConfigModal } from '@/features/lecturer/components/AiTutorConfigModal';
import { LecturerSidebar } from './LecturerSidebar';
import { LecturerHeader } from './LecturerHeader';

interface LecturerShellProps {
  children: React.ReactNode;
}

export const LecturerShell: React.FC<LecturerShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold">{notificationToast}</span>
          <button
            aria-label="Đóng thông báo"
            onClick={() => setNotificationToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <LecturerSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        pathname={pathname}
        currentUser={currentUser}
        onOpenAiConfig={() => setIsAiConfigOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden bg-slate-100">
        <LecturerHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          pathname={pathname}
          onShowToast={showToast}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Modals */}
      <AiTutorConfigModal
        open={isAiConfigOpen}
        onClose={() => setIsAiConfigOpen(false)}
      />
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};
