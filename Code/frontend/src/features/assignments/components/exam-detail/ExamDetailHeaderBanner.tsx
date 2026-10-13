'use client';

import React from 'react';
import { Clock, Layers, Terminal, FileCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Assignment } from '../../types/assignment.types';

interface ExamDetailHeaderBannerProps {
  assignment: Assignment;
}

export const ExamDetailHeaderBanner: React.FC<ExamDetailHeaderBannerProps> = ({ assignment }) => {
  const isJava = assignment.environment === 'JAVA_JDK';
  const isPublished = assignment.status === 'PUBLISHED';
  const testCases = assignment.testCases || [];
  const totalPoints = testCases.reduce((sum, tc) => sum + (tc.points || 0), 0);

  return (
    <Card className="rounded-3xl border-slate-200 shadow-2xs p-6 md:p-8 bg-white space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Badge variant="outline" className="text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border-indigo-200">
          {assignment.course?.code || 'PE EXAM'}
        </Badge>
        <Badge variant="secondary" className="text-xs font-bold">
          {isJava ? 'Java JDK 21' : 'C GCC 11'}
        </Badge>
        <Badge
          variant={isPublished ? 'default' : 'secondary'}
          className={
            isPublished
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs'
              : 'bg-slate-100 text-slate-700 font-bold text-xs'
          }
        >
          {isPublished ? '● ĐÃ XUẤT BẢN' : 'BẢN NHÁP'}
        </Badge>
        {assignment.course && (
          <span className="text-xs text-slate-500 font-medium">
            {assignment.course.name} • {assignment.course.semester}
          </span>
        )}
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {assignment.title}
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {assignment.description || 'Đề thi thực hành kết thúc học phần, kiểm tra tư duy thuật toán và kỹ năng lập trình sinh viên.'}
        </p>
      </div>

      {/* Quick Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400">Thời lượng làm bài</div>
          <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>120 phút</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400">Quy mô Testcase</div>
          <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>{testCases.length} Testcases • {totalPoints.toFixed(1)} pts</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400">Môi trường Chấm</div>
          <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-600" />
            <span>Docker Sandbox {isJava ? 'Java' : 'C'}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400">Hình thức nộp bài</div>
          <div className="text-sm font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-amber-600" />
            <span>Cá nhân (ZIP / Source)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
