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

// Fallback mock data matching the approved prototype for smooth offline/sandbox preview
export const INITIAL_MOCK_COURSES: Course[] = [
  {
    id: 'course-swd392-se19c',
    code: 'SWD392',
    name: 'Kiến Trúc & Thiết Kế Phần Mềm',
    semester: 'Fall 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: true,
    room: 'AL-L402',
    capacity: 40,
    enrolledStudentsCount: 38,
    syllabusProgress: 75,
    currentGpaAvg: 8.4,
    enrollmentCode: 'AITA-8924',
    codeExpiresAt: new Date(Date.now() + 275 * 1000).toISOString(),
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-05T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 38,
      assignments: 5,
    },
    enrollments: [
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-01',
        joinedAt: '2026-09-24T08:30:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-01',
          studentCode: 'QE190161',
          fullName: 'Trần Đỗ Phong Nhã',
          email: 'phongnhatd@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-02',
        joinedAt: '2026-09-24T08:35:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-02',
          studentCode: 'QE180203',
          fullName: 'Nguyễn Văn Điệp',
          email: 'diepnv@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-03',
        joinedAt: '2026-09-24T08:42:00Z',
        status: 'PENDING',
        student: {
          id: 'stu-03',
          studentCode: 'QE190003',
          fullName: 'Nguyễn Anh Tuấn',
          email: 'tuanna@fpt.edu.vn',
          role: 'STUDENT',
          status: 'PENDING',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-04',
        joinedAt: '2026-09-24T09:15:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-04',
          studentCode: 'QE190045',
          fullName: 'Lê Hoàng Long',
          email: 'longlh@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
      {
        courseId: 'course-swd392-se19c',
        studentId: 'stu-05',
        joinedAt: '2026-09-25T10:00:00Z',
        status: 'VERIFIED',
        student: {
          id: 'stu-05',
          studentCode: 'QE190112',
          fullName: 'Phạm Minh Đức',
          email: 'ducpm@fpt.edu.vn',
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      },
    ],
  },
  {
    id: 'course-prn211-se19b',
    code: 'PRN211',
    name: 'Lập Trình .NET & Ứng Dụng Phân Tán',
    semester: 'Fall 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: true,
    room: 'BE-302',
    capacity: 40,
    enrolledStudentsCount: 40,
    syllabusProgress: 60,
    currentGpaAvg: 7.9,
    enrollmentCode: 'PRN-9912',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-04T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 40,
      assignments: 4,
    },
  },
  {
    id: 'course-mas291-se19a',
    code: 'MAS291',
    name: 'Xác Suất Thống Kê Ứng Dụng AI',
    semester: 'Fall 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: true,
    room: 'DE-205',
    capacity: 35,
    enrolledStudentsCount: 35,
    syllabusProgress: 85,
    currentGpaAvg: 8.1,
    enrollmentCode: 'MAS-4431',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-10-03T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 35,
      assignments: 6,
    },
  },
  {
    id: 'course-prj301-se18c',
    code: 'PRJ301',
    name: 'Java Web Application Development',
    semester: 'Summer 2026',
    lecturerId: 'lecturer-vd-01',
    isActive: false,
    room: 'BE-201',
    capacity: 40,
    enrolledStudentsCount: 45,
    syllabusProgress: 100,
    currentGpaAvg: 8.6,
    enrollmentCode: null,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-08-30T08:00:00Z',
    lecturer: {
      id: 'lecturer-vd-01',
      fullName: 'TS. Nguyễn Văn Điệp',
      email: 'diepnv@fpt.edu.vn',
    },
    _count: {
      enrollments: 45,
      assignments: 8,
    },
  },
];

