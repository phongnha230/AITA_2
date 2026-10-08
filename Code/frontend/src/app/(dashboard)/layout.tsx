import type { ReactNode } from 'react';
import { LecturerAuthGuard } from '@/features/courses/components/LecturerAuthGuard';

export default function LecturerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <LecturerAuthGuard>{children}</LecturerAuthGuard>;
}
