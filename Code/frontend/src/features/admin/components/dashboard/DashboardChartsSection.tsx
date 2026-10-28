'use client';

import * as React from 'react';
import { Activity, Code2, Cpu, PieChart as PieIcon, Server } from 'lucide-react';
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
  realData: AdminDashboardData;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({ realData }) => {
  const submissionOutcomesData =
    realData.submissionOutcomes && realData.submissionOutcomes.length > 0
      ? realData.submissionOutcomes
      : SUBMISSION_OUTCOMES;

  const languageDistributionData =
    realData.languageDistribution && realData.languageDistribution.length > 0
      ? realData.languageDistribution
      : LANGUAGE_DISTRIBUTION;

  const roomClusterLoadData =
    realData.roomClusterLoad && realData.roomClusterLoad.length > 0
      ? realData.roomClusterLoad
      : ROOM_CLUSTER_LOAD;

  const hourlyThroughputLabels =
    realData.hourlyThroughput?.labels && realData.hourlyThroughput.labels.length > 0
      ? realData.hourlyThroughput.labels
      : ['07:00', '09:00 (Ca 1)', '11:00', '13:30 (Ca 2)', '15:00', 'Hiện tại'];

  const hourlySubmissions =
    realData.hourlyThroughput?.submissions && realData.hourlyThroughput.submissions.length > 0
      ? realData.hourlyThroughput.submissions
      : THROUGHPUT_SUBMISSIONS;

  const hourlyAiCalls =
    realData.hourlyThroughput?.aiCalls && realData.hourlyThroughput.aiCalls.length > 0
      ? realData.hourlyThroughput.aiCalls
      : THROUGHPUT_AI;

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* Cột trái: AreaChart Lưu lượng + BarChart Tải LAB/Khóa học + HealthMatrix */}
      <div className="space-y-6 xl:col-span-7">
        {/* Biểu đồ diện tích: Throughput nộp bài & AI Rubric */}
        <Card className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Activity className="size-4 text-blue-600" />
                Lưu lượng nộp bài &amp; tải xử lý theo giờ
              </h2>
              <p className="text-xs text-slate-500">
                Số lần nộp bài (submissions) song hành cùng lượt chấm qua AI Gateway
              </p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="size-2.5 rounded-sm bg-blue-600" /> Thí sinh nộp
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="size-2.5 rounded-sm bg-emerald-600" /> AI Rubric call
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <AreaChart
              series={[
                {
                  name: 'AI Rubric call',
                  color: '#059669',
                  values: hourlyAiCalls,
                },
                {
                  name: 'Thí sinh nộp',
                  color: '#2563eb',
                  values: hourlySubmissions,
                },
              ]}
              labels={hourlyThroughputLabels}
            />
          </div>
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Cpu className="size-4 text-blue-600" /> Tự động mở rộng Node Sandbox khi queue vượt 50 jobs trong 30 giây.
            </span>
            <span className="text-slate-500">HPA: Active (Min 4 / Max 20)</span>
          </p>
        </Card>

        {/* Biểu đồ cột: Tải Containers & Bài nộp theo Khóa học / LAB */}
        <Card className="space-y-4">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Server className="size-4 text-emerald-600" />
                Tải Containers &amp; Bài nộp theo Khóa học / LAB
              </h2>
              <p className="text-xs text-slate-500">
                Đối chiếu số bài nộp và số lượng sinh viên ghi danh tại từng môn học / phòng máy thi
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <BarChart
              data={roomClusterLoadData}
              primaryColor="#2563eb"
              secondaryColor="#10b981"
              primaryLabel="Bài nộp (Submissions)"
              secondaryLabel="Sinh viên ghi danh"
            />
          </div>
        </Card>

        {/* Ma trận trạng thái 4 phân hệ kết nối dữ liệu thật */}
        <HealthMatrix kpis={realData.kpis} />
      </div>

      {/* Cột phải: Donut kết quả + Donut ngôn ngữ + Live Sessions */}
      <div className="space-y-6 xl:col-span-5">
        {/* Donut Chart: Phân bổ Kết quả Chấm Sandbox */}
        <Card className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <PieIcon className="size-4 text-purple-600" />
              Phân bổ Kết quả Chấm Sandbox
            </h2>
            <p className="text-xs text-slate-500">
              Thống kê {realData.kpis.totalSubmissions} bài nộp thực tế trên toàn bộ hệ thống
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <DonutChart
              data={submissionOutcomesData}
              centerLabel="Bài nộp"
              centerValue={realData.kpis.totalSubmissions}
            />
          </div>
        </Card>

        {/* Donut Chart: Cơ cấu Ngôn ngữ Lập trình Dự thi */}
        <Card className="space-y-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <Code2 className="size-4 text-cyan-600" />
              Cơ cấu Ngôn ngữ Lập trình Dự thi
            </h2>
            <p className="text-xs text-slate-500">
              Tỷ lệ môi trường biên dịch bài thi (Java, C/C++, Node.js, Web Vanilla, Python)
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <DonutChart
              data={languageDistributionData}
              centerLabel="Môn học"
              centerValue={realData.kpis.totalCourses || '100%'}
              size={170}
              strokeWidth={24}
            />
          </div>
        </Card>

        {/* Giám sát Ca thi / Lớp học đang diễn ra */}
        <LiveSessions sessions={realData.liveSessions} />
      </div>
    </section>
  );
};
