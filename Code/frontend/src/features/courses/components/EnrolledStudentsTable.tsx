'use client';

import React, { useState } from 'react';
import {
  Search,
  Download,
  Eye,
  Trash2,
  Users,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { CourseEnrollment } from '../types/course.types';
import { buildCourseRosterCsv } from '../utils/course-roster-export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/formatDate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EnrolledStudentsTableProps {
  enrollments: CourseEnrollment[];
  courseCode: string;
  studentSearch: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | 'VERIFIED' | 'PENDING';
  onStatusFilterChange: (val: 'ALL' | 'VERIFIED' | 'PENDING') => void;
  joinCode: string;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onShowToast: (msg: string) => void;
}

export const EnrolledStudentsTable: React.FC<EnrolledStudentsTableProps> = ({
  enrollments,
  courseCode,
  studentSearch,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  joinCode,
  onRemoveStudent,
  onShowToast,
}) => {
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);

  const exportRoster = () => {
    try {
      const csv = buildCourseRosterCsv(enrollments);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `danh-sach-sinh-vien-${courseCode.toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      onShowToast(`Đã xuất ${enrollments.length} sinh viên ra file CSV.`);
    } catch (error: unknown) {
      console.error('[EnrolledStudentsTable] Failed to export course roster', error);
      onShowToast('Không thể xuất danh sách sinh viên. Vui lòng thử lại.');
    }
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onRemoveStudent(studentToDelete.id, studentToDelete.name);
      setStudentToDelete(null);
    }
  };

  return (
    <section className="space-y-4 w-full">
      {/* Toolbar: Responsive Flex-Wrap */}
      <Card className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border-slate-200/90 shadow-2xs">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo Tên hoặc MSSV..."
              value={studentSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 bg-slate-50 border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus-visible:ring-indigo-500"
            />
          </div>

          <select
            aria-label="Lọc trạng thái sinh viên"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="h-9 bg-slate-50 border border-slate-200 px-3 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer hover:border-slate-300 shrink-0"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="VERIFIED">Đã xác thực (Verified)</option>
            <option value="PENDING">Chờ duyệt (Pending)</option>
          </select>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="outline"
            onClick={exportRoster}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Xuất Danh Sách</span>
          </Button>

          {/* Sĩ số Badge */}
          <Badge
            variant="secondary"
            className="h-9 text-xs font-extrabold text-slate-700 bg-slate-100 px-3 rounded-xl border border-slate-200 whitespace-nowrap"
          >
            {enrollments.length} SV
          </Badge>
        </div>
      </Card>

      {/* Main Container: Table OR Empty State */}
      {enrollments.length > 0 ? (
        <Card className="bg-white rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden w-full">
          <Table className="w-full text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Mã số SV
                </TableHead>
                <TableHead className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Họ tên & Email
                </TableHead>
                <TableHead className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Thời gian tham gia
                </TableHead>
                <TableHead className="px-5 py-4 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Trạng thái
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment, idx) => {
                const student = enrollment.student;
                const isVerified =
                  enrollment.status === 'VERIFIED' || student.status === 'ACTIVE';

                // Generate avatar initials
                const initials = student.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase();

                const avatarGradient =
                  idx % 3 === 0
                    ? 'from-indigo-600 to-indigo-800'
                    : idx % 3 === 1
                    ? 'from-teal-600 to-emerald-600'
                    : 'from-amber-500 to-orange-500';

                return (
                  <TableRow
                    key={enrollment.id || student.id || student.studentCode}
                    className={`hover:bg-indigo-50/20 transition ${
                      !isVerified ? 'bg-amber-50/25' : ''
                    }`}
                  >
                    <TableCell className="px-6 py-4 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {student.studentCode || '—'}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGradient} text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                        >
                          {initials || 'SV'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {formatDateTime(enrollment.joinedAt)}
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      {isVerified ? (
                        <Badge
                          variant="outline"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã xác thực (Verified)
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border-amber-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Chờ duyệt (Pending)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedEnrollment(enrollment)}
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                        title="Xem thông tin"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setStudentToDelete({
                            id: student.id || student.studentCode || '',
                            name: student.fullName,
                          })
                        }
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Gỡ khỏi lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* Empty State */
        <Card className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h4 className="text-base font-extrabold text-slate-800">
              Lớp học chưa có sinh viên tham gia
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hãy chia sẻ mã PIN hoặc chiếu mã QR trên máy chiếu để sinh viên tham gia vào khóa học.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Badge
              variant="outline"
              className="px-4 py-2 bg-indigo-50 border-indigo-200 rounded-xl font-mono text-sm font-black text-indigo-900 tracking-wider"
            >
              {joinCode || 'Chưa có mã tham gia hoạt động'}
            </Badge>
            <Button
              onClick={() => {
                if (!joinCode) {
                  onShowToast('Khóa học chưa có mã tham gia hoạt động.');
                  return;
                }
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(joinCode);
                }
                onShowToast(`Đã sao chép mã mời: ${joinCode}`);
              }}
              disabled={!joinCode}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép mã mời</span>
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={Boolean(selectedEnrollment)} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Thông tin sinh viên</DialogTitle>
            <DialogDescription>Thông tin hồ sơ và ghi danh được tải từ khóa học này.</DialogDescription>
          </DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                {selectedEnrollment.student.avatarUrl ? (
                  <img src={selectedEnrollment.student.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                    {selectedEnrollment.student.fullName.split(' ').map((part) => part[0]).slice(-2).join('').toUpperCase() || 'SV'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{selectedEnrollment.student.fullName}</p>
                  <p className="break-all text-sm text-slate-500">{selectedEnrollment.student.email}</p>
                </div>
              </div>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-slate-500">Mã sinh viên</dt>
                <dd className="font-mono font-medium text-slate-900">{selectedEnrollment.student.studentCode || 'Chưa cập nhật'}</dd>
                <dt className="text-slate-500">Trạng thái tài khoản</dt>
                <dd className="font-medium text-slate-900">{selectedEnrollment.student.status}</dd>
                <dt className="text-slate-500">Ghi danh</dt>
                <dd className="font-medium text-slate-900">{formatDateTime(selectedEnrollment.joinedAt)}</dd>
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal using shadcn AlertDialog */}
      <AlertDialog
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl max-w-sm text-center">
          <AlertDialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-base font-black text-slate-900 text-center">
              Xác nhận gỡ sinh viên
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 text-center">
              Bạn có chắc chắn muốn xóa sinh viên <strong>{studentToDelete?.name}</strong> khỏi danh sách khóa học?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2.5 pt-2 sm:justify-center">
            <AlertDialogCancel className="flex-1 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 mt-0">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="flex-1 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

