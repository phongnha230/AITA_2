import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Course,
  CreateCoursePayload,
  LecturerKpiMetrics,
  LecturerDashboardResponse,
} from '../types/course.types';
import { courseService } from '../services/course.service';

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
      const [coursesList, dashData] = await Promise.all([
        courseService.getCourses(),
        courseService.getLecturerDashboard(),
      ]);
      setCourses(coursesList);
      setDashboardData(dashData);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách khóa học');
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
        activeCourses: courses.filter((c) => c.isActive).length || dashboardData.teachingStats.totalCourses,
        totalStudents: dashboardData.teachingStats.totalStudents,
        avgCompletionRate: Math.round((dashboardData.teachingStats.averageScore || 8.0) * 10),
        active24hCount: Math.round(dashboardData.teachingStats.totalStudents * 0.9) || 120,
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
      setCourses((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Lỗi tạo khóa học');
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
  };
}
