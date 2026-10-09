'use client';

import React from 'react';
import { Copy, Check } from 'lucide-react';
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
      <DialogContent className="sm:max-w-sm rounded-3xl p-6 sm:p-8 bg-white border border-slate-100 shadow-2xl flex flex-col items-center text-center">
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
            Quét mã bằng camera hoặc app AITA để tham gia lớp ngay lập tức
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Illustration Frame */}
        <div className="my-5 p-4 bg-white rounded-2xl border-2 border-dashed border-indigo-200 shadow-inner flex flex-col items-center">
          <div className="w-44 h-44 bg-slate-900 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
            {/* SVG QR Code Pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
              <path d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
              <path d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
              <path d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
              <path d="M40,10 h10 v10 h-10 z M55,5 h10 v10 h-10 z M40,25 h10 v10 h-10 z" />
              <path d="M35,45 h30 v10 h-30 z M45,60 h10 v10 h-10 z M35,75 h10 v20 h-10 z" />
              <path d="M50,80 h20 v10 h-20 z M75,40 h10 v30 h-10 z M90,55 h10 v10 h-10 z" />
              <path d="M60,65 h10 v10 h-10 z M80,85 h15 v10 h-15 z M15,45 h15 v15 h-15 z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white text-indigo-700 font-black text-[10px] px-2 py-0.5 rounded shadow">
                AITA
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 mt-2">
            Mã đổi sau: {formattedCountdown}
          </span>
        </div>

        {/* Big OTP Code Display */}
        <div className="flex items-center gap-2 w-full justify-center">
          <span className="text-2xl font-black font-mono tracking-widest text-indigo-950 bg-indigo-50/70 border border-indigo-200 px-4 py-2 rounded-xl">
            {joinCode}
          </span>
          <Button
            size="icon"
            onClick={handleCopy}
            className="h-11 w-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
            title="Sao chép mã"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
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
