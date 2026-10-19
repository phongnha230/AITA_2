'use client';

import { useEffect, useState } from 'react';
import { BrainCircuit, CircleAlert, Hourglass, RefreshCw, RotateCcw, SquareTerminal } from 'lucide-react';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { useQueueJobs } from '../../hooks/useQueueJobs';
import { adminQueueService, type QueueMetricsOverview } from '../../services/admin-queue.service';
import type { QueueJob } from '../../types/admin.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { useToast } from '../ui/Toast';
import { JobTerminalModal } from './JobTerminalModal';
import { JobsTable } from './JobsTable';
import { RedisTelemetry } from './RedisTelemetry';

export const QueuePage: React.FC = () => {
  const { jobs, loading, error, reload, retry, retryAllFailed, flushDeadLetter, clearCompleted } = useQueueJobs();
  const toast = useToast();
  const [terminalJob, setTerminalJob] = useState<QueueJob | null>(null);
  const [forcedState, setForcedState] = useState<{ value: 'Failed' | ''; nonce: number }>();
  const [metrics, setMetrics] = useState<QueueMetricsOverview | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const m = await adminQueueService.getMetrics();
      setMetrics(m);
      setMetricsError(null);
    } catch (error) {
      console.error('Không tải được queue metrics:', error);
      setMetricsError('Không thể tải metrics hàng đợi từ backend.');
    }
  };

  useEffect(() => {
    void fetchMetrics();
  }, []);

  const run = async (task: () => Promise<unknown>, success?: string) => {
    try {
      await task();
      if (success) toast.success(success);
      await fetchMetrics();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const queued = metrics?.bullmq.waiting ?? jobs.filter((j) => j.state === 'Queued').length;
  const sandbox = jobs.filter((j) => j.state === 'Processing').length;
  const ai = metrics?.database.statuses['RUNNING_AI'] ?? 0;
  const failed = metrics?.database.statuses['FAILED'] ?? metrics?.bullmq.failed ?? jobs.filter((j) => j.state === 'Failed').length;
  const completed = metrics?.database.statuses['COMPLETED'] ?? metrics?.bullmq.completed ?? jobs.filter((j) => j.state === 'Completed').length;
  const totalCompletedOrFailed = completed + failed;
  const successRate = totalCompletedOrFailed > 0 ? `${((completed / totalCompletedOrFailed) * 100).toFixed(1)}%` : '—';

  return (
    <>
      <PageHeader
        eyebrow={<span className="font-semibold uppercase tracking-wider">Metrics hàng đợi từ backend</span>}
        title="Quản trị Hàng đợi BullMQ & Redis"
        description="Theo dõi và điều phối các luồng xử lý bất đồng bộ (async jobs) biên dịch mã nguồn Sandbox và chấm điểm AI thời gian thực."
        actions={
          <>
            <Button variant="danger" disabled={failed === 0} onClick={() => void run(async () => toast.success(`Đã retry ${await retryAllFailed()} job lỗi.`))}>
              <RotateCcw className="size-4" /> Retry toàn bộ Failed Jobs
            </Button>
            <Button variant="primary" onClick={() => void run(async () => { await reload(); await fetchMetrics(); }, 'Đã làm mới dữ liệu hàng đợi.')}><RefreshCw className="size-4" /> Làm mới tức thì</Button>
          </>
        }
      />

      {metricsError ? <AlertBox message={metricsError} onRetry={() => void fetchMetrics()} /> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent="border-l-amber-400" label="Đang chờ" value={queued} icon={Hourglass} iconClassName="bg-amber-50 text-amber-600" footer={<p className="text-xs text-slate-600">Jobs waiting trong hàng đợi.</p>} />
        <StatCard accent="border-l-blue-500" label="Đang xử lý" value={sandbox} icon={SquareTerminal} iconClassName="bg-blue-50 text-blue-600" footer={<p className="text-xs text-slate-600">Jobs đang chạy.</p>} />
        <StatCard accent="border-l-violet-500" label="Đang chấm AI" value={ai} icon={BrainCircuit} iconClassName="bg-violet-50 text-violet-600" footer={<p className="text-xs text-slate-600">Trạng thái từ bản ghi grading job.</p>} />
        <StatCard
          accent="border-l-rose-500"
          label="FAILED (cần retry)"
          value={failed}
          icon={CircleAlert}
          iconClassName="bg-rose-50 text-rose-600"
          footer={
            <p className="flex justify-between text-xs text-slate-600">
              <span>Bản ghi chấm thất bại</span>
              <button type="button" onClick={() => setForcedState({ value: 'Failed', nonce: Date.now() })} className="font-semibold text-rose-600 hover:underline">Chi tiết lỗi →</button>
            </p>
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="space-y-4 xl:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Tổng kết queue</h2>
          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Hoàn tất</dt><dd className="font-bold text-slate-900">{completed}</dd></div>
            <div><dt className="text-slate-500">Thất bại</dt><dd className="font-bold text-rose-600">{failed}</dd></div>
            <div><dt className="text-slate-500">Tỷ lệ hoàn tất trong nhóm kết thúc</dt><dd className="font-bold text-slate-900">{successRate}</dd></div>
          </dl>
        </Card>
        <RedisTelemetry
          failedCount={failed}
          completedCount={completed}
          onClearFailed={() => {
            if (window.confirm(`Xóa vĩnh viễn ${failed} bản ghi chấm thất bại?`)) void run(async () => toast.success(`Đã xóa ${await flushDeadLetter()} job thất bại.`));
          }}
          onClearCompleted={() => void run(async () => toast.success(`Đã xóa ${await clearCompleted()} job Completed.`))}
        />
      </section>

      {error ? (
        <AlertBox message={error} onRetry={reload} />
      ) : loading && jobs.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <JobsTable
          jobs={jobs}
          forcedState={forcedState}
          onRetry={(id) => void run(() => retry(id), `Đã đưa ${id} về hàng đợi.`)}
          onTerminal={setTerminalJob}
        />
      )}
      <JobTerminalModal job={terminalJob} onClose={() => setTerminalJob(null)} />
    </>
  );
};
