import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
  LecturerKpiMetrics,
  LecturerDashboardResponse,
} from '../types/course.types';
import { courseService } from '../services/course.service';
import { getErrorMessage } from '@/lib/errors';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboardData, setDashboardData] = useState<LecturerDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  const fetchCoursesAndDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesResult, dashboardResult] = await Promise.allSettled([
        courseService.getCourses(),
        courseService.getLecturerDashboard(),
      ]);
      if (coursesResult.status === 'fulfilled') {
        setCourses(coursesResult.value);
      } else {
        setCourses([]);
        setError('Không thể tải danh sách khóa học từ máy chủ.');
      }

      if (dashboardResult.status === 'fulfilled') {
        setDashboardData(dashboardResult.value);
      } else {
        setDashboardData(null);
        setError((currentError) => currentError ?? 'Không thể tải thống kê dashboard từ máy chủ.');
      }
    } catch {
      setCourses([]);
      setDashboardData(null);
      setError('Đã xảy ra lỗi khi tải dữ liệu khóa học.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesAndDashboard();
  }, [fetchCoursesAndDashboard]);

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

  // Derived KPI metrics (Prioritizing real teaching stats from backend dashboard)
  const kpiMetrics: LecturerKpiMetrics = useMemo(() => {
    if (dashboardData?.teachingStats) {
      return {
        totalCourses: dashboardData.teachingStats.totalCourses,
        activeCourses: courses.filter((c) => c.isActive).length,
        totalStudents: dashboardData.teachingStats.totalStudents,
        averageScore: dashboardData.teachingStats.averageScore,
        pendingGradingCount: dashboardData.teachingStats.pendingGradingCount,
      };
    }
    return courseService.calculateKpis(courses);
  }, [courses, dashboardData]);

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
      await fetchCoursesAndDashboard();
      return created;
    } catch (err: unknown) {
      console.error('Không tạo được khóa học:', err);
      throw new Error(getErrorMessage(err, 'Lỗi tạo khóa học'));
    }
  };

  const updateCourse = async (courseId: string, payload: UpdateCoursePayload) => {
    try {
      const updated = await courseService.updateCourse(courseId, payload);
      await fetchCoursesAndDashboard();
      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi cập nhật khóa học';
      throw new Error(message);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId);
      await fetchCoursesAndDashboard();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi xóa khóa học';
      throw new Error(message);
    }
  };

  return {
    courses: filteredCourses,
    rawCourses: courses,
    dashboardData,
    recentSubmissions: dashboardData?.recentSubmissions || [],
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
    refreshCourses: fetchCoursesAndDashboard,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
