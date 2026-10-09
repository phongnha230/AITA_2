'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStudentServiceErrorMessage, studentService } from '../services/student.service';
import type { CourseJoinResult, ResourceState, StudentCourse } from '../types/student.types';

export type CatalogFilterTab = 'ALL' | 'ENROLLED' | 'AVAILABLE';

export function useStudentCourseCatalog() {
  const [coursesState, setCoursesState] = useState<ResourceState<StudentCourse[]>>({
    status: 'loading',
    data: [],
    error: null,
  });

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<CatalogFilterTab>('ALL');
  const [selectedCourseForJoin, setSelectedCourseForJoin] = useState<StudentCourse | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    setCoursesState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const data = await studentService.getAllCourses();
      setCoursesState({
        status: 'success',
        data,
        error: null,
      });
    } catch (err) {
      setCoursesState({
        status: 'error',
        data: [],
        error: getStudentServiceErrorMessage(err, 'Không thể tải danh sách lớp học.'),
      });
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const joinCourse = useCallback(
    async (code: string): Promise<CourseJoinResult> => {
      const result = await studentService.joinCourse(code);
      // Cập nhật trạng thái tức thì trong danh sách nếu thành công
      setCoursesState((prev) => {
        if (prev.status !== 'success') return prev;
        const updated = prev.data.map((c) => {
          if (c.id === result.course.id) {
            return {
              ...c,
              isEnrolled: true,
              enrollmentCount: (c.enrollmentCount ?? 0) + (result.alreadyEnrolled ? 0 : 1),
            };
          }
          return c;
        });
        return { ...prev, data: updated };
      });
      return result;
    },
    [],
  );

  const openJoinModal = useCallback((course?: StudentCourse | null) => {
    setSelectedCourseForJoin(course ?? null);
    setJoinModalOpen(true);
  }, []);

  const closeJoinModal = useCallback(() => {
    setSelectedCourseForJoin(null);
    setJoinModalOpen(false);
  }, []);

  // Filter & Search
  const filteredCourses = useMemo(() => {
    if (coursesState.status !== 'success') return [];

    const query = search.trim().toLowerCase();

    return coursesState.data.filter((course) => {
      // Tab filter
      if (activeTab === 'ENROLLED' && !course.isEnrolled) return false;
      if (activeTab === 'AVAILABLE' && course.isEnrolled) return false;

      // Text search
      if (!query) return true;
      const haystack = [
        course.code,
        course.name,
        course.semester,
        course.lecturer?.fullName ?? '',
        course.lecturer?.email ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [coursesState, activeTab, search]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    if (coursesState.status !== 'success') {
      return { total: 0, enrolled: 0, available: 0, lecturerCount: 0 };
    }
    const all = coursesState.data;
    const enrolled = all.filter((c) => c.isEnrolled).length;
    const lecturers = new Set(all.map((c) => c.lecturerId).filter(Boolean)).size;

    return {
      total: all.length,
      enrolled,
      available: all.length - enrolled,
      lecturerCount: lecturers,
    };
  }, [coursesState]);

  return {
    coursesState,
    filteredCourses,
    search,
    setSearch,
    activeTab,
    setActiveTab,
    selectedCourseForJoin,
    joinModalOpen,
    openJoinModal,
    closeJoinModal,
    joinCourse,
    refetch: fetchCourses,
    stats,
  };
}
