'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpToLine, RotateCcw, Search, SquareTerminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import type { JobState, QueueJob } from '../../types/admin.types';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Card } from '../ui/Card';
import { inputClass } from '../ui/FormField';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATE_TONE: Record<JobState, BadgeTone> = { Processing: 'info', Queued: 'warning', Failed: 'admin', Completed: 'student' };
const BAR_COLOR: Record<JobState, string> = { Processing: 'bg-blue-600', Queued: 'bg-slate-300', Failed: 'bg-rose-600', Completed: 'bg-emerald-600' };
const PAGE_SIZE = 5;

interface JobsTableProps {
  jobs: QueueJob[];
  onRetry: (id: string) => void;
  onPrioritize: (id: string) => void;
  onTerminal: (job: QueueJob) => void;
  /** Lets the page force a state filter (e.g. "Chi tiết lỗi" → Failed). `nonce` re-applies the same value. */
  forcedState?: { value: JobState | ''; nonce: number };
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, onRetry, onPrioritize, onTerminal, forcedState }) => {
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (forcedState) setState(forcedState.value);
  }, [forcedState]);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [search, queue, state]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!queue || j.queue === queue) &&
        (!state || j.state === state) &&
        (!q || `${j.id} ${j.name} ${j.student} ${j.course}`.toLowerCase().includes(q)),
    );
  }, [jobs, search, queue, state]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = jobs.filter((j) => j.state !== 'Completed').length;

  return (
    <Card className="space-y-4 p-0">
      <div className="flex flex-col justify-between gap-3 px-6 pt-6 xl:flex-row xl:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            Bảng điều phối jobs thời gian thực <span className="h-2 w-2 rounded-full bg-emerald-600" />
          </h2>
          <p className="text-xs text-slate-500">Chi tiết các phiên biên dịch GCC/Python/Java và chấm thang đo tiêu chí AI</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm Job ID, sinh viên, mã bài..." className={cn(inputClass, 'pl-9 sm:w-64')} />
          </div>
          <select value={queue} onChange={(e) => setQueue(e.target.value)} className={cn(inputClass, 'sm:w-52')} aria-label="Lọc hàng đợi">
            <option value="">Tất cả hàng đợi (Queues)</option>
            <option value="docker-eval-queue">docker-eval-queue</option>
            <option value="ai-rubric-queue">ai-rubric-queue</option>
          </select>
          <select value={state} onChange={(e) => setState(e.target.value)} className={cn(inputClass, 'sm:w-44')} aria-label="Lọc trạng thái">
            <option value="">Tất cả trạng thái</option>
            {(['Processing', 'Queued', 'Failed', 'Completed'] as JobState[]).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState message="Không có job khớp bộ lọc." />
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-28">Job ID</TableHead>
                <TableHead>Tên job</TableHead>
                <TableHead>Sinh viên &amp; môn thi</TableHead>
                <TableHead>Hàng đợi</TableHead>
                <TableHead className="w-56">Tiến trình</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((j) => (
                <TableRow key={j.id} className={cn(j.state === 'Failed' && 'bg-rose-50/50')}>
                  <TableCell><span className="block max-w-[120px] truncate font-mono text-xs font-semibold text-blue-600">{j.id}</span></TableCell>
                  <TableCell><p className="font-mono text-xs font-semibold text-slate-900">{j.name}</p><p className="text-[11px] text-slate-500">{j.detail}</p></TableCell>
                  <TableCell><p className="text-sm font-semibold text-slate-900">{j.student}</p><p className="text-[11px] text-slate-500">{j.course}</p></TableCell>
                  <TableCell><Badge tone={j.queue === 'ai-rubric-queue' ? 'violet' : 'info'}>{j.queue}</Badge></TableCell>
                  <TableCell className="w-52">
                    <p className="mb-1 flex justify-between text-[11px] font-semibold text-slate-600"><span>{j.progressLabel}</span><span>{j.percent}%</span></p>
                    <ProgressBar value={j.percent} color={BAR_COLOR[j.state]} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-slate-600">{j.duration}</TableCell>
                  <TableCell><Badge tone={STATE_TONE[j.state]} dot>{j.state}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 text-slate-400">
                      <button type="button" onClick={() => onTerminal(j)} aria-label="Xem log terminal" title="Xem log terminal" className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-700"><SquareTerminal className="h-4 w-4" /></button>
                      {j.state === 'Queued' && (
                        <button type="button" onClick={() => onPrioritize(j.id)} aria-label="Ưu tiên job" title="Đẩy lên đầu hàng đợi" className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-700"><ArrowUpToLine className="h-4 w-4" /></button>
                      )}
                      {j.state === 'Failed' && (
                        <button type="button" onClick={() => onRetry(j.id)} aria-label="Retry job" title="Retry job" className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row">
        <span>
          Hiển thị <strong>{rows.length}</strong> trên <strong>{filtered.length === jobs.length ? active : filtered.length}</strong> active/queued jobs • Worker pool đang vận hành 16 luồng phân tán
        </span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg px-3 py-1.5 font-semibold hover:bg-slate-100 disabled:opacity-40">Trước</button>
          {Array.from({ length: Math.min(pages, 3) }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)} className={cn('h-8 min-w-8 rounded-lg px-2 font-semibold', p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100')}>{p}</button>
          ))}
          <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-lg px-3 py-1.5 font-semibold hover:bg-slate-100 disabled:opacity-40">Tiếp</button>
        </div>
      </div>
    </Card>
  );
};
