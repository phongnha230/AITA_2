'use client';

import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Laptop,
  Terminal,
  User,
  X,
} from 'lucide-react';
import type { StudentExamStation } from '../types/proctoring.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InspectStationModalProps {
  station: StudentExamStation | null;
  onClose: () => void;
  onForceSubmit: (id: string) => void;
}

export function InspectStationModal({ station, onClose, onForceSubmit }: InspectStationModalProps) {
  if (!station) return null;

  const isSubmitted = station.status === 'submitted';

  return (
    <Dialog open={Boolean(station)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-2xl border-border bg-card p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-mono text-sm font-bold text-white shadow-xs">
                {station.pcNumber}
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Chi tiết Máy thi &amp; Thí sinh {station.studentName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-mono">
                  MSSV: {station.studentCode} • Vị trí: {station.pcNumber}
                </DialogDescription>
              </div>
            </div>

            {isSubmitted ? (
              <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
                ĐÃ NỘP BÀI
              </Badge>
            ) : (
              <Badge className="bg-blue-600 text-white text-[11px] font-bold">
                ĐANG LÀM BÀI
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <span className="text-[11px] font-medium text-slate-500">Testcase Đạt</span>
              <p className="mt-1 font-mono text-base font-bold text-slate-900">
                {station.passedCases}/{station.totalCases}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <span className="text-[11px] font-medium text-slate-500">Chạy Sandbox</span>
              <p className="mt-1 font-mono text-base font-bold text-slate-900">
                {station.testAttempts}/{station.maxAttempts} lần
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <span className="text-[11px] font-medium text-slate-500">Điểm tạm tính</span>
              <p className="mt-1 font-mono text-base font-bold text-indigo-600">
                {station.score !== undefined
                  ? `${station.score} / 10`
                  : `${((station.passedCases / station.totalCases) * 10).toFixed(1)} / 10`}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Bài tập đang làm:</span>
              <span className="font-semibold text-slate-800">{station.currentProblem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian bắt đầu làm:</span>
              <span className="font-mono text-slate-700">{station.startTime}</span>
            </div>
            {station.submittedAt && (
              <div className="flex justify-between">
                <span className="text-slate-500">Thời điểm nộp bài:</span>
                <span className="font-mono font-bold text-emerald-700">{station.submittedAt}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Môi trường Kiosk:</span>
              <span className="font-semibold text-emerald-600">Bảo mật (Anti-cheat Active)</span>
            </div>
          </div>

          {/* Terminal / Sandbox Output Log */}
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-700">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <span>Log biên dịch Sandbox gần nhất:</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-emerald-400 overflow-x-auto">
              <p className="text-slate-400">[$] gcc -Wall -O2 solution.c -o solution.out</p>
              <p className="text-emerald-400">[OK] Compilation succeeded with 0 errors.</p>
              <p className="text-slate-300">
                [TEST] Running Test 1.. PASS (12ms) | Test 2.. PASS (15ms) | Test 3.. PASS (14ms)
              </p>
              {station.passedCases < station.totalCases && (
                <p className="text-amber-400">
                  [FAIL] Test 4: Output mismatch (Expected: &apos;100&apos;, Actual: &apos;98&apos;)
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5 flex gap-2 sm:justify-between">
          <div>
            {!isSubmitted && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onForceSubmit(station.id);
                  onClose();
                }}
                className="rounded-xl text-xs font-semibold"
              >
                Thu bài bắt buộc
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Đóng cửa sổ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
