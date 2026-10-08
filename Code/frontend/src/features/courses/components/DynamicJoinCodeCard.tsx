'use client';

import React from 'react';
import { Copy, RefreshCw, QrCode } from 'lucide-react';

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
    <section className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 rounded-2xl border border-indigo-200/90 p-5 shadow-xs w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Code & Countdown */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 min-w-0">
          {/* Code Box */}
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
              Mã tham gia động (OTP)
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-indigo-950 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-xs whitespace-nowrap">
                {joinCode}
              </span>
              <button
                onClick={onCopyCode}
                className="p-2 text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 rounded-xl border border-indigo-200 transition shadow-2xs shrink-0"
                title="Sao chép mã"
              >
                <Copy className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="sm:border-l sm:border-indigo-200 sm:pl-5 min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 block">Thời hạn mã:</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-xl border border-rose-200 font-mono whitespace-nowrap">
                Mã đổi sau <strong>{formattedCountdown}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Rock-Solid iOS Style Toggle Switch */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          {/* Regenerate Code button */}
          <button
            onClick={onRegenerateCode}
            className="h-9 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap"
            title="Đổi mã mới"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Regenerate Code</span>
          </button>

          {/* Popover QR button */}
          <button
            onClick={onOpenQrModal}
            className="h-9 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 transition shadow-2xs inline-flex items-center gap-1.5 whitespace-nowrap"
            title="Xem mã QR"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Chiếu Mã QR</span>
          </button>

          {/* Nút Bật/Tắt tiếp nhận sinh viên (Rock-solid iOS Switch) */}
          <div className="h-9 flex items-center gap-2.5 bg-white px-3 rounded-xl border border-indigo-200 shadow-2xs">
            <span
              className={`text-xs font-bold whitespace-nowrap transition-colors ${
                isEnrollOpen ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {isEnrollOpen ? 'Đang nhận SV' : 'Đã khóa lớp'}
            </span>
            <button
              onClick={onToggleEnroll}
              type="button"
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnrollOpen ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isEnrollOpen}
              title="Bật/Tắt nhận sinh viên"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isEnrollOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
