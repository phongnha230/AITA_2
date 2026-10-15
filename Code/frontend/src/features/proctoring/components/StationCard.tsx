'use client';

import React from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StudentExamStation } from '../types/proctoring.types';

interface StationCardProps {
  station: StudentExamStation;
  onInspect: () => void;
}

export function StationCard({ station, onInspect }: StationCardProps) {
  const isSubmitted = station.status === 'submitted';

  return (
    <button
      type="button"
      onClick={onInspect}
      className={`w-full text-left group relative cursor-pointer rounded-2xl border p-4 transition-colors duration-150 hover:-translate-y-0.5 hover:shadow-md ${
        isSubmitted
          ? 'border-emerald-200/90 bg-gradient-to-b from-emerald-50/20 via-white to-white'
          : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      {/* Top Header of Card */}
      <div className="flex items-center justify-between">
        <span
          className={`flex h-7 px-2 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${
            isSubmitted
              ? 'bg-slate-900 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {station.pcNumber}
        </span>

        {isSubmitted ? (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
            ĐÃ NỘP BÀI
          </Badge>
        ) : (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            ĐANG LÀM
          </Badge>
        )}
      </div>

      {/* Student Details */}
      <div className="mt-3 flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
            isSubmitted
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {station.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {station.studentName}
          </p>
          <p className="font-mono text-[11px] text-slate-500">
            {station.studentCode}
          </p>
        </div>
      </div>

      {/* Status metrics footer */}
      <div className="mt-3.5 border-t border-slate-100 pt-2.5 text-[11px]">
        {isSubmitted ? (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Điểm số chính thức:</span>
              <span className="font-mono font-black text-emerald-700">
                {station.score !== undefined ? `${station.score} / 10.0` : '10.0 / 10.0'}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Nộp bài lúc:</span>
              <span className="font-mono font-medium text-slate-700">
                {station.submittedAt || '08:38:22'}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Tiến độ hiện tại:</span>
              <span className="font-mono font-bold text-indigo-700">
                Đạt {station.passedCases}/{station.totalCases} testcase
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Lần nộp thử Sandbox:</span>
              <span className="font-mono font-medium text-slate-700">
                {station.testAttempts} / {station.maxAttempts} lần
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover action cue */}
      <div className="mt-2.5 flex items-center justify-center text-[10px] font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
        <Eye className="mr-1 h-3 w-3" />
        Nhấp để soi chi tiết máy &amp; log Sandbox
      </div>
    </button>
  );
}
