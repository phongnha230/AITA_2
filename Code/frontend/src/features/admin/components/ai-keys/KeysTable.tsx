'use client';

import { ChevronLeft, ChevronRight, Copy, Trash2 } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Toggle } from '../ui/Toggle';
import { useToast } from '../ui/Toast';
import { copyText } from '../../../../lib/download';
import type { AiApiKey, AiProvider } from '../../types/admin.types';

interface KeysTableProps {
  keys: AiApiKey[];
  total: number;
  allCount: number;
  page: number;
  pages: number;
  canToggle: boolean;
  onPage: (page: number) => void;
  onToggle: (key: AiApiKey, next: boolean) => void;
  onDelete: (key: AiApiKey) => void;
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';
const BADGE: Record<AiProvider, string> = { OPENAI: 'OA', GEMINI: 'GG', ANTHROPIC: 'AN', DEEPSEEK: 'DS' };
const quotaColor = (pct: number) => (pct >= 80 ? 'bg-rose-600' : pct >= 60 ? 'bg-blue-600' : 'bg-emerald-600');
const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

export const KeysTable: React.FC<KeysTableProps> = ({ keys, total, allCount, page, pages, canToggle, onPage, onToggle, onDelete }) => {
  const toast = useToast();
  return (
  <Card className="overflow-hidden p-0">
    {keys.length === 0 ? (
      <EmptyState message="Chưa có khóa API nào trong kho." />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className={TH}>Khóa &amp; Provider</th>
              <th className={TH}>Mục đích sử dụng</th>
              <th className={TH}>Rate limit (RPM/TPM)</th>
              <th className={TH}>Hạn mức sử dụng (Quota)</th>
              <th className={TH}>Độ trễ</th>
              <th className={TH}>Trạng thái</th>
              <th className={cn(TH, 'text-right')}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const pct = Math.round((k.currentRequestsToday / k.dailyRequestLimit) * 100);
              return (
                <tr key={k.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">{BADGE[k.provider]}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{k.keyAlias}</p>
                        <button
                          type="button"
                          title="Sao chép khóa (đã che)"
                          onClick={async () => ((await copyText(k.keyPreview ?? `…${k.keyHint}`)) ? toast.success('Đã sao chép khóa (đã che).') : toast.error('Trình duyệt chặn sao chép.'))}
                          className="mt-1 inline-flex items-center gap-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 hover:bg-slate-200"
                        >
                          {k.keyPreview ?? `…${k.keyHint}`} <Copy className="h-3 w-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{k.purposeTitle ?? '—'}</span>
                    {k.purposeNote && <p className="mt-1 text-[11px] text-slate-500">{k.purposeNote}</p>}
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm font-bold text-slate-900">{k.rpmLimit} RPM</p>
                    {k.tpmLimit && <p className="text-[11px] text-slate-500">{k.tpmLimit.toLocaleString('en-US')} TPM</p>}
                  </td>
                  <td className="w-60 px-4 py-5">
                    <div className="mb-1 flex justify-between text-[11px] font-semibold">
                      <span className={pct >= 80 ? 'text-rose-600' : 'text-slate-700'}>{pct}% Quota</span>
                      <span className="text-slate-500">{compact(k.currentRequestsToday)} / {compact(k.dailyRequestLimit)} req</span>
                    </div>
                    <ProgressBar value={pct} color={quotaColor(pct)} />
                  </td>
                  <td className="px-4 py-5">
                    {k.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> {k.latencyMs ?? '—'}ms
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Standby ({k.latencyMs ?? '—'}ms)</span>
                    )}
                  </td>
                  <td className="px-4 py-5">
                    <Toggle
                      checked={k.isActive}
                      disabled={!canToggle}
                      label={`Bật/tắt ${k.keyAlias}`}
                      title={canToggle ? undefined : 'Backend chưa có API bật/tắt khóa'}
                      onChange={(next) => onToggle(k, next)}
                    />
                  </td>
                  <td className="px-4 py-5 text-right">
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
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-3 text-xs text-slate-500 sm:flex-row">
      <span>
        Hiển thị {keys.length} trong tổng số {total} khóa API khả dụng • <span className="font-semibold text-emerald-600">Tất cả gateway đã sẵn sàng</span>
        {allCount !== total && ` (lọc từ ${allCount})`}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex items-center rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Trước</button>
        {Array.from({ length: Math.min(pages, 3) }, (_, i) => i + 1).map((p) => (
          <button key={p} type="button" onClick={() => onPage(p)} className={cn('h-7 min-w-7 rounded-lg px-2 font-semibold', p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100')}>{p}</button>
        ))}
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="flex items-center rounded-lg px-2 py-1 font-semibold hover:bg-slate-100 disabled:opacity-40">Sau <ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  </Card>
  );
};
