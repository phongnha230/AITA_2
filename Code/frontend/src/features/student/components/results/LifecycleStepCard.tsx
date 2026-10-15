'use client';

import React from 'react';
import { CheckCircle2, XCircle, type LucideIcon } from 'lucide-react';

interface LifecycleStepCardProps {
  step: {
    id: string;
    label: string;
    sublabel: string;
    icon: LucideIcon;
  };
  state: 'completed' | 'active' | 'retrying' | 'failed' | 'pending';
  index: number;
}

const STEP_CONTAINER_STYLES: Record<string, string> = {
  completed: 'border-emerald-200 bg-emerald-50/50 text-slate-800',
  active: 'border-blue-500 bg-blue-50/80 text-blue-900 ring-2 ring-blue-500/20',
  retrying: 'border-amber-400 bg-amber-50/70 text-amber-900 ring-2 ring-amber-400/20',
  failed: 'border-rose-400 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400/20',
  pending: 'border-slate-200/80 bg-slate-50/60 text-slate-400',
};

const STEP_BADGE_STYLES: Record<string, string> = {
  completed: 'bg-emerald-600 text-white',
  active: 'bg-blue-600 text-white animate-pulse',
  retrying: 'bg-amber-600 text-white',
  failed: 'bg-rose-600 text-white',
  pending: 'bg-slate-200 text-slate-500',
};

const STEP_ICON_STYLES: Record<string, string> = {
  completed: 'text-emerald-600',
  active: 'text-blue-600',
  failed: 'text-rose-600',
  retrying: 'text-amber-600',
  pending: 'text-slate-400',
};

export const LifecycleStepCard: React.FC<LifecycleStepCardProps> = ({
  step,
  state,
  index,
}) => {
  const Icon = step.icon;
  const containerClass = STEP_CONTAINER_STYLES[state] || STEP_CONTAINER_STYLES.pending;
  const badgeClass = STEP_BADGE_STYLES[state] || STEP_BADGE_STYLES.pending;
  const iconClass = STEP_ICON_STYLES[state] || STEP_ICON_STYLES.pending;

  return (
    <li className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${containerClass}`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${badgeClass}`}>
          {state === 'completed' && <CheckCircle2 className="h-4 w-4" />}
          {state === 'failed' && <XCircle className="h-4 w-4" />}
          {state !== 'completed' && state !== 'failed' && index + 1}
        </span>
        <Icon aria-hidden="true" className={`h-4 w-4 ${iconClass}`} />
      </div>

      <div className="mt-3">
        <p className="text-xs font-bold tracking-tight">{step.label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{step.sublabel}</p>
      </div>
    </li>
  );
};
