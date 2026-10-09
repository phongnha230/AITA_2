'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, KeyRound, PlusCircle, RefreshCw, Search, ShieldCheck, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '../../../../lib/errors';
import { USE_MOCK } from '../../../../config/mock';
import { AlertBox } from '../../../../components/feedback/AlertBox';
import { LoadingSpinner } from '../../../../components/feedback/LoadingSpinner';
import { useAiKeys } from '../../hooks/useAiKeys';
import { adminAiKeyService } from '../../services/admin-ai-key.service';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Input } from '@/components/ui/input';
import type { AiApiKey, AiProvider } from '../../types/admin.types';
import { AddKeyModal } from './AddKeyModal';
import { KeysTable } from './KeysTable';
import { RouterSettings } from './RouterSettings';
import { TrafficStats } from './TrafficStats';

type Filter = 'ALL' | AiProvider;
const PAGE_SIZE = 4;
const PROVIDER_LABEL: Record<AiProvider, string> = { OPENAI: 'OpenAI', GEMINI: 'Google Gemini', ANTHROPIC: 'Anthropic', DEEPSEEK: 'DeepSeek' };

const MiniStat: React.FC<{ label: string; icon: React.ReactNode; iconClass: string; children: React.ReactNode }> = ({ label, icon, iconClass, children }) => (
  <Card interactive className="flex flex-col justify-between gap-4">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', iconClass)}>{icon}</span>
    </div>
  </Card>
);

