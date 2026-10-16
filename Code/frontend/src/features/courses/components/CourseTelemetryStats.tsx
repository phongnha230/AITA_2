'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CourseTelemetryStatsProps {
  enrolledCount: number;
  capacity?: number;
}

export const CourseTelemetryStats: React.FC<CourseTelemetryStatsProps> = ({
  enrolledCount,
  capacity,
}) => {
  const fillRate = capacity && capacity > 0 ? Math.round((enrolledCount / capacity) * 100) : null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Telemetry 1: Tỷ lệ lấp đầy lớp */}
      <Card className="p-5 rounded-2xl border-slate-200/90 shadow-2xs space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sĩ Số Lớp
          </span>
          <Badge
            variant="outline"
            className="text-xs font-bold font-mono px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            {capacity && capacity > 0 ? `${enrolledCount} / ${capacity} chỗ` : `${enrolledCount} sinh viên`}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-indigo-700">{enrolledCount}</span>
          <span className="text-xs font-semibold text-slate-500">
            {fillRate === null ? 'sinh viên đã ghi danh • sức chứa chưa cấu hình' : `sinh viên đã ghi danh • ${fillRate}% sức chứa`}
          </span>
        </div>
        {fillRate !== null && <Progress value={Math.min(fillRate, 100)} className="h-2.5 bg-slate-100 [&>div]:bg-indigo-600" />}
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
            Chưa có dữ liệu
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-400">—</span>
          <span className="text-xs font-semibold text-slate-500">
            Chưa có dữ liệu điểm danh để tính chuyên cần
          </span>
        </div>
      </Card>
    </section>
  );
};

