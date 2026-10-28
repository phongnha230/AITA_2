'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Play,
  Pause,
  RefreshCw,
  RotateCcw,
  Users,
  XCircle,
  Sparkles,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assignmentService } from '@/features/assignments/services/assignment.service';
import type {
  ExamSession,
  ExamSessionRosterStudent,
  ExamSessionStudentAccess,
  ExamSessionSubmission,
} from '../types/proctoring.types';
import { formatDateTime } from '@/lib/formatDate';
import { ROUTES } from '@/config/routes';
import { LiveExamRosterTable } from './LiveExamRosterTable';
import { SubmissionLogInspectorDrawer } from './SubmissionLogInspectorDrawer';
import { PublishGradesModal } from './PublishGradesModal';

interface RoomDetailMonitorProps {
  roomId: string;
}

interface SessionDetails {
  session: ExamSession;
  submissions: ExamSessionSubmission[];
  unlockedStudents: ExamSessionStudentAccess[];
  roster?: ExamSessionRosterStudent[];
  testCases?: Array<{ id: string; label: string; points: number }>;
}

const stateLabel: Record<ExamSession['status'], string> = {
  LIVE: 'Đang diễn ra',
  UPCOMING: 'Sắp diễn ra',
  PAUSED: 'Đang tạm dừng',
  COMPLETED: 'Đã kết thúc',
};

