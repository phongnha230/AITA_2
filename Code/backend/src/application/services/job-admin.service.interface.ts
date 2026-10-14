export interface JobQueueMetrics {
  bullmq: Record<string, number>;
  database: { total: number; statuses: Record<string, number> };
}

export interface IJobAdminService {
  getStatus(submissionId: string): Promise<unknown | null>;
  getMetrics(): Promise<JobQueueMetrics>;
  listJobs(): Promise<unknown[]>;
  retryAllFailed(): Promise<number>;
  retryJob(submissionId: string): Promise<boolean>;
  clearCompleted(): Promise<number>;
  flushDeadLetter(): Promise<number>;
}