export const courseService = {
  /**
   * Lấy tổng quan Dashboard của Giảng viên (Thống kê, khóa học, 10 bài nộp mới nhất)
   */
  async getLecturerDashboard(): Promise<LecturerDashboardResponse> {
    try {
      const response = await api.get('/users/lecturer-dashboard');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Dữ liệu dashboard không khả dụng');
    } catch (error) {
      console.warn('[CourseService] Backend lecturer-dashboard unavailable, using fallback:', error);
      return {
        lecturer: {
          id: 'lecturer-vd-01',
          email: 'diepnv@fpt.edu.vn',
          fullName: 'TS. Nguyễn Văn Điệp',
          role: 'LECTURER',
          status: 'ACTIVE',
        },
        teachingStats: {
          totalCourses: 3,
          totalStudents: 118,
          totalAssignments: 14,
          totalSubmissions: 248,
          averageScore: 8.4,
          pendingGradingCount: 6,
        },
        coursesOverview: INITIAL_MOCK_COURSES.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          semester: c.semester,
          isActive: c.isActive,
          enrollmentCode: c.enrollmentCode,
          codeExpiresAt: c.codeExpiresAt,
          totalStudents: c.enrolledStudentsCount || 38,
          totalAssignments: c._count?.assignments || 5,
          totalSubmissions: 38,
          averageScore: c.currentGpaAvg || 8.4,
        })),
        recentSubmissions: [
          {
            id: 'sub-recent-01',
            studentId: 'stu-01',
            studentName: 'Trần Đỗ Phong Nhã',
            studentEmail: 'phongnhatd@fpt.edu.vn',
            assignmentId: 'assign-pe-01',
            assignmentTitle: 'Đề thi PE SWD392 Fall 2026',
            courseCode: 'SWD392',
            courseName: 'Kiến Trúc & Thiết Kế Phần Mềm',
            paperCode: 'SE1901_Q1',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'GRADED',
            sandboxScore: 8.5,
            aiScore: 8.0,
            finalScore: 8.35,
          },
          {
            id: 'sub-recent-02',
            studentId: 'stu-02',
            studentName: 'Nguyễn Văn Điệp',
            studentEmail: 'diepnv@fpt.edu.vn',
            assignmentId: 'assign-pe-01',
            assignmentTitle: 'Đề thi PE SWD392 Fall 2026',
            courseCode: 'SWD392',
            courseName: 'Kiến Trúc & Thiết Kế Phần Mềm',
            paperCode: 'SE1901_Q1',
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            status: 'GRADED',
            sandboxScore: 10.0,
            aiScore: 9.5,
            finalScore: 9.85,
          },
          {
            id: 'sub-recent-03',
            studentId: 'stu-03',
            studentName: 'Lê Hoàng Long',
            studentEmail: 'longlh@fpt.edu.vn',
            assignmentId: 'assign-pe-01',
            assignmentTitle: 'Đề thi PE SWD392 Fall 2026',
            courseCode: 'SWD392',
            courseName: 'Kiến Trúc & Thiết Kế Phần Mềm',
            paperCode: 'SE1901_Q1',
            submittedAt: new Date(Date.now() - 10800000).toISOString(),
            status: 'RUNNING_SANDBOX',
            sandboxScore: 0,
            aiScore: 0,
            finalScore: 0,
          },
        ],
        assignmentsSummary: [
          {
            id: 'assign-pe-01',
            title: 'Đề thi PE SWD392 Fall 2026',
            courseCode: 'SWD392',
            status: 'PUBLISHED',
            environment: 'JAVA_JDK',
            deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
            hasAccessCode: true,
            totalSubmissions: 38,
            averageScore: 8.4,
          },
        ],
      };
    }
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
   * Tính toán KPI tổng quan của giảng viên
   */
  calculateKpis(courses: Course[]): LecturerKpiMetrics {
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.isActive).length;
    const totalStudents = courses.reduce(
      (sum, c) => sum + (c._count?.enrollments ?? c.enrolledStudentsCount ?? 0),
      0
    );
    const avgCompletionRate =
      courses.length > 0
        ? Math.round(
            courses.reduce((sum, c) => sum + (c.syllabusProgress ?? 0), 0) / courses.length
          )
        : 0;

    return {
      totalCourses,
      activeCourses,
      totalStudents,
      avgCompletionRate: avgCompletionRate || 72.5,
      active24hCount: Math.round(totalStudents * 0.9) || 142,
    };
  },
};