export function RoomDetailMonitor({ roomId }: RoomDetailMonitorProps) {
  const [data, setData] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Inspector Drawer State
  const [selectedStudentForLog, setSelectedStudentForLog] = useState<ExamSessionRosterStudent | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  // Publish Grades Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await assignmentService.getProctoringData(roomId);
      if (!result) throw new Error('Không tìm thấy dữ liệu ca thi.');
      setData(result);
    } catch (cause) {
      console.error('Không tải được chi tiết ca thi:', cause);
      setError(cause instanceof Error ? cause.message : 'Không tải được ca thi.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
    const refreshTimer = window.setInterval(() => {
      void load();
    }, 15_000);
    return () => window.clearInterval(refreshTimer);
  }, [load]);

  const control = async (
    action: 'EXTEND' | 'CLOSE' | 'START' | 'PAUSE' | 'RESUME' | 'REOPEN' | 'PUBLISH_GRADES',
    minutes?: number
  ) => {
    if (saving) return;
    if (action === 'CLOSE' && !window.confirm('Đóng ca thi và ngừng nhận bài ngay?')) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await assignmentService.controlExamSession(
        roomId,
        action,
        action === 'EXTEND' ? minutes || 5 : minutes
      );
      setMessage(result.message || 'Đã cập nhật ca thi.');
      await load();
    } catch (cause) {
      console.error(`Không thể thực hiện ${action} ca thi:`, cause);
      setError(cause instanceof Error ? cause.message : 'Thao tác thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenLogDrawer = (student: ExamSessionRosterStudent) => {
    setSelectedStudentForLog(student);
    setIsLogDrawerOpen(true);
  };

  const handleRegrade = async (submissionId: string) => {
    try {
      setMessage('Đang kích hoạt chấm lại bài nộp...');
      await assignmentService.regradeSubmission(submissionId);
      setMessage('Đã gửi yêu cầu chấm lại thành công!');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể chấm lại bài.');
    }
  };

  if (loading) {
    return <main className="p-8 text-center text-sm text-slate-500">Đang tải dữ liệu ca thi…</main>;
  }

  if (error && !data) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700 font-semibold border border-rose-200">
          {error}
        </p>
        <Button className="mt-4 rounded-xl" onClick={() => { setLoading(true); void load(); }}>
          Thử lại
        </Button>
      </main>
    );
  }

  if (!data) return null;
  const { session, submissions, roster = [], testCases = [] } = data;
  const isActive = session.status === 'LIVE';

  // Fallback: nếu roster từ backend rỗng (phiên bản cũ), dựng từ submissions & unlockedStudents
  const displayRoster: ExamSessionRosterStudent[] = roster.length > 0
    ? roster
    : submissions.map((sub) => ({
        studentId: sub.studentId,
        studentName: sub.studentName,
        studentCode: sub.studentCode,
        email: '',
        avatarUrl: null,
        unlockedAt: sub.submittedAt,
        roomStatus:
          sub.score !== null && Number(sub.score) === 0 && sub.compileOutput?.includes('Không nộp bài')
            ? 'EXPIRED_ZERO'
            : 'SUBMITTED',
        submission: {
          id: sub.id,
          status: sub.status,
          submittedAt: sub.submittedAt,
          sandboxScore: sub.score,
          aiScore: null,
          finalScore: sub.score,
          compileSuccess: true,
          compileOutput: sub.compileOutput ?? null,
          passedTestCases: 0,
          totalTestCases: testCases.length,
        },
      }));

  const submittedCount = displayRoster.filter((s) => s.roomStatus === 'SUBMITTED').length;
  const inRoomCount = displayRoster.filter((s) => s.roomStatus === 'IN_ROOM').length;
  const expiredZeroCount = displayRoster.filter((s) => s.roomStatus === 'EXPIRED_ZERO').length;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-24 sm:p-6 lg:p-8">
      {/* 1. Breadcrumbs */}
      <Link
        href={ROUTES.LECTURER.LIVE_PROCTORING}
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 transition"
      >
        <ArrowLeft className="size-4" />
        Danh sách ca thi
      </Link>

      {/* 2. Header & Action Control Strip */}
      <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 md:flex-row md:items-start shadow-2xs">
        <div>
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
            {session.courseCode} · {session.courseName} · {session.semester}
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
            {session.title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Bắt đầu: {formatDateTime(session.startTime)} · Hạn nộp: {formatDateTime(session.deadline)} ·{' '}
            {session.durationMinutes ?? '—'} phút
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${
                session.status === 'LIVE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : session.status === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {session.status === 'LIVE' && (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
              )}
              {stateLabel[session.status]}
            </span>
          </div>
        </div>

        {/* Action Controls - Đồng bộ phong cách Modern Clean SaaS */}
        <div className="flex flex-wrap items-center gap-2">
          {session.status === 'UPCOMING' && session.assignmentStatus === 'PUBLISHED' ? (
            <Button
              size="sm"
              className="h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
              disabled={saving}
              onClick={() => void control('START')}
            >
              <Play className="mr-1.5 size-3.5" />
              Bắt đầu sớm
            </Button>
          ) : null}

          {isActive ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 rounded-xl border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs shadow-2xs cursor-pointer"
              disabled={saving}
              onClick={() => void control('PAUSE')}
            >
              <Pause className="mr-1.5 size-3.5 text-amber-600" />
              Tạm dừng
            </Button>
          ) : null}

          {session.status === 'PAUSED' ? (
            <Button
              size="sm"
              className="h-8.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs cursor-pointer"
              disabled={saving}
              onClick={() => void control('RESUME')}
            >
              <Play className="mr-1.5 size-3.5" />
              Tiếp tục
            </Button>
          ) : null}

          {/* Cụm Gia hạn nhanh khi đang thi */}
          {session.status !== 'COMPLETED' ? (
            <div className="inline-flex items-center rounded-2xl bg-indigo-50/70 p-1 border border-indigo-100 shadow-2xs">
              <span className="px-2.5 text-xs font-bold text-indigo-900 flex items-center gap-1 select-none">
                <Clock3 className="size-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Gia hạn:</span>
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={() => void control('EXTEND', 5)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Gia hạn 5 phút"
              >
                +5p
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void control('EXTEND', 10)}
                className="ml-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/70 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Gia hạn 10 phút"
              >
                +10p
              </button>
            </div>
          ) : null}

          {/* Nút Đóng ca */}
          {session.status !== 'COMPLETED' ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 rounded-xl border-rose-200/80 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs shadow-2xs cursor-pointer"
              disabled={saving}
              onClick={() => void control('CLOSE')}
            >
              <XCircle className="mr-1.5 size-3.5 text-rose-600" />
              Đóng ca
            </Button>
          ) : null}

          {/* Cụm Mở lại khi ca đã kết thúc */}
          {session.status === 'COMPLETED' ? (
            <div className="inline-flex items-center rounded-2xl bg-amber-50/70 p-1 border border-amber-200/80 shadow-2xs">
              <span className="px-2.5 text-xs font-bold text-amber-900 flex items-center gap-1 select-none">
                <RotateCcw className="size-3.5 text-amber-600" />
                <span className="hidden sm:inline">Mở lại:</span>
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={() => void control('REOPEN', 60)}
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white text-amber-900 hover:bg-amber-100/70 border border-amber-200/90 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Mở lại 60 phút"
              >
                +60p
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void control('REOPEN', 90)}
                className="ml-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Mở lại 90 phút"
              >
                +90p
              </button>
            </div>
          ) : null}

          {/* Nút CÔNG BỐ ĐIỂM CA THI */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsPublishModalOpen(true)}
            className="h-8.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs gap-1.5 cursor-pointer"
            title="Công bố điểm chính thức cho toàn bộ sinh viên ca thi này"
          >
            <Sparkles className="size-3.5" />
            <span>Công bố điểm</span>
          </Button>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8.5 w-8.5 p-0 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
            disabled={saving}
            onClick={() => {
              setLoading(true);
              void load();
            }}
            aria-label="Tải lại"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      {message && (
        <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200 animate-in fade-in duration-200">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-800 border border-rose-200 animate-in fade-in duration-200">
          {error}
        </p>
      )}

      {/* 3. Quick KPI Cards */}
      <section className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <CountCard
          icon={<Users className="size-4" />}
          label="Tổng sinh viên lớp"
          value={session.enrolledStudents || displayRoster.length}
          tone="indigo"
        />
        <CountCard
          icon={<Clock3 className="size-4" />}
          label="Đang làm bài"
          value={inRoomCount}
          tone="amber"
        />
        <CountCard
          icon={<CheckCircle2 className="size-4" />}
          label="Đã nộp bài"
          value={submittedCount}
          tone="emerald"
        />
        <CountCard
          icon={<AlertTriangle className="size-4" />}
          label="Quá hạn (0đ)"
          value={expiredZeroCount}
          tone="rose"
        />
      </section>

      {/* 4. UNIFIED LIVE EXAM TABLE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bảng danh sách sinh viên ca thi</span>
            <span className="text-xs font-normal text-slate-400">({displayRoster.length} sinh viên)</span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Tự động cập nhật 15s/lần
          </span>
        </div>

        <LiveExamRosterTable
          roster={displayRoster}
          totalTestCases={testCases.length || 5}
          onOpenLogDrawer={handleOpenLogDrawer}
          onRegrade={handleRegrade}
          loading={loading}
        />
      </section>

      {/* 5. SLIDE-OUT RIGHT DRAWER: Xem Log & Source Code Từng Câu */}
      <SubmissionLogInspectorDrawer
        open={isLogDrawerOpen}
        onOpenChange={setIsLogDrawerOpen}
        student={selectedStudentForLog}
        assignmentId={roomId}
        onRefresh={() => void load()}
      />

      {/* 6. MODAL: Công bố điểm ca thi */}
      <PublishGradesModal
        open={isPublishModalOpen}
        onOpenChange={setIsPublishModalOpen}
        assignmentId={roomId}
        sessionTitle={session.title}
        totalEnrolled={session.enrolledStudents || displayRoster.length}
        submittedCount={submittedCount}
        onSuccess={() => {
          setMessage('Đã công bố điểm chính thức thành công cho cả phòng thi!');
          void load();
        }}
      />
    </main>
  );
}

function CountCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'indigo' | 'emerald' | 'rose' | 'amber';
}) {
  const toneClasses = {
    indigo: 'bg-indigo-50/80 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50/80 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50/80 text-rose-700 border-rose-100',
    amber: 'bg-amber-50/80 text-amber-700 border-amber-100',
  };

  return (
    <div className="flex items-center gap-3.5 rounded-3xl border border-slate-200/90 bg-white p-4 shadow-2xs">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="font-mono text-xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
