'use client';

import React from 'react';
import { Copy, RefreshCw, QrCode } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface DynamicJoinCodeCardProps {
  joinCode: string;
  formattedCountdown: string;
  isEnrollOpen: boolean;
  onCopyCode: () => void;
  onRegenerateCode: () => void;
  onOpenQrModal: () => void;
  onToggleEnroll: () => void;
}

export const DynamicJoinCodeCard: React.FC<DynamicJoinCodeCardProps> = ({
  joinCode,
  formattedCountdown,
  isEnrollOpen,
  onCopyCode,
  onRegenerateCode,
  onOpenQrModal,
  onToggleEnroll,
}) => {
  return (
    <Card className="bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white rounded-2xl border-indigo-200/90 p-5 shadow-xs w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Code & Countdown */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 min-w-0">
          {/* Code Box */}
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block">
              Mã tham gia động (OTP)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-indigo-950 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-xs whitespace-nowrap">
                {joinCode || 'Chưa tạo mã'}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={onCopyCode}
                disabled={!joinCode}
                className="size-10 text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 rounded-xl border-indigo-200 shadow-2xs shrink-0"
                title="Sao chép mã"
              >
                <Copy className="size-4 shrink-0" />
              </Button>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="sm:border-l sm:border-indigo-200 sm:pl-5 min-w-0">
            <span className="text-xs font-semibold text-slate-500 block">Hiệu lực mã:</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`size-2 rounded-full shrink-0 ${isEnrollOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <Badge
                variant="outline"
                className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border-rose-200 font-mono whitespace-nowrap"
              >
                {joinCode && isEnrollOpen ? <>Hết hạn sau <strong className="ml-1">{formattedCountdown}</strong></> : 'Không có mã hoạt động'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Actions & Switch */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          {/* Regenerate Code button */}
          <Button
            variant="outline"
            onClick={onRegenerateCode}
            className="h-9 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold border-indigo-200 shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap"
            title={joinCode ? 'Tạo mã tham gia mới' : 'Tạo mã tham gia'}
          >
            <RefreshCw className="size-3.5 text-indigo-600 shrink-0" />
            <span>{joinCode ? 'Tạo mã mới' : 'Tạo mã tham gia'}</span>
          </Button>

          {/* Popover QR button */}
          <Button
            variant="outline"
            onClick={onOpenQrModal}
            disabled={!joinCode || !isEnrollOpen}
            className="h-9 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold border-indigo-200 shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap"
            title="Xem mã QR"
          >
            <QrCode className="size-3.5 text-indigo-600 shrink-0" />
            <span>Xem mã tham gia</span>
          </Button>

          {/* Nút Bật/Tắt tiếp nhận sinh viên using shadcn Switch */}
          <div className="h-9 flex items-center gap-2.5 bg-white px-3 rounded-xl border border-indigo-200 shadow-2xs">
            <span
              className={`text-xs font-bold whitespace-nowrap transition-colors ${
                isEnrollOpen ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {isEnrollOpen ? 'Đang nhận SV' : 'Đã khóa lớp'}
            </span>
            <Switch
              checked={isEnrollOpen}
              onCheckedChange={onToggleEnroll}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

