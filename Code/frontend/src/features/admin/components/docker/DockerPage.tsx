'use client';

import { useEffect, useState } from 'react';
import { Boxes, Cpu, MemoryStick, RefreshCw, Server, SlidersHorizontal, Terminal } from 'lucide-react';
import api from '@/lib/api';
import { CPU_SERIES, RAM_SERIES } from '../../mocks/ops.mock';
import { AreaChart } from '../ui/AreaChart';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';
import { StatCard } from '../ui/StatCard';
import { useToast } from '../ui/Toast';
import { SandboxConfigModal } from './SandboxConfigModal';
import { AuditLog } from './AuditLog';
import { NodesTable } from './NodesTable';

export const DockerPage: React.FC = () => {
  const toast = useToast();
  const [configOpen, setConfigOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [sandboxStatus, setSandboxStatus] = useState<any>(null);

  useEffect(() => {
    api.get('/sandbox/status')
      .then((res) => setSandboxStatus(res.data?.data))
      .catch(() => {});
  }, [pulse]);

  return (
  <>
    <PageHeader
      eyebrow={
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Cluster telemetry: synchronized</span>
          <span>v2.4.9 Engine Swarm</span>
        </>
      }
      title="Giám sát Hạ tầng Cụm Docker Sandbox"
      description="Theo dõi sức khỏe tài nguyên vật lý, trạng thái container cách ly, CPU/RAM limits và an toàn bảo mật Seccomp/AppArmor của hệ thống chấm thi tự động phân tán."
      actions={
        <>
          <Button onClick={() => { setPulse((p) => p + 1); toast.success('Đã làm mới telemetry cụm Docker.'); }}><RefreshCw className="h-4 w-4" /> Làm mới tức thì</Button>
          <Button variant="primary" onClick={() => setConfigOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Cấu hình Sandbox</Button>
        </>
      }
    />

    {sandboxStatus && (
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sandboxStatus.dockerDaemonRunning ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sandboxStatus.dockerDaemonRunning ? 'bg-emerald-600' : 'bg-amber-600'}`} />
          </span>
          <span className="font-bold">
            Sandbox Engine: {sandboxStatus.activeMode === 'DOCKER_ISOLATED' ? 'Docker Isolated Container Swarm' : 'Local Native Sandbox Engine'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
            {sandboxStatus.localJavaVersion || 'JDK Ready'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
          <span>Timeout: <strong className="text-slate-800">{sandboxStatus.limits?.defaultTimeoutMs ?? 2000}ms</strong></span>
          <span>RAM Cap: <strong className="text-slate-800">{sandboxStatus.limits?.defaultMemoryLimitMb ?? 256}MB</strong></span>
          <span>Bảo mật: <strong className="text-slate-800">{sandboxStatus.limits?.networkIsolation ? 'Seccomp Network Isolation Active' : 'Native'}</strong></span>
        </div>
      </div>
    )}

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard label="Cụm Docker Nodes" icon={Server} value="8 / 8" suffix="Nodes" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-emerald-600">100% online</span><span className="text-slate-500">0 degraded</span></p><ProgressBar value={100} color="bg-emerald-600" /></>} />
      <StatCard label="Containers đang chạy" icon={Boxes} value={42} suffix="Active" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-slate-600">Sức chứa tối đa: 150</span><span className="text-blue-600">28% tải</span></p><ProgressBar value={28} /></>} />
      <StatCard label="CPU toàn cụm" icon={Cpu} value="28.4%" footer={<p className="flex justify-between text-[11px] font-medium"><span className="text-slate-600">32 Cores Xeon Silver</span><span className="text-slate-500">Bình thường</span></p>} />
      <StatCard label="Bộ nhớ RAM" icon={MemoryStick} value="14.8 / 64 GB" footer={<><p className="flex justify-between text-[11px] font-medium"><span className="text-slate-600">Cap 512MB / container</span><span className="text-emerald-600">23.1% sử dụng</span></p><ProgressBar value={23.1} color="bg-emerald-600" /></>} />
    </section>

    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">CPU load tức thời (toàn cụm)</h2>
            <p className="text-xs text-slate-500">Tần suất 10s/lần — phát hiện đột biến tải do nộp bài đồng loạt</p>
          </div>
          <Badge tone="info">Đỉnh: 68.2%</Badge>
        </div>
        <AreaChart series={[{ name: 'CPU', color: '#2563eb', values: CPU_SERIES }]} labels={['14:00 (bắt đầu thi)', '14:15 (nộp hàng loạt)', '14:30 (hiện tại)']} />
      </Card>
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">RAM allocation &amp; sandbox memory spikes</h2>
            <p className="text-xs text-slate-500">Giám sát cấp phát và ngưỡng tiêu thụ theo tiến trình chấm</p>
          </div>
          <Badge tone="neutral">Ngưỡng an toàn &lt; 512MB</Badge>
        </div>
        <AreaChart series={[{ name: 'RAM', color: '#2563eb', values: RAM_SERIES }]} threshold={{ value: 256, label: 'Soft limit 256MB/sandbox' }} labels={['Trung bình: 184MB', 'Đỉnh: 298MB (đã thu hồi)', 'Phân bổ an toàn']} />
      </Card>
    </section>

    <NodesTable />
    <AuditLog pulse={pulse} />
    <SandboxConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />
  </>
  );
};
