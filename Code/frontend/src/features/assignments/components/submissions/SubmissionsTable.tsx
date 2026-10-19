'use client';

import React from 'react';
import {
  Github,
  FileArchive,
  ExternalLink,
  Eye,
  RefreshCw,
  Play,
  Bot,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDateTime } from '@/lib/formatDate';
import type { LecturerSubmission } from '../../types/assignment.types';

interface SubmissionsTableProps {
  submissions: LecturerSubmission[];
  actionLoadingId: string | null;
  renderStatusBadge: (status: string) => React.ReactNode;
  onSelectSubmission: (sub: LecturerSubmission) => void;
  onReGradeSandbox: (subId: string) => void;
  onReGradeAi: (subId: string) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  actionLoadingId,
  renderStatusBadge,
  onSelectSubmission,
  onReGradeSandbox,
  onReGradeAi,
}) => {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-2xs overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-5">Sinh viên</th>
              <th className="py-3.5 px-4">Kênh nộp</th>
              <th className="py-3.5 px-4">Thời gian</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-center">Sandbox</th>
              <th className="py-3.5 px-4 text-center">AI Rubric</th>
              <th className="py-3.5 px-4 text-center">Điểm Cuối</th>
              <th className="py-3.5 px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Chưa có bài nộp nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const initials = (sub.user?.fullName || 'SV')
                  .trim()
                  .split(' ')
                  .slice(-2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition group">
                    {/* Sinh viên */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs shrink-0">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition truncate">
                            {sub.user?.fullName || 'Sinh viên'}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {sub.user?.email}
                          </div>
                          {sub.paperCode && (
                            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              Mã đề: {sub.paperCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kênh nộp */}
                    <td className="p-4">
                      {sub.submissionChannel === 'GIT_COMMIT' ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Github className="size-4 text-slate-800 shrink-0" />
                          <span>Git Commit</span>
                          {sub.gitRepoUrl && (
                            <a
                              href={sub.gitRepoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800"
                              title="Mở repo Github"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <FileArchive className="size-4 text-indigo-600 shrink-0" />
                          <span>File ZIP</span>
                        </div>
                      )}
                    </td>

                    {/* Thời gian */}
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(sub.submittedAt)}
                    </td>

                    {/* Trạng thái */}
                    <td className="p-4 whitespace-nowrap">{renderStatusBadge(sub.status)}</td>

                    {/* Sandbox Score */}
                    <td className="p-4 text-center font-mono font-bold text-slate-800">
                      {sub.sandboxScore !== null && sub.sandboxScore !== undefined
                        ? `${sub.sandboxScore}`
                        : '-'}
                    </td>

                    {/* AI Score */}
                    <td className="p-4 text-center font-mono font-bold text-purple-700">
                      {sub.aiScore !== null && sub.aiScore !== undefined ? `${sub.aiScore}` : '-'}
                    </td>

                    {/* Final Score */}
                    <td className="p-4 text-center font-mono font-black text-sm">
                      {sub.finalScore !== null && sub.finalScore !== undefined ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {sub.finalScore}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectSubmission(sub)}
                          className="h-8 px-2.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 text-xs font-semibold"
                          title="Xem chi tiết kết quả testcase"
                        >
                          <Eye className="size-3.5 mr-1" />
                          <span>Chi tiết</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === `sandbox-${sub.id}`}
                          onClick={() => onReGradeSandbox(sub.id)}
                          className="h-8 px-2 rounded-lg text-slate-600 hover:text-slate-900 border-slate-200 text-xs"
                          title="Chạy lại kiểm thử Docker Sandbox"
                        >
                          {actionLoadingId === `sandbox-${sub.id}` ? (
                            <RefreshCw className="size-3.5 animate-spin text-indigo-600" />
                          ) : (
                            <Play className="size-3.5 text-emerald-600" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === `ai-${sub.id}`}
                          onClick={() => onReGradeAi(sub.id)}
                          className="h-8 px-2 rounded-lg text-slate-600 hover:text-purple-700 border-slate-200 text-xs"
                          title="Chạy lại thẩm định AI Rubrics"
                        >
                          {actionLoadingId === `ai-${sub.id}` ? (
                            <RefreshCw className="size-3.5 animate-spin text-purple-600" />
                          ) : (
                            <Bot className="size-3.5 text-purple-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
