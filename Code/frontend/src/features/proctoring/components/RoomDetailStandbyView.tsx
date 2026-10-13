'use client';

import React from 'react';
import { Radio, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoomDetailStandbyViewProps {
  roomName: string;
  onLoadMockStations: () => void;
}

export const RoomDetailStandbyView: React.FC<RoomDetailStandbyViewProps> = ({
  roomName,
  onLoadMockStations,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
        <Radio className="h-8 w-8 animate-pulse text-indigo-600" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">
        Phòng máy {roomName} đang ở trạng thái Chờ (Standby Ready)
      </h3>
      <p className="mt-1.5 max-w-lg mx-auto text-xs text-slate-500 leading-relaxed">
        Hạ tầng Sandbox &amp; Kiosk phòng thi đã sẵn sàng kết nối. Hiện tại chưa có thí sinh nào đăng nhập vào ca thi này.
      </p>

      <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-700 flex items-center gap-2 font-mono">
          <span className="text-slate-400 font-sans">Mã ca thi (Access code):</span>
          <strong className="text-indigo-600 font-bold">PE-PRF192-2026</strong>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMockStations}
          className="rounded-xl text-xs font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
          Nạp thí sinh mẫu kiểm thử
        </Button>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        💡 Khi sinh viên ngồi tại máy trạm đăng nhập vào portal và xác nhận ca thi, vị trí máy (PC-01, PC-02...) sẽ tự động xuất hiện tại đây theo thời gian thực.
      </p>
    </div>
  );
};
