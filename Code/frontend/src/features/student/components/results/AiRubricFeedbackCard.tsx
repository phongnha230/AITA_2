'use client';

import {
  Activity,
  Bot,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { SubmissionAiGradingResult } from '../../types/student.types';

interface AiRubricFeedbackCardProps {
  aiGradingResult: SubmissionAiGradingResult | null | undefined;
}

interface RubricItem {
  title?: string;
  criterionName?: string;
  criterion?: string;
  name?: string;
  points?: number | string;
  earnedPoints?: number | string;
  score?: number | string;
  maxPoints?: number | string;
  weight?: number | string;
  feedback?: string;
  comment?: string;
}

function parseRubricBreakdown(json: unknown): RubricItem[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as RubricItem[];
  if (typeof json === 'object') {
    return Object.entries(json).map(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        return { criterionName: key, ...(val as object) };
      }
      return { criterionName: key, score: String(val) };
    });
  }
  return [];
}

export function AiRubricFeedbackCard({ aiGradingResult }: AiRubricFeedbackCardProps) {
  if (!aiGradingResult) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 shadow-2xs">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Đánh giá AI Rubric &amp; Code Review</h3>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Chưa có dữ liệu đánh giá AI cho bài nộp này.
        </p>
      </section>
    );
  }

  const rubricItems = parseRubricBreakdown(aiGradingResult.rubricBreakdownJson);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated sm:p-7">
      {/* 1. Header with AI Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 shadow-2xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              Đánh giá AI Rubric &amp; Nhận xét mã nguồn
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Chi tiết đánh giá theo tiêu chí rubric từ mô hình hỗ trợ khảo thí Socratic AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs">
            <Bot className="h-4 w-4" />
            <span>Điểm AI: {Number(aiGradingResult.overallAiScore).toFixed(1)} điểm</span>
          </span>
        </div>
      </div>

      {/* 2. Complexity Badges */}
      {(aiGradingResult.detectedTimeComplexity || aiGradingResult.detectedSpaceComplexity) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {aiGradingResult.detectedTimeComplexity && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs shadow-2xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <Cpu className="h-4 w-4 text-blue-600" />
                Độ phức tạp thời gian (Time):
              </span>
              <span className="rounded-md border border-blue-200 bg-white px-2.5 py-0.5 font-mono font-bold text-blue-900 shadow-2xs">
                {aiGradingResult.detectedTimeComplexity}
              </span>
            </div>
          )}

          {aiGradingResult.detectedSpaceComplexity && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs shadow-2xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <Activity className="h-4 w-4 text-emerald-600" />
                Độ phức tạp không gian (Space):
              </span>
              <span className="rounded-md border border-emerald-200 bg-white px-2.5 py-0.5 font-mono font-bold text-emerald-900 shadow-2xs">
                {aiGradingResult.detectedSpaceComplexity}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Overall Code Quality Feedback Paragraph */}
      {aiGradingResult.codeQualityFeedback && (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs">
          <p className="font-bold text-indigo-950">Nhận xét tổng quan chất lượng mã nguồn &amp; Tư duy thuật toán:</p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-700">
            {aiGradingResult.codeQualityFeedback}
          </p>
        </div>
      )}

      {/* 4. Rubric Breakdown as Assessment Rows */}
      {rubricItems.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chi tiết các tiêu chí Rubric đánh giá
            </h4>
            <span className="text-[11px] text-slate-400">
              {rubricItems.length} tiêu chí
            </span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
            {rubricItems.map((item, idx) => {
              const name = item.title || item.criterionName || item.criterion || item.name || `Tiêu chí ${idx + 1}`;
              const rawScore = item.earnedPoints ?? item.score ?? item.points;
              const score = rawScore !== undefined && rawScore !== null ? Number(rawScore).toFixed(1) : '--';
              const max = item.maxPoints ? ` / ${Number(item.maxPoints).toFixed(1)}` : '';
              const comment = item.feedback || item.comment;

              return (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-4 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-900 sm:text-sm">
                        {name}
                      </p>
                    </div>
                    {comment && (
                      <p className="mt-1.5 pl-7 text-xs leading-relaxed text-slate-600">
                        {comment}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pl-7 sm:pl-0 sm:text-right">
                    <span className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-800 tabular-nums shadow-2xs">
                      {score}{max} điểm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
