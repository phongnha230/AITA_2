import { BarChart3, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

const BARS = [
  { label: 'GPT-4o', value: 100, color: 'bg-blue-600' },
  { label: 'Gemini', value: 62, color: 'bg-emerald-600' },
  { label: 'Claude', value: 78, color: 'bg-blue-500' },
  { label: 'D-Seek', value: 22, color: 'bg-slate-300' },
];

export const TrafficStats: React.FC = () => (
  <Card className="space-y-5">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-900">Thống kê lưu lượng</h2>
      <BarChart3 className="h-5 w-5 text-slate-400" />
    </div>
    <div className="flex h-36 items-end justify-around gap-3 rounded-xl bg-slate-50 p-4">
      {BARS.map((b) => (
        <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div className={`w-full max-w-[44px] rounded-t-md ${b.color}`} style={{ height: `${b.value}%` }} />
          <span className="text-[10px] font-medium text-slate-500">{b.label}</span>
        </div>
      ))}
    </div>
    <dl className="space-y-2 text-xs">
      <div className="flex justify-between"><dt className="text-slate-500">Tổng tokens 24h</dt><dd className="font-bold text-slate-900">1,482,900 tokens</dd></div>
      <div className="flex justify-between"><dt className="text-slate-500">Tiết kiệm qua Cache</dt><dd className="font-bold text-emerald-600">38.4% (~$45.20)</dd></div>
      <div className="flex justify-between"><dt className="text-slate-500">Thời gian phản hồi P95</dt><dd className="font-bold text-slate-900">890 ms</dd></div>
    </dl>
    <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-800">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
      <span><strong>Tự động xáo trộn chữ ký</strong><br />Mã hóa AES-256 đối xứng cho toàn bộ khóa lưu trữ.</span>
    </p>
  </Card>
);
