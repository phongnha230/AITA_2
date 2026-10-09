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
  const totalCount = testResults.length;
  const passRate = ((passedCount / totalCount) * 100).toFixed(1);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">Chi tiết Testcases tự động</h3>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
              {totalCount} ca kiểm thử
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Thực thi trên môi trường Docker Sandbox cô lập với giới hạn nghiêm ngặt về thời gian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-2xs ${
            passedCount === totalCount
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : passedCount > 0
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đạt: {passedCount} / {totalCount} ({passRate}%)
          </span>
        </div>
      </div>

      {/* Testcase Rows */}
      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/30 overflow-hidden">
        {testResults.map((tc, index) => {
          const vInfo = getVerdictInfo(tc.verdict);
          const Icon = vInfo.icon;
          const isExpanded = expandedId === (tc.id || String(index));
          const hasDetails = Boolean(tc.diffLog || tc.actualStdout || tc.actualFileOutput);
          const isPassed = tc.verdict?.toUpperCase() === 'PASSED';

          // Memory display: Show honest '--' if 0 or unmeasured, otherwise MB
          const memoryDisplay = tc.memoryUsedKb && tc.memoryUsedKb > 0
            ? `${(tc.memoryUsedKb / 1024).toFixed(1)} MB`
            : '--';

          // Execution time display
          const timeDisplay = tc.executionTimeMs !== null && tc.executionTimeMs !== undefined && tc.executionTimeMs >= 0
            ? `${tc.executionTimeMs} ms`
            : '--';

          return (
            <div
              key={tc.id || index}
              className={`p-4 transition-colors ${
                isPassed ? 'bg-white hover:bg-slate-50/60' : 'bg-rose-50/20 hover:bg-rose-50/40'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-2xs ${
                      isPassed
                        ? 'border border-slate-200 bg-slate-100 text-slate-700 font-mono'
                        : 'border border-rose-200 bg-rose-100 text-rose-800 font-mono'
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

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-mono text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {timeDisplay}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-slate-600" title={memoryDisplay === '--' ? 'Chưa đo đạc bộ nhớ cgroup riêng lẻ' : undefined}>
                    <Cpu className="h-3.5 w-3.5 text-slate-400" />
                    {memoryDisplay}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold tabular-nums text-slate-800">
                    +{Number(tc.earnedPoints).toFixed(1)} điểm
                  </span>

                  {hasDetails && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : (tc.id || String(index)))}
                      className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                        isPassed ? 'text-blue-600 hover:text-blue-700' : 'text-rose-700 hover:text-rose-800'
                      }`}
                    >
                      <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Output and Diff when Expanded */}
              {isExpanded && hasDetails && (
                <div className="mt-3.5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-mono shadow-inner">
                  {tc.actualStdout && (
                    <div>
                      <p className="font-sans font-semibold text-slate-700">Đầu ra thực tế từ chương trình (stdout):</p>
                      <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-slate-900 border border-slate-200 shadow-2xs">
                        {tc.actualStdout}
                      </pre>
                    </div>
                  )}
                  {tc.diffLog && (
                    <div>
                      <p className="font-sans font-semibold text-rose-800">Khác biệt kết quả kiểm thử (Diff Log):</p>
                      <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-rose-300 border border-rose-900/40 shadow-inner">
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
