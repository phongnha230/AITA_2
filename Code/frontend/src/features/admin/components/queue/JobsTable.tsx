'use client';

import { useMemo, useState } from 'react';
import { RotateCcw, Search, SquareTerminal } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { EmptyState } from '../../../../components/feedback/EmptyState';
import { QUEUE_JOBS, type JobState } from '../../mocks/ops.mock';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { inputClass } from '../ui/FormField';

const STATE_TONE: Record<JobState, BadgeTone> = { Processing: 'info', Queued: 'warning', Failed: 'admin', Completed: 'student' };
const BAR_COLOR: Record<JobState, string> = { Processing: 'bg-blue-600', Queued: 'bg-slate-300', Failed: 'bg-rose-600', Completed: 'bg-emerald-600' };
const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';

export const JobsTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState('');
  const [state, setState] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return QUEUE_JOBS.filter(
      (j) =>
        (!queue || j.queue === queue) &&
        (!state || j.state === state) &&
        (!q || `${j.id} ${j.name} ${j.student} ${j.course}`.toLowerCase().includes(q)),
    );
  }, [search, queue, state]);

  return (
    <Card className="space-y-4 p-0">
      <div className="flex flex-col justify-between gap-3 px-6 pt-6 xl:flex-row xl:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Bảng điều phối jobs thời gian thực</h2>
          <p className="text-xs text-slate-500">Chi tiết các phiên biên dịch GCC/Python/Java và chấm thang đo tiêu chí AI</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm Job ID, sinh viên, mã bài..." className={cn(inputClass, 'pl-9 sm:w-64')} />
          </div>
          <select value={queue} onChange={(e) => setQueue(e.target.value)} className={cn(inputClass, 'sm:w-48')} aria-label="Lọc hàng đợi">
            <option value="">Tất cả hàng đợi</option>
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
          <table className="w-full min-w-[980px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={TH}>Job ID</th>
                <th className={TH}>Tên job</th>
                <th className={TH}>Sinh viên &amp; môn thi</th>
                <th className={TH}>Hàng đợi</th>
                <th className={TH}>Tiến trình</th>
                <th className={TH}>Thời gian</th>
                <th className={TH}>Trạng thái</th>
                <th className={cn(TH, 'text-right')}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => (
                <tr key={j.id} className={cn('border-b border-slate-100 hover:bg-slate-50', j.state === 'Failed' && 'bg-rose-50/50')}>
                  <td className="px-4 py-4"><span className="block max-w-[120px] truncate font-mono text-xs font-semibold text-blue-600">{j.id}</span></td>
                  <td className="px-4 py-4"><p className="font-mono text-xs font-semibold text-slate-900">{j.name}</p><p className="text-[11px] text-slate-500">{j.detail}</p></td>
                  <td className="px-4 py-4"><p className="text-sm font-semibold text-slate-900">{j.student}</p><p className="text-[11px] text-slate-500">{j.course}</p></td>
                  <td className="px-4 py-4"><Badge tone={j.queue === 'ai-rubric-queue' ? 'violet' : 'info'}>{j.queue}</Badge></td>
                  <td className="w-52 px-4 py-4">
                    <p className="mb-1 flex justify-between text-[11px] font-semibold text-slate-600"><span>{j.progressLabel}</span><span>{j.percent}%</span></p>
                    <ProgressBar value={j.percent} color={BAR_COLOR[j.state]} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-slate-600">{j.duration}</td>
                  <td className="px-4 py-4"><Badge tone={STATE_TONE[j.state]} dot>{j.state}</Badge></td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1 text-slate-400">
                      <button type="button" aria-label="Xem log terminal" className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-700"><SquareTerminal className="h-4 w-4" /></button>
                      {j.state === 'Failed' && <button type="button" aria-label="Retry job" className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"><RotateCcw className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">Hiển thị {rows.length} / {QUEUE_JOBS.length} jobs mẫu • Worker pool đang vận hành 16 luồng phân tán</p>
    </Card>
  );
};
