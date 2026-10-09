import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Đang tải dữ liệu...' }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    <span>{label}</span>
  </div>
);
