'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileCode2,
  KeyRound,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StudentCourse } from '../../types/student.types';

interface StudentCourseCardProps {
  course: StudentCourse;
  onOpenJoinModal: (course: StudentCourse) => void;
}

export const StudentCourseCard: React.FC<StudentCourseCardProps> = ({
  course,
  onOpenJoinModal,
}) => {
  const isEnrolled = Boolean(course.isEnrolled);

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-elevated-sm transition-colors duration-200 hover:-translate-y-1 hover:shadow-elevated ${
        isEnrolled
          ? 'border-emerald-200/90 hover:border-emerald-300'
          : 'border-slate-200/80 hover:border-blue-300'
      }`}
    >
      <div>
        {/* Top Bar: Mã môn + Trạng thái */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-lg border border-blue-200/80 bg-blue-50/90 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
            {course.code}
          </span>

          <div className="flex items-center gap-1.5">
            {isEnrolled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-3" />
                <span>Đã tham gia</span>
              </span>
            ) : (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  course.isActive
                    ? 'border border-slate-200 bg-slate-50 text-slate-600'
                    : 'border border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {course.isActive ? 'Đang mở' : 'Tạm đóng'}
              </span>
            )}
          </div>
        </div>

        {/* Course Name */}
        <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
          {course.name}
        </h3>

        {/* Giảng viên phụ trách */}
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <User className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate">
                {course.lecturer?.fullName || 'Giảng viên khoa CNTT'}
              </p>
              {course.lecturer?.email && (
                <p className="text-xs text-slate-500 truncate">
                  {course.lecturer.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Meta Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
            Học kỳ: {course.semester}
          </span>
          {typeof course.enrollmentCount === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
              <Users className="size-3" />
              <span>{course.enrollmentCount} SV</span>
            </span>
          )}
          {typeof course.assignmentCount === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
              <FileCode2 className="size-3" />
              <span>{course.assignmentCount} bài thi</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {isEnrolled ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
              <Sparkles className="size-3.5 text-emerald-600" />
              Đã sẵn sàng thi
            </span>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-lg text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
            >
              <Link href="/student/exams">
                <span>Xem bài thi</span>
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenJoinModal(course);
            }}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 hover:shadow-sm active:translate-y-0"
          >
            <KeyRound className="size-3.5" />
            <span>Tham gia lớp học này</span>
          </button>
        )}
      </div>
    </article>
  );
};
