import React from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import type { AiApiKey, AiProvider } from '../../types/admin.types';

interface TrafficStatsProps {
  keys?: AiApiKey[];
}

const PROVIDERS: { id: AiProvider; label: string; color: string }[] = [
  { id: 'GEMINI', label: 'Gemini', color: 'bg-emerald-600' },
  { id: 'OPENAI', label: 'OpenAI (legacy)', color: 'bg-slate-400' },
];

export const TrafficStats: React.FC<TrafficStatsProps> = ({ keys = [] }) => {
  const providerStats = PROVIDERS.map((p) => {
    const pKeys = keys.filter((k) => k.provider === p.id);
    const reqCount = pKeys.reduce((s, k) => s + (k.currentRequestsToday || 0), 0);
    const activeCount = pKeys.filter((k) => k.isActive).length;
    return {
      ...p,
      reqCount,
      activeCount,
      totalCount: pKeys.length,
    };
  });

  const maxReq = Math.max(1, ...providerStats.map((s) => s.reqCount));
  const totalRequestsToday = keys.reduce((s, k) => s + (k.currentRequestsToday || 0), 0);
  const estimatedTokens = (totalRequestsToday * 1250).toLocaleString('en-US');

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Thống kê lưu lượng</h2>
        <BarChart3 className="size-5 text-slate-400" />
      </div>
      <div className="flex h-36 items-end justify-around gap-3 rounded-xl bg-slate-50 p-4">
        {providerStats.map((b) => {
          // If no requests yet, give a subtle proportional bar based on active key count
          const heightPct = b.reqCount > 0
            ? Math.max(15, Math.round((b.reqCount / maxReq) * 100))
            : b.activeCount > 0 ? 25 : 8;
          return (
            <div key={b.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`w-full max-w-[44px] rounded-t-md transition-all ${b.color}`}
                style={{ height: `${heightPct}%` }}
                title={`${b.label}: ${b.reqCount} requests (${b.activeCount} keys active)`}
              />
              <span className="text-xs font-medium text-slate-500">{b.label}</span>
            </div>
          );
        })}
      </div>
      <dl className="space-y-2 text-xs">
        <div className="flex justify-between">
          <dt className="text-slate-500">Tổng tokens 24h ước tính</dt>
          <dd className="font-bold text-slate-900">{estimatedTokens} tokens</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Lưu lượng hôm nay</dt>
          <dd className="font-bold text-emerald-600">{totalRequestsToday} requests</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Số khóa đang trực tuyến</dt>
          <dd className="font-bold text-slate-900">
            {keys.filter((k) => k.isActive).length} / {keys.length} keys
          </dd>
        </div>
      </dl>
      <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Tự động xáo trộn chữ ký &amp; Failover</strong>
          <br />Mã hóa AES-256 an toàn và luân chuyển khóa theo least-loaded.
        </span>
      </p>
    </Card>
  );
};
