'use client';

import React from 'react';
import {
  Clock,
  PlayCircle,
  PauseCircle,
  PlusCircle,
  Megaphone,
  Building2,
  Users,
  Monitor,
  CheckCircle,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Assignment } from '../../types/assignment.types';

interface LiveProctoringHeaderProps {
  selectedRoom: 'LAB-302' | 'LAB-204' | 'LAB-401';
  onSelectRoom: (room: 'LAB-302' | 'LAB-204' | 'LAB-401') => void;
  selectedAssignment: Assignment | undefined;
  selectedAssignmentId: string;
  onSelectAssignmentId: (id: string) => void;
  assignments: Assignment[];
  loadingAssignments: boolean;
  secondsLeft: number;
  formatTime: (secs: number) => string;
  isPaused: boolean;
  onTogglePause: () => void;
  onExtendTime: (mins: number) => void;
  onOpenBroadcast: () => void;
  stats: {
    total: number;
    working: number;
    submitted: number;
    avgScore: string;
  };
}

export const LiveProctoringHeader: React.FC<LiveProctoringHeaderProps> = ({
  selectedRoom,
  onSelectRoom,
  selectedAssignment,
  selectedAssignmentId,
  onSelectAssignmentId,
  assignments,
  loadingAssignments,
  secondsLeft,
  formatTime,
  isPaused,
  onTogglePause,
  onExtendTime,
  onOpenBroadcast,
  stats,
}) => {
  return (
    <>
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-700 uppercase tracking-wider font-black">
              CA THI ĐANG DIỄN RA (LIVE)
            </span>
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <select
                aria-label="Chọn phòng máy thi"
                value={selectedRoom}
                onChange={(e) => onSelectRoom(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="LAB-302">Phòng Lab 302 (Toà Alpha - 24 máy)</option>
                <option value="LAB-204">Phòng Lab 204 (Toà Beta - 24 máy)</option>
                <option value="LAB-401">Phòng Lab 401 (Toà Gamma - 24 máy)</option>
              </select>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs">Khóa PE Kiosk</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedAssignment ? selectedAssignment.title : 'Kỳ thi Thực hành PE PRF192 - Spring 2025'}
            </h1>
            {selectedAssignment?.course && (
              <Badge variant="outline" className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0">
                {selectedAssignment.course.code}
              </Badge>
            )}
          </div>

          {/* Database Exam Selector Dropdown */}
          <div className="flex items-center gap-2 pt-1">
            <label htmlFor="live-monitor-assignment-select" className="text-xs font-semibold text-slate-600 shrink-0">
              Chọn Đề Thi:
            </label>
            <select
              id="live-monitor-assignment-select"
              aria-label="Chọn Đề Thi"
              value={selectedAssignmentId}
              onChange={(e) => onSelectAssignmentId(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-w-xs truncate"
            >
              {loadingAssignments && <option value="">Đang tải đề thi...</option>}
              {!loadingAssignments && assignments.length === 0 && (
                <option value="">Chưa có đề thi</option>
              )}
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.course?.code || 'PE'} - {a.testCases?.length || 0} tests)
                </option>
              ))}
            </select>
            {selectedAssignment && (
              <span className="text-[11px] text-slate-500">
                ({selectedAssignment.testCases?.length || 5} testcases)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Giám sát phòng thi: Theo dõi sinh viên đang làm bài và danh sách bài thi đã được nộp thành công.
          </p>
        </div>

        {/* Digital Countdown Timer & Quick Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-slate-950 text-white border border-slate-800 flex items-center gap-3 shadow-md">
            <Clock className={`w-5 h-5 ${secondsLeft < 600 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Thời gian còn lại
              </div>
              <div
                className={`font-mono text-2xl font-black tracking-widest ${
                  secondsLeft < 600 ? 'text-rose-400 animate-pulse' : 'text-white'
                }`}
              >
                {formatTime(secondsLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePause}
              title={isPaused ? 'Tiếp tục tính giờ' : 'Tạm dừng ca thi'}
              className="h-10 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Tiếp tục</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">Tạm dừng</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onExtendTime(5)}
              className="h-10 px-3 rounded-xl border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+5 phút</span>
            </Button>

            <Button
              size="sm"
              onClick={onOpenBroadcast}
              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Megaphone className="w-4 h-4" />
              <span>Phát loa</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng số thí sinh
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.total} <span className="text-xs text-slate-400 font-bold">máy</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              100% kết nối ổn định
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Đang làm bài
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">
              {stats.working} <span className="text-xs text-blue-400 font-bold">thí sinh</span>
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
              Đang code trên Sandbox
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Monitor className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Đã nộp bài
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">
              {stats.submitted} <span className="text-xs text-emerald-400 font-bold">thí sinh</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Đã chấm tự động xong
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
              Điểm trung bình
            </div>
            <div className="text-2xl font-black text-purple-900 mt-1 font-mono">
              {stats.avgScore} <span className="text-xs text-purple-400 font-bold font-sans">/ 10</span>
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5">
              Thang điểm 10.0 PE
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>
    </>
  );
};
