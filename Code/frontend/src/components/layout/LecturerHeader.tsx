'use client';

import React from 'react';
import { Menu, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LecturerHeaderProps {
  onOpenMobileSidebar: () => void;
  pathname: string;
  onShowToast: (msg: string) => void;
}

export const LecturerHeader: React.FC<LecturerHeaderProps> = ({
  onOpenMobileSidebar,
  pathname,
  onShowToast,
}) => {
  const isOverviewActive =
    pathname === '/dashboard' || pathname === '/courses' || pathname === '/';
  const isExamBankActive = pathname.startsWith('/exam-bank');
  const isLiveProctoringActive = pathname.startsWith('/live-proctoring');

  const getBreadcrumbTitle = () => {
    if (isOverviewActive) return 'Tổng quan khóa học';
    if (isExamBankActive) return 'Ngân hàng đề & Testcase PE';
    if (isLiveProctoringActive) return 'Quản lý ca thi';
    return 'Bàn làm việc Giảng viên';
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          aria-label="Mở menu điều hướng"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>AITA Portal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <span>Học kỳ:</span>
          <strong className="text-slate-900">Fall 2026</strong>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onShowToast('Bạn không có thông báo mới nào')}
          className="h-8 w-8 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition relative"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </Button>
      </div>
    </header>
  );
};
