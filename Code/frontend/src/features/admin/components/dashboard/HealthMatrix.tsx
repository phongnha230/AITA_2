import * as React from 'react';
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

interface HealthMatrixProps {
  kpis?: {
    totalUsers: number;
    totalCourses: number;
    totalAiKeys: number;
    activeAiKeys: number;
    pendingSubmissions: number;
  };
}

export const HealthMatrix: React.FC<HealthMatrixProps> = ({ kpis }) => {
  const subsystems: Subsystem[] = [
    {
      name: 'Docker Sandbox',
      badge: '100% Online',
      tone: 'student',
      desc: '8 Worker Nodes sẵn sàng. Sandbox cluster cách ly cgroups v2 & seccomp strict.',
      footIcon: ShieldCheck,
      foot: 'Rootless & Seccomp Filter: ACTIVE',
    },
    {
      name: 'BullMQ & Redis',
      badge: kpis ? `${kpis.pendingSubmissions} In Queue` : '0.8ms Ping',
      tone: kpis && kpis.pendingSubmissions > 20 ? 'warning' : 'student',
      desc: kpis
        ? `Hàng đợi chấm thi BullMQ: ${kpis.pendingSubmissions} bài đang xếp hàng xử lý.`
        : '42 kết nối Socket Pool. Dead Letter Queue: 0 bản ghi.',
      footIcon: ArrowLeftRight,
      foot: 'Throughput: Hỗ trợ tới 850 events/giây',
    },
    {
      name: 'AI Gateway Pool',
      badge: kpis ? `${kpis.activeAiKeys}/${kpis.totalAiKeys} Keys Active` : 'Failover ON',
      tone: kpis && kpis.activeAiKeys > 0 ? 'student' : 'admin',
      desc: kpis
        ? `Gemini & AI Rubric. ${kpis.activeAiKeys} khóa API đang mở hạn mức đánh giá.`
        : 'GPT-4o, Gemini Pro. Success rate: 99.85%.',
      footIcon: Bolt,
      foot: 'Tự động cân bằng tải round-robin active',
    },
    {
      name: 'FAP SSO & Database',
      badge: '100% Match',
      tone: 'student',
      desc: kpis
        ? `${kpis.totalUsers} tài khoản, ${kpis.totalCourses} môn học trực tuyến từ cơ sở dữ liệu.`
        : '1,420 hồ sơ đồng bộ thời gian thực. 0 lỗi xác thực.',
      footIcon: RefreshCcw,
      foot: 'Lần đồng bộ cuối: Thời gian thực',
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Trạng thái 4 phân hệ trọng yếu</h2>
        <span className="text-xs font-semibold text-emerald-600">Hạ tầng vận hành ổn định</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {subsystems.map(({ name, badge, tone, desc, footIcon: Icon, foot }) => (
          <Card key={name} className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="size-2.5 rounded-full bg-emerald-600" />
                {name}
              </span>
              <Badge tone={tone}>{badge}</Badge>
            </div>
            <p className="text-xs text-slate-600">{desc}</p>
            <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
              <Icon className="size-3.5 text-blue-600" />
              {foot}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
};
