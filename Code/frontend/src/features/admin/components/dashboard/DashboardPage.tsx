'use client';

import * as React from 'react';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { PageHeader } from '../ui/PageHeader';
import { adminDashboardService, type AdminDashboardData } from '../../services/admin-dashboard.service';
import { DashboardKpiSection } from './DashboardKpiSection';
import { DashboardChartsSection } from './DashboardChartsSection';
import { DashboardFooterLinks } from './DashboardFooterLinks';
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
    if (loaded) toast.success('Đã cập nhật dữ liệu dashboard.');
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Dữ liệu hệ thống
            </span>
            <span>Số liệu tổng hợp từ cơ sở dữ liệu hiện tại</span>
          </>
        }
        title="Tổng quan hệ thống"
        description="Thống kê người dùng, khóa học và bài nộp hiện có trong hệ thống."
        actions={
          <Button variant="primary" onClick={refresh}>
              Làm mới <RefreshCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
          </Button>
        }
      />

      {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error} <button type="button" className="ml-2 font-semibold underline" onClick={refresh}>Thử lại</button></div> : null}
      {loading && !realData ? <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-500">Đang tải dữ liệu…</p> : null}
      {realData ? <>
        <DashboardKpiSection realData={realData} />
        <DashboardChartsSection realData={realData} />
      </> : null}

      <DashboardFooterLinks />
    </>
  );
};
