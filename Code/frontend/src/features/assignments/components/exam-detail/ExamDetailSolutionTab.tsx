'use client';

import React from 'react';
import { Sparkles, Code2, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Assignment } from '../../types/assignment.types';

interface ExamDetailSolutionTabProps {
  solutions: NonNullable<Assignment['solutions']>;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const ExamDetailSolutionTab: React.FC<ExamDetailSolutionTabProps> = ({
  solutions,
  copiedKey,
  onCopy,
}) => {
  if (solutions.length === 0) {
    return (
      <Card className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs shadow-2xs bg-white">
        Đề thi này chưa có bài giải mẫu lưu trữ. Bạn có thể bấm vào nút &quot;Chỉnh sửa trong Wizard&quot; để bổ sung bài giải.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {solutions.map((sol, idx) => (
        <Card
          key={sol.id || sol.title || sol.sourceCode}
          className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                #{idx + 1}
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {sol.title || 'Bài Giải Mẫu Chuẩn Của Giảng Viên'}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Tri thức chuẩn phục vụ chấm tự động & đối chiếu RAG
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopy(sol.sourceCode, `solution-${idx}`)}
              className="h-8 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            >
              {copiedKey === `solution-${idx}` ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span className="text-emerald-600">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Sao chép mã nguồn</span>
                </>
              )}
            </Button>
          </div>

          {sol.explanation && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Giải Thích Thuật Toán & Chuẩn Độ Phức Tạp (RAG Ground-Truth):</span>
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{sol.explanation}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mã nguồn chuẩn của Giảng viên:</span>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
              {sol.sourceCode}
            </pre>
          </div>
        </Card>
      ))}
    </div>
  );
};
