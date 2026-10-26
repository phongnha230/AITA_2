'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Clock,
  Code2,
  FileCheck2,
  LogIn,
  Play,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudentExamViewModel } from '../../types/student.types';
import { SubmitExamModal } from './SubmitExamModal';
import { ExamDetailModal } from './ExamDetailModal';
import { formatDateTime } from '@/lib/formatDate';

interface ExamCardProps {
  exam: StudentExamViewModel;
  featured?: boolean;
}

function getEnvironmentShort(environment: StudentExamViewModel['assignment']['environment']): string {
  if (environment === 'C_GCC') return 'C / GCC';
  if (environment === 'JAVA_JDK') return 'Java / JDK';
  return 'React / Web';
}

function StatusBadge({ status }: { status: StudentExamViewModel['temporalStatus'] }) {
  if (status === 'OPEN') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
        Đang mở
      </span>
    );
  }
  if (status === 'UPCOMING') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
        <CalendarClock className="size-3" />
        Sắp tới
      </span>
    );
  }
  if (status === 'PAUSED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
        Tạm dừng
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
      Đã kết thúc
    </span>
  );
}

export function ExamCard({ exam }: ExamCardProps) {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { assignment, course, temporalStatus } = exam;
  const isOpen = temporalStatus === 'OPEN';
  const isEnded = temporalStatus === 'ENDED';

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Top meta: Course Tag & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          {course ? (
            <span className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
              {course.code}
            </span>
          ) : (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
              Chung
            </span>
          )}
          <StatusBadge status={temporalStatus} />
        </div>

        {/* Title & Subject */}
        <div className="mt-3">
          <h3
            title={assignment.title}
            className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {assignment.title}
          </h3>
          <p
            title={course ? `${course.name} (${course.semester})` : ''}
            className="mt-0.5 text-xs text-slate-500 line-clamp-1"
          >
            {course?.name ? `${course.name} • ${course.semester}` : 'Lớp học'}
          </p>
        </div>

        {/* Compact Spec Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-2.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Thời lượng: <strong className="text-slate-800">{assignment.durationMinutes ?? 90}p</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="size-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Môi trường: <strong className="text-slate-800">{getEnvironmentShort(assignment.environment)}</strong>
            </span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 border-t border-slate-200/60 pt-2 text-[11px]">
            <span className="text-slate-400">Hạn nộp:</span>
            <span className="font-semibold text-slate-700 truncate">
              {formatDateTime(assignment.deadline)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <Button
          type="button"
          onClick={() => setIsDetailOpen(true)}
          className={`flex-1 h-9 rounded-xl text-xs font-semibold justify-center gap-1.5 shadow-2xs transition-colors ${
            isOpen
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : isEnded
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isOpen ? (
            <>
              <Play className="size-3.5 fill-current" />
              <span>Tham gia thi</span>
            </>
          ) : isEnded ? (
            <>
              <FileCheck2 className="size-3.5" />
              <span>Xem lại đề</span>
            </>
          ) : (
            <>
              <LogIn className="size-3.5" />
              <span>Xem phòng chờ</span>
            </>
          )}
        </Button>

        {isEnded && (
          <Link
            href="/student/results"
            title="Xem kết quả & điểm AI"
            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            <Sparkles className="size-4" />
          </Link>
        )}
      </div>

      {/* Modals */}
      <ExamDetailModal
        exam={exam}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />
      <SubmitExamModal
        exam={exam}
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </article>
  );
}
