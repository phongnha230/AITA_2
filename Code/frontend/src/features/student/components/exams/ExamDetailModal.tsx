'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Clock3, ExternalLink, FileCode, FileText, HardDriveUpload, LockKeyhole, Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/formatDate';
import { studentService, getStudentServiceErrorMessage } from '../../services/student.service';
import type { AssignmentRubric, AssignmentTestCase, StudentExamViewModel } from '../../types/student.types';

type ExamSession = Awaited<ReturnType<typeof studentService.getExamSession>>;
interface ExamDetailModalProps { exam: StudentExamViewModel | null; isOpen: boolean; onClose: () => void; onOpenSubmit: () => void }

function createTemporaryPdfUrl(pdf: Blob): string {
  const url = URL.createObjectURL(pdf);
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

function SessionStatus({ session, countdown }: { session: ExamSession | null; countdown: string }) {
  if (session?.status === 'UPCOMING') return <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center"><CalendarDays className="mx-auto size-7 text-blue-700" /><p className="mt-2 font-semibold text-blue-900">Ca thi chưa bắt đầu</p><p className="mt-2 font-mono text-3xl font-bold text-blue-800">{countdown}</p><p className="mt-1 text-xs text-blue-700">Đề PDF, testcase và nộp bài sẽ mở khi đến giờ.</p></div>;
  if (session?.status === 'PAUSED') return <div role="status" className="mt-6 rounded-xl bg-amber-50 p-5 text-center text-sm font-semibold text-amber-800"><Clock3 className="mx-auto mb-2 size-6" />Ca thi đang tạm dừng. Nội dung và nộp bài tạm khóa.</div>;
  if (session?.status === 'ENDED' || session?.status === 'CLOSED') return <div role="status" className="mt-6 rounded-xl bg-slate-100 p-5 text-center text-sm font-semibold text-slate-700">Ca thi đã kết thúc hoặc đã được đóng.</div>;
  return null;
}

function OpenExamContent({ assignment, currentAssignment, testCases, rubrics, onOpenPdf, onSubmit }: {
  assignment: StudentExamViewModel['assignment'] | null;
  currentAssignment: StudentExamViewModel['assignment'];
  testCases: AssignmentTestCase[];
  rubrics: AssignmentRubric[];
  onOpenPdf: () => void;
  onSubmit: () => void;
}) {
  return <div className="mt-5 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50 p-4"><div><p className="text-xs text-slate-500">Thời lượng</p><p className="font-semibold text-slate-900">{currentAssignment.durationMinutes ?? 90} phút</p></div>{assignment?.hasPdf ? <Button onClick={onOpenPdf}><FileText className="mr-2 size-4" />Mở đề PDF<ExternalLink className="ml-2 size-3.5" /></Button> : <p className="text-xs text-amber-700">Giảng viên chưa tải PDF đề thi.</p>}</div>
    <div><h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><FileCode className="size-4 text-indigo-600" />Nội dung đề</h3><div className="whitespace-pre-wrap rounded-xl border p-4 text-sm leading-relaxed text-slate-700">{currentAssignment.description || 'Đề thi được cung cấp trong tệp PDF.'}</div></div>
    {testCases.length > 0 && <div><h3 className="mb-2 text-sm font-bold text-slate-800">Testcase mẫu công khai</h3><div className="space-y-2">{testCases.map((testCase) => <div key={testCase.id} className="grid gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2"><pre className="overflow-auto rounded bg-slate-900 p-2 text-slate-100">{testCase.inputData || '(Không có input)'}</pre><pre className="overflow-auto rounded bg-slate-900 p-2 text-emerald-300">{testCase.expectedOutput || '(Không có output)'}</pre></div>)}</div></div>}
    {rubrics.length > 0 && <div><h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><Scale className="size-4 text-indigo-600" />Rubric ({rubrics.length})</h3><ul className="space-y-2">{rubrics.map((rubric) => <li key={rubric.id} className="flex justify-between rounded-lg border p-3 text-sm"><span>{rubric.criteriaName}</span><strong>{rubric.maxPoints} điểm</strong></li>)}</ul></div>}
    <div className="flex justify-end border-t pt-4"><Button onClick={onSubmit}><HardDriveUpload className="mr-2 size-4" />Nộp bài</Button></div>
  </div>;
}

function ExamModalBody({ exam, currentAssignment, assignment, session, testCases, rubrics, accessCode, onAccessCodeChange, loading, error, countdown, onUnlock, onOpenPdf, onClose, onOpenSubmit }: {
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
  onClose: () => void;
  onOpenSubmit: () => void;
}) {
  return <>
    <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-indigo-700">{exam.course?.code ?? 'Ca thi'}</p><h2 id="exam-detail-title" className="mt-1 text-lg font-bold text-slate-900">{currentAssignment.title}</h2><p className="mt-1 text-xs text-slate-500">Bắt đầu {formatTime(currentAssignment.startTime)} · Hạn nộp {formatTime(currentAssignment.deadline)}</p></div><button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button></header>
    {!session && <form className="mt-6 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4" onSubmit={(event) => { event.preventDefault(); onUnlock(); }}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><LockKeyhole className="size-4 text-indigo-600" />Nhập mã đề để vào ca thi</div><p className="text-xs text-slate-600">Mã chỉ cần nhập một lần. Nếu ca chưa bắt đầu, bạn sẽ vào màn hình chờ.</p><div className="flex gap-2"><input value={accessCode} onChange={(event) => onAccessCodeChange(event.target.value)} autoComplete="off" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-base" placeholder="Mã đề" aria-label="Mã đề" /><Button type="submit" disabled={loading || !accessCode.trim()}>{loading ? 'Đang xác thực…' : 'Mở ca thi'}</Button></div>
    </form>}
    <SessionStatus session={session} countdown={countdown} />
    {session?.status === 'OPEN' && <OpenExamContent assignment={assignment} currentAssignment={currentAssignment} testCases={testCases} rubrics={rubrics} onOpenPdf={onOpenPdf} onSubmit={() => { onClose(); onOpenSubmit(); }} />}
    {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
  </>;
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
    setLoading(true); setError(null);
    try {
      const result = await studentService.unlockExam(exam.assignment.id, accessCode.trim());
      setSession(result); setAccessCode('');
      if (result.status === 'OPEN') await loadContent(exam.assignment.id);
    } catch (cause) {
      console.error('Không mở được ca thi:', cause);
      setError(getStudentServiceErrorMessage(cause, 'Mã đề không đúng hoặc bạn chưa được ghi danh.'));
    } finally { setLoading(false); }
  };

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
    const timer = window.setInterval(() => { void refresh(); }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isOpen, exam, hasSession, sessionStatus, assignment, loadContent]);

  useEffect(() => {
    if (!sessionStartTime || sessionStatus !== 'UPCOMING') { setSecondsUntilStart(0); return; }
    const update = () => setSecondsUntilStart(Math.max(0, Math.ceil((new Date(sessionStartTime).getTime() - Date.now()) / 1000)));
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
  const isOpenForWork = session?.status === 'OPEN';

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

  const countdown = `${Math.floor(secondsUntilStart / 3600).toString().padStart(2, '0')}:${Math.floor((secondsUntilStart % 3600) / 60).toString().padStart(2, '0')}:${(secondsUntilStart % 60).toString().padStart(2, '0')}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="exam-detail-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="relative m-auto flex max-h-[90vh] w-full max-w-2xl items-center justify-center overflow-visible border-0 bg-transparent p-0 backdrop:bg-slate-950/50"
    >
      <button type="button" aria-label="Đóng hộp thoại" tabIndex={-1} onClick={onClose} className="fixed inset-0 -z-10 cursor-default" />
      <div className="relative z-10 max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <ExamModalBody exam={exam} currentAssignment={currentAssignment} assignment={assignment} session={session} testCases={testCases} rubrics={rubrics} accessCode={accessCode} onAccessCodeChange={setAccessCode} loading={loading} error={error} countdown={countdown} onUnlock={() => void unlock()} onOpenPdf={() => void openPdf()} onClose={onClose} onOpenSubmit={onOpenSubmit} />
      </div>
    </dialog>
  );
}
