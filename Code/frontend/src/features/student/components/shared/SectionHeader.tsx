import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100/80',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100/80',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100/80',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80',
};

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: keyof typeof toneClasses;
  badge?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  tone = 'blue',
  badge,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
            {badge}
          </div>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
