import * as React from 'react';
import { cn } from '@/lib/utils';

export const inputClass =
  'h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-[3px] focus:ring-blue-600/15';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, hint, className }) => (
  <label className={cn('block space-y-1.5', className)}>
    <span className="text-xs font-semibold text-slate-700">{label}</span>
    {children}
    {hint && <span className="block text-xs text-slate-500">{hint}</span>}
  </label>
);
