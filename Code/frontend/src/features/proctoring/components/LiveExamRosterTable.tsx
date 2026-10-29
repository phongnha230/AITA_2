'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserX,
  FileCode,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  FileArchive,
  Loader2,
} from 'lucide-react';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ExamSessionRosterStudent, RoomStudentStatus } from '../types/proctoring.types';
import { formatDateTime } from '@/lib/formatDate';

interface LiveExamRosterTableProps {
  roster: ExamSessionRosterStudent[];
  totalTestCases: number;
  onOpenLogDrawer: (student: ExamSessionRosterStudent) => void;
  onRegrade?: (submissionId: string) => Promise<void>;
  loading?: boolean;
}

export const LiveExamRosterTable: React.FC<LiveExamRosterTableProps> = ({
  roster,
  totalTestCases,
  onOpenLogDrawer,
  onRegrade,
  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomStudentStatus>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [regradingId, setRegradingId] = useState<string | null>(null);
  const [downloadingZipId, setDownloadingZipId] = useState<string | null>(null);

  // Thống kê nhanh
  const stats = useMemo(() => {
    let inRoom = 0;
    let submitted = 0;
    let expiredZero = 0;
    let notJoined = 0;

    for (const s of roster) {
      if (s.roomStatus === 'IN_ROOM') inRoom++;
      else if (s.roomStatus === 'SUBMITTED') submitted++;
      else if (s.roomStatus === 'EXPIRED_ZERO') expiredZero++;
      else notJoined++;
    }

    return { total: roster.length, inRoom, submitted, expiredZero, notJoined };
  }, [roster]);

  // Bộ lọc dữ liệu
  const filteredRoster = useMemo(() => {
    return roster.filter((student) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== 'ALL' && student.roomStatus !== statusFilter) {
        return false;
      }
      // 2. Tìm kiếm tên, MSSV, email
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const nameMatch = student.studentName.toLowerCase().includes(query);
        const codeMatch = student.studentCode ? student.studentCode.toLowerCase().includes(query) : false;
        const emailMatch = student.email ? student.email.toLowerCase().includes(query) : false;
        return nameMatch || codeMatch || emailMatch;
      }
      return true;
    });
  }, [roster, statusFilter, search]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTriggerRegrade = async (submissionId: string) => {
    if (!onRegrade) return;
    try {
      setRegradingId(submissionId);
      await onRegrade(submissionId);
    } finally {
      setRegradingId(null);
    }
  };

  // Xuất file CSV hỗ trợ tiếng Việt mở trên Excel
  const handleExportCsv = () => {
    const headers = [
      'STT',
      'MSSV',
      'Họ và tên',
      'Email',
      'Trạng thái phòng',
      'Giờ mở đề',
      'Giờ nộp bài',
      'Số test đạt',
      'Tổng test',
      'Điểm máy chấm',
      'Điểm AI',
      'Điểm chính thức',
    ];

    const rows = filteredRoster.map((s, index) => {
      const sub = s.submission;
      const statusLabel =
        s.roomStatus === 'SUBMITTED'
          ? 'Đã nộp bài'
          : s.roomStatus === 'IN_ROOM'
          ? 'Đang làm bài'
          : s.roomStatus === 'EXPIRED_ZERO'
          ? 'Hết giờ không nộp (0đ)'
          : 'Chưa vào phòng';

      return [
        index + 1,
        `"${s.studentCode || ''}"`,
        `"${s.studentName}"`,
        `"${s.email || ''}"`,
        `"${statusLabel}"`,
        `"${s.unlockedAt ? formatDateTime(s.unlockedAt) : ''}"`,
        `"${sub?.submittedAt ? formatDateTime(sub.submittedAt) : ''}"`,
        sub?.passedTestCases ?? '',
        sub?.totalTestCases ?? totalTestCases,
        sub?.sandboxScore ?? '',
        sub?.aiScore ?? '',
        sub?.finalScore ?? '',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Diem_Ca_Thi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar & Quick Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_ROOM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'IN_ROOM'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="size-3 text-indigo-600" />
            Đang thi ({stats.inRoom})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SUBMITTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'SUBMITTED'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="size-3 text-emerald-600" />
            Đã nộp ({stats.submitted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('EXPIRED_ZERO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'EXPIRED_ZERO'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="size-3 text-rose-600" />
            Quá hạn 0đ ({stats.expiredZero})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('NOT_JOINED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'NOT_JOINED'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserX className="size-3 text-slate-400" />
            Chưa vào ({stats.notJoined})
          </button>
        </div>

        {/* Right: Search Input & Export CSV */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc MSSV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-slate-200 bg-white"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredRoster.length === 0}
            className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs"
            title="Xuất bảng điểm ra file CSV (Excel)"
          >
            <Download className="size-3.5 mr-1.5 text-slate-500" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[200px]">Sinh viên</th>
                <th className="py-3 px-4">Trạng thái phòng</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Tiến độ Test</th>
                <th className="py-3 px-4 text-center">Điểm số</th>
                <th className="py-3 px-4 text-right min-w-[140px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserX className="size-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">Không tìm thấy sinh viên nào phù hợp</p>
                    <p className="text-[11px] mt-0.5">Thử đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái</p>
                  </td>
                </tr>
              ) : (
                filteredRoster.map((student, idx) => {
                  const sub = student.submission;
                  const isSubmitted = student.roomStatus === 'SUBMITTED';
                  const isZero = student.roomStatus === 'EXPIRED_ZERO';
                  const isInRoom = student.roomStatus === 'IN_ROOM';
                  const isNotJoined = student.roomStatus === 'NOT_JOINED';

                  return (
                    <tr
                      key={student.studentId}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400 font-semibold">
                        {idx + 1}
                      </td>

                      {/* Sinh viên */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-full border border-slate-200">
                            {student.avatarUrl ? (
                              <AvatarImage src={student.avatarUrl} alt={student.studentName} />
                            ) : null}
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-xs">
                              {student.studentName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {student.studentName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {student.studentCode ? (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(student.studentCode!)}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition"
                                  title="Bấm để sao chép MSSV"
                                >
                                  <span>{student.studentCode}</span>
                                  {copiedCode === student.studentCode ? (
                                    <Check className="size-2.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="size-2.5 opacity-40 group-hover:opacity-100" />
                                  )}
                                </button>
                              ) : null}
                              {student.email && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                  • {student.email}
                                </span>
                              )}
                            </div>
                            {sub && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded">
                                  <FileArchive className="size-2.5 text-indigo-600" />
                                  <span>File ZIP</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái phòng */}
                      <td className="py-3 px-4">
                        {isSubmitted ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[11px] gap-1 py-0.5"
                          >
                            <CheckCircle2 className="size-3" />
                            Đã nộp bài
                          </Badge>
                        ) : isInRoom ? (
                          <Badge
                            variant="outline"
                            className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-[11px] gap-1 py-0.5 animate-pulse"
                          >
                            <Clock className="size-3" />
                            Đang làm bài
                          </Badge>
                        ) : isZero ? (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[11px] gap-1 py-0.5"
                          >
                            <AlertTriangle className="size-3" />
                            Quá hạn (0đ)
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-500 font-semibold text-[11px] gap-1 py-0.5"
                          >
                            <UserX className="size-3" />
                            Chưa vào phòng
                          </Badge>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {student.unlockedAt ? (
                          <div>
                            <span className="text-[11px] text-slate-400">Vào phòng: </span>
                            <span className="font-mono text-slate-700">
                              {new Date(student.unlockedAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {sub?.submittedAt && (
                          <div className="mt-0.5">
                            <span className="text-[11px] text-slate-400">Nộp lúc: </span>
                            <span className="font-mono text-emerald-700 font-semibold">
                              {new Date(sub.submittedAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Tiến độ Test */}
                      <td className="py-3 px-4">
                        {sub ? (
                          <div>
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                              <span
                                className={
                                  sub.passedTestCases === (sub.totalTestCases || totalTestCases) && sub.passedTestCases > 0
                                    ? 'text-emerald-600'
                                    : sub.passedTestCases > 0
                                    ? 'text-amber-600'
                                    : 'text-rose-600'
                                }
                              >
                                {sub.passedTestCases} / {sub.totalTestCases || totalTestCases}
                              </span>
                              <span className="text-[11px] text-slate-400 font-sans font-normal">tests</span>
                            </div>
                            {sub.compileSuccess === false && (
                              <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                Lỗi Compile
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Điểm số */}
                      <td className="py-3 px-4 text-center">
                        {sub && sub.finalScore !== null ? (
                          <div>
                            <span
                              className={`font-mono text-sm font-black px-2.5 py-1 rounded-xl border ${
                                Number(sub.finalScore) > 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {Number(sub.finalScore).toFixed(1)} đ
                            </span>
                            {sub.sandboxScore !== null && sub.aiScore !== null && Number(sub.aiScore) > 0 && (
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                (Máy: {Number(sub.sandboxScore).toFixed(1)} + AI: {Number(sub.aiScore).toFixed(1)})
                              </p>
                            )}
                          </div>
                        ) : sub && sub.sandboxScore !== null ? (
                          <div>
                            <span
                              className={`font-mono text-sm font-black px-2.5 py-1 rounded-xl border ${
                                Number(sub.sandboxScore) > 0
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                              title="Điểm do máy chấm (Đang chờ giảng viên duyệt hoặc chốt điểm)"
                            >
                              {Number(sub.sandboxScore).toFixed(1)} đ
                            </span>
                            <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                              (Chờ duyệt)
                            </p>
                          </div>
                        ) : sub && (sub.status === 'FAILED' || sub.compileSuccess === false) ? (
                          <div>
                            <span className="font-mono text-sm font-black px-2.5 py-1 rounded-xl border bg-rose-50 text-rose-700 border-rose-200">
                              0.0 đ
                            </span>
                          </div>
                        ) : sub ? (
                          <span className="font-mono text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                            Đang chấm...
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={downloadingZipId === sub.id}
                                onClick={async () => {
                                  try {
                                    setDownloadingZipId(sub.id);
                                    const userTag = student.studentCode || student.email.split('@')[0] || 'sv';
                                    await assignmentService.downloadSubmissionZip(sub.id, `${userTag}_${sub.id.slice(-6)}.zip`);
                                  } catch (err: any) {
                                    alert(err?.message || 'Không thể tải tập tin bài nộp .ZIP.');
                                  } finally {
                                    setDownloadingZipId(null);
                                  }
                                }}
                                className="h-8 rounded-xl border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs shadow-2xs gap-1 cursor-pointer"
                                title="Tải tập tin bài nộp .ZIP của sinh viên về máy"
                              >
                                {downloadingZipId === sub.id ? (
                                  <Loader2 className="size-3 animate-spin text-indigo-600" />
                                ) : (
                                  <Download className="size-3 text-indigo-600" />
                                )}
                                <span>{downloadingZipId === sub.id ? 'Đang tải...' : 'Tải .ZIP'}</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onOpenLogDrawer(student)}
                                className="h-8 rounded-xl border-indigo-200/90 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs shadow-2xs gap-1 cursor-pointer"
                                title="Xem log bài nộp và code từng câu"
                              >
                                <Terminal className="size-3 text-indigo-600" />
                                <span>Xem log</span>
                              </Button>

                              {onRegrade && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  disabled={regradingId === sub.id}
                                  onClick={() => handleTriggerRegrade(sub.id)}
                                  className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                                  title="Chấm lại bài nộp này"
                                >
                                  <RefreshCw
                                    className={`size-3.5 ${
                                      regradingId === sub.id ? 'animate-spin text-indigo-600' : ''
                                    }`}
                                  />
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-300 text-xs italic">Chưa có bài</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
