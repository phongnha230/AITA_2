'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  KeyRound,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  UserX,
} from 'lucide-react';
import { courseService } from '@/features/courses/services/course.service';
import type { Course, CreateCoursePayload } from '@/features/courses/types/course.types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '@/components/ui/input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { useToast } from '../ui/Toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const AdminCoursesPage: React.FC = () => {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCoursePayload>({
    code: '',
    name: '',
    semester: 'Fall 2026',
    capacity: 40,
    room: 'LAB-302',
  });

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch {
      toast.error('Không thể tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const semesters = useMemo(() => {
    const set = new Set(courses.map((c) => c.semester));
    return ['ALL', ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.lecturer?.fullName.toLowerCase().includes(q);
      const matchesSemester = semesterFilter === 'ALL' || c.semester === semesterFilter;
      return matchesSearch && matchesSemester;
    });
  }, [courses, search, semesterFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.code || !createForm.name) {
      toast.error('Vui lòng nhập đầy đủ mã môn và tên môn.');
      return;
    }
    setSubmitting(true);
    try {
      await courseService.createCourse(createForm);
      toast.success(`Đã tạo khóa học ${createForm.code} thành công.`);
      setCreateOpen(false);
      setCreateForm({ code: '', name: '', semester: 'Fall 2026', capacity: 40, room: 'LAB-302' });
      await loadCourses();
    } catch {
      toast.error('Lỗi khi tạo khóa học mới.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateCode = async (c: Course) => {
    try {
      const res = await courseService.generateJoinCode(c.id);
      toast.success(`Mã vào lớp mới cho ${c.code}: ${res.enrollmentCode}`);
      await loadCourses();
    } catch {
      toast.error('Không thể tạo mã vào lớp.');
    }
  };

  const handleRevokeCode = async (c: Course) => {
    try {
      await courseService.revokeJoinCode(c.id);
      toast.success(`Đã khóa mã vào lớp của ${c.code}.`);
      await loadCourses();
    } catch {
      toast.error('Không thể khóa mã vào lớp.');
    }
  };

  const handleDelete = async (c: Course) => {
    if (!confirm(`Bạn có chắc muốn xóa lớp học ${c.code} - ${c.name}?`)) return;
    try {
      await courseService.deleteCourse(c.id);
      toast.success(`Đã xóa lớp học ${c.code}.`);
      await loadCourses();
    } catch {
      toast.error('Không thể xóa lớp học.');
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!selectedCourse) return;
    if (!confirm(`Bạn có chắc muốn gỡ sinh viên ${studentName} khỏi lớp?`)) return;
    try {
      await courseService.removeStudent(selectedCourse.id, studentId);
      toast.success(`Đã gỡ sinh viên ${studentName} khỏi lớp.`);
      const updated = await courseService.getCourseById(selectedCourse.id);
      setSelectedCourse(updated);
      await loadCourses();
    } catch {
      toast.error('Không thể gỡ sinh viên khỏi lớp.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700">
              <BookOpen className="h-3.5 w-3.5" /> Quản trị Đào tạo
            </span>
            <span>Hệ thống quản lý lớp học &amp; giảng viên</span>
          </>
        }
        title="Quản lý Khóa học & Lớp học Toàn trường"
        description="Kiểm soát toàn bộ danh sách lớp học, phân công giảng viên phụ trách, mã tham gia lớp học và danh sách sinh viên ghi danh."
        actions={
          <>
            <Button onClick={loadCourses}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </Button>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Tạo lớp học mới
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã môn, tên lớp hoặc giảng viên..."
            className="pl-9 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Học kỳ:</span>
          <div className="flex gap-1 overflow-x-auto">
            {semesters.map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setSemesterFilter(sem)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  semesterFilter === sem
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sem === 'ALL' ? 'Tất cả' : sem}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Table */}
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-sm">
                    {loading ? 'Đang tải danh sách khóa học...' : 'Không tìm thấy khóa học nào phù hợp.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
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
                        onClick={() => {
                          setSelectedCourse(c);
                          setStudentsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-600 hover:underline"
                        title="Xem danh sách sinh viên"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {c.enrolledStudentsCount || c.enrollments?.length || 0} / {c.capacity || 40} SV
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
                            onClick={() => handleRevokeCode(c)}
                            title="Khóa mã vào lớp"
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          className="h-7 px-2 text-xs text-slate-500 hover:text-blue-600"
                          onClick={() => handleGenerateCode(c)}
                        >
                          <KeyRound className="h-3 w-3 mr-1" /> Tạo mã
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
                          className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600"
                          title="Xem danh sách sinh viên"
                          onClick={() => {
                            setSelectedCourse(c);
                            setStudentsModalOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                          title="Xóa khóa học"
                          onClick={() => handleDelete(c)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal Tạo Khóa Học Mới */}
      <Modal open={createOpen} title="Tạo Khóa Học / Lớp Học Mới" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mã môn học (Code)">
              <Input
                required
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                placeholder="VD: PRF192, SWD392"
                className="font-mono uppercase"
              />
            </FormField>
            <FormField label="Học kỳ (Semester)">
              <Input
                required
                value={createForm.semester}
                onChange={(e) => setCreateForm({ ...createForm, semester: e.target.value })}
                placeholder="VD: Fall 2026, Spring 2027"
              />
            </FormField>
          </div>

          <FormField label="Tên môn học đầy đủ">
            <Input
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="VD: Lập trình C cơ bản, Kiến trúc phần mềm"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sức chứa tối đa (Sinh viên)">
              <Input
                type="number"
                min={1}
                value={createForm.capacity || 40}
                onChange={(e) => setCreateForm({ ...createForm, capacity: Number(e.target.value) })}
              />
            </FormField>
            <FormField label="Phòng máy (LAB)">
              <Input
                value={createForm.room || 'LAB-302'}
                onChange={(e) => setCreateForm({ ...createForm, room: e.target.value })}
                placeholder="VD: LAB-302, AL-L402"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo khóa học'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Xem Danh Sách Sinh Viên Trong Lớp */}
      <Modal
        open={studentsModalOpen}
        title={selectedCourse ? `Danh Sách Sinh Viên: ${selectedCourse.code} - ${selectedCourse.name}` : 'Danh sách sinh viên'}
        onClose={() => setStudentsModalOpen(false)}
        side={true}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs text-slate-500">Giảng viên: <strong className="text-slate-800">{selectedCourse?.lecturer?.fullName ?? 'Chưa phân công'}</strong></p>
              <p className="text-xs text-slate-500">Tổng sinh viên ghi danh: <strong className="text-blue-600">{selectedCourse?.enrollments?.length ?? 0} sinh viên</strong></p>
            </div>
            {selectedCourse?.enrollmentCode && (
              <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-200">
                PIN: {selectedCourse.enrollmentCode}
              </span>
            )}
          </div>

          {selectedCourse?.enrollments && selectedCourse.enrollments.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {selectedCourse.enrollments.map((enr, i) => (
                <div key={enr.studentId} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-6">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{enr.student.fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">{enr.student.studentCode || enr.student.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs"
                    onClick={() => handleRemoveStudent(enr.studentId, enr.student.fullName)}
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" /> Gỡ khỏi lớp
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Chưa có sinh viên nào ghi danh vào lớp học này.
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStudentsModalOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
