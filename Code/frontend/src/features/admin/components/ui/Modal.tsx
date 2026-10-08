'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../../lib/cn';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  side?: boolean;
}

/** Centered dialog, or right-side drawer when `side` is set. */
export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, side }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn('fixed inset-0 z-[70] flex bg-slate-900/40 backdrop-blur-[2px]', side ? 'justify-end' : 'items-center justify-center p-4')}
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'overflow-y-auto bg-white shadow-2xl',
          side
            ? 'h-full w-full max-w-2xl border-l border-slate-200 p-6 sm:p-8'
            : 'max-h-full w-full max-w-lg rounded-2xl border border-slate-200 p-6 sm:p-8',
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
