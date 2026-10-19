import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/lib/formatDate';
import type { CourseEnrollment } from '../types/course.types';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EnrolledStudentDialogsProps {
  enrollment: CourseEnrollment | null;
  onCloseEnrollment: () => void;
  studentToDelete: { id: string; name: string } | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}

export function EnrolledStudentDialogs({ enrollment, onCloseEnrollment, studentToDelete, onCloseDelete, onConfirmDelete }: EnrolledStudentDialogsProps) {
  const student = enrollment?.student;
  const initials = student?.fullName.split(' ').map((part) => part[0]).slice(-2).join('').toUpperCase() || 'SV';

  return (
    <>
      <Dialog open={Boolean(enrollment)} onOpenChange={(open) => !open && onCloseEnrollment()}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader><DialogTitle>Thông tin sinh viên</DialogTitle><DialogDescription>Thông tin hồ sơ và ghi danh được tải từ khóa học này.</DialogDescription></DialogHeader>
          {student && enrollment && <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              {student.avatarUrl ? <Image src={student.avatarUrl} alt="" width={48} height={48} unoptimized className="size-12 rounded-full object-cover" /> : <div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-800">{initials}</div>}
              <div className="min-w-0"><p className="font-semibold text-slate-900">{student.fullName}</p><p className="break-all text-sm text-slate-700">{student.email}</p></div>
            </div>
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3 text-sm"><dt className="text-slate-600">Mã sinh viên</dt><dd className="font-mono font-medium text-slate-900">{student.studentCode || 'Chưa cập nhật'}</dd><dt className="text-slate-600">Trạng thái tài khoản</dt><dd className="font-medium text-slate-900">{student.status}</dd><dt className="text-slate-600">Ghi danh</dt><dd className="font-medium text-slate-900">{formatDateTime(enrollment.joinedAt)}</dd></dl>
          </div>}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(studentToDelete)} onOpenChange={(open) => !open && onCloseDelete()}>
        <AlertDialogContent className="max-w-sm rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base"><AlertTriangle aria-hidden="true" className="size-5 text-rose-700" />Xác nhận gỡ sinh viên</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn xóa sinh viên <strong>{studentToDelete?.name}</strong> khỏi danh sách khóa học?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy bỏ</AlertDialogCancel><AlertDialogAction onClick={onConfirmDelete} className="bg-rose-700 text-white hover:bg-rose-800">Xác nhận xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
