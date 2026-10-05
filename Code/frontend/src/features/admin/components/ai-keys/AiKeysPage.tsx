'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Gauge, KeyRound, Plus, ShieldCheck, Wallet } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { getErrorMessage } from '../../../../lib/errors';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { useAiKeys } from '../../hooks/useAiKeys';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { ProgressBar } from '../ui/ProgressBar';
import { StatCard } from '../ui/StatCard';
import type { AiApiKey, AiProvider } from '../../types/admin.types';
import { AddKeyModal } from './AddKeyModal';
import { KeysTable } from './KeysTable';
import { RouterSettings } from './RouterSettings';

type Filter = 'ALL' | AiProvider;

export const AiKeysPage: React.FC = () => {
  const { keys, loading, error, reload, remove } = useAiKeys();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const active = keys.filter((k) => k.isActive).length;
    const used = keys.reduce((s, k) => s + k.currentRequestsToday, 0);
    const limit = keys.reduce((s, k) => s + k.dailyRequestLimit, 0);
    const failing = keys.filter((k) => k.consecutiveFailures >= 3).length;
    return { active, used, limit, failing, pct: limit ? Math.round((used / limit) * 100) : 0 };
  }, [keys]);

  const count = (p: AiProvider) => keys.filter((k) => k.provider === p).length;
  const visible = keys.filter((k) => filter === 'ALL' || k.provider === filter);

  const tabs: { id: Filter; label: string }[] = [
    { id: 'ALL', label: `Tất cả (${keys.length})` },
    { id: 'OPENAI', label: `OpenAI (${count('OPENAI')})` },
    { id: 'GEMINI', label: `Google Gemini (${count('GEMINI')})` },
  ];

  const handleDelete = async (key: AiApiKey) => {
    if (!window.confirm(`Xóa khóa "${key.keyAlias}"? Thao tác không thể hoàn tác.`)) return;
    setActionError(null);
    try {
      await remove(key.id);
    } catch (e) {
      setActionError(getErrorMessage(e, 'Không xóa được khóa.'));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> AI Router Engine Active
          </span>
        }
        title="Kho Khóa AI Keys & Rate Limit"
        description="Quản trị phân bổ API Key (OpenAI, Gemini) phục vụ AI Rubric và AI Socratic Tutor. Hệ thống tự cách ly Key và kích hoạt Failover khi chạm ngưỡng."
        actions={
          <>
            <Button onClick={reload}><ShieldCheck className="h-4 w-4" /> Kiểm tra sức khỏe toàn bộ</Button>
            <Button variant="primary" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Thêm Khóa API mới</Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="API Keys kích hoạt" icon={KeyRound} value={stats.active} suffix={`/ ${keys.length} Keys`} footer={<ProgressBar value={keys.length ? (stats.active / keys.length) * 100 : 0} />} />
        <StatCard label="Quota đã dùng hôm nay" icon={Gauge} value={`${stats.pct}%`} footer={<ProgressBar value={stats.pct} color={stats.pct >= 80 ? 'bg-rose-600' : 'bg-emerald-600'} />} iconClassName="text-emerald-600" />
        <StatCard label="Requests hôm nay" icon={Wallet} value={stats.used.toLocaleString('vi-VN')} suffix={`/ ${stats.limit.toLocaleString('vi-VN')}`} />
        <StatCard label="Key lỗi liên tiếp (≥3)" icon={CheckCircle2} value={stats.failing} suffix="Key" iconClassName={stats.failing ? 'text-rose-600' : 'text-emerald-600'} footer={<p className="text-xs font-medium text-slate-500">{stats.failing ? 'Cần kiểm tra ngay' : 'Không tắc nghẽn'}</p>} />
      </section>

      <Card className="flex flex-wrap items-center gap-2 p-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors', filter === t.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
          >
            {t.label}
          </button>
        ))}
      </Card>

      {actionError && <AlertBox message={actionError} />}
      {error ? <AlertBox message={error} onRetry={reload} /> : loading ? <LoadingSpinner /> : <KeysTable keys={visible} onDelete={handleDelete} />}

      <RouterSettings />
      <AddKeyModal open={adding} onClose={() => setAdding(false)} onCreated={reload} />
    </>
  );
};
