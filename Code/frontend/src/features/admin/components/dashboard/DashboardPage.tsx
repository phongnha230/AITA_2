'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Boxes, Cpu, Download, KeyRound, Layers, RefreshCw, Server, Users, Wallet } from 'lucide-react';
import { downloadFile } from '../../../../lib/download';
import { LIVE_SESSIONS, OPS_EVENTS, THROUGHPUT_AI, THROUGHPUT_SUBMISSIONS } from '../../mocks/ops.mock';
import { useToast } from '../ui/Toast';
import { AreaChart } from '../ui/AreaChart';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';
import { StatCard } from '../ui/StatCard';
import { HealthMatrix } from './HealthMatrix';
import { LiveSessions } from './LiveSessions';
import { OpsEventsTable } from './OpsEventsTable';

const QUICK_LINKS = [
  { href: '/admin/users', icon: Users, title: 'Người dùng & RBAC', sub: 'Phân quyền toàn hệ thống' },
  { href: '/admin/ai-keys', icon: KeyRound, title: 'Kho AI Keys & Limits', sub: 'Gemini • OpenAI' },
  { href: '/admin/queue', icon: Layers, title: 'BullMQ & Redis Queue', sub: 'Giám sát tải nộp bài' },
  { href: '/admin/docker', icon: Server, title: 'Giám sát Hạ tầng Docker', sub: '8 Nodes • Sandbox Clustered' },
];

export const DashboardPage: React.FC = () => {
  const toast = useToast();
  const [spinning, setSpinning] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      setUpdatedAt(new Date().toLocaleTimeString('vi-VN'));
      toast.success('Đã làm mới dữ liệu vận hành.');
    }, 800);
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      exam: 'Spring 2025',
      kpis: { sessions: 12, examinees: 428, sandboxPods: '42/150', queueProcessed: 2450, queued: 14, aiBudget: '$142.6/$500' },
      liveSessions: LIVE_SESSIONS,
      events: OPS_EVENTS,
    };
    downloadFile('aita-ops-report.json', JSON.stringify(report, null, 2), 'application/json');
    toast.success('Đã xuất báo cáo vận hành (JSON).');
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-emerald-700">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-600" /> Live Ops Central
            </span>
            <span>Kỳ thi Spring 2025 • Hệ thống chấm tự động</span>
          </>
        }
        title="Tổng quan Hệ thống & Vận hành Kỳ thi PE"
        description="Bảng điều khiển trung tâm giám sát hạ tầng chấm bài Docker Sandbox, luồng hàng đợi Redis, ngân sách AI và hoạt động thi thực hành toàn trường theo thời gian thực."
        actions={
          <>
            <Button onClick={exportReport}><Download className="h-4 w-4" /> Xuất báo cáo</Button>
            <Button variant="primary" onClick={refresh} title={updatedAt ? `Cập nhật lúc ${updatedAt}` : undefined}>
              Làm mới (15s) <RefreshCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng ca & thí sinh" icon={Users} value={12} suffix="/ 428 đang thi" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-slate-600">LAB 302, 304, 305 kích hoạt</span><span className="text-emerald-600">100% sẵn sàng</span></p><ProgressBar value={86} /></>} />
        <StatCard label="Tải Sandbox Cluster" icon={Boxes} iconClassName="text-emerald-600" value={42} suffix="/ 150 Pods" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-emerald-600">8/8 Nodes khỏe</span><span className="text-slate-600">CPU TB: 28.4%</span></p><ProgressBar value={28.4} color="bg-emerald-600" /></>} />
        <StatCard label="Hiệu năng hàng đợi" icon={Layers} value="2,450" suffix="99.92% OK" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-rose-600">14 jobs đang xếp hàng</span><span className="text-slate-600">Latency: 240ms</span></p><ProgressBar value={99.2} /></>} />
        <StatCard label="Ngân sách AI Pool" icon={Wallet} value="$142.6" suffix="/ $500" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-blue-600">18/20 Keys active</span><span className="text-emerald-600">0 lỗi 429</span></p><ProgressBar value={28.5} /></>} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <Card className="space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Lưu lượng nộp bài &amp; tải xử lý theo giờ</h2>
                <p className="text-xs text-slate-500">Số lần nộp bài (submissions/min) song hành cùng số lượt chấm qua AI Gateway</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600"><span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Thí sinh nộp</span>
                <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> AI Rubric call</span>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <AreaChart
                series={[
                  { name: 'AI Rubric call', color: '#059669', values: THROUGHPUT_AI },
                  { name: 'Thí sinh nộp', color: '#2563eb', values: THROUGHPUT_SUBMISSIONS },
                ]}
                labels={['07:00', '09:00 (Ca 1)', '11:00', '13:30 (Ca 2)', '15:00', '17:00']}
              />
            </div>
            <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800"><Cpu className="h-4 w-4 text-blue-600" /> Tự động mở rộng Node Sandbox khi queue vượt 50 jobs trong 30 giây.</span>
              <span className="text-slate-500">HPA: Active (Min 4 / Max 20)</span>
            </p>
          </Card>
          <HealthMatrix />
        </div>
        <div className="xl:col-span-5">
          <LiveSessions />
        </div>
      </section>

      <OpsEventsTable />

      <footer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map(({ href, icon: Icon, title, sub }) => (
          <Link key={href} href={href} className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"><Icon className="h-5 w-5" /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-900">{title}</span>
                <span className="block truncate text-xs text-slate-500">{sub}</span>
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
          </Link>
        ))}
      </footer>
    </>
  );
};
