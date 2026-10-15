'use client';

import * as React from 'react';
import { Boxes, Cpu, MemoryStick, Server } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { ProgressBar } from '../ui/ProgressBar';

interface DockerKpiCardsProps {
  sandboxStatus: {
    nodes?: any[];
    activeExecutions?: number;
    totalGradedCount?: number;
    failedExecutions?: number;
  } | null;
}

export const DockerKpiCards: React.FC<DockerKpiCardsProps> = ({ sandboxStatus }) => {
  const activePercent = Math.min(100, (((sandboxStatus?.activeExecutions ?? 0) / 10) * 100));

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Cụm Docker Nodes"
        icon={Server}
        value={`${sandboxStatus?.nodes?.length ?? 2} Nodes`}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-emerald-600">100% online</span>
              <span className="text-slate-500">0 degraded</span>
            </p>
            <ProgressBar value={100} color="bg-emerald-600" />
          </>
        }
      />
      <StatCard
        label="Containers đang chạy"
        icon={Boxes}
        value={sandboxStatus?.activeExecutions ?? 0}
        suffix="Active"
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-600">Sức chứa tối đa: 50/node</span>
              <span className="text-blue-600">{sandboxStatus?.activeExecutions ? 'Đang chấm' : 'Sẵn sàng'}</span>
            </p>
            <ProgressBar value={activePercent} />
          </>
        }
      />
      <StatCard
        label="Bài nộp đã chấm (Sandbox)"
        icon={Cpu}
        value={sandboxStatus?.totalGradedCount ?? 0}
        suffix="Bài thi"
        footer={
          <p className="flex justify-between text-[11px] font-medium">
            <span className="text-slate-600">Hệ thống tự động</span>
            <span className="text-emerald-600">Đã cập nhật DB</span>
          </p>
        }
      />
      <StatCard
        label="Lỗi / Failed Executions"
        icon={MemoryStick}
        value={sandboxStatus?.failedExecutions ?? 0}
        suffix="Lỗi"
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-600">Timeout / Segfault</span>
              <span className={sandboxStatus?.failedExecutions ? 'text-rose-600' : 'text-emerald-600'}>
                {sandboxStatus?.failedExecutions ? 'Cần xem xét' : 'Không có lỗi'}
              </span>
            </p>
            <ProgressBar value={sandboxStatus?.failedExecutions ? 15 : 0} color="bg-rose-500" />
          </>
        }
      />
    </section>
  );
};
