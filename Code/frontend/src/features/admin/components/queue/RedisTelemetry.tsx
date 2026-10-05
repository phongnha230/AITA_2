import { Brush, Cpu, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

const METRICS = [
  { label: 'CPU Redis Core', value: '4.2%', note: 'Tối ưu • dưới tải', tone: 'text-slate-900' },
  { label: 'Độ trễ Ping (RTT)', value: '0.8 ms', note: 'Direct socket IPC', tone: 'text-emerald-600' },
  { label: 'Kết nối đồng thời', value: '42 conn', note: 'Limit: 10,000', tone: 'text-slate-900' },
  { label: 'Ops per second', value: '1,820', note: '+14% vs avg', tone: 'text-slate-900' },
];

export const RedisTelemetry: React.FC = () => (
  <Card className="space-y-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><Cpu className="h-5 w-5 text-rose-600" /> Redis Instance Telemetry</h2>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">v7.2-Alpine</span>
    </div>
    <div className="space-y-1.5">
      <p className="flex justify-between text-[11px] font-semibold text-slate-600"><span>Bộ nhớ sử dụng (RAM)</span><span className="text-slate-900">246 MB / 2.0 GB (12.3%)</span></p>
      <ProgressBar value={12.3} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {METRICS.map((m) => (
        <div key={m.label} className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">{m.label}</p>
          <p className={`text-lg font-bold ${m.tone}`}>{m.value}</p>
          <p className="text-[11px] text-slate-500">{m.note}</p>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Công cụ khẩn cấp (Emergency toolkit)</p>
      <button type="button" className="flex w-full items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 hover:bg-slate-100">
        <span className="flex items-center gap-2"><Brush className="h-4 w-4 text-slate-500" /> Xóa sạch hàng đợi Completed</span><span className="text-slate-500">2,450 keys</span>
      </button>
      <button type="button" className="flex w-full items-center justify-between gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700 hover:bg-rose-100">
        <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> Flush Dead Letter Queue (DLQ)</span><span className="rounded bg-rose-600 px-2 py-0.5 text-white">2 items</span>
      </button>
    </div>
  </Card>
);
