import type { Metadata } from 'next';
import LoginPage from '@/features/auth/components/LoginPage';

export const metadata: Metadata = {
  title: 'Đăng nhập | AITA',
  description: 'Đăng nhập hệ thống khảo thí và chấm thi thực hành AITA.',
};

export default function Page() {
  return <LoginPage />;
}
