'use client';

import * as React from 'react';
import { Activity, Cpu, Server, PieChart as PieIcon, Code2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { AreaChart } from '../ui/AreaChart';
import { BarChart } from '../ui/BarChart';
import { DonutChart } from '../ui/DonutChart';
import { HealthMatrix } from './HealthMatrix';
import { LiveSessions } from './LiveSessions';
import type { AdminDashboardData } from '../../services/admin-dashboard.service';
import {
  ROOM_CLUSTER_LOAD,
  SUBMISSION_OUTCOMES,
  LANGUAGE_DISTRIBUTION,
} from './dashboard.constants';
import {
  THROUGHPUT_AI,
  THROUGHPUT_SUBMISSIONS,
} from '../../mocks/ops.mock';

interface DashboardChartsSectionProps {
  realData: AdminDashboardData | null;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({ realData }) => {
  const submissionOutcomesData =
    realData?.submissionOutcomes && realData.submissionOutcomes.length > 0
      ? realData.submissionOutcomes
      : SUBMISSION_OUTCOMES;

  return (
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
              <p className="text-xs text-slate-500">
                Số lần nộp bài (submissions/min) song hành cùng số lượt chấm qua AI Gateway
              </p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Thí sinh nộp
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> AI Rubric call
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <AreaChart
              series={[
                {
                  name: 'AI Rubric call',
                  color: '#059669',
                  values: realData?.hourlyThroughput?.aiCalls || THROUGHPUT_AI,
                },
                {
                  name: 'Thí sinh nộp',
                  color: '#2563eb',
                  values: realData?.hourlyThroughput?.submissions || THROUGHPUT_SUBMISSIONS,
                },
              ]}
              labels={
                realData?.hourlyThroughput?.labels || [
                  '07:00',
                  '09:00 (Ca 1)',
                  '11:00',
                  '13:30 (Ca 2)',
                  '15:00',
                  'Hiện tại',
                ]
              }
            />
          </div>
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Cpu className="h-4 w-4 text-blue-600" /> Tự động mở rộng Node Sandbox khi queue vượt 50 jobs trong 30 giây.
            </span>
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
              <p className="text-xs text-slate-500">
                Đối chiếu số container cô lập đang chạy so với tỷ lệ % CPU sử dụng tại từng phòng thi
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <BarChart
              data={realData?.roomClusterLoad || ROOM_CLUSTER_LOAD}
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
            <p className="text-xs text-slate-500">
              Thống kê {realData?.kpis.totalSubmissions ?? 0} bài nộp thực tế trên toàn bộ các ca thi
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <DonutChart
              data={submissionOutcomesData}
              centerLabel="Bài nộp"
              centerValue={realData?.kpis.totalSubmissions ?? 0}
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
              data={realData?.languageDistribution || LANGUAGE_DISTRIBUTION}
              centerLabel="Tổng bài"
              centerValue="100%"
              size={160}
              strokeWidth={22}
            />
          </div>
        </Card>

        <LiveSessions sessions={realData?.liveSessions} />
      </div>
    </section>
  );
};
