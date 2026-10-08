import { cn } from '../../../../lib/cn';

interface ToggleProps {
  checked: boolean;
  disabled?: boolean;
  title?: string;
  label: string;
  onChange?: (next: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, disabled, title, label, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={title}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
    className={cn(
      'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-70',
      checked ? 'bg-emerald-600' : 'bg-slate-300',
    )}
  >
    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
  </button>
);
