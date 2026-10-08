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
  { id: 'SUBMITTED', label: 'Nộp bài', sublabel: 'Ghi nhận bài làm', icon: Send },
  { id: 'QUEUE', label: 'Hàng đợi / Tiền xử lý', sublabel: 'Điều phối & Chuẩn bị', icon: Layers },
  { id: 'SANDBOX', label: 'Docker Sandbox', sublabel: 'Biên dịch & Testcases', icon: Cpu },
  { id: 'AI', label: 'Đánh giá AI', sublabel: 'Phân tích Rubric', icon: Bot },
  { id: 'COMPLETED', label: 'Hoàn tất', sublabel: 'Tổng hợp kết quả', icon: CheckCircle2 },
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

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function formatTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  return timeFormatter.format(d);
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

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Tiến trình chấm điểm tự động</h2>
            {isPolling && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                <span>Đang chấm theo thời gian thực</span>
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Mô hình chấm 2 giai đoạn: Thực thi Docker Sandbox cô lập và Đánh giá Socratic AI.
          </p>
        </div>

        <div>
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              ĐÃ CHẤM XONG
            </span>
          )}
          {isFailed && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
              <XCircle className="h-4 w-4" />
              CHẤM THẤT BẠI
            </span>
          )}
          {isRetrying && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              ĐANG THỬ LẠI (LẦN {gradingJob?.retryCount ?? 1})
            </span>
          )}
          {!isCompleted && !isFailed && !isRetrying && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Clock className="h-4 w-4" />
              ĐANG XỬ LÝ
            </span>
          )}
        </div>
      </div>

      {/* 5-Step Visualizer */}
      <div className="mt-6">
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const state = getStepState(step.id, currentStatus);
            const Icon = step.icon;

            return (
              <li
                key={step.id}
                className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  state === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/50 text-slate-800'
                    : state === 'active'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20'
                      : state === 'retrying'
                        ? 'border-amber-400 bg-amber-50/70 text-amber-900 ring-2 ring-amber-400/20'
                        : state === 'failed'
                          ? 'border-rose-400 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400/20'
                          : 'border-slate-200/80 bg-slate-50/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      state === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : state === 'active'
                          ? 'bg-blue-600 text-white animate-pulse'
                          : state === 'retrying'
                            ? 'bg-amber-600 text-white'
                            : state === 'failed'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-500'
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
                  <p className="text-xs font-bold tracking-tight">{step.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{step.sublabel}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Timestamps & Audit Log from real job */}
      {gradingJob && (
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-4">
          <div>
            <p className="text-slate-400">Thời gian xếp hàng:</p>
            <p className="font-semibold text-slate-800">{formatTime(gradingJob.queuedAt) || '--'}</p>
          </div>
          <div>
            <p className="text-slate-400">Bắt đầu Sandbox:</p>
            <p className="font-semibold text-slate-800">{formatTime(gradingJob.sandboxStartedAt) || '--'}</p>
          </div>
          <div>
            <p className="text-slate-400">Kết thúc Sandbox:</p>
            <p className="font-semibold text-slate-800">{formatTime(gradingJob.sandboxEndedAt) || '--'}</p>
          </div>
          <div>
            <p className="text-slate-400">Đánh giá AI hoàn tất:</p>
            <p className="font-semibold text-slate-800">{formatTime(gradingJob.aiEndedAt) || '--'}</p>
          </div>
        </div>
      )}

      {/* Error Details if Failed */}
      {isFailed && gradingJob?.systemLogs && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          <p className="font-bold">Lỗi trong quá trình chấm:</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] text-rose-900">
            {gradingJob.systemLogs}
          </pre>
        </div>
      )}
    </section>
  );
}
