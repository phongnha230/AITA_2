'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [submission, setSubmission] = useState<ResourceState<StudentSubmissionDetail | null>>({
    status: submissionId ? 'loading' : 'success',
    data: null,
    error: null,
  });
  const [gradingJob, setGradingJob] = useState<GradingJobInfo | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const refetch = useCallback(() => {
    stopPolling();
    setSubmission((prev) => ({ ...prev, status: 'loading', error: null }));
    setAttempt((c) => c + 1);
  }, [stopPolling]);

  useEffect(() => {
    if (!submissionId || !submissionId.trim()) {
      stopPolling();
      setSubmission({ status: 'success', data: null, error: null });
      setGradingJob(null);
      return;
    }

    let active = true;
    const cleanId = submissionId.trim();

    // 1. Initial fetch of submission and job status
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

        // Check if job is in active/non-terminal state
        const currentStatus = jobData?.status ?? subData.status;
        const isTerminal = currentStatus === 'COMPLETED' || currentStatus === 'FAILED';

        if (!isTerminal && currentStatus) {
          setIsPolling(true);
          // Start polling every 3 seconds
          pollTimerRef.current = setInterval(async () => {
            try {
              const latestJob = await studentService.getGradingJobStatus(cleanId);
              if (!active) return;

              if (latestJob) {
                setGradingJob(latestJob);

                if (latestJob.status === 'COMPLETED' || latestJob.status === 'FAILED') {
                  // Stop polling and refresh submission details
                  stopPolling();
                  try {
                    const refreshedSub = await studentService.getSubmission(cleanId);
                    if (active) {
                      setSubmission({ status: 'success', data: refreshedSub, error: null });
                    }
                  } catch {
                    // Refreshed fetch error handled silently
                  }
                }
              }
            } catch {
              // Ignore temporary network glitch during polling
            }
          }, 3000);
        } else {
          stopPolling();
        }
      } else {
        stopPolling();
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
      stopPolling();
    };
  }, [submissionId, attempt, stopPolling]);

  return {
    submission,
    gradingJob,
    isPolling,
    refetch,
  };
}
