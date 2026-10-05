'use client';

import { BrainCircuit, CircleAlert, Hourglass, Pause, RefreshCw, RotateCcw, SquareTerminal } from 'lucide-react';
import { JOBS_AVG_MS, JOBS_PER_MIN } from '../../mocks/ops.mock';
import { AreaChart } from '../ui/AreaChart';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { JobsTable } from './JobsTable';
import { RedisTelemetry } from './RedisTelemetry';

export const QueuePage: React.FC = () => (
  <>
    <PageHeader
      eyebrow={<span className="font-semibold uppercase tracking-wider">BullMQ cluster v5.14 • Cluster Redis-Primary</span>}
      title="Quản trị Hàng đợi BullMQ & Redis"
      description="Theo dõi và điều phối các luồng xử lý bất đồng bộ (async jobs) biên dịch mã nguồn Sandbox và chấm điểm AI thời gian thực."
      actions={
        <>
          <Button><Pause className="h-4 w-4" /> Tạm dừng Workers</Button>
          <Button variant="danger"><RotateCcw className="h-4 w-4" /> Retry toàn bộ Failed Jobs</Button>
          <Button variant="primary"><RefreshCw className="h-4 w-4" /> Làm mới tức thì</Button>
        </>
      }
    />

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard accent="border-l-amber-400" label="QUEUED (đang chờ)" value={14} icon={Hourglass} iconClassName="bg-amber-50 text-amber-600" footer={<p className="flex justify-between text-[11px] text-slate-600"><span>Chờ phân bổ worker</span><span className="font-semibold">≈ 240ms latency</span></p>} />
      <StatCard accent="border-l-blue-500" label="RUNNING_SANDBOX" value={8} icon={SquareTerminal} iconClassName="bg-blue-50 text-blue-600" footer={<p className="flex justify-between text-[11px] text-slate-600"><span>Docker Sandbox isolates</span><span className="font-semibold text-emerald-600">12 active nodes</span></p>} />
      <StatCard accent="border-l-violet-500" label="RUNNING_AI (chấm rubric)" value={5} icon={BrainCircuit} iconClassName="bg-violet-50 text-violet-600" footer={<p className="flex justify-between text-[11px] text-slate-600"><span>GPT-4o • Gemini</span><span className="font-semibold text-emerald-600">Rate-limit OK</span></p>} />
      <StatCard accent="border-l-rose-500" label="FAILED (cần retry)" value={2} icon={CircleAlert} iconClassName="bg-rose-50 text-rose-600" footer={<p className="flex justify-between text-[11px] text-slate-600"><span>Segfault / OOM Timeout</span><span className="font-semibold text-rose-600">Chi tiết lỗi →</span></p>} />
    </section>

    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="space-y-4 xl:col-span-2">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Thông lượng xử lý jobs (Throughput &amp; Speed)</h2>
            <p className="text-xs text-slate-500">Lưu lượng jobs hoàn thành và thời gian phản hồi trung bình trong 60 phút qua</p>
          </div>
          <Badge tone="student">2,450 jobs done</Badge>
        </div>
        <AreaChart
          height={220}
          series={[
            { name: 'Thời gian TB', color: '#059669', values: JOBS_AVG_MS },
            { name: 'Jobs/min', color: '#2563eb', values: JOBS_PER_MIN },
          ]}
          labels={['-60m', '-45m', '-30m', '-15m', 'Hiện tại']}
        />
        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-4">
          <div><dt className="text-slate-500">Đỉnh xử lý (peak)</dt><dd className="font-bold text-slate-900">148 jobs/phút</dd></div>
          <div><dt className="text-slate-500">Độ trễ trung bình</dt><dd className="font-bold text-emerald-600">1.82 giây/job</dd></div>
          <div><dt className="text-slate-500">Tỷ lệ thành công</dt><dd className="font-bold text-slate-900">99.92%</dd></div>
          <div><dt className="text-slate-500">Dead-letter overflow</dt><dd className="font-bold text-rose-600">0.08% (2 jobs)</dd></div>
        </dl>
      </Card>
      <RedisTelemetry />
    </section>

    <JobsTable />
  </>
);
