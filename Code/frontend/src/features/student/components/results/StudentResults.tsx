'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  FileCheck2,
  FileSearch,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useStudentSubmission } from '../../hooks/useStudentSubmission';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { AiRubricFeedbackCard } from './AiRubricFeedbackCard';
import { GradingLifecycleProgress } from './GradingLifecycleProgress';
import { SubmissionScoreOverview } from './SubmissionScoreOverview';
import { TestCaseResultsList } from './TestCaseResultsList';
import { RecentSubmissionsList } from './RecentSubmissionsList';

function StudentResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubmissionId = searchParams.get('submissionId');

  const [inputVal, setInputVal] = useState(currentSubmissionId || '');
  const { submission, gradingJob, isPolling, refetch } = useStudentSubmission(currentSubmissionId);

  const handleLookup = (e: FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;
    router.push(`/student/results?submissionId=${encodeURIComponent(clean)}`);
  };

  const hasSubmission = Boolean(currentSubmissionId && submission.data);

  return (
    <div className="space-y-6">
      <StudentPageHeading
        eyebrow="Khảo thí &amp; Đánh giá"
        title="Kết quả &amp; Đánh giá AI"
        description="Theo dõi trực tiếp tiến trình chấm bài tự động, kết quả Sandbox Docker và phản hồi từ Socratic AI."
        action={
          currentSubmissionId ? (
            <button
              type="button"
              onClick={refetch}
              disabled={submission.status === 'loading'}
              aria-label="Làm mới kết quả bài nộp"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <RefreshCw aria-hidden="true" className={`h-4 w-4 ${submission.status === 'loading' ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          ) : undefined
        }
      />

      {/* Submission Lookup Searchbar */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated">
        <form onSubmit={handleLookup} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Mã bài nộp (Submission ID)"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập mã bài nộp (Submission ID)..."
              className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 font-mono text-xs text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <FileSearch className="h-4.5 w-4.5" />
            <span>Tra cứu kết quả</span>
          </button>
        </form>
      </section>

      {/* Error State */}
      {submission.status === 'error' && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-900">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{submission.error || 'Không tìm thấy thông tin bài nộp.'}</p>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="min-h-9 shrink-0 rounded-xl border border-rose-300 bg-white px-3.5 text-xs font-semibold text-rose-900 shadow-sm transition-all hover:bg-rose-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {submission.status === 'loading' && (
        <div role="status" aria-label="Đang tải kết quả bài nộp" className="space-y-4">
          <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      )}

      {/* Loaded Submission Details */}
      {submission.status === 'success' && hasSubmission && submission.data && (
        <div className="space-y-6">
          {/* Polished Submission Header Banner */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-elevated transition-all sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Bài thi thực hành PE
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    {submission.data.submittedAt
                      ? new Intl.DateTimeFormat('vi-VN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(submission.data.submittedAt))
                      : 'Đã ghi nhận'}
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
                  {submission.data.assignment?.title || 'Bài thi thực hành'}
                </h2>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
                  <span className="text-slate-500">Mã bài nộp:</span>
                  <code className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 select-all">
                    {submission.data.id}
                  </code>
                </div>
              </div>

              {/* Status and Channel Badges on the right */}
              <div className="flex flex-wrap items-center gap-2.5 lg:flex-col lg:items-end">
                <div className="flex items-center gap-2">
                  {submission.data.status === 'GRADED' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      ĐÃ HOÀN TẤT CHẤM
                    </span>
                  )}
                  {submission.data.status === 'FAILED' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      CHẤM THẤT BẠI
                    </span>
                  )}
                  {['QUEUED', 'RUNNING_SANDBOX', 'RUNNING_AI', 'PENDING'].includes(submission.data.status) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      ĐANG XỬ LÝ CHẤM
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Kênh nộp:</span>
                  <span className="font-semibold text-slate-700">
                    {submission.data.submissionChannel === 'ZIP_UPLOAD'
                      ? 'Tải lên tệp ZIP'
                      : submission.data.submissionChannel === 'GIT_COMMIT'
                        ? 'Kho lưu trữ Git'
                        : submission.data.submissionChannel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 1. Real Grading Lifecycle Progress */}
          <GradingLifecycleProgress
            gradingJob={gradingJob}
            submissionStatus={submission.data.status}
            isPolling={isPolling}
          />

          {/* 2. Score Overview */}
          <SubmissionScoreOverview submission={submission.data} />

          {/* 3. Detailed Testcases */}
          <TestCaseResultsList testResults={submission.data.testResults ?? []} />

          {/* 4. AI Feedback */}
          <AiRubricFeedbackCard
            aiGradingResult={submission.data.aiGradingResult}
            submissionId={submission.data.id}
          />
        </div>
      )}

      {/* Submissions List & Empty State when no submissionId is selected */}
      {submission.status === 'success' && !currentSubmissionId && (
        <div className="space-y-6">
          <RecentSubmissionsList
            onSelectSubmission={(id) => {
              setInputVal(id);
              router.push(`/student/results?submissionId=${encodeURIComponent(id)}`);
            }}
          />

          <section aria-label="Trạng thái chưa chọn bài nộp" className="py-2">
            <StudentEmptyState
              icon={FileCheck2}
              title="Tra cứu kết quả bài thi"
              description="Chọn một bài nộp ở danh sách phía trên hoặc nhập mã bài nộp (Submission ID) vào ô tra cứu để xem chi tiết chấm điểm Sandbox và AI."
              action={
                <Link
                  href="/student/exams"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <span>Xem danh sách bài thi PE</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </section>
        </div>
      )}
    </div>
  );
}

export function StudentResults() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      }
    >
      <StudentResultsContent />
    </Suspense>
  );
}
