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
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md ${
        isEnrolled ? 'border-emerald-200/90' : 'border-slate-200/90'
      }`}
    >
      <div>
        {/* Top: Mã môn + Trạng thái */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700">
            {course.code}
          </span>

          <div className="flex items-center gap-1.5">
            {isEnrolled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="size-3 text-emerald-600" />
                <span>Đã tham gia</span>
              </span>
            ) : (
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
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

        {/* Tên môn học */}
        <div className="mt-3">
          <h3
            title={course.name}
            className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {course.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
            Học kỳ: <strong className="text-slate-700 font-medium">{course.semester}</strong>
          </p>
        </div>

        {/* Thông tin Giảng viên */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50/80 p-2.5 text-xs">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <User className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800 truncate text-xs">
              {course.lecturer?.fullName || 'Giảng viên bộ môn'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {course.lecturer?.email || 'Khoa Công nghệ thông tin'}
            </p>
          </div>
        </div>

        {/* Thông số nhanh */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3 text-slate-400" />
            <span>{course.enrollmentCount ?? 0} sinh viên</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <FileCode2 className="size-3 text-slate-400" />
            <span>{course.assignmentCount ?? 0} bài thi</span>
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {isEnrolled ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1">
              <Sparkles className="size-3 text-emerald-600" />
              Sẵn sàng thi
            </span>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-xl text-xs font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 transition-colors"
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
            className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-indigo-700 active:translate-y-0 cursor-pointer"
          >
            <KeyRound className="size-3.5" />
            <span>Tham gia lớp học</span>
          </button>
        )}
      </div>
    </article>
  );
};
