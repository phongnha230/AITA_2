'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { useStudentSubmission } from '../../hooks/useStudentSubmission';
import { StudentPageHeading } from '../shared/StudentPageHeading';
import { GradingLifecycleProgress } from './GradingLifecycleProgress';
import { SubmissionScoreOverview } from './SubmissionScoreOverview';
import { TestCaseResultsList } from './TestCaseResultsList';
import { AiRubricFeedbackCard } from './AiRubricFeedbackCard';
import { studentService } from '../../services/student.service';
import type { GradingRun } from '@/features/grading/types/grading-history.types';
import { GradingHistoryDetails } from './GradingHistoryDetails';
import type { StudentSubmissionDetail, StudentSubmissionListItem } from '../../types/student.types';
import { StudentResultsTable } from './StudentResultsTable';
import { AiTutorChatDrawer, type AiTutorContextSubmission } from '../ai-tutor/AiTutorChatDrawer';

function SubmissionMetadata({ submission }: { submission: StudentSubmissionDetail }) {
  if (!submission.attemptNo && !submission.deployedUrl && !submission.gitCommitHash) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-elevated-sm">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <span>Attempt: <strong>#{submission.attemptNo ?? 1}</strong></span>
        {submission.gitCommitHash && <span>Commit: <code className="font-mono text-blue-700">{submission.gitCommitHash}</code></span>}
        {submission.deployedUrl && <a className="font-semibold text-blue-600 hover:underline" href={submission.deployedUrl} target="_blank" rel="noreferrer">Mở website đã chấm</a>}
      </div>
      {submission.gitContributors && submission.gitContributors.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {submission.gitContributors.map((contributor) => (
            <div key={contributor.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-800">{contributor.authorName} {!contributor.matchedUserId && <span className="text-amber-600">(chưa match)</span>}</p>
              <p>{contributor.contributionPct}% · {contributor.commitCount} commits · +{contributor.linesAdded}/-{contributor.linesDeleted}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SubmissionResultDetails({
  submission,
  gradingJob,
  isPolling,
  isStreaming,
  gradingHistory,
  historyError,
  evidenceUrl,
  onShowEvidence,
  onOpenAiTutor,
}: {
  submission: StudentSubmissionDetail;
  gradingJob: ReturnType<typeof useStudentSubmission>['gradingJob'];
  isPolling: boolean;
  isStreaming: boolean;
  gradingHistory: GradingRun[];
  historyError: string | null;
  evidenceUrl: string | null;
  onShowEvidence: (runId: string, evidenceId: string) => void;
  onOpenAiTutor: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 text-xs shadow-elevated-sm text-slate-600">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-bold text-slate-900 sm:text-sm">{submission.assignment?.title || 'Bài thi PE'}</span>
          <span className="text-slate-300">•</span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-slate-600">
            ID: {submission.id}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-500">
            Phương thức nộp: <strong className="text-slate-700">{submission.submissionChannel}</strong>
          </span>
          <button
            type="button"
            onClick={onOpenAiTutor}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition-colors"
          >
            <Brain className="size-3.5 text-blue-600" />
            <span>Trò chuyện AI về bài này</span>
          </button>
        </div>
      </div>

      <SubmissionMetadata submission={submission} />

      {submission.status === 'REVIEW_PENDING' && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Hệ thống đã chấm xong và đang chờ giảng viên xem xét, công bố điểm. Điểm đề xuất và testcase ẩn sẽ chưa hiển thị trong thời gian này.
        </div>
      )}

      <GradingLifecycleProgress gradingJob={gradingJob} submissionStatus={submission.status} isPolling={isPolling} isStreaming={isStreaming} />
      <SubmissionScoreOverview submission={submission} />
      <TestCaseResultsList testResults={submission.testResults ?? []} />
      <AiRubricFeedbackCard aiGradingResult={submission.aiGradingResult} submissionId={submission.id} />
      {historyError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{historyError}</p>}
      <GradingHistoryDetails runs={gradingHistory} onShowEvidence={onShowEvidence} evidenceUrl={evidenceUrl} />
    </div>
  );
}

function StudentResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSubmissionId = searchParams.get('submissionId');

  const [submissionsList, setSubmissionsList] = useState<StudentSubmissionListItem[]>([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [activeTutorSubmission, setActiveTutorSubmission] = useState<AiTutorContextSubmission | null>(null);

  const [gradingHistory, setGradingHistory] = useState<GradingRun[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const { submission, gradingJob, isPolling, isStreaming, refetch } = useStudentSubmission(currentSubmissionId);

  // Fetch full submissions list for the table
  const fetchSubmissions = useCallback(async () => {
    setIsListLoading(true);
    try {
      const items = await studentService.getMySubmissions();
      if (mountedRef.current) {
        setSubmissionsList(items);
      }
    } catch {
      // Keep empty if failed
    } finally {
      if (mountedRef.current) {
        setIsListLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Handle grading history when a specific submission is inspected
  useEffect(() => {
    let cancelled = false;
    setGradingHistory([]);
    setHistoryError(null);
    if (!currentSubmissionId) return () => { cancelled = true; };

    studentService.getGradingHistory(currentSubmissionId).then((history) => {
      if (!cancelled) setGradingHistory(history);
    }).catch((error: unknown) => {
      if (!cancelled) setHistoryError(error instanceof Error ? error.message : 'Không tải được lịch sử chấm.');
    });

    return () => { cancelled = true; };
  }, [currentSubmissionId]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!evidenceUrl) return;
    return () => URL.revokeObjectURL(evidenceUrl);
  }, [evidenceUrl]);

  const showEvidence = async (runId: string, evidenceId: string) => {
    if (!currentSubmissionId) return;
    try {
      const blob = await studentService.getGradingEvidence(currentSubmissionId, runId, evidenceId);
      const nextUrl = URL.createObjectURL(blob);
      if (!mountedRef.current) {
        URL.revokeObjectURL(nextUrl);
        return;
      }
      setEvidenceUrl(nextUrl);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Không mở được ảnh bằng chứng.');
    }
  };

  const handleSelectSubmission = (id: string) => {
    router.push(`/student/results?submissionId=${encodeURIComponent(id)}`);
  };

  const handleOpenAiTutorFromTable = (item: StudentSubmissionListItem) => {
    setActiveTutorSubmission({
      id: item.id,
      assignmentTitle: item.assignmentTitle,
      courseCode: item.courseCode,
      paperCode: item.paperCode,
      attemptNo: item.attemptNo,
      finalScore: item.finalScore,
      sandboxScore: item.sandboxScore,
      aiScore: item.aiScore,
      status: item.status,
    });
  };

  const handleOpenAiTutorFromDetail = () => {
    if (!submission.data) return;
    const d = submission.data;
    setActiveTutorSubmission({
      id: d.id,
      assignmentTitle: d.assignment?.title || 'Bài thi PE',
      courseCode: d.assignment?.environment || 'PE',
      paperCode: d.paperCode,
      attemptNo: d.attemptNo,
      finalScore: Number(d.finalScore ?? 0),
      sandboxScore: Number(d.sandboxScore ?? 0),
      aiScore: Number(d.aiScore ?? 0),
      status: d.status,
    });
  };

  const hasSubmission = Boolean(currentSubmissionId && submission.data);

  return (
    <div className="space-y-6">
      <StudentPageHeading
        eyebrow="Khảo thí &amp; Đánh giá"
        title="Kết quả &amp; Đánh giá AI"
        description="Theo dõi bảng kết quả các ca thi PE, điểm số Sandbox Docker và thảo luận giải thuật cùng Trợ giảng Socratic AI."
        action={
          currentSubmissionId ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/student/results')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="size-4 text-slate-500" />
                <span>Về danh sách bài thi</span>
              </button>
              <button
                type="button"
                onClick={refetch}
                disabled={submission.status === 'loading'}
                aria-label="Làm mới kết quả bài nộp"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${submission.status === 'loading' ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={isListLoading}
              aria-label="Làm mới bảng kết quả"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${isListLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          )
        }
      />

      {/* Case 1: Viewing Detail of a Single Submission */}
      {currentSubmissionId ? (
        <div className="space-y-6">
          {/* Error State */}
          {submission.status === 'error' && (
            <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-elevated-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-900">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                <p>{submission.error || 'Không tìm thấy thông tin bài nộp này.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/student/results')}
                  className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900 shadow-sm hover:bg-rose-50"
                >
                  Quay lại danh sách
                </button>
                <button
                  type="button"
                  onClick={refetch}
                  className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-900 shadow-sm hover:bg-rose-50"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {submission.status === 'loading' && (
            <div role="status" aria-label="Đang tải kết quả bài nộp" className="space-y-4">
              <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            </div>
          )}

          {/* Loaded Submission Details */}
          {submission.status === 'success' && hasSubmission && submission.data && (
            <SubmissionResultDetails
              submission={submission.data}
              gradingJob={gradingJob}
              isPolling={isPolling}
              isStreaming={isStreaming}
              gradingHistory={gradingHistory}
              historyError={historyError}
              evidenceUrl={evidenceUrl}
              onShowEvidence={showEvidence}
              onOpenAiTutor={handleOpenAiTutorFromDetail}
            />
          )}
        </div>
      ) : (
        /* Case 2: Main Overview Table of All Submissions */
        <StudentResultsTable
          submissions={submissionsList}
          isLoading={isListLoading}
          onRefresh={fetchSubmissions}
          onSelectSubmission={handleSelectSubmission}
          onOpenAiTutor={handleOpenAiTutorFromTable}
        />
      )}

      {/* Contextual Socratic AI Tutor Drawer */}
      <AiTutorChatDrawer
        isOpen={Boolean(activeTutorSubmission)}
        onClose={() => setActiveTutorSubmission(null)}
        submission={activeTutorSubmission}
      />
    </div>
  );
}

export function StudentResults() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </div>
      }
    >
      <StudentResultsContent />
    </Suspense>
  );
}
