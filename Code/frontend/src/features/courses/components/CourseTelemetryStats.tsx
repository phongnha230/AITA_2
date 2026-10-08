'use client';

import React from 'react';

interface CourseTelemetryStatsProps {
  enrolledCount?: number;
  capacity?: number;
  attendanceRate?: number;
}

export const CourseTelemetryStats: React.FC<CourseTelemetryStatsProps> = ({
  enrolledCount = 38,
  capacity = 40,
  attendanceRate = 94.5,
}) => {
  const fillRate = Math.round((enrolledCount / capacity) * 100);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Telemetry 1: Tỷ lệ lấp đầy lớp */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tỷ Lệ Lấp Đầy Lớp
          </span>
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {enrolledCount} / {capacity} slot mở
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-blue-700">{fillRate}%</span>
          <span className="text-xs font-semibold text-slate-500">sĩ số tối đa đã tham gia</span>
        </div>
        {/* Full-width progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(fillRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Telemetry 2: Tần suất chuyên cần */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tần Suất Chuyên Cần
          </span>
          <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● Đều đặn
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-emerald-600">{attendanceRate}%</span>
          <span className="text-xs font-semibold text-slate-500">
            sinh viên tham gia học đầy đủ
          </span>
        </div>
        {/* Full-width progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>
    </section>
  );
};
