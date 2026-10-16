import { BookOpenCheck, CalendarClock, CheckCheck, Gauge } from 'lucide-react';
import { StudentStatCard } from '../shared/StudentStatCard';

interface DashboardStatsProps {
  courseCount: number | null;
  upcomingExamCount: number | null;
  completedExamCount: number | null;
  averageScore: number | null;
  gradedSubmissionCount: number | null;
  coursesLoading: boolean;
  examsLoading: boolean;
  portfolioLoading: boolean;
}

export function DashboardStats({
  courseCount,
  upcomingExamCount,
  completedExamCount,
  averageScore,
  gradedSubmissionCount,
  coursesLoading,
  examsLoading,
  portfolioLoading,
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
        label="Bài sắp tới"
        value={upcomingExamCount === null ? '--' : String(upcomingExamCount)}
        detail={upcomingExamCount === null ? 'Đang cập nhật' : 'Bài thi đã công bố lịch'}
        icon={CalendarClock}
        tone="amber"
        loading={examsLoading}
      />
      <StudentStatCard
        label="Bài đã kết thúc"
        value={completedExamCount === null ? '--' : String(completedExamCount)}
        detail={completedExamCount === null ? 'Đang cập nhật' : 'Đã qua hạn nộp / đã đóng'}
        icon={CheckCheck}
        tone="emerald"
        loading={examsLoading}
      />
      <StudentStatCard
        label="Điểm trung bình"
        value={averageScore === null || gradedSubmissionCount === 0 ? '—' : averageScore.toFixed(1)}
        detail={gradedSubmissionCount === null
          ? 'Đang cập nhật'
          : gradedSubmissionCount === 0
            ? 'Chưa có bài đã chấm'
            : `Dựa trên ${gradedSubmissionCount} bài đã chấm`}
        icon={Gauge}
        tone="slate"
        loading={portfolioLoading}
      />
    </section>
  );
}

