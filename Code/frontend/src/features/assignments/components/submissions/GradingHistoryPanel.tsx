import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { formatDateTime } from '@/lib/formatDate';
import type { GradingRun } from '@/features/grading/types/grading-history.types';

interface GradingHistoryPanelProps {
  runs: GradingRun[];
  selectedRunId: string;
  error: string | null;
  busy: boolean;
  reviewNote: string;
  finalScoreDraft: string;
  evidenceUrl: string | null;
  onSelectRun: (id: string) => void;
  onRegrade: () => void;
  onReviewNoteChange: (note: string) => void;
  onFinalScoreChange: (score: string) => void;
  onReview: () => void;
  onShowEvidence: (runId: string, evidenceId: string) => void;
}

export function GradingHistoryPanel({ runs, selectedRunId, error, busy, reviewNote, finalScoreDraft, evidenceUrl, onSelectRun, onRegrade, onReviewNoteChange, onFinalScoreChange, onReview, onShowEvidence }: GradingHistoryPanelProps) {
  const selectedRuns = runs.filter((run) => run.id === selectedRunId);
  return <section aria-label="Lịch sử các lượt chấm" className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-slate-900">Lịch sử các lượt chấm</h3><Button type="button" variant="outline" size="sm" disabled={busy} onClick={onRegrade}>Chấm lại toàn bộ</Button></div>
    {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
    {runs.length ? <label className="sr-only" htmlFor="grading-run-select">Chọn lượt chấm</label> : null}
    {runs.length ? <select id="grading-run-select" value={selectedRunId} onChange={(event) => onSelectRun(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 text-base text-slate-900">{runs.map((run) => <option key={run.id} value={run.id}>Lượt #{run.runNo} · {run.status} · {formatDateTime(run.createdAt)}</option>)}</select> : <p className="text-sm text-slate-700">Chưa có lịch sử chấm.</p>}
    {selectedRuns.map((run) => <article key={run.id} className="space-y-3 rounded-lg bg-white p-3">
      <div className="flex flex-wrap gap-2 text-xs text-slate-700"><span>Trạng thái: <strong>{run.status}</strong></span><span>Phê duyệt: <strong>{run.approvalMode ?? '—'}</strong></span><span>Hoàn tất: <strong>{run.completedAt ? formatDateTime(run.completedAt) : '—'}</strong></span></div>
      {typeof run.summaryJson?.suggestedFinalScore === 'number' && <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-950">Điểm hệ thống đề xuất: <strong>{run.summaryJson.suggestedFinalScore} / 10</strong>{typeof run.summaryJson.publishedFinalScore === 'number' && <> · Điểm đã công bố: <strong>{run.summaryJson.publishedFinalScore} / 10</strong></>}</p>}
      <ul className="space-y-2">{run.stages.map((stage) => <li key={stage.id} className="p-3 text-sm"><div className="flex justify-between gap-2"><strong>{stage.stageKey}</strong><span>{stage.status}{stage.score !== null && stage.score !== undefined ? ` · ${stage.score}${stage.maxScore ? `/${stage.maxScore}` : ''}` : ''}</span></div>{stage.errorMessage && <p className="mt-1 text-rose-800">{stage.errorMessage}</p>}{stage.detailsJson && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs text-slate-900">{JSON.stringify(stage.detailsJson, null, 2)}</pre>}{stage.evidence?.map((evidence) => <Button key={evidence.id} type="button" variant="link" size="sm" onClick={() => onShowEvidence(run.id, evidence.id)}>Xem ảnh testcase</Button>)}</li>)}</ul>
      {run.snapshotJson && <details className="text-sm"><summary className="cursor-pointer font-semibold text-slate-900">Cấu hình testcase, đáp án và rubric đã dùng</summary><pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs text-slate-900">{JSON.stringify(run.snapshotJson, null, 2)}</pre></details>}
      {run.status === 'REVIEW_PENDING' && <div className="grid gap-2 border-t border-slate-200 pt-3"><label className="text-xs font-semibold text-slate-900">Điểm công bố (để trống dùng điểm đề xuất)<input aria-label="Điểm công bố" type="number" min="0" max="10" step="0.1" value={finalScoreDraft} onChange={(event) => onFinalScoreChange(event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 p-2" /></label><label className="text-xs font-semibold text-slate-900">Lý do duyệt bắt buộc<textarea value={reviewNote} onChange={(event) => onReviewNoteChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={2} /></label><Button type="button" disabled={busy || reviewNote.trim().length < 5} onClick={onReview}>Duyệt và công bố điểm</Button></div>}
    </article>)}
    {evidenceUrl && <Image src={evidenceUrl} alt="Ảnh chụp trang trong testcase" width={640} height={360} unoptimized className="max-h-64 w-auto rounded-lg border border-slate-300" />}
  </section>;
}
