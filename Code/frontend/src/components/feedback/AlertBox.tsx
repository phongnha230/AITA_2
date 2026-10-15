import { AlertTriangle } from 'lucide-react';

interface AlertBoxProps {
  message: string;
  onRetry?: () => void;
}

export const AlertBox: React.FC<AlertBoxProps> = ({ message, onRetry }) => (
  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    <p className="min-w-0 flex-1">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="font-semibold underline hover:text-rose-800">
        Thử lại
      </button>
    )}
  </div>
);
