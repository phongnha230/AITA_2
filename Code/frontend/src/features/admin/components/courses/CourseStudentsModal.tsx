'use client';

import * as React from 'react';
import { UserX } from 'lucide-react';
import type { Course } from '@/features/courses/types/course.types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface CourseStudentsModalProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  onRemoveStudent: (studentId: string, studentName: string) => void;
}

export const CourseStudentsModal: React.FC<CourseStudentsModalProps> = ({
  open,
  onClose,
  course,
  onRemoveStudent,
}) => {
  return (
    <Modal
      open={open}
      title={course ? `Danh Sách Sinh Viên: ${course.code} - ${course.name}` : 'Danh sách sinh viên'}
      onClose={onClose}
      side={true}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Giảng viên: <strong className="text-slate-800">{course?.lecturer?.fullName ?? 'Chưa phân công'}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Tổng sinh viên ghi danh: <strong className="text-blue-600">{course?.enrollments?.length ?? 0} sinh viên</strong>
            </p>
          </div>
          {course?.enrollmentCode && (
            <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-200">
              PIN: {course.enrollmentCode}
            </span>
          )}
        </div>

        {course?.enrollments && course.enrollments.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {course.enrollments.map((enr, i) => (
              <div key={enr.studentId} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-6">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{enr.student.fullName}</p>
                    <p className="text-xs text-slate-500 font-mono">{enr.student.studentCode || enr.student.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                  onClick={() => onRemoveStudent(enr.studentId, enr.student.fullName)}
                >
                  <UserX className="h-3.5 w-3.5 mr-1" /> Gỡ khỏi lớp
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Chưa có sinh viên nào ghi danh vào lớp học này.
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </Modal>
  );
};
