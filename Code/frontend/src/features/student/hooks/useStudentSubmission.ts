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
  isStreaming: boolean;
  refetch: () => void;
}

export function useStudentSubmission(submissionId: string | null): UseStudentSubmissionResult {
  const [submission, setSubmission] = useState<ResourceState<StudentSubmissionDetail | null>>(() => ({
    status: submissionId ? 'loading' : 'success',
    data: null,
    error: null,
  }));
  const [gradingJob, setGradingJob] = useState<GradingJobInfo | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [usePollingFallback, setUsePollingFallback] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const cleanId = submissionId?.trim() ?? '';
  const eventSourceRef = useRef<EventSource | null>(null);

  const refetch = useCallback(() => {
    setIsLiveActive(false);
    setIsStreaming(false);
    setUsePollingFallback(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSubmission((prev) => ({ ...prev, status: 'loading', error: null }));
    setAttempt((c) => c + 1);
  }, []);

  // 1. Initial fetch of submission & job details
  useEffect(() => {
    if (!cleanId) {
      setIsLiveActive(false);
      setIsStreaming(false);
      setUsePollingFallback(false);
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
          setIsLiveActive(true);
        } else {
          setIsLiveActive(false);
        }
      } else {
        setIsLiveActive(false);
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

  // 2. Realtime SSE Stream (Server-Sent Events) with Auto-Fallback to Polling
  useEffect(() => {
    if (!isLiveActive || !cleanId || usePollingFallback) return;

    if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      setUsePollingFallback(true);
      return;
    }

    let active = true;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const token = localStorage.getItem('token') || localStorage.getItem('aita_token') || '';
    const sseUrl = `${baseUrl}/jobs/${encodeURIComponent(cleanId)}/events?token=${encodeURIComponent(token)}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!active) return;
        setIsStreaming(true);
      };

      es.onmessage = async (event) => {
        if (!active) return;
        try {
          const data: GradingJobInfo = JSON.parse(event.data);
          if (data && data.status) {
            setGradingJob(data);

            if (data.status === 'COMPLETED' || data.status === 'FAILED') {
              es.close();
              setIsStreaming(false);
              setIsLiveActive(false);

              // Refresh full submission data
              try {
                const refreshed = await studentService.getSubmission(cleanId);
                if (active) {
                  setSubmission({ status: 'success', data: refreshed, error: null });
                }
              } catch {
                // ignore
              }
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      es.addEventListener('end', async () => {
        if (!active) return;
        es.close();
        setIsStreaming(false);
        setIsLiveActive(false);

        try {
          const refreshed = await studentService.getSubmission(cleanId);
          if (active) {
            setSubmission({ status: 'success', data: refreshed, error: null });
          }
        } catch {
          // ignore
        }
      });

      es.onerror = () => {
        if (!active) return;
        es.close();
        setIsStreaming(false);
        // Fallback to Polling if SSE stream drops or fails
        setUsePollingFallback(true);
      };
    } catch {
      setUsePollingFallback(true);
    }

    return () => {
      active = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsStreaming(false);
    };
  }, [isLiveActive, cleanId, usePollingFallback]);

  // 3. Fallback Polling Effect (Only active if SSE encounters error or is unsupported)
  useEffect(() => {
    if (!isLiveActive || !cleanId || !usePollingFallback) return;

    let active = true;
    const intervalId = setInterval(async () => {
      if (!active) return;

      try {
        const latestJob = await studentService.getGradingJobStatus(cleanId);
        if (!active || !latestJob) return;

        setGradingJob(latestJob);

        if (latestJob.status === 'COMPLETED' || latestJob.status === 'FAILED') {
          setIsLiveActive(false);
          try {
            const refreshedSub = await studentService.getSubmission(cleanId);
            if (active) {
              setSubmission({ status: 'success', data: refreshedSub, error: null });
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // Ignore temporary network glitch during polling
      }
    }, 2500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [isLiveActive, cleanId, usePollingFallback]);

  return {
    submission,
    gradingJob,
    isPolling: isLiveActive && usePollingFallback,
    isStreaming,
    refetch,
  };
}
