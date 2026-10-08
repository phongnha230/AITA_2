import type { StudentExamTemporalStatus } from '../../types/student.types';

const statusPresentation: Record<StudentExamTemporalStatus, { label: string; classes: string }> = {
  OPEN: { label: 'Đang mở', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  UPCOMING: { label: 'Sắp tới', classes: 'border-blue-200 bg-blue-50 text-blue-700' },
  ENDED: { label: 'Đã kết thúc', classes: 'border-slate-200 bg-slate-100 text-slate-600' },
  UNKNOWN: { label: 'Chưa rõ thời gian', classes: 'border-amber-200 bg-amber-50 text-amber-800' },
};

export function ExamStatusBadge({ status }: { status: StudentExamTemporalStatus }) {
  const presentation = statusPresentation[status];
  return (
    <span className={`inline-flex min-h-6 items-center rounded-md border px-2 py-1 text-xs font-semibold ${presentation.classes}`}>
      {presentation.label}
    </span>
  );
}
