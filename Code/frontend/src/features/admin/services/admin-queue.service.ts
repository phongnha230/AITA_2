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
      return 'Chấm hoàn tất 100%';
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
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
      return 100;
    case 'FAILED':
      return 50;
    case 'RUNNING_AI':
      return 85;
    case 'RUNNING_SANDBOX':
      return 45;
    default:
      return 10;
  }
};

export const adminQueueService = {
  /**
   * Lấy danh sách jobs từ Backend BullMQ / DB
   */
  async list(): Promise<QueueJob[]> {
    try {
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
            detail: j.errorStage ? `Lỗi: ${j.errorStage}` : (j.status === 'RUNNING_AI' ? 'Socratic AI Rubric' : 'Docker Sandbox Runner'),
            student: studentCode ? `${studentName} (${studentCode})` : studentName,
            course: courseCode,
            queue: (j.status === 'RUNNING_AI' ? 'ai-rubric-queue' : 'docker-eval-queue') as JobQueueName,
            progressLabel: mapProgressLabel(j.status),
            percent: mapPercent(j.status),
            duration: j.sandboxEndedAt || j.aiEndedAt ? '1.8s' : '0.4s',
            state: mapJobState(j.status),
          };
        });
      }
    } catch (e) {
      console.warn('[AdminQueueService] Failed to load jobs from backend:', e);
    }

    return [];
  },

  /**
   * Lấy số liệu metrics tổng quan từ BullMQ & Database
   */
  async getMetrics(): Promise<QueueMetricsOverview | null> {
    try {
      const response = await api.get('/jobs/metrics/overview');
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Yêu cầu Backend chấm lại bài nộp bị lỗi
   */
  async retry(submissionId: string): Promise<void> {
    await api.post(`/jobs/${encodeURIComponent(submissionId)}/retry`);
  },

  async prioritize(id: string): Promise<void> {
    console.log(`Prioritizing job ${id}`);
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
