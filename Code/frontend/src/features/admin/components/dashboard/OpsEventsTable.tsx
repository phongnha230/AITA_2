'use client';

import { useState } from 'react';
import { cn } from '../../../../lib/cn';
import { OPS_EVENTS, type OpsEvent } from '../../mocks/ops.mock';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Card } from '../ui/Card';

type Filter = 'all' | 'warning' | 'security';

const LEVEL_TONE: Record<OpsEvent['level'], BadgeTone> = {
  Warning: 'admin',
  Info: 'info',
  Success: 'student',
  'Proctor Alert': 'warning',
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'warning', label: 'Cảnh báo' },
  { id: 'security', label: 'Bảo mật' },
];

const matches = (e: OpsEvent, f: Filter) =>
  f === 'all' || (f === 'warning' && e.level === 'Warning') || (f === 'security' && e.level === 'Proctor Alert');

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500';

export const OpsEventsTable: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const rows = OPS_EVENTS.filter((e) => matches(e, filter));

  return (
    <Card className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Cảnh báo &amp; nhật ký sự kiện vận hành gần nhất</h2>
          <p className="text-xs text-slate-500">Thông tin bảo mật, cảnh báo dung lượng quota và can thiệp tự động từ hạ tầng</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-xs text-slate-500">Bộ lọc:</span>
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={cn('rounded-lg px-3 py-1 text-xs font-semibold', filter === f.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className={cn(TH, 'rounded-l-xl')}>Thời gian</th>
              <th className={TH}>Cấp độ</th>
              <th className={TH}>Phân hệ</th>
              <th className={TH}>Nội dung chi tiết</th>
              <th className={TH}>Trạng thái</th>
              <th className={cn(TH, 'rounded-r-xl text-right')}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.time} className="border-b border-slate-100 text-sm transition-colors hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-semibold text-slate-500">{e.time}</td>
                <td className="px-4 py-4"><Badge tone={LEVEL_TONE[e.level]}>{e.level}</Badge></td>
                <td className="px-4 py-4 text-xs font-semibold text-slate-900">{e.subsystem}</td>
                <td className="min-w-[280px] px-4 py-4 text-xs leading-relaxed text-slate-700">{e.message}</td>
                <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-slate-600">{e.status}</td>
                <td className="px-4 py-4 text-right">
                  <button type="button" className={cn('whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold', e.level === 'Proctor Alert' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-100 text-blue-600 hover:bg-slate-200')}>
                    {e.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
