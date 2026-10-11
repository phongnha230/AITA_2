'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Code2, ExternalLink, FileText, Sparkles, XCircle } from 'lucide-react';
import { studentService } from '../../services/student.service';
import type { RecentSubmissionItem } from '../../types/student.types';

interface RecentSubmissionsListProps {
  onSelectSubmission: (id: string) => void;
}

export function RecentSubmissionsList({ onSelectSubmission }: RecentSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<RecentSubmissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    studentService.getPortfolio()
      .then((data) => {
        if (active && data.recentSubmissions) {
          setSubmissions(data.recentSubmissions);
        }
      })
      .catch(() => {
        // Fallback gracefully
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileText size={16} className="text-indigo-600" />
          Bài nộp gần đây của bạn
        </h3>
        <span className="text-xs text-slate-400">Bấm vào để xem chi tiết chấm điểm</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {submissions.map((sub) => {
          const score = Number(sub.finalScore ?? 0);
          const isPassed = score >= 5.0;

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubmission(sub.id)}
              className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                      {sub.courseCode || 'PE'}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {sub.environment || 'Docker'}
                    </span>
                    {sub.paperCode && (
                      <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {sub.paperCode}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {sub.assignmentTitle}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-lg font-black leading-none ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {score.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Điểm tổng</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>Sandbox: <strong className="text-slate-700">{sub.sandboxScore ?? 0}đ</strong></span>
                  <span>•</span>
                  <span>AI: <strong className="text-indigo-600">{sub.aiScore ?? 0}đ</strong></span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  Xem chi tiết <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
