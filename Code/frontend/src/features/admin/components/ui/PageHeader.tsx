interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => (
  <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
    <div className="min-w-0 space-y-1.5">
      {eyebrow && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">{eyebrow}</div>}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);
