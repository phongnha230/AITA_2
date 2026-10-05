import { ArrowRight, LayoutGrid } from 'lucide-react';
import { LIVE_SESSIONS } from '../../mocks/ops.mock';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const LiveSessions: React.FC = () => (
  <Card className="flex h-full flex-col gap-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Ca thi PE đang diễn ra</h2>
        <p className="text-xs text-slate-500">Giám sát luồng thi trực tiếp tại các phòng LAB</p>
      </div>
      <Badge tone="student" dot>{LIVE_SESSIONS.length} ACTIVE</Badge>
    </div>
    <ul className="space-y-3">
      {LIVE_SESSIONS.map((s) => (
        <li key={s.code} className="space-y-2 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                {s.code}
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">{s.subject}</span>
              </p>
              <p className="text-xs text-slate-500">Phòng: <strong>{s.room}</strong> • CBCT: {s.proctor}</p>
            </div>
            <Badge tone={s.badgeTone}>{s.badge}</Badge>
          </div>
          <p className="flex justify-between gap-2 text-[11px] font-semibold"><span className="text-slate-600">{s.progressLabel}</span><span className="text-blue-600">{s.progressValue}</span></p>
          <ProgressBar value={s.percent} color={s.barColor} className="h-2 bg-slate-200" />
          <p className="flex justify-end text-xs font-semibold text-blue-600">
            <span className="inline-flex items-center gap-1">Chi tiết phòng {s.room} <ArrowRight className="h-3.5 w-3.5" /></span>
          </p>
        </li>
      ))}
    </ul>
    <button type="button" className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-slate-200">
      <LayoutGrid className="h-4 w-4" /> Xem ma trận tất cả 12 phòng máy thi
    </button>
  </Card>
);
