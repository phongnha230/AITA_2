'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  FolderArchive,
  HardDriveUpload,
  LockKeyhole,
  Scale,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatTime } from '@/lib/formatDate';
import { studentService, getStudentServiceErrorMessage } from '../../services/student.service';
import type { AssignmentRubric, AssignmentTestCase, StudentExamViewModel } from '../../types/student.types';

type ExamSession = Awaited<ReturnType<typeof studentService.getExamSession>>;
interface ExamDetailModalProps {
  exam: StudentExamViewModel | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmit: () => void;
}

function createTemporaryPdfUrl(pdf: Blob): string {
  const url = URL.createObjectURL(pdf);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

function SessionStatus({ session, countdown }: { session: ExamSession | null; countdown: string }) {
  if (session?.status === 'UPCOMING') {
    return (
      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 text-center">
        <CalendarDays className="mx-auto size-8 text-blue-600" />
        <p className="mt-2 text-sm font-semibold text-blue-900">Ca thi chưa bắt đầu</p>
        <p className="mt-2 font-mono text-3xl font-extrabold text-blue-800 tracking-tight">{countdown}</p>
        <p className="mt-2 text-xs text-blue-600">Đề PDF, template zip và cổng nộp bài sẽ tự động mở khi đến giờ.</p>
      </div>
    );
  }
  if (session?.status === 'PAUSED') {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-center text-sm font-semibold text-amber-800">
        <Clock3 className="mx-auto mb-2 size-6" />
        Ca thi đang tạm dừng. Nội dung và cổng nộp bài tạm thời khóa.
      </div>
    );
  }
  if (session?.status === 'ENDED' || session?.status === 'CLOSED') {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-slate-100 border border-slate-200 p-5 text-center text-sm font-semibold text-slate-700">
        Ca thi đã kết thúc hoặc đã được đóng.
      </div>
    );
  }
  return null;
}

