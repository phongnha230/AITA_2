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

function getRank(score: number | null | undefined): { label: string; tone: string } {
  if (score === null || score === undefined) return { label: 'Chưa xếp hạng', tone: 'slate' };
  if (score >= 8.5) return { label: 'Xuất sắc', tone: 'emerald' };
  if (score >= 7.0) return { label: 'Giỏi', tone: 'blue' };
  if (score >= 5.0) return { label: 'Đạt', tone: 'amber' };
  return { label: 'Chưa đạt', tone: 'rose' };
}

export function SubmissionScoreOverview({ submission }: SubmissionScoreOverviewProps) {
  const [showLogs, setShowLogs] = useState(false);

  const finalScore = submission.finalScore !== null && submission.finalScore !== undefined
    ? Number(submission.finalScore)
    : null;
  const sandboxScore = submission.sandboxScore !== null && submission.sandboxScore !== undefined
    ? Number(submission.sandboxScore)
    : null;
  const aiScore = submission.aiScore !== null && submission.aiScore !== undefined
    ? Number(submission.aiScore)
    : null;

  const rank = getRank(finalScore);

  return (
    <section className="space-y-4">
      {/* 4 Score Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Final Score */}
        <article className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-white via-blue-50/20 to-blue-50/50 p-5 shadow-elevated-sm transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Điểm tổng kết PE</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-2xs">
              <Award className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tabular-nums text-slate-900">
              {finalScore !== null ? finalScore.toFixed(1) : '--'}
            </p>
            <span className="text-xs text-slate-400">điểm</span>
          </div>
          <div className="mt-2.5">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                rank.tone === 'emerald'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                  : rank.tone === 'blue'
                    ? 'border border-blue-200 bg-blue-50 text-blue-700'
                    : rank.tone === 'amber'
                      ? 'border border-amber-200 bg-amber-50 text-amber-700'
                      : rank.tone === 'rose'
                        ? 'border border-rose-200 bg-rose-50 text-rose-700'
                        : 'border border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              {rank.label}
            </span>
          </div>
        </article>

        {/* 2. Sandbox Score */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Điểm Sandbox Test</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 shadow-2xs">
              <Cpu className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tabular-nums text-slate-900">
              {sandboxScore !== null ? sandboxScore.toFixed(1) : '--'}
            </p>
            <span className="text-xs text-slate-400">điểm</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-500">Chấm tự động qua Docker container</p>
        </article>

        {/* 3. AI Score */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Điểm AI Rubric</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 shadow-2xs">
              <Bot className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tabular-nums text-slate-900">
              {aiScore !== null ? aiScore.toFixed(1) : '--'}
            </p>
            <span className="text-xs text-slate-400">điểm</span>
          </div>
          <p className="mt-2.5 text-xs text-slate-500">Đánh giá mã nguồn &amp; Clean Code</p>
        </article>

        {/* 4. Compilation Status */}
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái biên dịch</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-2xs">
              <Terminal className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3">
            {submission.compileSuccess === true && (
              <div className="flex items-center gap-1.5 text-base font-bold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <span>Thành công</span>
              </div>
            )}
            {submission.compileSuccess === false && (
              <div className="flex items-center gap-1.5 text-base font-bold text-rose-700">
                <XCircle className="h-5 w-5" />
                <span>Lỗi biên dịch</span>
              </div>
            )}
            {submission.compileSuccess === null && (
              <p className="text-sm font-semibold text-slate-500">Đang chờ biên dịch</p>
            )}
          </div>
          {submission.compileOutput && (
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              <span>{showLogs ? 'Ẩn log biên dịch' : 'Xem log biên dịch'}</span>
              {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </article>
      </div>

      {/* Expandable Compiler Output Drawer */}
      {showLogs && submission.compileOutput && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 text-xs font-mono text-slate-100 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-blue-400" />
              Compiler Output &amp; Build Logs
            </span>
            <span className="text-slate-500">Docker gcc / javac</span>
          </div>
          <pre className="mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-300">
            {submission.compileOutput}
          </pre>
        </div>
      )}
    </section>
  );
}
