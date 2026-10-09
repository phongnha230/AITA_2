'use client';

import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Loader2,
  Send,
  XCircle,
} from 'lucide-react';
import type { GradingJobInfo, GradingJobStatus } from '../../types/student.types';

interface GradingLifecycleProgressProps {
  gradingJob: GradingJobInfo | null;
  submissionStatus: string;
  isPolling: boolean;
}

interface StepDef {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Send;
}

const LIFECYCLE_STEPS: StepDef[] = [
  { id: 'SUBMITTED', label: '1. Nộp bài', sublabel: 'Ghi nhận bài làm', icon: Send },
  { id: 'QUEUE', label: '2. Hàng đợi', sublabel: 'Điều phối & Chuẩn bị', icon: Layers },
  { id: 'SANDBOX', label: '3. Docker Sandbox', sublabel: 'Biên dịch & Testcase', icon: Cpu },
  { id: 'AI', label: '4. Đánh giá AI', sublabel: 'Phân tích Rubric', icon: Bot },
  { id: 'COMPLETED', label: '5. Hoàn tất', sublabel: 'Tổng hợp kết quả', icon: CheckCircle2 },
];

function getStepState(
  stepId: string,
  jobStatus: GradingJobStatus | string,
): 'completed' | 'active' | 'failed' | 'retrying' | 'waiting' {
  if (jobStatus === 'FAILED') {
    if (stepId === 'COMPLETED') return 'failed';
    return 'completed';
  }

  if (jobStatus === 'RETRYING') {
    if (stepId === 'SANDBOX' || stepId === 'AI') return 'retrying';
    if (stepId === 'COMPLETED') return 'waiting';
    return 'completed';
  }

  if (jobStatus === 'COMPLETED') {
    return 'completed';
  }

  switch (stepId) {
    case 'SUBMITTED':
      return 'completed';
    case 'QUEUE':
      if (jobStatus === 'QUEUED' || jobStatus === 'PREPROCESSING') return 'active';
      return ['RUNNING_SANDBOX', 'RUNNING_AI'].includes(jobStatus) ? 'completed' : 'active';
    case 'SANDBOX':
      if (jobStatus === 'QUEUED' || jobStatus === 'PREPROCESSING') return 'waiting';
      if (jobStatus === 'RUNNING_SANDBOX') return 'active';
      return jobStatus === 'RUNNING_AI' ? 'completed' : 'waiting';
    case 'AI':
      if (['QUEUED', 'PREPROCESSING', 'RUNNING_SANDBOX'].includes(jobStatus)) return 'waiting';
      if (jobStatus === 'RUNNING_AI') return 'active';
      return 'waiting';
    case 'COMPLETED':
      return 'waiting';
    default:
      return 'waiting';
  }
}

function formatTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

