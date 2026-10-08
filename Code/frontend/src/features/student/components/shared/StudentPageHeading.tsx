import type { ReactNode } from 'react';

interface StudentPageHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function StudentPageHeading({ eyebrow, title, description, action }: StudentPageHeadingProps) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold uppercase text-blue-700">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </section>
  );
}
