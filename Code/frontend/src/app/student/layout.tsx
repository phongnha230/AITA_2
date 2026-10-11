import type { ReactNode } from 'react';
import { StudentShell } from '@/features/student/components/StudentShell';
import { StudentAuthGuard } from '@/features/student/components/StudentAuthGuard';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentAuthGuard>
      <StudentShell>{children}</StudentShell>
    </StudentAuthGuard>
  );
}
