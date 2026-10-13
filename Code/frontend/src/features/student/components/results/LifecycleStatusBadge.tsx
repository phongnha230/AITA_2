'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface LifecycleStatusBadgeProps {
  currentStatus: string;
  retryCount?: number;
}

export const LifecycleStatusBadge: React.FC<LifecycleStatusBadgeProps> = ({
  currentStatus,
  retryCount = 1,
}) => {
  if (currentStatus === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        ĐÃ CHẤM XONG
      </span>
    );
  }

  if (currentStatus === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
        <XCircle className="h-4 w-4" />
        CHẤM THẤT BẠI
      </span>
    );
  }

  if (currentStatus === 'RETRYING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        <AlertTriangle className="h-4 w-4" />
        ĐANG THỬ LẠI (LẦN {retryCount})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      <Clock className="h-4 w-4" />
      ĐANG XỬ LÝ
    </span>
  );
};
