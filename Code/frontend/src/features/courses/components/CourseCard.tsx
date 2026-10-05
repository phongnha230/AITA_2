'use client';

import React from 'react';
import { Users, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Course } from '../types/course.types';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelectCourse }) => {
  // Determine gradient header style by course code
  const getBannerGradient = (code: string) => {
    if (code.startsWith('SWD')) return 'from-blue-600 to-indigo-700';
    if (code.startsWith('PRN')) return 'from-teal-600 to-emerald-700';
    if (code.startsWith('MAS')) return 'from-indigo-600 to-purple-700';
    return 'from-slate-700 to-slate-900';
  };

  const enrolled = course._count?.enrollments ?? course.enrolledStudentsCount ?? 0;
  const capacity = course.capacity || 40;
  const progress = course.syllabusProgress || 0;
  const gpa = course.currentGpaAvg || 8.0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group">
      {/* Banner */}
      <div className={`p-5 bg-gradient-to-r ${getBannerGradient(course.code)} text-white`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white border border-white/20">
            {course.code}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              course.isActive
                ? 'bg-emerald-400 text-emerald-950'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                course.isActive ? 'bg-emerald-900' : 'bg-slate-600'
              }`}
            />
            {course.isActive ? 'Đang mở' : 'Lưu trữ'}
          </span>
        </div>
        <h3 className="text-base font-extrabold text-white mt-3 leading-snug group-hover:text-blue-100 transition truncate">
          {course.name}
        </h3>
        <p className="text-xs text-white/80 mt-1 font-medium">
          Học kỳ: <strong>{course.semester}</strong> • Phòng: <strong>{course.room || 'AL-L402'}</strong>
        </p>
      </div>

      {/* Body Stats */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span>Tiến độ chương trình</span>
              <span className="font-bold text-slate-800">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Sĩ số & Điểm TB */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Sĩ số: <strong className="text-slate-900">{enrolled}/{capacity}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 justify-end">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                GPA TB: <strong className="text-slate-900">{gpa}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelectCourse(course)}
          className="w-full mt-4 py-2.5 px-4 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-200 transition flex items-center justify-center gap-2 group/btn"
        >
          <BookOpen className="w-4 h-4 text-slate-500 group-hover/btn:text-blue-600" />
          <span>Quản Lý Lớp Học</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
        </button>
      </div>
    </div>
  );
};
