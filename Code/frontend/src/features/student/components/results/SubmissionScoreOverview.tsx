'use client';

import { useState } from 'react';
import {
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileCode,
  Terminal,
  XCircle,
} from 'lucide-react';
import type { StudentSubmissionDetail } from '../../types/student.types';

interface SubmissionScoreOverviewProps {
  submission: StudentSubmissionDetail;
}

const RANK_BADGE_STYLES: Record<string, string> = {
  emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border border-blue-200 bg-blue-50 text-blue-700',
  amber: 'border border-amber-200 bg-amber-50 text-amber-700',
  rose: 'border border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border border-slate-200 bg-slate-100 text-slate-600',
};

function getRank(score: number | null): { label: string; tone: string } {
  if (score === null) return { label: 'Chưa xếp hạng', tone: 'slate' };
  if (score >= 8.5) return { label: 'Xuất sắc', tone: 'emerald' };
  if (score >= 7.0) return { label: 'Giỏi', tone: 'blue' };
  if (score >= 5.0) return { label: 'Đạt', tone: 'amber' };
  return { label: 'Chưa đạt', tone: 'rose' };
}

function parseScores(submission: StudentSubmissionDetail) {
  const finalScore = submission.finalScore != null ? Number(submission.finalScore) : null;
  const sandboxScore = submission.sandboxScore != null ? Number(submission.sandboxScore) : null;
  const aiScore = submission.aiScore != null ? Number(submission.aiScore) : null;
  const rank = getRank(finalScore);
  const rankClass = RANK_BADGE_STYLES[rank.tone] || RANK_BADGE_STYLES.slate;
  const activeScore = sandboxScore ?? finalScore;
  const displaySandbox = activeScore != null ? activeScore.toFixed(1) : '--';

  return { finalScore, aiScore, rank, rankClass, displaySandbox };
}

const CompileStatusIndicator: React.FC<{ status: boolean | null }> = ({ status }) => {
  if (status === true) {
    return (
      <div className="flex items-center gap-1.5 text-base font-bold text-emerald-700">
        <CheckCircle2 className="size-5" />
        <span>Thành công</span>
      </div>
    );
  }
  if (status === false) {
    return (
      <div className="flex items-center gap-1.5 text-base font-bold text-rose-700">
        <XCircle className="size-5" />
        <span>Lỗi biên dịch</span>
      </div>
    );
  }
  return <p className="text-sm font-semibold text-slate-500">Đang chờ biên dịch</p>;
};

function ScoreCard({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-colors duration-200 hover:-translate-y-0.5 hover:shadow-elevated"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-2xs">{icon}</span></div>{children}</article>;
}

function FinalScoreCard({ submission }: SubmissionScoreOverviewProps) {
  const { finalScore, rank, rankClass } = parseScores(submission);
  return <article className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-white via-blue-50/20 to-blue-50/50 p-5 shadow-elevated-sm transition-colors duration-200 hover:-translate-y-0.5 hover:shadow-elevated"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Điểm tổng kết PE</p><span className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-2xs"><Award className="size-5" /></span></div><div className="mt-3 flex items-baseline gap-2"><p className="text-3xl font-extrabold tabular-nums text-slate-900">{finalScore?.toFixed(1) ?? '--'}</p><span className="text-xs text-slate-400">điểm</span></div><div className="mt-2.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${rankClass}`}>{rank.label}</span></div></article>;
}

function SandboxScoreCard({ submission }: SubmissionScoreOverviewProps) {
  const { displaySandbox } = parseScores(submission);
  return <ScoreCard label="Điểm chức năng (Sandbox)" icon={<Cpu className="size-5" />}><div className="mt-3 flex items-baseline gap-2"><p className="text-3xl font-extrabold tabular-nums text-slate-900">{displaySandbox}</p><span className="text-xs text-slate-400">/ {submission.assignment?.functionalMaxScore ?? 10} điểm</span></div><p className="mt-2.5 text-xs text-slate-500">Chấm tự động theo điểm từng Test Case</p></ScoreCard>;
}

function AiScoreCard({ submission }: SubmissionScoreOverviewProps) {
  const { aiScore } = parseScores(submission);
  const isPenaltyMode = Number(submission.assignment?.functionalMaxScore) === 10;
  const v2 = submission.assignment?.gradingVersion === 2;

  if (isPenaltyMode) {
    const isPenalized = aiScore !== null && aiScore < 0;
    return (
      <ScoreCard label="AI Giám sát & Trừ phạt" icon={<Bot className="size-5" />}>
        <div className="mt-3 flex items-baseline gap-2">
          <p className={`text-3xl font-extrabold tabular-nums ${isPenalized ? 'text-rose-600' : 'text-emerald-700'}`}>
            {aiScore !== null ? (isPenalized ? `${aiScore.toFixed(1)}đ` : '0.0đ') : 'Đang duyệt'}
          </p>
          <span className="text-xs text-slate-400">{isPenalized ? 'điểm phạt' : 'chuẩn mực'}</span>
        </div>
        <p className="mt-2.5 text-xs text-slate-500">
          {isPenalized ? 'Phát hiện vi phạm hardcode hoặc clean code' : 'Không có gian lận/hardcode, mã nguồn chuẩn'}
        </p>
      </ScoreCard>
    );
  }

  return <ScoreCard label={v2 ? 'Thuật toán + Clean Code' : 'AI Code Review'} icon={<Bot className="size-5" />}><div className="mt-3 flex items-baseline gap-2"><p className="text-3xl font-extrabold tabular-nums text-indigo-700">{aiScore?.toFixed(1) ?? 'Sẵn sàng'}</p>{aiScore !== null && <span className="text-xs text-slate-400">/ {v2 ? 3 : 2}</span>}</div><p className="mt-2.5 text-xs text-slate-500">{v2 ? `Thuật toán ${submission.algorithmScore ?? '--'}/2 • Clean Code ${submission.cleanCodeScore ?? '--'}/1` : 'Phân tích Big-O & góp ý (tham khảo)'}</p></ScoreCard>;
}

function CompilationScoreCard({ submission, showLogs, onToggleLogs }: SubmissionScoreOverviewProps & { showLogs: boolean; onToggleLogs: () => void }) {
  return <ScoreCard label="Trạng thái biên dịch" icon={<Terminal className="size-5" />}><div className="mt-3"><CompileStatusIndicator status={submission.compileSuccess ?? null} /></div>{submission.compileOutput && <button type="button" onClick={onToggleLogs} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"><span>{showLogs ? 'Ẩn log biên dịch' : 'Xem log biên dịch'}</span>{showLogs ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}</button>}</ScoreCard>;
}

function CompilerOutput({ output }: { output: string }) {
  return <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs font-mono text-slate-100"><div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs text-slate-400"><span className="flex items-center gap-2"><FileCode className="size-4 text-blue-400" />Compiler Output &amp; Build Logs</span><span className="text-slate-500">Docker gcc / javac</span></div><pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">{output}</pre></div>;
}

export function SubmissionScoreOverview({ submission }: SubmissionScoreOverviewProps) {
  const [showLogs, setShowLogs] = useState(false);
  return <section className="space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><FinalScoreCard submission={submission} /><SandboxScoreCard submission={submission} /><AiScoreCard submission={submission} /><CompilationScoreCard submission={submission} showLogs={showLogs} onToggleLogs={() => setShowLogs((visible) => !visible)} /></div>{showLogs && submission.compileOutput && <CompilerOutput output={submission.compileOutput} />}</section>;
}
