'use client';

import React from 'react';
import { Radio, Users, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RoomListKpiSectionProps {
  totalLiveRooms: number;
  totalStudents: number;
  submissionRate: number;
  totalSubmitted: number;
}

export const RoomListKpiSection: React.FC<RoomListKpiSectionProps> = ({
  totalLiveRooms,
  totalStudents,
  submissionRate,
  totalSubmitted,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phòng đang LIVE</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              {totalLiveRooms} <span className="text-sm font-medium text-slate-500">phòng</span>
            </h3>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang truyền dữ liệu thời gian thực
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Radio className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thí sinh dự thi</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              {totalStudents} <span className="text-sm font-medium text-slate-500">thí sinh</span>
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              Phân bổ qua {totalLiveRooms} phòng thi
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiến độ thu bài</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              {submissionRate}%
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              {totalSubmitted} / {totalStudents} thí sinh đã nộp bài
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/90 bg-white shadow-2xs">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hạ tầng Kiosk &amp; Sandbox</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">
              100%
            </h3>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">
              0 cảnh báo vi phạm mạng
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
