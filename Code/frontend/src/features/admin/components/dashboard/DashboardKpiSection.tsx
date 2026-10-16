'use client';

import * as React from 'react';
import { Users, Boxes, Layers, Wallet } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { ProgressBar } from '../ui/ProgressBar';
import type { AdminDashboardData } from '../../services/admin-dashboard.service';

interface DashboardKpiSectionProps {
  realData: AdminDashboardData;
}

function computeKpiValues(realData: AdminDashboardData) {
  const k = realData.kpis;

  const usersProgress = k.totalUsers > 0
    ? Math.min(100, Math.round((k.totalStudents / k.totalUsers) * 100))
    : 0;

  const submissionsProgress = k.totalSubmissions > 0
    ? Math.min(100, Math.round(((k.completedSubmissions || 0) / k.totalSubmissions) * 100))
    : 0;

  const aiKeysProgress = k.totalAiKeys > 0
    ? Math.round(((k.activeAiKeys || 0) / k.totalAiKeys) * 100)
    : 0;

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
        sparklineColor="#2563eb"
        trend={{
          value: `${k.totalLecturers} GV`,
          positive: true,
          label: `${k.totalAdmins} Admin`,
        }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-600">Tài khoản đã ghi nhận</span>
              <span className="text-slate-600">{k.totalUsers}</span>
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
        sparklineColor="#10b981"
        trend={{ value: `${k.totalAssignments} bài`, positive: true, label: 'đã tạo' }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-600">Khóa học trong hệ thống</span>
              <span className="text-slate-600">{k.totalCourses}</span>
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
        sparklineColor="#f59e0b"
        trend={{ value: `${k.activeAiKeys}`, positive: k.activeAiKeys > 0, label: 'đang bật' }}
        footer={
          <>
            <p className="flex justify-between text-[11px] font-medium">
              <span className="text-slate-600">API keys đang bật</span>
              <span className="text-slate-600">{k.activeAiKeys} / {k.totalAiKeys}</span>
            </p>
            <ProgressBar value={aiKeysProgress} />
          </>
        }
      />
    </section>
  );
};
