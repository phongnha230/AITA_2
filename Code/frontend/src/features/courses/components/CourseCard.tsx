'use client';

import React from 'react';
import { Users, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Course } from '../types/course.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelectCourse }) => {
  // Determine gradient header style by course code
  const getBannerGradient = (code: string) => {
    if (code.startsWith('SWD')) return 'from-indigo-600 to-indigo-800';
    if (code.startsWith('PRN')) return 'from-teal-600 to-emerald-700';
    if (code.startsWith('MAS')) return 'from-indigo-700 to-purple-800';
    return 'from-slate-800 to-slate-900';
  };

  const enrolled = course._count?.enrollments ?? course.enrolledStudentsCount ?? 0;
  const capacity = course.capacity || 40;
  const progress = course.syllabusProgress || 0;
  const gpa = course.currentGpaAvg || 8.0;

  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group bg-white">
      {/* Banner */}
      <div className={`p-5 bg-gradient-to-r ${getBannerGradient(course.code)} text-white`}>
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="font-mono text-xs font-bold px-2.5 py-0.5 bg-white/20 backdrop-blur-md text-white border-white/30"
          >
            {course.code}
          </Badge>
          <Badge
            variant={course.isActive ? 'default' : 'secondary'}
            className={
              course.isActive
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px]'
                : 'bg-slate-200 text-slate-800 font-bold text-[11px]'
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                course.isActive ? 'bg-white' : 'bg-slate-500'
              }`}
            />
            {course.isActive ? 'Đang mở' : 'Lưu trữ'}
          </Badge>
        </div>
        <h3 className="text-base font-extrabold text-white mt-3 leading-snug group-hover:text-indigo-100 transition truncate">
          {course.name}
        </h3>
        <p className="text-xs text-white/80 mt-1 font-medium">
          Học kỳ: <strong>{course.semester}</strong> • Phòng: <strong>{course.room || 'AL-L402'}</strong>
        </p>
      </div>

      {/* Body Stats */}
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
              <span>Tiến độ chương trình</span>
              <span className="font-bold text-slate-800">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-100 [&>div]:bg-indigo-600" />
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
        <Button
          variant="outline"
          onClick={() => onSelectCourse(course)}
          className="w-full mt-4 h-10 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs rounded-xl border-slate-200 hover:border-indigo-200 transition flex items-center justify-center gap-2 group/btn"
        >
          <BookOpen className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-600" />
          <span>Quản Lý Lớp Học</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition" />
        </Button>
      </CardContent>
    </Card>
  );
};

