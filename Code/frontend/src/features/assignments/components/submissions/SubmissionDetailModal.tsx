'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LecturerSubmission } from '../../types/assignment.types';

import { assignmentService } from '../../services/assignment.service';
import type { GradingRun } from '@/features/grading/types/grading-history.types';
import { SubmissionOverview } from './SubmissionOverview';
import { ParticipantAdjustments } from './ParticipantAdjustments';
import { GradingHistoryPanel } from './GradingHistoryPanel';

interface SubmissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: LecturerSubmission | null;
  renderStatusBadge: (status: string) => React.ReactNode;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  open,
  onOpenChange,
  submission,
  renderStatusBadge,
}) => {
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  const [gradingRuns, setGradingRuns] = useState<GradingRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [finalScoreDraft, setFinalScoreDraft] = useState('');
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const mountedRef = useRef(true);

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

  const submissionId = submission?.id;

  useEffect(() => {
    let cancelled = false;
    if (!open || !submissionId) return () => { cancelled = true; };
    assignmentService.getGradingHistory(submissionId).then((runs) => {
      if (!cancelled) {
        setGradingRuns(runs);
        setSelectedRunId((current) => current || runs[0]?.id || '');
      }
    }).catch((error: unknown) => {
      if (!cancelled) setHistoryError(error instanceof Error ? error.message : 'Không tải được lịch sử chấm.');
    });
    return () => { cancelled = true; };
  }, [open, submissionId]);

  if (!submission) return null;

  const refreshHistory = async () => {
    if (!submission) return;
    const runs = await assignmentService.getGradingHistory(submission.id);
    setGradingRuns(runs);
    setSelectedRunId(runs[0]?.id ?? '');
  };

  const handleRegrade = async () => {
    if (!submission) return;
    try { setBusy(true); setHistoryError(null); await assignmentService.regradeSubmission(submission.id); await refreshHistory(); }
    catch (error) { setHistoryError(error instanceof Error ? error.message : 'Không tạo được lượt chấm mới.'); }
    finally { setBusy(false); }
  };

  const handleReview = async () => {
    if (!selectedRunId) return;
    try {
      setBusy(true); setHistoryError(null);
      const score = finalScoreDraft.trim() ? Number(finalScoreDraft) : undefined;
      await assignmentService.reviewGradingRun(selectedRunId, reviewNote, score);
      setReviewNote(''); await refreshHistory();
    } catch (error) { setHistoryError(error instanceof Error ? error.message : 'Không thể duyệt và công bố điểm.'); }
    finally { setBusy(false); }
  };

  const showEvidence = async (runId: string, evidenceId: string) => {
    try {
      const blob = await assignmentService.getGradingEvidence(submission.id, runId, evidenceId);
      const nextUrl = URL.createObjectURL(blob);
      if (!mountedRef.current) {
        URL.revokeObjectURL(nextUrl);
        return;
      }
      setEvidenceUrl(nextUrl);
    } catch (error) { setHistoryError(error instanceof Error ? error.message : 'Không tải được ảnh bằng chứng.'); }
  };
  const handleAdjustScore = async (userId: string) => {
    try {
      setAdjustmentError(null);
      const rawScore = scoreDrafts[userId] ?? '';
      await assignmentService.adjustParticipantScore(submission.id, userId, {
        adjustedScore: rawScore.trim() === '' ? null : Number(rawScore),
        reason: reasonDrafts[userId] ?? '',
      });
    } catch (error) {
      setAdjustmentError(error instanceof Error ? error.message : 'Không thể điều chỉnh điểm.');
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setEvidenceUrl(null);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 font-sans">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center justify-between">
            <span>Chi Tiết Bài Nộp Của Sinh Viên</span>
            {renderStatusBadge(submission.status)}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Mã bài nộp: <code className="font-mono text-indigo-600">{submission.id}</code> • Sinh viên: {submission.user?.fullName} ({submission.user?.email})
          </DialogDescription>
        </DialogHeader>

        <SubmissionOverview submission={submission} />
        <ParticipantAdjustments
          participants={submission.participants ?? []}
          scoreDrafts={scoreDrafts}
          reasonDrafts={reasonDrafts}
          error={adjustmentError}
          onScoreChange={(userId, value) => setScoreDrafts((current) => ({ ...current, [userId]: value }))}
          onReasonChange={(userId, value) => setReasonDrafts((current) => ({ ...current, [userId]: value }))}
          onSave={handleAdjustScore}
        />
        <GradingHistoryPanel
          runs={gradingRuns}
          selectedRunId={selectedRunId}
          error={historyError}
          busy={busy}
          reviewNote={reviewNote}
          finalScoreDraft={finalScoreDraft}
          evidenceUrl={evidenceUrl}
          onSelectRun={setSelectedRunId}
          onRegrade={handleRegrade}
          onReviewNoteChange={setReviewNote}
          onFinalScoreChange={setFinalScoreDraft}
          onReview={handleReview}
          onShowEvidence={showEvidence}
        />
      </DialogContent>
    </Dialog>
  );
};
