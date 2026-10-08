'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Boxes,
  Code2,
  Cpu,
  Download,
  KeyRound,
  Layers,
  PieChart as PieIcon,
  RefreshCw,
  Server,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { downloadFile } from '../../../../lib/download';
import {
  CPU_SERIES,
  JOBS_PER_MIN,
  LIVE_SESSIONS,
  OPS_EVENTS,
  THROUGHPUT_AI,
  THROUGHPUT_SUBMISSIONS,
} from '../../mocks/ops.mock';
import { useToast } from '../ui/Toast';
import { AreaChart } from '../ui/AreaChart';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';
import { StatCard } from '../ui/StatCard';
import { DonutChart } from '../ui/DonutChart';
import { BarChart } from '../ui/BarChart';
import { HealthMatrix } from './HealthMatrix';
import { LiveSessions } from './LiveSessions';
import { OpsEventsTable } from './OpsEventsTable';

const QUICK_LINKS = [
  { href: '/admin/users', icon: Users, title: 'Người dùng & RBAC', sub: 'Phân quyền toàn hệ thống' },
  { href: '/admin/ai-keys', icon: KeyRound, title: 'Kho AI Keys & Limits', sub: 'Gemini • OpenAI' },
  { href: '/admin/queue', icon: Layers, title: 'BullMQ & Redis Queue', sub: 'Giám sát tải nộp bài' },
  { href: '/admin/docker', icon: Server, title: 'Giám sát Hạ tầng Docker', sub: '8 Nodes • Sandbox Clustered' },
];

const SUBMISSION_OUTCOMES = [
  { name: 'Passed (100% Testcase)', value: 318, color: '#10b981' },
  { name: 'Wrong Answer (Sai Test)', value: 68, color: '#f43f5e' },
  { name: 'Compilation Error', value: 26, color: '#f59e0b' },
  { name: 'Time Limit (TLE)', value: 16, color: '#8b5cf6' },
];

const LANGUAGE_DISTRIBUTION = [
  { name: 'Java (JDK 21 - OOP/DSA)', value: 195, color: '#2563eb' },
  { name: 'C / C++ (GCC 13 - PRF192)', value: 148, color: '#06b6d4' },
  { name: 'Python (v3.12 - AI/Data)', value: 85, color: '#10b981' },
];

const ROOM_CLUSTER_LOAD = [
  { label: 'LAB 302', value: 38, secondaryValue: 42, subLabel: 'PRF192 (C)' },
  { label: 'LAB 304', value: 40, secondaryValue: 58, subLabel: 'CSD201 (Java)' },
  { label: 'LAB 305', value: 35, secondaryValue: 36, subLabel: 'PRO192 (Java)' },
  { label: 'LAB 306', value: 18, secondaryValue: 22, subLabel: 'Phòng dự phòng' },
];

