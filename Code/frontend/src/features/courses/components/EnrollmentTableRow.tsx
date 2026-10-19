import { Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/formatDate';
import type { CourseEnrollment } from '../types/course.types';

interface EnrollmentTableRowProps {
  enrollment: CourseEnrollment;
  index: number;
  onView: (enrollment: CourseEnrollment) => void;
  onDelete: (student: { id: string; name: string }) => void;
}

export function EnrollmentTableRow({ enrollment, index, onView, onDelete }: EnrollmentTableRowProps) {
  const { student } = enrollment;
  const isVerified = enrollment.status === 'VERIFIED' || student.status === 'ACTIVE';
  const initials = student.fullName.split(' ').map((name) => name[0]).slice(-2).join('').toUpperCase();
  const avatarTone = ['from-indigo-600 to-indigo-800', 'from-emerald-600 to-emerald-700', 'from-amber-500 to-orange-600'][index % 3];

  return (
    <TableRow key={enrollment.id || student.id || student.studentCode} className={`transition hover:bg-indigo-50/20 ${isVerified ? '' : 'bg-amber-50/25'}`}>
      <TableCell className="whitespace-nowrap px-6 py-4 font-mono text-sm font-bold text-slate-900">{student.studentCode || '—'}</TableCell>
      <TableCell className="px-5 py-4"><div className="flex items-center gap-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr text-xs font-extrabold text-white ${avatarTone}`}>{initials || 'SV'}</div><div className="min-w-0"><p className="text-sm font-bold leading-tight text-slate-900">{student.fullName}</p><p className="mt-0.5 truncate font-mono text-xs text-slate-600">{student.email}</p></div></div></TableCell>
      <TableCell className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">{formatDateTime(enrollment.joinedAt)}</TableCell>
      <TableCell className="whitespace-nowrap px-5 py-4"><Badge variant="outline" className={isVerified ? 'inline-flex items-center gap-1.5 rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800' : 'inline-flex items-center gap-1.5 rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900'}><span aria-hidden="true" className={`size-1.5 rounded-full ${isVerified ? 'bg-emerald-600' : 'bg-amber-600'}`} />{isVerified ? 'Đã xác thực (Verified)' : 'Chờ duyệt (Pending)'}</Badge></TableCell>
      <TableCell className="space-x-1 whitespace-nowrap px-6 py-4 text-right"><Button type="button" variant="ghost" size="icon" onClick={() => onView(enrollment)} aria-label={`Xem thông tin ${student.fullName}`} className="size-9 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"><Eye aria-hidden="true" className="size-4" /></Button><Button type="button" variant="ghost" size="icon" onClick={() => onDelete({ id: student.id || student.studentCode || '', name: student.fullName })} aria-label={`Gỡ ${student.fullName} khỏi lớp`} className="size-9 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-700"><Trash2 aria-hidden="true" className="size-4" /></Button></TableCell>
    </TableRow>
  );
}
