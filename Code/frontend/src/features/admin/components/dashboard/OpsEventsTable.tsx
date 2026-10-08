'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { OPS_EVENTS, type OpsEvent } from '../../mocks/ops.mock';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

export const OpsEventsTable: React.FC = () => {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<OpsEvent | null>(null);
  const rows = OPS_EVENTS.filter((e) => matches(e, filter));

  const act = (e: OpsEvent) => {
    if (e.level === 'Proctor Alert') {
      setSent((s) => new Set(s).add(e.time));
      toast.success('Đã gửi cảnh báo tới giám thị phòng LAB 304.');
    } else {
      setDetail(e);
    }
  };

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
        <Table className="min-w-[760px]">
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-24">Thời gian</TableHead>
              <TableHead className="w-28">Cấp độ</TableHead>
              <TableHead className="w-36">Phân hệ</TableHead>
              <TableHead>Nội dung chi tiết</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => {
              const done = sent.has(e.time);
              return (
                <TableRow key={e.time} className="text-sm">
                  <TableCell className="whitespace-nowrap font-mono text-xs font-semibold text-slate-500">{e.time}</TableCell>
                  <TableCell><Badge tone={LEVEL_TONE[e.level]}>{e.level}</Badge></TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">{e.subsystem}</TableCell>
                  <TableCell className="min-w-[280px] text-xs leading-relaxed text-slate-700">{e.message}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-semibold text-slate-600">{done ? 'Đã gửi giám thị' : e.status}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      disabled={done}
                      onClick={() => act(e)}
                      className={cn('whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50', e.level === 'Proctor Alert' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-slate-100 text-blue-600 hover:bg-slate-200')}
                    >
                      {done ? 'Đã gửi' : e.action}
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Modal open={Boolean(detail)} title={detail ? `${detail.action} — ${detail.subsystem}` : ''} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm text-slate-700">
            <p className="font-mono text-xs text-slate-500">{detail.time} • {detail.level} • {detail.status}</p>
            <p className="rounded-xl bg-slate-50 p-4 leading-relaxed">{detail.message}</p>
            <div className="flex justify-end"><Button onClick={() => setDetail(null)}>Đóng</Button></div>
          </div>
        )}
      </Modal>
    </Card>
  );
};
