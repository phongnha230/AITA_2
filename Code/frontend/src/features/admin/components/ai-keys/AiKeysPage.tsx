'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpDown,
  CheckCircle2,
  Filter,
  KeyRound,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '../../../../lib/errors';
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

type ProviderFilter = 'ALL' | AiProvider;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'AVAILABLE' | 'COOLDOWN' | 'QUOTA_EXHAUSTED' | 'WARNING';
type SortOption = 'NEWEST' | 'OLDEST' | 'USAGE_DESC' | 'USAGE_ASC' | 'RPM_DESC' | 'NAME_ASC' | 'NAME_DESC';

const PROVIDER_LABEL: Record<AiProvider, string> = {
  GEMINI: 'Google Gemini',
  OPENAI: 'OpenAI',
  ANTHROPIC: 'Anthropic Claude',
  DEEPSEEK: 'DeepSeek',
};

const MiniStat: React.FC<{ label: string; icon: React.ReactNode; iconClass: string; children: React.ReactNode }> = ({
  label,
  icon,
  iconClass,
  children,
}) => (
  <Card interactive className="flex flex-col justify-between gap-4">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', iconClass)}>{icon}</span>
    </div>
  </Card>
);

export const AiKeysPage: React.FC = () => {
  const { keys, loading, error, reload, remove, setActive } = useAiKeys();
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const toast = useToast();
  const [actionError, setActionError] = useState<string | null>(null);

  // Reset to first page whenever filtering/sorting changes
  useEffect(() => {
    setPage(1);
  }, [providerFilter, statusFilter, sortBy, pageSize, search]);

  const active = keys.filter((k) => k.isActive).length;
  const used = keys.reduce((s, k) => s + k.currentRequestsToday, 0);
  const limit = keys.reduce((s, k) => s + k.dailyRequestLimit, 0);
  const throttled = keys.filter((k) => k.consecutiveFailures >= 3).length;

  const keysWithLatency = keys.filter((k) => typeof k.latencyMs === 'number' && k.latencyMs > 0);
  const avgLatency =
    keysWithLatency.length > 0
      ? Math.round(keysWithLatency.reduce((s, k) => s + (k.latencyMs || 0), 0) / keysWithLatency.length)
      : null;

  const isFiltered = providerFilter !== 'ALL' || statusFilter !== 'ALL' || sortBy !== 'NEWEST' || search.trim() !== '';

  const resetFilters = () => {
    setProviderFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('NEWEST');
    setSearch('');
    setPage(1);
  };

  // Filter & Sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = keys.filter((k) => {
      // 1. Provider filter
      if (providerFilter !== 'ALL' && k.provider !== providerFilter) {
        return false;
      }
      // 2. Status filter
      if (statusFilter === 'ACTIVE' && !k.isActive) return false;
      if (statusFilter === 'INACTIVE' && k.isActive) return false;
      if (statusFilter === 'AVAILABLE' && k.availabilityStatus !== 'AVAILABLE') return false;
      if (statusFilter === 'COOLDOWN' && k.availabilityStatus !== 'COOLDOWN') return false;
      if (statusFilter === 'QUOTA_EXHAUSTED' && k.availabilityStatus !== 'QUOTA_EXHAUSTED') return false;
      if (statusFilter === 'WARNING' && k.consecutiveFailures === 0) return false;

      // 3. Search query
      if (q) {
        const text = `${k.keyAlias} ${k.purposeTitle ?? ''} ${k.keyPreview ?? ''} ${k.keyHint ?? ''} ${k.provider}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });

    // 4. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'OLDEST':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'USAGE_DESC':
          return b.currentRequestsToday - a.currentRequestsToday;
        case 'USAGE_ASC':
          return a.currentRequestsToday - b.currentRequestsToday;
        case 'RPM_DESC':
          return b.rpmLimit - a.rpmLimit;
        case 'NAME_ASC':
          return a.keyAlias.localeCompare(b.keyAlias, 'vi');
        case 'NAME_DESC':
          return b.keyAlias.localeCompare(a.keyAlias, 'vi');
        case 'NEWEST':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [keys, providerFilter, statusFilter, sortBy, search]);

  const effectivePageSize = pageSize === 0 ? Math.max(1, filtered.length) : pageSize;
  const pages = Math.max(1, Math.ceil(filtered.length / effectivePageSize));
  const visible = filtered.slice((page - 1) * effectivePageSize, page * effectivePageSize);

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
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-600 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> AI Router Engine Active{' '}
              <span className="text-blue-700">• Smart Load Balance 4.2</span>
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Kho Khóa AI Keys &amp; Rate Limit</h1>
            <p className="text-sm leading-relaxed text-slate-700">
              Quản trị phân bổ API Key (Google Gemini, OpenAI, Claude, DeepSeek) phục vụ AI Rubric và AI Socratic Tutor.
              Hệ thống tự xoay vòng key, chuyển vùng (Failover) và cách ly tự động khi chạm ngưỡng.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white hover:bg-slate-50 text-slate-800 shadow-sm" disabled={checking} onClick={() => void healthCheck()}>
              <ShieldCheck className={cn('size-4 text-blue-600', checking && 'animate-pulse')} />{' '}
              {checking ? 'Đang kiểm tra...' : 'Kiểm tra sức khỏe toàn bộ'}
            </Button>
            <Button variant="primary" onClick={() => setAdding(true)}>
              <PlusCircle className="size-4" /> Thêm Khóa API mới
            </Button>
          </div>
        </div>
      </section>

      {/* Mini Stats Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="API Keys kích hoạt" iconClass="bg-blue-50 text-blue-600" icon={<KeyRound className="size-5" />}>
          <p className="text-3xl font-bold text-slate-900">
            {active} <span className="text-base font-medium text-slate-500">/ {keys.length} Keys</span>
          </p>
          <ProgressBar className="mt-3" value={keys.length ? (active / keys.length) * 100 : 0} label="Tỷ lệ API keys đang hoạt động" />
          <p className="mt-1.5 flex justify-between text-xs font-semibold">
            <span className="text-emerald-600">{keys.length ? Math.round((active / keys.length) * 100) : 0}% đang hoạt động</span>
            <span className="text-slate-500">{keys.length - active} Keys dự phòng</span>
          </p>
        </MiniStat>
        <MiniStat label="Latency trung bình" iconClass="bg-emerald-50 text-emerald-600" icon={<Activity className="size-5" />}>
          <p className="text-3xl font-bold text-emerald-600">{avgLatency === null ? '—' : `${avgLatency} ms`}</p>
          <p className="mt-3 text-xs font-semibold text-slate-600">{keysWithLatency.length} khóa có dữ liệu đo latency</p>
        </MiniStat>
        <MiniStat label="Lượt gọi API hôm nay" iconClass="bg-blue-50 text-blue-600" icon={<Wallet className="size-5" />}>
          <p className="text-3xl font-bold text-slate-900">
            {used.toLocaleString('vi-VN')} <span className="text-sm font-medium text-slate-500">/ {limit.toLocaleString('vi-VN')}</span>
          </p>
          <ProgressBar className="mt-3" value={limit > 0 ? Math.min(100, (used / limit) * 100) : 0} label="Tỷ lệ lượt gọi API đã dùng hôm nay" />
          <p className="mt-1.5 text-xs font-semibold text-slate-600">Tổng quota ngày đã cấp phát</p>
        </MiniStat>
        <MiniStat label="Cảnh báo Rate Limit" iconClass="bg-emerald-50 text-emerald-600" icon={<CheckCircle2 className="size-5" />}>
          <p className="text-3xl font-bold text-slate-900">
            {throttled} <span className="text-base font-medium text-slate-500">Khóa</span>
          </p>
          <p className="mt-3 text-xs font-semibold text-slate-600">Khóa có ≥ 3 lỗi liên tiếp cần lưu ý</p>
          <p className="text-xs text-slate-400">
            {used.toLocaleString('en-US')} / {limit.toLocaleString('en-US')} req
          </p>
        </MiniStat>
      </section>

      {/* Rich Dropdown Filters Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Dropdown Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter icon / label */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pr-1">
              <Filter className="size-3.5 text-blue-600" /> Bộ lọc:
            </div>

            {/* Provider Select */}
            <div className="relative">
              <select
                aria-label="Lọc theo nhà cung cấp"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value as ProviderFilter)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">Tất cả Providers ({keys.length})</option>
                <option value="GEMINI">Google Gemini ({keys.filter((k) => k.provider === 'GEMINI').length})</option>
                <option value="OPENAI">OpenAI ({keys.filter((k) => k.provider === 'OPENAI').length})</option>
                <option value="ANTHROPIC">Claude Anthropic ({keys.filter((k) => k.provider === 'ANTHROPIC').length})</option>
                <option value="DEEPSEEK">DeepSeek ({keys.filter((k) => k.provider === 'DEEPSEEK').length})</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="relative">
              <select
                aria-label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang bật (Active)</option>
                <option value="INACTIVE">Đang tắt (Standby)</option>
                <option value="AVAILABLE">Sẵn sàng (Available)</option>
                <option value="COOLDOWN">Đang Cooldown (Tạm dừng)</option>
                <option value="QUOTA_EXHAUSTED">Cạn Quota (Hết hạn mức)</option>
                <option value="WARNING">Có cảnh báo lỗi (Failures &gt; 0)</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <select
                aria-label="Sắp xếp danh sách"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="NEWEST">Sắp xếp: Mới nhất</option>
                <option value="OLDEST">Sắp xếp: Cũ nhất</option>
                <option value="USAGE_DESC">Sắp xếp: Dùng nhiều nhất</option>
                <option value="USAGE_ASC">Sắp xếp: Dùng ít nhất</option>
                <option value="RPM_DESC">Sắp xếp: RPM cao nhất</option>
                <option value="NAME_ASC">Sắp xếp: Tên A → Z</option>
                <option value="NAME_DESC">Sắp xếp: Tên Z → A</option>
              </select>
            </div>

            {/* Page Size Select */}
            <div className="relative">
              <select
                aria-label="Số dòng hiển thị mỗi trang"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value={5}>5 khóa / trang</option>
                <option value={10}>10 khóa / trang</option>
                <option value={20}>20 khóa / trang</option>
                <option value={0}>Tất cả ({keys.length})</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-9 gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
              >
                <RotateCcw className="size-3.5" /> Đặt lại bộ lọc
              </Button>
            )}
          </div>

          {/* Right: Search Box + Reload */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, hint, mục đích..."
                className="h-9 w-full rounded-lg border-slate-200 bg-slate-50 pl-9 pr-8 text-xs focus:border-blue-600 focus:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Xóa nội dung tìm kiếm"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={reload}
              aria-label="Làm mới dữ liệu"
              className="size-9 shrink-0 hover:bg-slate-50"
            >
              <RefreshCw className={cn('size-4 text-slate-600', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Quick Filter Tag Summary */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Kết quả: <strong className="text-slate-800">{filtered.length}</strong> / {keys.length} khóa
            </span>
            {providerFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
                Provider: {PROVIDER_LABEL[providerFilter]}
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                Trạng thái: {statusFilter}
              </span>
            )}
            {sortBy !== 'NEWEST' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                <ArrowUpDown className="size-3 text-slate-400" /> {sortBy}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400">
            {pageSize > 0 ? `Hiển thị tối đa ${pageSize} khóa / trang` : 'Hiển thị toàn bộ khóa'}
          </div>
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
          total={filtered.length}
          allCount={keys.length}
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

      {/* Note: Removed 2 redundant bottom sections (RouterSettings and TrafficStats) as requested */}
      <AddKeyModal
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={() => {
          toast.success('Đã thêm khóa API mới.');
          void reload();
        }}
      />
    </>
  );
};
