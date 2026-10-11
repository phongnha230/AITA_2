'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  side?: boolean;
  className?: string;
}

/** Centered dialog using shadcn Dialog, or right-side drawer when `side` is set using shadcn Sheet. */
export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, side, className }) => {
  if (side) {
    return (
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent
          side="right"
          className={cn('w-full sm:max-w-2xl overflow-y-auto p-6 sm:p-8', className)}
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg font-semibold text-slate-900">{title}</SheetTitle>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={cn('max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-2xl p-6 sm:p-8', className)}>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
