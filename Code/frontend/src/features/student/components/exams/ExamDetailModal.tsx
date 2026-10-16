'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock3, ExternalLink, FileCode, FileText, HardDriveUpload, LockKeyhole, Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/formatDate';
import { studentService, getStudentServiceErrorMessage } from '../../services/student.service';
import type { AssignmentRubric, AssignmentTestCase, StudentExamViewModel } from '../../types/student.types';

type ExamSession = Awaited<ReturnType<typeof studentService.getExamSession>>;
interface ExamDetailModalProps { exam: StudentExamViewModel | null; isOpen: boolean; onClose: () => void; onOpenSubmit: () => void }

export function ExamDetailModal({ exam, isOpen, onClose, onOpenSubmit }: ExamDetailModalProps) {
  const [accessCode, setAccessCode] = useState('');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [assignment, setAssignment] = useState<StudentExamViewModel['assignment'] | null>(null);
  const [testCases, setTestCases] = useState<AssignmentTestCase[]>([]);
  const [rubrics, setRubrics] = useState<AssignmentRubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilStart, setSecondsUntilStart] = useState(0);

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
    if (!isOpen || !exam || !session) return;
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
  }, [isOpen, exam, session?.status, assignment, loadContent]);

  useEffect(() => {
    if (!session || session.status !== 'UPCOMING') { setSecondsUntilStart(0); return; }
    const update = () => setSecondsUntilStart(Math.max(0, Math.ceil((new Date(session.startTime).getTime() - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [session]);

  if (!exam || !isOpen) return null;
  const currentAssignment = assignment ?? exam.assignment;
  const isOpenForWork = session?.status === 'OPEN';

  const openPdf = async () => {
    const pdfWindow = window.open('about:blank', '_blank');
    setError(null);
    try {
      const pdf = await studentService.downloadExamPdf(exam.assignment.id);
      if (!pdf.type.includes('pdf') && pdf.size === 0) throw new Error('Tệp PDF không hợp lệ.');
      const url = URL.createObjectURL(pdf);
      if (pdfWindow) pdfWindow.location.href = url;
      else window.location.assign(url);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) {
      pdfWindow?.close();
      console.error('Không mở được PDF đề thi:', cause);
      setError(getStudentServiceErrorMessage(cause, 'Không tải được PDF đề thi.'));
    }
  };

  const countdown = `${Math.floor(secondsUntilStart / 3600).toString().padStart(2, '0')}:${Math.floor((secondsUntilStart % 3600) / 60).toString().padStart(2, '0')}:${(secondsUntilStart % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="exam-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold text-indigo-700">{exam.course?.code ?? 'Ca thi'}</p><h2 id="exam-detail-title" className="mt-1 text-lg font-bold text-slate-900">{currentAssignment.title}</h2><p className="mt-1 text-xs text-slate-500">Bắt đầu {formatTime(currentAssignment.startTime)} · Hạn nộp {formatTime(currentAssignment.deadline)}</p></div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </header>

        {!session ? (
          <form className="mt-6 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4" onSubmit={(event) => { event.preventDefault(); void unlock(); }}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><LockKeyhole className="h-4 w-4 text-indigo-600" />Nhập mã đề để vào ca thi</div>
            <p className="text-xs text-slate-600">Mã chỉ cần nhập một lần. Nếu ca chưa bắt đầu, bạn sẽ vào màn hình chờ.</p>
            <div className="flex gap-2"><input value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="off" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm" placeholder="Mã đề" aria-label="Mã đề" /><Button type="submit" disabled={loading || !accessCode.trim()}>{loading ? 'Đang xác thực…' : 'Mở ca thi'}</Button></div>
          </form>
        ) : null}

        {session?.status === 'UPCOMING' ? <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center"><CalendarDays className="mx-auto h-7 w-7 text-blue-700" /><p className="mt-2 font-semibold text-blue-900">Ca thi chưa bắt đầu</p><p className="mt-2 font-mono text-3xl font-bold text-blue-800">{countdown}</p><p className="mt-1 text-xs text-blue-700">Đề PDF, testcase và nộp bài sẽ mở khi đến giờ.</p></div> : null}
        {session?.status === 'PAUSED' ? <div role="status" className="mt-6 rounded-xl bg-amber-50 p-5 text-center text-sm font-semibold text-amber-800"><Clock3 className="mx-auto mb-2 h-6 w-6" />Ca thi đang tạm dừng. Nội dung và nộp bài tạm khóa.</div> : null}
        {session?.status === 'ENDED' || session?.status === 'CLOSED' ? <div role="status" className="mt-6 rounded-xl bg-slate-100 p-5 text-center text-sm font-semibold text-slate-700">Ca thi đã kết thúc hoặc đã được đóng.</div> : null}

        {isOpenForWork ? <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50 p-4"><div><p className="text-xs text-slate-500">Thời lượng</p><p className="font-semibold text-slate-900">{currentAssignment.durationMinutes ?? 90} phút</p></div>{assignment?.hasPdf ? <Button onClick={() => void openPdf()}><FileText className="mr-2 h-4 w-4" />Mở đề PDF<ExternalLink className="ml-2 h-3.5 w-3.5" /></Button> : <p className="text-xs text-amber-700">Giảng viên chưa tải PDF đề thi.</p>}</div>
          <div><h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><FileCode className="h-4 w-4 text-indigo-600" />Nội dung đề</h3><div className="whitespace-pre-wrap rounded-xl border p-4 text-sm leading-relaxed text-slate-700">{currentAssignment.description || 'Đề thi được cung cấp trong tệp PDF.'}</div></div>
          {testCases.length ? <div><h3 className="mb-2 text-sm font-bold text-slate-800">Testcase mẫu công khai</h3><div className="space-y-2">{testCases.map((testCase) => <div key={testCase.id} className="grid gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2"><pre className="overflow-auto rounded bg-slate-900 p-2 text-slate-100">{testCase.inputData || '(Không có input)'}</pre><pre className="overflow-auto rounded bg-slate-900 p-2 text-emerald-300">{testCase.expectedOutput || '(Không có output)'}</pre></div>)}</div></div> : null}
          {rubrics.length ? <div><h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><Scale className="h-4 w-4 text-indigo-600" />Rubric ({rubrics.length})</h3><ul className="space-y-2">{rubrics.map((rubric) => <li key={rubric.id} className="flex justify-between rounded-lg border p-3 text-sm"><span>{rubric.criteriaName}</span><strong>{rubric.maxPoints} điểm</strong></li>)}</ul></div> : null}
          <div className="flex justify-end border-t pt-4"><Button onClick={() => { onClose(); onOpenSubmit(); }}><HardDriveUpload className="mr-2 h-4 w-4" />Nộp bài</Button></div>
        </div> : null}
        {error ? <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      </section>
    </div>
  );
}
