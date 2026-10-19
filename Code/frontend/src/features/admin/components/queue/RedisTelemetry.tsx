import { Brush, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';

interface RedisTelemetryProps {
  failedCount: number;
  completedCount: number;
  onClearFailed: () => void;
  onClearCompleted: () => void;
}

export const RedisTelemetry: React.FC<RedisTelemetryProps> = ({ failedCount, completedCount, onClearFailed, onClearCompleted }) => (
  <Card className="space-y-4">
    <h2 className="text-base font-semibold text-slate-900">Dọn bản ghi hàng đợi</h2>
    <p className="text-xs text-slate-500">Các thao tác dưới đây xóa bản ghi khỏi cơ sở dữ liệu backend.</p>
    <div className="space-y-2">
      <button type="button" onClick={onClearCompleted} disabled={completedCount === 0} className="flex w-full items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50">
        <span className="flex items-center gap-2"><Brush className="size-4 text-slate-500" /> Xóa job đã hoàn tất</span><span className="text-slate-500">{completedCount}</span>
      </button>
      <button type="button" onClick={onClearFailed} disabled={failedCount === 0} className="flex w-full items-center justify-between gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50">
        <span className="flex items-center gap-2"><Trash2 className="size-4" /> Xóa job thất bại</span><span className="rounded bg-rose-600 px-2 py-0.5 text-white">{failedCount}</span>
      </button>
    </div>
  </Card>
);
