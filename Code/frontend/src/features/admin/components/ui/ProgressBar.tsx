import { cn } from '../../../../lib/cn';

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, color = 'bg-blue-600', className }) => (
  <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}>
    <div className={cn('h-full rounded-full', color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);
