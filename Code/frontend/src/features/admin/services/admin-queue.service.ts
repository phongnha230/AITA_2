import type { QueueJob } from '../types/admin.types';

let currentJobs: QueueJob[] = [];

const retryJob = (job: QueueJob): QueueJob => ({
  ...job,
  state: 'Queued',
  percent: 0,
  duration: '0.0s',
  progressLabel: 'Trong hàng đợi',
  detail: `Retry của ${job.id}`,
});

export const adminQueueService = {
  async list(): Promise<QueueJob[]> {
    return [...currentJobs];
  },

  async retry(id: string): Promise<void> {
    currentJobs = currentJobs.map((j) => (j.id === id && j.state === 'Failed' ? retryJob(j) : j));
  },

  /** Moves a queued job to the front of the queue. */
  async prioritize(id: string): Promise<void> {
    const job = currentJobs.find((j) => j.id === id);
    if (!job) return;
    currentJobs = [job, ...currentJobs.filter((j) => j.id !== id)];
  },

  async remove(predicate: (j: QueueJob) => boolean): Promise<number> {
    const before = currentJobs.length;
    currentJobs = currentJobs.filter((j) => !predicate(j));
    return before - currentJobs.length;
  },

  flushDeadLetter(): Promise<number> {
    return this.remove((j) => j.state === 'Failed');
  },
  clearCompleted(): Promise<number> {
    return this.remove((j) => j.state === 'Completed');
  },

  async retryAllFailed(): Promise<number> {
    let count = 0;
    currentJobs = currentJobs.map((j) => {
      if (j.state !== 'Failed') return j;
      count += 1;
      return retryJob(j);
    });
    return count;
  },
};
