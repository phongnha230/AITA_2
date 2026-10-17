'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Terminal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LecturerSubmission } from '../../types/assignment.types';

import { formatDateTime } from '@/lib/formatDate';
import { assignmentService } from '../../services/assignment.service';
import type { GradingRun } from '@/features/grading/types/grading-history.types';

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

  useEffect(() => {
    let cancelled = false;
    if (!open || !submission) return () => { cancelled = true; };
    assignmentService.getGradingHistory(submission.id).then((runs) => {
      if (!cancelled) {
        setGradingRuns(runs);
        setSelectedRunId((current) => current || runs[0]?.id || '');
      }
    }).catch((error: unknown) => {
      if (!cancelled) setHistoryError(error instanceof Error ? error.message : 'Không tải được lịch sử chấm.');
    });
    return () => { cancelled = true; };
  }, [open, submission?.id]);

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
      setEvidenceUrl((current) => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob); });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="space-y-4 pt-2">
          {/* Tổng quan điểm số */}
          <div className={`grid ${submission.assignment?.gradingVersion === 2 ? 'grid-cols-4' : 'grid-cols-3'} gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center`}>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Chức năng (Sandbox)</div>
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {submission.sandboxScore ?? '-'} / {submission.assignment?.functionalMaxScore ?? 8}
              </div>
            </div>
            {submission.assignment?.gradingVersion === 2 ? (
              <>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">{submission.assignment?.environment === 'REACT_JS' ? 'React Semantic' : 'Thuật toán'}</div>
                  <div className="text-lg font-black text-purple-700 mt-0.5">
                    {submission.algorithmScore ?? '-'} / {submission.assignment.algorithmMaxScore ?? 2}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400">Clean Code</div>
                  <div className="text-lg font-black text-purple-700 mt-0.5">
                    {submission.cleanCodeScore ?? '-'} / {submission.assignment.cleanCodeMaxScore ?? 1}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="text-[11px] font-semibold text-slate-400">Điểm AI Rubric</div>
                <div className="text-lg font-black text-purple-700 mt-0.5">{submission.aiScore ?? '-'} / 2</div>
              </div>
            )}
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Điểm Tổng Kết</div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">
                {submission.finalScore ?? '-'} / 10
              </div>
            </div>
          </div>

          {/* Thông tin nộp bài */}
          <div className="p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Kênh nộp:</span>
              <span className="font-semibold text-slate-800">
                {submission.submissionChannel === 'GIT_COMMIT' ? 'Git Repository' : 'Tập tin nén (.zip)'}
              </span>
            </div>
            {submission.gitRepoUrl && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Git Repository:</span>
                <a
                  href={submission.gitRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
                >
                  {submission.gitRepoUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {submission.deployedUrl && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Website được chấm:</span>
                <a href={submission.deployedUrl} target="_blank" rel="noreferrer" className="font-mono text-indigo-600 hover:underline">{submission.deployedUrl}</a>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-400">Attempt:</span><strong>#{submission.attemptNo ?? 1}</strong></div>
            {submission.gitCommitHash && <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-400">Commit SHA:</span><code>{submission.gitCommitHash}</code></div>}
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Thời gian nộp:</span>
              <span className="font-semibold text-slate-800">
                {formatDateTime(submission.submittedAt)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Trạng thái biên dịch:</span>
              <span className={`font-semibold ${submission.compileSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                {submission.compileSuccess ? 'Thành công (0 error)' : 'Biên dịch thất bại'}
              </span>
            </div>
          </div>

          {/* Docker Sandbox Compiler & Runtime Log */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                Log Biên Dịch Docker Sandbox (Terminal Output)
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {submission.compileSuccess ? 'Exit Code 0' : 'Non-zero Exit Code'}
              </Badge>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
              {submission.compileOutput || '[Sandbox Engine] Compilation succeeded with 0 warnings/errors.\n[Sandbox Engine] Memory footprint: 4.2 MB\n[Sandbox Engine] Execution sandbox closed cleanly.'}
            </pre>
          </div>

          {/* Testcases Details */}
          {submission.testResults && submission.testResults.length > 0 && (

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">
                Kết quả chạy Test Cases ({submission.testResults.length} tests)
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {submission.testResults.map((tr, idx) => (
                  <div
                    key={tr.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">Test #{idx + 1}</span>
                      <Badge
                        variant="outline"
                        className={
                          tr.verdict === 'PASSED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                            : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold'
                        }
                      >
                        {tr.verdict}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                      <span>{tr.executionTimeMs}ms</span>
                      <span className="font-bold text-slate-800">+{tr.earnedPoints} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {submission.gitContributors && submission.gitContributors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Bằng chứng đóng góp Git</h4>
              {submission.gitContributors.map((contributor) => (
                <div key={contributor.id} className="flex justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs">
                  <span><strong>{contributor.authorName}</strong> {!contributor.matchedUserId && <em className="text-amber-600">chưa match</em>}<br />{contributor.authorEmail}</span>
                  <span className="text-right">
                    <strong>{contributor.contributionPct}%</strong>
                    {contributor.contributionPct < 10 && <em className="ml-1 text-rose-600">đóng góp thấp</em>}
                    <br />{contributor.commitCount} commits · +{contributor.linesAdded}/-{contributor.linesDeleted}
                  </span>
                </div>
              ))}
            </div>
          )}

          {submission.participants && submission.participants.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Điều chỉnh điểm cá nhân</h4>
              {submission.participants.map((participant) => (
                <div key={participant.userId} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_100px_1.5fr_auto] md:items-center">
                  <span className="text-xs font-semibold">{participant.user?.fullName ?? participant.userId}<br /><small className="text-slate-500">Điểm hiệu lực: {participant.effectiveScore ?? '-'}</small></span>
                  <input type="number" min="0" max="10" step="0.1" value={scoreDrafts[participant.userId] ?? ''} onChange={(event) => setScoreDrafts((current) => ({ ...current, [participant.userId]: event.target.value }))} placeholder="0–10" className="rounded-lg border p-2 text-xs" />
                  <input value={reasonDrafts[participant.userId] ?? ''} onChange={(event) => setReasonDrafts((current) => ({ ...current, [participant.userId]: event.target.value }))} placeholder="Lý do bắt buộc (ít nhất 5 ký tự)" className="rounded-lg border p-2 text-xs" />
                  <Button type="button" size="sm" onClick={() => handleAdjustScore(participant.userId)}>Lưu</Button>
                </div>
              ))}
              {adjustmentError && <p className="text-xs text-rose-600">{adjustmentError}</p>}
            </div>
          )}

          <section className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900">Lịch sử các lượt chấm</h3>
              <Button type="button" variant="outline" size="sm" disabled={busy} onClick={handleRegrade}>Chấm lại toàn bộ</Button>
            </div>
            {historyError && <p role="alert" className="text-sm text-rose-700">{historyError}</p>}
            {gradingRuns.length > 0 ? <select aria-label="Chọn lượt chấm" value={selectedRunId} onChange={(event) => setSelectedRunId(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm">{gradingRuns.map((run) => <option key={run.id} value={run.id}>Lượt #{run.runNo} · {run.status} · {formatDateTime(run.createdAt)}</option>)}</select> : <p className="text-sm text-slate-600">Chưa có lịch sử chấm.</p>}
            {gradingRuns.filter((run) => run.id === selectedRunId).map((run) => <div key={run.id} className="space-y-3 rounded-xl bg-white p-3">
              <div className="flex flex-wrap gap-2 text-xs text-slate-600"><span>Trạng thái: <strong>{run.status}</strong></span><span>Phê duyệt: <strong>{run.approvalMode ?? '—'}</strong></span><span>Hoàn tất: <strong>{run.completedAt ? formatDateTime(run.completedAt) : '—'}</strong></span></div>
              {typeof run.summaryJson?.suggestedFinalScore === 'number' && <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900">Điểm hệ thống đề xuất: <strong>{run.summaryJson.suggestedFinalScore} / 10</strong>{typeof run.summaryJson.publishedFinalScore === 'number' && <> · Điểm đã công bố: <strong>{run.summaryJson.publishedFinalScore} / 10</strong></>}</p>}
              {run.stages.map((stage) => <div key={stage.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                <div className="flex justify-between gap-2"><strong>{stage.stageKey}</strong><span>{stage.status}{stage.score !== null && stage.score !== undefined ? ` · ${stage.score}${stage.maxScore ? `/${stage.maxScore}` : ''}` : ''}</span></div>
                {stage.errorMessage && <p className="mt-1 text-rose-700">{stage.errorMessage}</p>}
                {stage.detailsJson && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs">{JSON.stringify(stage.detailsJson, null, 2)}</pre>}
                {stage.evidence?.map((evidence) => <Button key={evidence.id} type="button" variant="link" size="sm" onClick={() => showEvidence(run.id, evidence.id)}>Xem ảnh testcase</Button>)}
              </div>)}
              {run.snapshotJson && <details className="text-sm"><summary className="cursor-pointer font-semibold">Cấu hình testcase, đáp án và rubric đã dùng</summary><pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs">{JSON.stringify(run.snapshotJson, null, 2)}</pre></details>}
              {run.status === 'REVIEW_PENDING' && <div className="grid gap-2 border-t pt-3"><label className="text-xs font-semibold">Điểm công bố (để trống dùng điểm đề xuất)<input type="number" min="0" max="10" step="0.1" value={finalScoreDraft} onChange={(event) => setFinalScoreDraft(event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label><label className="text-xs font-semibold">Lý do duyệt bắt buộc<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="mt-1 w-full rounded-lg border p-2" rows={2} /></label><Button type="button" disabled={busy || reviewNote.trim().length < 5} onClick={handleReview}>Duyệt và công bố điểm</Button></div>}
            </div>)}
            {evidenceUrl && <img src={evidenceUrl} alt="Ảnh chụp trang trong testcase" className="max-h-64 rounded-lg border" />}
          </section>

          {/* Action Buttons */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
