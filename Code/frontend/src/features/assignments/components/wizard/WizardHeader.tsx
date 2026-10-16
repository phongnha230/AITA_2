import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
} from 'lucide-react';
import { Button as UIButton } from '@/components/ui/button';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Card as UICard } from '@/components/ui/card';
import type { AssignmentEnv, AssignmentFlowType } from '../../types/assignment.types';

interface WizardHeaderProps {
  flowType: AssignmentFlowType;
  editId: string | null;
  loadingEdit: boolean;
  title: string;
  environment: AssignmentEnv;
  onLoadSamplePrf192: () => void;
  onLoadSamplePro192: () => void;
  onLoadSampleCsd201: () => void;
  submitSuccess: boolean;
  submitError: string | null;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  flowType,
  editId,
  loadingEdit,
  title,
  environment,
  onLoadSamplePrf192,
  onLoadSamplePro192,
  onLoadSampleCsd201,
  submitSuccess,
  submitError,
}) => {
  return (
    <>
      {/* TOP BREADCRUMB & HEADER */}
      <div className="flex items-center justify-between">
        <UIButton asChild variant="ghost" size="sm" className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
          <Link href="/exam-bank">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại Ngân hàng đề thi</span>
          </Link>
        </UIButton>
        <UIBadge variant="outline" className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">
          {flowType === 'PE_EXAM' ? 'Khảo thí PE • Chấm tự động' : 'Assignment • Chấm theo cấu hình'}
        </UIBadge>
      </div>

      <UICard className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {editId ? (
              <UIBadge variant="outline" className="text-[11px] font-bold bg-amber-50 text-amber-800 border-amber-300">
                CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
              </UIBadge>
            ) : (
              <UIBadge variant="outline" className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
                TẠO MỚI (CREATE MODE)
              </UIBadge>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {editId ? (loadingEdit ? 'Đang tải dữ liệu đề...' : `Chỉnh sửa ${flowType === 'PE_EXAM' ? 'đề PE' : 'Assignment'}: ${title || 'Chi tiết'}`) : flowType === 'PE_EXAM' ? 'Tạo mới đề thi PE' : 'Tạo Assignment mới'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {editId
              ? 'Dữ liệu đề bài, bộ testcase và bài giải mẫu đã được nạp tự động. Bạn có thể cập nhật các thông tin cần thiết.'
              : environment === 'REACT_JS'
                ? 'FER201 dùng kịch bản Playwright do giảng viên thiết kế trên URL deploy, sau đó chấm cấu trúc React và Clean Code bằng source chọn lọc.'
                : flowType === 'PE_EXAM'
                  ? 'Quy trình 4 bước: cấu hình ca thi, tải đề PDF, thêm starter code, bài giải tham chiếu và testcase.'
                  : 'Quy trình 4 bước: cấu hình Assignment, đính kèm tài liệu và starter code, sau đó thiết lập bài giải cùng testcase.'}
          </p>
        </div>
        {!editId && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <UIButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadSamplePrf192}
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1.5 shadow-2xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>⚡ Mẫu C (PRF192)</span>
            </UIButton>
            <UIButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadSamplePro192}
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-300 flex items-center gap-1.5 shadow-2xs transition"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>☕ Mẫu Java PRO192</span>
            </UIButton>
            <UIButton
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadSampleCsd201}
              className="h-9 px-3.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-300 flex items-center gap-1.5 shadow-2xs transition"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              <span>☕ Mẫu Java CSD201</span>
            </UIButton>
          </div>
        )}
      </UICard>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Đã lưu thành công đề thi, bộ testcase và bài giải mẫu! Đang chuyển hướng...</span>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>Lỗi: {submitError}</span>
        </div>
      )}
    </>
  );
};
