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
      />

      {/* Modal Tạo Khóa Học Mới */}
      <CreateCourseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        form={createForm}
        onChangeForm={setCreateForm}
        onSubmit={handleCreate}
        submitting={submitting}
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
