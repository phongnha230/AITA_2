'use client';

import React from 'react';
import { Copy, Check, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinCode: string;
  courseCode: string;
  courseName: string;
  formattedCountdown: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  joinCode,
  courseCode,
  courseName,
  formattedCountdown,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(joinCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm rounded-3xl p-6 sm:p-8 bg-white shadow-2xl flex flex-col items-center text-center">
        <DialogHeader className="items-center text-center space-y-1">
          <Badge
            variant="outline"
            className="text-xs font-bold font-mono px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border-indigo-200 mx-auto"
          >
            {courseCode}
          </Badge>
          <DialogTitle className="text-lg font-black text-slate-900 mt-2 text-center">
            {courseName}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1 text-center">
            Dùng mã tham gia dưới đây để ghi danh vào lớp.
          </DialogDescription>
        </DialogHeader>

        <div className="my-5 flex w-full flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
          <QrCode className="size-9 text-slate-400" aria-hidden="true" />
          <span className="text-xs font-semibold">QR chưa được cấu hình. Hãy nhập mã tham gia thủ công.</span>
          <span className="text-xs font-mono">{joinCode && formattedCountdown !== 'Đã hết hạn' ? `Mã có hiệu lực thêm ${formattedCountdown}` : 'Mã hiện không hoạt động'}</span>
        </div>

        {/* Big OTP Code Display */}
        <div className="flex items-center gap-2 w-full justify-center">
          <span className="text-2xl font-black font-mono tracking-widest text-indigo-950 bg-indigo-50/70 border border-indigo-200 px-4 py-2 rounded-xl">
            {joinCode}
          </span>
          <Button
            size="icon"
            onClick={handleCopy}
            className="size-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
            title="Sao chép mã"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
          </Button>
        </div>

        <Button
          variant="secondary"
          onClick={onClose}
          className="mt-6 w-full h-10 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          Đóng cửa sổ
        </Button>
      </DialogContent>
    </Dialog>
  );
};
