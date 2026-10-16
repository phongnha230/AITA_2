import api from '@/lib/api';
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
  GenerateJoinCodeResponse,
  QueryCoursesParams,
  LecturerKpiMetrics,
  LecturerDashboardResponse,
} from '../types/course.types';

export const courseService = {
  /**
   * Lấy tổng quan Dashboard của Giảng viên (Thống kê, khóa học, 10 bài nộp mới nhất)
   */
  async getLecturerDashboard(): Promise<LecturerDashboardResponse> {
    const response = await api.get('/users/lecturer-dashboard');
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Dữ liệu dashboard không khả dụng');
  },

  /**
   * Lấy danh sách khóa học của giảng viên
   */
  async getCourses(params?: QueryCoursesParams): Promise<Course[]> {
    const response = await api.get('/courses', { params });
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Lấy chi tiết khóa học theo ID
   */
  async getCourseById(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Không tìm thấy khóa học.');
  },

  /**
   * Tạo mới khóa học
   */
  async createCourse(payload: CreateCoursePayload): Promise<Course> {
    const response = await api.post('/courses', payload);
    return response.data.data;
  },

  /**
   * Cập nhật thông tin khóa học
   */
  async updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
    const response = await api.put(`/courses/${id}`, payload);
    return response.data.data;
  },

  /**
   * Xóa khóa học
   */
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  },

  /**
   * Giảng viên sinh mã tham gia lớp học mới (TTL động)
   */
  async generateJoinCode(id: string, expiresInMinutes: number = 30): Promise<GenerateJoinCodeResponse> {
    const response = await api.post(`/courses/${id}/generate-code`, { expiresInMinutes });
    const raw = response.data.data;
    return {
      courseId: raw.courseId || id,
      enrollmentCode: raw.joinCode || raw.enrollmentCode,
      expiresAt: raw.expiresAt,
      expiresInMinutes: raw.expiresInMinutes || expiresInMinutes,
      message: raw.message || 'Sinh mã tham gia lớp học thành công!',
    };
  },

  /**
   * Khóa / thu hồi mã tham gia lớp học
   */
  async revokeJoinCode(id: string): Promise<void> {
    await api.delete(`/courses/${id}/revoke-code`);
  },

  /**
   * Xóa sinh viên khỏi lớp
   */
  async removeStudent(courseId: string, studentId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/students/${studentId}`);
  },

  /**
   * Giảng viên ghi danh học viên vào lớp theo danh sách ID
   */
  async enrollStudents(courseId: string, studentIds: string[]): Promise<{ enrolledCount: number }> {
    const response = await api.post(`/courses/${courseId}/enroll`, { studentIds });
    return response.data?.data || { enrolledCount: studentIds.length };
  },


  /**
   * Tính toán KPI tổng quan của giảng viên
   */
  calculateKpis(courses: Course[]): LecturerKpiMetrics {
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.isActive).length;
    const enrolledStudentIds = courses.flatMap((course) => course.enrolledStudentIds ?? []);
    const totalStudents = enrolledStudentIds.length > 0
      ? new Set(enrolledStudentIds).size
      : courses.reduce(
          (sum, course) =>
            sum + (course.enrollmentCount ?? course._count?.enrollments ?? 0),
          0
        );

    return {
      totalCourses,
      activeCourses,
      totalStudents,
      averageScore: null,
      pendingGradingCount: null,
    };
  },
};
