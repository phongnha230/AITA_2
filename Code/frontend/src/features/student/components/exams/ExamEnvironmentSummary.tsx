import { Code2, Cpu } from 'lucide-react';
import type { StudentExamViewModel } from '../../types/student.types';

interface ExamEnvironmentSummaryProps {
  exams: StudentExamViewModel[];
  available: boolean;
}

export function ExamEnvironmentSummary({ exams, available }: ExamEnvironmentSummaryProps) {
  const gccCount = exams.filter(({ assignment }) => assignment.environment === 'C_GCC').length;
  const javaCount = exams.filter(({ assignment }) => assignment.environment === 'JAVA_JDK').length;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">Môi trường thi Docker Sandbox</h2>
        <p className="mt-0.5 text-xs text-slate-500">Phân loại theo bài thi đã công bố trong các lớp.</p>
      </div>
      {available ? (
        <dl className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 shadow-2xs">
            <dt className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Code2 aria-hidden="true" className="h-4 w-4" />
              </div>
              <span>C / GCC 11 (Linux)</span>
            </dt>
            <dd className="text-sm font-bold tabular-nums text-slate-900">{gccCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 shadow-2xs">
            <dt className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Cpu aria-hidden="true" className="h-4 w-4" />
              </div>
              <span>Java 17 / OpenJDK</span>
            </dt>
            <dd className="text-sm font-bold tabular-nums text-slate-900">{javaCount}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center text-xs text-slate-500">
          Chưa có dữ liệu môi trường.
        </p>
      )}
    </section>
  );
}
