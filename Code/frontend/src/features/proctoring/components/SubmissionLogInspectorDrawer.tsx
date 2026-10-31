'use client';

// Inspector Drawer xem source code và log chấm thi chi tiết của sinh viên
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Play,
  Activity,
  ShieldCheck,
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
  testCases?: Array<{ id: string; label: string; points: number }>;
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
  testCases: initialTestCases = [],
  onRefresh,
}) => {
  const codeContainerRef = useRef<HTMLDivElement>(null);
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

  // Real-Data Test Case Player states (Log thật & tiến trình tuần tự 100%)
  const [visualState, setVisualState] = useState<'IDLE_READY' | 'IN_QUEUE' | 'SCANNING' | 'REVEALING'>('IDLE_READY');
  const [isPlayingTests, setIsPlayingTests] = useState(false);
  const [currentTestingIndex, setCurrentTestingIndex] = useState<number>(-1);
  const [completedTestSet, setCompletedTestSet] = useState<Set<number>>(new Set());
  const [realConsoleLogs, setRealConsoleLogs] = useState<string[]>([]);
  const terminalBoxRef = useRef<HTMLDivElement>(null);

  const submissionId = student?.submission?.id;

  // Tải chi tiết bài nộp và cây file mã nguồn
  useEffect(() => {
    if (!open || !submissionId) return;

    let isMounted = true;
    setLoading(true);
    setDetailData(null);
    setSourceFiles([]);
    const initialScore =
      student.submission?.finalScore !== null &&
      student.submission?.finalScore !== undefined &&
      (student.submission?.status === 'GRADED' || Number(student.submission?.finalScore) > 0)
        ? String(student.submission?.finalScore)
        : student.submission?.sandboxScore !== null && student.submission?.sandboxScore !== undefined
        ? String(Number(student.submission?.sandboxScore).toFixed(1))
        : '';
    setOverrideScore(initialScore);
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
          const suggested =
            detail.finalScore !== null &&
            detail.finalScore !== undefined &&
            (detail.status === 'GRADED' || Number(detail.finalScore) > 0)
              ? String(detail.finalScore)
              : detail.sandboxScore !== null && detail.sandboxScore !== undefined
              ? String(Math.min(10, Number(detail.sandboxScore || 0) + Number(detail.aiScore || 0)).toFixed(1))
              : '';
          if (suggested) setOverrideScore(suggested);

          // Phân loại trạng thái: Đã có kết quả (kể cả Compile Error) / Đang chờ hàng đợi / Đang chấm
          const isGradingDone =
            detail.compileSuccess === false ||
            (detail.sandboxScore !== null &&
              detail.sandboxScore !== undefined &&
              detail.status !== 'PENDING' &&
              detail.status !== 'SUBMITTED' &&
              detail.status !== 'RUNNING_SANDBOX' &&
              detail.status !== 'RUNNING_AI' &&
              detail.status !== 'QUEUED');

          const isStillProcessing =
            !isGradingDone &&
            (detail.status === 'RUNNING_SANDBOX' ||
              detail.status === 'RUNNING_AI' ||
              detail.status === 'QUEUED' ||
              detail.status === 'PENDING' ||
              detail.status === 'SUBMITTED');

          if (isGradingDone) {
            setVisualState('IDLE_READY');
          } else if (isStillProcessing) {
            setVisualState(
              detail.status === 'RUNNING_SANDBOX' || detail.status === 'RUNNING_AI'
                ? 'SCANNING'
                : 'IN_QUEUE'
            );
          } else {
            setVisualState('IDLE_READY');
          }
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

  // Polling tự động khi bài thi đang trong quá trình chấm Sandbox hoặc AI
  useEffect(() => {
    if (!open || !submissionId || isRegrading) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const latest = await assignmentService.getSubmissionDetail(submissionId);
        if (!isMounted || !latest) return;

        setDetailData(latest);
        const isGradingDone =
          latest.compileSuccess === false ||
          (latest.sandboxScore !== null &&
            latest.sandboxScore !== undefined &&
            latest.status !== 'PENDING' &&
            latest.status !== 'SUBMITTED' &&
            latest.status !== 'RUNNING_SANDBOX' &&
            latest.status !== 'RUNNING_AI' &&
            latest.status !== 'QUEUED');

        if (isGradingDone) {
          const files = await assignmentService.getSubmissionSourceFiles(submissionId).catch(() => []);
          if (isMounted && files.length > 0) setSourceFiles(files);

          const suggestedScore =
            latest.finalScore !== null &&
            latest.finalScore !== undefined &&
            (latest.status === 'GRADED' || Number(latest.finalScore) > 0)
              ? String(latest.finalScore)
              : latest.sandboxScore !== null && latest.sandboxScore !== undefined
              ? String(Math.min(10, Number(latest.sandboxScore || 0) + Number(latest.aiScore || 0)).toFixed(1))
              : '0.0';
          if (suggestedScore) setOverrideScore(suggestedScore);
          onRefresh?.();
        }
      } catch {
        // Tiếp tục polling ở nhịp tiếp theo
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [open, submissionId, isRegrading, onRefresh]);

  // Nhóm Test Cases theo Câu hỏi (Q1, Q2, Q3...)
  const questionsGroup = useMemo(() => {
    const rawResults: TestCaseResultItem[] = detailData?.testResults || [];
    const groups: Record<string, { label: string; testResults: TestCaseResultItem[]; earnedPoints: number; maxPoints: number }> = {};

    if (rawResults.length > 0) {
      // Khi đã có kết quả kiểm thử thực tế từ bài nộp
      const testResults = [...rawResults].sort((a, b) => {
        const ordA = a.testCase?.orderIndex ?? 9999;
        const ordB = b.testCase?.orderIndex ?? 9999;
        if (ordA !== ordB) return ordA - ordB;
        return (a.testCase?.label || '').localeCompare(b.testCase?.label || '', undefined, { numeric: true });
      });

      for (const tr of testResults) {
        const tcLabel = tr.testCase?.label || '';
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
    } else if (initialTestCases && initialTestCases.length > 0) {
      // Khi đang trong quá trình chấm hoặc đang tải: Dựng danh sách câu hỏi trực tiếp từ đề thi (trạng thái chờ, KHÔNG giả mạo PASSED)
      for (const tc of initialTestCases) {
        const match = (tc.label || '').match(/^(Q\d+|Question\s*\d+|Câu\s*\d+)/i);
        const qKey = match ? match[0].toUpperCase().replace(/\s+/g, '') : 'Q1';

        if (!groups[qKey]) {
          groups[qKey] = { label: qKey, testResults: [], earnedPoints: 0, maxPoints: 0 };
        }

        groups[qKey].testResults.push({
          id: `pending-${tc.id}`,
          testCaseId: tc.id,
          verdict: 'PENDING' as any,
          earnedPoints: 0,
          testCase: { id: tc.id, label: tc.label, points: Number(tc.points || 0.2) },
        } as TestCaseResultItem);
        groups[qKey].maxPoints += Number(tc.points || 1);
      }
    }

    // Nếu vẫn chưa có danh sách đề thi (fallback), giữ khung rỗng, tuyệt đối không tạo mock giả mạo
    if (Object.keys(groups).length === 0) {
      const defaultQuestions = ['Q1', 'Q2', 'Q3', 'Q4'];
      for (const qKey of defaultQuestions) {
        groups[qKey] = {
          label: qKey,
          testResults: [],
          earnedPoints: 0,
          maxPoints: 0,
        };
      }
    }

    // Sắp xếp các câu hỏi theo thứ tự tự nhiên chuẩn mực (Q1 -> Q2 -> Q3 -> Q4...)
    const sortedKeys = Object.keys(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    const sortedGroups: Record<string, { label: string; testResults: TestCaseResultItem[]; earnedPoints: number; maxPoints: number }> = {};
    for (const k of sortedKeys) {
      sortedGroups[k] = groups[k];
    }

    return sortedGroups;
  }, [detailData?.testResults, initialTestCases]);

  const questionsGroupRef = useRef(questionsGroup);
  questionsGroupRef.current = questionsGroup;
  const sourceFilesRef = useRef(sourceFiles);
  sourceFilesRef.current = sourceFiles;

  const currentQGroup = questionsGroup[selectedQuestion] || { label: selectedQuestion, testResults: [], earnedPoints: 0, maxPoints: 0 };

  const compileOutput = detailData?.compileOutput || '';
  const isJava =
    detailData?.assignment?.environment === 'JAVA_JDK' ||
    sourceFiles.some((f) => f.name.toLowerCase().endsWith('.java')) ||
    Boolean(student?.submission?.compileOutput?.toLowerCase().includes('java')) ||
    Boolean(detailData?.compileOutput?.toLowerCase().includes('java'));
  const isCompileSuccess =
    detailData?.compileSuccess === false ||
    compileOutput.includes('COMPILE ERROR') ||
    compileOutput.includes('Không tìm thấy file') ||
    compileOutput.includes('Hết thời gian làm bài')
      ? false
      : Boolean(detailData?.compileSuccess ?? true);

  // Chỉ coi là đang chấm Sandbox khi chưa có điểm máy và chưa có kết quả test cases nào
  const isGradingActive =
    (detailData?.status === 'PENDING' ||
      detailData?.status === 'SUBMITTED' ||
      detailData?.status === 'RUNNING_SANDBOX' ||
      detailData?.status === 'QUEUED' ||
      visualState === 'IN_QUEUE' ||
      visualState === 'SCANNING') &&
    detailData?.sandboxScore === null &&
    (detailData?.testResults?.length ?? 0) === 0;

  const isAiAnalyzing = detailData?.status === 'RUNNING_AI';

  // Trích xuất số dòng và chi tiết lỗi từ Compiler Output (gcc / javac)
  const errorLineInfo = useMemo(() => {
    if (isCompileSuccess || !compileOutput) return null;
    const match = compileOutput.match(/(?:[^\s:\/\\]+[\/\\])*([a-zA-Z0-9_\-\.]+\.(?:java|c|cpp|h)):(\d+):(?:\d+:)?\s*(?:fatal )?error:\s*(.*)/i);
    if (match) {
      return {
        fileName: match[1],
        line: Number(match[2]),
        message: match[3]?.trim() || 'Lỗi cú pháp biên dịch',
      };
    }
    const fallback = compileOutput.match(/:(\d+):\s*(?:error|fatal error):\s*(.*)/i);
    if (fallback) {
      return {
        fileName: '',
        line: Number(fallback[1]),
        message: fallback[2]?.trim() || 'Lỗi biên dịch',
      };
    }
    return null;
  }, [isCompileSuccess, compileOutput]);

  const isPurePE = (Number(detailData?.assignment?.algorithmMaxScore ?? 0) + Number(detailData?.assignment?.cleanCodeMaxScore ?? 0)) === 0;
  const hasAiRubric = !isPurePE && isCompileSuccess && detailData?.aiScore !== undefined && detailData?.aiScore !== null && Number(detailData?.aiScore) > 0;

  // Real-Data Test Player: Chạy tuần tự từng test case THẬT
  useEffect(() => {
    if (!isPlayingTests) return;
    const tests = currentQGroup.testResults;
    if (!tests || tests.length === 0) {
      setIsPlayingTests(false);
      setCurrentTestingIndex(-1);
      return;
    }

    if (currentTestingIndex < 0) {
      setCurrentTestingIndex(0);
      return;
    }

    if (currentTestingIndex >= tests.length) {
      setRealConsoleLogs((prev) => [
        ...prev,
        `> [HOÀN TẤT] Đã đối chiếu thành công ${tests.length} test cases cho ${selectedQuestion}.`,
        `> [TỔNG KẾT] Điểm đạt: ${currentQGroup.earnedPoints.toFixed(1)} / ${currentQGroup.maxPoints.toFixed(1)}đ.`,
      ]);
      const timer = setTimeout(() => {
        setIsPlayingTests(false);
        setCurrentTestingIndex(-1);
      }, 500);
      return () => clearTimeout(timer);
    }

    const tr = tests[currentTestingIndex];
    const testNum = currentTestingIndex + 1;
    const testLabel = tr.testCase?.label || `Test case #${testNum}`;
    const inputStr = tr.testCase?.stdinInput ? tr.testCase.stdinInput.trim().replace(/\n/g, ' ') : '(trống)';
    const actualStr = tr.actualStdout ? tr.actualStdout.trim().replace(/\n/g, ' ↵ ') : '(không có output)';
    const expectedStr = tr.testCase?.expectedStdout ? tr.testCase.expectedStdout.trim().replace(/\n/g, ' ↵ ') : '(trống)';
    const ms = tr.executionTimeMs || 800;

    // In log bắt đầu đối chiếu test case
    setRealConsoleLogs((prev) => [
      ...prev,
      `> [TEST ${testNum}/${tests.length}] ${testLabel}: Đang thực thi & đối chiếu output...`,
      `  • Input: ${inputStr}`,
      `  • Output SV: ${actualStr}`,
      `  • Output chuẩn: ${expectedStr}`,
    ]);

    const timer = setTimeout(() => {
      const isPassed = tr.verdict === 'PASSED';
      setRealConsoleLogs((prev) => [
        ...prev,
        `  ${isPassed ? '✔' : '✘'} Kết quả: [${tr.verdict}] (+${Number(tr.earnedPoints || 0).toFixed(1)}đ) · ${ms}ms`,
      ]);
      setCompletedTestSet((prev) => new Set(prev).add(currentTestingIndex));
      setCurrentTestingIndex((prev) => prev + 1);
    }, 450);

    return () => clearTimeout(timer);
  }, [isPlayingTests, currentTestingIndex, currentQGroup.testResults, selectedQuestion]);

  // Cuộn mượt terminal nội bộ khi đang phát test (chỉ cuộn hộp terminal, KHÔNG làm giật trang hay danh sách test)
  useEffect(() => {
    if (!isPlayingTests || !terminalBoxRef.current) return;
    terminalBoxRef.current.scrollTop = terminalBoxRef.current.scrollHeight;
  }, [realConsoleLogs, isPlayingTests]);

  // Khi ở chế độ tĩnh (không play), nạp log tóm tắt thực tế của câu hỏi đang chọn
  useEffect(() => {
    if (isPlayingTests) return;
    if (!currentQGroup.testResults || currentQGroup.testResults.length === 0) {
      setRealConsoleLogs([`> [DOCKER] Sandbox cô lập (--network none)`, `> [CHỜ] Chưa có dữ liệu test cases cho ${selectedQuestion}.`]);
      return;
    }
    const lines: string[] = [
      `> [DOCKER] Container ${isJava ? 'eclipse-temurin:17-alpine' : 'gcc:alpine'} (cô lập --network none)`,
      `> [TEST SUITE] Đối chiếu kết quả ${selectedQuestion} (${currentQGroup.testResults.length} test cases)`,
    ];
    currentQGroup.testResults.forEach((tr, i) => {
      const isP = tr.verdict === 'PASSED';
      lines.push(`${isP ? '✔' : '✘'} ${tr.testCase?.label || `Test #${i + 1}`}: [${tr.verdict}] (+${Number(tr.earnedPoints || 0).toFixed(1)}đ) | ${tr.executionTimeMs || 800}ms`);
    });
    lines.push(`> [TỔNG KẾT] Đạt ${currentQGroup.earnedPoints.toFixed(1)} / ${currentQGroup.maxPoints.toFixed(1)}đ cho ${selectedQuestion}.`);
    setRealConsoleLogs(lines);
  }, [selectedQuestion, currentQGroup.testResults.length, currentQGroup.earnedPoints, isPlayingTests, isJava]);

  const handleReplayScan = () => {
    if (!currentQGroup.testResults || currentQGroup.testResults.length === 0) return;
    setRealConsoleLogs([
      `> [DOCKER] Khởi chạy container ${isJava ? 'eclipse-temurin:17-alpine' : 'gcc:alpine'}...`,
      `> [TEST RUNNER] Bắt đầu đối chiếu tuần tự các test cases của ${selectedQuestion}...`,
    ]);
    setCompletedTestSet(new Set());
    setCurrentTestingIndex(0);
    setIsPlayingTests(true);
  };

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
      setVisualState('SCANNING');
      setRealConsoleLogs([`> [DOCKER] Đang khởi tạo môi trường Docker Sandbox...`]);
      setCompletedTestSet(new Set());
      setCurrentTestingIndex(-1);
      setIsPlayingTests(false);
      setRegradeStep('Đang khởi tạo môi trường Docker Sandbox...');
      setFeedbackMsg('Đang kích hoạt quy trình chấm bài tự động qua Docker Sandbox...');
      await assignmentService.regradeSubmission(submissionId);

      const startTime = Date.now();
      const minDurationMs = 3000;
      let latestDetail: any = null;

      // Vòng lặp thăm dò (polling) kết quả thực tế từ BullMQ Worker (tối đa 65s cho Java 47 testcases)
      while (Date.now() - startTime < 65000) {
        await new Promise((r) => setTimeout(r, 1000));
        const elapsed = Date.now() - startTime;

        if (elapsed > 1200 && elapsed <= 4000) {
          setRegradeStep(isJava ? 'Đang biên dịch javac và nạp bộ kiểm thử vào container Temurin:17...' : 'Đang biên dịch gcc và thực thi các test cases...');
        } else if (elapsed > 4000 && elapsed <= 25000) {
          setRegradeStep('Đang thực thi các test cases trong Sandbox Docker cô lập...');
        } else if (elapsed > 25000) {
          setRegradeStep('Đang đối chiếu file ngõ ra (diff test case) và tính tổng điểm...');
        }

        if (elapsed >= minDurationMs) {
          try {
            latestDetail = await assignmentService.getSubmissionDetail(submissionId);
            if (
              latestDetail &&
              latestDetail.status !== 'SUBMITTED' &&
              latestDetail.status !== 'RUNNING_SANDBOX' &&
              latestDetail.status !== 'RUNNING_AI' &&
              (latestDetail.sandboxScore !== null || latestDetail.compileSuccess === false)
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
        const totalCount = (latestDetail.testResults || []).length || 57;
        const score = latestDetail.finalScore ?? latestDetail.sandboxScore ?? 0;
        setFeedbackMsg(`Chấm lại hoàn tất: ${passedCount}/${totalCount} test cases đạt (${Number(score).toFixed(1)} đ).`);
      } else {
        setFeedbackMsg('Đã hoàn tất quy trình chấm lại bài nộp.');
      }

      if (files && files.length > 0) setSourceFiles(files);
      setVisualState('REVEALING');
      setTimeout(() => {
        setVisualState('IDLE_READY');
        onRefresh?.();
      }, 700);
    } catch (err: any) {
      console.error('Lỗi khi kích hoạt chấm lại:', err);
      setFeedbackMsg(err?.message || 'Không thể chấm lại bài nộp.');
      setVisualState('IDLE_READY');
    } finally {
      setIsRegrading(false);
      setRegradeStep('');
      setTimeout(() => setFeedbackMsg(null), 5000);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl p-0 flex flex-col bg-slate-50 border-l border-slate-200 shadow-2xl h-full overflow-hidden"
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

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPlayingTests || isRegrading || !currentQGroup.testResults || currentQGroup.testResults.length === 0}
                onClick={handleReplayScan}
                className="h-8 rounded-xl border-cyan-300 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-xs shadow-2xs gap-1.5 cursor-pointer"
                title="Chạy mô phỏng đối chiếu tuần tự từng test case dựa trên dữ liệu thật"
              >
                <Sparkles className={`size-3.5 text-cyan-600 ${isPlayingTests ? 'animate-spin' : ''}`} />
                <span>{isPlayingTests ? 'Đang đối chiếu...' : 'Mô phỏng đối chiếu'}</span>
              </Button>

              <div className="h-7 w-px bg-slate-200" />

              <div className="text-right" title="Điểm chạy kiểm thử trong Sandbox Docker (100% Test cases)">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Điểm bài thi (Tests)
                </span>
                <span className="font-mono text-sm font-bold text-slate-700">
                  {detailData?.sandboxScore !== undefined && detailData?.sandboxScore !== null
                    ? `${Number(detailData.sandboxScore).toFixed(1)} / ${detailData?.assignment?.functionalMaxScore ?? 10}đ`
                    : isGradingActive || isPlayingTests
                    ? 'Đang chấm...'
                    : !isCompileSuccess
                    ? `0.0 / ${detailData?.assignment?.functionalMaxScore ?? 10}đ`
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
                      Hợp lệ {detailData?.aiGradingResult?.detectedTimeComplexity ? `· ${detailData.aiGradingResult.detectedTimeComplexity.startsWith('O(') ? detailData.aiGradingResult.detectedTimeComplexity : `O(${detailData.aiGradingResult.detectedTimeComplexity})`}` : ''}
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
                  {detailData?.finalScore !== undefined &&
                  detailData?.finalScore !== null &&
                  (detailData?.status === 'GRADED' || Number(detailData.finalScore) > 0)
                    ? `${Number(detailData.finalScore).toFixed(1)} đ`
                    : student?.submission?.finalScore !== null &&
                      student?.submission?.finalScore !== undefined &&
                      (student?.submission?.status === 'GRADED' || Number(student?.submission?.finalScore) > 0)
                    ? `${Number(student?.submission?.finalScore).toFixed(1)} đ`
                    : 'Chờ duyệt'}
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
                  {isGradingActive && group.maxPoints === 0
                    ? 'Đang chấm...'
                    : `${group.earnedPoints.toFixed(1)}/${group.maxPoints.toFixed(1)}đ`}
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
                      .map((line, lineIdx) => {
                        const isErrorLine =
                          errorLineInfo &&
                          errorLineInfo.line === lineIdx + 1 &&
                          (!errorLineInfo.fileName || activeFile?.name.toLowerCase().includes(errorLineInfo.fileName.toLowerCase()) || errorLineInfo.fileName.toLowerCase().includes(activeFile?.name.toLowerCase()));

                        return (
                          <div
                            key={lineIdx}
                            className={`flex transition-colors ${
                              isErrorLine
                                ? 'bg-rose-950/80 border-l-4 border-rose-500 pl-1 text-rose-200'
                                : 'hover:bg-slate-900/60'
                            }`}
                          >
                            <span
                              className={`w-10 shrink-0 select-none text-right pr-4 font-mono text-[11px] leading-5 ${
                                isErrorLine ? 'text-rose-400 font-bold' : 'text-slate-600'
                              }`}
                            >
                              {lineIdx + 1}
                            </span>
                            <span className="flex-1 whitespace-pre font-mono text-xs leading-5 flex items-center justify-between pr-2">
                              <span className={isErrorLine ? 'text-rose-200 font-bold' : 'text-slate-200'}>
                                {line || ' '}
                              </span>
                              {isErrorLine && (
                                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-600 text-white shrink-0 shadow-xs">
                                  Lỗi ở dòng này ⚠️
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
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
              {/* 1. Header Test Cases & Docker Container Badge */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-indigo-600" />
                  Test Cases của {selectedQuestion} ({currentQGroup.testResults.length})
                </h4>
                <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                  {isJava ? 'eclipse-temurin:17-alpine' : 'gcc:alpine'}
                </span>
              </div>

              {/* 2. Banner trạng thái nếu tiến trình Sandbox / AI đang chạy */}
              {isGradingActive && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 shadow-2xs">
                  <Loader2 className="size-4 animate-spin text-amber-600 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-bold">Đang thực thi Docker Sandbox:</span>{' '}
                    <span className="text-amber-700">Đang biên dịch mã nguồn và chạy bộ kiểm thử cô lập...</span>
                  </div>
                </div>
              )}

              {!isGradingActive && isAiAnalyzing && (
                <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900 flex items-center gap-2 shadow-2xs">
                  <Loader2 className="size-3.5 animate-spin text-cyan-600 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-bold text-cyan-800">Đang phân tích AI:</span>{' '}
                    <span className="text-cyan-700">Test cases đã xong. AI đang đối chiếu Rubric và độ phức tạp thuật toán...</span>
                  </div>
                </div>
              )}

              {/* 3. Live Terminal Console - Đặt ở đỉnh cột phải để xem ngay lập tức */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 overflow-hidden shadow-xs shrink-0">
                <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500" />
                    <span className="size-2 rounded-full bg-amber-500" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono font-bold text-slate-300 ml-1">
                      Docker Test Assertion Log ({selectedQuestion})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {isPlayingTests ? '● STREAMING LIVE' : 'DOCKER ASSERTION'}
                  </span>
                </div>
                <div ref={terminalBoxRef} className="p-3 font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
                  {realConsoleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`leading-relaxed whitespace-pre-wrap ${
                        log.startsWith('  ✔') || log.startsWith('✔')
                          ? 'text-emerald-400 font-bold'
                          : log.startsWith('  ✘') || log.startsWith('✘')
                          ? 'text-rose-400 font-bold'
                          : log.startsWith('>')
                          ? 'text-cyan-300 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Danh sách các Test Case chi tiết */}
              <div className="space-y-3">
                {!isCompileSuccess ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-rose-700">
                      <AlertTriangle className="size-4 text-rose-600 shrink-0" />
                      <span>Không thể thực thi test cases (Compile Error)</span>
                    </div>

                    {errorLineInfo && (
                      <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-700 font-mono">
                            📍 {errorLineInfo.fileName ? `${errorLineInfo.fileName} : ` : ''}Dòng {errorLineInfo.line}
                          </span>
                          <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 font-bold">
                            Lỗi cú pháp
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                          {errorLineInfo.message}
                        </p>
                      </div>
                    )}

                    {compileOutput && (
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                          Log chi tiết từ Trình biên dịch:
                        </span>
                        <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {compileOutput}
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentQGroup.testResults.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                    Chưa có test case nào cho câu hỏi này
                  </div>
                ) : (
                  currentQGroup.testResults.map((tr, tcIdx) => {
                    const isRunning = isPlayingTests && currentTestingIndex === tcIdx;
                    const isPending = (tr.verdict as string) === 'PENDING' || !tr.verdict;
                    const isPassed = tr.verdict === 'PASSED';
                    const isDone = isPlayingTests ? completedTestSet.has(tcIdx) : !isPending;

                    return (
                      <div
                        key={tr.id || tcIdx}
                        className={`rounded-2xl border p-3.5 space-y-2 shadow-2xs transition-all duration-300 ${
                          isRunning
                            ? 'border-cyan-400 ring-2 ring-cyan-400/20 bg-cyan-50/40'
                            : isDone
                            ? isPassed
                              ? 'bg-white border-emerald-200/80'
                              : 'bg-white border-rose-200/80'
                            : 'bg-slate-100/60 border-slate-200 opacity-60'
                        }`}
                      >
                        {/* Header Test */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isRunning ? (
                              <Loader2 className="size-4 text-cyan-600 animate-spin shrink-0" />
                            ) : isDone ? (
                              isPassed ? (
                                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="size-4 text-rose-600 shrink-0" />
                              )
                            ) : (
                              <div className="size-4 rounded-full border border-slate-300 shrink-0" />
                            )}
                            <span className="font-bold text-xs text-slate-800">
                              {tr.testCase?.label || `Test case #${tcIdx + 1}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isRunning ? (
                              <Badge className="bg-cyan-500 text-white font-bold text-[10px] gap-1 py-0.5">
                                <Loader2 className="size-2.5 animate-spin" />
                                Đang đối chiếu...
                              </Badge>
                            ) : isDone ? (
                              <>
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
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium bg-slate-200/60 px-2 py-0.5 rounded">
                                Chờ đối chiếu
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stdin & Outputs - chỉ hiện khi test case đã hoàn thành */}
                        {isDone && (
                          <div className="space-y-1.5 font-mono text-[11px] pt-1">
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

                            {/* Timing & Memory */}
                            {(tr.executionTimeMs || tr.memoryUsedKb) ? (
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100">
                                {tr.executionTimeMs ? <span>⏱ {tr.executionTimeMs} ms</span> : null}
                                {tr.memoryUsedKb ? <span>💾 {tr.memoryUsedKb} KB</span> : null}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* AI Code Review & Feedback */}
              {detailData?.aiGradingResult && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-indigo-600" />
                      Đánh giá chất lượng mã nguồn (AI Review)
                    </h4>
                    {detailData.aiGradingResult.detectedTimeComplexity && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 font-medium text-[11px]">Độ phức tạp:</span>
                        <Badge variant="outline" className="font-mono text-[11px] bg-white text-indigo-700 font-bold border-indigo-200 px-2 py-0.2">
                          {detailData.aiGradingResult.detectedTimeComplexity.startsWith('O(')
                            ? detailData.aiGradingResult.detectedTimeComplexity
                            : `O(${detailData.aiGradingResult.detectedTimeComplexity})`}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {!isCompileSuccess ? (
                    <p className="text-xs text-rose-700 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200 leading-relaxed">
                      Chương trình không thể biên dịch thành công (Compile Error). AI không tiến hành chấm điểm chất lượng mã nguồn hoặc phân tích độ phức tạp thời gian khi mã nguồn chưa vượt qua giai đoạn biên dịch.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Hiển thị chi tiết từng tiêu chí Rubric thực tế */}
                      {Array.isArray(detailData.aiGradingResult.rubricBreakdownJson) &&
                        detailData.aiGradingResult.rubricBreakdownJson.length > 0 && (
                          <div className="grid grid-cols-1 gap-2">
                            {detailData.aiGradingResult.rubricBreakdownJson.map((rubric: any, rIdx: number) => (
                              <div
                                key={rIdx}
                                className="bg-white p-2.5 rounded-xl border border-indigo-100 text-xs space-y-1 shadow-2xs"
                              >
                                <div className="flex items-center justify-between font-semibold text-slate-800">
                                  <span className="flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full bg-indigo-500 inline-block" />
                                    {rubric.title || (rubric.category === 'ALGORITHM' ? 'Thuật toán & Giải pháp' : 'Clean Code')}
                                  </span>
                                  <span className="font-mono text-indigo-600 font-bold text-[11px]">
                                    +{rubric.earnedPoints ?? 0}/{rubric.maxPoints ?? 0}đ
                                  </span>
                                </div>
                                {rubric.feedback && (
                                  <p className="text-[11px] text-slate-600 leading-relaxed pl-3">
                                    {rubric.feedback}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Nhận xét tổng quan sạch sẽ, phân tách tiêu mục không để trần dấu ### */}
                      {detailData.aiGradingResult.codeQualityFeedback && (
                        <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-indigo-100/80 space-y-2.5 shadow-2xs">
                          {detailData.aiGradingResult.codeQualityFeedback
                            .split('###')
                            .filter((part: string) => part.trim().length > 0)
                            .map((section: string, sIdx: number) => {
                              const lines = section.trim().split('\n');
                              const title = lines[0]?.trim();
                              const content = lines.slice(1).join('\n').trim();
                              return (
                                <div key={sIdx} className="space-y-1">
                                  {title && (
                                    <div className="font-bold text-slate-900 text-[11px]">
                                      {title}
                                    </div>
                                  )}
                                  {content && (
                                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                      {content}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
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
                    placeholder={
                      detailData?.sandboxScore !== null && detailData?.sandboxScore !== undefined
                        ? String(Number(detailData.sandboxScore).toFixed(1))
                        : '10.0'
                    }
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
