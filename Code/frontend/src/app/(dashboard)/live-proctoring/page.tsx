import { Metadata } from 'next';
import { RoomListDashboard } from '@/features/proctoring/components/RoomListDashboard';

export const metadata: Metadata = {
  title: 'Phòng thi trực tiếp & Quản lý ca thi | AITA Portal',
  description: 'Trung tâm giám sát thời gian thực các phòng máy thi thực hành (PE) và ca thi.',
};

export default function LiveProctoringRoomsPage() {
  return <RoomListDashboard />;
}
