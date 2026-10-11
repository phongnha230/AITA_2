'use client';

import { useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { CourseJoinResult } from '../../types/student.types';
import { getStudentServiceErrorMessage } from '../../services/student.service';
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
import { cn } from '@/lib/utils';

interface JoinClassModalProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<CourseJoinResult>;
}

export function JoinClassModal({ open, onClose, onJoin }: JoinClassModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFeedback(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card p-6 shadow-2xl sm:p-7">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">Tham gia lớp học</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Nhập mã lớp do giảng viên cung cấp để đồng bộ lịch thi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="join-class-code" className="mb-1.5 block text-sm font-semibold text-foreground">
              Mã lớp
            </label>
            <Input
              id="join-class-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Nhập mã lớp tham gia..."
              autoComplete="off"
              maxLength={20}
              required
              className="h-11 rounded-xl bg-muted/40 font-mono tracking-wider focus-visible:ring-primary"
            />
          </div>

          {feedback && (
            <p
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={cn(
                'rounded-xl border px-3.5 py-2.5 text-sm font-medium',
                feedback.type === 'error'
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700',
              )}
            >
              {feedback.message}
            </p>
          )}

          <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!code.trim() || isSubmitting}
              className="rounded-xl shadow-sm"
            >
              {isSubmitting && <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
              Tham gia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
