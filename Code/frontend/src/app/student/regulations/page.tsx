import type { Metadata } from 'next';
import { ExamRegulationsPage } from '@/features/student/components/regulations/ExamRegulationsPage';

export const metadata: Metadata = {
  title: 'Quy chế thi PE & Hướng dẫn phòng thi | AITA Assessment Portal',
  description: 'Toàn bộ quy định, tiêu chuẩn kỹ thuật thực hành và quy trình xử lý sự cố trong kỳ thi Practical Exam (PE) tại AITA.',
};

export default function RegulationsPage() {
  return <ExamRegulationsPage />;
}
