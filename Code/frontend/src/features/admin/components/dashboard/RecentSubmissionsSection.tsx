'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, FileCode2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge, type BadgeTone } from '../ui/Badge';
import { formatDateTime } from '@/lib/formatDate';
import type { AdminDashboardData } from '../../services/admin-dashboard.service';

interface RecentSubmissionsSectionProps {
  submissions: AdminDashboardData['recentSubmissions'];
}

const STATUS_TONE: Record<string, BadgeTone> = {
  GRADED: 'student',
  PENDING: 'info',
  QUEUED: 'neutral',
  RUNNING_SANDBOX: 'warning',
  RUNNING_AI: 'warning',
  FAILED: 'admin',
};

const STATUS_LABEL: Record<string, string> = {
  GRADED: 'Đã chấm',
  PENDING: 'Chờ xử lý',
  QUEUED: 'Hàng đợi',
  RUNNING_SANDBOX: 'Sandbox',
  RUNNING_AI: 'Socratic AI',
  FAILED: 'Lỗi',
};

export const RecentSubmissionsSection: React.FC<RecentSubmissionsSectionProps> = ({ submissions }) => {
  return (
    <Card className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <FileCode2 className="size-4 text-blue-600" />
            Bài nộp gần nhất từ sinh viên
          </h2>
          <p className="text-xs text-slate-500">
            Dữ liệu bài làm mới nhất được ghi nhận thời gian thực từ cơ sở dữ liệu
          </p>
        </div>
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Xem tất cả bài nộp <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">Chưa có bài nộp nào trong hệ thống</p>
          <p className="mt-1 text-xs text-slate-400">
            Dữ liệu bài nộp sẽ tự động hiển thị và cập nhật biểu đồ ngay khi sinh viên nộp bài.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 font-semibold text-slate-600">
              <tr>
                <th className="py-2.5 px-3">Thí sinh</th>
                <th className="py-2.5 px-3">Môn học &amp; Đề thi</th>
                <th className="py-2.5 px-3">Thời gian nộp</th>
                <th className="py-2.5 px-3">Sandbox</th>
                <th className="py-2.5 px-3">AI Rubric</th>
                <th className="py-2.5 px-3">Tổng điểm</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800">{sub.studentName}</p>
                    <p className="font-mono text-[11px] text-slate-400">{sub.studentEmail}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-800">{sub.assignmentTitle}</p>
                    <p className="text-[11px] text-slate-500">{sub.courseCode} · {sub.courseName}</p>
                  </td>
                  <td className="whitespace-nowrap py-3 px-3 font-mono text-[11px] text-slate-500">
                    {formatDateTime(sub.submittedAt)}
                  </td>
                  <td className="whitespace-nowrap py-3 px-3 font-semibold text-slate-700">
                    {sub.sandboxScore.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap py-3 px-3 font-semibold text-slate-700">
                    {sub.aiScore.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap py-3 px-3 font-bold text-blue-600">
                    {sub.finalScore.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap py-3 px-3">
                    <Badge tone={STATUS_TONE[sub.status] || 'neutral'}>
                      {STATUS_LABEL[sub.status] || sub.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap py-3 px-3 text-right">
                    <Link
                      href="/admin/submissions"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
