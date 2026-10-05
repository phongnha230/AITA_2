import { ShieldAlert } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { SAMPLE_LECTURER, SAMPLE_STUDENT } from '../../mocks/ops.mock';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-2 text-sm font-semibold text-slate-900">{children}</h3>
);

const Sample: React.FC = () => (
  <p className="text-[11px] italic text-slate-400">Dữ liệu học vụ minh họa — chờ API hồ sơ chi tiết từ backend.</p>
);

export const LecturerSection: React.FC = () => (
  <section className="space-y-5">
    <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div><p className="text-2xl font-bold text-blue-600">{SAMPLE_LECTURER.classes.length}</p><p className="text-xs text-slate-500">Lớp phụ trách</p></div>
      <div><p className="text-2xl font-bold text-blue-600">{SAMPLE_LECTURER.examsCreated}</p><p className="text-xs text-slate-500">Đề PE đã tạo</p></div>
      <div><p className="text-2xl font-bold text-blue-600">{SAMPLE_LECTURER.totalStudents}</p><p className="text-xs text-slate-500">SV đang dạy</p></div>
    </div>
    <div>
      <SectionTitle>Các lớp học đang phụ trách</SectionTitle>
      <ul className="space-y-2">
        {SAMPLE_LECTURER.classes.map((c) => (
          <li key={c.code} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{c.code}</p>
              <p className="truncate text-xs text-slate-500">{c.title}</p>
            </div>
            <Badge tone="student">{c.students} sinh viên</Badge>
          </li>
        ))}
      </ul>
    </div>
    <Sample />
  </section>
);

export const StudentSection: React.FC = () => (
  <section className="space-y-5">
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <span className="font-mono font-semibold text-emerald-600">{SAMPLE_STUDENT.studentCode}</span>
      <span className="mx-2 text-slate-300">•</span>
      <span className="text-slate-600">{SAMPLE_STUDENT.major}</span>
    </div>
    <div>
      <SectionTitle>Lớp học đang theo học</SectionTitle>
      <ul className="space-y-2">
        {SAMPLE_STUDENT.classes.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm">
            <span className="font-semibold text-slate-900">{c.name}</span>
            <span className="text-xs text-slate-500">{c.lecturer}</span>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <SectionTitle>Lịch sử thi PE &amp; điểm số</SectionTitle>
      <ul className="space-y-2">
        {SAMPLE_STUDENT.exams.map((x) => (
          <li key={x.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 text-sm">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{x.name}</p>
              <p className="text-xs text-slate-500">{x.score} • {x.submissions} lần nộp ZIP</p>
            </div>
            <Badge tone={x.passed ? 'student' : 'admin'}>{x.passed ? 'Pass' : 'Fail'}</Badge>
          </li>
        ))}
      </ul>
    </div>
    {SAMPLE_STUDENT.securityFlags.length > 0 && (
      <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-700"><ShieldAlert className="h-4 w-4" /> Cảnh báo an toàn kỹ thuật</p>
        {SAMPLE_STUDENT.securityFlags.map((f) => (
          <p key={f.reason} className="text-xs text-rose-700">{f.reason} — IP <span className="font-mono">{f.ip}</span></p>
        ))}
      </div>
    )}
    <Sample />
  </section>
);
