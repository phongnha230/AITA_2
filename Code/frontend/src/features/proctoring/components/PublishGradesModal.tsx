'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Users, FileCheck } from 'lucide-react';
import { assignmentService } from '@/features/assignments/services/assignment.service';

interface PublishGradesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  sessionTitle: string;
  totalEnrolled: number;
  submittedCount: number;
  onSuccess?: () => void;
}

export const PublishGradesModal: React.FC<PublishGradesModalProps> = ({
  open,
  onOpenChange,
  assignmentId,
  sessionTitle,
  totalEnrolled,
  submittedCount,
  onSuccess,
}) => {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unsubmittedCount = Math.max(0, totalEnrolled - submittedCount);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      setError(null);
      await assignmentService.controlExamSession(assignmentId, 'PUBLISH_GRADES');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Lỗi công bố điểm:', err);
      setError(err instanceof Error ? err.message : 'Không thể công bố điểm ca thi.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Sparkles className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">
                Công bố điểm ca thi
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {sessionTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Hành động này sẽ chính thức phát hành kết quả thi cho tất cả sinh viên trong ca thi này. Sinh viên sẽ có thể xem điểm và nhận xét chi tiết của máy chấm & AI trên trang kết quả cá nhân.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700">
                <FileCheck className="size-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Đã nộp bài
                </span>
                <span className="font-mono text-base font-black text-slate-900">
                  {submittedCount} sinh viên
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-rose-100/70 text-rose-700">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Chưa nộp (Tính 0đ)
                </span>
                <span className="font-mono text-base font-black text-rose-600">
                  {unsubmittedCount} sinh viên
                </span>
              </div>
            </div>
          </div>

          {error && (
            <p className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={publishing}
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold h-10 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={publishing}
            onClick={handlePublish}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-sm cursor-pointer"
          >
            {publishing ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 size-4" />
            )}
            Xác nhận công bố điểm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
