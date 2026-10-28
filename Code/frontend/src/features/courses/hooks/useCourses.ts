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

// In-memory cache để chuyển đổi giữa các tab taskbar lập tức trong 0ms
let cachedCourses: Course[] = [];
let cachedDashboardData: LecturerDashboardResponse | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 60_000; // 60 giây cache nhanh

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(cachedCourses);
  const [dashboardData, setDashboardData] = useState<LecturerDashboardResponse | null>(cachedDashboardData);
  const [loading, setLoading] = useState<boolean>(cachedCourses.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  const fetchCoursesAndDashboard = useCallback(async (force = false) => {
    const isCacheValid = Date.now() - lastFetchTimestamp < CACHE_TTL_MS;
    if (!force && isCacheValid && cachedCourses.length > 0) {
      setCourses(cachedCourses);
      setDashboardData(cachedDashboardData);
      setLoading(false);
      return;
    }

    if (cachedCourses.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const [coursesResult, dashboardResult] = await Promise.allSettled([
        courseService.getCourses(),
        courseService.getLecturerDashboard(),
      ]);
      if (coursesResult.status === 'fulfilled') {
        cachedCourses = coursesResult.value;
        setCourses(coursesResult.value);
      } else {
        setError('Không thể tải danh sách khóa học từ máy chủ.');
      }

      if (dashboardResult.status === 'fulfilled') {
        cachedDashboardData = dashboardResult.value;
        setDashboardData(dashboardResult.value);
      } else {
        setError((currentError) => currentError ?? 'Không thể tải thống kê dashboard từ máy chủ.');
      }
      lastFetchTimestamp = Date.now();
    } catch {
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
      lastFetchTimestamp = 0; // Invalidate cache
      await fetchCoursesAndDashboard(true);
      return created;
    } catch (err: unknown) {
      console.error('Không tạo được khóa học:', err);
      throw new Error(getErrorMessage(err, 'Lỗi tạo khóa học'));
    }
  };

  const updateCourse = async (courseId: string, payload: UpdateCoursePayload) => {
    try {
      const updated = await courseService.updateCourse(courseId, payload);
      lastFetchTimestamp = 0; // Invalidate cache
      await fetchCoursesAndDashboard(true);
      return updated;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Lỗi cập nhật khóa học';
      throw new Error(message);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId);
      lastFetchTimestamp = 0; // Invalidate cache
      await fetchCoursesAndDashboard(true);
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
    refreshCourses: () => fetchCoursesAndDashboard(true),
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
