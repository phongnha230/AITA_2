'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react';
import { courseService } from '@/features/courses/services/course.service';
import type { Course, CreateCoursePayload } from '@/features/courses/types/course.types';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '@/components/ui/input';
import { useToast } from '../ui/Toast';
import { CreateCourseModal } from './CreateCourseModal';
import { CourseStudentsModal } from './CourseStudentsModal';
import { AdminCoursesTable } from './AdminCoursesTable';
import { adminUserService } from '../../services/admin-user.service';
import type { AdminUser } from '../../types/admin.types';

export const AdminCoursesPage: React.FC = () => {
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingIsActive, setEditingIsActive] = useState(true);
  const [lecturers, setLecturers] = useState<AdminUser[]>([]);
  const [lecturerId, setLecturerId] = useState('');
  const [createForm, setCreateForm] = useState<CreateCoursePayload>({
    code: '',
    name: '',
    semester: 'Fall 2026',
    capacity: 40,
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

  useEffect(() => {
    let active = true;
    adminUserService.list({ role: 'LECTURER', page: 1, limit: 100 })
      .then(({ users }) => { if (active) setLecturers(users); })
      .catch((error: unknown) => {
        console.error('Không tải được danh sách giảng viên để gán khóa học:', error);
        if (active) toast.error('Không thể tải danh sách giảng viên.');
      });
    return () => { active = false; };
  }, [toast]);

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

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.code || !createForm.name) {
      toast.error('Vui lòng nhập đầy đủ mã môn và tên môn.');
      return;
    }
    if (!editingCourse && !lecturerId) {
      toast.error('Vui lòng chọn giảng viên phụ trách.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, {
          name: createForm.name,
          semester: createForm.semester,
          isActive: editingIsActive,
        });
        toast.success(`Đã cập nhật khóa học ${createForm.code}.`);
      } else {
        await courseService.createCourse({ ...createForm, lecturerId });
        toast.success(`Đã tạo khóa học ${createForm.code} thành công.`);
      }
      setCreateOpen(false);
      setEditingCourse(null);
      setLecturerId('');
      setCreateForm({ code: '', name: '', semester: 'Fall 2026', capacity: 40 });
      await loadCourses();
    } catch {
      toast.error(editingCourse ? 'Không thể cập nhật khóa học.' : 'Lỗi khi tạo khóa học mới.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setEditingIsActive(course.isActive);
    setCreateForm({ code: course.code, name: course.name, semester: course.semester, capacity: course.capacity ?? 40 });
    setCreateOpen(true);
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
              <BookOpen className="size-3.5" /> Quản trị Đào tạo
            </span>
            <span>Hệ thống quản lý lớp học &amp; giảng viên</span>
          </>
        }
        title="Quản lý Khóa học & Lớp học Toàn trường"
        description="Kiểm soát toàn bộ danh sách lớp học, phân công giảng viên phụ trách, mã tham gia lớp học và danh sách sinh viên ghi danh."
        actions={
          <>
            <Button onClick={loadCourses}>
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </Button>
            <Button variant="primary" onClick={() => { setEditingCourse(null); setLecturerId(''); setCreateForm({ code: '', name: '', semester: 'Fall 2026', capacity: 40 }); setCreateOpen(true); }}>
              <Plus className="size-4" /> Tạo lớp học mới
            </Button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 z-10" />
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
      <AdminCoursesTable
        courses={filtered}
        loading={loading}
        onSelectCourseForStudents={(c) => {
          setSelectedCourse(c);
          setStudentsModalOpen(true);
        }}
        onGenerateCode={handleGenerateCode}
        onRevokeCode={handleRevokeCode}
        onDeleteCourse={handleDelete}
        onEditCourse={handleEdit}
      />

      {/* Modal Tạo Khóa Học Mới */}
      <CreateCourseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        form={createForm}
        onChangeForm={setCreateForm}
        onSubmit={handleSaveCourse}
        submitting={submitting}
        isEditing={Boolean(editingCourse)}
        isActive={editingIsActive}
        onChangeIsActive={setEditingIsActive}
        lecturers={lecturers}
        lecturerId={lecturerId}
        onChangeLecturerId={setLecturerId}
      />

      {/* Modal Xem Danh Sách Sinh Viên Trong Lớp */}
      <CourseStudentsModal
        open={studentsModalOpen}
        onClose={() => setStudentsModalOpen(false)}
        course={selectedCourse}
        onRemoveStudent={handleRemoveStudent}
      />
    </>
  );
};
