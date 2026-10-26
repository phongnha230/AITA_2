'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Toggle } from '../ui/Toggle';
import { useToast } from '../ui/Toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { copyText } from '../../../../lib/download';
import { formatDateTime } from '@/lib/formatDate';
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

const BADGE: Record<AiProvider, string> = { OPENAI: 'OA', GEMINI: 'GG', ANTHROPIC: 'AN', DEEPSEEK: 'DS' };
const quotaColor = (pct: number) => (pct >= 80 ? 'bg-rose-600' : pct >= 60 ? 'bg-blue-600' : 'bg-emerald-600');
const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

export const KeysTable: React.FC<KeysTableProps> = ({ keys, total, allCount, page, pages, canToggle, onPage, onToggle, onDelete }) => {
  const toast = useToast();
  return (
    <Card className="overflow-hidden p-0">
      {keys.length === 0 ? (
        <EmptyState message={allCount > 0 ? 'Không tìm thấy khóa API nào phù hợp với bộ lọc.' : 'Chưa có khóa API nào trong kho.'} />
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                {['Khóa & Provider', 'Mục đích sử dụng', 'Rate limit (RPM/TPM)', 'Hạn mức sử dụng (Quota)', 'Nguồn / sức khỏe', 'Trạng thái'].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
                <TableHead className="text-right">Xóa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => {
                const pct = Math.round((k.currentRequestsToday / k.dailyRequestLimit) * 100);
                return (
                  <TableRow key={k.id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">{BADGE[k.provider]}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{k.keyAlias}</p>
                          <button
                            type="button"
                            title="Sao chép khóa (đã che)"
                            onClick={async () => ((await copyText(k.keyPreview ?? `…${k.keyHint}`)) ? toast.success('Đã sao chép khóa (đã che).') : toast.error('Trình duyệt chặn sao chép.'))}
                            className="mt-1 inline-flex items-center gap-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 hover:bg-slate-200"
                          >
                            {k.keyPreview ?? `…${k.keyHint}`} <Copy className="size-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{k.purposeTitle ?? '—'}</span>
                      {k.purposeNote && <p className="mt-1 text-xs text-slate-500">{k.purposeNote}</p>}
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-bold text-slate-900">{k.rpmLimit} RPM</p>
                      {k.tpmLimit && <p className="text-xs text-slate-500">{k.tpmLimit.toLocaleString('en-US')} TPM</p>}
                    </TableCell>
                    <TableCell className="w-60 py-4">
                      <div className="mb-1 flex justify-between text-xs font-semibold">
                        <span className={pct >= 80 ? 'text-rose-600' : 'text-slate-700'}>{pct}% Quota</span>
                        <span className="text-slate-500">{compact(k.currentRequestsToday)} / {compact(k.dailyRequestLimit)} req</span>
                      </div>
                      <ProgressBar value={pct} label={`Quota của ${k.keyAlias}`} color={quotaColor(pct)} />
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-xs font-semibold text-slate-600">Dashboard pool</p>
                      {k.provider !== 'GEMINI' && (
                        <p className="mt-1 text-xs text-slate-500">Không tham gia Gemini pool</p>
                      )}
                      <span className={cn(
                        'mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        k.availabilityStatus === 'AVAILABLE' && 'bg-emerald-50 text-emerald-700',
                        k.availabilityStatus === 'COOLDOWN' && 'bg-amber-50 text-amber-700',
                        k.availabilityStatus === 'QUOTA_EXHAUSTED' && 'bg-rose-50 text-rose-700',
                        k.availabilityStatus === 'DISABLED' && 'bg-slate-100 text-slate-500',
                      )}>{k.availabilityStatus}</span>
                      {k.cooldownUntil && (
                        <p className="mt-1 text-xs text-amber-700">
                          Cooldown đến {formatDateTime(k.cooldownUntil)}
                        </p>
                      )}
                      {k.lastErrorCode && <p className="mt-1 text-xs text-rose-600">{k.lastErrorCode}</p>}
                    </TableCell>
                    <TableCell className="py-4">
                      <Toggle
                        checked={k.isActive}
                        disabled={!canToggle}
                        label={`Bật/tắt ${k.keyAlias}`}
                        title={canToggle ? undefined : 'Backend chưa có API bật/tắt khóa'}
                        onChange={(next) => onToggle(k, next)}
                      />
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(k)}
                        aria-label={`Xóa khóa ${k.keyAlias}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row">
        <span>Đang hiển thị {keys.length} / {total} khóa {allCount > total ? `(lọc từ ${allCount} khóa)` : ''}</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Trang trước" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft className="size-4" /></button>
          <span className="font-semibold">Trang {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Trang sau" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </Card>
  );
};
