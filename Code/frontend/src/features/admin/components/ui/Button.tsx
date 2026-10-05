import { cn } from '../../../../lib/cn';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-transparent',
  outline: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  danger: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 hover:text-rose-700',
  ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'outline', className, type = 'button', ...props }) => (
  <button
    type={type}
    className={cn(
      'inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm font-semibold transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      VARIANTS[variant],
      className,
    )}
    {...props}
  />
);
