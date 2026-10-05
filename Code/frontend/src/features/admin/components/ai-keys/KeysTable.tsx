'use client';

import { Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Toggle } from '../ui/Toggle';
import type { AiApiKey } from '../../types/admin.types';

interface KeysTableProps {
  keys: AiApiKey[];
  onDelete: (key: AiApiKey) => void;
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';

const quotaColor = (pct: number) => (pct >= 80 ? 'bg-rose-600' : pct >= 60 ? 'bg-amber-500' : 'bg-blue-600');

export const KeysTable: React.FC<KeysTableProps> = ({ keys, onDelete }) => (
  <Card className="overflow-hidden p-0">
    {keys.length === 0 ? (
      <EmptyState message="Chưa có khóa API nào trong kho." />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className={TH}>Khóa &amp; Provider</th>
              <th className={TH}>Rate limit (RPM)</th>
              <th className={TH}>Hạn mức sử dụng (Quota/ngày)</th>
              <th className={TH}>Lỗi liên tiếp</th>
              <th className={TH}>Trạng thái</th>
              <th className={cn(TH, 'text-right')}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const pct = Math.round((k.currentRequestsToday / k.dailyRequestLimit) * 100);
              return (
                <tr key={k.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                        {k.provider === 'GEMINI' ? 'GG' : 'OA'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{k.keyAlias}</p>
                        <p className="truncate font-mono text-[11px] text-slate-500">…{k.keyHint}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{k.rpmLimit} RPM</td>
                  <td className="w-64 px-4 py-4">
                    <div className="mb-1 flex justify-between text-[11px] font-semibold">
                      <span className={pct >= 80 ? 'text-rose-600' : 'text-slate-600'}>{pct}% Quota</span>
                      <span className="text-slate-500">{k.currentRequestsToday} / {k.dailyRequestLimit}</span>
                    </div>
                    <ProgressBar value={pct} color={quotaColor(pct)} />
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={k.consecutiveFailures >= 3 ? 'admin' : k.consecutiveFailures > 0 ? 'warning' : 'student'}>{k.consecutiveFailures}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Toggle checked={k.isActive} disabled label={`Trạng thái ${k.keyAlias}`} title="Chưa có API bật/tắt khóa" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button type="button" onClick={() => onDelete(k)} aria-label={`Xóa ${k.keyAlias}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);
