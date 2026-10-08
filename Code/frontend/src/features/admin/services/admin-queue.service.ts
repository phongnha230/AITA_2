import { loadMockDb, mockDelay, saveMockDb } from '../mocks/mock-db';
import type { QueueJob } from '../types/admin.types';

/** No backend endpoint exists for queue admin yet, so this service is always backed by the localStorage mock DB. */
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
    await mockDelay(200);
    return [...loadMockDb().jobs];
  },

  async retry(id: string): Promise<void> {
    await mockDelay(150);
    const db = loadMockDb();
    db.jobs = db.jobs.map((j) => (j.id === id && j.state === 'Failed' ? retryJob(j) : j));
    saveMockDb(db);
  },

  /** Moves a queued job to the front of the queue. */
  async prioritize(id: string): Promise<void> {
    await mockDelay(100);
    const db = loadMockDb();
    const job = db.jobs.find((j) => j.id === id);
    if (!job) return;
    db.jobs = [job, ...db.jobs.filter((j) => j.id !== id)];
    saveMockDb(db);
  },

  async remove(predicate: (j: QueueJob) => boolean): Promise<number> {
    await mockDelay(150);
    const db = loadMockDb();
    const before = db.jobs.length;
    db.jobs = db.jobs.filter((j) => !predicate(j));
    saveMockDb(db);
    return before - db.jobs.length;
  },

  flushDeadLetter(): Promise<number> {
    return this.remove((j) => j.state === 'Failed');
  },
  clearCompleted(): Promise<number> {
    return this.remove((j) => j.state === 'Completed');
  },

  async retryAllFailed(): Promise<number> {
    await mockDelay(200);
    const db = loadMockDb();
    let count = 0;
    db.jobs = db.jobs.map((j) => {
      if (j.state !== 'Failed') return j;
      count += 1;
      return retryJob(j);
    });
    saveMockDb(db);
    return count;
  },
};
