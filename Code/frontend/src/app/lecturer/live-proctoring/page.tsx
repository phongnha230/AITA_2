import { Metadata } from 'next';
import { RoomListDashboard } from '@/features/proctoring/components/RoomListDashboard';

export const metadata: Metadata = {
  title: 'Quản lý ca thi | AITA Portal',
  description: 'Theo dõi lịch, lượt mở đề và bài nộp của các ca thi.',
};

export default function LiveProctoringRoomsPage() {
  return <RoomListDashboard />;
}
