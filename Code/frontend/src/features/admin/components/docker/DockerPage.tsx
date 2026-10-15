'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, SlidersHorizontal, Terminal } from 'lucide-react';
import api from '@/lib/api';
import { CPU_SERIES, RAM_SERIES } from '../../mocks/ops.mock';
import { AreaChart } from '../ui/AreaChart';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { useToast } from '../ui/Toast';
import { SandboxConfigModal } from './SandboxConfigModal';
import { AuditLog } from './AuditLog';
import { NodesTable } from './NodesTable';
import { DockerStatusBanner } from './DockerStatusBanner';
import { DockerKpiCards } from './DockerKpiCards';

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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Cluster telemetry: synchronized
            </span>
            <span>v2.4.9 Engine Swarm</span>
          </>
        }
        title="Giám sát Hạ tầng Cụm Docker Sandbox"
        description="Theo dõi sức khỏe tài nguyên vật lý, trạng thái container cách ly, CPU/RAM limits và an toàn bảo mật Seccomp/AppArmor của hệ thống chấm thi tự động phân tán."
        actions={
          <>
            <Button
              onClick={() => {
                setPulse((p) => p + 1);
                toast.success('Đã làm mới telemetry cụm Docker.');
              }}
            >
              <RefreshCw className="h-4 w-4" /> Làm mới tức thì
            </Button>
            <Button variant="primary" onClick={() => setConfigOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Cấu hình Sandbox
            </Button>
          </>
        }
      />

      <DockerStatusBanner sandboxStatus={sandboxStatus} />

      <DockerKpiCards sandboxStatus={sandboxStatus} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">CPU Usage — Cluster 8 Nodes</h2>
              <p className="text-xs text-slate-500">Giới hạn cứng: 1.0 CPU / container sandbox</p>
            </div>
            <Badge tone="student">4.2 / 32 Cores</Badge>
          </div>
          <AreaChart
            series={[{ name: 'CPU', color: '#2563eb', values: CPU_SERIES }]}
            labels={['14:00 (bắt đầu thi)', '14:15 (nộp hàng loạt)', '14:30 (hiện tại)']}
          />
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Memory Cap (RAM) — Peak vs Allocation</h2>
              <p className="text-xs text-slate-500">256MB Hard cap / runner; OOM Killer kích hoạt nếu vượt</p>
            </div>
            <Badge tone="neutral">1.8GB / 64GB RAM</Badge>
          </div>
          <AreaChart
            series={[{ name: 'RAM', color: '#2563eb', values: RAM_SERIES }]}
            threshold={{ value: 256, label: 'Soft limit 256MB/sandbox' }}
            labels={['Trung bình: 184MB', 'Đỉnh: 298MB (đã thu hồi)', 'Phân bổ an toàn']}
          />
        </Card>
      </section>

      <NodesTable />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Terminal className="h-4 w-4 text-blue-600" /> Nhật ký Chấm Thi &amp; Sandbox Lifecycles
          </h2>
          <span className="text-xs text-slate-400">Streamed từ Redis pub/sub queue</span>
        </div>
        <AuditLog pulse={pulse} />
      </section>

      <SandboxConfigModal open={configOpen} onClose={() => setConfigOpen(false)} />
    </>
  );
};
