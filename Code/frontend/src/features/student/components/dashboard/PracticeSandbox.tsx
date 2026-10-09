'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Cpu, RefreshCw, TerminalSquare } from 'lucide-react';
import type { ResourceState, SandboxStatus } from '../../types/student.types';

interface PracticeSandboxProps {
  state: ResourceState<SandboxStatus | null>;
  onRetry: () => void;
}

export function PracticeSandbox({ state, onRetry }: PracticeSandboxProps) {
  const isReady = state.status === 'success' && state.data?.status === 'READY';
  const statusLabel = state.status === 'loading'
    ? 'Đang kiểm tra kết nối'
    : state.status === 'error'
      ? 'Chưa kết nối máy chủ'
      : isReady
        ? 'Sẵn sàng (Online)'
        : 'Chưa kích hoạt';

  return (
    <section
      aria-label="Môi trường Sandbox"
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200/80">
          <TerminalSquare aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isReady
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : state.status === 'loading'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isReady
                  ? 'bg-emerald-500 animate-pulse'
                  : state.status === 'loading'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-400'
              }`}
            />
            {statusLabel}
          </span>
          {state.status === 'error' && (
            <button
              type="button"
              onClick={onRetry}
              aria-label="Kiểm tra lại trạng thái Sandbox"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-900">Môi trường Docker Sandbox</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Hạ tầng container cô lập an toàn, biên dịch tự động và chấm testcase thời gian thực.
      </p>

      {state.status === 'success' && state.data && (
        <dl className="mt-4 space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <dt className="text-slate-500">Chế độ thực thi:</dt>
            <dd className="font-bold text-slate-800">{state.data.activeMode || 'Docker Isolated'}</dd>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <dt className="text-slate-500">Docker Daemon:</dt>
            {state.data.dockerDaemonRunning ? (
              <dd className="flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đang chạy</span>
              </dd>
            ) : (
              <dd className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Chưa kích hoạt</span>
              </dd>
            )}
          </div>
          {state.data.supportedLanguages && state.data.supportedLanguages.length > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <dt className="text-slate-500">Trình biên dịch:</dt>
              <dd className="font-bold text-slate-800 uppercase">
                {state.data.supportedLanguages.join(' · ')}
              </dd>
            </div>
          )}
        </dl>
      )}

      {state.status === 'error' && state.error && (
        <p className="mt-3 text-xs text-rose-600">{state.error}</p>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href="/student/exams"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-xs font-bold text-slate-700 shadow-2xs transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-elevated-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Cpu aria-hidden="true" className="h-4 w-4 text-blue-600" />
          <span>Xem bài thi sử dụng Sandbox</span>
          <ArrowRight aria-hidden="true" className="ml-auto h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </section>
  );
}

