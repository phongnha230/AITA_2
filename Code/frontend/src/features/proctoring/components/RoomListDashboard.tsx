'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CheckCircle2, Clock3, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import type { ExamSession } from '../types/proctoring.types';
import { formatDateTime } from '@/lib/formatDate';
import { ROUTES } from '@/config/routes';

const statusLabel: Record<ExamSession['status'], string> = { LIVE: 'Đang diễn ra', UPCOMING: 'Sắp diễn ra', PAUSED: 'Đang tạm dừng', COMPLETED: 'Đã kết thúc' };

export function RoomListDashboard() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadSessions = () => assignmentService.getProctoringRooms()
      .then((data) => active && setSessions(data))
      .catch((cause: unknown) => {
        console.error('Không tải được danh sách ca thi:', cause);
        if (active) setError('Không tải được ca thi. Hãy thử tải lại trang.');
      })
      .finally(() => active && setLoading(false));
    void loadSessions();
    const refreshTimer = window.setInterval(() => { void loadSessions(); }, 30_000);
    return () => { active = false; window.clearInterval(refreshTimer); };
  }, []);

  const filteredSessions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    if (!query) return sessions;
    return sessions.filter((session) => `${session.title} ${session.courseCode} ${session.courseName}`.toLocaleLowerCase('vi').includes(query));
  }, [sessions, searchTerm]);
  const liveCount = sessions.filter((session) => session.status === 'LIVE').length;
  const submitted = sessions.reduce((sum, session) => sum + session.submittedStudents, 0);
  const unlocked = sessions.reduce((sum, session) => sum + session.unlockedStudents, 0);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Khóa học · Ca thi</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">Quản lý ca thi</h1>
        <p className="mt-2 text-sm text-slate-600">Mỗi đề thi là một ca riêng. Lịch, lượt mở đề và bài nộp tự làm mới mỗi 30 giây.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Tổng quan ca thi">
        <Metric icon={<CalendarClock />} label="Ca đang diễn ra" value={liveCount} />
        <Metric icon={<Users />} label="Lượt mở đề" value={unlocked} />
        <Metric icon={<CheckCircle2 />} label="Bài đã nộp" value={submitted} />
      </section>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-3 size-4 text-slate-400" />
        <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm theo đề thi hoặc khóa học" className="h-10 bg-white pl-9" />
      </div>

      {loading ? <p className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">Đang tải ca thi…</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
      {!loading && !error && filteredSessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CalendarClock className="mx-auto size-9 text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-800">Chưa có ca thi phù hợp</h2>
          <p className="mt-1 text-sm text-slate-500">Các đề thi đã tạo trong khóa học sẽ xuất hiện tại đây.</p>
        </div>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSessions.map((session) => (
          <Link key={session.id} href={ROUTES.LECTURER.LIVE_PROCTORING_ROOM(session.assignmentId)} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-700">{session.courseCode} · {session.semester}</p>
                <h2 className="mt-1 line-clamp-2 font-bold text-slate-900 group-hover:text-indigo-700">{session.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{session.courseName}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${session.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700' : session.status === 'PAUSED' ? 'bg-amber-50 text-amber-700' : session.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{statusLabel[session.status]}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
              <p className="flex items-center gap-1.5 text-slate-600"><Clock3 className="size-3.5" />{formatDateTime(session.startTime)}</p>
              <p className="text-right text-slate-600">{session.durationMinutes ?? '—'} phút</p>
              <p className="text-slate-500">Mở đề: <strong className="text-slate-800">{session.unlockedStudents}/{session.enrolledStudents}</strong></p>
              <p className="text-right text-slate-500">Đã nộp: <strong className="text-slate-800">{session.submittedStudents}</strong></p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-extrabold text-slate-900">{value}</p></div></div>;
}
