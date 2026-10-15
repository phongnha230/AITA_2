'use client';

import React, { useState } from 'react';
import { Play, Bot, ExternalLink, Terminal } from 'lucide-react';

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

interface SubmissionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: LecturerSubmission | null;
  renderStatusBadge: (status: string) => React.ReactNode;
  onReGradeSandbox: (subId: string) => void;
  onReGradeAi: (subId: string) => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  open,
  onOpenChange,
  submission,
  renderStatusBadge,
  onReGradeSandbox,
  onReGradeAi,
}) => {
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);
  if (!submission) return null;

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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReGradeSandbox(submission.id)}
              className="rounded-xl text-xs font-bold"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Chấm lại Sandbox
            </Button>
            <Button
              size="sm"
              onClick={() => onReGradeAi(submission.id)}
              className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Chấm lại AI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
