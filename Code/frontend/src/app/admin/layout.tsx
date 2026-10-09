import type { Metadata } from 'next';
import { AdminShell } from '../../features/admin/components/layout/AdminShell';

export const metadata: Metadata = {
  title: 'AITA Admin Console',
  description: 'Bảng quản trị hạ tầng, người dùng, AI Keys và hàng đợi chấm bài của AITA.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
