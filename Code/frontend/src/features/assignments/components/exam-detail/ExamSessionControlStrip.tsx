'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Plus, StopCircle, Radio, Users, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [optimisticDeadlineMs, setOptimisticDeadlineMs] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Live timer tick every 1000ms
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

  const handleAdjustTime = async (extraMinutes: number) => {
    setIsUpdating(true);
    const baseMs = Math.max(Date.now(), effectiveDeadlineMs);
    setOptimisticDeadlineMs(baseMs + extraMinutes * 60 * 1000);
    try {
      const res = await assignmentService.controlExamSession(assignment.id, 'EXTEND', extraMinutes);
      setFeedback(res.message || `Đã gia hạn +${extraMinutes} phút`);
      onRefresh?.();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Lỗi gia hạn ca thi:', err);
      setFeedback('Không thể gia hạn thời gian.');
    } finally {
      setIsUpdating(false);
      setOptimisticDeadlineMs(null);
    }
  };

  const handleCloseSession = async () => {
    if (!confirm('Bạn có chắc chắn muốn thu bài ca thi này ngay lập tức? Sinh viên sẽ không thể nộp bài tiếp.')) {
      return;
    }
    setIsUpdating(true);
    setOptimisticDeadlineMs(Date.now());
    try {
      const res = await assignmentService.controlExamSession(assignment.id, 'CLOSE');
      setFeedback(res.message || 'Đã đóng ca thi');
      onRefresh?.();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Lỗi thu bài ca thi:', err);
    } finally {
      setIsUpdating(false);
      setOptimisticDeadlineMs(null);
    }
  };

  const isLive = assignment.status === 'PUBLISHED' && secondsLeft > 0;
  const isClosed = assignment.status === 'CLOSED' || secondsLeft === 0;

  return (
    <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white shadow-md space-y-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Timer & Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
            {isLive ? (
              <Radio className="size-5 text-emerald-400 animate-pulse" />
            ) : (
              <Clock className="size-5 text-slate-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                {isLive ? 'Ca thi đang diễn ra (LIVE)' : isClosed ? 'Ca thi đã kết thúc' : 'Ca thi sắp bắt đầu'}
              </span>
              {feedback && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  {feedback}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-2xl font-black tracking-widest text-white">
                {formatTimer(secondsLeft)}
              </span>
              <span className="text-xs text-slate-400">
                (Thời lượng: {assignment.durationMinutes || 90} phút)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Điều chỉnh thời gian & Đi tới giám sát */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => handleAdjustTime(5)}
            className="h-9 rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            <Plus className="mr-1 size-3.5 text-indigo-300" />
            +5 Phút
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating}
            onClick={() => handleAdjustTime(10)}
            className="h-9 rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            <Plus className="mr-1 size-3.5 text-indigo-300" />
            +10 Phút
          </Button>

          {isLive && (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={handleCloseSession}
              className="h-9 rounded-xl border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs"
            >
              <StopCircle className="mr-1 size-3.5 text-rose-400" />
              Thu bài ngay
            </Button>
          )}

          <Button
            asChild
            size="sm"
            className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm"
          >
            <Link href={ROUTES.LECTURER.LIVE_PROCTORING_ROOM(assignment.id)}>
              <Users className="mr-1.5 size-3.5" />
              Sơ đồ máy thi
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm"
          >
            <Link href={ROUTES.LECTURER.EXAM_BANK_SUBMISSIONS(assignment.id)}>
              <Terminal className="mr-1.5 size-3.5" />
              Log Docker Sandbox
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
