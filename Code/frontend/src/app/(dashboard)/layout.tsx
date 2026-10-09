import type { ReactNode } from 'react';
import { LecturerAuthGuard } from '@/features/courses/components/LecturerAuthGuard';
import { LecturerShell } from '@/components/layout/LecturerShell';

export default function LecturerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LecturerAuthGuard>
      <LecturerShell>{children}</LecturerShell>
    </LecturerAuthGuard>
  );
}

