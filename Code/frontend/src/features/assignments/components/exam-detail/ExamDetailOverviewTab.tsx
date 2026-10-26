'use client';

import React, { useState } from 'react';
import {
  FileText,
  FolderArchive,
  Download,
  ExternalLink,
  Code2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Clock,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Assignment } from '../../types/assignment.types';
import { assignmentService } from '../../services/assignment.service';
import { getErrorMessage } from '@/lib/errors';

interface ExamDetailOverviewTabProps {
  assignment: Assignment;
}

export const ExamDetailOverviewTab: React.FC<ExamDetailOverviewTabProps> = ({ assignment }) => {
  const isJava = assignment.environment === 'JAVA_JDK';
  const hasPdf = Boolean(assignment.pdfFilePath || assignment.hasPdf);
  const hasStarter = Boolean(assignment.starterCodePath || assignment.hasStarterCode);

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingStarter, setLoadingStarter] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedAccessCode, setCopiedAccessCode] = useState(false);

  const handleCopyAccessCode = () => {
    if (!assignment.accessCode) return;
    navigator.clipboard.writeText(assignment.accessCode);
    setCopiedAccessCode(true);
    setTimeout(() => setCopiedAccessCode(false), 2000);
  };

  const handleOpenPdf = async () => {
    setActionError(null);
    const pdfWindow = window.open('about:blank', '_blank');
    setLoadingPdf(true);
    try {
      const blob = await assignmentService.downloadAssignmentFile(assignment.id, 'pdf');
      const url = URL.createObjectURL(blob);
      if (pdfWindow) {
        pdfWindow.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (err) {
      pdfWindow?.close();
      console.error('Không mở được file PDF đề thi:', err);
      setActionError(getErrorMessage(err, 'Không tải được tệp PDF đề thi.'));
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    setActionError(null);
    setLoadingPdf(true);
    try {
      const blob = await assignmentService.downloadAssignmentFile(assignment.id, 'pdf');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `de-thi-${assignment.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err) {
      console.error('Không tải được file PDF:', err);
      setActionError(getErrorMessage(err, 'Không thể tải xuống tệp PDF đề thi.'));
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadStarter = async () => {
    setActionError(null);
    setLoadingStarter(true);
    try {
      const blob = await assignmentService.downloadAssignmentFile(assignment.id, 'starter');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `starter-${assignment.title.toLowerCase().replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err) {
      console.error('Không tải được starter zip:', err);
      setActionError(getErrorMessage(err, 'Không thể tải xuống tệp Template ZIP.'));
    } finally {
      setLoadingStarter(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 1. OFFICIAL PDF & STARTER PACK SUMMARY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Card */}
        <Card className="rounded-2xl border-slate-200 shadow-2xs p-5 bg-white flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900">Đề bài chính thức (PDF)</h4>
                {hasPdf ? (
                  <Badge variant="outline" className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="size-3 mr-1 text-emerald-600" /> Có sẵn
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px] font-bold bg-slate-100 text-slate-600">
                    Chưa tải lên
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tệp PDF đề thi chính thức được phát hành cho sinh viên xem câu hỏi, ràng buộc bài tập và cách tính điểm.
              </p>
              {assignment.pdfFilePath && (
                <p className="text-[11px] font-mono text-slate-400 truncate pt-1">
                  Đường dẫn: {assignment.pdfFilePath}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              disabled={!hasPdf || loadingPdf}
              onClick={handleOpenPdf}
              className="flex-1 h-9 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs gap-1.5"
            >
              {loadingPdf ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang mở...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="size-3.5" />
                  <span>Mở xem PDF</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!hasPdf || loadingPdf}
              onClick={handleDownloadPdf}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
            >
              <Download className="size-3.5" />
              <span>Tải PDF</span>
            </Button>
          </div>
        </Card>

        {/* Starter ZIP Card */}
        <Card className="rounded-2xl border-slate-200 shadow-2xs p-5 bg-white flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <FolderArchive className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900">Template bài làm (ZIP)</h4>
                {hasStarter ? (
                  <Badge variant="outline" className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="size-3 mr-1 text-emerald-600" /> Đã đính kèm
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px] font-bold bg-slate-100 text-slate-600">
                    Không có ZIP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khung mã nguồn dự án tiêu chuẩn (NetBeans, IntelliJ, VS Code) để sinh viên mở IDE và viết thuật toán.
              </p>
              {assignment.starterCodePath && (
                <p className="text-[11px] font-mono text-slate-400 truncate pt-1">
                  Đường dẫn: {assignment.starterCodePath}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              disabled={!hasStarter || loadingStarter}
              onClick={handleDownloadStarter}
              variant="outline"
              className="w-full h-9 rounded-xl text-xs font-bold border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-700 shadow-2xs gap-1.5"
            >
              {loadingStarter ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang tải xuống...</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  <span>Tải Template ZIP (.zip)</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* 2. DESCRIPTION & TECHNICAL SPECIFICATIONS */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs p-6 bg-white space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <FileText className="size-5 text-indigo-600" />
          <span>Yêu Cầu Đề Bài & Hướng Dẫn Kỹ Thuật</span>
        </h3>

        {/* PROMINENT ACCESS CODE / PASSCODE BANNER FOR LECTURER */}
        {assignment.accessCode ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <KeyRound className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Mã truy cập phòng thi (Passcode mở đề cho Thí sinh)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-base font-black tracking-wider text-amber-950 bg-white px-3 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
                    {assignment.accessCode}
                  </span>
                  <span className="text-xs text-amber-700 hidden md:inline">
                    (Thí sinh cần nhập chính xác mã này để mở đề và tải Starter code)
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyAccessCode}
              className="h-8 px-3 rounded-lg text-xs font-bold bg-white hover:bg-amber-100/80 text-amber-900 border-amber-300 shadow-2xs gap-1.5 shrink-0"
            >
              {copiedAccessCode ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-amber-700" />
                  <span>Sao chép mã đề</span>
                </>
              )}
            </Button>
          </div>
        ) : null}

        {assignment.description ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap">
            <p className="font-semibold text-slate-500 uppercase text-[11px] tracking-wider">
              Nội dung mô tả đề thi:
            </p>
            <p className="text-slate-700 text-sm">{assignment.description}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Terminal className="size-3.5 text-purple-600" />
              <span>Môi trường biên dịch</span>
            </div>
            <div className="text-xs font-bold text-slate-900">
              {isJava ? 'Java JDK 21 (javac)' : assignment.environment === 'C_GCC' ? 'C GCC 11 (-O2)' : 'React.js (Web Playwright)'}
            </div>
            <p className="text-[11px] text-slate-500">Chạy cách ly hoàn toàn qua Docker Sandbox</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Clock className="size-3.5 text-emerald-600" />
              <span>Thời lượng làm bài</span>
            </div>
            <div className="text-xs font-bold text-slate-900">
              {assignment.durationMinutes ?? 90} phút
            </div>
            <p className="text-[11px] text-slate-500">Tự động khóa cổng nộp khi hết thời gian</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-indigo-600" />
              <span>Bảo mật phòng thi</span>
            </div>
            <div className="flex items-center gap-2">
              {assignment.accessCode ? (
                <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  {assignment.accessCode}
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-900">Không cài mã đề</span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {assignment.accessCode
                ? 'Thí sinh cần mã để mở đề'
                : assignment.submissionType === 'GROUP'
                ? 'Nộp bài theo nhóm'
                : 'Bài làm cá nhân'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
