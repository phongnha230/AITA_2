import { AiTutorConfigPage } from '@/features/lecturer/components/AiTutorConfigPage';

export const metadata = {
  title: 'Cấu hình Trợ giảng AI Theo Môn Học | AITA Lecturer Portal',
  description: 'Quản lý System Prompt và chính sách sư phạm Socratic AI cho từng khóa học.',
};

export default function LecturerAiTutorPage() {
  return <AiTutorConfigPage />;
}
