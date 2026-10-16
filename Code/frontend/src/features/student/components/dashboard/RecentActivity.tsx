'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, FileText, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/formatDate';
import type { ResourceState, StudentPortfolioData } from '../../types/student.types';

interface RecentActivityProps {
  state: ResourceState<StudentPortfolioData | null>;
  onRetry: () => void;
}

function getSubmissionStatusLabel(status: string): string {
  if (status === 'GRADED') return 'Đã chấm';
  if (status === 'FAILED') return 'Chấm thất bại';
  if (status === 'PROCESSING' || status === 'RUNNING') return 'Đang chấm';
  return 'Đang chờ chấm';
}

export function RecentActivity({ state, onRetry }: RecentActivityProps) {
  const submissions = state.data?.recentSubmissions ?? [];

  return (
    <section
      aria-label="Bài nộp gần đây"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200/80">
          <Clock3 aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">Bài nộp gần đây</h2>
          <p className="mt-0.5 text-xs text-slate-500">Trạng thái và kết quả từ hệ thống chấm bài</p>
        </div>
      </div>

      <div className="mt-4">
        {state.status === 'loading' ? (
          <div className="space-y-2" role="status" aria-label="Đang tải bài nộp">
            {[0, 1].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : state.status === 'error' ? (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p>{state.error || 'Không thể tải bài nộp gần đây.'}</p>
            <button type="button" onClick={onRetry} className="mt-2 inline-flex items-center gap-1 font-semibold hover:underline">
              <RefreshCw aria-hidden="true" className="h-3 w-3" /> Thử lại
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/60 px-4 py-6 text-center">
            <p className="text-xs font-bold text-slate-700">Chưa có bài nộp.</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Bài nộp và trạng thái chấm sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {submissions.slice(0, 3).map((submission) => (
              <li key={submission.id}>
                <Link
                  href={`/student/results?submissionId=${encodeURIComponent(submission.id)}`}
                  className="flex min-h-16 items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-800">{submission.assignmentTitle}</span>
                    <span className="mt-1 block text-[11px] text-slate-500">
                      {submission.courseCode} · {formatDateTime(submission.submittedAt)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[11px] font-semibold text-slate-600">
                    {submission.status === 'GRADED' && Number.isFinite(Number(submission.finalScore))
                      ? `${Number(submission.finalScore).toFixed(1)} điểm`
                      : getSubmissionStatusLabel(submission.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <Link
          href="/student/results"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span>Xem tất cả bài nộp</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