export const DashboardPage: React.FC = () => {
  const toast = useToast();
  const [spinning, setSpinning] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const refresh = () => {
    setSpinning(true);
    const timer = setTimeout(() => {
      setSpinning(false);
      setUpdatedAt(new Date().toLocaleTimeString('vi-VN'));
      toast.success('Đã cập nhật toàn bộ biểu đồ & dữ liệu vận hành thời gian thực.');
    }, 600);
    return () => clearTimeout(timer);
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      exam: 'Spring 2025',
      kpis: { sessions: 12, examinees: 428, sandboxPods: '42/150', queueProcessed: 2450, queued: 14, aiBudget: '$142.6/$500' },
      submissionOutcomes: SUBMISSION_OUTCOMES,
      languageDistribution: LANGUAGE_DISTRIBUTION,
      roomClusterLoad: ROOM_CLUSTER_LOAD,
      liveSessions: LIVE_SESSIONS,
      events: OPS_EVENTS,
    };
    downloadFile('aita-ops-report.json', JSON.stringify(report, null, 2), 'application/json');
    toast.success('Đã xuất báo cáo số liệu và biểu đồ vận hành (JSON).');
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-emerald-700">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-600" /> Live Ops Telemetry
            </span>
            <span>Kỳ thi Spring 2025 • Hệ thống chấm tự động đa cụm</span>
          </>
        }
        title="Tổng quan Hệ thống & Vận hành Kỳ thi PE"
        description="Bảng điều khiển trung tâm trực quan hóa hạ tầng chấm bài Docker Sandbox, phân bổ kết quả bài thi, tải cụm phòng máy và luồng hàng đợi Redis thời gian thực."
        actions={
          <>
            <Button onClick={exportReport}><Download className="h-4 w-4" /> Xuất báo cáo</Button>
            <Button variant="primary" onClick={refresh} title={updatedAt ? `Cập nhật lúc ${updatedAt}` : undefined}>
              Làm mới <RefreshCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
            </Button>
          </>
        }
      />

      {/* 4 KPI Cards with Realtime Sparkline Trends */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng ca & thí sinh"
          icon={Users}
          value={12}
          suffix="/ 428 đang thi"
          sparkline={[35, 60, 110, 195, 260, 340, 395, 428]}
          sparklineColor="#2563eb"
          trend={{ value: '+14.2%', positive: true, label: 'tăng tải ca chiều' }}
          footer={
            <>
              <p className="flex justify-between text-[11px] font-medium">
                <span className="text-slate-600">LAB 302, 304, 305 kích hoạt</span>
                <span className="text-emerald-600">100% sẵn sàng</span>
              </p>
              <ProgressBar value={86} />
            </>
          }
        />
        <StatCard
          label="Tải Sandbox Cluster"
          icon={Boxes}
          iconClassName="text-emerald-600"
          value={42}
          suffix="/ 150 Pods"
          sparkline={CPU_SERIES}
          sparklineColor="#10b981"
          trend={{ value: '28.4% CPU', positive: true, label: 'ngưỡng an toàn' }}
          footer={
            <>
              <p className="flex justify-between text-[11px] font-medium">
                <span className="text-emerald-600">8/8 Nodes online</span>
                <span className="text-slate-600">RAM: 14.8/64 GB</span>
              </p>
              <ProgressBar value={28.4} color="bg-emerald-600" />
            </>
          }
        />
        <StatCard
          label="Hiệu năng hàng đợi"
          icon={Layers}
          value="2,450"
          suffix="99.92% OK"
          sparkline={JOBS_PER_MIN}
          sparklineColor="#6366f1"
          trend={{ value: '240ms', positive: true, label: 'độ trễ trung bình' }}
          footer={
            <>
              <p className="flex justify-between text-[11px] font-medium">
                <span className="text-rose-600">14 jobs đang chờ</span>
                <span className="text-slate-600">16 Workers song song</span>
              </p>
              <ProgressBar value={99.2} />
            </>
          }
        />
        <StatCard
          label="Ngân sách AI Pool"
          icon={Wallet}
          value="$142.6"
          suffix="/ $500"
          sparkline={[14, 28, 48, 65, 88, 112, 130, 142.6]}
          sparklineColor="#f59e0b"
          trend={{ value: '28.5%', positive: true, label: 'hạn mức tháng' }}
          footer={
            <>
              <p className="flex justify-between text-[11px] font-medium">
                <span className="text-blue-600">18/20 Keys active</span>
                <span className="text-emerald-600">0 lỗi 429</span>
              </p>
              <ProgressBar value={28.5} />
            </>
          }
        />
      </section>

      {/* Main Charts Grid: Throughput Flow & Deep Analytics */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left Column: Throughput AreaChart + HealthMatrix */}
        <div className="space-y-6 xl:col-span-7">
          <Card className="space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Lưu lượng nộp bài &amp; tải xử lý theo giờ
                </h2>
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

          {/* Bar Chart: Cluster Load per Room */}
          <Card className="space-y-4">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Server className="h-4 w-4 text-emerald-600" />
                  Tải Containers &amp; CPU theo Phòng máy thi (LAB)
                </h2>
                <p className="text-xs text-slate-500">Đối chiếu số container cô lập đang chạy so với tỷ lệ % CPU sử dụng tại từng phòng thi</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <BarChart
                data={ROOM_CLUSTER_LOAD}
                primaryColor="#2563eb"
                secondaryColor="#10b981"
                primaryLabel="Containers cô lập"
                secondaryLabel="% CPU máy trạm"
              />
            </div>
          </Card>

          <HealthMatrix />
        </div>

        {/* Right Column: Donut Breakdown + Live Sessions */}
        <div className="space-y-6 xl:col-span-5">
          {/* Donut Chart: Submission Outcomes */}
          <Card className="space-y-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <PieIcon className="h-4 w-4 text-purple-600" />
                Phân bổ Kết quả Chấm Sandbox
              </h2>
              <p className="text-xs text-slate-500">Thống kê 428 bài nộp gần nhất trên toàn bộ các ca thi</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <DonutChart
                data={SUBMISSION_OUTCOMES}
                centerLabel="Bài nộp"
                centerValue={428}
              />
            </div>
          </Card>

          {/* Donut Chart: Language Distribution */}
          <Card className="space-y-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Code2 className="h-4 w-4 text-cyan-600" />
                Cơ cấu Ngôn ngữ Lập trình Dự thi
              </h2>
              <p className="text-xs text-slate-500">Tỷ lệ các bài giải nộp vào sandbox compiler</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <DonutChart
                data={LANGUAGE_DISTRIBUTION}
                centerLabel="Tổng bài"
                centerValue="100%"
                size={160}
                strokeWidth={22}
              />
            </div>
          </Card>

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
