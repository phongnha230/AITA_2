'use client';

import {
  FileCode,
  HardDriveUpload,
  Cpu,
  Bot,
  Award,
  Loader2,
} from 'lucide-react';
import type { GradingJobInfo } from '../../types/student.types';
import { LifecycleStepCard } from './LifecycleStepCard';
import { LifecycleStatusBadge } from './LifecycleStatusBadge';

interface GradingLifecycleProgressProps {
  gradingJob: GradingJobInfo | null;
  submissionStatus: string;
  isPolling?: boolean;
  isStreaming?: boolean;
}

interface StepConfig {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof FileCode;
}

const LIFECYCLE_STEPS: StepConfig[] = [
  {
    id: 'QUEUED',
    label: '1. Nhận bài thi',
    sublabel: 'Ghi nhận hàng đợi Celery',
    icon: HardDriveUpload,
  },
  {
    id: 'SANDBOX_PREPARING',
    label: '2. Khởi tạo Sandbox',
    sublabel: 'Build container cô lập',
    icon: Cpu,
  },
  {
    id: 'SANDBOX_RUNNING',
    label: '3. Chấm Testcases',
    sublabel: 'Thực thi & đối chiếu I/O',
    icon: FileCode,
  },
  {
    id: 'AI_EVALUATING',
    label: '4. Đánh giá Socratic AI',
    sublabel: 'Phân tích Clean Code & gợi ý',
    icon: Bot,
  },
  {
    id: 'COMPLETED',
    label: '5. Hoàn tất & Bảng điểm',
    sublabel: 'Tính tổng kết 10đ chuẩn PE',
    icon: Award,
  },
];

function getStepState(
  stepId: string,
  currentStatus: string
): 'completed' | 'active' | 'retrying' | 'failed' | 'pending' {
  const statusOrder = [
    'QUEUED',
    'SANDBOX_PREPARING',
    'SANDBOX_RUNNING',
    'AI_EVALUATING',
    'COMPLETED',
  ];

  if (currentStatus === 'FAILED') {
    return stepId === 'SANDBOX_RUNNING' || stepId === 'AI_EVALUATING' ? 'failed' : 'pending';
  }

  if (currentStatus === 'RETRYING') {
    return stepId === 'SANDBOX_RUNNING' ? 'retrying' : 'pending';
  }

  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepId);

  if (stepIndex < currentIndex || currentStatus === 'COMPLETED') {
    return 'completed';
  }
  if (stepIndex === currentIndex) {
    return 'active';
  }
  return 'pending';
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
  isStreaming,
}: GradingLifecycleProgressProps) {
  const currentStatus = (gradingJob?.status ?? submissionStatus ?? 'QUEUED').toUpperCase();
  const isFailed = currentStatus === 'FAILED';

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Tiến trình chấm điểm tự động</h2>
            {isStreaming ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 animate-in fade-in">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-indigo-600"></span>
                </span>
                <span>SSE Stream: Đang chấm trực tiếp</span>
              </span>
            ) : isPolling ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <Loader2 className="size-3 animate-spin text-blue-600" />
                <span>Đang chấm theo thời gian thực</span>
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Mô hình chấm 2 giai đoạn: Thực thi Docker Sandbox cô lập và Đánh giá Socratic AI.
          </p>
        </div>

        <div>
          <LifecycleStatusBadge
            currentStatus={currentStatus}
            retryCount={gradingJob?.retryCount}
          />
        </div>
      </div>

      {/* 5-Step Visualizer */}
      <div className="mt-6">
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {LIFECYCLE_STEPS.map((step, idx) => (
            <LifecycleStepCard
              key={step.id}
              step={step}
              state={getStepState(step.id, currentStatus)}
              index={idx}
            />
          ))}
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
        <div className="mt-4 bg-rose-50 p-3.5 text-xs text-rose-800">
          <p className="font-bold">Lỗi trong quá trình chấm:</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-rose-900">
            {gradingJob.systemLogs}
          </pre>
        </div>
      )}
    </section>
  );
}
