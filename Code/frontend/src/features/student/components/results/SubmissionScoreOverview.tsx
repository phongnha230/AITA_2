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

export function SubmissionScoreOverview({ submission }: SubmissionScoreOverviewProps) {
  const [showLogs, setShowLogs] = useState(submission.compileSuccess === false);

  const finalScore = submission.finalScore !== null && submission.finalScore !== undefined
    ? Number(submission.finalScore)
    : null;
  const sandboxScore = submission.sandboxScore !== null && submission.sandboxScore !== undefined
    ? Number(submission.sandboxScore)
    : null;
  const aiScore = submission.aiScore !== null && submission.aiScore !== undefined
    ? Number(submission.aiScore)
    : null;

  return (
    <section className="space-y-4">
      {/* 4 Score Cards Grid - Aligned with Final Score Dominance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Final Score - Dominant Visual Focal Point */}
        <article className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-blue-600/80 bg-white p-5 shadow-elevated ring-4 ring-blue-600/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="absolute right-0 top-0 h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="flex items-start justify-between gap-3 pt-1">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Trọng số tổng hợp
              </span>
              <h3 className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Điểm tổng kết PE
              </h3>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
              <Award className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-slate-900">
              {finalScore !== null ? finalScore.toFixed(1) : '--'}
            </span>
            <span className="text-sm font-semibold text-slate-400">điểm</span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 font-medium">
            Điểm Sandbox kết hợp Đánh giá Rubric AI
          </div>
        </article>

        {/* 2. Sandbox Score */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-elevated">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Chấm tự động
              </span>
              <h3 className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                Điểm Sandbox Test
              </h3>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80 shadow-2xs">
              <Cpu className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {sandboxScore !== null ? sandboxScore.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400">điểm</span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            Chạy qua bộ testcases độc lập
          </div>
        </article>

        {/* 3. AI Score */}
        <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-elevated">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Đánh giá Socratic
              </span>
              <h3 className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                Điểm AI Rubric
              </h3>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100/80 shadow-2xs">
              <Bot className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {aiScore !== null ? aiScore.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400">điểm</span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
            Phân tích Clean Code &amp; Tiêu chí Rubric
          </div>
        </article>

        {/* 4. Compilation Status */}
        <article className={`flex flex-col justify-between rounded-2xl border p-5 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 ${
          submission.compileSuccess === false
            ? 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
            : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-elevated'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Môi trường thực thi
              </span>
              <h3 className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                Biên dịch mã nguồn
              </h3>
            </div>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
              submission.compileSuccess === true
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                : submission.compileSuccess === false
                  ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              <Terminal className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="mt-4">
            {submission.compileSuccess === true && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Biên dịch thành công</span>
              </div>
            )}
            {submission.compileSuccess === false && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                <XCircle className="h-4 w-4" />
                <span>Lỗi biên dịch (Compile Error)</span>
              </div>
            )}
            {submission.compileSuccess === null && (
              <p className="text-xs font-semibold text-slate-500">Đang chờ biên dịch</p>
            )}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2">
            {submission.compileOutput ? (
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
                  submission.compileSuccess === false
                    ? 'text-rose-700 hover:text-rose-800'
                    : 'text-blue-700 hover:text-blue-800'
                }`}
              >
                <span>{showLogs ? 'Ẩn log biên dịch' : 'Xem log biên dịch'}</span>
                {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">Không có cảnh báo biên dịch</span>
            )}
          </div>
        </article>
      </div>

      {/* Expandable Compiler Output Drawer */}
      {showLogs && submission.compileOutput && (
        <div className={`overflow-hidden rounded-2xl border p-5 text-xs font-mono shadow-xl transition-all ${
          submission.compileSuccess === false
            ? 'border-rose-900/60 bg-slate-950 text-rose-100'
            : 'border-slate-800 bg-slate-900 text-slate-100'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-2">
              <FileCode className={`h-4 w-4 ${submission.compileSuccess === false ? 'text-rose-400' : 'text-blue-400'}`} />
              <span className="font-sans font-bold">Chi tiết log biên dịch &amp; Build errors</span>
            </span>
            <span className="font-sans text-slate-500">Tiêu chuẩn thực thi Sandbox</span>
          </div>
          <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-200">
            {submission.compileOutput}
          </pre>
        </div>
      )}
    </section>
  );
}
