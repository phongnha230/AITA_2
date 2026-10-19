import { Inbox } from 'lucide-react';

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'Không có dữ liệu.' }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-sm text-slate-500">
    <Inbox className="size-8 text-slate-300" />
    <p>{message}</p>
  </div>
);
