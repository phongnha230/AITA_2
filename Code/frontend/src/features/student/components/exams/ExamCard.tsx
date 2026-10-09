'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Clock3,
  Code2,
  FileCheck2,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { StudentExamViewModel } from '../../types/student.types';
import { ExamStatusBadge } from './ExamStatusBadge';

interface ExamCardProps {
  exam: StudentExamViewModel;
  featured?: boolean;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Chưa có thời gian';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatDateBadge(value: string): { dayOfWeek: string; dateNum: string; monthStr: string } | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  const days = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
  const dayOfWeek = days[date.getDay()] || '';
  const dateNum = String(date.getDate()).padStart(2, '0');
  const monthStr = `T${date.getMonth() + 1}`;

  return { dayOfWeek, dateNum, monthStr };
}

function getEnvironmentLabel(environment: StudentExamViewModel['assignment']['environment']): string {
  return environment === 'C_GCC' ? 'C / GCC (Docker)' : 'Java / JDK (Docker)';
}

export function ExamCard({ exam, featured = false }: ExamCardProps) {
  const { assignment, course, temporalStatus } = exam;
  const dateBadge = formatDateBadge(assignment.startTime);

  if (featured) {
    return (
      <article className="overflow-hidden rounded-2xl border-2 border-blue-500/80 bg-white p-6 shadow-elevated ring-4 ring-blue-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
              ĐANG DIỄN RA
            </span>
            {course && (
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700">
                {course.code}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            Hạn nộp: <span className="font-semibold text-slate-800">{formatDateTime(assignment.deadline)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
            <Code2 aria-hidden="true" className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {assignment.title}
            </h3>
            {course && (
              <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                Lớp học: <span className="font-semibold text-slate-800">{course.name}</span> ({course.semester})
              </p>
            )}
            {assignment.description && (
              <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {assignment.description}
              </p>
            )}
          </div>
        </div>

        {/* Spec Box */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs sm:grid-cols-4">
          <div>
            <p className="text-slate-400">Trình biên dịch</p>
            <p className="mt-0.5 font-semibold text-slate-800">{getEnvironmentLabel(assignment.environment)}</p>
          </div>
          <div>
            <p className="text-slate-400">Hình thức nộp</p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {assignment.submissionType === 'GROUP' ? 'Theo nhóm' : 'Cá nhân'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Thời gian bắt đầu</p>
            <p className="mt-0.5 font-semibold text-slate-800">{formatDateTime(assignment.startTime)}</p>
          </div>
          <div>
            <p className="text-slate-400">Hình thức tải lên</p>
            <p className="mt-0.5 font-semibold text-slate-800">
              {[
                assignment.allowZipSubmission ? 'File ZIP' : null,
                assignment.allowGitSubmission ? 'Git Repo' : null,
              ].filter(Boolean).join(' / ') || 'Tự do'}
            </p>
          </div>
        </div>

        {/* Honest Supported State & Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Clock3 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Ca thi đang diễn ra. Nộp bài qua phòng máy LAB hoặc tệp ZIP theo hướng dẫn.</span>
          </div>
          <Link
            href="/student/results"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Tra cứu kết quả qua mã bài nộp</span>
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:border-blue-300 hover:shadow-elevated hover:-translate-y-0.5 sm:p-6">
      <div className="flex items-start gap-4">
        {/* Date badge on left */}
        {dateBadge ? (
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/70 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">{dateBadge.dayOfWeek}</span>
            <span className="text-base font-extrabold text-slate-900 leading-none mt-0.5">{dateBadge.dateNum}</span>
            <span className="text-[9px] font-medium text-slate-500">{dateBadge.monthStr}</span>
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Code2 aria-hidden="true" className="h-5 w-5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {course && (
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                {course.code}
              </span>
            )}
            <ExamStatusBadge status={temporalStatus} />
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {getEnvironmentLabel(assignment.environment)}
            </span>
          </div>

          <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">
            {assignment.title}
          </h3>

          {course && (
            <p className="mt-0.5 text-xs text-slate-500 truncate">
              {course.name} · {course.semester}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              Bắt đầu: {formatDateTime(assignment.startTime)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-slate-400" />
              Hạn nộp: {formatDateTime(assignment.deadline)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              {assignment.submissionType === 'GROUP' ? 'Nhóm' : 'Cá nhân'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="text-[11px] text-slate-500 font-medium">
          {temporalStatus === 'OPEN'
            ? 'Đang mở nhận bài thi'
            : temporalStatus === 'UPCOMING'
              ? 'Chưa đến thời gian bắt đầu'
              : 'Đã kết thúc ca thi'}
        </span>
        <Link
          href="/student/results"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
          <span>Tra cứu qua mã bài nộp</span>
        </Link>
      </div>
    </article>
  );
}
