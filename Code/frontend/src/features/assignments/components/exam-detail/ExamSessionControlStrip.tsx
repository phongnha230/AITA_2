'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  StopCircle,
  Radio,
  Users,
  Terminal,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/routes';
import { assignmentService } from '../../services/assignment.service';
import type { Assignment } from '../../types/assignment.types';

interface ExamSessionControlStripProps {
  assignment: Assignment;
  onRefresh?: () => void;
}

export const ExamSessionControlStrip: React.FC<ExamSessionControlStripProps> = ({
  assignment,
  onRefresh,
}) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [optimisticDeadlineMs, setOptimisticDeadlineMs] = useState<number | null>(() =>
    assignment.deadline ? new Date(assignment.deadline).getTime() : null
  );
  const [sessionStatus, setSessionStatus] = useState<string>(() => assignment.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingAction, setUpdatingAction] = useState<number | 'CLOSE' | 'REOPEN_60' | 'REOPEN_90' | 'REOPEN_CUSTOM' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Dialog State
  const [isReopenDialogOpen, setIsReopenDialogOpen] = useState(false);
  const [reopenDuration, setReopenDuration] = useState<number>(assignment.durationMinutes || 90);
  const [newPasscode, setNewPasscode] = useState<string>(assignment.accessCode || '');

  // Đồng bộ khi props assignment thay đổi từ server
  useEffect(() => {
    if (assignment.deadline) {
      setOptimisticDeadlineMs(new Date(assignment.deadline).getTime());
    }
    setSessionStatus(assignment.status);
  }, [assignment.deadline, assignment.status]);

  // Bộ đếm thời gian theo thời gian thực (1 giây/lần)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const propDeadlineMs = assignment.deadline ? new Date(assignment.deadline).getTime() : 0;
  const effectiveDeadlineMs = optimisticDeadlineMs ?? propDeadlineMs;
  const secondsLeft = Math.max(0, Math.floor((effectiveDeadlineMs - currentTime) / 1000));

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Gia hạn thêm vài phút khi đang thi
  const handleAdjustTime = async (extraMinutes: number) => {
    setIsUpdating(true);
    setUpdatingAction(extraMinutes);
    const baseMs = Math.max(Date.now(), effectiveDeadlineMs);
    const targetMs = baseMs + extraMinutes * 60 * 1000;
    setOptimisticDeadlineMs(targetMs);
    setSessionStatus('PUBLISHED');

    try {
      const res = await assignmentService.controlExamSession(assignment.id, 'EXTEND', extraMinutes);
      setFeedback(res.message || `Đã gia hạn +${extraMinutes} phút`);
      if (res.deadline) {
        setOptimisticDeadlineMs(new Date(res.deadline).getTime());
      }
      if (res.status) {
        setSessionStatus(res.status);
      }
      onRefresh?.();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      console.error('Lỗi gia hạn ca thi:', err);
      setFeedback('Không thể gia hạn thời gian.');
      setOptimisticDeadlineMs(assignment.deadline ? new Date(assignment.deadline).getTime() : null);
      setSessionStatus(assignment.status);
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsUpdating(false);
      setUpdatingAction(null);
    }
  };

  // Thu bài ngay
  const handleCloseSession = async () => {
    if (!confirm('Bạn có chắc chắn muốn thu bài ca thi này ngay lập tức? Sinh viên sẽ không thể nộp bài tiếp.')) {
      return;
    }
    setIsUpdating(true);
    setUpdatingAction('CLOSE');
    setOptimisticDeadlineMs(Date.now());
    setSessionStatus('CLOSED');

    try {
      const res = await assignmentService.controlExamSession(assignment.id, 'CLOSE');
      setFeedback(res.message || 'Đã đóng ca thi');
      if (res.deadline) {
        setOptimisticDeadlineMs(new Date(res.deadline).getTime());
      }
      if (res.status) {
        setSessionStatus(res.status);
      }
      onRefresh?.();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      console.error('Lỗi thu bài ca thi:', err);
      setFeedback('Không thể đóng ca thi.');
      setOptimisticDeadlineMs(assignment.deadline ? new Date(assignment.deadline).getTime() : null);
      setSessionStatus(assignment.status);
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsUpdating(false);
      setUpdatingAction(null);
    }
  };

  // Mở lại ca thi (Reopen)
  const handleReopenSession = async (
    minutes: number,
    actionKey: 'REOPEN_60' | 'REOPEN_90' | 'REOPEN_CUSTOM',
    passcode?: string
  ) => {
    setIsUpdating(true);
    setUpdatingAction(actionKey);
    const targetMs = Date.now() + minutes * 60 * 1000;
    setOptimisticDeadlineMs(targetMs);
    setSessionStatus('PUBLISHED');

    try {
      const res = await assignmentService.controlExamSession(
        assignment.id,
        'REOPEN',
        minutes,
        passcode?.trim() || undefined
      );
      setFeedback(res.message || `Đã mở lại ca thi (${minutes} phút)`);
      if (res.deadline) {
        setOptimisticDeadlineMs(new Date(res.deadline).getTime());
      }
      if (res.status) {
        setSessionStatus(res.status);
      }
      setIsReopenDialogOpen(false);
      onRefresh?.();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: unknown) {
      console.error('Lỗi mở lại ca thi:', err);
      setFeedback('Không thể mở lại ca thi.');
      setOptimisticDeadlineMs(assignment.deadline ? new Date(assignment.deadline).getTime() : null);
      setSessionStatus(assignment.status);
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsUpdating(false);
      setUpdatingAction(null);
    }
  };

  const isLive = sessionStatus === 'PUBLISHED' && secondsLeft > 0;
  const isClosed = sessionStatus === 'CLOSED' || secondsLeft === 0;

  return (
    <>
      <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Timer & Status (Sáng, Tinh tế, Dễ nhìn) */}
          <div className="flex items-center gap-3.5">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                isLive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              {isLive ? (
                <Radio className="size-5 animate-pulse text-emerald-600" />
              ) : (
                <Clock className="size-5 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 border border-emerald-200/80">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Ca thi đang diễn ra
                  </span>
                ) : isClosed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-600 border border-slate-200">
                    Ca thi đã kết thúc
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-700 border border-amber-200">
                    Ca thi sắp bắt đầu
                  </span>
                )}

                {feedback && (
                  <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-700 animate-in fade-in duration-200">
                    {feedback}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`font-mono text-2xl sm:text-3xl font-black tracking-wider ${
                    isLive
                      ? secondsLeft < 300
                        ? 'text-rose-600 animate-pulse'
                        : 'text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  {formatTimer(secondsLeft)}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  (Thời lượng: {assignment.durationMinutes || 90} phút)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Cụm điều khiển gọn gàng, chia khối rõ ràng, màu sắc hài hòa */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {isClosed ? (
              /* Khi ca thi đã kết thúc: Cụm mở lại dạng Segmented Widget gọn gàng */
              <div className="inline-flex items-center rounded-2xl bg-amber-50/70 p-1 border border-amber-200/80 shadow-2xs">
                <span className="px-2.5 text-xs font-bold text-amber-900 flex items-center gap-1 select-none">
                  <RotateCcw className="size-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Mở lại:</span>
                </span>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleReopenSession(60, 'REOPEN_60')}
                  className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-amber-900 hover:bg-amber-100/70 border border-amber-200/90 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Mở lại và gia hạn 60 phút"
                >
                  {updatingAction === 'REOPEN_60' ? (
                    <Loader2 className="size-3 animate-spin inline text-amber-600" />
                  ) : (
                    '+60p'
                  )}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleReopenSession(90, 'REOPEN_90')}
                  className="ml-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-amber-900 hover:bg-amber-100/70 border border-amber-200/90 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Mở lại và gia hạn 90 phút"
                >
                  {updatingAction === 'REOPEN_90' ? (
                    <Loader2 className="size-3 animate-spin inline text-amber-600" />
                  ) : (
                    '+90p'
                  )}
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setIsReopenDialogOpen(true)}
                  className="ml-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition active:scale-95 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  title="Tùy chỉnh thời lượng và passcode mới"
                >
                  <SlidersHorizontal className="size-3" />
                  <span>Tùy chỉnh</span>
                </button>
              </div>
            ) : (
              /* Khi ca thi đang diễn ra: Cụm Gia Hạn Nhanh dạng Segmented Widget + Nút Thu bài màu dịu */
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-2xl bg-indigo-50/70 p-1 border border-indigo-100 shadow-2xs">
                  <span className="px-2.5 text-xs font-bold text-indigo-900 flex items-center gap-1 select-none">
                    <Clock className="size-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Gia hạn:</span>
                  </span>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleAdjustTime(5)}
                    className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Gia hạn thêm 5 phút"
                  >
                    {updatingAction === 5 ? (
                      <Loader2 className="size-3 animate-spin inline text-indigo-600" />
                    ) : (
                      '+5p'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleAdjustTime(10)}
                    className="ml-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Gia hạn thêm 10 phút"
                  >
                    {updatingAction === 10 ? (
                      <Loader2 className="size-3 animate-spin inline text-indigo-600" />
                    ) : (
                      '+10p'
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleAdjustTime(15)}
                    className="ml-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Gia hạn thêm 15 phút"
                  >
                    {updatingAction === 15 ? (
                      <Loader2 className="size-3 animate-spin inline text-indigo-600" />
                    ) : (
                      '+15p'
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleCloseSession}
                  className="h-8.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Kết thúc ca thi và thu bài ngay"
                >
                  {updatingAction === 'CLOSE' ? (
                    <Loader2 className="size-3.5 animate-spin text-rose-600" />
                  ) : (
                    <StopCircle className="size-3.5 text-rose-600" />
                  )}
                  <span>Thu bài</span>
                </button>
              </div>
            )}

            {/* Đường phân cách nhẹ */}
            <div className="h-6 w-px bg-slate-200 hidden lg:block" />

            {/* Phím tắt Giám sát & Logs */}
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8.5 rounded-xl border-indigo-200/80 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shadow-2xs"
              >
                <Link href={ROUTES.LECTURER.LIVE_PROCTORING_ROOM(assignment.id)}>
                  <Users className="mr-1.5 size-3.5" />
                  Sơ đồ máy thi
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8.5 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs"
              >
                <Link href={ROUTES.LECTURER.EXAM_BANK_SUBMISSIONS(assignment.id)}>
                  <Terminal className="mr-1.5 size-3.5 text-slate-500" />
                  Log Sandbox
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reopen / Custom Duration Dialog */}
      <Dialog open={isReopenDialogOpen} onOpenChange={setIsReopenDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <RotateCcw className="size-5 text-indigo-600" />
              Mở lại thời gian ca thi
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1 leading-relaxed">
              Hệ thống sẽ đặt lại đồng hồ đếm ngược và mở cổng nộp bài cho sinh viên. Quyền nộp bài sẽ tự động được mở lại cho các sinh viên chưa kịp nộp bài trước đó.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Quick choices */}
            <div>
              <label className="text-xs font-bold text-slate-700">Chọn thời lượng làm bài mới:</label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {[45, 60, 90, 120].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setReopenDuration(mins)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      reopenDuration === mins
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {mins} Phút
                  </button>
                ))}
              </div>
            </div>

            {/* Custom input */}
            <div>
              <label htmlFor="custom-duration" className="text-xs font-medium text-slate-600">
                Hoặc nhập số phút tùy chỉnh:
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="custom-duration"
                  type="number"
                  min={5}
                  max={480}
                  value={reopenDuration}
                  onChange={(e) => setReopenDuration(Math.max(5, Number(e.target.value) || 0))}
                  className="rounded-xl font-mono font-bold text-sm h-10 border-slate-200"
                />
                <span className="text-xs text-slate-500 font-semibold shrink-0">phút từ bây giờ</span>
              </div>
            </div>

            {/* Passcode (Access Code) */}
            <div>
              <label htmlFor="new-passcode" className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-amber-600" />
                Mã mở đề (Passcode):
              </label>
              <Input
                id="new-passcode"
                placeholder="VD: PE-PRO192-CA2"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value.toUpperCase())}
                className="mt-1 rounded-xl font-mono font-bold text-sm h-10 uppercase tracking-wider border-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Để nguyên nếu dùng lại mã cũ, hoặc đổi mã mới để chỉ cho sinh viên ca mới vào thi.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReopenDialogOpen(false)}
              className="rounded-xl text-xs font-semibold h-10 border-slate-200 hover:bg-slate-50"
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={isUpdating}
              onClick={() => handleReopenSession(reopenDuration, 'REOPEN_CUSTOM', newPasscode)}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 shadow-sm"
            >
              {updatingAction === 'REOPEN_CUSTOM' ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-1.5 size-4" />
              )}
              Xác nhận mở lại ca ({reopenDuration}p)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
