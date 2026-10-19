'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, Play, Pause, RefreshCw, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import type { ExamSession, ExamSessionStudentAccess, ExamSessionSubmission } from '../types/proctoring.types';
import { formatDate, formatDateTime } from '@/lib/formatDate';
import { ROUTES } from '@/config/routes';

interface RoomDetailMonitorProps { roomId: string }
interface SessionDetails { session: ExamSession; submissions: ExamSessionSubmission[]; unlockedStudents: ExamSessionStudentAccess[] }
const stateLabel: Record<ExamSession['status'], string> = { LIVE: 'Đang diễn ra', UPCOMING: 'Sắp diễn ra', PAUSED: 'Đang tạm dừng', COMPLETED: 'Đã kết thúc' };

export function RoomDetailMonitor({ roomId }: RoomDetailMonitorProps) {
  const [data, setData] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await assignmentService.getProctoringData(roomId);
      if (!result) throw new Error('Không tìm thấy dữ liệu ca thi.');
      setData(result);
    } catch (cause) {
      console.error('Không tải được chi tiết ca thi:', cause);
      setError(cause instanceof Error ? cause.message : 'Không tải được ca thi.');
    } finally { setLoading(false); }
  }, [roomId]);

  useEffect(() => {
    void load();
    const refreshTimer = window.setInterval(() => { void load(); }, 15_000);
    return () => window.clearInterval(refreshTimer);
  }, [load]);

  const control = async (action: 'EXTEND' | 'CLOSE' | 'START' | 'PAUSE' | 'RESUME') => {
    if (saving) return;
    if (action === 'CLOSE' && !window.confirm('Đóng ca thi và ngừng nhận bài ngay?')) return;
    setSaving(true); setError(null); setMessage(null);
    try {
      const result = await assignmentService.controlExamSession(roomId, action, action === 'EXTEND' ? 5 : undefined);
      setMessage(result.message || 'Đã cập nhật ca thi.');
      await load();
    } catch (cause) {
      console.error(`Không thể thực hiện ${action} ca thi:`, cause);
      setError(cause instanceof Error ? cause.message : 'Thao tác thất bại.');
    } finally { setSaving(false); }
  };

  if (loading) return <main className="p-8 text-center text-sm text-slate-500">Đang tải ca thi…</main>;
  if (error && !data) return <main className="mx-auto max-w-4xl p-6"><p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p><Button className="mt-4" onClick={() => { setLoading(true); void load(); }}>Thử lại</Button></main>;
  if (!data) return null;
  const { session, submissions, unlockedStudents } = data;
  const isActive = session.status === 'LIVE';

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8">
      <Link href={ROUTES.LECTURER.LIVE_PROCTORING} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700"><ArrowLeft className="size-4" />Danh sách ca thi</Link>
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-start">
        <div><p className="text-xs font-bold text-indigo-700">{session.courseCode} · {session.courseName} · {session.semester}</p><h1 className="mt-1 text-2xl font-extrabold text-slate-900">{session.title}</h1><p className="mt-3 text-sm text-slate-600">Bắt đầu: {formatDateTime(session.startTime)} · Hạn nộp: {formatDateTime(session.deadline)} · {session.durationMinutes ?? '—'} phút</p><span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{stateLabel[session.status]}</span></div>
        <div className="flex flex-wrap gap-2">
          {session.status === 'UPCOMING' && session.assignmentStatus === 'PUBLISHED' ? <Button disabled={saving} onClick={() => void control('START')}><Play className="mr-2 size-4" />Bắt đầu sớm</Button> : null}
          {isActive ? <Button variant="outline" disabled={saving} onClick={() => void control('PAUSE')}><Pause className="mr-2 size-4" />Tạm dừng</Button> : null}
          {session.status === 'PAUSED' ? <Button disabled={saving} onClick={() => void control('RESUME')}><Play className="mr-2 size-4" />Tiếp tục</Button> : null}
          {session.status !== 'COMPLETED' ? <Button variant="outline" disabled={saving} onClick={() => void control('EXTEND')}><Clock3 className="mr-2 size-4" />Gia hạn 5 phút</Button> : null}
          {session.status !== 'COMPLETED' ? <Button variant="destructive" disabled={saving} onClick={() => void control('CLOSE')}><XCircle className="mr-2 size-4" />Đóng ca</Button> : null}
          <Button variant="ghost" disabled={saving} onClick={() => { setLoading(true); void load(); }} aria-label="Tải lại"><RefreshCw className="size-4" /></Button>
        </div>
      </header>
      {message ? <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <section className="grid gap-4 sm:grid-cols-3">
        <Count icon={<Users />} label="Đã ghi danh" value={session.enrolledStudents} />
        <Count icon={<Play />} label="Đã mở đề bằng mã" value={session.unlockedStudents} />
        <Count icon={<CheckCircle2 />} label="Đã nộp bài" value={session.submittedStudents} />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <StudentList title="Sinh viên đã mở ca" empty="Chưa có sinh viên mở ca thi." rows={unlockedStudents.map((student) => ({ id: student.studentId, name: student.studentName, code: student.studentCode, detail: `Mở lúc ${formatDate(student.unlockedAt)}` }))} />
        <StudentList title="Bài nộp" empty="Chưa có bài nộp." rows={submissions.map((submission) => ({ id: submission.id, name: submission.studentName, code: submission.studentCode, detail: `${submission.status} · ${formatDate(submission.submittedAt)}${submission.score === null ? '' : ` · ${submission.score} điểm`}` }))} />
      </section>
      <p className="text-xs text-slate-500">Trang này chỉ hiển thị lượt mở ca và bài nộp đã ghi nhận. Hệ thống không theo dõi IDE trên máy cá nhân.</p>
    </main>
  );
}

function Count({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="flex items-center gap-4 rounded-xl border bg-white p-4"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div></div>; }
function StudentList({ title, empty, rows }: { title: string; empty: string; rows: Array<{ id: string; name: string; code: string | null; detail: string }> }) { return <div className="rounded-2xl border bg-white p-5"><h2 className="font-bold text-slate-900">{title} ({rows.length})</h2>{rows.length ? <ul className="mt-3 divide-y">{rows.map((row) => <li key={row.id} className="py-3"><p className="text-sm font-semibold text-slate-800">{row.name}{row.code ? <span className="ml-2 font-mono text-xs text-slate-500">{row.code}</span> : null}</p><p className="mt-1 text-xs text-slate-500">{row.detail}</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">{empty}</p>}</div>; }
