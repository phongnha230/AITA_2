'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenLine, Save, Loader2, CheckCircle2 } from 'lucide-react';
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
  onSubmissionUpdated?: () => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  open,
  onOpenChange,
  submission,
  renderStatusBadge,
  onSubmissionUpdated,
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
  
  // Manual grading state
  const [manualScore, setManualScore] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualBusy, setManualBusy] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

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
    try {
      setBusy(true);
      setHistoryError(null);
      await assignmentService.regradeSubmission(submission.id);
      await refreshHistory();
      onSubmissionUpdated?.();
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Không tạo được lượt chấm mới.');
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRunId) return;
    try {
      setBusy(true);
      setHistoryError(null);
      const score = finalScoreDraft.trim() ? Number(finalScoreDraft) : undefined;
      await assignmentService.reviewGradingRun(selectedRunId, reviewNote, score);
      setReviewNote('');
      await refreshHistory();
      onSubmissionUpdated?.();
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Không thể duyệt và công bố điểm.');
    } finally {
      setBusy(false);
    }
  };

  const handleManualGrade = async () => {
    if (!submissionId) return;
    const scoreNum = Number(manualScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      setManualError('Điểm chấm thủ công phải nằm trong khoảng từ 0.0 đến 10.0');
      return;
    }
    if (!manualReason.trim()) {
      setManualError('Vui lòng nhập lý do / ghi chú chấm bài thủ công.');
      return;
    }

    try {
      setManualBusy(true);
      setManualError(null);
      setManualSuccessMsg(null);
      await assignmentService.manualGradeSubmission(submissionId, {
        finalScore: scoreNum,
        reason: manualReason.trim(),
      });
      setManualSuccessMsg(`Đã cập nhật điểm thành công: ${scoreNum.toFixed(1)} / 10`);
      setManualScore('');
      setManualReason('');
      await refreshHistory();
      onSubmissionUpdated?.();
      setTimeout(() => setManualSuccessMsg(null), 4000);
    } catch (err: any) {
      setManualError(err?.message || 'Không thể lưu điểm chấm thủ công.');
    } finally {
      setManualBusy(false);
    }
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
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Không tải được ảnh bằng chứng.');
    }
  };

  const handleAdjustScore = async (userId: string) => {
    try {
      setAdjustmentError(null);
      const rawScore = scoreDrafts[userId] ?? '';
      await assignmentService.adjustParticipantScore(submission.id, userId, {
        adjustedScore: rawScore.trim() === '' ? null : Number(rawScore),
        reason: reasonDrafts[userId] ?? '',
      });
      onSubmissionUpdated?.();
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 font-sans">
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

        {/* Chấm điểm thủ công & Ghi đè kết quả */}
        <section aria-label="Chấm điểm thủ công" className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                <PenLine className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Chấm điểm thủ công (Ghi đè điểm)</h3>
                <p className="text-[11px] text-slate-500">
                  Nếu hệ thống AI hoặc Sandbox chấm sót, giảng viên tải file ZIP về máy để chạy test thủ công và ghi đè điểm tại đây.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-800 border-amber-300 font-mono text-xs">
              Điểm hiện tại: {submission.finalScore ?? '-'} / 10
            </Badge>
          </div>

          {manualSuccessMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{manualSuccessMsg}</span>
            </div>
          )}

          {manualError && (
            <p className="text-xs text-rose-700 font-medium">{manualError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Điểm mới (0.0 - 10.0)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={manualScore}
                onChange={(e) => setManualScore(e.target.value)}
                placeholder="VD: 7.0"
                className="w-full text-xs font-bold font-mono px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Lý do chấm thủ công / Nhận xét bắt buộc
              </label>
              <input
                type="text"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="VD: Đã tải file zip kiểm tra: hàm f2 đúng logic thuật toán nhưng in sai định dạng khoảng trắng."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              disabled={manualBusy || !manualReason.trim() || manualScore === ''}
              onClick={handleManualGrade}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs"
            >
              {manualBusy ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="size-3.5 mr-1.5" />
              )}
              <span>Lưu điểm & Công bố</span>
            </Button>
          </div>
        </section>

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
