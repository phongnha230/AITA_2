'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDateTime } from '@/lib/formatDate';
import type { LecturerDashboardRecentSubmission } from '../types/course.types';

interface CoursesRecentSubmissionsProps {
  recentSubmissions: LecturerDashboardRecentSubmission[];
}

export const CoursesRecentSubmissions: React.FC<CoursesRecentSubmissionsProps> = ({
  recentSubmissions,
}) => {
  return (
    <section className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Hoạt Động Nộp Bài Gần Đây (Toàn bộ lớp học)
          </h3>
          <p className="text-xs text-slate-500">
            Dữ liệu bài làm thí sinh nộp vào Sandbox Docker thời gian thực
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
          {recentSubmissions.length} bài nộp mới nhất
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recentSubmissions.slice(0, 6).map((sub) => {
          const studentInitials =
            sub.studentName
              .trim()
              .split(' ')
              .filter(Boolean)
              .slice(-2)
              .map((w) => w[0]?.toUpperCase())
              .join('') || 'SV';

          const score = sub.finalScore;
          const scoreColor =
            score === null || score === undefined
              ? 'text-slate-400 bg-slate-100'
              : score >= 8
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : score >= 5
              ? 'text-blue-700 bg-blue-50 border-blue-200'
              : 'text-rose-700 bg-rose-50 border-rose-200';

          return (
            <Card
              key={sub.id}
              className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-indigo-200 hover:shadow-xs transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-8 rounded-lg bg-indigo-50 border border-indigo-100 shrink-0">
                    <AvatarFallback className="text-xs font-bold text-indigo-700 bg-indigo-50">
                      {studentInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {sub.studentName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      {sub.studentEmail || sub.assignmentTitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-black font-mono border ${scoreColor}`}>
                    {score !== null && score !== undefined ? `${score.toFixed(1)}đ` : 'Chờ chấm'}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[160px] font-medium text-slate-600">
                  {sub.assignmentTitle}
                </span>
                <span className="shrink-0 text-slate-400 font-mono">
                  {formatDateTime(sub.submittedAt)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
