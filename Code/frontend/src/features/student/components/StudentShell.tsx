'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { StudentHeader } from './StudentHeader';
import { StudentSidebar } from './StudentSidebar';
import { StudentProfileProvider, useStudentProfile } from '../hooks/useStudentProfile';

interface StudentShellProps {
  children: ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  return (
    <StudentProfileProvider>
      <StudentShellContent>{children}</StudentShellContent>
    </StudentProfileProvider>
  );
}

function StudentShellContent({ children }: StudentShellProps) {
  const { profile, status: profileStatus } = useStudentProfile();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div
      className="min-h-screen bg-[#F6F8FC] lg:pl-[280px]"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
    >
      <StudentSidebar />

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Đóng menu điều hướng"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          />
          <StudentSidebar mobile onNavigate={closeMenu} />
        </>
      )}

      <div className="min-h-screen min-w-0">
        <StudentHeader
          user={profile}
          isLoading={profileStatus === 'loading'}
          menuOpen={menuOpen}
          menuButtonRef={menuButtonRef}
          onMenuClick={() => setMenuOpen((isOpen) => !isOpen)}
        />
        <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1360px] px-4 py-6 sm:px-6 sm:py-7 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
