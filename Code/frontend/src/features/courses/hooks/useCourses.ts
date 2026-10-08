import { useState, useEffect, useCallback, useMemo } from 'react';
import { Course, CreateCoursePayload, LecturerKpiMetrics } from '../types/course.types';
import { courseService } from '../services/course.service';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.room && course.room.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSemester =
        selectedSemester === 'All' || course.semester === selectedSemester;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && course.isActive) ||
        (statusFilter === 'ARCHIVED' && !course.isActive);

      return matchesSearch && matchesSemester && matchesStatus;
    });
  }, [courses, searchQuery, selectedSemester, statusFilter]);

  // Derived KPI metrics
  const kpiMetrics: LecturerKpiMetrics = useMemo(() => {
    return courseService.calculateKpis(courses);
  }, [courses]);

  // Unique semesters for dropdown
  const semesters = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.semester) set.add(c.semester);
    });
    return Array.from(set);
  }, [courses]);

  // Create course handler
  const createCourse = async (payload: CreateCoursePayload) => {
    try {
      const created = await courseService.createCourse(payload);
      setCourses((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Lỗi tạo khóa học');
    }
  };

  return {
    courses: filteredCourses,
    rawCourses: courses,
    kpiMetrics,
    semesters,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedSemester,
    setSelectedSemester,
    statusFilter,
    setStatusFilter,
    refreshCourses: fetchCourses,
    createCourse,
  };
}
