'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStudentServiceErrorMessage } from '../../services/student.service';
import type { CourseJoinResult, StudentCourse } from '../../types/student.types';

interface CourseJoinModalProps {
  open: boolean;
  onClose: () => void;
  targetCourse: StudentCourse | null;
  onJoin: (code: string) => Promise<CourseJoinResult>;
}

export function CourseJoinModal({
  open,
  onClose,
  targetCourse,
  onJoin,
}: CourseJoinModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    course?: StudentCourse;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setFeedback(null);
    }
  }, [open, targetCourse]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await onJoin(cleanCode);
      setFeedback({
        type: 'success',
        message: result.message,
        course: result.course,
      });
      setCode('');
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        message: getStudentServiceErrorMessage(
          error,
          'Mã tham gia không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.',
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFeedback(null);
      setCode('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
        <DialogHeader className="text-left space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {targetCourse ? `Tham gia lớp ${targetCourse.code}` : 'Tham gia lớp học mới'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Nhập mã tham gia (Enrollment Key) do giảng viên cung cấp để ghi danh vào lớp.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Thông tin lớp học được chọn (nếu có) */}
        {targetCourse && (
          <div className="mt-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                {targetCourse.code}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Học kỳ: <strong className="text-slate-700">{targetCourse.semester}</strong>
              </span>
            </div>

            <p className="text-sm font-bold text-slate-900 line-clamp-1">
              {targetCourse.name}
            </p>

            {targetCourse.lecturer && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User className="h-3 w-3" />
                </span>
                <span className="truncate">
                  Giảng viên: <strong className="text-slate-800">{targetCourse.lecturer.fullName}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form nhập mã */}
        {feedback?.type === 'success' ? (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Ghi danh thành công!</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                {feedback.message}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl text-xs"
              >
                Đóng
              </Button>
              <Button
                asChild
                className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/student/exams">
                  <span>Xem bài thi môn học</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-4">
            <div>
              <label
                htmlFor="course-join-code-input"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Mã tham gia lớp học
              </label>
              <Input
                id="course-join-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: PR192-A8F2 hoặc mã ngẫu nhiên..."
                autoComplete="off"
                maxLength={20}
                required
                disabled={isSubmitting}
                className="h-11 rounded-xl bg-slate-50 font-mono text-sm tracking-wider uppercase focus-visible:ring-blue-600 focus-visible:bg-white"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Mã lớp do Giảng viên phụ trách cung cấp trực tiếp trên lớp học hoặc qua thông báo.
              </p>
            </div>

            {feedback?.type === 'error' && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50/80 px-3.5 py-2.5 text-xs font-medium text-rose-700"
              >
                {feedback.message}
              </p>
            )}

            <DialogFooter className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="h-10 rounded-xl text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !code.trim()}
                className="h-10 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span>Đang kiểm tra & ghi danh...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                    <span>Xác nhận tham gia</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
