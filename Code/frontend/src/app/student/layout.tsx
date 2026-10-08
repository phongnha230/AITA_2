import type { ReactNode } from 'react';
import { StudentShell } from '@/features/student/components/StudentShell';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentShell>{children}</StudentShell>;
}
