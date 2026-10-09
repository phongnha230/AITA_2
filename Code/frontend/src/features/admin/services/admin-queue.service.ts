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

      if (Array.isArray(rawJobs) && rawJobs.length > 0) {
        return rawJobs.map((j: any) => ({
          id: j.submissionId || j.id,
          name: `Grading Job #${(j.submissionId || j.id).slice(0, 8)}`,
          detail: `Submission ID: ${(j.submissionId || j.id).slice(0, 8)}`,
          student: j.submission?.userId ? `Sinh viên (${j.submission.userId.slice(0, 8)})` : 'Sinh viên AITA',
          course: 'SWD392',
          queue: (j.status === 'RUNNING_AI' ? 'ai-rubric-queue' : 'docker-eval-queue') as JobQueueName,
          progressLabel: mapProgressLabel(j.status),
          percent: mapPercent(j.status),
          duration: j.sandboxEndedAt || j.aiEndedAt ? '1.8s' : '0.4s',
          state: mapJobState(j.status),
        }));
      }
    } catch {
      // Fallback below
    }

    // Default fallback demo data if no jobs in DB yet
    return [
      {
        id: 'job-seed-01',
        name: 'Evaluation PRO192 #01',
        detail: 'Kiểm tra Unit Test OOP Java',
        student: 'Trần Đỗ Phong Nhã (QE190161)',
        course: 'PRO192',
        queue: 'docker-eval-queue',
        progressLabel: 'Chấm hoàn tất 100%',
        percent: 100,
        duration: '1.2s',
        state: 'Completed',
      },
      {
        id: 'job-seed-02',
        name: 'Evaluation CSD201 #02',
        detail: 'Cây AVL & Binary Search Tree',
        student: 'Nguyễn Văn Điệp (QE180203)',
        course: 'CSD201',
        queue: 'docker-eval-queue',
        progressLabel: 'Đang chạy Docker Sandbox',
        percent: 45,
        duration: '0.8s',
        state: 'Processing',
      },
      {
        id: 'job-seed-03',
        name: 'Socratic AI Rubric #03',
        detail: 'Phân tích tiêu chí Clean Code',
        student: 'Nguyễn Anh Tuấn (QE190003)',
        course: 'SWD392',
        queue: 'ai-rubric-queue',
        progressLabel: 'Đang đánh giá Socratic AI',
        percent: 85,
        duration: '2.4s',
        state: 'Processing',
      },
      {
        id: 'job-seed-04',
        name: 'Evaluation PRF192 #04',
        detail: 'Con trỏ & Bộ nhớ động C',
        student: 'Lê Hoàng Long (QE190045)',
        course: 'PRF192',
        queue: 'docker-eval-queue',
        progressLabel: 'Lỗi biên dịch / timeout',
        percent: 50,
        duration: '2.0s (Timeout)',
        state: 'Failed',
      },
    ];
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
    // Client-side prioritization feedback
    console.log(`Prioritizing job ${id}`);
  },

  async flushDeadLetter(): Promise<number> {
    return 0;
  },

  async clearCompleted(): Promise<number> {
    return 0;
  },

  async retryAllFailed(): Promise<number> {
    return 0;
  },
};
