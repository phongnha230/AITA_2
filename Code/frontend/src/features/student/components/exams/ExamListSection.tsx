import { CalendarClock } from 'lucide-react';
import type { StudentExamViewModel } from '../../types/student.types';
import { StudentEmptyState } from '../shared/StudentEmptyState';
import { ExamCard } from './ExamCard';

interface ExamListSectionProps {
  title: string;
  description: string;
  exams: StudentExamViewModel[];
  emptyTitle: string;
  emptyDescription: string;
}

export function ExamListSection({
  title,
  description,
  exams,
  emptyTitle,
  emptyDescription,
}: ExamListSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-elevated">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 sm:flex">
          <CalendarClock aria-hidden="true" className="h-[18px] w-[18px]" />
        </span>
      </div>
      {exams.length > 0 ? (
        <div className="space-y-3.5">
          {exams.map((exam) => <ExamCard key={exam.assignment.id} exam={exam} />)}
        </div>
      ) : (
        <StudentEmptyState icon={CalendarClock} title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}
