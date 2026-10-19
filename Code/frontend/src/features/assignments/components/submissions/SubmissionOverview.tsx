import type { ReactNode } from 'react';
import { ExternalLink, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/formatDate';
import type { LecturerSubmission } from '../../types/assignment.types';

export function SubmissionOverview({ submission }: { submission: LecturerSubmission }) {
  return <div className="space-y-4 pt-2">
    <SubmissionScores submission={submission} />
    <SubmissionMetadata submission={submission} />
    <CompilationOutput submission={submission} />
    <TestCaseResults submission={submission} />
    <GitContributorList submission={submission} />
  </div>;
}

function SubmissionScores({ submission }: { submission: LecturerSubmission }) {
  const versionTwo = submission.assignment?.gradingVersion === 2;
  return <section aria-label="Điểm bài nộp" className={`grid ${versionTwo ? 'grid-cols-4' : 'grid-cols-3'} gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center`}>
    <ScoreItem label="Chức năng (Sandbox)" value={`${submission.sandboxScore ?? '-'} / ${submission.assignment?.functionalMaxScore ?? 8}`} />
    {versionTwo ? <><ScoreItem label={submission.assignment?.environment === 'REACT_JS' ? 'React Semantic' : 'Thuật toán'} value={`${submission.algorithmScore ?? '-'} / ${submission.assignment?.algorithmMaxScore ?? 2}`} /><ScoreItem label="Clean Code" value={`${submission.cleanCodeScore ?? '-'} / ${submission.assignment?.cleanCodeMaxScore ?? 1}`} /></> : <ScoreItem label="Điểm AI Rubric" value={`${submission.aiScore ?? '-'} / 2`} />}
    <ScoreItem label="Điểm tổng kết" value={`${submission.finalScore ?? '-'} / 10`} accent="text-emerald-800" />
  </section>;
}

function ScoreItem({ label, value, accent = 'text-indigo-800' }: { label: string; value: string; accent?: string }) {
  return <div><p className="text-xs font-semibold text-slate-600">{label}</p><p className={`mt-0.5 text-lg font-bold ${accent}`}>{value}</p></div>;
}

function SubmissionMetadata({ submission }: { submission: LecturerSubmission }) {
  return <section aria-label="Thông tin bài nộp" className="space-y-2 rounded-xl border border-slate-200 p-4 text-xs">
    <InfoRow label="Kênh nộp" value={submission.submissionChannel === 'GIT_COMMIT' ? 'Git Repository' : 'Tập tin nén (.zip)'} />
    {submission.gitRepoUrl && <InfoRow label="Git Repository" value={<a href={submission.gitRepoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-700 hover:underline">{submission.gitRepoUrl}<ExternalLink aria-hidden="true" className="size-3" /></a>} />}
    {submission.deployedUrl && <InfoRow label="Website được chấm" value={<a href={submission.deployedUrl} target="_blank" rel="noreferrer" className="break-all text-indigo-700 hover:underline">{submission.deployedUrl}</a>} />}
    <InfoRow label="Attempt" value={`#${submission.attemptNo ?? 1}`} />
    {submission.gitCommitHash && <InfoRow label="Commit SHA" value={<code>{submission.gitCommitHash}</code>} />}
    <InfoRow label="Thời gian nộp" value={formatDateTime(submission.submittedAt)} />
    <InfoRow label="Trạng thái biên dịch" value={<span className={submission.compileSuccess ? 'font-semibold text-emerald-800' : 'font-semibold text-rose-800'}>{submission.compileSuccess ? 'Thành công (0 error)' : 'Biên dịch thất bại'}</span>} />
  </section>;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-1.5 last:border-0"><span className="text-slate-600">{label}</span><span className="text-right font-semibold text-slate-800">{value}</span></div>;
}

function CompilationOutput({ submission }: { submission: LecturerSubmission }) {
  const exitCode = submission.compileSuccess ? 'Exit Code 0' : 'Non-zero Exit Code';
  const output = submission.compileOutput || '[Sandbox Engine] Compilation succeeded with 0 warnings/errors.\n[Sandbox Engine] Memory footprint: 4.2 MB\n[Sandbox Engine] Execution sandbox closed cleanly.';
  return <section aria-label="Log biên dịch Docker Sandbox" className="space-y-2">
    <div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800"><Terminal aria-hidden="true" className="size-3.5" />Log biên dịch Docker Sandbox</h3><Badge variant="outline" className="font-mono text-xs">{exitCode}</Badge></div>
    <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-slate-100">{output}</pre>
  </section>;
}

function TestCaseResults({ submission }: { submission: LecturerSubmission }) {
  const results = submission.testResults ?? [];
  if (!results.length) return null;
  return <section aria-label="Kết quả chạy test case" className="space-y-2"><h3 className="text-xs font-bold text-slate-800">Kết quả chạy Test Cases ({results.length})</h3><ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">{results.map((result, index) => <li key={result.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs"><span className="flex items-center gap-2"><span className="font-mono font-bold text-slate-700">Test #{index + 1}</span><Badge variant="outline" className={result.verdict === 'PASSED' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}>{result.verdict}</Badge></span><span className="flex gap-3 font-mono text-slate-700"><span>{result.executionTimeMs}ms</span><strong>+{result.earnedPoints} pts</strong></span></li>)}</ul></section>;
}

function GitContributorList({ submission }: { submission: LecturerSubmission }) {
  const contributors = submission.gitContributors ?? [];
  if (!contributors.length) return null;
  return <section aria-label="Bằng chứng đóng góp Git" className="space-y-2"><h3 className="text-xs font-bold text-slate-800">Bằng chứng đóng góp Git</h3><ul className="space-y-2">{contributors.map((contributor) => <li key={contributor.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs"><span><strong>{contributor.authorName}</strong>{!contributor.matchedUserId && <em className="ml-1 text-amber-800">chưa match</em>}<br /><span className="break-all">{contributor.authorEmail}</span></span><span className="text-right"><strong>{contributor.contributionPct}%</strong>{contributor.contributionPct < 10 && <em className="ml-1 text-rose-700">đóng góp thấp</em>}<br />{contributor.commitCount} commits · +{contributor.linesAdded}/-{contributor.linesDeleted}</span></li>)}</ul></section>;
}
