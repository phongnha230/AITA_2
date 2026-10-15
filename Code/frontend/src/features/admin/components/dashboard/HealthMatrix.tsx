import { ArrowLeftRight, Bolt, RefreshCcw, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '../ui/Badge';
import { Card } from '../ui/Card';

interface Subsystem {
  name: string;
  badge: string;
  tone: BadgeTone;
  desc: string;
  footIcon: LucideIcon;
  foot: string;
}

const SUBSYSTEMS: Subsystem[] = [
  { name: 'Docker Sandbox', badge: '100% Online', tone: 'student', desc: '8 Worker Nodes sẵn sàng. RAM sử dụng: 14.8 / 64 GB.', footIcon: ShieldCheck, foot: 'Rootless & Seccomp Filter: ACTIVE' },
  { name: 'BullMQ & Redis', badge: '0.8ms Ping', tone: 'student', desc: '42 kết nối Socket Pool. Dead Letter Queue (DLQ): 2 bản ghi.', footIcon: ArrowLeftRight, foot: 'Throughput: 850 events/giây' },
  { name: 'AI Gateway Pool', badge: 'Failover ON', tone: 'info', desc: 'GPT-4o, Gemini Pro. Success rate: 99.85%.', footIcon: Bolt, foot: 'Auto switch round-robin active' },
  { name: 'FAP SSO & Sync', badge: '100% Match', tone: 'student', desc: '1,420 hồ sơ đồng bộ thời gian thực. 0 lỗi xác thực OAuth2.', footIcon: RefreshCcw, foot: 'Lần đồng bộ cuối: 3 phút trước' },
];

export const HealthMatrix: React.FC = () => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-slate-900">Trạng thái 4 phân hệ trọng yếu</h2>
      <span className="text-xs font-semibold text-emerald-600">Tất cả vận hành tối ưu</span>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {SUBSYSTEMS.map(({ name, badge, tone, desc, footIcon: Icon, foot }) => (
        <Card key={name} className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />{name}</span>
            <Badge tone={tone}>{badge}</Badge>
          </div>
          <p className="text-xs text-slate-600">{desc}</p>
          <p className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500"><Icon className="h-3.5 w-3.5 text-blue-600" />{foot}</p>
        </Card>
      ))}
    </div>
  </section>
);
