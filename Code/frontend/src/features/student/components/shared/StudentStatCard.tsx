import type { LucideIcon } from 'lucide-react';

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100/80',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100/80',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100/80',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100/80',
};

interface StudentStatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  loading?: boolean;
}

export function StudentStatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'blue',
  loading = false,
}: StudentStatCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-elevated-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight">
          {label}
        </p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${toneClasses[tone]}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-3">
        {loading ? (
          <div
            role="status"
            aria-label={`Đang tải ${label}`}
            className="h-9 w-20 animate-pulse rounded-lg bg-slate-100"
          />
        ) : (
          <p className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900 leading-none">
            {value}
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{detail}</p>
      </div>
    </article>
  );
}


