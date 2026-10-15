import { Metadata } from 'next';
import { AdminSubmissionsPage } from '@/features/admin/components/submissions/AdminSubmissionsPage';

export const metadata: Metadata = {
  title: 'Giám sát Bài thi & Chấm bài | Admin Portal',
  description: 'Giám sát tiến độ nộp bài, trạng thái chấm điểm Sandbox & AI và kích hoạt chấm lại bài thi toàn trường.',
};

export default function SubmissionsPage() {
  return <AdminSubmissionsPage />;
}
