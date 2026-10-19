'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/config/routes';

export const ExamDetailLoading: React.FC = () => (
  <div className="max-w-7xl mx-auto py-20 text-center font-sans">
    <RefreshCw className="size-10 animate-spin text-indigo-600 mx-auto mb-4" />
    <h3 className="text-base font-bold text-slate-800">Đang tải dữ liệu đề thi PE...</h3>
    <p className="text-xs text-slate-400 mt-1">Hệ thống đang truy vấn thông tin đề bài và bộ testcase tự động</p>
  </div>
);

interface ExamDetailErrorProps {
  error: string | null;
}

export const ExamDetailErrorView: React.FC<ExamDetailErrorProps> = ({ error }) => (
  <div className="max-w-3xl mx-auto py-16 px-4 font-sans text-center">
    <Card className="rounded-3xl border-slate-200 p-8 shadow-2xs bg-white">
      <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
      <h2 className="text-lg font-black text-slate-900">Không thể hiển thị đề thi</h2>
      <p className="text-xs text-slate-500 mt-2 mb-6">{error || 'Không tìm thấy dữ liệu đề thi tương ứng.'}</p>
      <Button asChild className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
        <Link href={ROUTES.LECTURER.EXAM_BANK}>
          <ArrowLeft className="size-4 mr-2" />
          <span>Quay lại Ngân hàng đề thi</span>
        </Link>
      </Button>
    </Card>
  </div>
);
