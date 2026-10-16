import api from '@/lib/api';
import type { QueueJob, JobState, JobQueueName } from '../types/admin.types';

export interface QueueMetricsOverview {
  bullmq: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  database: {
    total: number;
    statuses: Record<string, number>;
  };
}

const mapJobState = (status: string): JobState => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'RUNNING_SANDBOX':
    case 'RUNNING_AI':
      return 'Processing';
    case 'QUEUED':
    case 'RETRYING':
    default:
      return 'Queued';
  }
};

const mapProgressLabel = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 'Đã hoàn tất';
    case 'FAILED':
      return 'Lỗi biên dịch / timeout';
    case 'RUNNING_SANDBOX':
      return 'Đang chạy Docker Sandbox';
    case 'RUNNING_AI':
      return 'Đang đánh giá Socratic AI';
    case 'RETRYING':
      return 'Đang thử lại (Retry)';
    default:
      return 'Trong hàng đợi BullMQ';
  }
};

const mapPercent = (status: string): number => {
  return status?.toUpperCase() === 'COMPLETED' ? 100 : 0;
};

export const adminQueueService = {
  /**
   * Lấy danh sách jobs từ Backend BullMQ / DB
   */
  async list(): Promise<QueueJob[]> {
      const response = await api.get('/jobs/queue/jobs');
      const rawJobs = response.data?.data;

      if (Array.isArray(rawJobs)) {
        return rawJobs.map((j: any) => {
          const studentName = j.submission?.user?.fullName || 'Sinh viên';
          const studentCode = j.submission?.user?.studentCode || (j.submission?.user?.email ? j.submission.user.email.split('@')[0] : '');
          const courseCode = j.submission?.assignment?.course?.code || 'PE';
          const assignmentTitle = j.submission?.assignment?.title || 'Chấm thi tự động';

          return {
            id: j.submissionId || j.id,
            name: `${courseCode}: ${assignmentTitle.slice(0, 26)}...`,
            detail: j.errorStage ? `Lỗi: ${j.errorStage}` : (j.status === 'RUNNING_AI' ? 'Đang chấm AI' : 'Đang xử lý'),
            student: studentCode ? `${studentName} (${studentCode})` : studentName,
            course: courseCode,
            queue: 'grading' as JobQueueName,
            progressLabel: mapProgressLabel(j.status),
            percent: mapPercent(j.status),
            duration: formatJobDuration(j),
            state: mapJobState(j.status),
          };
        });
      }
      throw new Error('Backend trả về danh sách job không hợp lệ.');
  },

  async getMetrics(): Promise<QueueMetricsOverview> {
      const response = await api.get('/jobs/metrics/overview');
      if (!response.data?.data) throw new Error('Backend không trả metrics hàng đợi.');
      return response.data.data;
  },

  /**
   * Yêu cầu Backend chấm lại bài nộp bị lỗi
   */
  async retry(submissionId: string): Promise<void> {
    await api.post(`/jobs/${encodeURIComponent(submissionId)}/retry`);
  },

  async flushDeadLetter(): Promise<number> {
    const res = await api.post('/jobs/queue/flush-dead-letter');
    return res.data?.data?.deletedCount ?? 0;
  },

  async clearCompleted(): Promise<number> {
    const res = await api.post('/jobs/queue/clear-completed');
    return res.data?.data?.clearedCount ?? 0;
  },

  async retryAllFailed(): Promise<number> {
    const res = await api.post('/jobs/queue/retry-all');
    return res.data?.data?.retriedCount ?? 0;
  },
};

function formatJobDuration(job: Record<string, unknown>): string {
  const start = Date.parse(String(job.sandboxStartedAt ?? job.aiStartedAt ?? job.queuedAt ?? ''));
  const end = Date.parse(String(job.aiEndedAt ?? job.sandboxEndedAt ?? job.failedAt ?? ''));
  if (!Number.isFinite(start)) return '—';
  const seconds = Math.max(0, Math.round(((Number.isFinite(end) ? end : Date.now()) - start) / 1000));
  return `${seconds}s`;
}
