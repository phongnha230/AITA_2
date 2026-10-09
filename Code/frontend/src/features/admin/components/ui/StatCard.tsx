import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { Sparkline } from './Sparkline';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  accent?: string;
  footer?: React.ReactNode;
  sparkline?: number[];
  sparklineColor?: string;
  trend?: {
    value: string;
    positive?: boolean;
    label?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  suffix,
  icon: Icon,
  iconClassName,
  accent,
  footer,
  sparkline,
  sparklineColor = '#2563eb',
  trend,
}) => (
  <Card interactive className={cn('flex flex-col justify-between gap-4 p-5', accent && `border-l-4 ${accent}`)}>
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
            {suffix && <span className="text-sm font-semibold text-slate-500">{suffix}</span>}
          </div>
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-600', iconClassName)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(sparkline || trend) && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
          {trend ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px]',
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700',
                )}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.label && <span className="text-[11px] text-slate-400">{trend.label}</span>}
            </div>
          ) : <div />}

          {sparkline && (
            <div className="w-28 h-8 flex items-center justify-end">
              <Sparkline values={sparkline} color={sparklineColor} height={32} width={110} />
            </div>
          )}
        </div>
      )}
    </div>

    {footer && <div className="space-y-1.5 pt-1 border-t border-slate-100">{footer}</div>}
  </Card>
);
