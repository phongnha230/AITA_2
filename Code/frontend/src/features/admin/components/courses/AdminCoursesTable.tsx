'use client';

import * as React from 'react';
import { Users, KeyRound, Pencil, Trash2 } from 'lucide-react';
import type { Course } from '@/features/courses/types/course.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminCoursesTableProps {
  courses: Course[];
  loading: boolean;
  onSelectCourseForStudents: (course: Course) => void;
  onGenerateCode: (course: Course) => void;
  onRevokeCode: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
}

export const AdminCoursesTable: React.FC<AdminCoursesTableProps> = ({
  courses,
  loading,
  onSelectCourseForStudents,
  onGenerateCode,
  onRevokeCode,
  onDeleteCourse,
  onEditCourse,
}) => {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-28">Mã môn</TableHead>
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Giảng viên phụ trách</TableHead>
              <TableHead className="w-28">Học kỳ</TableHead>
              <TableHead className="w-32">Sĩ số (SV)</TableHead>
              <TableHead>Mã vào lớp (PIN)</TableHead>
              <TableHead className="w-28">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-sm">
                  {loading ? 'Đang tải danh sách khóa học...' : 'Không tìm thấy khóa học nào phù hợp.'}
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs font-bold text-blue-600">
                    {c.code}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-sm text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500 font-mono">ID: {c.id}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-900">
                      {c.lecturer?.fullName ?? 'Chưa phân công'}
                    </p>
                    <p className="text-xs text-slate-500">{c.lecturer?.email ?? '—'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge tone="neutral">{c.semester}</Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onSelectCourseForStudents(c)}
                      className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-600 hover:underline"
                      title="Xem danh sách sinh viên"
                    >
                      <Users className="size-3.5" />
                      {c.enrollmentCount ?? c._count?.enrollments ?? c.enrollments?.length ?? 0} / {c.capacity ?? '—'} SV
                    </button>
                  </TableCell>
                  <TableCell>
                    {c.enrollmentCode ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          {c.enrollmentCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRevokeCode(c)}
                          title="Khóa mã vào lớp"
                          className="text-slate-400 hover:text-rose-600 min-h-11 min-w-11 px-2 py-1"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-7 px-2 text-xs text-slate-500 hover:text-blue-600"
                        onClick={() => onGenerateCode(c)}
                      >
                        <KeyRound className="size-3 mr-1" /> Tạo mã
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge tone={c.isActive ? 'student' : 'warning'} dot>
                      {c.isActive ? 'Đang mở' : 'Đã đóng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        className="size-8 p-0 text-slate-400 hover:text-blue-600"
                        title="Sửa khóa học"
                        onClick={() => onEditCourse(c)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="size-8 p-0 text-slate-400 hover:text-blue-600"
                        title="Xem danh sách sinh viên"
                        onClick={() => onSelectCourseForStudents(c)}
                      >
                        <Users className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="size-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Xóa khóa học"
                        onClick={() => onDeleteCourse(c)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
