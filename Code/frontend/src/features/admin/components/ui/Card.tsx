import { cn } from '../../../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, interactive, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
      interactive && 'transition-all duration-150 hover:-translate-y-px hover:border-slate-300 hover:shadow-md',
      className,
    )}
    {...props}
  />
);