export const AiKeysPage: React.FC = () => {
  const { keys, loading, error, reload, remove, setActive } = useAiKeys();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const toast = useToast();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => setPage(1), [filter, search]);

  const active = keys.filter((k) => k.isActive).length;
  const used = keys.reduce((s, k) => s + k.currentRequestsToday, 0);
  const limit = keys.reduce((s, k) => s + k.dailyRequestLimit, 0);
  const throttled = keys.filter((k) => k.consecutiveFailures >= 3).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return keys.filter((k) => (filter === 'ALL' || k.provider === filter) && (!q || `${k.keyAlias} ${k.purposeTitle ?? ''} ${k.keyPreview ?? ''}`.toLowerCase().includes(q)));
  }, [keys, filter, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageProviders = (p: AiProvider) => keys.slice(0, PAGE_SIZE).filter((k) => k.provider === p).length;

  const tabs: { id: Filter; label: string }[] = [
    { id: 'ALL', label: `Tất cả (${PAGE_SIZE})` },
    ...(['OPENAI', 'GEMINI', 'ANTHROPIC', 'DEEPSEEK'] as AiProvider[]).map((p) => ({ id: p, label: `${PROVIDER_LABEL[p]} (${filter === 'ALL' ? pageProviders(p) : keys.filter((k) => k.provider === p).length})` })),
  ];

  const guard = async (task: () => Promise<void>, fallback: string) => {
    setActionError(null);
    try {
      await task();
    } catch (e) {
      setActionError(getErrorMessage(e, fallback));
    }
  };

  const handleDelete = (key: AiApiKey) => {
    if (!window.confirm(`Xóa khóa "${key.keyAlias}"? Thao tác không thể hoàn tác.`)) return;
    void guard(async () => {
      await remove(key.id);
      toast.success(`Đã xóa ${key.keyAlias}.`);
    }, 'Không xóa được khóa.');
  };

  const healthCheck = async () => {
    setChecking(true);
    try {
      const { healthy, total } = await adminAiKeyService.healthCheck();
      await reload();
      toast.success(`Kiểm tra xong: ${healthy}/${total} khóa phản hồi bình thường.`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Không kiểm tra được sức khỏe khóa.'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-600 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> AI Router Engine Active <span className="text-blue-700">• Smart Load Balance 4.2</span>
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Kho Khóa AI Keys &amp; Rate Limit</h1>
            <p className="text-sm leading-relaxed text-slate-700">Quản trị phân bổ API Key (OpenAI, Gemini Pro, Anthropic Claude, DeepSeek) phục vụ AI Rubric và AI Socratic Tutor. Hệ thống tự cách ly Key, chuyển vùng (Failover) và cân bằng tải khi chạm ngưỡng.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white" disabled={checking} onClick={() => void healthCheck()}>
              <ShieldCheck className={cn('h-4 w-4 text-blue-600', checking && 'animate-pulse')} /> {checking ? 'Đang kiểm tra...' : 'Kiểm tra sức khỏe toàn bộ'}
            </Button>
            <Button variant="primary" onClick={() => setAdding(true)}><PlusCircle className="h-4 w-4" /> Thêm Khóa API mới</Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="API Keys kích hoạt" iconClass="bg-blue-50 text-blue-600" icon={<KeyRound className="h-5 w-5" />}>
          <p className="text-3xl font-bold text-slate-900">{active} <span className="text-base font-medium text-slate-500">/ {keys.length} Keys</span></p>
          <ProgressBar className="mt-3" value={keys.length ? (active / keys.length) * 100 : 0} />
          <p className="mt-1.5 flex justify-between text-[11px] font-semibold"><span className="text-emerald-600">{keys.length ? Math.round((active / keys.length) * 100) : 0}% đang hoạt động</span><span className="text-slate-500">{keys.length - active} Keys dự phòng</span></p>
        </MiniStat>
        <MiniStat label="Tỷ lệ thành công (SR)" iconClass="bg-emerald-50 text-emerald-600" icon={<CheckCircle2 className="h-5 w-5" />}>
          <p className="text-3xl font-bold text-emerald-600">99.85%</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600"><Activity className="h-3.5 w-3.5" /> Latency tb: 640ms</p>
        </MiniStat>
        <MiniStat label="Chi phí tháng hiện tại" iconClass="bg-blue-50 text-blue-600" icon={<Wallet className="h-5 w-5" />}>
          <p className="text-3xl font-bold text-slate-900">$142.60 <span className="text-sm font-medium text-slate-500">/ $500 max</span></p>
          <ProgressBar className="mt-3" value={28.5} />
          <p className="mt-1.5 flex justify-between text-[11px] font-semibold"><span className="text-slate-600">Đã dùng: 28.5% Budget</span><span className="text-emerald-600">An toàn</span></p>
        </MiniStat>
        <MiniStat label="Cảnh báo Rate Limit" iconClass="bg-emerald-50 text-emerald-600" icon={<CheckCircle2 className="h-5 w-5" />}>
          <p className="text-3xl font-bold text-slate-900">{throttled} <span className="text-base font-medium text-slate-500">Key</span></p>
          <p className="mt-3 text-[11px] font-semibold text-slate-600">Cơ chế xoay vòng: Active • <span className="text-emerald-600">{throttled ? 'Cần kiểm tra' : 'Không tắc nghẽn'}</span></p>
          <p className="text-[11px] text-slate-400">{used.toLocaleString('en-US')} / {limit.toLocaleString('en-US')} req hôm nay</p>
        </MiniStat>
      </section>

      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors', filter === t.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khóa hoặc mục đích..."
              className="h-10 w-full rounded-lg border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-600 focus:bg-white"
            />
          </div>
          <Button variant="outline" size="icon" onClick={reload} aria-label="Làm mới" className="h-10 w-10 shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {actionError && <AlertBox message={actionError} />}
      {error ? (
        <AlertBox message={error} onRetry={reload} />
      ) : loading && keys.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <KeysTable
          keys={visible}
          total={keys.length}
          allCount={filtered.length}
          page={page}
          pages={pages}
          canToggle={true}
          onPage={setPage}
          onToggle={(k, next) =>
            void guard(async () => {
              await setActive(k.id, next);
              toast.info(`${k.keyAlias}: ${next ? 'đã bật' : 'đã chuyển sang Standby'}.`);
            }, 'Không đổi được trạng thái khóa.')
          }
          onDelete={handleDelete}
        />
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RouterSettings /></div>
        <TrafficStats />
      </section>
      <AddKeyModal open={adding} onClose={() => setAdding(false)} onCreated={() => { toast.success('Đã thêm khóa API mới.'); void reload(); }} />
    </>
  );
};
