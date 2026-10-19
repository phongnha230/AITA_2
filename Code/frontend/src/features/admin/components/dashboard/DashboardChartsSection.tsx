'use client';

import Link from 'next/link';
import { ArrowRight, PieChart as PieIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { DonutChart } from '../ui/DonutChart';
import type { AdminDashboardData } from '../../services/admin-dashboard.service';
import { formatDateTime } from '@/lib/formatDate';

interface DashboardChartsSectionProps {
  realData: AdminDashboardData;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({ realData }) => (
  <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <Card className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <PieIcon className="size-4 text-purple-600" /> Trạng thái bài nộp
        </h2>
        <p className="text-xs text-slate-500">Thống kê từ dữ liệu submission hiện có.</p>
      </div>
      {realData.submissionOutcomes.some((item) => item.value > 0) ? (
        <div className="rounded-xl bg-slate-50 p-4">
          <DonutChart data={realData.submissionOutcomes} centerLabel="Bài nộp" centerValue={realData.kpis.totalSubmissions} />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Chưa có bài nộp để thống kê.</p>
      )}
    </Card>

    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Bài nộp gần đây</h2>
          <p className="text-xs text-slate-500">Tối đa 10 bài mới nhất từ backend.</p>
        </div>
        <Link href="/admin/submissions" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
          Xem tất cả <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {realData.recentSubmissions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Chưa có bài nộp.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {realData.recentSubmissions.slice(0, 6).map((submission) => (
            <li key={submission.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{submission.assignmentTitle}</p>
                <p className="truncate text-xs text-slate-500">{submission.studentName} · {submission.courseCode} · {formatDateTime(submission.submittedAt)}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-slate-600">{submission.status === 'GRADED' ? `${submission.finalScore} điểm` : submission.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  </section>
);
