'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import { StudentEmptyState } from '../shared/StudentEmptyState';

export const StudentExamsHistorySection: React.FC = () => {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
      <h2 className="text-base font-bold text-slate-900 sm:text-lg">Lịch sử bài thi &amp; Bảng điểm</h2>
      <p className="mt-0.5 text-xs text-slate-500">Kết quả được ghi nhận từ các lần nộp bài thực tế.</p>
      <div className="mt-4">
        <StudentEmptyState
          icon={CalendarClock}
          title="Chưa có dữ liệu kỳ thi để hiển thị."
          description="Bạn có thể tra cứu chi tiết kết quả và đánh giá AI bằng mã bài nộp (Submission ID)."
          action={
            <Link
              href="/student/results"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Tra cứu kết quả bài nộp
            </Link>
          }
        />
      </div>
    </section>
  );
};
