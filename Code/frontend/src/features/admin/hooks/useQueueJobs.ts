'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../lib/errors';
import { adminQueueService } from '../services/admin-queue.service';
import type { QueueJob } from '../types/admin.types';

export const useQueueJobs = () => {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setJobs(await adminQueueService.list());
    } catch (e) {
      setError(getErrorMessage(e, 'Không tải được danh sách job.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Runs a mutation, then refreshes the list. Returns whatever the mutation returned. */
  const mutate = async <T,>(task: () => Promise<T>): Promise<T> => {
    const result = await task();
    setJobs(await adminQueueService.list());
    return result;
  };

  return {
    jobs,
    loading,
    error,
    reload: load,
    retry: (id: string) => mutate(() => adminQueueService.retry(id)),
    retryAllFailed: () => mutate(() => adminQueueService.retryAllFailed()),
    prioritize: (id: string) => mutate(() => adminQueueService.prioritize(id)),
    flushDeadLetter: () => mutate(() => adminQueueService.flushDeadLetter()),
    clearCompleted: () => mutate(() => adminQueueService.clearCompleted()),
  };
};
