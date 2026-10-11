'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
      <Card className="p-5 rounded-2xl border-slate-200/90 shadow-2xs space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tỷ Lệ Lấp Đầy Lớp
          </span>
          <Badge
            variant="outline"
            className="text-xs font-bold font-mono px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            {enrolledCount} / {capacity} slot mở
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-indigo-700">{fillRate}%</span>
          <span className="text-xs font-semibold text-slate-500">sĩ số tối đa đã tham gia</span>
        </div>
        {/* Full-width progress bar */}
        <Progress value={Math.min(fillRate, 100)} className="h-2.5 bg-slate-100 [&>div]:bg-indigo-600" />
      </Card>

      {/* Telemetry 2: Tần suất chuyên cần */}
      <Card className="p-5 rounded-2xl border-slate-200/90 shadow-2xs space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tần Suất Chuyên Cần
          </span>
          <Badge
            variant="outline"
            className="text-xs font-bold font-mono px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            ● Đều đặn
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-emerald-600">{attendanceRate}%</span>
          <span className="text-xs font-semibold text-slate-500">
            sinh viên tham gia học đầy đủ
          </span>
        </div>
        {/* Full-width progress bar */}
        <Progress value={attendanceRate} className="h-2.5 bg-slate-100 [&>div]:bg-emerald-500" />
      </Card>
    </section>
  );
};

