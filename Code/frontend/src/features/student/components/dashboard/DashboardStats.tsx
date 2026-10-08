import { BookOpenCheck, CalendarClock, CheckCheck, Gauge } from 'lucide-react';
import { StudentStatCard } from '../shared/StudentStatCard';

interface DashboardStatsProps {
  courseCount: number | null;
  upcomingExamCount: number | null;
  completedExamCount: number | null;
  coursesLoading: boolean;
  examsLoading: boolean;
}

export function DashboardStats({
  courseCount,
  upcomingExamCount,
  completedExamCount,
  coursesLoading,
  examsLoading,
}: DashboardStatsProps) {
  return (
    <section aria-label="Chỉ số học tập" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StudentStatCard
        label="Lớp đang tham gia"
        value={courseCount === null ? '--' : String(courseCount)}
        detail={courseCount === null ? 'Đang cập nhật' : 'Theo danh sách ghi danh thực tế'}
        icon={BookOpenCheck}
        tone="blue"
        loading={coursesLoading}
      />
      <StudentStatCard
        label="Bài thi PE sắp tới"
        value={upcomingExamCount === null ? '--' : String(upcomingExamCount)}
        detail={upcomingExamCount === null ? 'Đang cập nhật' : 'Bài thi đã công bố lịch'}
        icon={CalendarClock}
        tone="amber"
        loading={examsLoading}
      />
      <StudentStatCard
        label="Bài thi đã kết thúc"
        value={completedExamCount === null ? '--' : String(completedExamCount)}
        detail={completedExamCount === null ? 'Đang cập nhật' : 'Đã qua hạn nộp / đã đóng'}
        icon={CheckCheck}
        tone="emerald"
        loading={examsLoading}
      />
      <StudentStatCard
        label="Điểm PE trung bình"
        value="--"
        detail="Chưa có dữ liệu điểm đánh giá"
        icon={Gauge}
        tone="slate"
        loading={false}
      />
    </section>
  );
}

