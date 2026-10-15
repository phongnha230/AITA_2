'use client';

import * as React from 'react';
import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { downloadFile } from '../../../../lib/download';
import {
  ROOM_CLUSTER_LOAD,
  SUBMISSION_OUTCOMES,
  LANGUAGE_DISTRIBUTION,
} from './dashboard.constants';
import {
  LIVE_SESSIONS,
  OPS_EVENTS,
} from '../../mocks/ops.mock';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { OpsEventsTable } from './OpsEventsTable';
import { adminDashboardService, type AdminDashboardData } from '../../services/admin-dashboard.service';
import { DashboardKpiSection } from './DashboardKpiSection';
import { DashboardChartsSection } from './DashboardChartsSection';
import { DashboardFooterLinks } from './DashboardFooterLinks';

export const DashboardPage: React.FC = () => {
  const toast = useToast();
  const [spinning, setSpinning] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [realData, setRealData] = useState<AdminDashboardData | null>(null);

  const loadData = React.useCallback(async () => {
    const res = await adminDashboardService.getDashboard();
    if (res) setRealData(res);
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const refresh = async () => {
    setSpinning(true);
    await loadData();
    setSpinning(false);
    setUpdatedAt(new Date().toLocaleTimeString('vi-VN'));
    toast.success('Đã cập nhật toàn bộ biểu đồ & dữ liệu vận hành thời gian thực.');
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      kpis: realData?.kpis || {
        totalUsers: 0,
        totalStudents: 0,
        totalLecturers: 0,
        totalCourses: 0,
        totalSubmissions: 0,
      },
      submissionOutcomes: realData?.submissionOutcomes || SUBMISSION_OUTCOMES,
      languageDistribution: realData?.languageDistribution || LANGUAGE_DISTRIBUTION,
      roomClusterLoad: realData?.roomClusterLoad || ROOM_CLUSTER_LOAD,
      liveSessions: realData?.liveSessions || LIVE_SESSIONS,
      events: realData?.opsEvents || OPS_EVENTS,
    };
    downloadFile('aita-ops-report.json', JSON.stringify(report, null, 2), 'application/json');
    toast.success('Đã xuất báo cáo số liệu và biểu đồ vận hành thời gian thực (JSON).');
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-emerald-700">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-600" /> Live Ops Telemetry
            </span>
            <span>Hệ thống chấm tự động đa cụm • Database Đồng bộ</span>
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

      <DashboardKpiSection realData={realData} />

      <DashboardChartsSection realData={realData} />

      <OpsEventsTable events={realData?.opsEvents} />

      <DashboardFooterLinks />
    </>
  );
};
