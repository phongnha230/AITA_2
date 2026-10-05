'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type Strategy = 'round-robin' | 'least-loaded';

const STRATEGIES: { id: Strategy; title: string; desc: string }[] = [
  { id: 'round-robin', title: 'Round Robin', desc: 'Xoay đều qua các khóa đang hoạt động.' },
  { id: 'least-loaded', title: 'Least Loaded', desc: 'Ưu tiên khóa có RPM/Quota trống nhiều nhất.' },
];

/** UI-only: no router-config endpoint exists yet, so values are kept in local state. */
export const RouterSettings: React.FC = () => {
  const [strategy, setStrategy] = useState<Strategy>('round-robin');
  const [tokens, setTokens] = useState(50000);

  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-blue-600" />
        <h2 className="text-base font-semibold text-slate-900">Cơ chế Failover &amp; Rate Limiting</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-900">Chiến lược xoay vòng Key</legend>
          {STRATEGIES.map((s) => (
            <label key={s.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${strategy === s.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
              <input type="radio" name="strategy" checked={strategy === s.id} onChange={() => setStrategy(s.id)} className="mt-1 accent-blue-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{s.title}</span>
                <span className="block text-xs text-slate-500">{s.desc}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Ngưỡng kích hoạt cảnh báo &amp; chuyển vùng</p>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><span className="text-slate-600">Khi Key đạt Quota</span><span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">≥ 90%</span></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><span className="text-slate-600">Gặp liên tiếp lỗi HTTP 429</span><span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">3 lần</span></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="token-limit" className="text-sm font-semibold text-slate-900">Sandbox Token Throttling per Student</label>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{tokens.toLocaleString('vi-VN')} tokens/ca thi</span>
        </div>
        <input id="token-limit" type="range" min={10000} max={100000} step={5000} value={tokens} onChange={(e) => setTokens(Number(e.target.value))} className="w-full accent-blue-600" />
        <div className="flex justify-between text-[11px] text-slate-400"><span>10.000 (tối thiểu)</span><span>50.000 (khuyến nghị)</span><span>100.000 (đồ án tốt nghiệp)</span></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => { setStrategy('round-robin'); setTokens(50000); }}>Khôi phục mặc định</Button>
        <Button variant="primary" disabled title="Chưa có API lưu cấu hình Router">Lưu cấu hình Router</Button>
      </div>
    </Card>
  );
};
