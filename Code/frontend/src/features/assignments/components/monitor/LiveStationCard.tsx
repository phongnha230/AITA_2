'use client';

import React from 'react';
import { CheckCircle2, Hourglass, AlertCircle, ShieldCheck } from 'lucide-react';
import type { StudentExamStation } from '../../mocks/live-proctoring.mock';

interface LiveStationCardProps {
  station: StudentExamStation;
  onInspect: (station: StudentExamStation) => void;
  onForceSubmit: (studentId: string) => void;
}

export const LiveStationCard: React.FC<LiveStationCardProps> = ({
  station,
  onInspect,
  onForceSubmit,
}) => {
  const isSubmitted = station.status === 'submitted';
  const isNearAttemptLimit = !isSubmitted && station.testAttempts >= 8;

  return (
    <div
      className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between relative group ${
        isSubmitted
          ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/30 to-white'
          : isNearAttemptLimit
          ? 'border-amber-300 hover:border-amber-400 bg-gradient-to-b from-amber-50/20 to-white'
          : 'border-slate-200 hover:border-blue-400'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white">
            {station.pcNumber}
          </span>

          {isSubmitted ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>ĐÃ NỘP BÀI</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Hourglass className="w-3 h-3 text-blue-600" />
              <span>ĐANG LÀM</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              isSubmitted
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
            }`}
          >
            {station.initials}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-xs text-slate-900 truncate">
              {station.studentName}
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              {station.studentCode}
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl text-xs space-y-1.5 ${
            isSubmitted
              ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-900'
              : 'bg-slate-50 border border-slate-100 text-slate-700'
          }`}
        >
          {isSubmitted ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-700">Điểm số chính thức:</span>
                <span className="font-black text-sm text-emerald-800 font-mono">
                  {station.score?.toFixed(1)} / 10.0
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-600">
                <span>Nộp bài lúc:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {station.submittedAt}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-600">
                <span>Testcase đạt:</span>
                <span className="font-bold">
                  {station.passedCases}/{station.totalCases} cases
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Tiến độ hiện tại:</span>
                <span className="font-bold text-blue-700">
                  Đạt {station.passedCases}/{station.totalCases} testcase
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Lần nộp thử Sandbox:</span>
                <span
                  className={`font-mono font-bold ${
                    station.testAttempts >= 8 ? 'text-amber-700' : 'text-slate-800'
                  }`}
                >
                  {station.testAttempts} / {station.maxAttempts} lần
                </span>
              </div>
              {isNearAttemptLimit && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded px-1.5 py-0.5">
                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Cảnh báo: Sắp hết 10 lượt test!</span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 truncate pt-0.5 border-t border-slate-100">
                Đang làm: {station.currentProblem}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-mono">Bắt đầu: {station.startTime}</span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onInspect(station)}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
          >
            Soi máy
          </button>
          {!isSubmitted ? (
            <button
              type="button"
              onClick={() => onForceSubmit(station.id)}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
            >
              Thu bài
            </button>
          ) : (
            <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Đã khóa bài
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
