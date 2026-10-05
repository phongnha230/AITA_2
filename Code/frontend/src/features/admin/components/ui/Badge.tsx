import { cn } from '../../../../lib/cn';

export type BadgeTone = 'admin' | 'lecturer' | 'student' | 'warning' | 'neutral' | 'info' | 'violet';

const TONES: Record<BadgeTone, string> = {
  admin: 'bg-rose-50 text-rose-600 border-rose-100',
  lecturer: 'bg-blue-50 text-blue-600 border-blue-100',
  student: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  info: 'bg-blue-50 text-blue-600 border-blue-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', dot, className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-xs font-semibold',
      TONES[tone],
      className,
    )}
    {...props}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);
