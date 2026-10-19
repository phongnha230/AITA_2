'use client';

import React, { useState } from 'react';
import { Copy, Download, Search, Users } from 'lucide-react';
import type { CourseEnrollment } from '../types/course.types';
import { buildCourseRosterCsv } from '../utils/course-roster-export';
import { EnrollmentTableRow } from './EnrollmentTableRow';
import { EnrolledStudentDialogs } from './EnrolledStudentDialogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EnrolledStudentsTableProps {
  enrollments: CourseEnrollment[];
  courseCode: string;
  studentSearch: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ALL' | 'VERIFIED' | 'PENDING';
  onStatusFilterChange: (value: 'ALL' | 'VERIFIED' | 'PENDING') => void;
  joinCode: string;
  onRemoveStudent: (studentId: string, studentName: string) => void;
  onShowToast: (message: string) => void;
}

export const EnrolledStudentsTable: React.FC<EnrolledStudentsTableProps> = ({ enrollments, courseCode, studentSearch, onSearchChange, statusFilter, onStatusFilterChange, joinCode, onRemoveStudent, onShowToast }) => {
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<CourseEnrollment | null>(null);

  const exportRoster = () => {
    try {
      const csv = buildCourseRosterCsv(enrollments);
      const objectUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `danh-sach-sinh-vien-${courseCode.toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
      onShowToast(`Đã xuất ${enrollments.length} sinh viên ra file CSV.`);
    } catch (error: unknown) {
      console.error('[EnrolledStudentsTable] Failed to export course roster', error);
      onShowToast('Không thể xuất danh sách sinh viên. Vui lòng thử lại.');
    }
  };

  const copyJoinCode = async () => {
    if (!joinCode) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) await navigator.clipboard.writeText(joinCode);
      onShowToast(`Đã sao chép mã mời: ${joinCode}`);
    } catch (error: unknown) {
      console.error('Không sao chép được mã tham gia:', error);
      onShowToast(`Không thể sao chép mã. Mã tham gia: ${joinCode}`);
    }
  };

  const confirmDelete = () => {
    if (!studentToDelete) return;
    onRemoveStudent(studentToDelete.id, studentToDelete.name);
    setStudentToDelete(null);
  };

  return (
    <section aria-label="Danh sách sinh viên trong khóa học" className="w-full space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-slate-200 bg-white p-4">
        <div className="flex min-w-[260px] flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[180px] flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><Input type="search" aria-label="Tìm sinh viên theo tên hoặc mã số" placeholder="Tìm theo tên hoặc MSSV…" value={studentSearch} onChange={(event) => onSearchChange(event.target.value)} className="h-10 rounded-lg border-slate-300 bg-white pl-10 text-xs placeholder:text-slate-500 focus-visible:ring-indigo-600" /></div>
          <select aria-label="Lọc trạng thái sinh viên" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as 'ALL' | 'VERIFIED' | 'PENDING')} className="h-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-base font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">
            <option value="ALL">Tất cả trạng thái</option><option value="VERIFIED">Đã xác thực (Verified)</option><option value="PENDING">Chờ duyệt (Pending)</option>
          </select>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5"><Button type="button" variant="outline" onClick={exportRoster} className="h-10 whitespace-nowrap text-xs font-bold"><Download aria-hidden="true" className="mr-1.5 size-4" />Xuất danh sách</Button><Badge variant="secondary" className="h-10 whitespace-nowrap border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-800">{enrollments.length} SV</Badge></div>
      </Card>

      {enrollments.length ? <Card className="w-full overflow-x-auto rounded-xl border-slate-200 bg-white p-0"><Table className="min-w-[760px] text-xs"><TableHeader className="bg-slate-50"><TableRow><TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">Mã số SV</TableHead><TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">Họ tên &amp; Email</TableHead><TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">Thời gian tham gia</TableHead><TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">Trạng thái</TableHead><TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700">Thao tác</TableHead></TableRow></TableHeader><TableBody>{enrollments.map((enrollment, index) => <EnrollmentTableRow key={enrollment.id || enrollment.student.id || enrollment.student.studentCode} enrollment={enrollment} index={index} onView={setSelectedEnrollment} onDelete={setStudentToDelete} />)}</TableBody></Table></Card> : (
        <Card className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
          <Users aria-hidden="true" className="size-8 text-indigo-700" />
          <div className="max-w-md space-y-1.5"><h3 className="text-base font-bold text-slate-900">Lớp học chưa có sinh viên tham gia</h3><p className="text-xs leading-relaxed text-slate-700">Hãy chia sẻ mã PIN hoặc chiếu mã QR trên máy chiếu để sinh viên tham gia vào khóa học.</p></div>
          <div className="flex flex-wrap items-center justify-center gap-2"><Badge variant="outline" className="rounded-lg border-indigo-200 bg-indigo-50 px-4 py-2 font-mono text-sm font-bold tracking-wider text-indigo-950">{joinCode || 'Chưa có mã tham gia hoạt động'}</Badge><Button type="button" disabled={!joinCode} onClick={() => void copyJoinCode()} className="text-xs font-bold"><Copy aria-hidden="true" className="mr-1.5 size-3.5" />Sao chép mã mời</Button></div>
        </Card>
      )}

      <EnrolledStudentDialogs enrollment={selectedEnrollment} onCloseEnrollment={() => setSelectedEnrollment(null)} studentToDelete={studentToDelete} onCloseDelete={() => setStudentToDelete(null)} onConfirmDelete={confirmDelete} />
    </section>
  );
};
