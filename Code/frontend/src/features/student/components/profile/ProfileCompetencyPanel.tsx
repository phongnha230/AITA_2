import Link from 'next/link';
import { Award, Bot, CheckCircle2, Cpu, History, Sparkles } from 'lucide-react';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { StudentStatCard } from '../shared/StudentStatCard';
import { ProgrammingCompetencyRadar } from './ProgrammingCompetencyRadar';

export function ProfileMetricGrid() {
  return (
    <section aria-label="Tổng hợp năng lực PE" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StudentStatCard
        label="Điểm PE trung bình"
        value="--"
        detail="Chưa có dữ liệu điểm đánh giá"
        icon={Award}
        tone="blue"
      />
      <StudentStatCard
        label="Kỳ thi đã hoàn thành"
        value="--"
        detail="Chưa có bài thi hoàn thành"
        icon={Cpu}
        tone="emerald"
      />
      <StudentStatCard
        label="Tỷ lệ testcases đạt"
        value="--"
        detail="Chưa có dữ liệu testcase"
        icon={CheckCircle2}
        tone="amber"
      />
      <StudentStatCard
        label="Chỉ số AI Rubric"
        value="--"
        detail="Chưa có dữ liệu rubric"
        icon={Bot}
        tone="slate"
      />
    </section>
  );
}

export function ProfileExamHistory() {
  return (
    <section className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Lịch sử các kỳ thi thực hành (PE)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Kết quả đối chiếu tự động Docker Sandbox và đánh giá Socratic AI.
            </p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <History className="h-4.5 w-4.5" />
          </span>
        </div>

        <div className="mt-5">
          <StudentEmptyState
            icon={History}
            title="Chưa có dữ liệu bài thi để hiển thị."
            description="Lịch sử các bài thi PE đã hoàn thành sẽ xuất hiện tại đây khi kết quả được công bố."
            action={
              <Link
                href="/student/results"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Sparkles className="h-4 w-4" />
                <span>Tra cứu bằng mã bài nộp</span>
              </Link>
            }
          />
        </div>
      </div>
    </section>
  );
}

export function ProfileSkillRadar() {
  return <ProgrammingCompetencyRadar />;
}


