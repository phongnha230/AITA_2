'use client';

import * as React from 'react';

interface DockerStatusBannerProps {
  sandboxStatus: {
    dockerDaemonRunning?: boolean;
    activeMode?: string;
    localJavaVersion?: string;
    limits?: {
      defaultTimeoutMs?: number;
      defaultMemoryLimitMb?: number;
      networkIsolation?: boolean;
    };
  } | null;
}

export const DockerStatusBanner: React.FC<DockerStatusBannerProps> = ({ sandboxStatus }) => {
  if (!sandboxStatus) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              sandboxStatus.dockerDaemonRunning ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              sandboxStatus.dockerDaemonRunning ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
          />
        </span>
        <span className="font-bold">
          Sandbox Engine:{' '}
          {sandboxStatus.activeMode === 'DOCKER_ISOLATED'
            ? 'Docker Isolated Container Swarm'
            : 'Local Native Sandbox Engine'}
        </span>
        <span className="text-slate-300">•</span>
        <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
          {sandboxStatus.localJavaVersion || 'JDK Ready'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600">
        <span>
          Timeout: <strong className="text-slate-800">{sandboxStatus.limits?.defaultTimeoutMs ?? 2000}ms</strong>
        </span>
        <span>
          RAM Cap: <strong className="text-slate-800">{sandboxStatus.limits?.defaultMemoryLimitMb ?? 256}MB</strong>
        </span>
        <span>
          Bảo mật:{' '}
          <strong className="text-slate-800">
            {sandboxStatus.limits?.networkIsolation ? 'Seccomp Network Isolation Active' : 'Native'}
          </strong>
        </span>
      </div>
    </div>
  );
};
