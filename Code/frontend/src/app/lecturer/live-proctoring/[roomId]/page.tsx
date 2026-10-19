import { Metadata } from 'next';
import { RoomDetailMonitor } from '@/features/proctoring/components/RoomDetailMonitor';

interface Props {
  params: Promise<{
    roomId: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Giám sát chi tiết phòng thi | AITA Portal',
  description: 'Theo dõi sinh viên làm bài và danh sách bài thi đã được nộp thành công.',
};

export default async function RoomDetailPage({ params }: Props) {
  const { roomId } = await params;
  return <RoomDetailMonitor roomId={roomId} />;
}
