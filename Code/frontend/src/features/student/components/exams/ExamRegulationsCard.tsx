'use client';

import { Headphones, ShieldCheck } from 'lucide-react';

export function ExamRegulationsCard() {
  return (
    <section className="rounded-2xl border border-blue-100/90 bg-gradient-to-b from-blue-50/50 via-white to-white p-6 shadow-elevated">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
          <ShieldCheck aria-hidden="true" className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Quy chế làm bài thi PE</h3>
          <p className="text-[11px] text-slate-500">Khảo thí &amp; Đảm bảo chất lượng</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        Sinh viên cần tuân thủ các quy chế học thuật chung trong suốt quá trình làm bài thi thực hành:
      </p>

      <ol className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-700">
        <li className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
            1
          </span>
          <div>
            <p className="font-semibold text-slate-900">Có mặt đúng giờ quy định:</p>
            <p className="text-slate-600">Đăng nhập tài khoản và kiểm tra thông tin đề bài trước giờ bắt đầu làm bài.</p>
          </div>
        </li>

        <li className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
            2
          </span>
          <div>
            <p className="font-semibold text-slate-900">Làm bài độc lập &amp; Trung thực:</p>
            <p className="text-slate-600">Tuân thủ nghiêm ngặt quy chế liêm chính học thuật, tự giác thực hiện bài nộp.</p>
          </div>
        </li>

        <li className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
            3
          </span>
          <div>
            <p className="font-semibold text-slate-900">Nộp bài đúng thời hạn:</p>
            <p className="text-slate-600">Kiểm tra mã nguồn cẩn thận và hoàn tất nộp bài trước thời hạn hệ thống đóng cổng nộp.</p>
          </div>
        </li>
      </ol>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 text-xs shadow-2xs">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Headphones className="h-4 w-4 text-blue-600" />
          <span>Cần hỗ trợ trong ca thi?</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          Báo ngay cán bộ coi thi hoặc liên hệ ban hỗ trợ kỹ thuật khảo thí để được hướng dẫn xử lý sự cố.
        </p>
      </div>
    </section>
  );
}

