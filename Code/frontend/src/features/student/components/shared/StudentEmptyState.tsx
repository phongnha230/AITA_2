import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StudentEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function StudentEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: StudentEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/60 px-6 py-8 text-center ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-elevated-sm ring-1 ring-slate-200/80">
        <Icon aria-hidden="true" className="h-5 w-5 text-slate-500" />
      </span>
      <p className="mt-3.5 text-sm font-bold text-slate-800">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

