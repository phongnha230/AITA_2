'use client';

import { BrainCircuit, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CLASS_CATALOG, DEFAULT_LECTURER_CLASSES, SAMPLE_LECTURER, SAMPLE_STUDENT } from '../../mocks/ops.mock';
import type { AdminUser } from '../../types/admin.types';
import { Badge } from '../ui/Badge';
import { Toggle } from '../ui/Toggle';

const Title: React.FC<{ children: React.ReactNode; aside?: React.ReactNode }> = ({ children, aside }) => (
  <div className="mb-2 flex items-center justify-between gap-3">
    <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
    {aside}
  </div>
);

interface LecturerViewProps {
  user: AdminUser;
  onToggleSandbox: (next: boolean) => void;
}

export const lecturerClasses = (user: AdminUser) =>
  (user.assignedClasses ?? DEFAULT_LECTURER_CLASSES)
    .map((code) => CLASS_CATALOG.find((c) => c.code === code))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

export const LecturerView: React.FC<LecturerViewProps> = ({ user, onToggleSandbox }) => {
  const classes = lecturerClasses(user);
  const sandboxAi = user.sandboxAiEnabled ?? true;
  const totalStudents = classes.reduce((s, c) => s + c.students, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Đề PE đã biên soạn</p>
          <p className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-bold text-blue-600">{SAMPLE_LECTURER.examsCreated}</span><span className="text-xs font-semibold text-slate-600">Đề PE thực chiến</span></p>
          <p className="mt-2 text-xs text-slate-500">Đã nạp bộ dữ liệu RAG &amp; testcases tự động chống gian lận.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tổng SV quản lý</p>
          <p className="mt-1 flex items-baseline gap-2"><span className="text-3xl font-bold text-slate-900">{totalStudents}</span><span className="text-xs font-semibold text-slate-600">Sinh viên active</span></p>
          <p className="mt-2 text-xs text-slate-500">Phân bổ qua {classes.length} nhóm lớp thực hành FAP.</p>
        </div>
      </div>
      <div>
        <Title aside={<span className="text-xs font-semibold text-blue-600">Học kỳ Fall 2024</span>}>Các lớp học đang phụ trách ({classes.length} lớp)</Title>
        {classes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Chưa được phân công lớp nào.</p>
        ) : (
          <ul className="space-y-2">
            {classes.map((c, i) => (
              <li key={c.code} className="flex items-center justify-between gap-3 rounded-xl p-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-mono text-xs font-bold text-blue-600">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{c.code}</p><p className="truncate text-xs text-slate-500">{c.title}</p></div>
                </div>
                <Badge tone="student">{c.students} Sinh viên</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrainCircuit className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="min-w-0"><p className="text-sm font-semibold text-slate-900">Cấu hình Sandbox Chấm AI riêng</p><p className="text-xs text-slate-500">Quyền nạp bộ Testcases ẩn &amp; prompt chấm Rubric chi tiết</p></div>
        </div>
        <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-emerald-600">
          <Toggle checked={sandboxAi} onChange={onToggleSandbox} label="Bật Sandbox chấm AI riêng" /> {sandboxAi ? 'Đã bật' : 'Đã tắt'}
        </span>
      </div>
    </div>
  );
};

export const StudentView: React.FC = () => (
  <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">MSSV</p>
        <p className="mt-1 font-mono text-2xl font-bold text-emerald-600">{SAMPLE_STUDENT.studentCode}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Chuyên ngành</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{SAMPLE_STUDENT.major}</p>
      </div>
    </div>
    <div>
      <Title>Lớp học đang theo học</Title>
      <ul className="space-y-2">
        {SAMPLE_STUDENT.classes.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm">
            <span className="font-semibold text-slate-900">{c.name}</span><span className="text-xs text-slate-500">{c.lecturer}</span>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <Title>Lịch sử thi PE &amp; điểm số</Title>
      <ul className="space-y-2">
        {SAMPLE_STUDENT.exams.map((x) => (
          <li key={x.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 text-sm">
            <div className="min-w-0"><p className="font-semibold text-slate-900">{x.name}</p><p className="text-xs text-slate-500">{x.score} • {x.submissions} lần nộp ZIP</p></div>
            <Badge tone={x.passed ? 'student' : 'admin'}>{x.passed ? <><CheckCircle2 className="h-3 w-3" /> Pass</> : 'Fail'}</Badge>
          </li>
        ))}
      </ul>
    </div>
    {SAMPLE_STUDENT.securityFlags.map((f) => (
      <div key={f.reason} className="space-y-1 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-700"><ShieldAlert className="h-4 w-4" /> Cảnh báo an toàn kỹ thuật</p>
        <p className="text-xs text-rose-700">{f.reason} — IP <span className="font-mono">{f.ip}</span></p>
      </div>
    ))}
  </div>
);

export const AdminView: React.FC = () => (
  <p className="rounded-xl border border-rose-100 bg-rose-50/60 p-5 text-sm text-rose-700">
    Tài khoản quản trị viên có toàn quyền hạ tầng và được bảo vệ khỏi thao tác khóa/đổi quyền tại đây.
  </p>
);
