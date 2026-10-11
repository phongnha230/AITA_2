import * as React from 'react';
import { Progress as ShadcnProgress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, color, className }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)}>
        <ShadcnProgress
          value={Math.min(100, Math.max(0, value))}
          className={cn('h-1.5 bg-slate-100', color && `[&>div]:${color}`)}
        />
      </div>
    );
  },
);
ProgressBar.displayName = 'AdminProgressBar';
