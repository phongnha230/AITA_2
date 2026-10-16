import { Info } from 'lucide-react';
import { Card } from '../ui/Card';

export const RouterSettings: React.FC = () => (
  <Card className="space-y-2 border-amber-200 bg-amber-50/50">
    <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900"><Info className="h-4 w-4 text-amber-600" /> Cấu hình AI Router</h2>
    <p className="text-sm text-slate-700">Backend hiện chưa có API lưu chiến lược định tuyến hoặc giới hạn token từ trang này. Bộ định tuyến đang hoạt động theo cấu hình phía máy chủ; các tùy chọn cấu hình đã được ẩn để tránh lưu giả trên trình duyệt.</p>
  </Card>
);
