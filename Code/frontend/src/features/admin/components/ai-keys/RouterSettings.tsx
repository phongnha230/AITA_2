'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { adminSettingsService } from '../../services/admin-settings.service';
import { DEFAULT_SETTINGS } from '../../mocks/mock-db';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../ui/Toast';
import type { RouterSettings as RouterSettingsValue } from '../../types/admin.types';

const STRATEGIES: { id: RouterSettingsValue['strategy']; title: string; desc: string }[] = [
  { id: 'round-robin', title: 'Round Robin', desc: 'Xoay đều qua các khóa đang hoạt động.' },
  { id: 'least-loaded', title: 'Least Loaded', desc: 'Ưu tiên khóa có RPM/Quota trống nhiều nhất.' },
];

/** No router-config endpoint exists yet, so this persists to localStorage via the settings service. */
export const RouterSettings: React.FC = () => {
  const toast = useToast();
  const [saved, setSaved] = useState<RouterSettingsValue>(DEFAULT_SETTINGS.router);
  const [draft, setDraft] = useState<RouterSettingsValue>(DEFAULT_SETTINGS.router);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const current = adminSettingsService.get().router;
    setSaved(current);
    setDraft(current);
  }, []);

  const dirty = draft.strategy !== saved.strategy || draft.tokensPerExam !== saved.tokensPerExam;

  const save = async () => {
    setSaving(true);
    try {
      const next = await adminSettingsService.save({ router: draft });
      setSaved(next.router);
      toast.success('Đã lưu cấu hình Router.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Cơ chế Failover &amp; Rate Limiting</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">• Tự động cân bằng tải</span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-slate-900">Chiến lược xoay vòng Key (Rotation Strategy)</legend>
          {STRATEGIES.map((s) => (
            <label key={s.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${draft.strategy === s.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200'}`}>
              <input type="radio" name="strategy" checked={draft.strategy === s.id} onChange={() => setDraft({ ...draft, strategy: s.id })} className="mt-1 accent-blue-600" />
              <span>
                <span className="block text-sm font-semibold text-slate-900">{s.title}</span>
                <span className="block text-xs text-slate-500">{s.desc}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">Ngưỡng kích hoạt Cảnh báo &amp; Chuyển vùng</p>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><span className="text-slate-600">Khi Key đạt Quota</span><span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">≥ 90%</span></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm"><span className="text-slate-600">Gặp liên tiếp lỗi HTTP 429</span><span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">3 lần</span></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="token-limit" className="text-sm font-semibold text-slate-900">Sandbox Token Throttling per Student</label>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{draft.tokensPerExam.toLocaleString('vi-VN')} Tokens/ca thi</span>
        </div>
        <input id="token-limit" type="range" min={10000} max={100000} step={5000} value={draft.tokensPerExam} onChange={(e) => setDraft({ ...draft, tokensPerExam: Number(e.target.value) })} className="w-full accent-blue-600" />
        <div className="flex justify-between text-[11px] text-slate-400"><span>10.000 (tối thiểu)</span><span>50.000 (khuyến nghị)</span><span>100.000 (đồ án tốt nghiệp)</span></div>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => { setDraft(DEFAULT_SETTINGS.router); toast.info('Đã khôi phục giá trị mặc định (chưa lưu).'); }}>Khôi phục mặc định</Button>
        <Button variant="primary" disabled={!dirty || saving} onClick={() => void save()}>{saving ? 'Đang lưu...' : 'Lưu cấu hình Router'}</Button>
      </div>
    </Card>
  );
};