export function GradingLifecycleProgress({
  gradingJob,
  submissionStatus,
  isPolling,
}: GradingLifecycleProgressProps) {
  const currentStatus = (gradingJob?.status ?? submissionStatus ?? 'QUEUED').toUpperCase();

  const isFailed = currentStatus === 'FAILED';
  const isRetrying = currentStatus === 'RETRYING';
  const isCompleted = currentStatus === 'COMPLETED';

  // Compute progress percentage for continuous line
  const completedCount = LIFECYCLE_STEPS.filter(
    (s) => getStepState(s.id, currentStatus) === 'completed',
  ).length;
  const progressPercent = isCompleted ? 100 : Math.max(10, ((completedCount - 0.5) / (LIFECYCLE_STEPS.length - 1)) * 100);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-elevated-sm sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Tiến trình chấm điểm tự động</h2>
            {isPolling && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                <Loader2 className="h-3 w-3 animate-spin text-blue-600 motion-reduce:animate-none" />
                <span>Đang chấm theo thời gian thực</span>
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Kiến trúc chấm 2 pha: Thực thi Docker Sandbox cô lập &amp; Đánh giá Socratic AI.
          </p>
        </div>

        <div>
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ĐÃ CHẤM XONG
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              <XCircle className="h-3.5 w-3.5" />
              CHẤM THẤT BẠI
            </span>
          )}
          {isRetrying && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              ĐANG THỬ LẠI (LẦN {gradingJob?.retryCount ?? 1})
            </span>
          )}
          {!isCompleted && !isFailed && !isRetrying && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Clock className="h-3.5 w-3.5" />
              ĐANG XỬ LÝ
            </span>
          )}
        </div>
      </div>

      {/* 5-Step Stepper with connecting line */}
      <div className="relative mt-6 pt-2">
        {/* Desktop Connecting Line (hidden on mobile) */}
        <div className="absolute left-6 right-6 top-[28px] hidden -translate-y-1/2 sm:block" aria-hidden="true">
          <div className="h-1 w-full rounded-full bg-slate-100" />
          <div
            className="h-1 -mt-1 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const state = getStepState(step.id, currentStatus);
            const Icon = step.icon;

            return (
              <li
                key={step.id}
                className={`relative z-10 flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 ${
                  state === 'completed'
                    ? 'border-slate-200/90 bg-white text-slate-800 shadow-2xs hover:border-emerald-300'
                    : state === 'active'
                      ? 'border-blue-500 bg-blue-50/60 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                      : state === 'retrying'
                        ? 'border-amber-400 bg-amber-50/60 text-amber-950 ring-2 ring-amber-400/20'
                        : state === 'failed'
                          ? 'border-rose-400 bg-rose-50/60 text-rose-950 ring-2 ring-rose-400/20'
                          : 'border-slate-200/70 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-transform ${
                      state === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : state === 'active'
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300 motion-reduce:ring-0 animate-pulse'
                          : state === 'retrying'
                            ? 'bg-amber-600 text-white'
                            : state === 'failed'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {state === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : state === 'failed' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <Icon
                    aria-hidden="true"
                    className={`h-4 w-4 ${
                      state === 'completed'
                        ? 'text-emerald-600'
                        : state === 'active'
                          ? 'text-blue-600'
                          : state === 'failed'
                            ? 'text-rose-600'
                            : 'text-slate-400'
                    }`}
                  />
                </div>

                <div className="mt-3">
                  <p className={`text-xs font-bold tracking-tight ${state === 'waiting' ? 'text-slate-500' : 'text-slate-900'}`}>
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{step.sublabel}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Aligned Timestamps Audit Bar */}
      {gradingJob && (
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50/70 p-2.5">
            <p className="text-[11px] text-slate-500">Thời gian xếp hàng</p>
            <p className="mt-0.5 font-semibold text-slate-800 tabular-nums">{formatTime(gradingJob.queuedAt) || '--'}</p>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5">
            <p className="text-[11px] text-slate-500">Bắt đầu Sandbox</p>
            <p className="mt-0.5 font-semibold text-slate-800 tabular-nums">{formatTime(gradingJob.sandboxStartedAt) || '--'}</p>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5">
            <p className="text-[11px] text-slate-500">Kết thúc Sandbox</p>
            <p className="mt-0.5 font-semibold text-slate-800 tabular-nums">{formatTime(gradingJob.sandboxEndedAt) || '--'}</p>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5">
            <p className="text-[11px] text-slate-500">Đánh giá AI hoàn tất</p>
            <p className="mt-0.5 font-semibold text-slate-800 tabular-nums">{formatTime(gradingJob.aiEndedAt) || '--'}</p>
          </div>
        </div>
      )}

      {/* Semantic Error Log if Failed */}
      {isFailed && gradingJob?.systemLogs && (
        <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800">
          <p className="font-bold">Chi tiết lỗi trong quá trình thực thi:</p>
          <pre className="mt-1.5 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white/80 p-2.5 font-mono text-[11px] text-rose-900 border border-rose-200/80">
            {gradingJob.systemLogs}
          </pre>
        </div>
      )}
    </section>
  );
}
