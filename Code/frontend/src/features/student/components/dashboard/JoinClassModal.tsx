'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import type { CourseJoinResult } from '../../types/student.types';
import { getStudentServiceErrorMessage } from '../../services/student.service';

interface JoinClassModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<CourseJoinResult>;
}

export function JoinClassModal({ open, onClose, onJoin }: JoinClassModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const result = await onJoin(cleanCode);
      setCode('');
      setFeedback({ type: 'success', message: result.message });
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        message: getStudentServiceErrorMessage(error, 'Không thể tham gia lớp học. Vui lòng thử lại.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4"
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-class-title"
        aria-describedby="join-class-description"
        className="my-auto w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="join-class-title" className="text-lg font-bold text-slate-900">Tham gia lớp học</h2>
            <p id="join-class-description" className="mt-1 text-sm text-slate-600">
              Nhập mã lớp do giảng viên cung cấp để đồng bộ lịch thi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại tham gia lớp"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="join-class-code" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Mã lớp
          </label>
          <input
            ref={inputRef}
            id="join-class-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Nhập mã lớp tham gia..."
            autoComplete="off"
            maxLength={20}
            required
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 shadow-inner outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          {feedback && (
            <p
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`mt-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
                feedback.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {feedback.message}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!code.trim() || isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
            >
              {isSubmitting && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
              Tham gia
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
