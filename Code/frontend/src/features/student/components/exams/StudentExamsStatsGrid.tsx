'use client';

import React from 'react';
import { CalendarClock, CheckCheck, Code2 } from 'lucide-react';
import { StudentStatCard } from '../shared/StudentStatCard';

interface StudentExamsStatsGridProps {
  openCount: number | null;
  upcomingCount: number | null;
  endedCount: number | null;
  environmentCount: number | null;
  isLoading: boolean;
}

export const StudentExamsStatsGrid: React.FC<StudentExamsStatsGridProps> = ({
  openCount,
  upcomingCount,
  endedCount,
  environmentCount,
  isLoading,
}) => {
  return (
    <section aria-label="Tổng quan bài thi" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StudentStatCard
        label="Đang mở"
        value={openCount === null ? '--' : String(openCount)}
        detail={openCount === null ? 'Chưa có dữ liệu' : 'Theo thời gian bắt đầu và hạn nộp'}
        icon={Code2}
        tone="emerald"
        loading={isLoading}
      />
      <StudentStatCard
        label="Sắp tới"
        value={upcomingCount === null ? '--' : String(upcomingCount)}
        detail={upcomingCount === null ? 'Chưa có dữ liệu' : 'Bài thi đã được xuất bản'}
        icon={CalendarClock}
        tone="blue"
        loading={isLoading}
      />
      <StudentStatCard
        label="Đã hoàn thành"
        value={endedCount === null ? '--' : String(endedCount)}
        detail={endedCount === null ? 'Chưa có dữ liệu' : 'Đã qua thời hạn hoặc đã đóng'}
        icon={CheckCheck}
        tone="slate"
        loading={isLoading}
      />
      <StudentStatCard
        label="Môi trường có bài thi"
        value={environmentCount === null ? '--' : String(environmentCount)}
        detail={environmentCount === null ? 'Chưa có dữ liệu' : 'Số môi trường trong danh sách'}
        icon={Code2}
        tone="amber"
        loading={isLoading}
      />
    </section>
  );
};
