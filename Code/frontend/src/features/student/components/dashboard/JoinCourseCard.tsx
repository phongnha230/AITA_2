'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, HelpCircle, KeyRound, Loader2, Send } from 'lucide-react';
import type { CourseJoinResult } from '../../types/student.types';
import { getStudentServiceErrorMessage } from '../../services/student.service';

interface JoinCourseCardProps {
  onJoin: (code: string) => Promise<CourseJoinResult>;
}

export function JoinCourseCard({ onJoin }: JoinCourseCardProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    courseName?: string;
    courseCode?: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode || cleanCode.length < 4 || cleanCode.length > 20) {
      setFeedback({
        type: 'error',
        message: 'Mã lớp học phải có độ dài từ 4 đến 20 ký tự.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await onJoin(cleanCode);
      setCode('');
      setFeedback({
        type: 'success',
        message: result.message,
        courseName: result.course?.name,
        courseCode: result.course?.code,
      });
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        message: getStudentServiceErrorMessage(
          error,
          'Không thể tham gia lớp học. Vui lòng kiểm tra lại mã hoặc liên hệ Giảng viên.',
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      aria-label="Tham gia lớp học"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated sm:p-7"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100/80">
          <KeyRound aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Tham gia lớp học bằng mã Invite
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Mã định danh do Giảng viên quản lý bộ môn cung cấp cho sinh viên.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="dashboard-invite-code"
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Mã lớp học (Invite Code)
          </label>
          <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row">
            <input
              id="dashboard-invite-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (feedback) setFeedback(null);
              }}
              placeholder="MÃ THAM GIA LỚP (4-20 KÝ TỰ)"
              maxLength={20}
              autoComplete="off"
              disabled={isSubmitting}
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 font-mono text-sm tracking-wider text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100/70 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={isSubmitting || !code.trim() || code.trim().length < 4}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Send aria-hidden="true" className="h-4 w-4" />
                  <span>Kiểm tra &amp; Tham gia</span>
                </>
              )}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs leading-relaxed shadow-elevated-sm ${
              feedback.type === 'error'
                ? 'border-rose-200 bg-rose-50/80 text-rose-800'
                : 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
            }`}
          >
            {feedback.type === 'success' && (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold">{feedback.message}</p>
              {feedback.courseName && (
                <p className="mt-1 text-emerald-700">
                  Khóa học: <span className="font-semibold">{feedback.courseCode}</span> - {feedback.courseName}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 p-3.5 text-xs text-slate-600 ring-1 ring-slate-100">
          <HelpCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="leading-relaxed">
            Chưa nhận được mã? Hãy kiểm tra thông báo môn học trên hệ thống đào tạo hoặc liên hệ Giảng viên phụ trách để nhận mã xác thực hợp lệ.
          </p>
        </div>
      </form>
    </section>
  );
}
