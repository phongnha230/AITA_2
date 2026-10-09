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
        <EmptyState message="Chưa có khóa API nào trong kho." />
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>Khóa &amp; Provider</TableHead>
                <TableHead>Mục đích sử dụng</TableHead>
                <TableHead>Rate limit (RPM/TPM)</TableHead>
                <TableHead>Hạn mức sử dụng (Quota)</TableHead>
                <TableHead>Độ trễ</TableHead>
                <TableHead>Trạng thái</TableHead>
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
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-block rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{k.purposeTitle ?? '—'}</span>
                      {k.purposeNote && <p className="mt-1 text-[11px] text-slate-500">{k.purposeNote}</p>}
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-bold text-slate-900">{k.rpmLimit} RPM</p>
                      {k.tpmLimit && <p className="text-[11px] text-slate-500">{k.tpmLimit.toLocaleString('en-US')} TPM</p>}
                    </TableCell>
                    <TableCell className="w-60 py-4">
                      <div className="mb-1 flex justify-between text-[11px] font-semibold">
                        <span className={pct >= 80 ? 'text-rose-600' : 'text-slate-700'}>{pct}% Quota</span>
                        <span className="text-slate-500">{compact(k.currentRequestsToday)} / {compact(k.dailyRequestLimit)} req</span>
                      </div>
                      <ProgressBar value={pct} color={quotaColor(pct)} />
                    </TableCell>
                    <TableCell className="py-4">
                      {k.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> {k.latencyMs ?? '—'}ms
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Standby ({k.latencyMs ?? '—'}ms)</span>
                      )}
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
                        <Trash2 className="h-4 w-4" />
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
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Trang trước" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          <span className="font-semibold">Trang {page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Trang sau" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </Card>
  );
};