function OpenExamContent({
  assignment,
  currentAssignment,
  testCases,
  rubrics,
  onOpenPdf,
  onDownloadStarterZip,
  onSubmit,
}: {
  assignment: StudentExamViewModel['assignment'] | null;
  currentAssignment: StudentExamViewModel['assignment'];
  testCases: AssignmentTestCase[];
  rubrics: AssignmentRubric[];
  onOpenPdf: () => void;
  onDownloadStarterZip: () => void;
  onSubmit: () => void;
}) {
  const hasStarter = Boolean(assignment?.hasStarterCode);
  const hasPdf = Boolean(assignment?.hasPdf);

  return (
    <div className="mt-5 space-y-5">
      {/* Overview & Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* PDF Download Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-rose-100 text-rose-700 shrink-0">
              <FileText className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Đề bài chính thức (PDF)</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasPdf ? 'Xem câu hỏi, yêu cầu và quy định nộp.' : 'Giảng viên chưa tải file PDF.'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPdf}
              onClick={onOpenPdf}
              className="w-full justify-center gap-1.5 font-medium border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ExternalLink className="size-3.5" />
              <span>{hasPdf ? 'Mở đề thi PDF' : 'Chưa có PDF'}</span>
            </Button>
          </div>
        </div>

        {/* Template ZIP Download Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <FolderArchive className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900">Template bài làm (ZIP)</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasStarter ? 'Khung mã nguồn dự án để mở IDE giải bài.' : 'Không có template zip đi kèm.'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasStarter}
              onClick={onDownloadStarterZip}
              className="w-full justify-center gap-1.5 font-medium border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Download className="size-3.5" />
              <span>{hasStarter ? 'Tải Template ZIP' : 'Không có ZIP'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Submit Action Banner */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/90 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
            <HardDriveUpload className="size-4 text-indigo-600" />
            Sẵn sàng nộp bài thi?
          </h4>
          <p className="text-xs text-indigo-700 mt-0.5">
            Hạn chót: <span className="font-semibold">{formatDateTime(currentAssignment.deadline)}</span>. Sau khi nộp, hệ thống sẽ tự động chạy testcase.
          </p>
        </div>
        <Button
          type="button"
          onClick={onSubmit}
          className="w-full sm:w-auto shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm px-6"
        >
          <HardDriveUpload className="size-4 mr-2" />
          Nộp bài thi ngay
        </Button>
      </div>

      {/* Description / Problem statement */}
      {currentAssignment.description && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FileCode className="size-3.5 text-slate-600" />
            Tóm tắt yêu cầu đề bài
          </h4>
          <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-700 max-h-48 overflow-y-auto">
            {currentAssignment.description}
          </div>
        </div>
      )}

      {/* Public Sample Testcases */}
      {testCases.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Testcase mẫu công khai ({testCases.length})
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {testCases.map((tc, idx) => (
              <div key={tc.id || idx} className="rounded-xl border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Testcase #{idx + 1}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Input:</span>
                    <pre className="mt-1 font-mono text-xs bg-slate-950 p-2 rounded text-slate-200 overflow-x-auto whitespace-pre">
                      {tc.inputData || '(trống)'}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono">Expected Output:</span>
                    <pre className="mt-1 font-mono text-xs bg-slate-950 p-2 rounded text-emerald-300 overflow-x-auto whitespace-pre">
                      {tc.expectedOutput || '(trống)'}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rubric Criteria */}
      {rubrics.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Scale className="size-3.5 text-indigo-600" />
            Tiêu chí chấm Rubric ({rubrics.length})
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {rubrics.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs flex justify-between items-center">
                <span className="font-medium text-slate-700">{r.criteriaName}</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{r.maxPoints} đ</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExamModalBody({
  exam,
  currentAssignment,
  assignment,
  session,
  testCases,
  rubrics,
  accessCode,
  onAccessCodeChange,
  loading,
  error,
  countdown,
  onUnlock,
  onOpenPdf,
  onDownloadStarterZip,
  onClose,
  onOpenSubmit,
}: {
  exam: StudentExamViewModel;
  currentAssignment: StudentExamViewModel['assignment'];
  assignment: StudentExamViewModel['assignment'] | null;
  session: ExamSession | null;
  testCases: AssignmentTestCase[];
  rubrics: AssignmentRubric[];
  accessCode: string;
  onAccessCodeChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  countdown: string;
  onUnlock: () => void;
  onOpenPdf: () => void;
  onDownloadStarterZip: () => void;
  onClose: () => void;
  onOpenSubmit: () => void;
}) {
  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-bold font-mono text-indigo-700">
              {exam.course?.code ?? 'KỲ THI'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {currentAssignment.durationMinutes ?? 90} phút
            </span>
          </div>
          <h2 id="exam-detail-title" className="mt-1 text-lg font-bold text-slate-900">
            {currentAssignment.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Bắt đầu: {formatTime(currentAssignment.startTime)} · Hạn nộp: {formatTime(currentAssignment.deadline)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="size-5" />
        </button>
      </header>

      {!session && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <LockKeyhole className="size-6" />
          </div>
          <h3 className="mt-3 font-bold text-base text-slate-900">Bảo mật ca thi</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Nhập mã ca thi (Passcode) do Giảng viên hoặc Giám thị cung cấp để mở đề bài và tải mã nguồn.
          </p>

          <form
            className="mt-5 max-w-sm mx-auto space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onUnlock();
            }}
          >
            <input
              value={accessCode}
              onChange={(e) => onAccessCodeChange(e.target.value)}
              placeholder="VD: PE-CSD201-SP26"
              autoFocus
              className="w-full h-11 rounded-xl border border-slate-300 px-4 text-center font-mono font-bold tracking-wider text-base text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 uppercase"
            />
            <Button
              type="submit"
              disabled={loading || !accessCode.trim()}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm"
            >
              {loading ? 'Đang xác thực mã...' : 'Xác nhận vào ca thi'}
            </Button>
          </form>
        </div>
      )}

      <SessionStatus session={session} countdown={countdown} />

      {session?.status === 'OPEN' && (
        <OpenExamContent
          assignment={assignment}
          currentAssignment={currentAssignment}
          testCases={testCases}
          rubrics={rubrics}
          onOpenPdf={onOpenPdf}
          onDownloadStarterZip={onDownloadStarterZip}
          onSubmit={() => {
            onClose();
            onOpenSubmit();
          }}
        />
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </p>
      )}
    </>
  );
}

export function ExamDetailModal({ exam, isOpen, onClose, onOpenSubmit }: ExamDetailModalProps) {
  const [accessCode, setAccessCode] = useState('');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [assignment, setAssignment] = useState<StudentExamViewModel['assignment'] | null>(null);
  const [testCases, setTestCases] = useState<AssignmentTestCase[]>([]);
  const [rubrics, setRubrics] = useState<AssignmentRubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilStart, setSecondsUntilStart] = useState(0);
  const hasSession = session !== null;
  const sessionStatus = session?.status;
  const sessionStartTime = session?.startTime;
  const dialogRef = useRef<HTMLDialogElement>(null);

  const loadContent = useCallback(async (assignmentId: string) => {
    try {
      const [details, cases, rules] = await Promise.all([
        studentService.getAssignmentDetail(assignmentId),
        studentService.getAssignmentTestCases(assignmentId),
        studentService.getAssignmentRubrics(assignmentId),
      ]);
      setAssignment(details);
      setTestCases(cases.filter((testCase) => testCase.isSample));
      setRubrics(rules);
    } catch (cause) {
      console.error('Không tải được nội dung ca thi:', cause);
      setError(getStudentServiceErrorMessage(cause, 'Không tải được nội dung ca thi.'));
    }
  }, []);

  const unlock = async () => {
    if (!exam || !accessCode.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.unlockExam(exam.assignment.id, accessCode.trim());
      setSession(result);
      setAccessCode('');
      if (result.status === 'OPEN') await loadContent(exam.assignment.id);
    } catch (cause) {
      console.error('Không mở được ca thi:', cause);
      setError(getStudentServiceErrorMessage(cause, 'Mã đề không đúng hoặc bạn chưa được ghi danh môn học này.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !exam) {
      setSession(null);
      setAssignment(null);
      setTestCases([]);
      setRubrics([]);
      setError(null);
      return;
    }

    let active = true;
    const checkInitialSession = async () => {
      try {
        const current = await studentService.getExamSession(exam.assignment.id);
        if (!active) return;
        setSession(current);
        if (current.status === 'OPEN') {
          void loadContent(exam.assignment.id);
        }
      } catch {
        // Chưa mở khóa, giữ session = null để sinh viên nhập mã
      }
    };

    void checkInitialSession();

    return () => {
      active = false;
    };
  }, [isOpen, exam?.assignment.id, loadContent]);

  useEffect(() => {
    if (!isOpen || !exam || !hasSession) return;
    let active = true;
    const refresh = async () => {
      try {
        const current = await studentService.getExamSession(exam.assignment.id);
        if (!active) return;
        setSession(current);
        if (current.status === 'OPEN' && !assignment) await loadContent(exam.assignment.id);
      } catch (cause) {
        console.error('Không cập nhật được trạng thái ca thi:', cause);
      }
    };
    const timer = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isOpen, exam, hasSession, sessionStatus, assignment, loadContent]);

  useEffect(() => {
    if (!sessionStartTime || sessionStatus !== 'UPCOMING') {
      setSecondsUntilStart(0);
      return;
    }
    const update = () =>
      setSecondsUntilStart(Math.max(0, Math.ceil((new Date(sessionStartTime).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [sessionStartTime, sessionStatus]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && exam && !dialog.open) dialog.showModal();
    else if ((!isOpen || !exam) && dialog.open) dialog.close();
  }, [isOpen, exam]);

  if (!exam || !isOpen) return null;
  const currentAssignment = assignment ?? exam.assignment;

  const openPdf = async () => {
    const pdfWindow = window.open('about:blank', '_blank');
    setError(null);
    try {
      const pdf = await studentService.downloadExamPdf(exam.assignment.id);
      if (!pdf.type.includes('pdf') && pdf.size === 0) throw new Error('Tệp PDF không hợp lệ.');
      const url = createTemporaryPdfUrl(pdf);
      if (pdfWindow) pdfWindow.location.href = url;
      else window.location.assign(url);
    } catch (cause) {
      pdfWindow?.close();
      console.error('Không mở được PDF đề thi:', cause);
      setError(getStudentServiceErrorMessage(cause, 'Không tải được PDF đề thi.'));
    }
  };

  const downloadStarterZip = async () => {
    setError(null);
    try {
      const blob = await studentService.downloadExamStarterZip(exam.assignment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `starter-${exam.assignment.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
    } catch (cause) {
      console.error('Không tải được Template ZIP:', cause);
      setError(getStudentServiceErrorMessage(cause, 'Chưa có Template ZIP cho ca thi này hoặc không tải được.'));
    }
  };

  const countdown = `${Math.floor(secondsUntilStart / 3600)
    .toString()
    .padStart(2, '0')}:${Math.floor((secondsUntilStart % 3600) / 60)
    .toString()
    .padStart(2, '0')}:${(secondsUntilStart % 60).toString().padStart(2, '0')}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="exam-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="relative m-auto flex max-h-[90vh] w-full max-w-2xl items-center justify-center overflow-visible border-0 bg-transparent p-0 backdrop:bg-slate-950/60"
    >
      <button type="button" aria-label="Đóng hộp thoại" tabIndex={-1} onClick={onClose} className="fixed inset-0 -z-10 cursor-default" />
      <div className="relative z-10 max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <ExamModalBody
          exam={exam}
          currentAssignment={currentAssignment}
          assignment={assignment}
          session={session}
          testCases={testCases}
          rubrics={rubrics}
          accessCode={accessCode}
          onAccessCodeChange={setAccessCode}
          loading={loading}
          error={error}
          countdown={countdown}
          onUnlock={() => void unlock()}
          onOpenPdf={() => void openPdf()}
          onDownloadStarterZip={() => void downloadStarterZip()}
          onClose={onClose}
          onOpenSubmit={onOpenSubmit}
        />
      </div>
    </dialog>
  );
}
