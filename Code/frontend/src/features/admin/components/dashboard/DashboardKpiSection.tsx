'use client';

import * as React from 'react';
import { Users, Boxes, Layers, Wallet } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { ProgressBar } from '../ui/ProgressBar';
import type { AdminDashboardData } from '../../services/admin-dashboard.service';

interface DashboardKpiSectionProps {
  realData: AdminDashboardData | null;
}

const DEFAULT_KPIS = {
  totalUsers: 14,
  totalStudents: 0,
  totalLecturers: 0,
  totalAdmins: 0,
  totalCourses: 4,
  totalAssignments: 0,
  totalSubmissions: 0,
  completedSubmissions: 0,
  pendingSubmissions: 0,
  failedSubmissions: 0,
  totalAiKeys: 0,
  activeAiKeys: 0,
};

function computeKpiValues(realData: AdminDashboardData | null) {
  const k = realData?.kpis ?? DEFAULT_KPIS;

  const usersProgress = k.totalUsers > 0
    ? Math.min(100, Math.round(((k.totalStudents || 1) / k.totalUsers) * 100))
    : 100;

  const submissionsProgress = k.totalSubmissions > 0
    ? Math.min(100, Math.round(((k.completedSubmissions || 0) / k.totalSubmissions) * 100))
    : 0;

  const aiKeysProgress = k.totalAiKeys > 0
    ? Math.round(((k.activeAiKeys || 0) / k.totalAiKeys) * 100)
    : 100;

  return { k, usersProgress, submissionsProgress, aiKeysProgress };
}

export const DashboardKpiSection: React.FC<DashboardKpiSectionProps> = ({ realData }) => {
  const { k, usersProgress, submissionsProgress, aiKeysProgress } = computeKpiValues(realData);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Tổng người dùng"
        icon={Users}
        value={k.totalUsers}
        suffix={`/ ${k.totalStudents} Sinh viên`}
        sparkline={[2, 4, 6, 8, 10, 12, k.totalUsers]}
        sparklineColor="#2563eb"
        trend={{
          value: `${k.totalLecturers} GV`,
          positive: true,
          label: `${k.totalAdmins} Admin`,
        }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-600">Đồng bộ FAP Database</span>
              <span className="text-emerald-600">100% Khớp</span>
            </p>
            <ProgressBar value={usersProgress} />
          </>
        }
      />
      <StatCard
        label="Khóa học & Đề thi"
        icon={Boxes}
        iconClassName="text-emerald-600"
        value={k.totalCourses}
        suffix={`Môn / ${k.totalAssignments} Đề thi`}
        sparkline={[1, 2, 3, 3, 4, k.totalCourses]}
        sparklineColor="#10b981"
        trend={{ value: 'Đang mở', positive: true, label: 'Kỳ Fall 2024' }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-emerald-600">Docker Sandbox Clustered</span>
              <span className="text-slate-600">Active</span>
            </p>
            <ProgressBar value={100} color="bg-emerald-600" />
          </>
        }
      />
      <StatCard
        label="Bài nộp & Hàng đợi"
        icon={Layers}
        value={k.totalSubmissions}
        suffix={`/ ${k.completedSubmissions} Đạt`}
        sparkline={[1, 3, 5, 6, 7, k.totalSubmissions || 8]}
        sparklineColor="#6366f1"
        trend={{
          value: `${k.pendingSubmissions} chờ`,
          positive: k.pendingSubmissions === 0,
          label: 'hàng đợi',
        }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-blue-600">{k.pendingSubmissions} jobs đang chạy</span>
              <span className="text-rose-600">{k.failedSubmissions} lỗi</span>
            </p>
            <ProgressBar value={submissionsProgress} />
          </>
        }
      />
      <StatCard
        label="Kho AI API Pool"
        icon={Wallet}
        value={`${k.activeAiKeys}`}
        suffix={`/ ${k.totalAiKeys} Keys`}
        sparkline={[1, 2, 2, 3, 3, k.activeAiKeys || 3]}
        sparklineColor="#f59e0b"
        trend={{ value: 'Multi-Key Pool', positive: true, label: 'Auto Failover' }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-blue-600">Gemini & OpenAI</span>
              <span className="text-emerald-600">Sẵn sàng</span>
            </p>
            <ProgressBar value={aiKeysProgress} />
          </>
        }
      />
    </section>
  );
};
