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
              Chi tiết đánh giá theo tiêu chí rubric từ mô hình hỗ trợ khảo thí.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs">
            <Bot className="h-3.5 w-3.5" />
            Điểm AI: {Number(aiGradingResult.overallAiScore).toFixed(1)} điểm
          </span>
        </div>
      </div>

      {/* Complexity Badges - only rendered when data exists */}
      {(aiGradingResult.detectedTimeComplexity || aiGradingResult.detectedSpaceComplexity) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {aiGradingResult.detectedTimeComplexity && (
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs shadow-2xs">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Cpu className="h-4 w-4 text-blue-600" />
                Độ phức tạp thời gian:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {aiGradingResult.detectedTimeComplexity}
              </span>
            </div>
          )}

          {aiGradingResult.detectedSpaceComplexity && (
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs shadow-2xs">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <Activity className="h-4 w-4 text-emerald-600" />
                Độ phức tạp không gian:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {aiGradingResult.detectedSpaceComplexity}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Code Quality Feedback Paragraph */}
      {aiGradingResult.codeQualityFeedback && (
        <div className="mt-4 rounded-xl border border-indigo-100/90 bg-indigo-50/50 p-4.5 shadow-2xs">
          <p className="text-xs font-bold text-indigo-900">Nhận xét chất lượng mã nguồn &amp; Tư duy thuật toán:</p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
            {aiGradingResult.codeQualityFeedback}
          </p>
        </div>
      )}

      {/* Rubric Breakdown List */}
      {rubricItems.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chi tiết các tiêu chí Rubric
          </h4>
          <div className="mt-3 space-y-2.5">
            {rubricItems.map((item, idx) => {
              const name = item.criterionName || item.criterion || item.name || `Tiêu chí ${idx + 1}`;
              const score = item.earnedPoints ?? item.score ?? item.points ?? '--';
              const max = item.maxPoints ? ` / ${item.maxPoints}` : '';
              const comment = item.feedback || item.comment;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{name}</span>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 border border-indigo-100">
                      {score}{max}
                    </span>
                  </div>
                  {comment && (
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
