import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '../ui/Card';

export const RouterSettings: React.FC = () => (
  <Card className="space-y-3 border-emerald-200/80 bg-emerald-50/40 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <Cpu className="size-4 text-emerald-600" /> Cơ chế định tuyến AI Router (Tự động)
      </h2>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        <span className="size-2 rounded-full bg-emerald-600 animate-pulse" /> Đang hoạt động
      </span>
    </div>

    <p className="text-xs text-slate-600 leading-relaxed">
      Bộ định tuyến AI Router trên máy chủ đang tự động điều phối tải giữa các khóa Gemini trong kho. Bạn chỉ cần thêm khóa và bật trạng thái ở bảng trên, hệ thống sẽ tự động phân bổ lượt gọi, tự hạ nhiệt Cooldown và tự chuyển vùng khi chạm hạn mức.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white/90 p-2.5 text-slate-700 font-semibold shadow-2xs">
        <Zap className="size-4 text-emerald-600 shrink-0" />
        <span>Multi-Key Load Balancing</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white/90 p-2.5 text-slate-700 font-semibold shadow-2xs">
        <RefreshCwIcon className="size-4 text-blue-600 shrink-0" />
        <span>Tự động Failover (429)</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white/90 p-2.5 text-slate-700 font-semibold shadow-2xs">
        <ShieldCheck className="size-4 text-indigo-600 shrink-0" />
        <span>Mã hóa AES-256 GCM</span>
      </div>
    </div>
  </Card>
);

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M8 16H3v5"/>
  </svg>
);
