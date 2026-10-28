'use client';

import * as React from 'react';
import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { adminDashboardService, type AdminDashboardData } from '../../services/admin-dashboard.service';
import { DashboardKpiSection } from './DashboardKpiSection';
import { DashboardChartsSection } from './DashboardChartsSection';
import { OpsEventsTable } from './OpsEventsTable';
import { RecentSubmissionsSection } from './RecentSubmissionsSection';
import { DashboardFooterLinks } from './DashboardFooterLinks';
import { downloadFile } from '../../../../lib/download';
import { getErrorMessage } from '../../../../lib/errors';

export const DashboardPage: React.FC = () => {
  const toast = useToast();
  const [spinning, setSpinning] = useState(false);
  const [realData, setRealData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminDashboardService.getDashboard();
      if (!res) throw new Error('Backend không trả dữ liệu dashboard.');
      setRealData(res);
      return true;
    } catch (loadError) {
      console.error('Không tải được admin dashboard:', loadError);
      setError(getErrorMessage(loadError));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const refresh = async () => {
    setSpinning(true);
    const loaded = await loadData();
    setSpinning(false);
    if (loaded) toast.success('Đã cập nhật toàn bộ biểu đồ & dữ liệu vận hành thời gian thực.');
  };

  const exportReport = () => {
    if (!realData) return;
    const report = {
      title: 'AITA Admin System Analytics Report',
      exportedAt: new Date().toISOString(),
      kpis: realData.kpis,
      submissionOutcomes: realData.submissionOutcomes,
      languageDistribution: realData.languageDistribution,
      roomClusterLoad: realData.roomClusterLoad,
      recentSubmissions: realData.recentSubmissions,
    };
    downloadFile(
      `aita-admin-analytics-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(report, null, 2),
      'application/json'
    );
    toast.success('Đã xuất báo cáo tổng quan hệ thống.');
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-blue-700">
              <span className="size-1.5 rounded-full bg-blue-600" /> Dữ liệu hệ thống
            </span>
            <span>Số liệu tổng hợp thời gian thực từ cơ sở dữ liệu hiện tại</span>
          </>
        }
        title="Tổng quan hệ thống"
        description="Giám sát lưu lượng nộp bài, phân bổ ngôn ngữ, tải phòng LAB và trạng thái các phân hệ vận hành."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportReport} disabled={!realData}>
              <Download className="size-4" /> Xuất báo cáo
            </Button>
            <Button variant="primary" onClick={refresh} disabled={spinning}>
              Làm mới <RefreshCw className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      {error ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}{' '}
          <button type="button" className="ml-2 font-semibold underline" onClick={refresh}>
            Thử lại
          </button>
        </div>
      ) : null}

      {loading && !realData ? (
        <div role="status" className="flex items-center justify-center rounded-xl bg-white p-12 text-sm text-slate-500 shadow-sm">
          <RefreshCw className="mr-2 size-5 animate-spin text-blue-600" /> Đang tải biểu đồ và dữ liệu hệ thống…
        </div>
      ) : null}

      {realData ? (
        <div className="space-y-6">
          <DashboardKpiSection realData={realData} />
          <DashboardChartsSection realData={realData} />
          <OpsEventsTable events={realData.opsEvents} />
          <RecentSubmissionsSection submissions={realData.recentSubmissions} />
        </div>
      ) : null}

      <DashboardFooterLinks />
    </>
  );
};
