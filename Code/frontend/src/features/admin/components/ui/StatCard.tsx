import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  suffix?: React.ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  accent?: string;
  footer?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, suffix, icon: Icon, iconClassName, accent, footer }) => (
  <Card interactive className={cn('flex flex-col justify-between gap-4', accent && `border-l-4 ${accent}`)}>
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
    {footer && <div className="space-y-1.5">{footer}</div>}
  </Card>
);
