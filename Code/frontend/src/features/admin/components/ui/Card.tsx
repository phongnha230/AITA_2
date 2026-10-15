import * as React from 'react';
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, ...props }, ref) => (
    <ShadcnCard
      ref={ref}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
        interactive && 'transition-all duration-150 hover:-translate-y-px hover:border-slate-300 hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'AdminCard';

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
