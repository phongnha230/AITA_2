'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Server } from 'lucide-react';
import api from '@/lib/api';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';

interface SandboxStatus {
  dockerDaemonRunning: boolean;
  playwrightSandboxAvailable: boolean;
  playwrightSandboxImage: string;
  activeMode: string;
  activeExecutions: number;
  totalGradedCount: number;
  failedExecutions: number;
  limits: { minTimeoutMs: number; maxTimeoutMs: number; minMemoryMb: number; maxMemoryMb: number; maxTestCases: number };
}

export const DockerPage: React.FC = () => {
  const [status, setStatus] = useState<SandboxStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sandbox/status');
      setStatus(response.data?.data ?? null);
      if (!response.data?.data) throw new Error('Backend không trả trạng thái Sandbox.');
    } catch (loadError) {
      console.error('Không tải được trạng thái Sandbox cho Admin:', loadError);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStatus(); }, [loadStatus]);

  return (
    <>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2"><Server className="h-4 w-4" /> Trạng thái Sandbox từ backend</span>}
        title="Giám sát Docker Sandbox"
        description="Thông tin daemon, chế độ thực thi và số liệu chấm do API Sandbox cung cấp."
        actions={<Button onClick={() => void loadStatus()}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới</Button>}
      />

      {error ? <AlertBox message={error} onRetry={() => void loadStatus()} /> : null}
      {loading && !status ? <LoadingSpinner /> : null}
      {status ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="space-y-2">
            <p className="text-xs text-slate-500">Docker daemon</p>
            <Badge tone={status.dockerDaemonRunning ? 'student' : 'admin'} dot>{status.dockerDaemonRunning ? 'Sẵn sàng' : 'Không khả dụng'}</Badge>
            <p className="text-xs text-slate-500">Chế độ: {status.activeMode}</p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-slate-500">Chromium sandbox cho React/Web</p>
            <Badge tone={status.playwrightSandboxAvailable ? 'student' : 'admin'} dot>
              {status.playwrightSandboxAvailable ? 'Sẵn sàng' : 'Chưa sẵn sàng'}
            </Badge>
            <p className="break-all text-xs text-slate-500">Image: {status.playwrightSandboxImage}</p>
          </Card>
          <Card className="space-y-2"><p className="text-xs text-slate-500">Lượt chạy hiện tại</p><p className="text-3xl font-bold text-slate-900">{status.activeExecutions}</p></Card>
          <Card className="space-y-2"><p className="text-xs text-slate-500">Tổng lượt đã chấm</p><p className="text-3xl font-bold text-slate-900">{status.totalGradedCount}</p></Card>
          <Card className="space-y-2"><p className="text-xs text-slate-500">Lượt chạy thất bại</p><p className="text-3xl font-bold text-rose-700">{status.failedExecutions}</p></Card>
          <Card className="space-y-2 sm:col-span-2"><p className="text-sm font-semibold text-slate-900">Giới hạn Sandbox từ API</p><p className="text-sm text-slate-600">Timeout: {status.limits.minTimeoutMs}–{status.limits.maxTimeoutMs} ms · RAM: {status.limits.minMemoryMb}–{status.limits.maxMemoryMb} MB · Tối đa {status.limits.maxTestCases} testcase</p></Card>
        </section>
      ) : null}
    </>
  );
};
