import * as React from 'react';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  disabled?: boolean;
  title?: string;
  label: string;
  onChange?: (next: boolean) => void;
  className?: string;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, disabled, title, label, onChange, className }, ref) => {
    return (
      <ShadcnSwitch
        ref={ref}
        checked={checked}
        disabled={disabled}
        title={title}
        aria-label={label}
        onCheckedChange={(val) => onChange?.(val)}
        className={cn(
          'data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300',
          className,
        )}
      />
    );
  },
);
Toggle.displayName = 'AdminToggle';
