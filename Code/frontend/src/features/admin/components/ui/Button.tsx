import * as React from 'react';
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AdminButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';

export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  variant?: AdminButtonVariant;
}

const variantMap: Record<AdminButtonVariant, ShadcnButtonProps['variant']> = {
  primary: 'default',
  outline: 'outline',
  danger: 'destructive',
  ghost: 'ghost',
};

const customClasses: Record<AdminButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm border-transparent',
  outline: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  danger: 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 shadow-none',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent shadow-none',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outline', className, type = 'button', ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        type={type}
        variant={variantMap[variant]}
        className={cn(
          'h-10 px-4 text-sm font-semibold rounded-lg transition-colors',
          customClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'AdminButton';
