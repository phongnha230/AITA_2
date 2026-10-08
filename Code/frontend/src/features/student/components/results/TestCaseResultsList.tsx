'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  FileCheck2,
  HardDrive,
  XCircle,
} from 'lucide-react';
import type { SubmissionTestResult } from '../../types/student.types';

interface TestCaseResultsListProps {
  testResults: SubmissionTestResult[];
}

function getVerdictInfo(verdict: string): { label: string; tone: string; icon: typeof CheckCircle2 } {
  const norm = (verdict || '').toUpperCase();
  switch (norm) {
    case 'PASSED':
      return { label: 'Đạt (Passed)', tone: 'emerald', icon: CheckCircle2 };
    case 'FAILED':
      return { label: 'Sai kết quả (Failed)', tone: 'rose', icon: XCircle };
    case 'TIME_LIMIT_EXCEEDED':
      return { label: 'Quá thời gian (TLE)', tone: 'amber', icon: Clock };
    case 'MEMORY_LIMIT_EXCEEDED':
      return { label: 'Quá bộ nhớ (MLE)', tone: 'amber', icon: HardDrive };
    case 'RUNTIME_ERROR':
      return { label: 'Lỗi thực thi (RTE)', tone: 'rose', icon: AlertCircle };
    default:
      return { label: norm || 'Chưa xác định', tone: 'slate', icon: AlertCircle };
  }
}

export function TestCaseResultsList({ testResults }: TestCaseResultsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!testResults || testResults.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
        <h3 className="text-base font-bold text-slate-900">Chi tiết Testcases tự động</h3>
        <p className="mt-1 text-xs text-slate-500">Chưa có kết quả testcase nào được ghi nhận cho bài nộp này.</p>
      </section>
    );
  }

  const passedCount = testResults.filter((t) => t.verdict?.toUpperCase() === 'PASSED').length;
  const passRate = ((passedCount / testResults.length) * 100).toFixed(1);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">Chi tiết Testcases tự động</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Thực thi trên môi trường Docker Sandbox cô lập chuẩn thời gian &amp; bộ nhớ.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đạt: {passedCount} / {testResults.length} ({passRate}%)
          </span>
        </div>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {testResults.map((tc, index) => {
          const vInfo = getVerdictInfo(tc.verdict);
          const Icon = vInfo.icon;
          const isExpanded = expandedId === tc.id;
          const hasDetails = tc.diffLog || tc.actualStdout || tc.actualFileOutput;

          return (
            <div key={tc.id || `tc-${tc.testCaseId ?? index}`} className="py-3.5 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-2xs ${
                      vInfo.tone === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : vInfo.tone === 'rose'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        Testcase {index + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          vInfo.tone === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : vInfo.tone === 'rose'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {vInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {tc.executionTimeMs} ms
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-slate-400" />
                    {(tc.memoryUsedKb / 1024).toFixed(1)} MB
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    +{tc.earnedPoints} điểm
                  </span>

                  {hasDetails && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>{isExpanded ? 'Ẩn chi tiết' : 'Chi tiết'}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Output and Diff */}
              {isExpanded && hasDetails && (
                <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs font-mono shadow-inner">
                  {tc.actualStdout && (
                    <div>
                      <p className="font-sans font-semibold text-slate-600">Output thực tế (stdout):</p>
                      <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-2.5 text-slate-800 ring-1 ring-slate-200 shadow-2xs">
                        {tc.actualStdout}
                      </pre>
                    </div>
                  )}
                  {tc.diffLog && (
                    <div>
                      <p className="font-sans font-semibold text-slate-600">Diff Log so với chuẩn:</p>
                      <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-2.5 text-rose-300 shadow-inner">
                        {tc.diffLog}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
