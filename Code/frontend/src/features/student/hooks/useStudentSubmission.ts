'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStudentServiceErrorMessage, studentService } from '../services/student.service';
import type {
  GradingJobInfo,
  ResourceState,
  StudentSubmissionDetail,
} from '../types/student.types';

interface UseStudentSubmissionResult {
  submission: ResourceState<StudentSubmissionDetail | null>;
  gradingJob: GradingJobInfo | null;
  isPolling: boolean;
  refetch: () => void;
}

export function useStudentSubmission(submissionId: string | null): UseStudentSubmissionResult {
  const [submission, setSubmission] = useState<ResourceState<StudentSubmissionDetail | null>>(() => ({
    status: submissionId ? 'loading' : 'success',
    data: null,
    error: null,
  }));
  const [gradingJob, setGradingJob] = useState<GradingJobInfo | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const cleanId = submissionId?.trim() ?? '';

  const refetch = useCallback(() => {
    setIsPolling(false);
    setSubmission((prev) => ({ ...prev, status: 'loading', error: null }));
    setAttempt((c) => c + 1);
  }, []);

  // 1. Initial fetch of submission & job details
  useEffect(() => {
    if (!cleanId) {
      setIsPolling(false);
      setSubmission({ status: 'success', data: null, error: null });
      setGradingJob(null);
      return;
    }

    let active = true;
    setSubmission((prev) => ({ ...prev, status: 'loading', error: null }));

    Promise.allSettled([
      studentService.getSubmission(cleanId),
      studentService.getGradingJobStatus(cleanId),
    ]).then(([subResult, jobResult]) => {
      if (!active) return;

      if (subResult.status === 'fulfilled') {
        const subData = subResult.value;
        const jobData = jobResult.status === 'fulfilled' ? jobResult.value : subData.gradingJob ?? null;

        setSubmission({ status: 'success', data: subData, error: null });
        setGradingJob(jobData);

        const currentStatus = jobData?.status ?? subData.status;
        const isTerminal = currentStatus === 'COMPLETED' || currentStatus === 'FAILED';

        if (!isTerminal && currentStatus) {
          setIsPolling(true);
        } else {
          setIsPolling(false);
        }
      } else {
        setIsPolling(false);
        setSubmission({
          status: 'error',
          data: null,
          error: getStudentServiceErrorMessage(
            subResult.reason,
            'Không tìm thấy thông tin bài nộp. Vui lòng kiểm tra lại mã bài nộp (Submission ID).',
          ),
        });
      }
    });

    return () => {
      active = false;
    };
  }, [cleanId, attempt]);

  // 2. Dedicated polling effect with guaranteed synchronous timer lifecycle
  useEffect(() => {
    if (!isPolling || !cleanId) return;

    let active = true;
    const intervalId = setInterval(async () => {
      if (!active) return;

      try {
        const latestJob = await studentService.getGradingJobStatus(cleanId);
        if (!active || !latestJob) return;

        setGradingJob(latestJob);

        if (latestJob.status === 'COMPLETED' || latestJob.status === 'FAILED') {
          setIsPolling(false);
          try {
            const refreshedSub = await studentService.getSubmission(cleanId);
            if (active) {
              setSubmission({ status: 'success', data: refreshedSub, error: null });
            }
          } catch {
            // Refreshed fetch error handled silently
          }
        }
      } catch {
        // Ignore temporary network glitch during polling
      }
    }, 3000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [isPolling, cleanId]);

  return {
    submission,
    gradingJob,
    isPolling,
    refetch,
  };
}
