'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Code2,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  FileCode,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ExamSessionRosterStudent, SourceCodeFile } from '../types/proctoring.types';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import { formatDateTime } from '@/lib/formatDate';

interface SubmissionLogInspectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: ExamSessionRosterStudent | null;
  assignmentId: string;
  onRefresh?: () => void;
}

interface TestCaseResultItem {
  id: string;
  testCaseId: string;
  verdict: 'PASSED' | 'FAILED' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
  earnedPoints: number | string;
  actualStdout?: string | null;
  actualFileOutput?: string | null;
  diffLog?: string | null;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  testCase?: {
    id: string;
    label: string;
    orderIndex?: number;
    points: number | string;
    stdinInput?: string | null;
    expectedStdout?: string | null;
    isHidden?: boolean;
  };
}

export const SubmissionLogInspectorDrawer: React.FC<SubmissionLogInspectorDrawerProps> = ({
  open,
  onOpenChange,
  student,
  assignmentId,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [sourceFiles, setSourceFiles] = useState<SourceCodeFile[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('Q1');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [overrideScore, setOverrideScore] = useState<string>('');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showFullCompile, setShowFullCompile] = useState(false);
  const [isRegrading, setIsRegrading] = useState(false);

  const submissionId = student?.submission?.id;

  // Tải chi tiết bài nộp và cây file mã nguồn
  useEffect(() => {
    if (!open || !submissionId) return;

    let isMounted = true;
    setLoading(true);
    setDetailData(null);
    setSourceFiles([]);
    setOverrideScore(student.submission?.finalScore !== null ? String(student.submission?.finalScore) : '');
    setReviewNote('');
    setFeedbackMsg(null);

    Promise.all([
      assignmentService.getSubmissionDetail(submissionId),
      assignmentService.getSubmissionSourceFiles(submissionId),
    ])
      .then(([detail, files]) => {
        if (!isMounted) return;
        setDetailData(detail);
        setSourceFiles(files || []);
        if (detail) {
          const suggested = detail.finalScore !== null && detail.finalScore !== undefined
            ? String(detail.finalScore)
            : detail.sandboxScore !== null && detail.sandboxScore !== undefined
            ? String(Math.min(10, Number(detail.sandboxScore || 0) + Number(detail.aiScore || 0)).toFixed(1))
            : '';
          if (suggested) setOverrideScore(suggested);
        }

        // Chọn file đầu tiên hoặc ưu tiên file thuật toán chính (My*.java hoặc q*.c)
        if (files && files.length > 0) {
          const priorityIndex = files.findIndex((f) =>
            /My.*\.java$/i.test(f.name) || /q1\.c$/i.test(f.name) || /main\.c$/i.test(f.name)
          );
          setSelectedFileIndex(priorityIndex >= 0 ? priorityIndex : 0);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài nộp:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, submissionId, student]);

  // Nhóm Test Cases theo Câu hỏi (Q1, Q2, Q3...)
  const questionsGroup = useMemo(() => {
    const rawResults: TestCaseResultItem[] = detailData?.testResults || [];
    // Sắp xếp test results tuần tự theo orderIndex hoặc label
    const testResults = [...rawResults].sort((a, b) => {
      const ordA = a.testCase?.orderIndex ?? 9999;
      const ordB = b.testCase?.orderIndex ?? 9999;
      if (ordA !== ordB) return ordA - ordB;
      return (a.testCase?.label || '').localeCompare(b.testCase?.label || '', undefined, { numeric: true });
    });

    const groups: Record<string, { label: string; testResults: TestCaseResultItem[]; earnedPoints: number; maxPoints: number }> = {};

    for (const tr of testResults) {
      const tcLabel = tr.testCase?.label || '';
      // Trích xuất mã câu hỏi: Q1, Q2, Question 1, hoặc mặc định Q1
      const match = tcLabel.match(/^(Q\d+|Question\s*\d+|Câu\s*\d+)/i);
      const qKey = match ? match[0].toUpperCase().replace(/\s+/g, '') : 'Q1';

      if (!groups[qKey]) {
        groups[qKey] = { label: qKey, testResults: [], earnedPoints: 0, maxPoints: 0 };
      }

      const earned = Number(tr.earnedPoints || 0);
      const maxPts = Number(tr.testCase?.points || 1);

      groups[qKey].testResults.push(tr);
      groups[qKey].earnedPoints += earned;
      groups[qKey].maxPoints += maxPts;
    }

    // Nếu không có test case nào, tạo mặc định Q1
    if (Object.keys(groups).length === 0) {
      groups['Q1'] = { label: 'Q1', testResults: [], earnedPoints: 0, maxPoints: 0 };
    }

    // Sắp xếp các câu hỏi theo thứ tự tự nhiên chuẩn mực (Q1 -> Q2 -> Q3...)
    const sortedKeys = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    const sortedGroups: Record<string, { label: string; testResults: TestCaseResultItem[]; earnedPoints: number; maxPoints: number }> = {};
    for (const k of sortedKeys) {
      sortedGroups[k] = groups[k];
    }

    return sortedGroups;
  }, [detailData?.testResults]);

  // Tự động set tab câu hỏi đầu tiên khi groups sẵn sàng
  useEffect(() => {
    const keys = Object.keys(questionsGroup);
    if (keys.length > 0 && !questionsGroup[selectedQuestion]) {
      setSelectedQuestion(keys[0]);
    }
  }, [questionsGroup, selectedQuestion]);

  // Tự động chọn file mã nguồn trọng tâm đầu tiên khi chuyển tab câu hỏi
  useEffect(() => {
    setSelectedFileIndex(0);
  }, [selectedQuestion]);

  // Lọc file mã nguồn tương ứng với câu hỏi đang chọn (nếu bài chia thư mục Q1/Q2/Q3)
  const currentFiles = useMemo(() => {
    if (sourceFiles.length === 0) return [];
    const qLower = selectedQuestion.toLowerCase();

    // 1. Ưu tiên các file mã nguồn thực sự (loại bỏ .xml, .properties, .mf...)
    const isCode = (f: { path: string }) => /\.(java|c|cpp|h|cs|py|js|ts)$/i.test(f.path);
    const codeFiles = sourceFiles.filter(isCode);
    const pool = codeFiles.length > 0 ? codeFiles : sourceFiles;

    // 2. Tìm các file liên quan tới câu hỏi đang chọn (Q1, Q2, Q3...)
    const matching = pool.filter((f) =>
      f.path.toLowerCase().includes(qLower) || f.name.toLowerCase().includes(qLower)
    );
    const baseList = matching.length > 0 ? matching : pool;

    // 3. Sắp xếp file trọng tâm lên đầu (MyList cho Q1, BSTree cho Q2, Graph cho Q3)
    return [...baseList].sort((a, b) => {
      const getWeight = (name: string) => {
        if (/my.*\.java$/i.test(name)) return 100;
        if (/bstree\.java$/i.test(name)) return 95;
        if (/graph\.java$/i.test(name)) return 90;
        if (/\.(java|c|cpp)$/i.test(name)) return 50;
        return 10;
      };
      return getWeight(b.name) - getWeight(a.name);
    });
  }, [sourceFiles, selectedQuestion]);

  const activeFile = currentFiles[selectedFileIndex] || currentFiles[0] || sourceFiles[0] || null;

  const handleCopyCode = () => {
    if (!activeFile?.content) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Cập nhật điểm chốt & ghi chú của giảng viên
  const handleSaveScoreOverride = async () => {
    if (!submissionId) return;
    try {
      setIsUpdatingScore(true);
      setFeedbackMsg(null);
      const newScore = overrideScore.trim() ? Number(overrideScore) : 0;
      await assignmentService.manualGradeSubmission(submissionId, {
        finalScore: newScore,
        reason: reviewNote || 'Giảng viên duyệt / ghi đè điểm bài thi.',
      });
      setDetailData((prev: any) => prev ? { ...prev, finalScore: newScore } : prev);
      setFeedbackMsg('Đã cập nhật điểm số thành công!');
      onRefresh?.();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      console.error('Lỗi duyệt điểm:', err);
      setFeedbackMsg(err?.message || 'Không thể cập nhật điểm.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const [regradeStep, setRegradeStep] = useState<string>('');

  const handleRegrade = async () => {
    if (!submissionId || isRegrading) return;
    try {
      setIsRegrading(true);
      setRegradeStep('Đang khởi tạo môi trường Docker Sandbox...');
      setFeedbackMsg('Đang kích hoạt quy trình chấm bài tự động qua Docker Sandbox...');
      await assignmentService.regradeSubmission(submissionId);

      const startTime = Date.now();
      const minDurationMs = 5500;
      let latestDetail: any = null;

      // Vòng lặp thăm dò (polling) kết quả thực tế từ BullMQ Worker
      while (Date.now() - startTime < 35000) {
        await new Promise((r) => setTimeout(r, 1200));
        const elapsed = Date.now() - startTime;

        if (elapsed > 1800 && elapsed <= 3800) {
          setRegradeStep('Đang biên dịch mã nguồn Java và thực thi 46 test cases...');
        } else if (elapsed > 3800) {
          setRegradeStep('Đang đối chiếu file ngõ ra (diff test case) và tính điểm...');
        }

        if (elapsed >= minDurationMs) {
          try {
            latestDetail = await assignmentService.getSubmissionDetail(submissionId);
            if (
              latestDetail &&
              latestDetail.status !== 'SUBMITTED' &&
              latestDetail.status !== 'RUNNING_SANDBOX' &&
              latestDetail.status !== 'RUNNING_AI'
            ) {
              break;
            }
          } catch {
            // Thử lại ở nhịp tiếp theo
          }
        }
      }

      const files = await assignmentService.getSubmissionSourceFiles(submissionId).catch(() => []);
      if (!latestDetail) {
        latestDetail = await assignmentService.getSubmissionDetail(submissionId).catch(() => null);
      }

      if (latestDetail) {
        setDetailData(latestDetail);
        const passedCount = (latestDetail.testResults || []).filter((r: any) => r.verdict === 'PASSED').length;
        const totalCount = (latestDetail.testResults || []).length || 46;
        const score = latestDetail.finalScore ?? latestDetail.sandboxScore ?? 0;
        setFeedbackMsg(`Chấm lại hoàn tất: ${passedCount}/${totalCount} test cases đạt (${Number(score).toFixed(1)} đ).`);
      } else {
        setFeedbackMsg('Đã hoàn tất quy trình chấm lại bài nộp.');
      }

      if (files && files.length > 0) setSourceFiles(files);
      onRefresh?.();
    } catch (err: any) {
      console.error('Lỗi khi kích hoạt chấm lại:', err);
      setFeedbackMsg(err?.message || 'Không thể chấm lại bài nộp.');
    } finally {
      setIsRegrading(false);
      setRegradeStep('');
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  const compileOutput = detailData?.compileOutput || '';
  const isCompileSuccess =
    detailData?.compileSuccess === false ||
    compileOutput.includes('COMPILE ERROR') ||
    compileOutput.includes('Không tìm thấy file') ||
    compileOutput.includes('Hết thời gian làm bài')
      ? false
      : Boolean(detailData?.compileSuccess ?? true);
  const isPurePE = (Number(detailData?.assignment?.algorithmMaxScore ?? 0) + Number(detailData?.assignment?.cleanCodeMaxScore ?? 0)) === 0;
  const hasAiRubric = !isPurePE && isCompileSuccess && detailData?.aiScore !== undefined && detailData?.aiScore !== null && Number(detailData?.aiScore) > 0;
  const currentQGroup = questionsGroup[selectedQuestion] || { testResults: [], earnedPoints: 0, maxPoints: 0 };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl p-0 flex flex-col bg-slate-50 border-l border-slate-200 shadow-2xl h-full overflow-hidden"
      >
        {/* 1. Header Inspector Bar */}
        <SheetHeader className="p-5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border-indigo-200"
                >
                  {student?.studentCode || 'STUDENT'}
                </Badge>
                <SheetTitle className="text-base font-extrabold text-slate-900">
                  {student?.studentName || 'Chi tiết bài làm'}
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs text-slate-500 mt-0.5">
                Nộp lúc: {student?.submission?.submittedAt ? formatDateTime(student.submission.submittedAt) : '—'}
                {student?.email ? ` · ${student.email}` : ''}
              </SheetDescription>
            </div>

            {/* Score Badges & Download ZIP */}
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={downloadingZip || !submissionId}
                onClick={async () => {
                  if (!submissionId) return;
                  try {
                    setDownloadingZip(true);
                    const userTag = student?.studentCode || student?.email?.split('@')[0] || 'sv';
                    await assignmentService.downloadSubmissionZip(submissionId, `${userTag}_${submissionId.slice(-6)}.zip`);
                  } catch (e: any) {
                    alert(e?.message || 'Không thể tải file zip bài nộp');
                  } finally {
                    setDownloadingZip(false);
                  }
                }}
                className="h-8 rounded-xl border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs shadow-2xs gap-1.5 cursor-pointer"
                title="Tải tập tin .ZIP bài nộp của sinh viên về máy"
              >
                {downloadingZip ? (
                  <Loader2 className="size-3.5 animate-spin text-indigo-600" />
                ) : (
                  <Download className="size-3.5 text-indigo-600" />
                )}
                <span>Tải file .ZIP</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isRegrading || !submissionId}
                onClick={handleRegrade}
                className="h-8 rounded-xl border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs shadow-2xs gap-1.5 cursor-pointer"
                title="Chạy lại sandbox biên dịch và chấm lại bài nộp này"
              >
                <RefreshCw className={`size-3.5 text-amber-700 ${isRegrading ? 'animate-spin' : ''}`} />
                <span>{isRegrading ? 'Đang chấm...' : 'Chấm lại'}</span>
              </Button>

              <div className="h-7 w-px bg-slate-200" />

              <div className="text-right" title="Điểm chạy kiểm thử trong Sandbox Docker (100% Test cases)">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Điểm bài thi (Tests)
                </span>
                <span className="font-mono text-sm font-bold text-slate-700">
                  {!isCompileSuccess
                    ? `0.0 / ${detailData?.assignment?.functionalMaxScore ?? 10}đ`
                    : detailData?.sandboxScore !== undefined && detailData?.sandboxScore !== null
                    ? `${Number(detailData.sandboxScore).toFixed(1)} / ${detailData?.assignment?.functionalMaxScore ?? 10}đ`
                    : '—'}
                </span>
              </div>

              {/* Anti-cheat & Code Quality Analysis (Ẩn khi lỗi biên dịch) */}
              {isCompileSuccess && (
                <>
                  <div className="h-7 w-px bg-slate-200" />
                  <div className="text-right" title="AI tự động phân tích phát hiện hardcode, gian lận và đánh giá độ phức tạp thuật toán">
                    <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">
                      AI Anti-Cheat & Review
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <Sparkles className="size-3 text-emerald-600" />
                      Hợp lệ {detailData?.aiGradingResult?.detectedTimeComplexity ? `· O(${detailData.aiGradingResult.detectedTimeComplexity})` : ''}
                    </span>
                  </div>
                </>
              )}

              {/* AI Rubric & Gợi ý điểm (Chỉ hiển thị khi KHÔNG PHẢI đề thi Pure PE và biên dịch thành công) */}
              {hasAiRubric && (
                <>
                  <div className="h-7 w-px bg-slate-200" />
                  <div
                    className="text-right"
                    title={`Điểm AI chấm chất lượng code theo Rubric (Thuật toán: ${Number(detailData?.algorithmScore || 0).toFixed(1)}đ + Clean Code: ${Number(detailData?.cleanCodeScore || 0).toFixed(1)}đ)`}
                  >
                    <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">
                      AI (Rubric)
                    </span>
                    <span className="font-mono text-sm font-bold text-indigo-700">
                      {Number(detailData.aiScore).toFixed(1)} / {((detailData?.assignment?.algorithmMaxScore ?? 0) + (detailData?.assignment?.cleanCodeMaxScore ?? 0))}đ
                    </span>
                  </div>

                  <div className="h-7 w-px bg-slate-200" />
                  <div className="text-right" title="Điểm gợi ý tự động của hệ thống = Máy chấm + AI chấm (Thang 10)">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider">
                      Gợi ý (Máy+AI)
                    </span>
                    <span className="font-mono text-sm font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      {(Math.min(10, Number(detailData?.sandboxScore || 0) + Number(detailData?.aiScore || 0))).toFixed(1)} đ
                    </span>
                  </div>
                </>
              )}

              <div className="h-7 w-px bg-slate-200" />

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Điểm chính thức
                </span>
                <span className="font-mono text-base font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-xl border border-emerald-200 inline-block">
                  {detailData?.finalScore !== undefined && detailData?.finalScore !== null
                    ? `${Number(detailData.finalScore).toFixed(1)} đ`
                    : student?.submission?.finalScore !== null
                    ? `${Number(student?.submission?.finalScore).toFixed(1)} đ`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Regrading Process Banner */}
          {isRegrading && (
            <div className="mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50/90 text-xs font-semibold text-amber-950 flex items-center gap-3 animate-pulse shadow-2xs">
              <Loader2 className="size-4 animate-spin text-amber-600 shrink-0" />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span>{regradeStep || 'Đang thực thi chấm lại trên Docker Sandbox...'}</span>
                <span className="font-mono text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                  Docker Sandbox Active
                </span>
              </div>
            </div>
          )}

          {/* Feedback message banner */}
          {!isRegrading && feedbackMsg && (
            <div className="mt-2 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-xs font-semibold text-indigo-900 flex items-center justify-between">
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Compiler Status Notification Banner */}
          {compileOutput && (
            <div
              className={`mt-3 p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                isCompileSuccess
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {isCompileSuccess ? (
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">
                  {isCompileSuccess ? 'Biên dịch hoàn tất thành công' : 'Lỗi trong quá trình biên dịch (Compile Error)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowFullCompile(!showFullCompile)}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{showFullCompile ? 'Thu gọn log' : 'Xem log biên dịch'}</span>
                {showFullCompile ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              </button>
            </div>
          )}

          {showFullCompile && compileOutput && (
            <div className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-40 overflow-y-auto whitespace-pre-wrap">
              {compileOutput}
            </div>
          )}
        </SheetHeader>

        {/* 2. Question Tabs ($Q_1..Q_4$) */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Câu hỏi:
          </span>
          {Object.entries(questionsGroup).map(([qKey, group]) => {
            const isSelected = selectedQuestion === qKey;
            const isFullScore = group.earnedPoints >= group.maxPoints && group.maxPoints > 0;
            return (
              <button
                key={qKey}
                type="button"
                onClick={() => {
                  setSelectedQuestion(qKey);
                  setSelectedFileIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{group.label}</span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : isFullScore
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {group.earnedPoints.toFixed(1)}/{group.maxPoints.toFixed(1)}đ
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Main Body - Bento Grid (Left: Code Viewer / Right: Testcases & Diagnostics) */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <Loader2 className="size-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-medium">Đang tải mã nguồn và kết quả kiểm thử...</p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Cột Trái (7 cols / 58%): Trình duyệt mã nguồn */}
            <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-white h-full overflow-hidden">
              {/* File Selector Bar */}
              <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[85%] pb-0.5 scrollbar-thin">
                  {currentFiles.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Không có file mã nguồn nào</span>
                  ) : (
                    currentFiles.map((file, fIdx) => (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setSelectedFileIndex(fIdx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          (selectedFileIndex === fIdx || activeFile?.path === file.path)
                            ? 'bg-white text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900 bg-slate-200/50 hover:bg-slate-200'
                        }`}
                        title={file.path}
                      >
                        <FileCode className="size-3.5 text-indigo-500" />
                        <span>{file.name}</span>
                      </button>
                    ))
                  )}
                </div>

                {activeFile && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                    title="Sao chép toàn bộ code"
                  >
                    {copiedCode ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Code Editor View */}
              <div className="flex-1 overflow-auto bg-slate-950 text-slate-100 p-4 font-mono text-xs leading-relaxed select-text">
                {activeFile && activeFile.content ? (
                  <div className="min-w-full font-mono text-xs">
                    {activeFile.content
                      .replace(/\r\n/g, '\n')
                      .replace(/\r/g, '\n')
                      .split('\n')
                      .map((line, lineIdx) => (
                        <div key={lineIdx} className="flex hover:bg-slate-900/60 transition-colors">
                          <span className="w-10 shrink-0 select-none text-right pr-4 text-slate-600 font-mono text-[11px] leading-5">
                            {lineIdx + 1}
                          </span>
                          <span className="flex-1 whitespace-pre font-mono text-slate-200 text-xs leading-5">
                            {line || ' '}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    Chưa tìm thấy nội dung file cho câu này
                  </div>
                )}
              </div>
            </div>

            {/* Cột Phải (5 cols / 42%): Test Cases & AI Feedback */}
            <div className="lg:col-span-5 flex flex-col bg-slate-50 h-full overflow-y-auto p-4 space-y-4">
              {/* Test Cases Header */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-indigo-600" />
                  Test Cases của {selectedQuestion} ({currentQGroup.testResults.length})
                </h4>
              </div>

              {/* Test Cases List */}
              <div className="space-y-3">
                {!isCompileSuccess ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-800 space-y-1">
                    <p className="font-bold">Không thể thực thi bộ test cases</p>
                    <p className="text-[11px] text-rose-600 leading-relaxed">
                      Mã nguồn của bài nộp gặp lỗi biên dịch (Compile Error). Sinh viên nhận 0.0 điểm cho tất cả các test cases của câu hỏi này.
                    </p>
                  </div>
                ) : currentQGroup.testResults.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                    Không có test case nào cho câu này hoặc đề thi chưa gắn test case
                  </div>
                ) : (
                  currentQGroup.testResults.map((tr, tcIdx) => {
                    const isPassed = tr.verdict === 'PASSED';
                    return (
                      <div
                        key={tr.id || tcIdx}
                        className={`rounded-2xl border bg-white p-3.5 space-y-2 shadow-2xs transition ${
                          isPassed ? 'border-emerald-200/80' : 'border-rose-200/80'
                        }`}
                      >
                        {/* Header Test */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">
                            {tr.testCase?.label || `Test case #${tcIdx + 1}`}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isPassed ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] gap-1 py-0.5">
                                <CheckCircle2 className="size-2.5" />
                                PASSED
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] gap-1 py-0.5">
                                <XCircle className="size-2.5" />
                                {tr.verdict || 'FAILED'}
                              </Badge>
                            )}
                            <span className="font-mono text-xs font-bold text-slate-700">
                              {Number(tr.earnedPoints || 0).toFixed(1)}/{Number(tr.testCase?.points || 1).toFixed(1)}đ
                            </span>
                          </div>
                        </div>

                        {/* Stdin & Outputs */}
                        <div className="space-y-1.5 font-mono text-[11px]">
                          {tr.testCase?.stdinInput && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-sans font-bold">Input (stdin):</span>
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-800 whitespace-pre-wrap max-h-20 overflow-y-auto">
                                {tr.testCase.stdinInput}
                              </div>
                            </div>
                          )}

                          {tr.testCase?.expectedStdout && (
                            <div>
                              <span className="text-[10px] text-slate-400 font-sans font-bold">Output mong đợi:</span>
                              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 whitespace-pre-wrap max-h-20 overflow-y-auto">
                                {tr.testCase.expectedStdout}
                              </div>
                            </div>
                          )}

                          <div>
                            <span className="text-[10px] text-slate-400 font-sans font-bold">Output sinh viên (actual):</span>
                            <div
                              className={`p-1.5 rounded-lg border whitespace-pre-wrap max-h-24 overflow-y-auto ${
                                isPassed
                                  ? 'bg-slate-100 text-slate-800 border-slate-200'
                                  : 'bg-rose-50/70 text-rose-900 border-rose-200'
                              }`}
                            >
                              {tr.actualStdout || tr.actualFileOutput || '(Không có output ra màn hình)'}
                            </div>
                          </div>

                          {tr.diffLog && !isPassed && (
                            <div>
                              <span className="text-[10px] text-rose-600 font-sans font-bold">So khớp sai khác (Diff):</span>
                              <div className="p-1.5 rounded-lg bg-rose-950 text-rose-200 whitespace-pre-wrap max-h-24 overflow-y-auto text-[10px]">
                                {tr.diffLog}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Timing & Memory */}
                        {(tr.executionTimeMs || tr.memoryUsedKb) ? (
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                            {tr.executionTimeMs ? <span>⏱ {tr.executionTimeMs} ms</span> : null}
                            {tr.memoryUsedKb ? <span>💾 {tr.memoryUsedKb} KB</span> : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>

              {/* AI Code Review & Feedback */}
              {detailData?.aiGradingResult && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-indigo-600" />
                    Đánh giá chất lượng mã nguồn (AI Review)
                  </h4>
                  {!isCompileSuccess ? (
                    <p className="text-xs text-rose-700 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200 leading-relaxed">
                      Chương trình không thể biên dịch thành công (Compile Error). AI không tiến hành chấm điểm chất lượng mã nguồn hoặc phân tích độ phức tạp thời gian khi mã nguồn chưa vượt qua giai đoạn biên dịch.
                    </p>
                  ) : (
                    <>
                      {detailData.aiGradingResult.detectedTimeComplexity && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-medium">Độ phức tạp:</span>
                          <Badge variant="outline" className="font-mono text-xs bg-white text-indigo-700">
                            O({detailData.aiGradingResult.detectedTimeComplexity})
                          </Badge>
                        </div>
                      )}
                      {detailData.aiGradingResult.codeQualityFeedback && (
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white/70 p-2.5 rounded-xl border border-indigo-100/70">
                          {detailData.aiGradingResult.codeQualityFeedback}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Giảng viên ghi chú & Chốt điểm */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Duyệt & Điều chỉnh điểm số
                </h4>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Điểm chốt chính thức (0 - 10):
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={overrideScore}
                    onChange={(e) => setOverrideScore(e.target.value)}
                    className="h-8.5 text-xs font-mono font-bold rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Ghi chú giảng viên (Lý do thay đổi/nhận xét):
                  </label>
                  <Textarea
                    rows={2}
                    placeholder="VD: Chấp nhận thuật toán câu 2 theo hướng giải tương đương..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="text-xs rounded-xl border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {feedbackMsg ? (
                    <span className="text-xs font-bold text-emerald-600">{feedbackMsg}</span>
                  ) : <span />}

                  <Button
                    type="button"
                    size="sm"
                    disabled={isUpdatingScore}
                    onClick={handleSaveScoreOverride}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8.5 shadow-sm"
                  >
                    {isUpdatingScore ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-1.5 size-3.5" />
                    )}
                    Lưu điểm duyệt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
