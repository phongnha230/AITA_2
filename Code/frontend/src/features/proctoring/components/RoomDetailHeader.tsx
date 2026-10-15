'use client';

import React from 'react';
import {
  Building2,
  ShieldCheck,
  Clock,
  Play,
  Pause,
  Plus,
  Megaphone,
  Users,
  Laptop,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ExamRoom } from '../types/proctoring.types';

interface RoomDetailHeaderProps {
  room: ExamRoom;
  secondsLeft: number;
  formatTimer: (secs: number) => string;
  isPaused: boolean;
  onTogglePause: () => void;
  onExtendTime: (mins: number) => void;
  onOpenBroadcast: () => void;
  totalStationsCount: number;
  workingCount: number;
  submittedCount: number;
  avgScore: string;
}

export const RoomDetailHeader: React.FC<RoomDetailHeaderProps> = ({
  room,
  secondsLeft,
  formatTimer,
  isPaused,
  onTogglePause,
  onExtendTime,
  onOpenBroadcast,
  totalStationsCount,
  workingCount,
  submittedCount,
  avgScore,
}) => {
  return (
    <>
      {/* Top Banner: Room Info + High-End Countdown Timer & Proctor Controls */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-indigo-50/30 p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* Left: Room & Exam Metadata */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                CA THI ĐANG DIỄN RA (LIVE)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                <Building2 className="h-3 w-3 text-slate-400" />
                {room.name} ({room.building})
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-3 w-3 text-blue-600" />
                Khóa PE Kiosk Bảo Mật
              </span>
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {room.examTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>Môn thi: <strong className="text-slate-800">{room.courseCode} - {room.courseName}</strong></span>
              <span>•</span>
              <span>Ca thi: <strong className="text-slate-800">{room.sessionTime}</strong></span>
              <span>•</span>
              <span>Giám thị: <strong className="text-slate-800">{room.proctorName}</strong></span>
            </div>
          </div>

          {/* Right: Countdown Timer & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 px-3.5 py-2.5 text-white shadow-md flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-300">
                <Clock className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">
                  Thời gian làm bài còn lại
                </p>
                <p className="font-mono text-xl font-black tracking-wider text-white">
                  {formatTimer(secondsLeft)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onTogglePause}
                className="h-9 rounded-xl border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs"
              >
                {isPaused ? (
                  <>
                    <Play className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                    Tiếp tục
                  </>
                ) : (
                  <>
                    <Pause className="mr-1 h-3.5 w-3.5 text-amber-600" />
                    Tạm dừng
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onExtendTime(5)}
                className="h-9 rounded-xl border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5 text-indigo-600" />
                +5 Phút
              </Button>

              <Button
                size="sm"
                onClick={onOpenBroadcast}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs"
              >
                <Megaphone className="mr-1.5 h-3.5 w-3.5" />
                Phát thông báo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl border-slate-200/90 bg-white shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tổng số máy thi</p>
              <h3 className="mt-1 text-2xl font-black text-slate-900">{totalStationsCount} Thí sinh</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">100% Đăng nhập thành công</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-blue-200/90 bg-blue-50/30 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Đang làm bài</p>
              <h3 className="mt-1 text-2xl font-black text-blue-900">{workingCount} Thí sinh</h3>
              <p className="mt-0.5 text-[11px] text-blue-600 font-medium">Đang thao tác trên IDE</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Laptop className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-200/90 bg-emerald-50/30 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Đã nộp bài rồi</p>
              <h3 className="mt-1 text-2xl font-black text-emerald-900">{submittedCount} Thí sinh</h3>
              <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">Đã chấm Sandbox xong</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-200/90 bg-amber-50/30 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Điểm TB (đã nộp)</p>
              <h3 className="mt-1 text-2xl font-black text-amber-900">{avgScore} / 10.0</h3>
              <p className="mt-0.5 text-[11px] text-amber-600 font-medium">Theo rubric testcases</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar thu bài phòng thi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-700">
            Tiến độ thu bài phòng thi: <strong className="text-slate-900">{submittedCount}/{totalStationsCount || room.capacity} thí sinh</strong> ({totalStationsCount > 0 ? Math.round((submittedCount / totalStationsCount) * 100) : 0}%)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Đã nộp ({submittedCount})
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Đang làm ({workingCount})
            </span>
          </div>
        </div>
        <Progress
          value={totalStationsCount > 0 ? Math.round((submittedCount / totalStationsCount) * 100) : 0}
          className="h-2.5 bg-slate-100"
        />
      </div>
    </>
  );
};
